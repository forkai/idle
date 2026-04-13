/**
 * @fileoverview 套装数据加载器
 */

import type { SetJson } from '@/types/set'
import setsData from '@/data/sets.json'

/**
 * 获取所有套装数据
 */
export function getSetsJson(): SetJson[] {
  return setsData.sets as SetJson[]
}

/**
 * 根据ID获取套装
 */
export function getSetById(id: string): SetJson | undefined {
  return getSetsJson().find(s => s.id === id)
}

/**
 * 根据装备槽位获取对应套装部件
 */
export function getSetPieceForSlot(setId: string, slot: string): SetJson['pieces'][0] | undefined {
  const set = getSetById(setId)
  return set?.pieces.find(p => p.slot === slot)
}

/**
 * 统计玩家已激活的套装效果
 */
export function calculateActiveSetBonuses(
  equippedSets: Map<string, number> // setId -> count of pieces equipped
): SetJson[] {
  const activeSets: SetJson[] = []

  for (const [setId, count] of equippedSets) {
    const set = getSetById(setId)
    if (!set) continue

    // 检查是否有激活的奖励
    const activeBonuses = set.bonuses.filter(b => b.threshold <= count)
    if (activeBonuses.length > 0) {
      activeSets.push(set)
    }
  }

  return activeSets
}

/**
 * 获取套装总件数
 */
export function getTotalSetCount(): number {
  return getSetsJson().length
}
