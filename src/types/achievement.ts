/**
 * @fileoverview 成就系统类型定义
 * @description 定义成就、成就类别、成就奖励等相关类型
 */

/**
 * 成就类别枚举
 */
export enum AchievementCategory {
  /** 战斗类 */
  COMBAT = 'combat',
  /** 收集类 */
  COLLECTION = 'collection',
  /** 探索类 */
  EXPLORATION = 'exploration',
  /** 强化类 */
  ENHANCEMENT = 'enhancement',
  /** 技能类 */
  SKILLS = 'skills',
  /** 经济类 */
  ECONOMY = 'economy',
  /** 社交类 */
  SOCIAL = 'social',
  /** 特殊类 */
  SPECIAL = 'special',
}

/**
 * 成就类别名称和图标
 */
export const AchievementCategoryInfo: Record<AchievementCategory, { name: string; icon: string }> = {
  [AchievementCategory.COMBAT]: { name: '战斗', icon: '⚔️' },
  [AchievementCategory.COLLECTION]: { name: '收集', icon: '📦' },
  [AchievementCategory.EXPLORATION]: { name: '探索', icon: '🗺️' },
  [AchievementCategory.ENHANCEMENT]: { name: '强化', icon: '🔨' },
  [AchievementCategory.SKILLS]: { name: '技能', icon: '⚡' },
  [AchievementCategory.ECONOMY]: { name: '经济', icon: '💰' },
  [AchievementCategory.SOCIAL]: { name: '社交', icon: '👥' },
  [AchievementCategory.SPECIAL]: { name: '特殊', icon: '🏆' },
}

/**
 * JSON格式的成就数据（用于数据驱动）
 */
export interface AchievementJson {
  id: string
  name: string
  description: string
  icon: string
  category: string
  conditionType: string
  conditionTarget: number
  rewardGold?: number
  rewardExp?: number
  rewardEnhancementStone?: 'normal' | 'advanced' | 'perfect'
  rewardEnhancementStoneCount?: number
}

/**
 * 成就奖励类型
 */
export interface AchievementReward {
  /** 金币奖励 */
  gold?: number
  /** 经验奖励 */
  exp?: number
  /** 强化石类型 */
  enhancementStone?: 'normal' | 'advanced' | 'perfect'
  /** 强化石数量 */
  enhancementStoneCount?: number
  /** 专属装备 */
  uniqueItem?: string
}

/**
 * 成就条件类型
 */
export interface AchievementCondition {
  /** 条件类型 */
  type: 'kill_count' | 'gold_earned' | 'level_reached' | 'equipment_count'
    | 'monster_kills' | 'boss_kills' | 'zone_clear' | 'skill_unlocked'
    | 'enhancement_success' | 'enhancement_max' | 'item_rarity' | 'play_time'
    | 'damage_dealt' | 'crit_count' | 'death_count'
  /** 目标值 */
  target: number
  /** 当前进度 */
  progress?: number
}

/**
 * 成就接口
 */
export interface Achievement {
  /** 成就ID */
  id: string
  /** 成就名称 */
  name: string
  /** 成就描述 */
  description: string
  /** 成就图标 */
  icon: string
  /** 成就类别 */
  category: AchievementCategory
  /** 条件 */
  condition: AchievementCondition
  /** 奖励 */
  reward: AchievementReward
  /** 是否已解锁 */
  unlocked: boolean
  /** 解锁时间戳 */
  unlockedAt?: number
}

/**
 * 玩家成就状态
 */
export interface PlayerAchievements {
  /** 已解锁的成就ID列表 */
  unlockedIds: string[]
  /** 各成就进度 */
  progress: Record<string, number>
  /** 成就点数 */
  points: number
  /** 总解锁数 */
  totalUnlocked: number
}
