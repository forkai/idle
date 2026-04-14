/**
 * @fileoverview 数据库迁移系统单元测试
 * @description 测试迁移版本管理、迁移执行等
 */

import { describe, it, expect } from 'vitest'
import {
  migrations,
  CURRENT_DB_VERSION,
  getLatestVersion,
  getMigration,
  needsMigration,
  runMigrations,
  CREATE_MIGRATIONS_TABLE,
} from '@/lib/db/migrations'

describe('数据库迁移系统', () => {
  describe('migrations - 迁移脚本定义', () => {
    it('应有至少一个迁移', () => {
      expect(migrations.length).toBeGreaterThan(0)
    })

    it('每个迁移应有正确结构', () => {
      migrations.forEach(migration => {
        expect(typeof migration.version).toBe('number')
        expect(typeof migration.description).toBe('string')
        expect(typeof migration.up).toBe('string')
        expect(migration.version).toBeGreaterThan(0)
      })
    })

    it('迁移版本应唯一', () => {
      const versions = migrations.map(m => m.version)
      const uniqueVersions = new Set(versions)
      expect(uniqueVersions.size).toBe(versions.length)
    })
  })

  describe('CURRENT_DB_VERSION - 当前数据库版本', () => {
    it('应为正整数', () => {
      expect(CURRENT_DB_VERSION).toBeGreaterThan(0)
      expect(Number.isInteger(CURRENT_DB_VERSION)).toBe(true)
    })

    it('应与最新迁移版本匹配', () => {
      const latestVersion = getLatestVersion()
      expect(CURRENT_DB_VERSION).toBe(latestVersion)
    })
  })

  describe('getLatestVersion - 获取最新迁移版本号', () => {
    it('应返回最大版本号', () => {
      const latestVersion = getLatestVersion()
      migrations.forEach(m => {
        expect(latestVersion).toBeGreaterThanOrEqual(m.version)
      })
    })
  })

  describe('getMigration - 获取指定版本迁移', () => {
    it('应返回存在的迁移', () => {
      const migration = getMigration(1)
      expect(migration).toBeDefined()
      expect(migration?.version).toBe(1)
    })

    it('不存在的版本应返回 undefined', () => {
      const migration = getMigration(999)
      expect(migration).toBeUndefined()
    })

    it('版本0应返回 undefined', () => {
      const migration = getMigration(0)
      expect(migration).toBeUndefined()
    })
  })

  describe('CREATE_MIGRATIONS_TABLE - 迁移表SQL', () => {
    it('应包含创建表语句', () => {
      expect(CREATE_MIGRATIONS_TABLE).toContain('CREATE TABLE')
    })

    it('应包含 __migrations 表名', () => {
      expect(CREATE_MIGRATIONS_TABLE).toContain('__migrations')
    })

    it('应包含必要字段', () => {
      expect(CREATE_MIGRATIONS_TABLE).toContain('version')
      expect(CREATE_MIGRATIONS_TABLE).toContain('description')
      expect(CREATE_MIGRATIONS_TABLE).toContain('applied_at')
    })
  })

  describe('needsMigration - 检查是否需要迁移', () => {
    it('没有迁移表时应返回 true', () => {
      const db = {
        exec: vi.fn().mockReturnValue([]),
      }
      expect(needsMigration(db as any)).toBe(true)
    })

    it('有迁移表但版本低于当前时应返回 true', () => {
      const db = {
        exec: vi.fn().mockImplementation((sql: string) => {
          if (sql.includes("sqlite_master")) {
            // 迁移表存在
            return [{ values: [['__migrations']] }]
          }
          if (sql.includes('MAX(version)')) {
            // 当前版本为1，低于 CURRENT_DB_VERSION(1)，但因为 CURRENT_DB_VERSION = 1，所以 1 < 1 = false
            // 为了测试，这里返回0，这样 0 < 1 = true
            return [{ values: [[0]] }]
          }
          return []
        }),
      }
      expect(needsMigration(db as any)).toBe(true)
    })

    it('版本为当前版本时应返回 false', () => {
      const db = {
        exec: vi.fn().mockImplementation((sql: string) => {
          if (sql.includes("sqlite_master")) {
            return [{ values: [['__migrations']] }]
          }
          if (sql.includes('MAX(version)')) {
            return [{ values: [[CURRENT_DB_VERSION]] }]
          }
          return []
        }),
      }
      expect(needsMigration(db as any)).toBe(false)
    })

    it('发生错误时应返回 true', () => {
      const db = {
        exec: vi.fn().mockImplementation(() => {
          throw new Error('DB error')
        }),
      }
      expect(needsMigration(db as any)).toBe(true)
    })
  })

  describe('runMigrations - 执行迁移', () => {
    it('应执行所有待执行的迁移', () => {
      const db = {
        exec: vi.fn().mockImplementation((sql: string) => {
          if (sql.includes('SELECT MAX(version)')) {
            return [{ values: [[0]] }]
          }
          return []
        }),
        run: vi.fn(),
      }

      const applied = runMigrations(db as any)
      expect(applied).toBe(migrations.length)
    })

    it('应只执行未执行的迁移', () => {
      const db = {
        exec: vi.fn().mockImplementation((sql: string) => {
          if (sql.includes('SELECT MAX(version)')) {
            return [{ values: [[CURRENT_DB_VERSION]] }]
          }
          return []
        }),
        run: vi.fn(),
      }

      const applied = runMigrations(db as any)
      expect(applied).toBe(0)
    })

    it('应记录迁移执行', () => {
      const db = {
        exec: vi.fn().mockImplementation((sql: string) => {
          if (sql.includes('SELECT MAX(version)')) {
            return [{ values: [[0]] }]
          }
          return []
        }),
        run: vi.fn(),
      }

      runMigrations(db as any)

      // 验证 INSERT OR REPLACE 语句被执行
      expect(db.run).toHaveBeenCalled()
      const insertCall = db.run.mock.calls.find(
        (call: string[]) => call[0].includes('INSERT')
      )
      expect(insertCall).toBeDefined()
    })
  })
})
