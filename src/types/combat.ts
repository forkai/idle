/**
 * @fileoverview 战斗系统类型定义
 * @description 定义战斗相关的类型和接口
 */

/**
 * 元素类型枚举
 */
export enum Element {
  /** 物理伤害 */
  PHYSICAL = 'physical',
  /** 火焰伤害 */
  FIRE = 'fire',
  /** 冰冷伤害 */
  COLD = 'cold',
  /** 闪电伤害 */
  LIGHTNING = 'lightning',
  /** 毒素伤害 */
  POISON = 'poison',
  /** 魔法伤害 */
  MAGIC = 'magic',
}

/**
 * 元素名称（中文）
 */
export const ElementNames: Record<Element, string> = {
  [Element.PHYSICAL]: '物理',
  [Element.FIRE]: '火焰',
  [Element.COLD]: '冰冷',
  [Element.LIGHTNING]: '闪电',
  [Element.POISON]: '毒素',
  [Element.MAGIC]: '魔法',
}

/**
 * 伤害结果接口
 */
export interface DamageResult {
  /** 原始伤害 */
  baseDamage: number
  /** 最终伤害（计算各种减免后） */
  finalDamage: number
  /** 是否暴击 */
  isCrit: boolean
  /** 元素类型 */
  element: Element
  /** 伤害来源技能名称 */
  skillName?: string
}

/**
 * 战斗事件类型
 */
export enum CombatEventType {
  /** 攻击事件 */
  ATTACK = 'attack',
  /** 受到伤害事件 */
  DAMAGED = 'damaged',
  /** 击杀事件 */
  KILL = 'kill',
  /** 升级事件 */
  LEVEL_UP = 'level_up',
  /** 获得物品事件 */
  LOOT = 'loot',
  /** 施放技能事件 */
  CAST_SKILL = 'cast_skill',
  /** 死亡事件 */
  DEATH = 'death',
  /** 复活事件 */
  REVIVE = 'revive',
}

/**
 * 战斗事件接口
 */
export interface CombatEvent {
  /** 事件类型 */
  type: CombatEventType
  /** 事件时间戳 */
  timestamp: number
  /** 事件数据 */
  data: {
    damage?: DamageResult
    targetId?: string
    targetName?: string
    skillId?: string
    itemId?: string
    expGained?: number
    level?: number
  }
}

/**
 * 战斗状态枚举
 */
export enum CombatState {
  /** 空闲 */
  IDLE = 'idle',
  /** 战斗中 */
  FIGHTING = 'fighting',
  /** 胜利 */
  VICTORY = 'victory',
  /** 失败 */
  DEFEAT = 'defeat',
  /** 逃跑中 */
  FLEEING = 'fleeing',
}

/**
 * 战斗配置接口
 */
export interface CombatConfig {
  /** 战斗速度（1 = 正常速度） */
  speed: number
  /** 是否自动攻击 */
  autoAttack: boolean
  /** 是否自动拾取 */
  autoLoot: boolean
  /** 自动使用药水血量阈值 */
  autoPotionThreshold: number
}

/**
 * 默认战斗配置
 */
export const DEFAULT_COMBAT_CONFIG: CombatConfig = {
  speed: 1,
  autoAttack: true,
  autoLoot: true,
  autoPotionThreshold: 0.3,
}
