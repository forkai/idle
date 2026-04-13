/**
 * @fileoverview 排行榜状态管理
 * @description 管理本地积分榜、每日/每周挑战
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LeaderboardEntry, Challenge } from '@/types/leaderboard'
import { ChallengeType, LeaderboardType } from '@/types/leaderboard'

/**
 * 排行榜状态接口
 */
interface LeaderboardState {
  /** 排行榜条目 */
  entries: LeaderboardEntry[]
  /** 每日挑战 */
  dailyChallenges: Challenge[]
  /** 每周挑战 */
  weeklyChallenges: Challenge[]
  /** 每日挑战重置时间 */
  dailyResetTime: number
  /** 每周挑战重置时间 */
  weeklyResetTime: number
}

/**
 * 排行榜动作接口
 */
interface LeaderboardActions {
  /** 提交分数 */
  submitScore: (entry: Omit<LeaderboardEntry, 'timestamp'>) => void
  /** 获取排行榜 */
  getLeaderboard: (type: LeaderboardType, limit?: number) => LeaderboardEntry[]
  /** 更新挑战进度 */
  updateChallengeProgress: (type: ChallengeType, value: number) => void
  /** 领取挑战奖励 */
  claimChallengeReward: (challengeId: string) => void
  /** 重置挑战 */
  resetChallenges: () => void
  /** 检查挑战状态 */
  checkChallengeCompletion: () => void
  /** 获取玩家排名 */
  getPlayerRank: (playerId: string, type: LeaderboardType) => number
}

/**
 * 默认每日挑战
 */
function getDefaultDailyChallenges(): Challenge[] {
  const now = Date.now()
  const endOfDay = new Date()
  endOfDay.setHours(23, 59, 59, 999)

  return [
    {
      id: 'daily_kills_1',
      name: '今日击杀',
      description: '今日击杀100只怪物',
      type: 'daily',
      startTime: now,
      endTime: endOfDay.getTime(),
      targetValue: 100,
      currentValue: 0,
      rewards: { gold: 500, exp: 200 },
      completed: false,
    },
    {
      id: 'daily_gold_1',
      name: '今日赚金',
      description: '今日获得5000金币',
      type: 'daily',
      startTime: now,
      endTime: endOfDay.getTime(),
      targetValue: 5000,
      currentValue: 0,
      rewards: { gold: 300 },
      completed: false,
    },
    {
      id: 'daily_zone_1',
      name: '区域探索',
      description: '完成任意区域战斗5次',
      type: 'daily',
      startTime: now,
      endTime: endOfDay.getTime(),
      targetValue: 5,
      currentValue: 0,
      rewards: { exp: 500 },
      completed: false,
    },
  ]
}

/**
 * 默认每周挑战
 */
function getDefaultWeeklyChallenges(): Challenge[] {
  const now = Date.now()
  const endOfWeek = new Date()
  endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()))
  endOfWeek.setHours(23, 59, 59, 999)

  return [
    {
      id: 'weekly_level_1',
      name: '周末冲级',
      description: '本周达到30级',
      type: 'weekly',
      startTime: now,
      endTime: endOfWeek.getTime(),
      targetValue: 30,
      currentValue: 1,
      rewards: { gold: 5000, exp: 2000 },
      completed: false,
    },
    {
      id: 'weekly_boss_1',
      name: 'Boss猎人',
      description: '本周击败10只BOSS',
      type: 'weekly',
      startTime: now,
      endTime: endOfWeek.getTime(),
      targetValue: 10,
      currentValue: 0,
      rewards: { gold: 3000 },
      completed: false,
    },
    {
      id: 'weekly_kills_1',
      name: '周击杀王',
      description: '本周击杀2000只怪物',
      type: 'weekly',
      startTime: now,
      endTime: endOfWeek.getTime(),
      targetValue: 2000,
      currentValue: 0,
      rewards: { exp: 5000 },
      completed: false,
    },
  ]
}

/**
 * 排行榜Store
 */
export const useLeaderboardStore = create<LeaderboardState & LeaderboardActions>()(
  persist(
    (set, get) => ({
      entries: [],
      dailyChallenges: getDefaultDailyChallenges(),
      weeklyChallenges: getDefaultWeeklyChallenges(),
      dailyResetTime: Date.now(),
      weeklyResetTime: Date.now(),

      /**
       * 提交分数
       */
      submitScore: (entry) => {
        const newEntry: LeaderboardEntry = {
          ...entry,
          timestamp: Date.now(),
        }
        set((state) => ({
          entries: [...state.entries, newEntry].slice(0, 100), // 保留前100条
        }))
      },

      /**
       * 获取排行榜
       */
      getLeaderboard: (type, limit = 10) => {
        const { entries } = get()
        const sorted = [...entries].sort((a, b) => {
          switch (type) {
            case LeaderboardType.LEVEL:
              return b.level - a.level
            case LeaderboardType.KILLS:
              return b.totalKills - a.totalKills
            case LeaderboardType.GOLD:
              return b.totalGold - a.totalGold
            case LeaderboardType.DAMAGE:
              return b.maxDamage - a.maxDamage
            default:
              return b.timestamp - a.timestamp
          }
        })
        return sorted.slice(0, limit)
      },

      /**
       * 更新挑战进度
       */
      updateChallengeProgress: (type, value) => {
        set((state) => {
          const updateChallenge = (challenges: Challenge[]): Challenge[] =>
            challenges.map((c) => {
              if (c.type === 'daily' && c.id.includes(type.replace('_', '_'))) {
                const newValue = c.currentValue + value
                return {
                  ...c,
                  currentValue: newValue,
                  completed: newValue >= c.targetValue,
                }
              }
              return c
            })

          return {
            dailyChallenges: updateChallenge(state.dailyChallenges),
            weeklyChallenges: state.weeklyChallenges.map((c) => {
              if (c.id.includes(type.replace('_', '_'))) {
                const newValue = c.currentValue + value
                return {
                  ...c,
                  currentValue: newValue,
                  completed: newValue >= c.targetValue,
                }
              }
              return c
            }),
          }
        })
      },

      /**
       * 领取挑战奖励
       */
      claimChallengeReward: (challengeId) => {
        set((state) => ({
          dailyChallenges: state.dailyChallenges.map((c) =>
            c.id === challengeId ? { ...c, completed: true } : c
          ),
          weeklyChallenges: state.weeklyChallenges.map((c) =>
            c.id === challengeId ? { ...c, completed: true } : c
          ),
        }))
      },

      /**
       * 重置挑战
       */
      resetChallenges: () => {
        const now = Date.now()
        const endOfDay = new Date()
        endOfDay.setHours(23, 59, 59, 999)

        const endOfWeek = new Date()
        endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()))
        endOfWeek.setHours(23, 59, 59, 999)

        set({
          dailyChallenges: getDefaultDailyChallenges().map((c) => ({
            ...c,
            startTime: now,
            endTime: endOfDay.getTime(),
          })),
          weeklyChallenges: getDefaultWeeklyChallenges().map((c) => ({
            ...c,
            startTime: now,
            endTime: endOfWeek.getTime(),
          })),
          dailyResetTime: now,
          weeklyResetTime: now,
        })
      },

      /**
       * 检查挑战完成状态
       */
      checkChallengeCompletion: () => {
        const now = Date.now()
        set((state) => {
          // 检查是否需要重置每日挑战
          if (now >= state.dailyResetTime + 24 * 60 * 60 * 1000) {
            const endOfDay = new Date()
            endOfDay.setHours(23, 59, 59, 999)
            return {
              dailyChallenges: getDefaultDailyChallenges().map((c) => ({
                ...c,
                startTime: now,
                endTime: endOfDay.getTime(),
              })),
              dailyResetTime: now,
            }
          }
          return state
        })
      },

      /**
       * 获取玩家排名
       */
      getPlayerRank: (playerId, type) => {
        const leaderboard = get().getLeaderboard(type, 100)
        const index = leaderboard.findIndex((e) => e.playerId === playerId)
        return index === -1 ? -1 : index + 1
      },
    }),
    {
      name: 'leaderboard-storage',
    }
  )
)
