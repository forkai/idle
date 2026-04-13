/**
 * @fileoverview 属性计算系统
 * @description 实现角色属性、装备加成、技能加成等的计算
 */

import type { CharacterStats, CharacterClass, BaseStats } from '@/types/game'
import { ClassGrowthRates, CharacterClass as CharacterClassEnum } from '@/types/game'
import type { EquipmentState, Item, EquipmentSlot } from '@/types/items'
import type { PlayerSkill, Skill } from '@/types/skills'
import { SkillType } from '@/types/skills'
import { getSkillById } from '@/constants/skills'
import { getSetById } from '@/constants/sets'

// 需要百分比的属性
const PERCENT_STATS = new Set(['attackSpeed', 'critChance', 'critDamage'])

// 应用套装奖励到属性
function applySetBonus(stats: CharacterStats, key: string, value: number) {
  const isPercent = PERCENT_STATS.has(key)
  const actualValue = isPercent ? value / 100 : value
  ;(stats as any)[key] = ((stats as any)[key] || 0) + actualValue
}

/**
 * 属性计算常量
 */
export const STATS_CONFIG = {
  /** 基础生命值 */
  BASE_HEALTH: 50,
  /** 基础法力值 */
  BASE_MANA: 25,
  /** 每点体力增加的生命 */
  HEALTH_PER_VITALITY: 10,
  /** 每点能量增加的法力 */
  MANA_PER_ENERGY: 5,
  /** 每点力量增加的伤害 */
  DAMAGE_PER_STRENGTH: 1,
  /** 每点敏捷增加的防御 */
  DEFENSE_PER_DEXTERITY: 0.5,
  /** 每点体力增加的防御 */
  DEFENSE_PER_VITALITY: 0.3,
  /** 基础攻击速度 */
  BASE_ATTACK_SPEED: 1.0,
  /** 每点敏捷增加的攻击速度 */
  ATTACK_SPEED_PER_DEXTERITY: 0.01,
  /** 基础暴击率 */
  BASE_CRIT_CHANCE: 0.05,
  /** 每点敏捷增加的暴击率 */
  CRIT_PER_DEXTERITY: 0.002,
  /** 基础暴击伤害 */
  BASE_CRIT_DAMAGE: 1.5,
  /** 每点敏捷增加的暴击伤害 */
  CRIT_DAMAGE_PER_DEXTERITY: 0.02,
  /** 基础生命恢复 */
  BASE_HEALTH_REGEN: 1,
  /** 每点体力增加的生命恢复 */
  HEALTH_REGEN_PER_VITALITY: 0.2,
  /** 基础法力恢复 */
  BASE_MANA_REGEN: 0.5,
  /** 每点能量增加的法力恢复 */
  MANA_REGEN_PER_ENERGY: 0.1,
  /** 基础元素抗性 */
  BASE_RESIST: 0,
}

/**
 * 默认角色属性
 */
export const DEFAULT_CHARACTER_STATS: CharacterStats = {
  // 基础属性
  strength: 10,
  dexterity: 10,
  vitality: 10,
  energy: 10,
  // 战斗属性
  health: 50,
  maxHealth: 50,
  mana: 25,
  maxMana: 25,
  damage: 5,
  defense: 2,
  attackSpeed: 1.0,
  critChance: 0.05,
  critDamage: 1.5,
  healthRegen: 1,
  manaRegen: 0.5,
  // 元素抗性
  fireResist: 0,
  coldResist: 0,
  lightningResist: 0,
  poisonResist: 0,
}

/**
 * 根据职业创建初始属性
 * @param classId - 职业ID
 * @returns 初始基础属性
 */
export function createInitialStats(classId: CharacterClass): BaseStats {
  const growth = ClassGrowthRates[classId]

  return {
    strength: 10 + growth.strength,
    dexterity: 10 + growth.dexterity,
    vitality: 10 + growth.vitality,
    energy: 10 + growth.energy,
  }
}

/**
 * 计算完整角色属性
 * @param baseStats - 基础属性
 * @param level - 等级
 * @param equipment - 装备状态
 * @param skills - 技能列表
 * @returns 完整角色属性
 */
export function calculateCharacterStats(
  baseStats: BaseStats,
  level: number,
  equipment: EquipmentState,
  skills: PlayerSkill[]
): CharacterStats {
  // 从基础属性开始
  let stats: CharacterStats = {
    ...baseStats,
    ...DEFAULT_CHARACTER_STATS,
  }

  // 应用等级成长
  stats = applyLevelGrowth(stats, baseStats, level)

  // 应用装备加成
  stats = applyEquipmentBonuses(stats, equipment)

  // 应用技能加成
  stats = applySkillBonuses(stats, skills)

  // 确保属性在合理范围内
  stats.critChance = Math.max(0, Math.min(stats.critChance, 1))
  stats.attackSpeed = Math.max(0.1, Math.min(stats.attackSpeed, 5))

  return stats
}

/**
 * 应用等级成长
 * @param stats - 当前属性
 * @param baseStats - 基础属性
 * @param level - 等级
 * @returns 更新后的属性
 */
function applyLevelGrowth(stats: CharacterStats, baseStats: BaseStats, level: number): CharacterStats {
  // 每级获得的属性点
  const pointsPerLevel = 5
  const totalPoints = (level - 1) * pointsPerLevel

  // 根据职业分配属性点
  const growth = ClassGrowthRates[getClassFromStats(baseStats)]

  // 计算当前属性（包括已分配的和职业成长的）
  const currentLevel = level

  stats.strength = baseStats.strength + growth.strength * (currentLevel - 1)
  stats.dexterity = baseStats.dexterity + growth.dexterity * (currentLevel - 1)
  stats.vitality = baseStats.vitality + growth.vitality * (currentLevel - 1)
  stats.energy = baseStats.energy + growth.energy * (currentLevel - 1)

  // 计算派生属性
  stats.maxHealth = STATS_CONFIG.BASE_HEALTH + stats.vitality * STATS_CONFIG.HEALTH_PER_VITALITY
  stats.maxMana = STATS_CONFIG.BASE_MANA + stats.energy * STATS_CONFIG.MANA_PER_ENERGY
  stats.damage = stats.strength * STATS_CONFIG.DAMAGE_PER_STRENGTH + 5
  stats.defense = stats.dexterity * STATS_CONFIG.DEFENSE_PER_DEXTERITY + stats.vitality * STATS_CONFIG.DEFENSE_PER_VITALITY + 2
  stats.attackSpeed = STATS_CONFIG.BASE_ATTACK_SPEED + stats.dexterity * STATS_CONFIG.ATTACK_SPEED_PER_DEXTERITY
  stats.critChance = STATS_CONFIG.BASE_CRIT_CHANCE + stats.dexterity * STATS_CONFIG.CRIT_PER_DEXTERITY
  stats.critDamage = STATS_CONFIG.BASE_CRIT_DAMAGE + stats.dexterity * STATS_CONFIG.CRIT_DAMAGE_PER_DEXTERITY
  stats.healthRegen = STATS_CONFIG.BASE_HEALTH_REGEN + stats.vitality * STATS_CONFIG.HEALTH_REGEN_PER_VITALITY
  stats.manaRegen = STATS_CONFIG.BASE_MANA_REGEN + stats.energy * STATS_CONFIG.MANA_REGEN_PER_ENERGY

  // 同步当前生命/法力为最大值
  stats.health = stats.maxHealth
  stats.mana = stats.maxMana

  return stats
}

/**
 * 从基础属性推断职业
 */
function getClassFromStats(baseStats: BaseStats): CharacterClass {
  // 简单判断：比较各项属性
  const values = [
    { class: CharacterClassEnum.WARRIOR, value: baseStats.strength + baseStats.vitality },
    { class: CharacterClassEnum.SORCERER, value: baseStats.energy + baseStats.vitality },
    { class: CharacterClassEnum.ROGUE, value: baseStats.dexterity + baseStats.vitality },
  ]
  return values.sort((a, b) => b.value - a.value)[0].class
}

/**
 * 应用装备加成
 * @param stats - 当前属性
 * @param equipment - 装备状态
 * @returns 更新后的属性
 */
function applyEquipmentBonuses(stats: CharacterStats, equipment: EquipmentState): CharacterStats {
  const newStats = { ...stats }

  // 统计套装装备数量
  const setCounts: Record<string, number> = {}

  // 遍历所有装备槽位
  for (const slot of Object.keys(equipment) as EquipmentSlot[]) {
    const item = equipment[slot]
    if (!item) continue

    // 统计套装
    if (item.setId) {
      setCounts[item.setId] = (setCounts[item.setId] || 0) + 1
    }

    // 应用物品词缀效果
    for (const affix of item.affixes) {
      const effects = affix.effects

      if (effects.strength) newStats.strength += effects.strength
      if (effects.dexterity) newStats.dexterity += effects.dexterity
      if (effects.vitality) newStats.vitality += effects.vitality
      if (effects.energy) newStats.energy += effects.energy
      if (effects.damage) newStats.damage += effects.damage
      if (effects.defense) newStats.defense += effects.defense
      if (effects.health) newStats.maxHealth += effects.health
      if (effects.mana) newStats.maxMana += effects.mana
      if (effects.attackSpeed) newStats.attackSpeed += effects.attackSpeed
      if (effects.critChance) newStats.critChance += effects.critChance
      if (effects.critDamage) newStats.critDamage += effects.critDamage
      if (effects.fireResist) newStats.fireResist += effects.fireResist
      if (effects.coldResist) newStats.coldResist += effects.coldResist
      if (effects.lightningResist) newStats.lightningResist += effects.lightningResist
      if (effects.poisonResist) newStats.poisonResist += effects.poisonResist
    }

    // 应用物品基础属性
    if (item.stats.damage) newStats.damage += item.stats.damage
    if (item.stats.defense) newStats.defense += item.stats.defense
  }

  // 应用套装奖励
  for (const [setId, count] of Object.entries(setCounts)) {
    const set = getSetById(setId)
    if (!set) continue

    for (const bonus of set.bonuses) {
      if (bonus.threshold <= count) {
        const eff = bonus.effects
        for (const [key, value] of Object.entries(eff)) {
          if (key !== 'damagePercent' && key !== 'healthRegenPercent' && key !== 'allElementDamage' && key !== 'damageToDragon' && key !== 'dodge' && key !== 'deathResist' && key !== 'onDeathRevive' && key !== 'freezeChance') {
            const numValue = typeof value === 'number' ? value : 0
            const statKey = key as keyof CharacterStats
            if (statKey in newStats) {
              applySetBonus(newStats, statKey, numValue)
            }
          }
        }
      }
    }
  }

  // 重新计算派生属性
  newStats.damage = newStats.strength * STATS_CONFIG.DAMAGE_PER_STRENGTH + 5 + getEquipmentDamageBonus(equipment)
  newStats.defense = newStats.dexterity * STATS_CONFIG.DEFENSE_PER_DEXTERITY +
    newStats.vitality * STATS_CONFIG.DEFENSE_PER_VITALITY + 2 +
    getEquipmentDefenseBonus(equipment)
  newStats.maxHealth = STATS_CONFIG.BASE_HEALTH + newStats.vitality * STATS_CONFIG.HEALTH_PER_VITALITY + getEquipmentHealthBonus(equipment)
  newStats.maxMana = STATS_CONFIG.BASE_MANA + newStats.energy * STATS_CONFIG.MANA_PER_ENERGY + getEquipmentManaBonus(equipment)
  newStats.attackSpeed = STATS_CONFIG.BASE_ATTACK_SPEED + newStats.dexterity * STATS_CONFIG.ATTACK_SPEED_PER_DEXTERITY
  newStats.critChance = STATS_CONFIG.BASE_CRIT_CHANCE + newStats.dexterity * STATS_CONFIG.CRIT_PER_DEXTERITY
  newStats.critDamage = STATS_CONFIG.BASE_CRIT_DAMAGE + newStats.dexterity * STATS_CONFIG.CRIT_DAMAGE_PER_DEXTERITY

  // 当前生命/法力不超过最大值
  newStats.health = Math.min(newStats.health, newStats.maxHealth)
  newStats.mana = Math.min(newStats.mana, newStats.maxMana)

  return newStats
}

/**
 * 获取装备提供的额外伤害加成
 */
function getEquipmentDamageBonus(equipment: EquipmentState): number {
  let bonus = 0
  for (const item of Object.values(equipment)) {
    if (item?.stats.damage) bonus += item.stats.damage
  }
  return bonus
}

/**
 * 获取装备提供的额外防御加成
 */
function getEquipmentDefenseBonus(equipment: EquipmentState): number {
  let bonus = 0
  for (const item of Object.values(equipment)) {
    if (item?.stats.defense) bonus += item.stats.defense
  }
  return bonus
}

/**
 * 获取装备提供的额外生命加成
 */
function getEquipmentHealthBonus(equipment: EquipmentState): number {
  let bonus = 0
  for (const item of Object.values(equipment)) {
    if (item) {
      for (const affix of item.affixes) {
        if (affix.effects.health) bonus += affix.effects.health
      }
    }
  }
  return bonus
}

/**
 * 获取装备提供的额外法力加成
 */
function getEquipmentManaBonus(equipment: EquipmentState): number {
  let bonus = 0
  for (const item of Object.values(equipment)) {
    if (item) {
      for (const affix of item.affixes) {
        if (affix.effects.mana) bonus += affix.effects.mana
      }
    }
  }
  return bonus
}

/**
 * 应用技能加成
 * @param stats - 当前属性
 * @param skills - 技能列表
 * @returns 更新后的属性
 */
function applySkillBonuses(stats: CharacterStats, skills: PlayerSkill[]): CharacterStats {
  const newStats = { ...stats }

  for (const playerSkill of skills) {
    if (!playerSkill.unlocked) continue

    const skill = getSkillById(playerSkill.skillId)
    if (!skill) continue

    // 被动技能效果
    if (skill.type === SkillType.PASSIVE) {
      // 根据技能ID应用特定加成（因为effect数据不够详细）
      const level = playerSkill.level

      switch (skill.id) {
        case 'warrior_weapon_mastery':
        case 'sorcerer_fire_mastery':
        case 'sorcerer_cold_mastery':
        case 'rogue_markmanship':
          // 武器/元素精通类：增加伤害
          newStats.damage = Math.floor(newStats.damage * (1 + skill.effects[0]?.value * level))
          break

        case 'warrior_increased_endurance':
          // 增强耐力：增加最大生命值
          newStats.maxHealth = Math.floor(newStats.maxHealth * (1 + skill.effects[0]?.value * level))
          break

        case 'rogue_evade':
          // 闪避：增加闪避率（攻击速度略微提升）
          newStats.attackSpeed = Math.min(5, newStats.attackSpeed * (1 + skill.effects[0]?.value * level * 0.3))
          break

        default:
          // 默认：应用伤害和攻速加成
          for (const effect of skill.effects) {
            if (effect.type === 'buff') {
              newStats.damage = Math.floor(newStats.damage * (1 + effect.value * level))
              newStats.attackSpeed = Math.min(5, newStats.attackSpeed * (1 + effect.value * level * 0.5))
            }
          }
      }
    }
  }

  return newStats
}

/**
 * 计算每秒属性值
 * @param stats - 角色属性
 * @returns 每秒恢复量
 */
export function calculatePerSecondStats(stats: CharacterStats): { healthPerSecond: number; manaPerSecond: number } {
  return {
    healthPerSecond: stats.healthRegen,
    manaPerSecond: stats.manaRegen,
  }
}

/**
 * 获取属性变化描述
 * @param before - 变化前的属性
 * @param after - 变化后的属性
 * @returns 变化描述数组
 */
export function getStatChanges(before: CharacterStats, after: CharacterStats): { stat: string; change: number }[] {
  const changes: { stat: string; change: number }[] = []

  if (before.damage !== after.damage) {
    changes.push({ stat: '伤害', change: after.damage - before.damage })
  }
  if (before.defense !== after.defense) {
    changes.push({ stat: '防御', change: Math.round((after.defense - before.defense) * 10) / 10 })
  }
  if (before.maxHealth !== after.maxHealth) {
    changes.push({ stat: '生命', change: after.maxHealth - before.maxHealth })
  }
  if (before.maxMana !== after.maxMana) {
    changes.push({ stat: '法力', change: after.maxMana - before.maxMana })
  }
  if (before.critChance !== after.critChance) {
    changes.push({ stat: '暴击率', change: Math.round((after.critChance - before.critChance) * 100) })
  }
  if (before.attackSpeed !== after.attackSpeed) {
    changes.push({ stat: '攻速', change: Math.round((after.attackSpeed - before.attackSpeed) * 100) })
  }

  return changes
}
