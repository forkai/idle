/**
 * @fileoverview 装备强化系统常量
 * @description 定义强化材料、强化成功率、强化效果等
 */

/**
 * 强化石类型
 */
export enum EnhancementStoneType {
  /** 普通强化石 */
  NORMAL = 'normal',
  /** 高级强化石 */
  ADVANCED = 'advanced',
  /** 完美强化石 */
  PERFECT = 'perfect',
}

/**
 * 强化石名称
 */
export const EnhancementStoneNames: Record<EnhancementStoneType, string> = {
  [EnhancementStoneType.NORMAL]: '强化石',
  [EnhancementStoneType.ADVANCED]: '高级强化石',
  [EnhancementStoneType.PERFECT]: '完美强化石',
}

/**
 * 强化等级配置
 */
export interface EnhancementLevelConfig {
  /** 成功时基础属性提升百分比 */
  statBonusPercent: number
  /** 使用普通强化石成功率 */
  normalSuccessRate: number
  /** 使用高级强化石成功率 */
  advancedSuccessRate: number
  /** 使用完美强化石成功率 */
  perfectSuccessRate: number
  /** 失败时损坏几率 */
  breakChance: number
  /** 降级几率 */
  degradeChance: number
  /** 所需金币 */
  goldCost: number
  /** 所需强化石数量 */
  stoneCost: number
}

/**
 * 强化等级配置表（0-15级）
 */
export const ENHANCEMENT_CONFIG: Record<number, EnhancementLevelConfig> = {
  0: { statBonusPercent: 0, normalSuccessRate: 100, advancedSuccessRate: 100, perfectSuccessRate: 100, breakChance: 0, degradeChance: 0, goldCost: 100, stoneCost: 1 },
  1: { statBonusPercent: 5, normalSuccessRate: 95, advancedSuccessRate: 98, perfectSuccessRate: 100, breakChance: 0, degradeChance: 0, goldCost: 200, stoneCost: 1 },
  2: { statBonusPercent: 10, normalSuccessRate: 90, advancedSuccessRate: 96, perfectSuccessRate: 100, breakChance: 0, degradeChance: 0, goldCost: 400, stoneCost: 2 },
  3: { statBonusPercent: 15, normalSuccessRate: 85, advancedSuccessRate: 94, perfectSuccessRate: 100, breakChance: 0, degradeChance: 0, goldCost: 800, stoneCost: 2 },
  4: { statBonusPercent: 20, normalSuccessRate: 80, advancedSuccessRate: 92, perfectSuccessRate: 100, breakChance: 0, degradeChance: 0, goldCost: 1500, stoneCost: 3 },
  5: { statBonusPercent: 25, normalSuccessRate: 75, advancedSuccessRate: 90, perfectSuccessRate: 100, breakChance: 5, degradeChance: 0, goldCost: 3000, stoneCost: 3 },
  6: { statBonusPercent: 30, normalSuccessRate: 70, advancedSuccessRate: 88, perfectSuccessRate: 100, breakChance: 8, degradeChance: 10, goldCost: 5000, stoneCost: 4 },
  7: { statBonusPercent: 35, normalSuccessRate: 65, advancedSuccessRate: 85, perfectSuccessRate: 100, breakChance: 10, degradeChance: 15, goldCost: 8000, stoneCost: 4 },
  8: { statBonusPercent: 40, normalSuccessRate: 60, advancedSuccessRate: 82, perfectSuccessRate: 100, breakChance: 12, degradeChance: 20, goldCost: 12000, stoneCost: 5 },
  9: { statBonusPercent: 45, normalSuccessRate: 55, advancedSuccessRate: 80, perfectSuccessRate: 100, breakChance: 15, degradeChance: 25, goldCost: 18000, stoneCost: 5 },
  10: { statBonusPercent: 50, normalSuccessRate: 50, advancedSuccessRate: 77, perfectSuccessRate: 100, breakChance: 18, degradeChance: 30, goldCost: 25000, stoneCost: 6 },
  11: { statBonusPercent: 55, normalSuccessRate: 45, advancedSuccessRate: 74, perfectSuccessRate: 100, breakChance: 20, degradeChance: 35, goldCost: 35000, stoneCost: 6 },
  12: { statBonusPercent: 60, normalSuccessRate: 40, advancedSuccessRate: 70, perfectSuccessRate: 100, breakChance: 22, degradeChance: 40, goldCost: 50000, stoneCost: 7 },
  13: { statBonusPercent: 65, normalSuccessRate: 35, advancedSuccessRate: 65, perfectSuccessRate: 100, breakChance: 25, degradeChance: 45, goldCost: 70000, stoneCost: 7 },
  14: { statBonusPercent: 70, normalSuccessRate: 30, advancedSuccessRate: 60, perfectSuccessRate: 100, breakChance: 28, degradeChance: 50, goldCost: 100000, stoneCost: 8 },
  15: { statBonusPercent: 75, normalSuccessRate: 25, advancedSuccessRate: 55, perfectSuccessRate: 100, breakChance: 30, degradeChance: 55, goldCost: 150000, stoneCost: 10 },
}

/**
 * 强化结果类型
 */
export enum EnhancementResult {
  /** 成功 */
  SUCCESS = 'success',
  /** 失败（降级） */
  DEGRADE = 'degrade',
  /** 失败（损坏） */
  BREAK = 'break',
  /** 材料不足 */
  INSUFFICIENT_MATERIALS = 'insufficient_materials',
  /** 已达最大等级 */
  MAX_LEVEL = 'max_level',
}

/**
 * 强化结果信息
 */
export const ENHANCEMENT_RESULT_INFO: Record<EnhancementResult, { message: string; color: string }> = {
  [EnhancementResult.SUCCESS]: { message: '强化成功！', color: 'text-green-400' },
  [EnhancementResult.DEGRADE]: { message: '强化失败... 等级下降！', color: 'text-yellow-400' },
  [EnhancementResult.BREAK]: { message: '装备损坏了！', color: 'text-red-400' },
  [EnhancementResult.INSUFFICIENT_MATERIALS]: { message: '材料不足！', color: 'text-red-400' },
  [EnhancementResult.MAX_LEVEL]: { message: '已达最大强化等级！', color: 'text-blue-400' },
}

/**
 * 获取强化成功率
 * @param currentLevel - 当前强化等级
 * @param stoneType - 强化石类型
 * @returns 成功率（0-1）
 */
export function getEnhancementSuccessRate(currentLevel: number, stoneType: EnhancementStoneType): number {
  const config = ENHANCEMENT_CONFIG[currentLevel]
  if (!config) return 0

  switch (stoneType) {
    case EnhancementStoneType.NORMAL:
      return config.normalSuccessRate / 100
    case EnhancementStoneType.ADVANCED:
      return config.advancedSuccessRate / 100
    case EnhancementStoneType.PERFECT:
      return config.perfectSuccessRate / 100
    default:
      return 0
  }
}

/**
 * 计算强化后属性加成
 * @param baseItem - 基础物品
 * @param level - 强化等级
 * @returns 强化加成百分比
 */
export function calculateEnhancementBonus(level: number): number {
  const config = ENHANCEMENT_CONFIG[level]
  if (!config) return 0
  return config.statBonusPercent / 100
}

/**
 * 强化最大等级
 */
export const MAX_ENHANCEMENT_LEVEL = 15
