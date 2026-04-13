/**
 * @fileoverview 数据库操作接口
 * @description 提供对SQL.js数据库的CRUD操作
 */

import type { CharacterClass, BaseStats } from '@/types/game'
import type { EquipmentState, Item, EquipmentSlot } from '@/types/items'
import type { PlayerSave } from '@/stores/gameStore'

/**
 * 数据库单例实例类型
 */
export interface DatabaseInstance {
  /** 执行SQL查询 */
  exec: (sql: string, params?: any[]) => any[]
  /** 运行SQL语句 */
  run: (sql: string, params?: any[]) => void
  /** 获取单行结果 */
  get: (sql: string, params?: any[]) => any
  /** 获取所有行 */
  all: (sql: string, params?: any[]) => any[]
  /** 导出数据库为字节数组 */
  export: () => Uint8Array
  /** 关闭数据库 */
  close: () => void
}

/**
 * 玩家存档数据结构（数据库格式）
 */
export interface PlayerRecord {
  id: string
  name: string
  class_id: string
  level: number
  experience: number
  gold: number
  base_stats: string
  allocated_stats: string
  unlocked_skills: string
  skill_levels: string
  current_zone: string
  play_time: number
  created_at: number
  updated_at: number
}

/**
 * 将数据库记录转换为PlayerSave格式
 * @param record - 数据库记录
 * @returns PlayerSave格式
 */
export function recordToPlayerSave(record: PlayerRecord): PlayerSave {
  return {
    id: record.id,
    name: record.name,
    classId: record.class_id as CharacterClass,
    level: record.level,
    experience: record.experience,
    gold: record.gold,
    baseStats: JSON.parse(record.base_stats || '{}'),
    allocatedStats: JSON.parse(record.allocated_stats || '{}'),
    unlockedSkills: JSON.parse(record.unlocked_skills || '[]'),
    skillLevels: JSON.parse(record.skill_levels || '{}'),
    createdAt: record.created_at,
    lastActiveTime: record.updated_at,
  }
}

/**
 * 将PlayerSave转换为数据库记录格式
 * @param player - 玩家存档
 * @returns 数据库记录
 */
export function playerSaveToRecord(player: PlayerSave): PlayerRecord {
  return {
    id: player.id,
    name: player.name,
    class_id: player.classId,
    level: player.level,
    experience: player.experience,
    gold: player.gold,
    base_stats: JSON.stringify(player.baseStats),
    allocated_stats: JSON.stringify(player.allocatedStats),
    unlocked_skills: JSON.stringify(player.unlockedSkills),
    skill_levels: JSON.stringify(player.skillLevels),
    current_zone: 'blood-marsh',
    play_time: 0,
    created_at: player.createdAt,
    updated_at: player.lastActiveTime,
  }
}

/**
 * 数据库操作类
 */
export class GameDatabase {
  private db: DatabaseInstance | null = null

  /**
   * 初始化数据库
   * @param dbInstance - SQL.js数据库实例
   */
  initialize(dbInstance: DatabaseInstance): void {
    this.db = dbInstance
  }

  /**
   * 检查数据库是否已初始化
   */
  isInitialized(): boolean {
    return this.db !== null
  }

  /**
   * 保存玩家存档
   * @param player - 玩家存档
   */
  savePlayer(player: PlayerSave): void {
    if (!this.db) throw new Error('Database not initialized')

    const record = playerSaveToRecord(player)

    const sql = `
      INSERT OR REPLACE INTO player (
        id, name, class_id, level, experience, gold,
        base_stats, allocated_stats, unlocked_skills, skill_levels,
        current_zone, play_time, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    this.db.run(sql, [
      record.id,
      record.name,
      record.class_id,
      record.level,
      record.experience,
      record.gold,
      record.base_stats,
      record.allocated_stats,
      record.unlocked_skills,
      record.skill_levels,
      record.current_zone,
      record.play_time,
      record.created_at,
      record.updated_at,
    ])
  }

  /**
   * 加载玩家存档
   * @param playerId - 玩家ID
   * @returns 玩家存档
   */
  loadPlayer(playerId: string): PlayerSave | null {
    if (!this.db) throw new Error('Database not initialized')

    const sql = 'SELECT * FROM player WHERE id = ?'
    const record = this.db.get(sql, [playerId]) as PlayerRecord | undefined

    if (!record) return null
    return recordToPlayerSave(record)
  }

  /**
   * 获取所有存档列表
   * @returns 存档列表（不含详细数据）
   */
  getAllSaves(): { id: string; name: string; level: number; classId: CharacterClass; lastActiveTime: number }[] {
    if (!this.db) throw new Error('Database not initialized')

    const sql = 'SELECT id, name, class_id, level, updated_at FROM player ORDER BY updated_at DESC'
    const records = this.db.all(sql) as any[]

    return records.map(r => ({
      id: r.id,
      name: r.name,
      level: r.level,
      classId: r.class_id as CharacterClass,
      lastActiveTime: r.updated_at,
    }))
  }

  /**
   * 删除玩家存档
   * @param playerId - 玩家ID
   */
  deletePlayer(playerId: string): void {
    if (!this.db) throw new Error('Database not initialized')

    this.db.run('DELETE FROM player WHERE id = ?', [playerId])
    this.db.run('DELETE FROM character_stats WHERE player_id = ?', [playerId])
    this.db.run('DELETE FROM equipment WHERE player_id = ?', [playerId])
    this.db.run('DELETE FROM inventory WHERE player_id = ?', [playerId])
    this.db.run('DELETE FROM game_progress WHERE player_id = ?', [playerId])
    this.db.run('DELETE FROM statistics WHERE player_id = ?', [playerId])
    this.db.run('DELETE FROM achievements WHERE player_id = ?', [playerId])
    this.db.run('DELETE FROM settings WHERE player_id = ?', [playerId])
  }

  /**
   * 保存装备
   * @param playerId - 玩家ID
   * @param equipment - 装备状态
   */
  saveEquipment(playerId: string, equipment: EquipmentState): void {
    if (!this.db) throw new Error('Database not initialized')

    // 先删除旧装备
    this.db.run('DELETE FROM equipment WHERE player_id = ?', [playerId])

    // 插入新装备
    for (const [slot, item] of Object.entries(equipment)) {
      if (item) {
        const sql = `
          INSERT INTO equipment (id, player_id, slot, item_data, is_equipped)
          VALUES (?, ?, ?, ?, ?)
        `
        this.db.run(sql, [item.id, playerId, slot, JSON.stringify(item), 1])
      }
    }
  }

  /**
   * 加载装备
   * @param playerId - 玩家ID
   * @returns 装备状态
   */
  loadEquipment(playerId: string): EquipmentState {
    if (!this.db) throw new Error('Database not initialized')

    const sql = 'SELECT slot, item_data FROM equipment WHERE player_id = ? AND is_equipped = 1'
    const records = this.db.all(sql) as any[]

    const equipment: EquipmentState = {
      head: null,
      chest: null,
      gloves: null,
      boots: null,
      belt: null,
      shield: null,
      ring1: null,
      ring2: null,
      amulet: null,
      weapon: null,
    }

    for (const record of records) {
      const item = JSON.parse(record.item_data) as Item
      equipment[record.slot as EquipmentSlot] = item
    }

    return equipment
  }

  /**
   * 保存背包
   * @param playerId - 玩家ID
   * @param slots - 背包槽位数组
   */
  saveInventory(playerId: string, slots: (Item | null)[]): void {
    if (!this.db) throw new Error('Database not initialized')

    // 先删除旧背包
    this.db.run('DELETE FROM inventory WHERE player_id = ?', [playerId])

    // 插入新物品
    for (let i = 0; i < slots.length; i++) {
      const item = slots[i]
      if (item) {
        const sql = `
          INSERT INTO inventory (id, player_id, slot_index, item_data, quantity)
          VALUES (?, ?, ?, ?, ?)
        `
        this.db.run(sql, [item.id, playerId, i, JSON.stringify(item), item.quantity])
      }
    }
  }

  /**
   * 加载背包
   * @param playerId - 玩家ID
   * @returns 背包槽位数组
   */
  loadInventory(playerId: string): (Item | null)[] {
    if (!this.db) throw new Error('Database not initialized')

    const sql = 'SELECT slot_index, item_data FROM inventory WHERE player_id = ? ORDER BY slot_index'
    const records = this.db.all(sql) as any[]

    const slots: (Item | null)[] = Array(60).fill(null)

    for (const record of records) {
      const item = JSON.parse(record.item_data) as Item
      slots[record.slot_index] = item
    }

    return slots
  }

  /**
   * 更新统计数据
   * @param playerId - 玩家ID
   * @param stats - 统计更新数据
   */
  updateStatistics(playerId: string, stats: Partial<{
    totalDamageDealt: number
    totalMonstersKilled: number
    totalGoldEarned: number
    totalTimePlayed: number
    totalItemsFound: number
    totalBossesKilled: number
    highestLevel: number
  }>): void {
    if (!this.db) throw new Error('Database not initialized')

    const updates: string[] = []
    const values: any[] = []

    if (stats.totalDamageDealt !== undefined) {
      updates.push('total_damage_dealt = total_damage_dealt + ?')
      values.push(stats.totalDamageDealt)
    }
    if (stats.totalMonstersKilled !== undefined) {
      updates.push('total_monsters_killed = total_monsters_killed + ?')
      values.push(stats.totalMonstersKilled)
    }
    if (stats.totalGoldEarned !== undefined) {
      updates.push('total_gold_earned = total_gold_earned + ?')
      values.push(stats.totalGoldEarned)
    }
    if (stats.totalTimePlayed !== undefined) {
      updates.push('total_time_played = total_time_played + ?')
      values.push(stats.totalTimePlayed)
    }
    if (stats.totalItemsFound !== undefined) {
      updates.push('total_items_found = total_items_found + ?')
      values.push(stats.totalItemsFound)
    }
    if (stats.totalBossesKilled !== undefined) {
      updates.push('total_bosses_killed = total_bosses_killed + ?')
      values.push(stats.totalBossesKilled)
    }
    if (stats.highestLevel !== undefined) {
      updates.push('highest_level = MAX(highest_level, ?)')
      values.push(stats.highestLevel)
    }

    if (updates.length === 0) return

    values.push(playerId)
    const sql = `INSERT INTO statistics (player_id, ${updates.map(u => u.split('=')[0].trim()).join(', ')}) VALUES (?, ${updates.map(() => '?').join(', ')}) ON CONFLICT(player_id) DO UPDATE SET ${updates.join(', ')}`

    // 简化处理
    const insertSql = `
      INSERT INTO statistics (player_id, total_damage_dealt, total_monsters_killed, total_gold_earned, total_time_played, total_items_found, total_bosses_killed, highest_level)
      VALUES (?, 0, 0, 0, 0, 0, 0, 1)
      ON CONFLICT(player_id) DO UPDATE SET
        total_damage_dealt = total_damage_dealt + ?,
        total_monsters_killed = total_monsters_killed + ?,
        total_gold_earned = total_gold_earned + ?,
        total_time_played = total_time_played + ?,
        total_items_found = total_items_found + ?,
        total_bosses_killed = total_bosses_killed + ?,
        highest_level = MAX(highest_level, ?)
    `

    this.db.run(insertSql, [
      playerId,
      stats.totalDamageDealt || 0,
      stats.totalMonstersKilled || 0,
      stats.totalGoldEarned || 0,
      stats.totalTimePlayed || 0,
      stats.totalItemsFound || 0,
      stats.totalBossesKilled || 0,
      stats.highestLevel || 1,
    ])
  }

  /**
   * 导出数据库为JSON
   * @returns 导出的JSON数据
   */
  exportToJSON(): string {
    if (!this.db) throw new Error('Database not initialized')

    const tables = ['player', 'character_stats', 'equipment', 'inventory', 'game_progress', 'statistics', 'achievements', 'settings']
    const data: Record<string, any[]> = {}

    for (const table of tables) {
      const records = this.db.all(`SELECT * FROM ${table}`)
      data[table] = records
    }

    return JSON.stringify(data, null, 2)
  }

  /**
   * 导入数据库
   * @param jsonData - JSON数据
   */
  importFromJSON(jsonData: string): void {
    if (!this.db) throw new Error('Database not initialized')

    const data = JSON.parse(jsonData)

    // 清空现有数据
    const tables = ['player', 'character_stats', 'equipment', 'inventory', 'game_progress', 'statistics', 'achievements', 'settings']
    for (const table of tables) {
      this.db.run(`DELETE FROM ${table}`)
    }

    // 导入数据
    for (const [table, records] of Object.entries(data)) {
      if (Array.isArray(records)) {
        for (const record of records) {
          const columns = Object.keys(record)
          const placeholders = columns.map(() => '?').join(', ')
          const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`
          this.db.run(sql, Object.values(record))
        }
      }
    }
  }
}

// 导出单例
export const gameDatabase = new GameDatabase()
