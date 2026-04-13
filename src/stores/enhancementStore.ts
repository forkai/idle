/**
 * @fileoverview 装备强化Store
 * @description 管理装备强化相关状态和逻辑
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { Item } from '@/types/items'
import {
  EnhancementResult,
  EnhancementStoneType,
  ENHANCEMENT_CONFIG,
  MAX_ENHANCEMENT_LEVEL,
  getEnhancementSuccessRate,
} from '@/constants/enhancement'

/**
 * 强化历史记录
 */
export interface EnhancementRecord {
  itemId: string
  itemName: string
  fromLevel: number
  toLevel: number
  result: EnhancementResult
  timestamp: number
}

/**
 * 强化Store状态
 */
interface EnhancementStoreState {
  /** 背包中的强化石数量 */
  stones: Record<EnhancementStoneType, number>
  /** 强化历史记录 */
  history: EnhancementRecord[]
  /** 当前选中的待强化物品 */
  selectedItem: Item | null
}

/**
 * 强化Store动作
 */
interface EnhancementActions {
  /** 添加强化石 */
  addStones: (type: EnhancementStoneType, count: number) => void
  /** 消耗强化石 */
  consumeStones: (type: EnhancementStoneType, count: number) => boolean
  /** 选择物品 */
  selectItem: (item: Item | null) => void
  /** 执行强化 */
  enhance: (
    item: Item,
    stoneType: EnhancementStoneType,
    playerGold: number
  ) => {
    result: EnhancementResult
    newItem: Item
    goldCost: number
  }
  /** 获取强化石数量 */
  getStoneCount: (type: EnhancementStoneType) => number
  /** 清除选中物品 */
  clearSelection: () => void
}

/**
 * 创建默认强化石数量
 */
function createDefaultStones(): Record<EnhancementStoneType, number> {
  return {
    [EnhancementStoneType.NORMAL]: 10,
    [EnhancementStoneType.ADVANCED]: 3,
    [EnhancementStoneType.PERFECT]: 1,
  }
}

/**
 * 装备强化Store
 */
export const useEnhancementStore = create<EnhancementStoreState & EnhancementActions>()(
  persist(
    immer((set, get) => ({
      stones: createDefaultStones(),
      history: [],
      selectedItem: null,

      /**
       * 添加强化石
       */
      addStones: (type, count) => {
        set(state => {
          state.stones[type] += count
        })
      },

      /**
       * 消耗强化石
       */
      consumeStones: (type, count) => {
        const current = get().stones[type]
        if (current < count) return false
        set(state => {
          state.stones[type] -= count
        })
        return true
      },

      /**
       * 选择物品
       */
      selectItem: (item) => {
        set(state => {
          state.selectedItem = item
        })
      },

      /**
       * 清除选中物品
       */
      clearSelection: () => {
        set(state => {
          state.selectedItem = null
        })
      },

      /**
       * 获取强化石数量
       */
      getStoneCount: (type) => {
        return get().stones[type]
      },

      /**
       * 执行强化
       */
      enhance: (item, stoneType, playerGold) => {
        const currentLevel = item.enhancementLevel ?? 0
        const config = ENHANCEMENT_CONFIG[currentLevel]

        // 检查是否已达最大等级
        if (currentLevel >= MAX_ENHANCEMENT_LEVEL) {
          return {
            result: EnhancementResult.MAX_LEVEL,
            newItem: item,
            goldCost: 0,
          }
        }

        // 检查金币是否足够
        if (playerGold < config.goldCost) {
          return {
            result: EnhancementResult.INSUFFICIENT_MATERIALS,
            newItem: item,
            goldCost: config.goldCost,
          }
        }

        // 检查强化石是否足够
        if (get().stones[stoneType] < config.stoneCost) {
          return {
            result: EnhancementResult.INSUFFICIENT_MATERIALS,
            newItem: item,
            goldCost: config.goldCost,
          }
        }

        // 扣除材料
        get().consumeStones(stoneType, config.stoneCost)

        // 计算成功率
        const successRate = getEnhancementSuccessRate(currentLevel, stoneType)
        const roll = Math.random()

        // 创建新的物品对象（确保不可变）
        const newItem: Item = {
          ...item,
          enhancementLevel: currentLevel,
        }

        // 记录历史
        const record: EnhancementRecord = {
          itemId: item.id,
          itemName: item.name,
          fromLevel: currentLevel,
          toLevel: currentLevel,
          result: EnhancementResult.SUCCESS,
          timestamp: Date.now(),
        }

        if (roll < successRate) {
          // 强化成功
          newItem.enhancementLevel = currentLevel + 1
          record.toLevel = currentLevel + 1
          record.result = EnhancementResult.SUCCESS

          set(state => {
            state.history.unshift(record)
            if (state.history.length > 50) {
              state.history = state.history.slice(0, 50)
            }
          })

          return {
            result: EnhancementResult.SUCCESS,
            newItem,
            goldCost: config.goldCost,
          }
        } else {
          // 强化失败
          const breakRate = config.breakChance / 100
          const degradeRate = config.degradeChance / 100

          if (roll < breakRate + successRate) {
            // 装备损坏（降为0级）
            newItem.enhancementLevel = 0
            record.result = EnhancementResult.BREAK
          } else {
            // 等级下降
            newItem.enhancementLevel = Math.max(0, currentLevel - 1)
            record.toLevel = newItem.enhancementLevel
            record.result = EnhancementResult.DEGRADE
          }

          set(state => {
            state.history.unshift(record)
            if (state.history.length > 50) {
              state.history = state.history.slice(0, 50)
            }
          })

          return {
            result: record.result,
            newItem,
            goldCost: config.goldCost,
          }
        }
      },
    })),
    {
      name: 'diablo-idle-enhancement',
      partialize: (state) => ({
        stones: state.stones,
        history: state.history,
      }),
    }
  )
)
