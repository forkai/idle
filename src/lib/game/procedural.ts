/**
 * @fileoverview 程序化生成系统
 * @description 从JSON数据文件动态生成装备和怪物，支持大量变体
 *
 * 使用方法：
 * import { generateItem, generateMonster, getAllEquipmentTemplates, getMonsterTemplates } from './procedural'
 */

import { v4 as uuidv4 } from 'uuid'
import { ItemRarity, ItemType, EquipmentSlot } from '@/types/items'
import type { Item } from '@/types/items'
import type { Monster } from '@/types/enemy'
import { MonsterType } from '@/types/enemy'
import { Element } from '@/types/combat'

// 懒加载JSON数据
let _equipmentData: any = null
let _monsterData: any = null

/** 加载装备数据 */
function getEquipmentData() {
  if (!_equipmentData) {
    _equipmentData = require('@/data/equipment-templates.json')
  }
  return _equipmentData
}

/** 加载怪物数据 */
function getMonsterData() {
  if (!_monsterData) {
    _monsterData = require('@/data/monster-templates.json')
  }
  return _monsterData
}

/** 获取所有装备模板 */
export function getAllEquipmentTemplates() {
  const data = getEquipmentData()
  return [
    ...(data.weapons || []),
    ...(data.armors || []),
    ...(data.shields || []),
    ...(data.jewelry || []),
  ]
}

/** 获取怪物模板 */
export function getMonsterTemplates(zoneId?: string) {
  const data = getMonsterData()
  if (zoneId && data.zones && data.zones[zoneId]) {
    return data.zones[zoneId].monsters || []
  }
  // 返回所有区域的怪物
  const all: any[] = []
  if (data.zones) {
    Object.values(data.zones).forEach((zone: any) => {
      if (zone.monsters) all.push(...zone.monsters)
    })
  }
  return all
}

/** 装备槽位映射 */
const SLOT_MAP: Record<string, EquipmentSlot> = {
  WEAPON: EquipmentSlot.WEAPON,
  HEAD: EquipmentSlot.HEAD,
  CHEST: EquipmentSlot.CHEST,
  GLOVES: EquipmentSlot.GLOVES,
  BOOTS: EquipmentSlot.BOOTS,
  BELT: EquipmentSlot.BELT,
  SHIELD: EquipmentSlot.SHIELD,
  RING1: EquipmentSlot.RING1,
  RING2: EquipmentSlot.RING2,
  AMULET: EquipmentSlot.AMULET,
}

/** 稀有度权重表 */
const RARITY_WEIGHTS: Record<string, { rarity: ItemRarity; weight: number }[]> = {
  low: [
    { rarity: ItemRarity.NORMAL, weight: 70 },
    { rarity: ItemRarity.MAGIC, weight: 25 },
    { rarity: ItemRarity.RARE, weight: 5 },
  ],
  mid: [
    { rarity: ItemRarity.NORMAL, weight: 30 },
    { rarity: ItemRarity.MAGIC, weight: 45 },
    { rarity: ItemRarity.RARE, weight: 20 },
    { rarity: ItemRarity.UNIQUE, weight: 5 },
  ],
  high: [
    { rarity: ItemRarity.MAGIC, weight: 20 },
    { rarity: ItemRarity.RARE, weight: 50 },
    { rarity: ItemRarity.UNIQUE, weight: 30 },
  ],
}

/** 随机稀有度 */
function rollRarity(level: number): ItemRarity {
  let pool: { rarity: ItemRarity; weight: number }[]
  if (level <= 10) pool = RARITY_WEIGHTS.low
  else if (level <= 25) pool = RARITY_WEIGHTS.mid
  else pool = RARITY_WEIGHTS.high

  const total = pool.reduce((sum, p) => sum + p.weight, 0)
  let roll = Math.random() * total
  for (const p of pool) {
    roll -= p.weight
    if (roll <= 0) return p.rarity
  }
  return ItemRarity.MAGIC
}

/** 生成装备属性浮动 */
function scaleStats(baseStats: Record<string, number>, level: number, rarity: ItemRarity): Record<string, number> {
  const scale = 1 + (level - 1) * 0.1
  const rarityMultiplier: Record<ItemRarity, number> = {
    [ItemRarity.NORMAL]: 1.0,
    [ItemRarity.MAGIC]: 1.2,
    [ItemRarity.RARE]: 1.5,
    [ItemRarity.UNIQUE]: 2.0,
    [ItemRarity.SET]: 1.8,
  }
  const bonus = rarityMultiplier[rarity]

  const result: Record<string, number> = {}
  for (const [key, value] of Object.entries(baseStats)) {
    result[key] = Math.round(value * scale * bonus * (0.8 + Math.random() * 0.4))
  }
  return result
}

/** 生成装备 */
export function generateItem(templateId?: string, level?: number): Item {
  const templates = getAllEquipmentTemplates()
  const template = templateId
    ? templates.find((t: any) => t.id === templateId)
    : templates[Math.floor(Math.random() * templates.length)]

  if (!template) {
    // 回退到默认物品
    return {
      id: uuidv4(),
      name: '未知物品',
      type: ItemType.WEAPON,
      rarity: ItemRarity.NORMAL,
      slot: EquipmentSlot.WEAPON,
      stats: { damage: 5 },
      affixes: [],
      icon: '📦',
      description: '',
      sellPrice: 10,
      quantity: 1,
    }
  }

  const itemLevel = level ?? template.level ?? 1
  const rarity = rollRarity(itemLevel)
  const scaledStats = scaleStats(template.baseStats || {}, itemLevel, rarity)

  // 生成词缀（稀有及以上有词缀）
  const affixes: Item['affixes'] = []
  if (rarity === ItemRarity.MAGIC || rarity === ItemRarity.RARE) {
    const affixCount = rarity === ItemRarity.RARE ? 2 : 1
    const affixPool = require('@/constants/items')
    const prefixPool = affixPool.PREFIXES?.filter((a: any) => a.minLevel <= itemLevel) || []
    const suffixPool = affixPool.SUFFIXES?.filter((a: any) => a.minLevel <= itemLevel) || []
    for (let i = 0; i < affixCount; i++) {
      if (Math.random() > 0.5 && prefixPool.length > 0) {
        affixes.push(prefixPool[Math.floor(Math.random() * prefixPool.length)])
      }
      if (affixes.length < affixCount && suffixPool.length > 0) {
        affixes.push(suffixPool[Math.floor(Math.random() * suffixPool.length)])
      }
    }
  }

  return {
    id: uuidv4(),
    name: template.name,
    type: template.type as ItemType,
    rarity,
    slot: SLOT_MAP[template.slot] ?? EquipmentSlot.WEAPON,
    stats: {
      ...scaledStats,
      requiredLevel: template.level,
    },
    affixes,
    icon: template.icon || '📦',
    description: template.description || '',
    sellPrice: Math.round((template.sellPrice || 10) * (1 + itemLevel * 0.2)),
    quantity: 1,
  }
}

/** 生成怪物 */
export function generateMonster(templateId?: string, levelOverride?: number): Monster {
  const templates = getMonsterTemplates()
  const template = templateId
    ? templates.find((t: any) => t.id === templateId)
    : templates[Math.floor(Math.random() * templates.length)]

  if (!template) {
    // 回退到默认怪物
    return {
      id: uuidv4(),
      name: '史莱姆',
      type: MonsterType.BEAST,
      level: 1,
      stats: { health: 20, damage: 2, defense: 0, attackSpeed: 1.0, expReward: 5, goldReward: { min: 1, max: 3 }, resists: { fire: 0, cold: 0, lightning: 0, poison: 0 } },
      abilities: [],
      lootTable: [],
      zoneId: 'blood-marsh',
      icon: '🟢',
      description: '最基础的怪物',
    }
  }

  const level = levelOverride ?? template.level ?? 1
  const scaleFactor = 1 + (level - 1) * 0.15

  return {
    id: uuidv4(),
    name: template.name,
    type: template.type as MonsterType,
    level,
    stats: {
      health: Math.round((template.baseStats?.health || 20) * scaleFactor),
      damage: Math.round((template.baseStats?.damage || 2) * scaleFactor),
      defense: Math.round((template.baseStats?.defense || 0) * scaleFactor),
      attackSpeed: template.baseStats?.attackSpeed || 1.0,
      expReward: Math.round((template.baseStats?.expReward || 5) * scaleFactor),
      goldReward: {
        min: Math.round((template.baseStats?.goldReward?.min || 1) * scaleFactor),
        max: Math.round((template.baseStats?.goldReward?.max || 3) * scaleFactor),
      },
      resists: template.baseStats?.resists || { fire: 0, cold: 0, lightning: 0, poison: 0 },
    },
    abilities: template.abilities || [],
    lootTable: template.lootTable || [],
    zoneId: template.zoneId || 'blood-marsh',
    icon: template.icon || '👾',
    description: template.description || '',
  }
}

/** 根据区域生成一组怪物 */
export function generateMonstersForZone(zoneId: string, count: number): Monster[] {
  const monsters: Monster[] = []
  for (let i = 0; i < count; i++) {
    monsters.push(generateMonster(undefined, undefined))
  }
  return monsters
}

/** 生成掉落物品 */
export function generateLootDrop(level: number, count: number = 1): Item[] {
  const items: Item[] = []
  for (let i = 0; i < count; i++) {
    // 30%概率掉落装备
    if (Math.random() < 0.3) {
      items.push(generateItem(undefined, level))
    }
  }
  return items
}
