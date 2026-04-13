/**
 * @fileoverview 战斗系统单元测试
 * @description 测试战斗计算、伤害公式等核心逻辑
 */

import { describe, it, expect } from 'vitest'
import {
  calculateDamage,
  applyElementalResist,
  calculateMonsterDamage,
  rollDodge,
  calculateExpReward,
  calculateGoldReward,
  rollGoldReward,
  calculateAttackInterval,
  getCombatResult,
} from '@/lib/game/combat'
import { DEFAULT_CHARACTER_STATS } from '@/lib/game/stats'
import type { MonsterStats } from '@/types/enemy'

describe('战斗系统测试', () => {
  describe('calculateDamage - 伤害计算', () => {
    it('应正确计算基础伤害', () => {
      const attacker = {
        ...DEFAULT_CHARACTER_STATS,
        damage: 10,
        critChance: 0,
        critDamage: 2.0,
      }

      const defender: MonsterStats = {
        health: 100,
        damage: 5,
        defense: 0,
        attackSpeed: 1,
        expReward: 10,
        goldReward: { min: 1, max: 5 },
        resists: { fire: 0, cold: 0, lightning: 0, poison: 0 },
      }

      const result = calculateDamage(attacker, defender)

      expect(result.finalDamage).toBeGreaterThan(0)
      expect(result.baseDamage).toBe(10)
      expect(result.element).toBe('physical')
    })

    it('应正确计算暴击伤害', () => {
      const attacker = {
        ...DEFAULT_CHARACTER_STATS,
        damage: 10,
        critChance: 1, // 100%暴击
        critDamage: 2.0,
      }

      const defender: MonsterStats = {
        health: 100,
        damage: 5,
        defense: 0,
        attackSpeed: 1,
        expReward: 10,
        goldReward: { min: 1, max: 5 },
        resists: { fire: 0, cold: 0, lightning: 0, poison: 0 },
      }

      const result = calculateDamage(attacker, defender)

      expect(result.isCrit).toBe(true)
      expect(result.baseDamage).toBe(20) // 10 * 2.0暴击
    })

    it('防御应正确减少伤害', () => {
      const lowDefense = {
        ...DEFAULT_CHARACTER_STATS,
        damage: 10,
        critChance: 0,
        critDamage: 1.5,
      }

      const highDefense = {
        ...DEFAULT_CHARACTER_STATS,
        damage: 10,
        critChance: 0,
        critDamage: 1.5,
      }

      const defenderLowDef: MonsterStats = {
        health: 100,
        damage: 5,
        defense: 0,
        attackSpeed: 1,
        expReward: 10,
        goldReward: { min: 1, max: 5 },
        resists: { fire: 0, cold: 0, lightning: 0, poison: 0 },
      }

      const defenderHighDef: MonsterStats = {
        health: 100,
        damage: 5,
        defense: 100, // 高防御
        attackSpeed: 1,
        expReward: 10,
        goldReward: { min: 1, max: 5 },
        resists: { fire: 0, cold: 0, lightning: 0, poison: 0 },
      }

      const lowResult = calculateDamage(lowDefense, defenderLowDef)
      const highResult = calculateDamage(highDefense, defenderHighDef)

      expect(highResult.finalDamage).toBeLessThan(lowResult.finalDamage)
    })
  })

  describe('applyElementalResist - 元素抗性', () => {
    it('正抗性应减少元素伤害', () => {
      const damage = 100
      const defender: MonsterStats = {
        health: 100,
        damage: 5,
        defense: 0,
        attackSpeed: 1,
        expReward: 10,
        goldReward: { min: 1, max: 5 },
        resists: { fire: 50, cold: 0, lightning: 0, poison: 0 },
      }

      const fireDamage = applyElementalResist(damage, defender, 'fire')
      const physicalDamage = applyElementalResist(damage, defender, 'physical')

      expect(fireDamage).toBeLessThan(physicalDamage) // 火属性受伤更少
      expect(fireDamage).toBe(50) // 50%抗性 = 50%伤害
    })

    it('负抗性应增加元素伤害', () => {
      const damage = 100
      const defender: MonsterStats = {
        health: 100,
        damage: 5,
        defense: 0,
        attackSpeed: 1,
        expReward: 10,
        goldReward: { min: 1, max: 5 },
        resists: { fire: -50, cold: 0, lightning: 0, poison: 0 },
      }

      const fireDamage = applyElementalResist(damage, defender, 'fire')

      expect(fireDamage).toBe(150) // -50%抗性 = 150%伤害
    })
  })

  describe('rollDodge - 闪避判定', () => {
    it('高敏捷应增加闪避几率', () => {
      const lowDex = { ...DEFAULT_CHARACTER_STATS, dexterity: 10 }
      const highDex = { ...DEFAULT_CHARACTER_STATS, dexterity: 200 }

      let lowDodges = 0
      let highDodges = 0
      const attempts = 1000

      for (let i = 0; i < attempts; i++) {
        if (rollDodge(lowDex)) lowDodges++
        if (rollDodge(highDex)) highDodges++
      }

      expect(highDodges).toBeGreaterThan(lowDodges)
    })

    it('闪避率不应超过最大值', () => {
      const veryHighDex = { ...DEFAULT_CHARACTER_STATS, dexterity: 1000 }

      let dodges = 0
      const attempts = 50000

      for (let i = 0; i < attempts; i++) {
        if (rollDodge(veryHighDex)) dodges++
      }

      const dodgeRate = dodges / attempts
      // 允许一些统计误差
      expect(dodgeRate).toBeLessThanOrEqual(0.78) // 最大75%，允许误差
    })
  })

  describe('calculateExpReward - 经验计算', () => {
    it('同等级怪物应给与正常经验', () => {
      const exp = calculateExpReward(5, 5, 1.0)
      expect(exp).toBeGreaterThan(0)
    })

    it('高等级怪物应给与更多经验', () => {
      const lowLevel = calculateExpReward(5, 1, 1.0)
      const highLevel = calculateExpReward(10, 1, 1.0)

      expect(highLevel).toBeGreaterThan(lowLevel)
    })

    it('低等级怪物惩罚后经验减少', () => {
      const normal = calculateExpReward(5, 5, 1.0)
      const penalty = calculateExpReward(1, 10, 1.0)

      expect(penalty).toBeLessThan(normal)
    })
  })

  describe('calculateGoldReward - 金币计算', () => {
    it('应返回金币范围', () => {
      const monster = {
        id: 'test',
        name: 'Test',
        type: 'beast' as const,
        level: 5,
        stats: {
          health: 50,
          damage: 5,
          defense: 1,
          attackSpeed: 1,
          expReward: 10,
          goldReward: { min: 10, max: 20 },
          resists: { fire: 0, cold: 0, lightning: 0, poison: 0 },
        },
        abilities: [],
        lootTable: [],
        zoneId: 'test',
        icon: '👾',
        description: 'Test monster',
      }

      const gold = calculateGoldReward(monster, 1.0)

      expect(gold.min).toBeGreaterThanOrEqual(10)
      expect(gold.max).toBeLessThanOrEqual(20)
      expect(gold.min).toBeLessThanOrEqual(gold.max)
    })
  })

  describe('rollGoldReward - 随机金币', () => {
    it('应返回范围内的随机金币', () => {
      const monster = {
        id: 'test',
        name: 'Test',
        type: 'beast' as const,
        level: 5,
        stats: {
          health: 50,
          damage: 5,
          defense: 1,
          attackSpeed: 1,
          expReward: 10,
          goldReward: { min: 10, max: 10 }, // 固定10金币
          resists: { fire: 0, cold: 0, lightning: 0, poison: 0 },
        },
        abilities: [],
        lootTable: [],
        zoneId: 'test',
        icon: '👾',
        description: 'Test monster',
      }

      const gold = rollGoldReward(monster, 1.0)

      expect(gold).toBe(10)
    })
  })

  describe('calculateAttackInterval - 攻击间隔', () => {
    it('攻击速度1.0应返回1000ms', () => {
      const interval = calculateAttackInterval(1.0)
      expect(interval).toBe(1000)
    })

    it('攻击速度2.0应返回500ms', () => {
      const interval = calculateAttackInterval(2.0)
      expect(interval).toBe(500)
    })

    it('零速度应返回1000ms', () => {
      const interval = calculateAttackInterval(0)
      expect(interval).toBe(1000)
    })
  })

  describe('getCombatResult - 战斗结果', () => {
    it('敌人死亡应返回胜利', () => {
      expect(getCombatResult(100, 0)).toBe('victory')
    })

    it('玩家死亡应返回失败', () => {
      expect(getCombatResult(0, 100)).toBe('defeat')
    })

    it('都存活应返回进行中', () => {
      expect(getCombatResult(100, 100)).toBe('ongoing')
    })
  })
})
