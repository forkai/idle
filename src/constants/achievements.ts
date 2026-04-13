/**
 * @fileoverview 成就数据加载器
 * @description 从JSON文件加载成就数据
 */

import type { AchievementJson } from '@/types/achievement'

// 导入JSON数据
import achievementsData from '@/data/achievements.json'

/**
 * 获取所有成就数据（JSON格式）
 */
export function getAchievementsJson(): AchievementJson[] {
  return achievementsData.achievements as AchievementJson[]
}

/**
 * 根据ID获取成就
 */
export function getAchievementById(id: string): AchievementJson | undefined {
  return getAchievementsJson().find(a => a.id === id)
}

/**
 * 根据类别获取成就列表
 */
export function getAchievementsByCategory(category: string): AchievementJson[] {
  return getAchievementsJson().filter(a => a.category === category)
}

/**
 * 获取成就总数
 */
export function getTotalAchievementCount(): number {
  return getAchievementsJson().length
}
