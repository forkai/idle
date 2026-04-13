/**
 * @fileoverview 成就Store
 * @description 管理成就状态、进度检测和奖励发放
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { AchievementJson } from '@/types/achievement'
import { getAchievementById, getAchievementsJson } from '@/constants/achievements'
import { usePlayerStore } from './playerStore'
import { useEnhancementStore } from './enhancementStore'
import { EnhancementStoneType } from '@/constants/enhancement'

/**
 * 成就Store状态
 */
interface AchievementStoreState {
  /** 已解锁的成就ID集合 */
  unlockedIds: Set<string>
  /** 各成就的当前进度 */
  progress: Record<string, number>
  /** 成就点数 */
  points: number
}

/**
 * 成就Store动作
 */
interface AchievementActions {
  /** 检查并更新某个条件的进度 */
  updateProgress: (type: string, value: number) => void
  /** 解锁指定成就 */
  unlockAchievement: (id: string) => void
  /** 检查所有成就是否满足解锁条件 */
  checkAllAchievements: () => void
  /** 获取成就进度百分比 */
  getProgress: (id: string) => number
  /** 是否已解锁 */
  isUnlocked: (id: string) => boolean
  /** 获取已解锁成就数 */
  getUnlockedCount: () => number
  /** 获取成就数据 */
  getAchievement: (id: string) => AchievementJson | undefined
  /** 获取所有成就 */
  getAllAchievements: () => AchievementJson[]
  /** 重置成就数据 */
  resetAchievements: () => void
}

/**
 * 成就Store
 */
export const useAchievementStore = create<AchievementStoreState & AchievementActions>()(
  persist(
    immer((set, get) => ({
      unlockedIds: new Set<string>(),
      progress: {},
      points: 0,

      /**
       * 更新某个条件的进度
       */
      updateProgress: (type, value) => {
        set(state => {
          const currentProgress = state.progress[type] ?? 0
          if (value > currentProgress) {
            state.progress[type] = value
          }
        })
        get().checkAllAchievements()
      },

      /**
       * 解锁指定成就
       */
      unlockAchievement: (id) => {
        const state = get()
        if (state.unlockedIds.has(id)) return

        const achievement = getAchievementById(id)
        if (!achievement) return

        set(state => {
          state.unlockedIds.add(id)
          state.progress[achievement.conditionType] = achievement.conditionTarget
        })

        // 发放奖励
        const playerStore = usePlayerStore.getState()
        const enhancementStore = useEnhancementStore.getState()

        if (achievement.rewardGold) {
          playerStore.addGold(achievement.rewardGold)
        }
        if (achievement.rewardExp) {
          playerStore.addExperience(achievement.rewardExp)
        }
        if (achievement.rewardEnhancementStone && achievement.rewardEnhancementStoneCount) {
          const stoneMap: Record<string, EnhancementStoneType> = {
            normal: EnhancementStoneType.NORMAL,
            advanced: EnhancementStoneType.ADVANCED,
            perfect: EnhancementStoneType.PERFECT,
          }
          const stoneType = stoneMap[achievement.rewardEnhancementStone] ?? EnhancementStoneType.NORMAL
          enhancementStore.addStones(stoneType, achievement.rewardEnhancementStoneCount)
        }

        set(state => {
          state.points += 1
        })
      },

      /**
       * 检查所有成就
       */
      checkAllAchievements: () => {
        const state = get()
        const progress = state.progress

        for (const achievement of getAchievementsJson()) {
          if (state.unlockedIds.has(achievement.id)) continue

          const currentProgress = progress[achievement.conditionType] ?? 0

          if (currentProgress >= achievement.conditionTarget) {
            get().unlockAchievement(achievement.id)
          }
        }
      },

      /**
       * 获取成就进度百分比
       */
      getProgress: (id) => {
        const state = get()
        const achievement = getAchievementById(id)
        if (!achievement) return 0

        if (state.unlockedIds.has(id)) return 100

        const currentProgress = state.progress[achievement.conditionType] ?? 0
        const progressPercent = (currentProgress / achievement.conditionTarget) * 100
        return Math.min(100, Math.max(0, progressPercent))
      },

      /**
       * 是否已解锁
       */
      isUnlocked: (id) => {
        return get().unlockedIds.has(id)
      },

      /**
       * 获取已解锁成就数
       */
      getUnlockedCount: () => {
        return get().unlockedIds.size
      },

      /**
       * 获取成就数据
       */
      getAchievement: (id) => {
        return getAchievementById(id)
      },

      /**
       * 获取所有成就（带当前状态）
       */
      getAllAchievements: () => {
        const state = get()
        return getAchievementsJson().map(achievement => ({
          ...achievement,
          unlocked: state.unlockedIds.has(achievement.id),
          progress: state.progress[achievement.conditionType] ?? 0,
        }))
      },

      /**
       * 重置成就数据
       */
      resetAchievements: () => {
        set(() => ({
          unlockedIds: new Set<string>(),
          progress: {},
          points: 0,
        }))
      },
    })),
    {
      name: 'diablo-idle-achievements',
      partialize: (state) => ({
        progress: state.progress,
        points: state.points,
        unlockedIds: Array.from(state.unlockedIds),
      }),
      merge: (persisted, current) => {
        const persistedData = persisted as { unlockedIds?: string[]; progress?: Record<string, number>; points?: number }
        return {
          ...current,
          unlockedIds: new Set(persistedData?.unlockedIds ?? []),
          progress: persistedData?.progress ?? {},
          points: persistedData?.points ?? 0,
        }
      },
    }
  )
)

// 便捷的进度更新函数（供其他模块调用）
export function updateAchievementProgress(type: string, value: number) {
  useAchievementStore.getState().updateProgress(type, value)
}
