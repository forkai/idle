/**
 * @fileoverview 数据库迁移系统
 * @description 管理数据库版本，支持增量迁移
 */

/**
 * 单个迁移脚本的定义
 */
export interface Migration {
  /** 迁移版本号（从1开始） */
  version: number
  /** 迁移描述 */
  description: string
  /** 执行迁移的SQL */
  up: string
  /** 回滚SQL（可选） */
  down?: string
}

/**
 * 当前数据库版本
 */
export const CURRENT_DB_VERSION = 1

/**
 * 所有迁移脚本
 */
export const migrations: Migration[] = [
  // Version 1: 初始版本（已在 schema.ts 中通过 CREATE TABLE IF NOT EXISTS 实现）
  {
    version: 1,
    description: 'Initial schema - player, equipment, inventory, progress, stats, achievements, settings',
    up: `
      -- 此版本通过 CREATE_TABLES_SQL 在初始化时已执行
      -- 此处仅记录版本
      PRAGMA user_version = 1;
    `,
  },
]

/**
 * 获取最新迁移版本号
 */
export function getLatestVersion(): number {
  return migrations.reduce((max, m) => Math.max(max, m.version), 0)
}

/**
 * 获取指定版本的迁移
 */
export function getMigration(version: number): Migration | undefined {
  return migrations.find(m => m.version === version)
}

/**
 * 生成迁移表SQL（用于记录已执行的迁移）
 */
export const CREATE_MIGRATIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS __migrations (
    version INTEGER PRIMARY KEY,
    description TEXT NOT NULL,
    applied_at INTEGER NOT NULL
  );
`

/**
 * 检查数据库是否需要迁移
 */
export function needsMigration(db: { exec: (sql: string) => any[] }): boolean {
  try {
    // 尝试获取当前版本
    const result = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name='__migrations'")
    if (result.length === 0 || result[0].values.length === 0) {
      return true // 没有迁移表，需要初始化
    }
    const versionResult = db.exec('SELECT MAX(version) FROM __migrations')
    const currentVersion = versionResult[0]?.values[0]?.[0] as number ?? 0
    return currentVersion < CURRENT_DB_VERSION
  } catch {
    return true
  }
}

/**
 * 执行所有待执行的迁移
 * @returns 执行的迁移数量
 */
export function runMigrations(db: {
  exec: (sql: string, params?: any[]) => any[]
  run: (sql: string, params?: any[]) => void
}): number {
  // 确保迁移表存在
  db.exec(CREATE_MIGRATIONS_TABLE)

  // 获取当前版本
  const versionResult = db.exec('SELECT MAX(version) FROM __migrations')
  const currentVersion = versionResult[0]?.values[0]?.[0] as number ?? 0

  let applied = 0
  for (const migration of migrations) {
    if (migration.version > currentVersion) {
      // 执行迁移
      db.run(migration.up)
      // 记录迁移
      db.run(
        'INSERT OR REPLACE INTO __migrations (version, description, applied_at) VALUES (?, ?, ?)',
        [migration.version, migration.description, Date.now()]
      )
      applied++
    }
  }

  return applied
}
