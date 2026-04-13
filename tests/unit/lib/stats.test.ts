/**
 * @fileoverview 属性系统单元测试
 * @description 测试角色属性计算、装备加成等
 */

import { describe, it, expect } from 'vitest'
import {
  calculateCharacterStats,
  createInitialStats,
  calculatePerSecondStats,
  getStatChanges,
  STATS_CONFIG,
  DEFAULT_CHARACTER_STATS,
} from '@/lib/game/stats'
import type { CharacterClass, BaseStats } from '@/types/game'
import { CharacterClass as CharacterClassEnum } from '@/types/game'
import type { EquipmentState, Item, EquipmentSlot } from '@/types/items'
import { ItemRarity, EquipmentSlot as Slot } from '@/types/items'

describe('属性系统测试', () => {
  describe('createInitialStats - 创建初始属性', () => {
    it('战士应有较高的力量和体力', () => {
      const stats = createInitialStats(CharacterClassEnum.WARRIOR)

      expect(stats.strength).toBeGreaterThan(stats.energy)
      expect(stats.vitality).toBeGreaterThan(stats.energy)
    })

    it('法师应有较高的能量', () => {
      const stats = createInitialStats(CharacterClassEnum.SORCERER)

      expect(stats.energy).toBeGreaterThan(stats.strength)
    })

    it('刺客应有较高的敏捷', () => {
      const stats = createInitialStats(CharacterClassEnum.ROGUE)

      expect(stats.dexterity).toBeGreaterThan(stats.strength)
      expect(stats.dexterity).toBeGreaterThan(stats.energy)
    })
  })

  describe('calculateCharacterStats - 计算角色属性', () => {
    it('应正确计算基础属性', () => {
      const baseStats: BaseStats = {
        strength: 15,
        dexterity: 10,
        vitality: 12,
        energy: 10,
      }

      const stats = calculateCharacterStats(baseStats, 1, {}, [])

      expect(stats.strength).toBe(15)
      expect(stats.dexterity).toBe(10)
      expect(stats.vitality).toBe(12)
      expect(stats.energy).toBe(10)
    })

    it('应正确计算派生属性', () => {
      const baseStats: BaseStats = {
        strength: 10,
        dexterity: 10,
        vitality: 10,
        energy: 10,
      }

      const stats = calculateCharacterStats(baseStats, 1, {}, [])

      // 生命值 = 基础50 + 体力 * 每点体力加成
      expect(stats.maxHealth).toBe(STATS_CONFIG.BASE_HEALTH + 10 * STATS_CONFIG.HEALTH_PER_VITALITY)

      // 法力值 = 基础25 + 能量 * 每点能量加成
      expect(stats.maxMana).toBe(STATS_CONFIG.BASE_MANA + 10 * STATS_CONFIG.MANA_PER_ENERGY)

      // 伤害 = 力量 * 每点力量加成 + 基础
      expect(stats.damage).toBe(10 * STATS_CONFIG.DAMAGE_PER_STRENGTH + 5)
    })

    it('等级提升应增加属性', () => {
      const baseStats: BaseStats = {
        strength: 10,
        dexterity: 10,
        vitality: 10,
        energy: 10,
      }

      const level1 = calculateCharacterStats(baseStats, 1, {}, [])
      const level10 = calculateCharacterStats(baseStats, 10, {}, [])

      expect(level10.maxHealth).toBeGreaterThan(level1.maxHealth)
      expect(level10.maxMana).toBeGreaterThan(level1.maxMana)
      expect(level10.damage).toBeGreaterThan(level1.damage)
    })

    it('当前生命不应超过最大生命', () => {
      const baseStats: BaseStats = {
        strength: 10,
        dexterity: 10,
        vitality: 10,
        energy: 10,
      }

      const stats = calculateCharacterStats(baseStats, 1, {}, [])

      expect(stats.health).toBeLessThanOrEqual(stats.maxHealth)
    })
  })

  describe('calculatePerSecondStats - 每秒属性', () => {
    it('应返回正确的每秒恢复量', () => {
      const stats = {
        ...DEFAULT_CHARACTER_STATS,
        healthRegen: 5,
        manaRegen: 2,
      }

      const perSecond = calculatePerSecondStats(stats)

      expect(perSecond.healthPerSecond).toBe(5)
      expect(perSecond.manaPerSecond).toBe(2)
    })
  })

  describe('getStatChanges - 属性变化描述', () => {
    it('应正确描述增加的属性', () => {
      const before = {
        ...DEFAULT_CHARACTER_STATS,
        damage: 10,
        defense: 5,
        maxHealth: 100,
      }

      const after = {
        ...before,
        damage: 15, // +5
        defense: 8, // +3
        maxHealth: 120, // +20
      }

      const changes = getStatChanges(before, after)

      expect(changes.length).toBe(3)
      expect(changes.find(c => c.stat === '伤害')?.change).toBe(5)
    })

    it('应正确描述减少的属性', () => {
      const before = {
        ...DEFAULT_CHARACTER_STATS,
        damage: 15,
      }

      const after = {
        ...before,
        damage: 10, // -5
      }

      const changes = getStatChanges(before, after)

      expect(changes.find(c => c.stat === '伤害')?.change).toBe(-5)
    })
  })
})
