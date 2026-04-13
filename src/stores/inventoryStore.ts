/**
 * @fileoverview 背包状态管理Store
 * @description 管理玩家背包，包括物品添加、移除、使用、排序等操作
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { Item, Inventory } from '@/types/items'
import { DEFAULT_INVENTORY_SIZE } from '@/types/items'

/**
 * 背包Store状态接口
 */
interface InventoryStoreState {
  /** 背包数据（slots数组 + 统计信息） */
  inventory: Inventory
}

/**
 * 背包Store动作接口
 */
interface InventoryActions {
  /** 添加物品到背包（自动处理堆叠），背包满返回false */
  addToInventory: (item: Item) => boolean
  /** 从背包移除指定物品（可指定数量） */
  removeFromInventory: (itemId: string, quantity?: number) => boolean
  /** 使用物品，成功返回被使用物品的效果描述 */
  useItem: (itemId: string, onHeal: (hp: number, mp: number) => void) => boolean
  /** 移动物品到指定槽位 */
  moveItem: (fromIndex: number, toIndex: number) => void
  /** 按稀有度和类型排序背包 */
  sortItems: () => void
  /** 获取可用空槽位数量 */
  getAvailableSlots: () => number
  /** 重置背包（新游戏时） */
  resetInventory: () => void
  /** 直接设置slots（装备/卸装时同步调用） */
  setSlots: (slots: (Item | null)[]) => void
  /** 更新背包中的物品（如强化后的物品） */
  updateItem: (item: Item) => void
}

/**
 * 创建初始背包状态
 */
function createEmptyInventory(): Inventory {
  return {
    slots: Array(DEFAULT_INVENTORY_SIZE).fill(null),
    usedSlots: 0,
    maxSlots: DEFAULT_INVENTORY_SIZE,
  }
}

/**
 * 将物品放入slots（处理堆叠逻辑）
 * @returns 更新后的slots，背包满返回null
 */
export function addItemToSlots(slots: (Item | null)[], item: Item): (Item | null)[] | null {
  const newSlots = [...slots]

  // 可堆叠物品（药水等）先尝试合并
  if (item.type === 'potion' || item.quantity > 1) {
    for (let i = 0; i < newSlots.length; i++) {
      const slot = newSlots[i]
      if (slot && slot.name === item.name && slot.rarity === item.rarity) {
        newSlots[i] = { ...slot, quantity: slot.quantity + item.quantity }
        return newSlots
      }
    }
  }

  // 查找空槽位
  const emptyIndex = newSlots.findIndex(slot => slot === null)
  if (emptyIndex === -1) return null

  newSlots[emptyIndex] = { ...item }
  return newSlots
}

/**
 * 从slots中移除指定数量的物品
 */
export function removeItemFromSlots(
  slots: (Item | null)[],
  itemId: string,
  quantity: number = 1
): (Item | null)[] {
  const newSlots = [...slots]
  const idx = newSlots.findIndex(slot => slot && slot.id === itemId)
  if (idx === -1) return newSlots

  const item = newSlots[idx]!
  if (item.quantity <= quantity) {
    newSlots[idx] = null
  } else {
    newSlots[idx] = { ...item, quantity: item.quantity - quantity }
  }
  return newSlots
}

/**
 * 稀有度排序权重（数值越大越靠前）
 */
const RARITY_ORDER: Record<string, number> = {
  unique: 5,
  set: 4,
  rare: 3,
  magic: 2,
  normal: 1,
}

/**
 * 背包状态Store
 */
export const useInventoryStore = create<InventoryStoreState & InventoryActions>()(
  persist(
    immer((set, get) => ({
      inventory: createEmptyInventory(),

      /**
       * 向背包添加物品
       * 药水、箭矢等自动堆叠；背包满则返回false
       */
      addToInventory: (item: Item) => {
        const state = get()
        const updated = addItemToSlots(state.inventory.slots, item)
        if (!updated) return false

        set(state => {
          state.inventory.slots = updated
          state.inventory.usedSlots = updated.filter(Boolean).length
        })
        return true
      },

      /**
       * 从背包移除物品（可部分移除堆叠）
       */
      removeFromInventory: (itemId: string, quantity = 1) => {
        set(state => {
          const updated = removeItemFromSlots(state.inventory.slots, itemId, quantity)
          state.inventory.slots = updated
          state.inventory.usedSlots = updated.filter(Boolean).length
        })
        return true
      },

      /**
       * 使用物品（当前支持药水）
       * @param onHeal 回调，传入HP/MP恢复量（交由playerStore处理）
       */
      useItem: (itemId: string, onHeal: (hp: number, mp: number) => void) => {
        const state = get()
        const idx = state.inventory.slots.findIndex(slot => slot && slot.id === itemId)
        if (idx === -1) return false

        const item = state.inventory.slots[idx]
        if (!item) return false

        if (item.type === 'potion') {
          let hp = 0
          let mp = 0
          if (item.name.includes('生命')) hp = 50
          if (item.name.includes('法力')) mp = 30

          onHeal(hp, mp)

          set(state => {
            const slot = state.inventory.slots[idx]
            if (!slot) return
            if (slot.quantity > 1) {
              state.inventory.slots[idx] = { ...slot, quantity: slot.quantity - 1 }
            } else {
              state.inventory.slots[idx] = null
            }
            state.inventory.usedSlots = state.inventory.slots.filter(Boolean).length
          })
          return true
        }

        return false
      },

      /**
       * 在背包内移动物品（交换两个槽位）
       */
      moveItem: (fromIndex: number, toIndex: number) => {
        set(state => {
          const temp = state.inventory.slots[fromIndex]
          state.inventory.slots[fromIndex] = state.inventory.slots[toIndex]
          state.inventory.slots[toIndex] = temp
        })
      },

      /**
       * 按稀有度 → 类型 → 名称排序背包
       */
      sortItems: () => {
        set(state => {
          const items = state.inventory.slots.filter(Boolean) as Item[]
          items.sort((a, b) => {
            const ra = RARITY_ORDER[a.rarity] ?? 0
            const rb = RARITY_ORDER[b.rarity] ?? 0
            if (ra !== rb) return rb - ra
            if (a.type !== b.type) return a.type.localeCompare(b.type)
            return a.name.localeCompare(b.name)
          })

          const newSlots: (Item | null)[] = Array(DEFAULT_INVENTORY_SIZE).fill(null)
          items.forEach((item, i) => {
            newSlots[i] = item
          })
          state.inventory.slots = newSlots
        })
      },

      /**
       * 获取背包空余槽位数
       */
      getAvailableSlots: () => {
        return get().inventory.slots.filter(slot => slot === null).length
      },

      /**
       * 重置背包（新游戏时调用）
       */
      resetInventory: () => {
        set(() => ({ inventory: createEmptyInventory() }))
      },

      /**
       * 直接设置slots（供equipmentStore调用）
       */
      setSlots: (slots: (Item | null)[]) => {
        set(state => {
          state.inventory.slots = slots
          state.inventory.usedSlots = slots.filter(Boolean).length
        })
      },

      /**
       * 更新背包中的物品（如强化后的物品）
       */
      updateItem: (item: Item) => {
        set(state => {
          const idx = state.inventory.slots.findIndex(slot => slot && slot.id === item.id)
          if (idx !== -1) {
            state.inventory.slots[idx] = item
          }
        })
      },
    })),
    {
      name: 'diablo-idle-inventory',
      partialize: (state) => ({ inventory: state.inventory }),
    }
  )
)
