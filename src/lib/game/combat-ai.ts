/**
 * @fileoverview 战斗AI系统
 * @description 实现怪物AI行为、BOSS特殊技能、元素反应
 */

import type { Monster, MonsterAbility, MonsterType } from '@/types/enemy'
import { Element } from '@/types/combat'
import { cond, condAny, always } from '@/lib/fn'

/**
 * 元素反应类型
 */
export type ElementReaction =
  | 'vaporize'     // 蒸发：火+冰
  | 'freeze'       // 冻结：冰+水
  | 'shock'        // 感电：水+电
  | 'burn'         // 燃烧：火+毒
  | 'melt'         // 融化：火+金属
  | 'supercharge'  // 过载：电+火
  | 'none'         // 无反应

/**
 * 元素反应配置
 */
export const ELEMENT_REACTIONS: Record<string, ElementReaction> = {
  'fire+cold': 'vaporize',
  'cold+fire': 'vaporize',
  'fire+lightning': 'supercharge',
  'lightning+fire': 'supercharge',
  'fire+poison': 'burn',
  'poison+fire': 'burn',
}

/**
 * 元素反应效果
 */
export const REACTION_EFFECTS: Record<ElementReaction, { bonusDamage: number; description: string }> = {
  vaporize: { bonusDamage: 1.5, description: '蒸发：蒸汽爆炸造成额外50%伤害' },
  freeze: { bonusDamage: 1.3, description: '冻结：目标减速30%，持续2秒' },
  shock: { bonusDamage: 1.4, description: '感电：电流扩散造成额外40%伤害' },
  burn: { bonusDamage: 1.2, description: '燃烧：灼烧效果，每秒造成10%伤害，持续3秒' },
  melt: { bonusDamage: 1.6, description: '融化：金属融化造成额外60%伤害' },
  supercharge: { bonusDamage: 1.8, description: '过载：能量过载造成额外80%伤害' },
  none: { bonusDamage: 1.0, description: '' },
}

/**
 * AI行为类型
 */
export enum AIBehavior {
  /** 普通攻击型 */
  AGGRESSIVE = 'aggressive',
  /** 防御型 */
  DEFENSIVE = 'defensive',
  /** 均衡型 */
  BALANCED = 'balanced',
  /** BOSS型 */
  BOSS = 'boss',
  /** 治疗型 */
  HEALER = 'healer',
}

/**
 * AI行为配置
 */
export const AI_BEHAVIORS: Record<AIBehavior, { attackChance: number; abilityChance: number; healThreshold: number }> = {
  [AIBehavior.AGGRESSIVE]: { attackChance: 0.8, abilityChance: 0.3, healThreshold: 0.3 },
  [AIBehavior.DEFENSIVE]: { attackChance: 0.5, abilityChance: 0.4, healThreshold: 0.5 },
  [AIBehavior.BALANCED]: { attackChance: 0.65, abilityChance: 0.35, healThreshold: 0.4 },
  [AIBehavior.BOSS]: { attackChance: 0.9, abilityChance: 0.5, healThreshold: 0.25 },
  [AIBehavior.HEALER]: { attackChance: 0.4, abilityChance: 0.6, healThreshold: 0.6 },
}

/**
 * AI决策结果
 */
export interface AIDecision {
  action: 'attack' | 'ability' | 'heal' | 'buff' | 'debuff' | 'flee'
  ability?: MonsterAbility
  target?: 'player' | 'self'
  reasoning: string
}

/**
 * 计算元素反应
 */
export function calculateElementReaction(
  elements: Element[],
  currentEffects: Element[]
): { reaction: ElementReaction; bonusDamage: number } {
  if (elements.length < 2 || currentEffects.length === 0) {
    return { reaction: 'none', bonusDamage: 1.0 }
  }

  for (const element of elements) {
    for (const effect of currentEffects) {
      const key = `${element}+${effect}`
      const reaction = ELEMENT_REACTIONS[key]
      if (reaction) {
        const effectConfig = REACTION_EFFECTS[reaction]
        return { reaction, bonusDamage: effectConfig.bonusDamage }
      }
    }
  }

  return { reaction: 'none', bonusDamage: 1.0 }
}

/**
 * 根据怪物类型判断AI行为
 */
export function getAIMonsterBehavior(type: MonsterType): AIBehavior {
  return condAny<MonsterType, AIBehavior>([
    [() => type === 'boss', () => AIBehavior.BOSS],
    [() => type === 'undead', () => AIBehavior.DEFENSIVE],
    [() => type === 'elemental', () => AIBehavior.AGGRESSIVE],
    [() => type === 'demon', () => AIBehavior.AGGRESSIVE],
    [() => type === 'beast', () => AIBehavior.BALANCED],
    [() => true, () => AIBehavior.BALANCED],
  ])(type)
}

/**
 * 决定是否使用技能
 */
export function shouldUseAbility(
  monster: Monster,
  healthPercent: number,
  behavior: AIBehavior
): MonsterAbility | null {
  const config = AI_BEHAVIORS[behavior]
  const availableAbilities = monster.abilities.filter(a => a.triggerChance >= Math.random())

  if (availableAbilities.length === 0) return null

  // 检查是否应该治疗
  if (healthPercent < config.healThreshold) {
    const healAbility = availableAbilities.find(a => a.effectType === 'heal' || a.effectType === 'buff')
    if (healAbility) return healAbility
  }

  // 检查是否应该使用debuff
  if (Math.random() < config.abilityChance * 0.3) {
    const debuffAbility = availableAbilities.find(a => a.effectType === 'debuff')
    if (debuffAbility) return debuffAbility
  }

  // 根据行为决定
  return condAny<AIBehavior, MonsterAbility | null>([
    [() => behavior === AIBehavior.AGGRESSIVE && Math.random() < config.abilityChance, () =>
      availableAbilities.find(a => a.effectType === 'damage') || null],
    [() => behavior === AIBehavior.BOSS && Math.random() < config.abilityChance, () => {
      // BOSS优先使用强力技能
      const sorted = [...availableAbilities].sort((a, b) => b.effectValue - a.effectValue)
      return sorted[0] || null
    }],
    [() => behavior === AIBehavior.HEALER && Math.random() < config.abilityChance * 1.5, () =>
      availableAbilities.find(a => a.effectType === 'heal') || null],
    [() => Math.random() < config.abilityChance, () =>
      availableAbilities[Math.floor(Math.random() * availableAbilities.length)] || null],
    [() => true, () => null],
  ])(behavior)
}

/**
 * 生成AI决策
 */
export function makeAIDecision(
  monster: Monster,
  healthPercent: number,
  playerHealthPercent: number,
  hasAggro: boolean = false
): AIDecision {
  const behavior = getAIMonsterBehavior(monster.type)
  const config = AI_BEHAVIORS[behavior]

  // 检查是否可以使用技能
  const ability = shouldUseAbility(monster, healthPercent, behavior)
  if (ability) {
    return {
      action: ability.effectType === 'heal' || ability.effectType === 'buff' ? ability.effectType : 'ability',
      ability,
      target: ability.effectType === 'heal' ? 'self' : 'player',
      reasoning: `${monster.name} 使用技能 ${ability.name}`,
    }
  }

  // 决定普通攻击
  if (Math.random() < config.attackChance) {
    // 逃跑判定（低血量时）
    if (healthPercent < 0.2 && Math.random() < 0.2) {
      return {
        action: 'flee',
        reasoning: `${monster.name} 试图逃跑`,
      }
    }

    return {
      action: 'attack',
      reasoning: `${monster.name} 进行普通攻击`,
    }
  }

  return {
    action: 'debuff',
    reasoning: `${monster.name} 等待时机`,
  }
}

/**
 * 计算BOSS特殊技能效果
 */
export function applyBossAbility(
  monster: Monster,
  ability: MonsterAbility,
  playerState: { health: number; maxHealth: number }
): { damage: number; healing: number; effects: Record<string, number> } {
  const effects: Record<string, number> = {}

  switch (ability.effectType) {
    case 'damage':
      // 伤害技能根据BOSS等级提升
      const damage = ability.effectValue * (1 + monster.level * 0.1)
      return { damage, healing: 0, effects }

    case 'heal':
      const healing = ability.effectValue * (1 + monster.level * 0.1)
      return { damage: 0, healing, effects: { healthRegen: healing } }

    case 'buff':
      effects[ability.id] = ability.effectValue
      return { damage: 0, healing: 0, effects }

    case 'debuff':
      effects.debuff = ability.effectValue
      return { damage: ability.effectValue * 0.5, healing: 0, effects }

    case 'summon':
      // 召唤逻辑（预留）
      return { damage: 0, healing: 0, effects: { summon: ability.effectValue } }

    default:
      return { damage: ability.effectValue, healing: 0, effects }
  }
}

/**
 * 检查元素反应并计算额外伤害
 */
export function checkElementalReaction(
  attackElement: Element | null,
  targetResists: { fire: number; cold: number; lightning: number; poison: number },
  currentEffects: Element[]
): { bonusDamage: number; reactionDesc: string } {
  if (!attackElement || currentEffects.length === 0) {
    return { bonusDamage: 1.0, reactionDesc: '' }
  }

  const reactionKey = `${attackElement}+${currentEffects[0]}`
  const reaction = ELEMENT_REACTIONS[reactionKey]

  if (!reaction) {
    return { bonusDamage: 1.0, reactionDesc: '' }
  }

  const reactionInfo = REACTION_EFFECTS[reaction]

  // 根据目标抗性减少效果
  let resistancePenalty = 1.0
  if (attackElement === Element.FIRE) resistancePenalty = 1 - targetResists.fire / 100
  if (attackElement === Element.COLD) resistancePenalty = 1 - targetResists.cold / 100
  if (attackElement === Element.LIGHTNING) resistancePenalty = 1 - targetResists.lightning / 100
  if (attackElement === Element.POISON) resistancePenalty = 1 - targetResists.poison / 100

  return {
    bonusDamage: reactionInfo.bonusDamage * Math.max(0.5, resistancePenalty),
    reactionDesc: reactionInfo.description,
  }
}

/**
 * 获取怪物的元素类型
 */
export function getMonsterElement(monster: Monster): Element | null {
  // 根据怪物名称或描述判断元素
  const name = monster.name.toLowerCase()
  const desc = monster.description.toLowerCase()

  if (name.includes('火') || name.includes('fire') || desc.includes('火焰')) return Element.FIRE
  if (name.includes('冰') || name.includes('frost') || desc.includes('冰霜')) return Element.COLD
  if (name.includes('电') || name.includes('雷') || name.includes('shock')) return Element.LIGHTNING
  if (name.includes('毒') || name.includes('poison')) return Element.POISON

  return null
}
