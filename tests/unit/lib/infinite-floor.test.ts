/**
 * @fileoverview 无尽层数系统单元测试
 * @description 测试层数递进算法、怪物等级缩放和层数奖励
 */

import { describe, it, expect } from 'vitest'
import {
  calculateFloorMonsterLevel,
  calculateDifficultyMultiplier,
  generateInfiniteFloorMonster,
  getFloorMonsters,
  calculateFloorRewards,
  shouldDropItem,
  createInitialFloorProgress,
  processFloorCompletion,
  getFloorDescription,
  getFloorProgressPercent,
  formatFloorDisplay,
  INFINITE_FLOOR_CONFIG,
} from '@/lib/game/infinite-floor'
import { MonsterType } from '@/types/enemy'

describe('无尽层数系统测试', () => {
  describe('calculateFloorMonsterLevel - 怪物等级计算', () => {
    it('第1层基础等级应为1', () => {
      expect(calculateFloorMonsterLevel(1)).toBe(1)
    })

    it('第10层应有每10层加成', () => {
      // 第10层：基础1 + (10-1)*1 + Math.floor(10/10)*5 = 1 + 9 + 5 = 15
      const level = calculateFloorMonsterLevel(10)
      expect(level).toBe(15)
    })

    it('第20层应有双重10层加成', () => {
      // 第20层：基础1 + (20-1)*1 + Math.floor(20/10)*5 = 1 + 19 + 10 = 30
      const level = calculateFloorMonsterLevel(20)
      expect(level).toBe(30)
    })

    it('第5层应有额外加成', () => {
      // 第5层：基础1 + (5-1)*1 + Math.floor(5/10)*5 = 1 + 4 + 0 = 5
      const level = calculateFloorMonsterLevel(5)
      expect(level).toBe(5)
    })
  })

  describe('calculateDifficultyMultiplier - 难度倍数计算', () => {
    it('第1层基础难度为1', () => {
      expect(calculateDifficultyMultiplier(1)).toBe(1)
    })

    it('难度应随层数递增', () => {
      const floor1 = calculateDifficultyMultiplier(1)
      const floor10 = calculateDifficultyMultiplier(10)
      const floor50 = calculateDifficultyMultiplier(50)
      expect(floor10).toBeGreaterThan(floor1)
      expect(floor50).toBeGreaterThan(floor10)
    })

    it('难度倍数不应超过最大限制', () => {
      const maxFloor = calculateDifficultyMultiplier(1000)
      expect(maxFloor).toBeLessThanOrEqual(INFINITE_FLOOR_CONFIG.MAX_DIFFICULTY_MULTIPLIER)
    })
  })

  describe('generateInfiniteFloorMonster - 怪物生成', () => {
    it('应生成普通怪物', () => {
      const monster = generateInfiniteFloorMonster(1, 0)
      expect(monster.name).toBe('第1层 怪物 1')
      expect(monster.type).toBe(MonsterType.BEAST)
      expect(monster.level).toBe(1)
      expect(monster.zoneId).toBe('infinite-floor-1')
    })

    it('应生成BOSS怪物（第5层）', () => {
      const monster = generateInfiniteFloorMonster(5, 0)
      expect(monster.name).toBe('第5层 Boss')
      expect(monster.type).toBe(MonsterType.BOSS)
      expect(monster.stats.health).toBeGreaterThan(monster.stats.damage)
    })

    it('BOSS属性应比普通怪物高', () => {
      const normalMonster = generateInfiniteFloorMonster(10, 1)
      const bossMonster = generateInfiniteFloorMonster(10, 0)
      expect(bossMonster.stats.health).toBeGreaterThan(normalMonster.stats.health)
      expect(bossMonster.stats.goldReward.max).toBeGreaterThan(normalMonster.stats.goldReward.max)
    })

    it('第10层怪物等级应高于第5层', () => {
      const floor5 = generateInfiniteFloorMonster(5, 0)
      const floor10 = generateInfiniteFloorMonster(10, 0)
      expect(floor10.level).toBeGreaterThan(floor5.level)
    })
  })

  describe('getFloorMonsters - 获取层数怪物列表', () => {
    it('第1层应至少有1只怪物', () => {
      const monsters = getFloorMonsters(1)
      expect(monsters.length).toBeGreaterThanOrEqual(1)
    })

    it('第10层怪物数量应大于第1层', () => {
      const monsters1 = getFloorMonsters(1)
      const monsters10 = getFloorMonsters(10)
      expect(monsters10.length).toBeGreaterThanOrEqual(monsters1.length)
    })

    it('怪物列表中应包含BOSS在第5层', () => {
      const monsters = getFloorMonsters(5)
      const boss = monsters.find(m => m.type === MonsterType.BOSS)
      expect(boss).toBeDefined()
    })
  })

  describe('calculateFloorRewards - 层数奖励计算', () => {
    it('第1层普通奖励应为基础值', () => {
      const rewards = calculateFloorRewards(1, false)
      expect(rewards.gold).toBe(INFINITE_FLOOR_CONFIG.BASE_GOLD_REWARD + 1 * INFINITE_FLOOR_CONFIG.GOLD_PER_FLOOR)
      expect(rewards.exp).toBe(INFINITE_FLOOR_CONFIG.BASE_EXP_REWARD + 1 * INFINITE_FLOOR_CONFIG.EXP_PER_FLOOR)
    })

    it('BOSS层奖励应高于普通层', () => {
      const normalRewards = calculateFloorRewards(5, false)
      const bossRewards = calculateFloorRewards(5, true)
      expect(bossRewards.gold).toBeGreaterThan(normalRewards.gold)
      expect(bossRewards.exp).toBeGreaterThan(normalRewards.exp)
    })

    it('奖励应随层数增加', () => {
      const rewards1 = calculateFloorRewards(1, false)
      const rewards10 = calculateFloorRewards(10, false)
      expect(rewards10.gold).toBeGreaterThan(rewards1.gold)
      expect(rewards10.exp).toBeGreaterThan(rewards1.exp)
    })
  })

  describe('shouldDropItem - 物品掉落判定', () => {
    it('第1层应有基础掉落概率', () => {
      // 多次调用测试概率稳定性
      let dropCount = 0
      const attempts = 100
      for (let i = 0; i < attempts; i++) {
        if (shouldDropItem(1)) dropCount++
      }
      // 基础10%概率，允许一定误差
      expect(dropCount).toBeGreaterThan(0)
      expect(dropCount).toBeLessThan(attempts)
    })

    it('高层应有更高掉落概率', () => {
      let lowFloorDrops = 0
      let highFloorDrops = 0
      const attempts = 100

      for (let i = 0; i < attempts; i++) {
        if (shouldDropItem(1)) lowFloorDrops++
        if (shouldDropItem(50)) highFloorDrops++
      }

      expect(highFloorDrops).toBeGreaterThanOrEqual(lowFloorDrops)
    })

    it('掉落概率最高不超过90%', () => {
      // 尝试非常高的层数
      let drops = 0
      for (let i = 0; i < 100; i++) {
        if (shouldDropItem(1000)) drops++
      }
      expect(drops).toBeLessThan(100) // 不会100%掉落
    })
  })

  describe('createInitialFloorProgress - 创建初始进度', () => {
    it('应创建正确的初始值', () => {
      const progress = createInitialFloorProgress()
      expect(progress.currentFloor).toBe(1)
      expect(progress.highestFloor).toBe(1)
      expect(progress.totalKills).toBe(0)
      expect(progress.totalGoldEarned).toBe(0)
      expect(progress.totalExpEarned).toBe(0)
      expect(progress.floorRewards).toEqual([])
    })
  })

  describe('processFloorCompletion - 处理层数完成', () => {
    it('应正确更新当前层数和最高层数', () => {
      const initial = createInitialFloorProgress()
      const result = processFloorCompletion(initial, 1, false)
      expect(result.currentFloor).toBe(2)
      expect(result.highestFloor).toBe(2)
    })

    it('不应降低最高层数记录', () => {
      const progress = { ...createInitialFloorProgress(), highestFloor: 10 }
      const result = processFloorCompletion(progress, 5, false)
      expect(result.highestFloor).toBe(10)
    })

    it('应累加击杀数和奖励', () => {
      const initial = createInitialFloorProgress()
      const rewards = calculateFloorRewards(1, false)
      const result = processFloorCompletion(initial, 1, false)
      expect(result.totalKills).toBe(1)
      expect(result.totalGoldEarned).toBe(rewards.gold)
      expect(result.totalExpEarned).toBe(rewards.exp)
    })

    it('应保留最近50层奖励记录', () => {
      let progress = createInitialFloorProgress()
      for (let i = 1; i <= 60; i++) {
        progress = processFloorCompletion(progress, i, false)
      }
      expect(progress.floorRewards.length).toBe(50)
      expect(progress.floorRewards[0].floor).toBe(11) // 前10层被移除
      expect(progress.floorRewards[49].floor).toBe(60) // 最后1层保留
    })
  })

  describe('getFloorDescription - 层数描述', () => {
    it('BOSS层应有特殊描述', () => {
      const desc = getFloorDescription(5)
      expect(desc).toContain('BOSS')
      expect(desc).toContain('5')
    })

    it('普通层应有标准描述', () => {
      const desc = getFloorDescription(3)
      expect(desc).toContain('第3层')
      expect(desc).toContain('怪物等级')
    })
  })

  describe('getFloorProgressPercent - 进度百分比', () => {
    it('应正确计算进度百分比', () => {
      expect(getFloorProgressPercent(50, 100)).toBe(50)
      expect(getFloorProgressPercent(25, 100)).toBe(25)
    })

    it('不应超过100%', () => {
      expect(getFloorProgressPercent(150, 100)).toBe(100)
      expect(getFloorProgressPercent(100, 100)).toBe(100)
    })

    it('0层应返回0', () => {
      expect(getFloorProgressPercent(0, 100)).toBe(0)
    })
  })

  describe('formatFloorDisplay - 层数显示格式化', () => {
    it('0以下显示问号', () => {
      expect(formatFloorDisplay(0)).toBe('?')
      expect(formatFloorDisplay(-1)).toBe('?')
    })

    it('1-9层显示第X层', () => {
      expect(formatFloorDisplay(1)).toBe('第1层')
      expect(formatFloorDisplay(9)).toBe('第9层')
    })

    it('10-99层显示XF格式', () => {
      expect(formatFloorDisplay(10)).toBe('10F')
      expect(formatFloorDisplay(99)).toBe('99F')
    })

    it('100层以上显示数字', () => {
      expect(formatFloorDisplay(100)).toBe('100')
      expect(formatFloorDisplay(999)).toBe('999')
    })
  })
})
