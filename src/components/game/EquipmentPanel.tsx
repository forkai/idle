/**
 * @fileoverview 装备面板组件（暗黑破坏神风格）
 * @description 人形中心布局，右侧背包网格支持拖拽穿戴
 */

'use client'

import { useState, useCallback } from 'react'
import { useInventoryStore } from '@/stores/inventoryStore'
import { useEquipmentStore } from '@/stores/equipmentStore'
import { useGameStore } from '@/stores/gameStore'
import { EquipmentSlot, SlotNames, RarityInfo, ItemType } from '@/types/items'
import type { Item } from '@/types/items'
import { playSound } from '@/lib/game/sound'
import { EquipTooltip } from './EquipTooltip'
import { EquipSlotButton, SLOT_LAYOUT } from './EquipSlotButton'
import { BackpackSlot } from './BackpackSlot'

/** 背包网格列数 */
const GRID_COLS = 6

/**
 * 装备面板主组件（暗黑破坏神风格）
 * 左侧：人形轮廓 + 装备槽
 * 右侧：背包网格（支持拖拽到左侧装备槽穿戴）
 */
export function EquipmentPanel() {
  const { equipment, unequipItem } = useEquipmentStore()
  const { inventory, moveItem } = useInventoryStore()
  const { refreshComputedStats } = useGameStore()
  const [hoveredItem, setHoveredItem] = useState<{ item: Item; pos: { x: number; y: number } } | null>(null)
  const [selectedBackpackSlot, setSelectedBackpackSlot] = useState<number | null>(null)
  const [dragFrom, setDragFrom] = useState<number | null>(null)
  const [dragOver, setDragOver] = useState<number | null>(null)
  const [dragOverSlot, setDragOverSlot] = useState<EquipmentSlot | null>(null)

  // === 背包内部拖拽（整理） ===
  const handleBackpackDragStart = useCallback((index: number) => {
    setDragFrom(index)
    playSound('click')
  }, [])

  const handleBackpackDragOver = useCallback((index: number) => {
    setDragOver(index)
  }, [])

  const handleBackpackDrop = useCallback((index: number) => {
    if (dragFrom !== null && dragFrom !== index) {
      moveItem(dragFrom, index)
      playSound('pickup')
    }
    setDragFrom(null)
    setDragOver(null)
  }, [dragFrom, moveItem])

  const handleBackpackDragEnd = useCallback(() => {
    setDragFrom(null)
    setDragOver(null)
  }, [])

  const handleBackpackClick = useCallback((index: number) => {
    if (dragFrom !== null) return
    if (selectedBackpackSlot === null) {
      setSelectedBackpackSlot(index)
    } else if (selectedBackpackSlot === index) {
      setSelectedBackpackSlot(null)
    } else {
      moveItem(selectedBackpackSlot, index)
      playSound('pickup')
      setSelectedBackpackSlot(null)
    }
  }, [dragFrom, selectedBackpackSlot, moveItem])

  // === 装备槽拖拽（穿戴） ===
  const handleSlotDragOver = useCallback((slot: EquipmentSlot) => {
    setDragOverSlot(slot)
  }, [])

  const handleSlotDrop = useCallback((slot: EquipmentSlot) => {
    if (dragFrom !== null) {
      const item = inventory.slots[dragFrom]
      if (item?.slot !== undefined) {
        // 是装备，尝试穿戴
        const { equipItem } = useEquipmentStore.getState()
        if (equipItem(item)) {
          playSound('levelup')
          refreshComputedStats()
        }
      } else {
        // 非装备物品，放回原位
        setDragFrom(null)
        setDragOver(null)
        setDragOverSlot(null)
        return
      }
    }
    setDragFrom(null)
    setDragOver(null)
    setDragOverSlot(null)
  }, [dragFrom, inventory.slots, refreshComputedStats])

  // === 卸下装备 ===
  const handleUnequip = useCallback((slot: EquipmentSlot) => {
    const item = unequipItem(slot)
    if (item) {
      playSound('pickup')
      refreshComputedStats()
    }
  }, [unequipItem, refreshComputedStats])

  // === 穿戴选中物品 ===
  const handleEquipSelected = useCallback(() => {
    if (selectedBackpackSlot === null) return
    const item = inventory.slots[selectedBackpackSlot]
    if (item?.slot !== undefined) {
      const { equipItem } = useEquipmentStore.getState()
      if (equipItem(item)) {
        playSound('levelup')
        refreshComputedStats()
        setSelectedBackpackSlot(null)
      }
    }
  }, [selectedBackpackSlot, inventory.slots, refreshComputedStats])

  const selectedItem = selectedBackpackSlot !== null ? inventory.slots[selectedBackpackSlot] : null
  const isSelectedEquipable = selectedItem?.slot !== undefined

  // 获取可穿戴物品（非消耗品/材料）
  const equipableItems = inventory.slots.filter(
    (slot): slot is Item =>
      slot !== null &&
      slot.type !== ItemType.POTION &&
      slot.type !== ItemType.MATERIAL &&
      slot.type !== ItemType.QUEST
  )

  return (
    <div className="panel-game overflow-hidden">
      {/* 标题 */}
      <div className="relative px-4 pt-4 pb-3">
        <h2 className="text-lg font-bold text-amber-400 tracking-wider">⚔️ 装备</h2>
        <p className="text-xs text-gray-500 mt-0.5">拖拽背包物品到左侧人形槽位穿戴，点击已穿装备卸下</p>
      </div>

      <div className="px-4 pb-4">
        {/* 桌面端：两列布局 */}
        <div className="hidden md:flex gap-4">
          {/* 左列：人形装备区 */}
          <div className="w-48 shrink-0">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 text-center">👤 人物装备</p>
            <div className="relative h-[420px]">
              {/* 人形轮廓 */}
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                <span className="text-[120px] leading-none select-none">🧍</span>
              </div>
              {/* 中心点 */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/30 pointer-events-none" />

              {/* 装备槽位 */}
              {SLOT_LAYOUT.map(slotDef => (
                <EquipSlotButton
                  key={slotDef.slot}
                  slot={slotDef.slot}
                  item={equipment[slotDef.slot]}
                  onClick={() => equipment[slotDef.slot] && handleUnequip(slotDef.slot)}
                  onDragOver={handleSlotDragOver}
                  onDrop={handleSlotDrop}
                  isDragOver={dragOverSlot === slotDef.slot}
                />
              ))}
            </div>
          </div>

          {/* 右列：背包网格 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">🎒 背包</p>
              <span className="text-xs text-gray-500">
                {inventory.usedSlots}/{inventory.maxSlots}
              </span>
            </div>

            {/* 背包网格 */}
            <div
              className="grid gap-0.5"
              style={{ gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)` }}
            >
              {inventory.slots.map((item, index) => (
                <BackpackSlot
                  key={index}
                  item={item}
                  index={index}
                  isDragOver={dragOver === index}
                  onDragStart={handleBackpackDragStart}
                  onDragOver={handleBackpackDragOver}
                  onDrop={handleBackpackDrop}
                  onDragEnd={handleBackpackDragEnd}
                  onClick={() => handleBackpackClick(index)}
                />
              ))}
            </div>

            {/* 选中物品详情 + 穿戴按钮 */}
            {selectedItem && (
              <div className="mt-3 p-3 bg-gray-950/80 rounded-lg border border-gray-700 animate-in slide-in-from-bottom-2 duration-200">
                <div className="flex items-center gap-3">
                  <div
                    className="w-14 h-14 rounded-lg border-2 flex items-center justify-center shrink-0"
                    style={{
                      borderColor: RarityInfo[selectedItem.rarity]?.color,
                      boxShadow: `inset 0 0 10px ${RarityInfo[selectedItem.rarity]?.color}40`,
                    }}
                  >
                    <span className="text-3xl">{selectedItem.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate" style={{ color: RarityInfo[selectedItem.rarity]?.color }}>
                      {selectedItem.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {RarityInfo[selectedItem.rarity]?.name} · {selectedItem.slot ? SlotNames[selectedItem.slot] : selectedItem.type}
                    </p>
                  </div>
                </div>
                {isSelectedEquipable && (
                  <button
                    onClick={handleEquipSelected}
                    className="w-full mt-2 py-2 rounded font-bold text-sm bg-gradient-to-b from-blue-800 to-blue-950 border-2 border-blue-600 text-blue-200 hover:from-blue-700 hover:to-blue-900 hover:scale-105 active:scale-95 transition-all duration-150 cursor-pointer"
                  >
                    ⚔️ 穿戴装备
                  </button>
                )}
              </div>
            )}

            {/* 空提示 */}
            {equipableItems.length === 0 && inventory.usedSlots === 0 && (
              <div className="text-center py-6">
                <p className="text-3xl opacity-20 mb-1">🎒</p>
                <p className="text-xs text-gray-500">背包空空如也</p>
              </div>
            )}
          </div>
        </div>

        {/* 移动端：垂直布局 */}
        <div className="md:hidden space-y-3">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">👤 人物装备（点击卸下）</p>
            <div className="grid grid-cols-5 gap-1">
              {SLOT_LAYOUT.map(slotDef => (
                <button
                  key={slotDef.slot}
                  onClick={() => equipment[slotDef.slot] && handleUnequip(slotDef.slot)}
                  onMouseEnter={(e) => equipment[slotDef.slot] && setHoveredItem({ item: equipment[slotDef.slot]!, pos: { x: e.clientX, y: e.clientY } })}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`
                    aspect-square rounded-lg border-2 flex flex-col items-center justify-center
                    transition-all duration-150 cursor-pointer
                    ${equipment[slotDef.slot] ? 'bg-gray-800 hover:scale-105' : 'bg-gray-900/50 border-dashed border-gray-700'}
                  `}
                  style={{
                    borderColor: equipment[slotDef.slot] ? RarityInfo[equipment[slotDef.slot]!.rarity]?.color : undefined,
                    boxShadow: equipment[slotDef.slot] ? `0 0 8px ${RarityInfo[equipment[slotDef.slot]!.rarity]?.color}44` : 'none',
                  }}
                >
                  {equipment[slotDef.slot] ? (
                    <>
                      <span className="text-xl">{equipment[slotDef.slot]!.icon}</span>
                      <span className="text-[7px] text-gray-400">{slotDef.label}</span>
                    </>
                  ) : (
                    <span className="text-base opacity-20">{slotDef.icon}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">🎒 背包</p>
              <span className="text-xs text-gray-500">{inventory.usedSlots}/{inventory.maxSlots}</span>
            </div>
            <div className="grid grid-cols-6 gap-0.5">
              {inventory.slots.map((item, index) => (
                <BackpackSlot
                  key={index}
                  item={item}
                  index={index}
                  isDragOver={dragOver === index}
                  onDragStart={handleBackpackDragStart}
                  onDragOver={handleBackpackDragOver}
                  onDrop={handleBackpackDrop}
                  onDragEnd={handleBackpackDragEnd}
                  onClick={() => handleBackpackClick(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 提示 */}
      {dragFrom !== null && (
        <div className="mx-4 mb-3 px-3 py-2 bg-amber-950/30 border border-amber-700/50 rounded text-xs text-amber-400 text-center">
          拖放到左侧装备槽穿戴，或在背包内拖拽整理
        </div>
      )}

      {hoveredItem && (
        <EquipTooltip
          item={hoveredItem.item}
          position={hoveredItem.pos}
          equipped={hoveredItem.item.slot !== undefined ? equipment[hoveredItem.item.slot!] : undefined}
        />
      )}
    </div>
  )
}
