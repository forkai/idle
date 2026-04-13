/**
 * @fileoverview 敌人/怪物系统类型定义
 * @description 定义怪物、Boss、区域等相关类型
 */

import type { Element } from './combat'
import type { Item, ItemRarity } from './items'

/**
 * 怪物类型枚举
 */
export enum MonsterType {
  /** 野兽 */
  BEAST = 'beast',
  /** 不死族 */
  UNDEAD = 'undead',
  /** 恶魔 */
  DEMON = 'demon',
  /** 元素生物 */
  ELEMENTAL = 'elemental',
  /** Boss */
  BOSS = 'boss',
}

/**
 * 怪物类型名称（中文）
 */
export const MonsterTypeNames: Record<MonsterType, string> = {
  [MonsterType.BEAST]: '野兽',
  [MonsterType.UNDEAD]: '不死族',
  [MonsterType.DEMON]: '恶魔',
  [MonsterType.ELEMENTAL]: '元素生物',
  [MonsterType.BOSS]: '首领',
}

/**
 * 掉落条目接口
 */
export interface LootEntry {
  /** 物品ID或物品生成规则 */
  itemId: string
  /** 掉落概率（0-1） */
  chance: number
  /** 最小数量 */
  minQuantity: number
  /** 最大数量 */
  maxQuantity: number
}

/**
 * 怪物属性接口
 */
export interface MonsterStats {
  /** 生命值 */
  health: number
  /** 伤害 */
  damage: number
  /** 防御 */
  defense: number
  /** 攻击速度 */
  attackSpeed: number
  /** 经验奖励 */
  expReward: number
  /** 金币奖励范围 */
  goldReward: { min: number; max: number }
  /** 元素抗性 */
  resists: {
    fire: number
    cold: number
    lightning: number
    poison: number
  }
}

/**
 * 怪物能力接口
 */
export interface MonsterAbility {
  /** 能力ID */
  id: string
  /** 能力名称 */
  name: string
  /** 能力描述 */
  description: string
  /** 触发概率 */
  triggerChance: number
  /** 效果类型 */
  effectType: 'damage' | 'debuff' | 'summon' | 'buff' | 'heal'
  /** 效果值 */
  effectValue: number
  /** 冷却时间（毫秒） */
  cooldown: number
  /** 关联元素（如果是元素技能） */
  element?: string | null
}

/**
 * 怪物接口
 */
export interface Monster {
  /** 怪物ID（运行时生成） */
  id: string
  /** 模板ID（用于图鉴追踪） */
  templateId?: string
  /** 怪物名称 */
  name: string
  /** 怪物类型 */
  type: MonsterType
  /** 等级 */
  level: number
  /** 怪物属性 */
  stats: MonsterStats
  /** 特殊能力列表 */
  abilities: MonsterAbility[]
  /** 掉落表 */
  lootTable: LootEntry[]
  /** 所属区域 */
  zoneId: string
  /** 怪物图标 */
  icon: string
  /** 描述 */
  description: string
}

/**
 * 区域奖励接口
 */
export interface ZoneRewards {
  /** 金币加成倍率 */
  goldBonus: number
  /** 经验加成倍率 */
  expBonus: number
  /** 掉落加成倍率 */
  lootBonus: number
}

/**
 * 区域接口
 */
export interface Zone {
  /** 区域ID */
  id: string
  /** 区域名称 */
  name: string
  /** 描述 */
  description: string
  /** 背景描述 */
  background: string
  /** 最低等级要求 */
  requiredLevel: number
  /** 怪物等级范围 */
  monsterLevelRange: { min: number; max: number }
  /** 怪物类型列表 */
  monsterTypes: MonsterType[]
  /** 怪物ID列表 */
  monsters: string[]
  /** Boss ID */
  bossId?: string
  /** 区域奖励 */
  rewards: ZoneRewards
  /** 是否已解锁 */
  unlocked: boolean
  /** 所属章节 */
  act: number
}

/**
 * 章节接口
 */
export interface Act {
  /** 章节ID */
  id: string
  /** 章节名称 */
  name: string
  /** 描述 */
  description: string
  /** 难度等级 */
  difficulty: number
  /** 区域ID列表 */
  zones: string[]
}

/**
 * 创建默认怪物属性
 * @param level - 等级
 * @returns 默认怪物属性
 */
export function createDefaultMonsterStats(level: number): MonsterStats {
  const multiplier = 1 + level * 0.15
  return {
    health: Math.floor(50 * multiplier),
    damage: Math.floor(5 * multiplier),
    defense: Math.floor(2 * multiplier),
    attackSpeed: 1,
    expReward: Math.floor(10 * level * multiplier),
    goldReward: { min: Math.floor(5 * level), max: Math.floor(15 * level) },
    resists: {
      fire: 0,
      cold: 0,
      lightning: 0,
      poison: 0,
    },
  }
}

/**
 * 判断怪物是否是Boss
 * @param monster - 怪物
 * @returns 是否是Boss
 */
export function isBoss(monster: Monster): boolean {
  return monster.type === MonsterType.BOSS
}
