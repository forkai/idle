/**
 * @fileoverview 排行榜系统类型定义
 */

/**
 * 排行榜条目接口
 */
export interface LeaderboardEntry {
  /** 玩家ID */
  playerId: string
  /** 玩家名称 */
  playerName: string
  /** 职业 */
  class: string
  /** 等级 */
  level: number
  /** 总击杀数 */
  totalKills: number
  /** 最高连续击杀 */
  maxCombo: number
  /** 总获得金币 */
  totalGold: number
  /** 完成成就数 */
  achievementsCompleted: number
  /** 最高伤害 */
  maxDamage: number
  /** 区域进度 */
  zoneProgress: number
  /** 时间戳 */
  timestamp: number
}

/**
 * 每日/每周挑战接口
 */
export interface Challenge {
  /** 挑战ID */
  id: string
  /** 挑战名称 */
  name: string
  /** 挑战描述 */
  description: string
  /** 挑战类型 */
  type: 'daily' | 'weekly'
  /** 开始时间 */
  startTime: number
  /** 结束时间 */
  endTime: number
  /** 目标数值 */
  targetValue: number
  /** 当前进度 */
  currentValue: number
  /** 奖励 */
  rewards: {
    gold?: number
    exp?: number
    itemId?: string
  }
  /** 是否完成 */
  completed: boolean
}

/**
 * 挑战类型枚举
 */
export enum ChallengeType {
  /** 击杀怪物 */
  KILL_MONSTERS = 'kill_monsters',
  /** 收集金币 */
  COLLECT_GOLD = 'collect_gold',
  /** 升级 */
  LEVEL_UP = 'level_up',
  /** 击败BOSS */
  DEFEAT_BOSS = 'defeat_boss',
  /** 穿戴套装 */
  EQUIP_SET = 'equip_set',
  /** 强化装备 */
  ENHANCE_ITEM = 'enhance_item',
  /** 完成任务 */
  COMPLETE_ZONE = 'complete_zone',
}

/**
 * 排行榜类型
 */
export enum LeaderboardType {
  /** 等级榜 */
  LEVEL = 'level',
  /** 击杀榜 */
  KILLS = 'kills',
  /** 金币榜 */
  GOLD = 'gold',
  /** 伤害榜 */
  DAMAGE = 'damage',
}
