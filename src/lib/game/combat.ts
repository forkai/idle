/**
 * @fileoverview 战斗系统核心逻辑
 * @description 实现暗黑破坏神风格的战斗计算
 */

import type { CharacterStats } from '@/types/game'
import type { Monster, MonsterStats } from '@/types/enemy'
import type { Skill } from '@/types/skills'
import { Element, CombatEvent, DamageResult } from '@/types/combat'

/**
 * 战斗常量配置
 */
export const COMBAT_CONFIG = {
  /** 基础防御公式常数 */
  DEFENSE_CONSTANT: 100,
  /** 暴击基础伤害倍率 */
  CRIT_BASE_MULTIPLIER: 2.0,
  /** 闪避最大几率 */
  MAX_DODGE_CHANCE: 0.75,
  /** 抗性最大阈值 */
  MAX_RESIST: 75,
  /** 抗性最小阈值 */
  MIN_RESIST: -100,
}

/**
 * 计算角色对怪物的伤害
 * @param attacker - 攻击者属性
 * @param defender - 防御者属性（怪物）
 * @param skill - 使用技能（可选）
 * @param skillLevel - 技能等级
 * @returns 伤害结果
 */
export function calculateDamage(
  attacker: CharacterStats,
  defender: MonsterStats,
  skill?: Skill,
  skillLevel: number = 1
): DamageResult {
  // 基础伤害
  let baseDamage = attacker.damage

  // 如果使用技能，应用技能加成
  if (skill) {
    const skillEffect = skill.effects.find(e => e.type === 'damage')
    if (skillEffect) {
      baseDamage = attacker.damage * skillEffect.value * (1 + (skillLevel - 1) * 0.1)
    }
  }

  // 暴击判定
  const isCrit = Math.random() < attacker.critChance
  if (isCrit) {
    baseDamage *= attacker.critDamage
  }

  // 防御减免（暗黑风格公式）
  const damageReduction = defender.defense / (defender.defense + COMBAT_CONFIG.DEFENSE_CONSTANT)
  let finalDamage = baseDamage * (1 - damageReduction)

  // 元素伤害处理
  const element: Element = skill?.effects.find(e => e.type === 'damage')?.element || Element.PHYSICAL
  finalDamage = applyElementalResist(finalDamage, defender, element)

  return {
    baseDamage: Math.floor(baseDamage),
    finalDamage: Math.floor(Math.max(1, finalDamage)),
    isCrit,
    element,
    skillName: skill?.name,
  }
}

/**
 * 应用元素抗性
 * @param damage - 原始伤害
 * @param defender - 防御者属性
 * @param element - 元素类型
 * @returns 抗性减免后的伤害
 */
export function applyElementalResist(damage: number, defender: MonsterStats, element: Element): number {
  let resist: number

  switch (element) {
    case Element.FIRE:
      resist = defender.resists.fire
      break
    case Element.COLD:
      resist = defender.resists.cold
      break
    case Element.LIGHTNING:
      resist = defender.resists.lightning
      break
    case Element.POISON:
      resist = defender.resists.poison
      break
    default:
      return damage
  }

  // 抗性转换：-100~75 抗性对应 200%~25% 受到伤害
  const clampedResist = Math.max(COMBAT_CONFIG.MIN_RESIST, Math.min(COMBAT_CONFIG.MAX_RESIST, resist))
  const resistMultiplier = (100 - clampedResist) / 100

  return damage * resistMultiplier
}

/**
 * 计算怪物对角色的伤害
 * @param attacker - 怪物属性
 * @param defender - 角色属性
 * @returns 伤害结果
 */
export function calculateMonsterDamage(attacker: MonsterStats, defender: CharacterStats): DamageResult {
  // 基础伤害
  let baseDamage = attacker.damage

  // 暴击（怪物暴击率固定10%，伤害1.5倍）
  const isCrit = Math.random() < 0.1
  if (isCrit) {
    baseDamage *= 1.5
  }

  // 防御减免
  const damageReduction = defender.defense / (defender.defense + COMBAT_CONFIG.DEFENSE_CONSTANT)
  let finalDamage = baseDamage * (1 - damageReduction)

  return {
    baseDamage: Math.floor(baseDamage),
    finalDamage: Math.floor(Math.max(1, finalDamage)),
    isCrit,
    element: Element.PHYSICAL,
  }
}

/**
 * 计算闪避
 * @param defender - 防御者属性
 * @returns 是否闪避成功
 */
export function rollDodge(defender: CharacterStats): boolean {
  // 闪避率基于敏捷
  const dodgeChance = Math.min(defender.dexterity / 200, COMBAT_CONFIG.MAX_DODGE_CHANCE)
  return Math.random() < dodgeChance
}

/**
 * 计算经验获取
 * @param monsterLevel - 怪物等级
 * @param playerLevel - 玩家等级
 * @param zoneBonus - 区域奖励倍率
 * @returns 获得的经验值
 */
export function calculateExpReward(
  monsterLevel: number,
  playerLevel: number,
  zoneBonus: number = 1.0
): number {
  // 等级差惩罚/奖励
  const levelDiff = monsterLevel - playerLevel

  let expMultiplier = 1.0
  if (levelDiff > 5) {
    // 怪物等级过高，经验减少
    expMultiplier = 0.5
  } else if (levelDiff > 2) {
    expMultiplier = 0.8
  } else if (levelDiff < -5) {
    // 怪物等级过低，经验大幅减少
    expMultiplier = 0.1
  } else if (levelDiff < -2) {
    expMultiplier = 0.5
  }

  // 基础经验 = 怪物等级 * 10
  const baseExp = monsterLevel * 10

  return Math.floor(baseExp * expMultiplier * zoneBonus)
}

/**
 * 计算金币获取
 * @param monster - 怪物
 * @param zoneBonus - 区域奖励倍率
 * @returns 获得的金币范围
 */
export function calculateGoldReward(monster: Monster, zoneBonus: number = 1.0): { min: number; max: number } {
  const { goldReward } = monster.stats
  const bonus = zoneBonus

  return {
    min: Math.floor(goldReward.min * bonus),
    max: Math.floor(goldReward.max * bonus),
  }
}

/**
 * 获取随机金币
 * @param monster - 怪物
 * @param zoneBonus - 区域奖励倍率
 * @returns 随机金币数量
 */
export function rollGoldReward(monster: Monster, zoneBonus: number = 1.0): number {
  const { min, max } = calculateGoldReward(monster, zoneBonus)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * 创建战斗事件
 * @param type - 事件类型
 * @param data - 事件数据
 * @returns 战斗事件
 */
export function createCombatEvent(
  type: CombatEvent['type'],
  data: CombatEvent['data'] = {}
): CombatEvent {
  return {
    type,
    timestamp: Date.now(),
    data,
  }
}

/**
 * 判断战斗是否结束
 * @param playerHealth - 玩家生命
 * @param enemyHealth - 敌人生命
 * @returns 战斗状态
 */
export function getCombatResult(playerHealth: number, enemyHealth: number): 'ongoing' | 'victory' | 'defeat' {
  if (enemyHealth <= 0) return 'victory'
  if (playerHealth <= 0) return 'defeat'
  return 'ongoing'
}

/**
 * 计算战斗回合时间（毫秒）
 * @param attackSpeed - 攻击速度（次/秒）
 * @returns 回合时间
 */
export function calculateAttackInterval(attackSpeed: number): number {
  if (attackSpeed <= 0) return 1000
  return Math.floor(1000 / attackSpeed)
}

/**
 * 获取元素图标
 * @param element - 元素类型
 * @returns emoji图标
 */
export function getElementIcon(element: Element): string {
  const icons: Record<Element, string> = {
    [Element.PHYSICAL]: '⚔️',
    [Element.FIRE]: '🔥',
    [Element.COLD]: '❄️',
    [Element.LIGHTNING]: '⚡',
    [Element.POISON]: '☠️',
    [Element.MAGIC]: '✨',
  }
  return icons[element]
}

/**
 * 获取伤害颜色（用于UI显示）
 * @param element - 元素类型
 * @returns CSS颜色值
 */
export function getElementColor(element: Element): string {
  const colors: Record<Element, string> = {
    [Element.PHYSICAL]: '#ffffff',
    [Element.FIRE]: '#ff4400',
    [Element.COLD]: '#00ccff',
    [Element.LIGHTNING]: '#ffff00',
    [Element.POISON]: '#00ff00',
    [Element.MAGIC]: '#cc66ff',
  }
  return colors[element]
}
