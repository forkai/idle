/**
 * @fileoverview 词缀数据加载器
 * @description 前后缀和暗金装备的JSON数据加载
 */

import type { Affix } from '@/types/items'
import type { ItemType, EquipmentSlot } from '@/types/items'
import prefixesData from '@/data/prefixes.json'
import suffixesData from '@/data/suffixes.json'
import uniquesData from '@/data/uniques.json'

/**
 * 暗金物品接口
 */
export interface UniqueItemJson {
  id: string
  name: string
  icon: string
  type: ItemType
  slot: EquipmentSlot
  stats: Record<string, number>
  effects: Record<string, number>
  description: string
  sellPrice: number
}

/**
 * 获取所有前缀
 */
export function getPrefixes(): Affix[] {
  return prefixesData.prefixes as Affix[]
}

/**
 * 获取所有后缀
 */
export function getSuffixes(): Affix[] {
  return suffixesData.suffixes as Affix[]
}

/**
 * 根据ID获取前缀
 */
export function getPrefixById(id: string): Affix | undefined {
  return getPrefixes().find(p => p.id === id)
}

/**
 * 根据ID获取后缀
 */
export function getSuffixById(id: string): Affix | undefined {
  return getSuffixes().find(s => s.id === id)
}

/**
 * 根据ID获取词缀
 */
export function getAffixById(id: string): Affix | undefined {
  return getPrefixById(id) || getSuffixById(id)
}

/**
 * 获取所有暗金物品
 */
export function getUniques(): UniqueItemJson[] {
  return uniquesData.uniques as unknown as UniqueItemJson[]
}

/**
 * 根据ID获取暗金物品
 */
export function getUniqueById(id: string): UniqueItemJson | undefined {
  return getUniques().find(u => u.id === id)
}

/**
 * 根据类型获取暗金物品
 */
export function getUniquesByType(type: ItemType): UniqueItemJson[] {
  return getUniques().filter(u => u.type === type)
}

/**
 * 根据等级过滤可用前缀
 */
export function getPrefixesByLevel(level: number): Affix[] {
  return getPrefixes().filter(p => p.minLevel <= level)
}

/**
 * 根据等级过滤可用后缀
 */
export function getSuffixesByLevel(level: number): Affix[] {
  return getSuffixes().filter(s => s.minLevel <= level)
}

/**
 * 获取词缀总数量
 */
export function getTotalAffixCount(): { prefixes: number; suffixes: number; uniques: number } {
  return {
    prefixes: getPrefixes().length,
    suffixes: getSuffixes().length,
    uniques: getUniques().length,
  }
}
