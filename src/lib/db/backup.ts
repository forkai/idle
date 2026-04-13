/**
 * @fileoverview 自动备份系统
 * @description 定时备份数据库数据，支持导入/导出JSON
 */

import type { DatabaseInstance } from './queries'

/**
 * 备份文件元数据
 */
export interface BackupMetadata {
  version: number
  timestamp: number
  playTime: number
  playerLevel: number
  playerName: string
}

/**
 * 完整备份数据结构
 */
export interface GameBackup {
  metadata: BackupMetadata
  player: Record<string, unknown>
  equipment: Record<string, unknown>[]
  inventory: Record<string, unknown>[]
  progress: Record<string, unknown>
  statistics: Record<string, unknown>
  achievements: Record<string, unknown>[]
  settings: Record<string, unknown>
}

/**
 * 备份存储键名
 */
const BACKUP_STORAGE_KEY = 'diablo_idle_backup'
const BACKUP_LIST_KEY = 'diablo_idle_backup_list'

/**
 * 获取所有备份列表（按时间倒序）
 */
export function listBackups(): BackupMetadata[] {
  try {
    const list = localStorage.getItem(BACKUP_LIST_KEY)
    return list ? JSON.parse(list) : []
  } catch {
    return []
  }
}

/**
 * 获取最新备份的元数据
 */
export function getLatestBackup(): { metadata: BackupMetadata; data: GameBackup } | null {
  try {
    const key = localStorage.getItem(BACKUP_STORAGE_KEY + '_latest')
    if (!key) return null
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/**
 * 执行数据库备份
 * @param db 数据库实例
 * @param playerData 玩家数据摘要（用于元数据）
 */
export async function createBackup(
  db: DatabaseInstance,
  playerData: { name: string; level: number; playTime: number }
): Promise<BackupMetadata> {
  // 导出整个数据库
  const exported = db.export()

  // 构建备份数据
  const backup: GameBackup = {
    metadata: {
      version: 1,
      timestamp: Date.now(),
      playTime: playerData.playTime,
      playerLevel: playerData.level,
      playerName: playerData.name,
    },
    player: {},
    equipment: [],
    inventory: [],
    progress: {},
    statistics: {},
    achievements: [],
    settings: {},
  }

  // 读取各表数据
  const tables = ['player', 'equipment', 'inventory', 'game_progress', 'statistics', 'achievements', 'settings']
  for (const table of tables) {
    try {
      const rows = db.all(`SELECT * FROM ${table}`)
      if (table === 'player') backup.player = rows[0] || {}
      else if (table === 'equipment') backup.equipment = rows
      else if (table === 'inventory') backup.inventory = rows
      else if (table === 'game_progress') backup.progress = rows[0] || {}
      else if (table === 'statistics') backup.statistics = rows[0] || {}
      else if (table === 'achievements') backup.achievements = rows
      else if (table === 'settings') backup.settings = rows[0] || {}
    } catch {
      // 表可能不存在
    }
  }

  // 保存到 localStorage（作为 Blob）
  const backupKey = `${BACKUP_STORAGE_KEY}_${backup.metadata.timestamp}`
  const blob = new Blob([JSON.stringify(backup)], { type: 'application/json' })

  // localStorage 只存字符串，用 data URL 转换
  const reader = new FileReader()
  const dataUrl = await new Promise<string>((resolve) => {
    reader.onload = () => resolve(reader.result as string)
    reader.readAsDataURL(blob)
  })

  localStorage.setItem(backupKey, dataUrl)

  // 更新备份列表
  const list = listBackups()
  list.unshift(backup.metadata)
  // 最多保留10个备份
  const trimmedList = list.slice(0, 10)
  localStorage.setItem(BACKUP_LIST_KEY, JSON.stringify(trimmedList))

  // 设为最新
  localStorage.setItem(BACKUP_STORAGE_KEY + '_latest', backupKey)

  // 同时保存 SQLite 原始文件备份（用于完整恢复）
  const sqliteKey = `${BACKUP_STORAGE_KEY}_sqlite_${backup.metadata.timestamp}`
  const sqliteBlob = new Blob([new Uint8Array(exported)], { type: 'application/octet-stream' })
  const sqliteReader = new FileReader()
  const sqliteDataUrl = await new Promise<string>((resolve) => {
    sqliteReader.onload = () => resolve(sqliteReader.result as string)
    sqliteReader.readAsDataURL(sqliteBlob)
  })
  localStorage.setItem(sqliteKey, sqliteDataUrl)

  return backup.metadata
}

/**
 * 导入备份数据
 */
export function restoreBackup(backupKey: string): GameBackup | null {
  try {
    const dataUrl = localStorage.getItem(backupKey)
    if (!dataUrl) return null

    // 转换回 JSON
    const base64 = dataUrl.split(',')[1]
    const json = atob(base64)
    return JSON.parse(json)
  } catch {
    return null
  }
}

/**
 * 删除指定备份
 */
export function deleteBackup(backupKey: string): void {
  localStorage.removeItem(backupKey)
  const list = listBackups()
  const filtered = list.filter(b => `${BACKUP_STORAGE_KEY}_${b.timestamp}` !== backupKey)
  localStorage.setItem(BACKUP_LIST_KEY, JSON.stringify(filtered))
}

/**
 * 导出备份为文件下载
 */
export function downloadBackup(backup: GameBackup): void {
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `diablo_idle_backup_${new Date(backup.metadata.timestamp).toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * 从文件导入备份
 */
export function importBackupFromFile(file: File): Promise<GameBackup | null> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const backup = JSON.parse(reader.result as string) as GameBackup
        if (backup.metadata && backup.player) {
          resolve(backup)
        } else {
          resolve(null)
        }
      } catch {
        resolve(null)
      }
    }
    reader.readAsText(file)
  })
}

/**
 * 自动备份定时器管理
 */
let autoBackupTimer: ReturnType<typeof setInterval> | null = null

/**
 * 启动自动备份（每5分钟一次）
 */
export function startAutoBackup(
  db: DatabaseInstance,
  getPlayerData: () => { name: string; level: number; playTime: number }
): void {
  if (autoBackupTimer) return

  // 立即备份一次
  createBackup(db, getPlayerData())

  // 每5分钟备份一次
  autoBackupTimer = setInterval(() => {
    createBackup(db, getPlayerData())
  }, 5 * 60 * 1000)
}

/**
 * 停止自动备份
 */
export function stopAutoBackup(): void {
  if (autoBackupTimer) {
    clearInterval(autoBackupTimer)
    autoBackupTimer = null
  }
}
