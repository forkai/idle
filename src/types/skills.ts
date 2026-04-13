/**
 * @fileoverview 技能系统类型定义
 * @description 定义技能、技能树、被动效果等相关类型
 */

import type { CharacterClass } from './game'
import type { Element } from './combat'

/**
 * 技能类型枚举
 */
export enum SkillType {
  /** 被动技能 */
  PASSIVE = 'passive',
  /** 主动技能 */
  ACTIVE = 'active',
  /** 光环技能 */
  AURA = 'aura',
  /** 召唤技能 */
  SUMMON = 'summon',
}

/**
 * 技能类型名称（中文）
 */
export const SkillTypeNames: Record<SkillType, string> = {
  [SkillType.PASSIVE]: '被动',
  [SkillType.ACTIVE]: '主动',
  [SkillType.AURA]: '光环',
  [SkillType.SUMMON]: '召唤',
}

/**
 * 技能目标类型
 */
export enum SkillTarget {
  /** 自身 */
  SELF = 'self',
  /** 单体敌人 */
  SINGLE_ENEMY = 'single_enemy',
  /** 群体敌人 */
  AOE_ENEMY = 'aoe_enemy',
  /** 友方单体 */
  SINGLE_ALLY = 'single_ally',
  /** 友方全体 */
  AOE_ALLY = 'aoe_ally',
}

/**
 * 技能效果接口
 */
export interface SkillEffect {
  /** 效果类型 */
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'shield'
  /** 效果值 */
  value: number
  /** 元素类型（如果是伤害） */
  element?: Element
  /** 持续时间（毫秒） */
  duration?: number
  /** 作用范围（如果是AOE） */
  radius?: number
}

/**
 * 技能消耗接口
 */
export interface SkillCost {
  /** 法力消耗 */
  mana: number
  /** 生命消耗 */
  health?: number
}

/**
 * 技能接口
 */
export interface Skill {
  /** 技能ID */
  id: string
  /** 技能名称 */
  name: string
  /** 所属职业 */
  classId: CharacterClass
  /** 技能类型 */
  type: SkillType
  /** 技能图标 */
  icon: string
  /** 技能描述 */
  description: string
  /** 技能效果 */
  effects: SkillEffect[]
  /** 消耗 */
  cost: SkillCost
  /** 冷却时间（毫秒） */
  cooldown: number
  /** 目标类型 */
  target: SkillTarget
  /** 所属层（技能树层） */
  tier: number
  /** 解锁等级 */
  requiredLevel: number
  /** 前置技能ID列表 */
  prerequisites: string[]
  /** 技能等级上限 */
  maxLevel: number
}

/**
 * 玩家技能状态接口
 */
export interface PlayerSkill {
  /** 技能ID */
  skillId: string
  /** 当前等级 */
  level: number
  /** 是否已解锁 */
  unlocked: boolean
}

/**
 * 技能树层接口
 */
export interface SkillTier {
  /** 层数 */
  level: number
  /** 解锁等级 */
  requiredLevel: number
  /** 该层技能列表 */
  skills: Skill[]
}

/**
 * 技能树接口
 */
export interface SkillTree {
  /** 所属职业 */
  classId: CharacterClass
  /** 技能树名称 */
  name: string
  /** 技能树层列表 */
  tiers: SkillTier[]
}

/**
 * 计算技能效果值
 * @param skill - 技能
 * @param skillLevel - 技能等级
 * @returns 实际效果值
 */
export function calculateSkillEffect(skill: Skill, skillLevel: number): SkillEffect[] {
  return skill.effects.map(effect => ({
    ...effect,
    value: effect.value * (1 + (skillLevel - 1) * 0.1), // 每级提升10%
  }))
}

/**
 * 获取技能总冷却时间
 * @param skill - 技能
 * @param skillLevel - 技能等级
 * @returns 冷却时间（毫秒）
 */
export function getSkillCooldown(skill: Skill, skillLevel: number): number {
  const reductionPerLevel = 0.05 // 每级5%冷却减少
  return Math.floor(skill.cooldown * (1 - reductionPerLevel * (skillLevel - 1)))
}

/**
 * 获取技能总消耗
 * @param skill - 技能
 * @param skillLevel - 技能等级
 * @returns 消耗
 */
export function getSkillCost(skill: Skill, skillLevel: number): SkillCost {
  return {
    mana: Math.floor(skill.cost.mana * (1 + (skillLevel - 1) * 0.1)),
    health: skill.cost.health
      ? Math.floor(skill.cost.health * (1 + (skillLevel - 1) * 0.1))
      : undefined,
  }
}
