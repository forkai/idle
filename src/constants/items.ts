/**
 * @fileoverview 物品数据常量
 * @description 定义游戏中的所有物品数据，包括武器、防具、消耗品等
 */

import type { Item, Affix } from '@/types/items'
import { ItemType, EquipmentSlot, ItemRarity } from '@/types/items'
import type { Element } from '@/types/combat'
import { v4 as uuidv4 } from 'uuid'
import { getPrefixesByLevel, getSuffixesByLevel } from './affixes'

/**
 * 物品前缀词缀列表
 */
export const PREFIXES: Affix[] = [
  {
    id: 'prefix_fierce',
    name: '凶猛的',
    type: 'prefix',
    effects: { damage: 10, strength: 2 },
    minLevel: 1,
  },
  {
    id: 'prefix_quick',
    name: '迅捷的',
    type: 'prefix',
    effects: { attackSpeed: 0.1, dexterity: 2 },
    minLevel: 1,
  },
  {
    id: 'prefix_vigorous',
    name: '活力的',
    type: 'prefix',
    effects: { health: 20, vitality: 2 },
    minLevel: 1,
  },
  {
    id: 'prefix_arcane',
    name: '奥术的',
    type: 'prefix',
    effects: { mana: 15, energy: 2 },
    minLevel: 1,
  },
  {
    id: 'prefix_iron',
    name: '铁制的',
    type: 'prefix',
    effects: { defense: 5, vitality: 1 },
    minLevel: 3,
  },
  {
    id: 'prefix_burning',
    name: '燃烧的',
    type: 'prefix',
    effects: { fireDamage: 5, damage: 3 },
    minLevel: 5,
  },
  {
    id: 'prefix_frozen',
    name: '冰冻的',
    type: 'prefix',
    effects: { coldDamage: 5, attackSpeed: 0.05 },
    minLevel: 5,
  },
  {
    id: 'prefix_shocking',
    name: '电击的',
    type: 'prefix',
    effects: { lightningDamage: 5, critChance: 0.02 },
    minLevel: 5,
  },
  {
    id: 'prefix_venomous',
    name: '毒液的',
    type: 'prefix',
    effects: { poisonDamage: 5, damage: 2 },
    minLevel: 5,
  },
  {
    id: 'prefix_elite',
    name: '精英的',
    type: 'prefix',
    effects: { damage: 15, defense: 5, allStats: 3 },
    minLevel: 15,
  },
]

/**
 * 物品后缀词缀列表
 */
export const SUFFIXES: Affix[] = [
  {
    id: 'suffix_strength',
    name: '力量',
    type: 'suffix',
    effects: { strength: 3 },
    minLevel: 1,
  },
  {
    id: 'suffix_dexterity',
    name: '敏捷',
    type: 'suffix',
    effects: { dexterity: 3 },
    minLevel: 1,
  },
  {
    id: 'suffix_vitality',
    name: '体力',
    type: 'suffix',
    effects: { vitality: 3 },
    minLevel: 1,
  },
  {
    id: 'suffix_energy',
    name: '能量',
    type: 'suffix',
    effects: { energy: 3 },
    minLevel: 1,
  },
  {
    id: 'suffix_might',
    name: '威能',
    type: 'suffix',
    effects: { damage: 8 },
    minLevel: 3,
  },
  {
    id: 'suffix_guardian',
    name: '守护',
    type: 'suffix',
    effects: { defense: 8 },
    minLevel: 3,
  },
  {
    id: 'suffix_life',
    name: '生命',
    type: 'suffix',
    effects: { health: 30 },
    minLevel: 5,
  },
  {
    id: 'suffix_mana',
    name: '法力',
    type: 'suffix',
    effects: { mana: 20 },
    minLevel: 5,
  },
  {
    id: 'suffix_precision',
    name: '精准',
    type: 'suffix',
    effects: { critChance: 0.03, critDamage: 0.1 },
    minLevel: 7,
  },
  {
    id: 'suffix_swiftness',
    name: '速度',
    type: 'suffix',
    effects: { attackSpeed: 0.15 },
    minLevel: 10,
  },
  {
    id: 'suffix_resistance',
    name: '抗性',
    type: 'suffix',
    effects: { fireResist: 10, coldResist: 10, lightningResist: 10, poisonResist: 10 },
    minLevel: 12,
  },
  {
    id: 'suffix_balance',
    name: '平衡',
    type: 'suffix',
    effects: { strength: 2, dexterity: 2, vitality: 2, energy: 2 },
    minLevel: 15,
  },
]

/**
 * 基础武器模板
 */
export const BASE_WEAPONS: Partial<Item>[] = [
  {
    type: ItemType.WEAPON,
    slot: EquipmentSlot.WEAPON,
    name: '短剑',
    icon: '🗡️',
    stats: { damage: 5, requiredLevel: 1 },
    description: '一把普通短剑',
    sellPrice: 10,
  },
  {
    type: ItemType.WEAPON,
    slot: EquipmentSlot.WEAPON,
    name: '长剑',
    icon: '⚔️',
    stats: { damage: 8, requiredLevel: 3 },
    description: '标准的长剑',
    sellPrice: 25,
  },
  {
    type: ItemType.WEAPON,
    slot: EquipmentSlot.WEAPON,
    name: '战斧',
    icon: '🪓',
    stats: { damage: 12, requiredLevel: 5 },
    description: '沉重的战斧',
    sellPrice: 50,
  },
  {
    type: ItemType.WEAPON,
    slot: EquipmentSlot.WEAPON,
    name: '巨锤',
    icon: '🔨',
    stats: { damage: 15, requiredLevel: 7 },
    description: '破坏力惊人的巨锤',
    sellPrice: 80,
  },
  {
    type: ItemType.WEAPON,
    slot: EquipmentSlot.WEAPON,
    name: '长剑',
    icon: '⚔️',
    stats: { damage: 20, requiredLevel: 10 },
    description: '精工打造的长剑',
    sellPrice: 150,
  },
  {
    type: ItemType.WEAPON,
    slot: EquipmentSlot.WEAPON,
    name: '魔法杖',
    icon: '🪄',
    stats: { damage: 6, mana: 30, requiredLevel: 5 },
    description: '附魔的魔法杖',
    sellPrice: 60,
  },
]

/**
 * 基础防具模板
 */
export const BASE_ARMORS: Partial<Item>[] = [
  {
    type: ItemType.ARMOR,
    slot: EquipmentSlot.HEAD,
    name: '皮帽',
    icon: '🎩',
    stats: { defense: 2, requiredLevel: 1 },
    description: '普通的皮帽',
    sellPrice: 8,
  },
  {
    type: ItemType.ARMOR,
    slot: EquipmentSlot.CHEST,
    name: '皮甲',
    icon: '🥋',
    stats: { defense: 5, requiredLevel: 1 },
    description: '基本的皮甲',
    sellPrice: 15,
  },
  {
    type: ItemType.ARMOR,
    slot: EquipmentSlot.GLOVES,
    name: '皮手套',
    icon: '🧤',
    stats: { defense: 1, attackSpeed: 0.02, requiredLevel: 1 },
    description: '普通的皮手套',
    sellPrice: 6,
  },
  {
    type: ItemType.ARMOR,
    slot: EquipmentSlot.BOOTS,
    name: '皮靴',
    icon: '👢',
    stats: { defense: 2, requiredLevel: 1 },
    description: '普通的皮靴',
    sellPrice: 10,
  },
  {
    type: ItemType.ARMOR,
    slot: EquipmentSlot.BELT,
    name: '皮带',
    icon: '📿',
    stats: { defense: 1, health: 10, requiredLevel: 1 },
    description: '普通的皮带',
    sellPrice: 5,
  },
  {
    type: ItemType.ARMOR,
    slot: EquipmentSlot.HEAD,
    name: '铁头盔',
    icon: '⛑️',
    stats: { defense: 5, requiredLevel: 5 },
    description: '结实的铁头盔',
    sellPrice: 40,
  },
  {
    type: ItemType.ARMOR,
    slot: EquipmentSlot.CHEST,
    name: '锁甲',
    icon: '🛡️',
    stats: { defense: 12, requiredLevel: 5 },
    description: '金属锁链编织的护甲',
    sellPrice: 80,
  },
  {
    type: ItemType.ARMOR,
    slot: EquipmentSlot.CHEST,
    name: '板甲',
    icon: '🏰',
    stats: { defense: 20, requiredLevel: 10 },
    description: '厚重的全身板甲',
    sellPrice: 200,
  },
]

/**
 * 基础盾牌模板
 */
export const BASE_SHIELDS: Partial<Item>[] = [
  {
    type: ItemType.SHIELD,
    slot: EquipmentSlot.SHIELD,
    name: '木盾',
    icon: '🪵',
    stats: { defense: 3, requiredLevel: 1 },
    description: '简单的木制盾牌',
    sellPrice: 12,
  },
  {
    type: ItemType.SHIELD,
    slot: EquipmentSlot.SHIELD,
    name: '铁盾',
    icon: '🛡️',
    stats: { defense: 8, requiredLevel: 5 },
    description: '坚固的铁制盾牌',
    sellPrice: 60,
  },
]

/**
 * 基础首饰模板
 */
export const BASE_JEWELRY: Partial<Item>[] = [
  {
    type: ItemType.RING,
    slot: EquipmentSlot.RING1,
    name: '铜戒指',
    icon: '💍',
    stats: { damage: 1, requiredLevel: 1 },
    description: '普通的铜戒指',
    sellPrice: 15,
  },
  {
    type: ItemType.RING,
    slot: EquipmentSlot.RING1,
    name: '银戒指',
    icon: '💍',
    stats: { critChance: 0.02, requiredLevel: 3 },
    description: '抛光银戒指',
    sellPrice: 40,
  },
  {
    type: ItemType.AMULET,
    slot: EquipmentSlot.AMULET,
    name: '石护符',
    icon: '📿',
    stats: { health: 15, defense: 2, requiredLevel: 1 },
    description: '普通的石质护符',
    sellPrice: 25,
  },
  {
    type: ItemType.AMULET,
    slot: EquipmentSlot.AMULET,
    name: '生命护符',
    icon: '❤️‍🔥',
    stats: { health: 30, requiredLevel: 5 },
    description: '增加生命的护符',
    sellPrice: 80,
  },
]

/**
 * 消耗品模板
 */
export const CONSUMABLES: Partial<Item>[] = [
  {
    type: ItemType.POTION,
    name: '生命药水',
    icon: '🧪',
    stats: {},
    description: '恢复50点生命值',
    sellPrice: 5,
  },
  {
    type: ItemType.POTION,
    name: '法力药水',
    icon: '💧',
    stats: {},
    description: '恢复30点法力值',
    sellPrice: 5,
  },
]

/**
 * 暗金物品列表
 */
export const UNIQUE_ITEMS: Partial<Item>[] = [
  {
    id: 'unique_horizon',
    name: '末日',
    icon: '⚔️',
    stats: { damage: 50, attackSpeed: 0.2 },
    description: '传说中能够毁灭一切的神兵利器',
    sellPrice: 5000,
  },
  {
    id: 'unique_shadow',
    name: '暗影',
    icon: '🌑',
    stats: { damage: 30, critChance: 0.15, critDamage: 0.5 },
    description: '由暗影中淬炼出的匕首',
    sellPrice: 3000,
  },
]

/**
 * 根据等级范围生成随机物品（使用程序化生成系统）
 * @param level - 玩家等级
 * @param type - 物品类型（可选，暂未使用）
 * @returns 生成的物品
 */
export function generateRandomItem(level: number, type?: ItemType): Item {
  // 使用程序化生成系统（从JSON数据读取模板）
  // type参数暂未实现筛选，后续可扩展
  const templates = [
    ...BASE_WEAPONS,
    ...BASE_ARMORS,
    ...BASE_SHIELDS,
    ...BASE_JEWELRY,
  ]

  // 过滤符合等级要求的模板
  const validTemplates = templates.filter(t => !t.stats?.requiredLevel || t.stats.requiredLevel <= level)

  if (validTemplates.length === 0) {
    return createBasicItem('短剑', ItemType.WEAPON, EquipmentSlot.WEAPON, level)
  }

  // 随机选择模板
  const template = validTemplates[Math.floor(Math.random() * validTemplates.length)]

  // 确定稀有度
  const rarity = rollItemRarity(level)

  // 生成词缀
  const affixes = generateAffixes(rarity, level, template)

  // 创建物品
  const item: Item = {
    id: uuidv4(),
    name: template.name || '未知物品',
    type: template.type || ItemType.WEAPON,
    rarity,
    slot: template.slot,
    stats: { ...template.stats },
    affixes,
    icon: template.icon || '📦',
    description: template.description || '',
    sellPrice: template.sellPrice || 10,
    quantity: 1,
  }

  // 应用词缀效果到基础属性
  applyAffixEffects(item)

  return item
}

/**
 * 掷骰决定物品稀有度
 * @param level - 玩家等级
 * @returns 稀有度
 */
function rollItemRarity(level: number): ItemRarity {
  const roll = Math.random() * 100
  const magicChance = Math.min(30 + level * 0.5, 60)
  const rareChance = Math.min(5 + level * 0.2, 20)
  const uniqueChance = Math.max(0.5 - level * 0.02, 0.1)

  if (roll < uniqueChance) return ItemRarity.UNIQUE
  if (roll < uniqueChance + rareChance) return ItemRarity.RARE
  if (roll < uniqueChance + rareChance + magicChance) return ItemRarity.MAGIC
  return ItemRarity.NORMAL
}

/**
 * 根据稀有度生成词缀
 * @param rarity - 稀有度
 * @param level - 等级
 * @param template - 物品模板
 * @returns 词缀数组
 */
function generateAffixes(rarity: ItemRarity, level: number, template: Partial<Item>): Affix[] {
  const affixes: Affix[] = []

  switch (rarity) {
    case ItemRarity.NORMAL:
      // 普通物品无词缀
      break
    case ItemRarity.MAGIC:
      // 魔法物品1个前缀或后缀
      affixes.push(rollAffix(level, Math.random() < 0.5 ? 'prefix' : 'suffix'))
      break
    case ItemRarity.RARE:
      // 稀有物品2-3个词缀
      affixes.push(rollAffix(level, 'prefix'))
      affixes.push(rollAffix(level, 'suffix'))
      if (Math.random() < 0.5) {
        affixes.push(rollAffix(level, Math.random() < 0.5 ? 'prefix' : 'suffix'))
      }
      break
    case ItemRarity.UNIQUE:
      // 暗金物品固定词缀
      affixes.push(...UNIQUE_ITEMS[0].affixes || [])
      break
    case ItemRarity.SET:
      // 套装物品
      break
  }

  return affixes
}

/**
 * 掷骰获取词缀
 * @param level - 等级
 * @param type - 词缀类型
 * @returns 词缀
 */
function rollAffix(level: number, type: 'prefix' | 'suffix'): Affix {
  const validAffixes = type === 'prefix' ? getPrefixesByLevel(level) : getSuffixesByLevel(level)
  if (validAffixes.length === 0) return type === 'prefix' ? PREFIXES[0] : SUFFIXES[0]
  return validAffixes[Math.floor(Math.random() * validAffixes.length)]
}

/**
 * 应用词缀效果到物品
 * @param item - 物品
 */
function applyAffixEffects(item: Item): void {
  for (const affix of item.affixes) {
    if (affix.effects.damage) {
      item.stats.damage = (item.stats.damage || 0) + affix.effects.damage
    }
    if (affix.effects.defense) {
      item.stats.defense = (item.stats.defense || 0) + affix.effects.defense
    }
  }
}

/**
 * 创建基础物品
 */
function createBasicItem(name: string, type: ItemType, slot: EquipmentSlot, level: number): Item {
  return {
    id: uuidv4(),
    name,
    type,
    rarity: ItemRarity.NORMAL,
    slot,
    stats: { damage: level * 2, requiredLevel: level },
    affixes: [],
    icon: '📦',
    description: '基础物品',
    sellPrice: level * 5,
    quantity: 1,
  }
}

/**
 * 获取物品的总价值（卖出价格）
 * @param item - 物品
 * @returns 总价值
 */
export function getItemValue(item: Item): number {
  let value = item.sellPrice
  for (const affix of item.affixes) {
    // 根据词缀增加价值
    value += Object.values(affix.effects).reduce((sum, v) => sum + (typeof v === 'number' ? v : 0), 0) * 2
  }
  return value
}
