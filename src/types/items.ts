/**
 * @fileoverview 物品系统类型定义
 * @description 定义装备、物品、词缀等相关类型
 */

import type { Element } from './combat'

/**
 * 物品稀有度枚举
 * 暗黑破坏神风格的颜色表示
 */
export enum ItemRarity {
  /** 普通 - 白色 */
  NORMAL = 'normal',
  /** 魔法 - 蓝色 */
  MAGIC = 'magic',
  /** 稀有 - 黄色 */
  RARE = 'rare',
  /** 独特（暗金）- 橙色 */
  UNIQUE = 'unique',
  /** 套装 - 绿色 */
  SET = 'set',
}

/**
 * 稀有度名称和颜色映射
 */
export const RarityInfo: Record<ItemRarity, { name: string; color: string }> = {
  [ItemRarity.NORMAL]: { name: '普通', color: '#ffffff' },
  [ItemRarity.MAGIC]: { name: '魔法', color: '#6b8aff' },
  [ItemRarity.RARE]: { name: '稀有', color: '#ffff00' },
  [ItemRarity.UNIQUE]: { name: '暗金', color: '#ff8000' },
  [ItemRarity.SET]: { name: '套装', color: '#00ff00' },
}

/**
 * 装备槽位枚举
 */
export enum EquipmentSlot {
  /** 头部 */
  HEAD = 'head',
  /** 胸甲 */
  CHEST = 'chest',
  /** 手套 */
  GLOVES = 'gloves',
  /** 靴子 */
  BOOTS = 'boots',
  /** 腰带 */
  BELT = 'belt',
  /** 盾牌 */
  SHIELD = 'shield',
  /** 戒指1 */
  RING1 = 'ring1',
  /** 戒指2 */
  RING2 = 'ring2',
  /** 护符 */
  AMULET = 'amulet',
  /** 武器 */
  WEAPON = 'weapon',
}

/**
 * 装备槽位名称（中文）
 */
export const SlotNames: Record<EquipmentSlot, string> = {
  [EquipmentSlot.HEAD]: '头部',
  [EquipmentSlot.CHEST]: '胸甲',
  [EquipmentSlot.GLOVES]: '手套',
  [EquipmentSlot.BOOTS]: '靴子',
  [EquipmentSlot.BELT]: '腰带',
  [EquipmentSlot.SHIELD]: '盾牌',
  [EquipmentSlot.RING1]: '戒指',
  [EquipmentSlot.RING2]: '戒指',
  [EquipmentSlot.AMULET]: '护符',
  [EquipmentSlot.WEAPON]: '武器',
}

/**
 * 物品类别枚举
 */
export enum ItemType {
  /** 武器 */
  WEAPON = 'weapon',
  /** 护甲 */
  ARMOR = 'armor',
  /** 盾牌 */
  SHIELD = 'shield',
  /** 戒指 */
  RING = 'ring',
  /** 护符 */
  AMULET = 'amulet',
  /** 药水 */
  POTION = 'potion',
  /** 宝石 */
  GEM = 'gem',
  /** 材料 */
  MATERIAL = 'material',
  /** 任务物品 */
  QUEST = 'quest',
}

/**
 * 武器类型枚举
 */
export enum WeaponType {
  /** 剑 */
  SWORD = 'sword',
  /** 斧 */
  AXE = 'axe',
  /** 锤 */
  MACE = 'mace',
  /** 弓 */
  BOW = 'bow',
  /** 法杖 */
  STAFF = 'staff',
  /** 匕首 */
  DAGGER = 'dagger',
}

/**
 * 护甲类型枚举
 */
export enum ArmorType {
  /** 轻甲 */
  LIGHT = 'light',
  /** 中甲 */
  MEDIUM = 'medium',
  /** 重甲 */
  HEAVY = 'heavy',
}

/**
 * 词缀效果接口
 */
export interface AffixEffect {
  /** 力量加成 */
  strength?: number
  /** 敏捷加成 */
  dexterity?: number
  /** 体力加成 */
  vitality?: number
  /** 能量加成 */
  energy?: number
  /** 全属性加成 */
  allStats?: number
  /** 伤害加成 */
  damage?: number
  /** 防御加成 */
  defense?: number
  /** 生命值加成 */
  health?: number
  /** 法力加成 */
  mana?: number
  /** 攻击速度加成 */
  attackSpeed?: number
  /** 暴击率加成 */
  critChance?: number
  /** 暴击伤害加成 */
  critDamage?: number
  /** 元素抗性 */
  fireResist?: number
  coldResist?: number
  lightningResist?: number
  poisonResist?: number
  /** 元素伤害 */
  fireDamage?: number
  coldDamage?: number
  lightningDamage?: number
  poisonDamage?: number
}

/**
 * 词缀接口（前后缀）
 */
export interface Affix {
  /** 词缀ID */
  id: string
  /** 词缀名称 */
  name: string
  /** 词缀类型 */
  type: 'prefix' | 'suffix'
  /** 词缀效果 */
  effects: AffixEffect
  /** 最小等级要求 */
  minLevel: number
}

/**
 * 套装奖励接口
 */
export interface SetBonus {
  /** 套装名称 */
  name: string
  /** 套装件数 */
  pieces: number
  /** 激活奖励所需件数 */
  threshold: number
  /** 奖励效果 */
  effects: AffixEffect
}

/**
 * 物品基础属性接口
 */
export interface ItemStats {
  /** 伤害值 */
  damage?: number
  /** 防御值 */
  defense?: number
  /** 耐久度 */
  durability?: number
  /** 最大耐久度 */
  maxDurability?: number
  /** 力量要求 */
  requiredStrength?: number
  /** 敏捷要求 */
  requiredDexterity?: number
  /** 等级要求 */
  requiredLevel?: number
  /** 法力加成 */
  mana?: number
  /** 攻击速度加成 */
  attackSpeed?: number
  /** 生命值加成 */
  health?: number
  /** 暴击率 */
  critChance?: number
  /** 暴击伤害 */
  critDamage?: number
}

/**
 * 物品接口
 */
export interface Item {
  /** 物品唯一ID */
  id: string
  /** 物品名称 */
  name: string
  /** 物品类型 */
  type: ItemType
  /** 稀有度 */
  rarity: ItemRarity
  /** 装备槽位（如果是装备） */
  slot?: EquipmentSlot
  /** 物品基础属性 */
  stats: ItemStats
  /** 词缀列表 */
  affixes: Affix[]
  /** 套装ID（如果是套装物品） */
  setId?: string
  /** 元素类型（如果是元素武器） */
  element?: Element
  /** 堆叠数量 */
  quantity: number
  /** 物品图标 */
  icon: string
  /** 物品描述 */
  description: string
  /** 售价 */
  sellPrice: number
}

/**
 * 背包槽位接口
 */
export interface InventorySlot {
  /** 槽位索引 */
  index: number
  /** 物品（如果为空则null） */
  item: Item | null
}

/**
 * 背包接口
 */
export interface Inventory {
  /** 背包槽位数组 */
  slots: (Item | null)[]
  /** 当前容量 */
  usedSlots: number
  /** 最大容量 */
  maxSlots: number
}

/**
 * 装备状态接口
 */
export interface EquipmentState {
  /** 各槽位装备的物品 */
  [key: string]: Item | null
}

/**
 * 默认背包大小
 */
export const DEFAULT_INVENTORY_SIZE = 60

/**
 * 堆叠限制
 */
export const STACK_LIMITS: Record<ItemType, number> = {
  [ItemType.WEAPON]: 1,
  [ItemType.ARMOR]: 1,
  [ItemType.SHIELD]: 1,
  [ItemType.RING]: 1,
  [ItemType.AMULET]: 1,
  [ItemType.POTION]: 99,
  [ItemType.GEM]: 99,
  [ItemType.MATERIAL]: 99,
  [ItemType.QUEST]: 1,
}

/**
 * 判断物品是否可堆叠
 * @param item - 物品
 * @returns 是否可堆叠
 */
export function isStackable(item: Item): boolean {
  return STACK_LIMITS[item.type] > 1
}

/**
 * 判断物品是否可装备
 * @param item - 物品
 * @returns 是否可装备
 */
export function isEquipable(item: Item): boolean {
  return item.slot !== undefined
}
