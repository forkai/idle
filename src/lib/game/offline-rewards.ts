/**
 * @fileoverview 离线收益计算引擎
 * @description 计算玩家离线期间的收益，包括经验、金币和掉落
 */

import type { Item } from '@/types/items'
import { generateRandomItem } from '@/constants/items'

/**
 * 离线收益结果
 */
export interface OfflineRewards {
  /** 离线时间（毫秒） */
  offlineTime: number
  /** 获得的经验 */
  exp: number
  /** 获得的金币 */
  gold: number
  /** 掉落物品 */
  items: Item[]
  /** 击杀怪物数 */
  kills: number
  /** 收益上限 */
  cap: {
    exp: number
    gold: number
    time: number
  }
}

/**
 * 离线收益配置
 */
export const OFFLINE_CONFIG = {
  /** 最大离线收益时间（毫秒）= 4小时 */
  MAX_OFFLINE_TIME: 4 * 60 * 60 * 1000,
  /** 经验收益率（每分钟） */
  EXP_RATE_PER_MIN: 0.5,
  /** 金币收益率（每分钟） */
  GOLD_RATE_PER_MIN: 0.3,
  /** 基础击杀率（每分钟） */
  BASE_KILLS_PER_MIN: 10,
  /** 掉落物品概率 */
  LOOT_CHANCE: 0.1,
  /** 经验上限（每分钟） */
  EXP_CAP_PER_MIN: 1000,
  /** 金币上限（每分钟） */
  GOLD_CAP_PER_MIN: 500,
}

/**
 * 玩家属性（仅用于离线计算）
 */
interface OfflinePlayerStats {
  level: number
}

/**
 * 区域属性（仅用于离线计算）
 */
interface OfflineZoneStats {
  level: number
  goldBonus: number
  expBonus: number
}

/**
 * 计算离线收益
 * @param lastSaveTime - 上次保存时间
 * @param playerStats - 玩家属性
 * @param currentZone - 当前区域
 * @param avgKillTime - 平均击杀时间（毫秒）
 * @returns 离线收益
 */
export function calculateOfflineRewards(
  lastSaveTime: number,
  playerStats: OfflinePlayerStats,
  currentZone: OfflineZoneStats,
  avgKillTime: number = 5000
): OfflineRewards {
  const now = Date.now()
  const offlineTime = Math.min(now - lastSaveTime, OFFLINE_CONFIG.MAX_OFFLINE_TIME)

  // 小于1分钟无收益
  if (offlineTime < 60000) {
    return {
      offlineTime: 0,
      exp: 0,
      gold: 0,
      items: [],
      kills: 0,
      cap: { exp: 0, gold: 0, time: 0 },
    }
  }

  const offlineMinutes = offlineTime / 60000

  // 计算击杀数
  const killsPerMinute = 60000 / avgKillTime
  const totalKills = Math.floor(killsPerMinute * offlineMinutes * getZoneEfficiency(currentZone.level, playerStats.level))

  // 计算经验和金币（使用柯里化函数）
  const baseExpPerKill = calculateExpPerKill(playerStats.level, currentZone.level)
  const baseGoldPerKill = calculateGoldPerKill(playerStats.level, currentZone.level)

  const expRate = OFFLINE_CONFIG.EXP_RATE_PER_MIN * (1 + currentZone.expBonus)
  const goldRate = OFFLINE_CONFIG.GOLD_RATE_PER_MIN * (1 + currentZone.goldBonus)

  let exp = Math.floor(baseExpPerKill * totalKills * expRate)
  let gold = Math.floor(baseGoldPerKill * totalKills * goldRate)

  // 应用上限
  const expCap = Math.floor(OFFLINE_CONFIG.EXP_CAP_PER_MIN * offlineMinutes)
  const goldCap = Math.floor(OFFLINE_CONFIG.GOLD_CAP_PER_MIN * offlineMinutes)

  exp = Math.min(exp, expCap)
  gold = Math.min(gold, goldCap)

  // 生成掉落物品
  const items = generateOfflineLoot(totalKills, playerStats.level)

  return {
    offlineTime,
    exp,
    gold,
    items,
    kills: totalKills,
    cap: {
      exp: expCap,
      gold: goldCap,
      time: OFFLINE_CONFIG.MAX_OFFLINE_TIME,
    },
  }
}

/**
 * 计算每只怪物提供的经验
 */
function calculateExpPerKill(playerLevel: number, monsterLevel: number): number {
  const levelDiff = monsterLevel - playerLevel
  let multiplier = 1.0

  // 等级差惩罚/奖励
  if (levelDiff > 5) multiplier = 1.5
  else if (levelDiff > 2) multiplier = 1.2
  else if (levelDiff < -2) multiplier = 0.8
  else if (levelDiff < -5) multiplier = 0.5

  return Math.floor(10 * monsterLevel * multiplier)
}

/**
 * 计算每只怪物掉落的金币
 */
function calculateGoldPerKill(playerLevel: number, monsterLevel: number): number {
  return Math.floor(5 + monsterLevel * 2)
}

/**
 * 获取区域效率（根据等级差）
 */
function getZoneEfficiency(zoneLevel: number, playerLevel: number): number {
  const diff = zoneLevel - playerLevel
  if (diff >= 5) return 1.2
  if (diff >= 2) return 1.0
  if (diff >= -2) return 0.9
  if (diff >= -5) return 0.7
  return 0.5
}

/**
 * 生成离线掉落
 */
function generateOfflineLoot(totalKills: number, playerLevel: number): Item[] {
  const items: Item[] = []
  const potentialDrops = Math.floor(totalKills * OFFLINE_CONFIG.LOOT_CHANCE)

  for (let i = 0; i < potentialDrops; i++) {
    if (Math.random() < OFFLINE_CONFIG.LOOT_CHANCE) {
      const item = generateRandomItem(playerLevel)
      items.push(item)
    }
  }

  return items
}

/**
 * 格式化离线时间
 */
export function formatOfflineTime(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}小时${minutes % 60}分钟`
  }
  if (minutes > 0) {
    return `${minutes}分钟`
  }
  return `${seconds}秒`
}

/**
 * 检查是否应该计算离线收益
 */
export function shouldCalculateOfflineRewards(lastSaveTime: number): boolean {
  const now = Date.now()
  const offlineTime = now - lastSaveTime
  return offlineTime >= 60000 // 至少离线1分钟
}

/**
 * 获取离线收益描述
 */
export function getOfflineRewardDescription(rewards: OfflineRewards): string {
  if (rewards.offlineTime === 0) {
    return '离线时间太短，没有获得收益'
  }

  const timeStr = formatOfflineTime(rewards.offlineTime)
  const parts: string[] = [`离线 ${timeStr} 获得：`]
  parts.push(`击杀 ${rewards.kills} 只怪物`)

  if (rewards.exp > 0) {
    parts.push(`经验 +${rewards.exp.toLocaleString()}`)
  }
  if (rewards.gold > 0) {
    parts.push(`金币 +${rewards.gold.toLocaleString()}`)
  }
  if (rewards.items.length > 0) {
    parts.push(`物品 +${rewards.items.length} 件`)
  }

  return parts.join('\n')
}
