/**
 * @fileoverview 离线收益系统单元测试
 * @description 测试离线收益计算、奖励生成和时间格式化
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  calculateOfflineRewards,
  formatOfflineTime,
  shouldCalculateOfflineRewards,
  getOfflineRewardDescription,
  OFFLINE_CONFIG,
} from '@/lib/game/offline-rewards'

// 模拟 Date.now()
const FIXED_NOW = 1700000000000 // 固定时间戳

describe('离线收益系统测试', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(FIXED_NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('calculateOfflineRewards - 离线收益计算', () => {
    it('离线时间小于1分钟应返回零收益', () => {
      const lastSave = FIXED_NOW - 30000 // 30秒前
      const result = calculateOfflineRewards(
        lastSave,
        { level: 10 },
        { level: 10, goldBonus: 0, expBonus: 0 }
      )
      expect(result.offlineTime).toBe(0)
      expect(result.exp).toBe(0)
      expect(result.gold).toBe(0)
      expect(result.kills).toBe(0)
      expect(result.items).toEqual([])
    })

    it('正常离线时间应返回奖励', () => {
      const lastSave = FIXED_NOW - 600000 // 10分钟前
      const result = calculateOfflineRewards(
        lastSave,
        { level: 10 },
        { level: 10, goldBonus: 0, expBonus: 0 }
      )
      expect(result.offlineTime).toBe(600000)
      expect(result.kills).toBeGreaterThan(0)
    })

    it('不应超过最大离线收益时间', () => {
      const lastSave = FIXED_NOW - OFFLINE_CONFIG.MAX_OFFLINE_TIME * 2 // 超过最大时间
      const result = calculateOfflineRewards(
        lastSave,
        { level: 10 },
        { level: 10, goldBonus: 0, expBonus: 0 }
      )
      expect(result.offlineTime).toBe(OFFLINE_CONFIG.MAX_OFFLINE_TIME)
      expect(result.cap.time).toBe(OFFLINE_CONFIG.MAX_OFFLINE_TIME)
    })

    it('区域加成应影响收益', () => {
      const lastSave = FIXED_NOW - 600000 // 10分钟

      const noBonus = calculateOfflineRewards(
        lastSave,
        { level: 10 },
        { level: 10, goldBonus: 0, expBonus: 0 }
      )

      const withBonus = calculateOfflineRewards(
        lastSave,
        { level: 10 },
        { level: 10, goldBonus: 1.0, expBonus: 1.0 } // 100%加成
      )

      expect(withBonus.gold).toBeGreaterThan(noBonus.gold)
      expect(withBonus.exp).toBeGreaterThan(noBonus.exp)
    })

    it('cap对象应包含正确的上限信息', () => {
      const lastSave = FIXED_NOW - 600000 // 10分钟
      const result = calculateOfflineRewards(
        lastSave,
        { level: 10 },
        { level: 10, goldBonus: 0, expBonus: 0 }
      )

      expect(result.cap.exp).toBe(Math.floor(OFFLINE_CONFIG.EXP_CAP_PER_MIN * 10))
      expect(result.cap.gold).toBe(Math.floor(OFFLINE_CONFIG.GOLD_CAP_PER_MIN * 10))
      expect(result.cap.time).toBe(OFFLINE_CONFIG.MAX_OFFLINE_TIME)
    })

    it('收益不应超过上限', () => {
      const lastSave = FIXED_NOW - 600000 // 10分钟
      const result = calculateOfflineRewards(
        lastSave,
        { level: 10 },
        { level: 10, goldBonus: 100, expBonus: 100 } // 极端加成
      )

      // 即使有极端加成，也应受上限限制
      const maxExp = OFFLINE_CONFIG.EXP_CAP_PER_MIN * 10
      const maxGold = OFFLINE_CONFIG.GOLD_CAP_PER_MIN * 10
      expect(result.exp).toBeLessThanOrEqual(maxExp)
      expect(result.gold).toBeLessThanOrEqual(maxGold)
    })
  })

  describe('formatOfflineTime - 离线时间格式化', () => {
    it('少于1分钟应显示秒', () => {
      expect(formatOfflineTime(0)).toBe('0秒')
      expect(formatOfflineTime(30000)).toBe('30秒')
      expect(formatOfflineTime(59999)).toBe('59秒')
    })

    it('1-59分钟应显示分钟', () => {
      expect(formatOfflineTime(60000)).toBe('1分钟')
      expect(formatOfflineTime(300000)).toBe('5分钟')
      expect(formatOfflineTime(3540000)).toBe('59分钟')
    })

    it('1小时以上应显示小时和分钟', () => {
      expect(formatOfflineTime(3600000)).toBe('1小时0分钟')
      expect(formatOfflineTime(5400000)).toBe('1小时30分钟')
      expect(formatOfflineTime(7200000)).toBe('2小时0分钟')
    })

    it('正好1分钟应显示1分钟', () => {
      expect(formatOfflineTime(60000)).toBe('1分钟')
    })

    it('时间换算应正确', () => {
      // 2小时30分钟 = 9000秒 = 150分钟
      const result = formatOfflineTime(9000000)
      expect(result).toBe('2小时30分钟')
    })
  })

  describe('shouldCalculateOfflineRewards - 是否应该计算离线收益', () => {
    it('少于1分钟不应计算', () => {
      const lastSave = FIXED_NOW - 30000 // 30秒
      expect(shouldCalculateOfflineRewards(lastSave)).toBe(false)
    })

    it('正好1分钟应计算', () => {
      const lastSave = FIXED_NOW - 60000
      expect(shouldCalculateOfflineRewards(lastSave)).toBe(true)
    })

    it('超过1分钟应计算', () => {
      const lastSave = FIXED_NOW - 120000 // 2分钟
      expect(shouldCalculateOfflineRewards(lastSave)).toBe(true)
    })

    it('很久以前也应计算（受最大时间限制）', () => {
      const lastSave = FIXED_NOW - 24 * 60 * 60 * 1000 // 1天前
      expect(shouldCalculateOfflineRewards(lastSave)).toBe(true)
    })
  })

  describe('getOfflineRewardDescription - 获取离线收益描述', () => {
    it('离线时间太短应返回提示', () => {
      const rewards = {
        offlineTime: 0,
        exp: 0,
        gold: 0,
        items: [],
        kills: 0,
        cap: { exp: 0, gold: 0, time: 0 },
      }
      const desc = getOfflineRewardDescription(rewards)
      expect(desc).toContain('离线时间太短')
    })

    it('正常收益应包含击杀数', () => {
      const rewards = {
        offlineTime: 600000,
        exp: 100,
        gold: 50,
        items: [],
        kills: 10,
        cap: { exp: 10000, gold: 5000, time: OFFLINE_CONFIG.MAX_OFFLINE_TIME },
      }
      const desc = getOfflineRewardDescription(rewards)
      expect(desc).toContain('击杀 10 只怪物')
    })

    it('有经验奖励应显示', () => {
      const rewards = {
        offlineTime: 600000,
        exp: 1000,
        gold: 0,
        items: [],
        kills: 10,
        cap: { exp: 10000, gold: 5000, time: OFFLINE_CONFIG.MAX_OFFLINE_TIME },
      }
      const desc = getOfflineRewardDescription(rewards)
      expect(desc).toContain('经验')
      expect(desc).toContain('1,000') // 千位分隔符
    })

    it('有金币奖励应显示', () => {
      const rewards = {
        offlineTime: 600000,
        exp: 0,
        gold: 500,
        items: [],
        kills: 10,
        cap: { exp: 10000, gold: 5000, time: OFFLINE_CONFIG.MAX_OFFLINE_TIME },
      }
      const desc = getOfflineRewardDescription(rewards)
      expect(desc).toContain('金币')
      expect(desc).toContain('500')
    })

    it('有物品应显示物品数量', () => {
      const rewards = {
        offlineTime: 600000,
        exp: 0,
        gold: 0,
        items: [{ id: 'item1' } as any, { id: 'item2' } as any],
        kills: 10,
        cap: { exp: 10000, gold: 5000, time: OFFLINE_CONFIG.MAX_OFFLINE_TIME },
      }
      const desc = getOfflineRewardDescription(rewards)
      expect(desc).toContain('物品')
      expect(desc).toContain('2')
    })
  })

  describe('OFFLINE_CONFIG - 配置常量', () => {
    it('最大离线时间应为4小时', () => {
      expect(OFFLINE_CONFIG.MAX_OFFLINE_TIME).toBe(4 * 60 * 60 * 1000)
    })

    it('经验收益率应为正数', () => {
      expect(OFFLINE_CONFIG.EXP_RATE_PER_MIN).toBeGreaterThan(0)
    })

    it('金币收益率应为正数', () => {
      expect(OFFLINE_CONFIG.GOLD_RATE_PER_MIN).toBeGreaterThan(0)
    })

    it('基础击杀率应为正数', () => {
      expect(OFFLINE_CONFIG.BASE_KILLS_PER_MIN).toBeGreaterThan(0)
    })

    it('掉落物品概率应在0-1之间', () => {
      expect(OFFLINE_CONFIG.LOOT_CHANCE).toBeGreaterThanOrEqual(0)
      expect(OFFLINE_CONFIG.LOOT_CHANCE).toBeLessThanOrEqual(1)
    })

    it('经验上限应为正数', () => {
      expect(OFFLINE_CONFIG.EXP_CAP_PER_MIN).toBeGreaterThan(0)
    })

    it('金币上限应为正数', () => {
      expect(OFFLINE_CONFIG.GOLD_CAP_PER_MIN).toBeGreaterThan(0)
    })
  })
})
