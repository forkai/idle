/**
 * @fileoverview 装备状态管理Store
 * @description 管理玩家10个装备槽位，处理装备穿戴、卸下、交换操作
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { EquipmentState, Item, EquipmentSlot } from '@/types/items'
import { addItemToSlots, removeItemFromSlots, useInventoryStore } from './inventoryStore'

/**
 * 创建空装备状态（10个槽位全为null）
 */
function createEmptyEquipment(): EquipmentState {
  return {
    head: null,
    chest: null,
    gloves: null,
    boots: null,
    belt: null,
    shield: null,
    ring1: null,
    ring2: null,
    amulet: null,
    weapon: null,
  }
}

/**
 * 装备Store状态接口
 */
interface EquipmentStoreState {
  /** 10个装备槽位，null表示空 */
  equipment: EquipmentState
}

/**
 * 装备Store动作接口
 */
interface EquipmentActions {
  /**
   * 装备背包中的物品到对应槽位
   * 若槽位已有装备，旧装备放回背包
   * @returns 装备成功返回true，失败返回false
   */
  equipItem: (item: Item) => boolean
  /**
   * 卸下指定槽位装备，放回背包
   * @returns 卸下的物品，背包满或槽位为空则返回null
   */
  unequipItem: (slot: EquipmentSlot) => Item | null
  /**
   * 交换两个装备槽位（同类型槽位间）
   */
  swapItems: (slotA: EquipmentSlot, slotB: EquipmentSlot) => void
  /**
   * 重置所有装备（新游戏时调用）
   */
  resetEquipment: () => void
  /**
   * 获取当前装备提供的所有词缀属性加成（用于属性计算）
   */
  getEquipmentBonuses: () => Record<string, number>
}

/**
 * 装备状态Store
 */
export const useEquipmentStore = create<EquipmentStoreState & EquipmentActions>()(
  persist(
    immer((set, get) => ({
      equipment: createEmptyEquipment(),

      /**
       * 装备物品
       * 流程：将旧装备移入背包 → 将物品装入槽位 → 从背包移除该物品
       */
      equipItem: (item: Item) => {
        if (!item.slot) return false

        const slot = item.slot as EquipmentSlot
        const { equipment } = get()
        const currentEquipped = equipment[slot]

        const inventoryStore = useInventoryStore.getState()
        const currentSlots = inventoryStore.inventory.slots

        let newSlots = [...currentSlots]

        // 如果槽位有旧装备，先尝试放回背包
        if (currentEquipped) {
          const updatedSlots = addItemToSlots(newSlots, currentEquipped)
          if (!updatedSlots) {
            // 背包没空间容纳旧装备，装备失败
            return false
          }
          newSlots = updatedSlots
        }

        // 从背包移除要装备的物品
        newSlots = removeItemFromSlots(newSlots, item.id)

        // 同步更新背包
        inventoryStore.setSlots(newSlots)

        // 更新装备槽位
        set(state => {
          state.equipment[slot] = item
        })

        return true
      },

      /**
       * 卸下指定槽位装备
       */
      unequipItem: (slot: EquipmentSlot) => {
        const { equipment } = get()
        const item = equipment[slot]
        if (!item) return null

        const inventoryStore = useInventoryStore.getState()
        const updatedSlots = addItemToSlots(inventoryStore.inventory.slots, item)
        if (!updatedSlots) return null // 背包满

        inventoryStore.setSlots(updatedSlots)

        set(state => {
          state.equipment[slot] = null
        })

        return item
      },

      /**
       * 交换两个装备槽位
       */
      swapItems: (slotA: EquipmentSlot, slotB: EquipmentSlot) => {
        set(state => {
          const temp = state.equipment[slotA]
          state.equipment[slotA] = state.equipment[slotB]
          state.equipment[slotB] = temp
        })
      },

      /**
       * 重置所有装备
       */
      resetEquipment: () => {
        set(() => ({ equipment: createEmptyEquipment() }))
      },

      /**
       * 收集所有装备的词缀加成，合并成统一的属性映射
       */
      getEquipmentBonuses: () => {
        const { equipment } = get()
        const bonuses: Record<string, number> = {}

        for (const item of Object.values(equipment)) {
          if (!item) continue
          for (const affix of item.affixes) {
            // AffixEffect 是命名字段对象，遍历每个非undefined的效果值
            for (const [key, val] of Object.entries(affix.effects)) {
              if (typeof val === 'number') {
                bonuses[key] = (bonuses[key] ?? 0) + val
              }
            }
          }
        }

        return bonuses
      },
    })),
    {
      name: 'diablo-idle-equipment',
      partialize: (state) => ({ equipment: state.equipment }),
    }
  )
)
