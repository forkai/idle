/**
 * @fileoverview 游戏核心类型定义
 * @description 定义游戏中使用的所有核心类型，包括角色、战斗、物品等
 */

/**
 * 角色职业枚举
 * 暗黑破坏神经典三大职业
 */
export enum CharacterClass {
  /** 战士 - 物理近战，高生命值 */
  WARRIOR = 'warrior',
  /** 法师 - 魔法远程，高伤害 */
  SORCERER = 'sorcerer',
  /** 刺客 - 物理远程/陷阱，高暴击 */
  ROGUE = 'rogue',
}

/**
 * 角色职业名称（中文映射）
 */
export const CharacterClassNames: Record<CharacterClass, string> = {
  [CharacterClass.WARRIOR]: '战士',
  [CharacterClass.SORCERER]: '法师',
  [CharacterClass.ROGUE]: '刺客',
}

/**
 * 角色职业描述
 */
export const CharacterClassDescriptions: Record<CharacterClass, string> = {
  [CharacterClass.WARRIOR]: '坚韧的近战战士，擅长使用剑和盾牌',
  [CharacterClass.SORCERER]: '强大的魔法使用者，精通元素魔法',
  [CharacterClass.ROGUE]: '敏捷的远程攻击者，擅长弓箭和陷阱',
}

/**
 * 基础属性接口
 * 影响角色的各种战斗数值
 */
export interface BaseStats {
  /** 力量 - 影响物理伤害和负重力 */
  strength: number
  /** 敏捷 - 影响攻击速度、闪避和暴击 */
  dexterity: number
  /** 体力 - 影响生命值和防御 */
  vitality: number
  /** 能量 - 影响法力值和魔法伤害 */
  energy: number
}

/**
 * 战斗属性接口
 * 角色在战斗中的实时属性
 */
export interface CombatStats {
  /** 当前生命值 */
  health: number
  /** 最大生命值 */
  maxHealth: number
  /** 当前法力值 */
  mana: number
  /** 最大法力值 */
  maxMana: number
  /** 物理伤害 */
  damage: number
  /** 防御力 */
  defense: number
  /** 攻击速度（次/秒） */
  attackSpeed: number
  /** 暴击率（0-1） */
  critChance: number
  /** 暴击伤害倍率 */
  critDamage: number
  /** 生命恢复速度（/秒） */
  healthRegen: number
  /** 法力恢复速度（/秒） */
  manaRegen: number
}

/**
 * 元素抗性接口
 */
export interface ElementalResists {
  /** 火焰抗性 */
  fireResist: number
  /** 冰冷抗性 */
  coldResist: number
  /** 闪电抗性 */
  lightningResist: number
  /** 毒素抗性 */
  poisonResist: number
}

/**
 * 完整角色属性接口
 */
export interface CharacterStats extends BaseStats, CombatStats, ElementalResists {}

/**
 * 角色等级成长属性（每级加成）
 */
export const ClassGrowthRates: Record<CharacterClass, BaseStats> = {
  [CharacterClass.WARRIOR]: {
    strength: 3,
    dexterity: 2,
    vitality: 3,
    energy: 1,
  },
  [CharacterClass.SORCERER]: {
    strength: 1,
    dexterity: 2,
    vitality: 2,
    energy: 4,
  },
  [CharacterClass.ROGUE]: {
    strength: 2,
    dexterity: 4,
    vitality: 2,
    energy: 2,
  },
}

/**
 * 创建默认基础属性
 * @param characterClass - 角色职业
 * @returns 默认基础属性值
 */
export function createDefaultBaseStats(characterClass: CharacterClass): BaseStats {
  const base: BaseStats = {
    strength: 10,
    dexterity: 10,
    vitality: 10,
    energy: 10,
  }

  // 根据职业加成
  const growth = ClassGrowthRates[characterClass]
  return {
    strength: base.strength + growth.strength * 0,
    dexterity: base.dexterity + growth.dexterity * 0,
    vitality: base.vitality + growth.vitality * 0,
    energy: base.energy + growth.energy * 0,
  }
}

/**
 * 角色等级上限
 */
export const MAX_LEVEL = 99

/**
 * 角色等级经验需求表（暗黑破坏神风格）
 * 每级所需经验 = 前一级经验 * 1.1 + 100
 */
export const LevelExpRequirements: number[] = []

// 生成经验需求表
let exp = 0
for (let level = 1; level <= MAX_LEVEL; level++) {
  if (level === 1) {
    exp = 0
  } else {
    exp = Math.floor(exp * 1.1) + 100
  }
  LevelExpRequirements.push(exp)
}

/**
 * 计算指定等级所需经验
 * @param level - 目标等级
 * @returns 所需经验值
 */
export function getExpForLevel(level: number): number {
  if (level <= 1) return 0
  if (level > MAX_LEVEL) level = MAX_LEVEL
  return LevelExpRequirements[level - 1]
}

/**
 * 计算从当前等级到目标等级所需经验
 * @param currentLevel - 当前等级
 * @param targetLevel - 目标等级
 * @returns 所需经验
 */
export function getExpBetweenLevels(currentLevel: number, targetLevel: number): number {
  return getExpForLevel(targetLevel) - getExpForLevel(currentLevel)
}
