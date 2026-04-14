/**
 * @fileoverview 成就面板组件
 * @description 展示成就列表和进度
 */

'use client'

import { useState } from 'react'
import { useAchievementStore } from '@/stores/achievementStore'
import { getTotalAchievementCount } from '@/constants/achievements'
import type { AchievementJson } from '@/types/achievement'
import { AchievementCategory, AchievementCategoryInfo } from '@/types/achievement'

/**
 * 成就数据（带状态）
 */
interface AchievementWithState extends AchievementJson {
  unlocked: boolean
  progress: number
}

/**
 * 成就卡片组件
 */
function AchievementCard({ achievement }: { achievement: AchievementWithState }) {
  const progressPercent = Math.min(100, (achievement.progress / achievement.conditionTarget) * 100)

  return (
    <div className={`
      p-3 rounded-lg border transition-all
      ${achievement.unlocked
        ? 'bg-amber-900/20 border-amber-600'
        : 'bg-gray-900/50 border-gray-700'
      }
    `}>
      <div className="flex items-start gap-3">
        <span className={`text-2xl ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
          {achievement.icon}
        </span>
        <div className="flex-1 min-w-0">
          <p className={`font-medium ${achievement.unlocked ? 'text-amber-400' : 'text-gray-300'}`}>
            {achievement.name}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{achievement.description}</p>

          {/* 进度条 */}
          {!achievement.unlocked && (
            <div className="mt-2">
              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-600 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-500 mt-0.5">
                {achievement.progress} / {achievement.conditionTarget}
              </p>
            </div>
          )}

          {/* 已解锁 */}
          {achievement.unlocked && (
            <p className="text-[10px] text-amber-500 mt-1">✓ 已解锁</p>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * 成就面板主组件
 */
export function AchievementPanel() {
  const store = useAchievementStore()
  const [activeCategory, setActiveCategory] = useState<AchievementCategory | 'all'>('all')

  const allAchievements = store.getAllAchievements() as AchievementWithState[]
  const filteredAchievements = activeCategory === 'all'
    ? allAchievements
    : allAchievements.filter(a => a.category === activeCategory)

  const unlockedCount = store.getUnlockedCount()
  const totalCount = getTotalAchievementCount()

  return (
    <div className="panel-game p-4">
      <h2 className="text-lg font-bold text-amber-400 mb-2">🏆 成就</h2>

      {/* 进度概览 */}
      <div className="flex items-center gap-4 mb-4 p-2 bg-gray-900/80 rounded-lg">
        <div className="text-center">
          <p className="text-xl font-bold text-amber-400">{unlockedCount}</p>
          <p className="text-[10px] text-gray-500">已解锁</p>
        </div>
        <div className="flex-1">
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-700 to-amber-500 transition-all"
              style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-gray-400">{totalCount}</p>
          <p className="text-[10px] text-gray-500">总成就</p>
        </div>
      </div>

      {/* 分类筛选 */}
      <div className="flex flex-wrap gap-1 mb-4">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-2 py-1 rounded text-xs ${activeCategory === 'all' ? 'bg-amber-600' : 'bg-gray-800'}`}
        >
          全部
        </button>
        {Object.entries(AchievementCategoryInfo).map(([key, info]) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key as AchievementCategory)}
            className={`px-2 py-1 rounded text-xs ${activeCategory === key ? 'bg-amber-600' : 'bg-gray-800'}`}
          >
            {info.icon} {info.name}
          </button>
        ))}
      </div>

      {/* 成就列表 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-96 overflow-y-auto">
        {filteredAchievements.map(achievement => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
          />
        ))}
      </div>
    </div>
  )
}
