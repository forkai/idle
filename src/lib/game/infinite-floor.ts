/**
 * @fileoverview 无尽层数系统
 * @description 实现层数递进算法、怪物等级缩放和层数奖励
 */

import type { Monster, MonsterStats } from '@/types/enemy'
import { MonsterType, createDefaultMonsterStats } from '@/types/enemy'
import { v4 as uuidv4 } from 'uuid'
import { generateRandomItem } from '@/constants/items'
import type { Item } from '@/types/items'

/**
 * 无尽层数配置
 */
export const INFINITE_FLOOR_CONFIG = {
  /** 基础层怪物等级 */
  BASE_FLOOR_LEVEL: 1,
  /** 每层等级增量 */
  LEVEL_PER_FLOOR: 1,
  /** 每10层怪物等级加成 */
  LEVEL_BONUS_PER_10_FLOORS: 5,
  /** BOSS出现频率（每5层） */
  BOSS_EVERY_N_FLOORS: 5,
  /** 基础怪物数量 */
  BASE_MONSTERS_PER_FLOOR: 3,
  /** 每层怪物数量增量 */
  MONSTERS_PER_FLOOR_INCREMENT: 0.5,
  /** 基础金币奖励 */
  BASE_GOLD_REWARD: 10,
  /** 每层金币增量 */
  GOLD_PER_FLOOR: 2,
  /** 基础经验奖励 */
  BASE_EXP_REWARD: 20,
  /** 每层经验增量 */
  EXP_PER_FLOOR: 5,
  /** 掉落物品层数倍数 */
  LOOT_MULTIPLIER_PER_FLOOR: 0.1,
  /** 最大难度等级 */
  MAX_DIFFICULTY_MULTIPLIER: 10,
}

/**
 * 层数进度数据
 */
export interface FloorProgress {
  /** 当前层数 */
  currentFloor: number
  /** 已通过的层数 */
  highestFloor: number
  /** 累计击杀数 */
  totalKills: number
  /** 累计获得金币 */
  totalGoldEarned: number
  /** 累计获得经验 */
  totalExpEarned: number
  /** 每层奖励记录 */
  floorRewards: FloorReward[]
}

/**
 * 层数奖励
 */
export interface FloorReward {
  floor: number
  gold: number
  exp: number
  items: Item[]
  isBoss: boolean
}

/**
 * 计算指定层数的怪物等级
 */
const calculateFloorMonsterLevel = (floor: number): number => {
  const baseLevel = INFINITE_FLOOR_CONFIG.BASE_FLOOR_LEVEL
  const levelPerFloor = INFINITE_FLOOR_CONFIG.LEVEL_PER_FLOOR
  const bonusPer10Floors = INFINITE_FLOOR_CONFIG.LEVEL_BONUS_PER_10_FLOORS

  let level = baseLevel + (floor - 1) * levelPerFloor
  // 每10层额外加成
  level += Math.floor(floor / 10) * bonusPer10Floors

  return level
}

/**
 * 计算难度倍数
 */
const calculateDifficultyMultiplier = (floor: number): number => {
  const multiplier = 1 + (floor - 1) * 0.15
  return Math.min(multiplier, INFINITE_FLOOR_CONFIG.MAX_DIFFICULTY_MULTIPLIER)
}

/**
 * 生成无尽层数的怪物
 */
const generateInfiniteFloorMonster = (floor: number, slot: number): Monster => {
  const level = calculateFloorMonsterLevel(floor)
  const isBoss = floor % INFINITE_FLOOR_CONFIG.BOSS_EVERY_N_FLOORS === 0 && slot === 0
  const baseStats = createDefaultMonsterStats(level)
  const difficultyMultiplier = calculateDifficultyMultiplier(floor)

  // 根据层数调整属性
  const scaledStats: MonsterStats = {
    health: Math.floor(baseStats.health * difficultyMultiplier * (isBoss ? 5 : 1)),
    damage: Math.floor(baseStats.damage * difficultyMultiplier * (isBoss ? 2 : 1)),
    defense: Math.floor(baseStats.defense * difficultyMultiplier),
    attackSpeed: baseStats.attackSpeed,
    expReward: Math.floor(baseStats.expReward * difficultyMultiplier * (isBoss ? 3 : 1)),
    goldReward: {
      min: Math.floor(baseStats.goldReward.min * difficultyMultiplier * (isBoss ? 5 : 1)),
      max: Math.floor(baseStats.goldReward.max * difficultyMultiplier * (isBoss ? 5 : 1)),
    },
    resists: baseStats.resists,
  }

  const monster: Monster = {
    id: uuidv4(),
    name: isBoss ? `第${floor}层 Boss` : `第${floor}层 怪物 ${slot + 1}`,
    type: isBoss ? MonsterType.BOSS : MonsterType.BEAST,
    level,
    stats: scaledStats,
    abilities: [],
    lootTable: [],
    zoneId: `infinite-floor-${floor}`,
    icon: isBoss ? '👹' : '👾',
    description: `无尽的第${floor}层挑战`,
  }

  return monster
}

/**
 * 获取指定层数的所有怪物
 */
const getFloorMonsters = (floor: number): Monster[] => {
  const monsterCount = Math.floor(
    INFINITE_FLOOR_CONFIG.BASE_MONSTERS_PER_FLOOR +
    (floor - 1) * INFINITE_FLOOR_CONFIG.MONSTERS_PER_FLOOR_INCREMENT
  )

  const monsters: Monster[] = []
  for (let i = 0; i < Math.max(1, monsterCount); i++) {
    monsters.push(generateInfiniteFloorMonster(floor, i))
  }

  return monsters
}

/**
 * 计算层数奖励
 */
const calculateFloorRewards = (floor: number, isBoss: boolean): { gold: number; exp: number } => {
  const baseGold = INFINITE_FLOOR_CONFIG.BASE_GOLD_REWARD + floor * INFINITE_FLOOR_CONFIG.GOLD_PER_FLOOR
  const baseExp = INFINITE_FLOOR_CONFIG.BASE_EXP_REWARD + floor * INFINITE_FLOOR_CONFIG.EXP_PER_FLOOR

  return {
    gold: Math.floor(baseGold * (isBoss ? 5 : 1)),
    exp: Math.floor(baseExp * (isBoss ? 3 : 1)),
  }
}

/**
 * 检查是否掉落物品
 */
const shouldDropItem = (floor: number): boolean => {
  const baseChance = 0.1
  const floorBonus = floor * INFINITE_FLOOR_CONFIG.LOOT_MULTIPLIER_PER_FLOOR
  const finalChance = Math.min(baseChance + floorBonus, 0.9) // 最高90%掉率
  return Math.random() < finalChance
}

/**
 * 生成掉落物品
 */
const generateFloorLoot = (floor: number): Item[] => {
  const items: Item[] = []
  const monsterLevel = calculateFloorMonsterLevel(floor)

  // BOSS必掉一件
  if (Math.random() < 0.5) {
    items.push(generateRandomItem(monsterLevel))
  }

  // 普通怪物概率掉落
  if (shouldDropItem(floor)) {
    items.push(generateRandomItem(monsterLevel))
  }

  return items
}

/**
 * 创建新层数进度
 */
const createInitialFloorProgress = (): FloorProgress => ({
  currentFloor: 1,
  highestFloor: 1,
  totalKills: 0,
  totalGoldEarned: 0,
  totalExpEarned: 0,
  floorRewards: [],
})

/**
 * 处理层数通过
 */
const processFloorCompletion = (
  progress: FloorProgress,
  floor: number,
  isBoss: boolean
): FloorProgress => {
  const rewards = calculateFloorRewards(floor, isBoss)
  const items = generateFloorLoot(floor)

  const floorReward: FloorReward = {
    floor,
    gold: rewards.gold,
    exp: rewards.exp,
    items,
    isBoss,
  }

  const newProgress: FloorProgress = {
    ...progress,
    currentFloor: floor + 1,
    highestFloor: Math.max(progress.highestFloor, floor + 1),
    totalKills: progress.totalKills + 1,
    totalGoldEarned: progress.totalGoldEarned + rewards.gold,
    totalExpEarned: progress.totalExpEarned + rewards.exp,
    floorRewards: [...progress.floorRewards, floorReward].slice(-50), // 保留最近50层
  }

  return newProgress
}

/**
 * 获取层数描述
 */
const getFloorDescription = (floor: number): string => {
  const level = calculateFloorMonsterLevel(floor)
  const multiplier = calculateDifficultyMultiplier(floor)

  if (floor % INFINITE_FLOOR_CONFIG.BOSS_EVERY_N_FLOORS === 0) {
    return `第${floor}层 - BOSS层！怪物等级${level}，难度x${multiplier.toFixed(1)}`
  }

  return `第${floor}层 - 怪物等级${level}，难度x${multiplier.toFixed(1)}`
}

/**
 * 获取进度百分比
 */
const getFloorProgressPercent = (currentFloor: number, targetFloor: number): number => {
  return Math.min(100, Math.floor((currentFloor / targetFloor) * 100))
}

/**
 * 格式化层数显示
 */
const formatFloorDisplay = (floor: number): string => {
  if (floor <= 0) return '?'
  if (floor < 10) return `第${floor}层`
  if (floor < 100) return `${floor}F`
  return `${floor}`
}

export {
  calculateFloorMonsterLevel,
  calculateDifficultyMultiplier,
  generateInfiniteFloorMonster,
  getFloorMonsters,
  calculateFloorRewards,
  shouldDropItem,
  generateFloorLoot,
  createInitialFloorProgress,
  processFloorCompletion,
  getFloorDescription,
  getFloorProgressPercent,
  formatFloorDisplay,
}
