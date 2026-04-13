/**
 * @fileoverview 区域状态管理Store
 * @description 管理地图区域进度，包括当前区域、已解锁区域、最高层数等
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

/**
 * 单个区域的进度数据
 */
export interface ZoneProgress {
  /** 区域ID */
  zoneId: string
  /** 最高击杀数（同区域） */
  highestKills: number
  /** 是否击败过Boss */
  bossDefeated: boolean
  /** 首次完成时间戳 */
  completedAt: number | null
}

/**
 * 区域Store状态接口
 */
interface ZoneStoreState {
  /** 当前所在区域ID */
  currentZoneId: string
  /** 已解锁的区域ID集合 */
  unlockedZones: string[]
  /** 各区域的进度数据 */
  zoneProgress: Record<string, ZoneProgress>
}

/**
 * 区域Store动作接口
 */
interface ZoneActions {
  /** 切换到指定区域（需已解锁） */
  changeZone: (zoneId: string) => void
  /** 解锁新区域 */
  unlockZone: (zoneId: string) => void
  /** 记录Boss击杀 */
  recordBossKill: (zoneId: string) => void
  /** 更新区域击杀数（取最高值） */
  updateZoneKills: (zoneId: string, kills: number) => void
  /** 检查区域是否已解锁 */
  isZoneUnlocked: (zoneId: string) => boolean
  /** 重置区域进度（新游戏） */
  resetZones: () => void
}

/** 游戏初始区域 */
const INITIAL_ZONE = 'blood-marsh'

/**
 * 区域状态Store
 */
export const useZoneStore = create<ZoneStoreState & ZoneActions>()(
  persist(
    immer((set, get) => ({
      currentZoneId: INITIAL_ZONE,
      unlockedZones: [INITIAL_ZONE],
      zoneProgress: {
        [INITIAL_ZONE]: {
          zoneId: INITIAL_ZONE,
          highestKills: 0,
          bossDefeated: false,
          completedAt: null,
        },
      },

      /**
       * 切换区域
       */
      changeZone: (zoneId: string) => {
        const { unlockedZones } = get()
        if (!unlockedZones.includes(zoneId)) return

        set(state => {
          state.currentZoneId = zoneId
          // 确保该区域有进度记录
          if (!state.zoneProgress[zoneId]) {
            state.zoneProgress[zoneId] = {
              zoneId,
              highestKills: 0,
              bossDefeated: false,
              completedAt: null,
            }
          }
        })
      },

      /**
       * 解锁新区域
       */
      unlockZone: (zoneId: string) => {
        set(state => {
          if (!state.unlockedZones.includes(zoneId)) {
            state.unlockedZones.push(zoneId)
          }
          if (!state.zoneProgress[zoneId]) {
            state.zoneProgress[zoneId] = {
              zoneId,
              highestKills: 0,
              bossDefeated: false,
              completedAt: null,
            }
          }
        })
      },

      /**
       * 记录Boss击杀（可能解锁新区域）
       */
      recordBossKill: (zoneId: string) => {
        set(state => {
          if (state.zoneProgress[zoneId]) {
            state.zoneProgress[zoneId].bossDefeated = true
            state.zoneProgress[zoneId].completedAt = Date.now()
          }
        })
      },

      /**
       * 更新区域击杀数（仅更新最高记录）
       */
      updateZoneKills: (zoneId: string, kills: number) => {
        set(state => {
          const progress = state.zoneProgress[zoneId]
          if (progress && kills > progress.highestKills) {
            progress.highestKills = kills
          }
        })
      },

      /**
       * 检查区域是否已解锁
       */
      isZoneUnlocked: (zoneId: string) => {
        return get().unlockedZones.includes(zoneId)
      },

      /**
       * 重置区域进度（新游戏）
       */
      resetZones: () => {
        set(() => ({
          currentZoneId: INITIAL_ZONE,
          unlockedZones: [INITIAL_ZONE],
          zoneProgress: {
            [INITIAL_ZONE]: {
              zoneId: INITIAL_ZONE,
              highestKills: 0,
              bossDefeated: false,
              completedAt: null,
            },
          },
        }))
      },
    })),
    {
      name: 'diablo-idle-zones',
    }
  )
)
