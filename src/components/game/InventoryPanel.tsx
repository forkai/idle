/**
 * @fileoverview 背包面板组件
 * @description 展示玩家背包物品，支持物品详情、拖拽移动、堆叠
 */

'use client'

import { useState, useRef, useCallback } from 'react'
import { useInventoryStore } from '@/stores/inventoryStore'
import { useGameStore } from '@/stores/gameStore'
import { ItemRarity, RarityInfo, ItemType } from '@/types/items'
import type { Item } from '@/types/items'
import { playSound } from '@/lib/game/sound'

/**
 * 物品详情提示框
 */
function ItemTooltip({ item, position }: { item: Item; position: { x: number; y: number } }) {
  const tooltipStyle = {
    left: Math.min(position.x + 16, window.innerWidth - 300),
    top: Math.min(position.y - 8, window.innerHeight - 380),
  }

  const rarityColor = RarityInfo[item.rarity]?.color ?? '#fff'
  const isEquipable = item.slot !== undefined

  return (
    <div
      className="fixed z-50 w-72 bg-gray-900/95 border border-gray-500 rounded-lg shadow-2xl shadow-black/80 p-3 pointer-events-none animate-in fade-in zoom-in-95 duration-150"
      style={tooltipStyle}
    >
      {/* 顶部装饰线 */}
      <div className="absolute top-0 left-3 right-3 h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

      {/* 物品名称 */}
      <p className="font-bold text-sm mb-1" style={{ color: rarityColor }}>
        {item.icon} {item.name}
      </p>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs px-1.5 py-0.5 rounded border" style={{ color: rarityColor, borderColor: rarityColor }}>
          {RarityInfo[item.rarity]?.name}
        </span>
        <span className="text-xs text-gray-400">{item.type}</span>
      </div>

      {/* 属性 */}
      {isEquipable && item.stats && (
        <div className="mb-2 space-y-0.5">
          {item.stats.damage !== undefined && (
            <p className="text-xs text-red-400">⚔️ 伤害 <span className="text-gray-300">+{item.stats.damage}</span></p>
          )}
          {item.stats.defense !== undefined && (
            <p className="text-xs text-blue-400">🛡️ 防御 <span className="text-gray-300">+{item.stats.defense}</span></p>
          )}
          {item.stats.health !== undefined && (
            <p className="text-xs text-green-400">❤️ 生命 <span className="text-gray-300">+{item.stats.health}</span></p>
          )}
          {item.stats.mana !== undefined && (
            <p className="text-xs text-blue-300">💧 法力 <span className="text-gray-300">+{item.stats.mana}</span></p>
          )}
          {item.stats.attackSpeed !== undefined && (
            <p className="text-xs text-yellow-400">⚡ 攻速 <span className="text-gray-300">+{item.stats.attackSpeed}</span></p>
          )}
          {item.stats.critChance !== undefined && (
            <p className="text-xs text-orange-400">💥 暴击 <span className="text-gray-300">+{(item.stats.critChance * 100).toFixed(0)}%</span></p>
          )}
        </div>
      )}

      {/* 词缀 */}
      {item.affixes.length > 0 && (
        <div className="mb-2 space-y-0.5 border-t border-gray-700 pt-2">
          {item.affixes.map((affix, i) => (
            <p key={i} className="text-xs text-amber-300">
              {affix.type === 'prefix' ? '▸' : '◂'} {affix.name}
            </p>
          ))}
        </div>
      )}

      {/* 描述 */}
      {item.description && (
        <p className="text-xs text-gray-500 italic mb-2">{item.description}</p>
      )}

      {/* 等级要求 */}
      {item.stats.requiredLevel !== undefined && (
        <p className="text-xs text-gray-500">需要等级 {item.stats.requiredLevel}</p>
      )}

      {/* 底部装饰线 */}
      <div className="absolute bottom-0 left-3 right-3 h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

      {/* 售价 */}
      <div className="mt-2 border-t border-gray-700 pt-2">
        <p className="text-xs text-amber-500">💰 售价: {item.sellPrice}</p>
      </div>
    </div>
  )
}

/**
 * 背包格子组件（支持拖拽）
 */
function InventorySlot({
  item,
  index,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onClick,
  onMouseEnter,
  onMouseLeave,
  isDragOver,
}: {
  item: Item | null
  index: number
  onDragStart: (index: number) => void
  onDragOver: (index: number) => void
  onDrop: (index: number) => void
  onDragEnd: () => void
  onClick: () => void
  onMouseEnter: (e: React.MouseEvent) => void
  onMouseLeave: () => void
  isDragOver: boolean
}) {
  const rarityColor = item ? RarityInfo[item.rarity]?.color ?? '#555' : undefined

  if (!item) {
    return (
      <div
        onClick={onClick}
        onDragOver={(e) => { e.preventDefault(); onDragOver(index) }}
        onDrop={() => onDrop(index)}
        className={`
          w-16 h-16 rounded border-2 border-dashed
          transition-all duration-150 cursor-pointer
          ${isDragOver
            ? 'border-amber-500 bg-amber-950/40 scale-105'
            : 'border-gray-800 bg-gray-900/30 hover:border-gray-600 hover:bg-gray-800/30'
          }
        `}
        title={`槽位 ${index + 1}（空）`}
      />
    )
  }

  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => { e.preventDefault(); onDragOver(index) }}
      onDrop={() => onDrop(index)}
      onDragEnd={onDragEnd}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`
        w-16 h-16 rounded border-2 flex items-center justify-center relative
        transition-all duration-150 cursor-grab active:cursor-grabbing
        hover:scale-110 hover:z-10
        ${isDragOver ? 'scale-110 border-amber-400 shadow-lg shadow-amber-500/40 z-10' : ''}
        bg-gray-900
      `}
      style={{ borderColor: rarityColor, boxShadow: `inset 0 0 8px ${rarityColor}33` }}
      title={item.name}
    >
      {/* 物品图标 */}
      <span className="text-4xl select-none" style={{ filter: 'drop-shadow(0 0 3px black)' }}>
        {item.icon}
      </span>

      {/* 堆叠数量 */}
      {item.quantity > 1 && (
        <span
          className="absolute bottom-0 right-0 text-[10px] font-bold px-0.5 rounded-sm text-white"
          style={{ textShadow: '1px 1px 2px #000, -1px -1px 2px #000' }}
        >
          {item.quantity}
        </span>
      )}

      {/* 稀有度光晕 */}
      <div
        className="absolute inset-0 rounded pointer-events-none"
        style={{
          boxShadow: `inset 0 0 6px ${rarityColor}40`,
        }}
      />
    </div>
  )
}

/**
 * 背包面板主组件
 */
export function InventoryPanel() {
  const { inventory, sortItems, moveItem, removeFromInventory } = useInventoryStore()
  const { useItem } = useGameStore()
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null)
  const [hoveredItem, setHoveredItem] = useState<{ item: Item; pos: { x: number; y: number } } | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const [dragFrom, setDragFrom] = useState<number | null>(null)
  const [dragOver, setDragOver] = useState<number | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  const COLS = 6

  const handleDragStart = useCallback((index: number) => {
    setDragFrom(index)
    playSound('click')
  }, [])

  const handleDragOver = useCallback((index: number) => {
    setDragOver(index)
  }, [])

  const handleDrop = useCallback((index: number) => {
    if (dragFrom !== null && dragFrom !== index) {
      moveItem(dragFrom, index)
      playSound('pickup')
    }
    setDragFrom(null)
    setDragOver(null)
  }, [dragFrom, moveItem])

  const handleDragEnd = useCallback(() => {
    setDragFrom(null)
    setDragOver(null)
  }, [])

  const handleSlotClick = (index: number) => {
    if (dragFrom !== null) return // 拖拽模式禁用点击
    if (selectedSlot === null) {
      setSelectedSlot(index)
    } else if (selectedSlot === index) {
      setSelectedSlot(null)
    } else {
      moveItem(selectedSlot, index)
      playSound('pickup')
      setSelectedSlot(null)
    }
  }

  const handleUseItem = () => {
    if (selectedSlot === null) return
    const item = inventory.slots[selectedSlot]
    if (!item) return

    if (item.type === ItemType.POTION) {
      useItem(item.id)
      playSound('pickup')
      setSelectedSlot(null)
    }
  }

  const handleSort = () => {
    sortItems()
    playSound('click')
  }

  const selectedItem = selectedSlot !== null ? inventory.slots[selectedSlot] : null

  return (
    <div className="bg-gray-900/95 border border-gray-700 rounded-lg shadow-lg overflow-hidden">
      {/* 标题区 */}
      <div className="relative px-4 pt-4 pb-3">
        {/* 顶部装饰线 */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-600 to-transparent" />

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-amber-400 tracking-wider">🎒 背包</h2>
          <div className="flex items-center gap-3">
            {/* 容量 */}
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                <div
                  className="h-full bg-gradient-to-r from-amber-700 to-amber-600 transition-all duration-300"
                  style={{ width: `${(inventory.usedSlots / inventory.maxSlots) * 100}%` }}
                />
              </div>
              <span className="text-xs font-mono text-gray-400">
                {inventory.usedSlots}/{inventory.maxSlots}
              </span>
            </div>
            {/* 整理按钮 */}
            <button
              onClick={handleSort}
              className="px-3 py-1.5 text-xs font-bold rounded bg-gray-800 border border-gray-600 text-gray-300 hover:border-amber-500 hover:text-amber-400 cursor-pointer transition-all duration-150 hover:scale-105 active:scale-95"
            >
              整理
            </button>
          </div>
        </div>
      </div>

      {/* 背包网格 */}
      <div
        ref={gridRef}
        className="px-4 pb-4 grid gap-0.5"
        style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
      >
        {inventory.slots.map((item, index) => (
          <InventorySlot
            key={index}
            item={item}
            index={index}
            isDragOver={dragOver === index}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
            onClick={() => handleSlotClick(index)}
            onMouseEnter={(e) => {
              if (item) {
                setHoveredItem({ item, pos: { x: e.clientX, y: e.clientY } })
                setTooltipPos({ x: e.clientX, y: e.clientY })
              }
            }}
            onMouseLeave={() => setHoveredItem(null)}
          />
        ))}
      </div>

      {/* 选中物品详情 */}
      {selectedItem && (
        <div className="mx-4 mb-4 p-3 bg-gray-950/80 rounded-lg border border-gray-700 animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-3">
            {/* 物品图标 */}
            <div
              className="w-16 h-16 rounded-lg border-2 flex items-center justify-center relative"
              style={{
                borderColor: RarityInfo[selectedItem.rarity]?.color,
                boxShadow: `inset 0 0 12px ${RarityInfo[selectedItem.rarity]?.color}40`,
              }}
            >
              <span className="text-4xl">{selectedItem.icon}</span>
              {selectedItem.quantity > 1 && (
                <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-gray-900/90 rounded text-xs font-bold text-white border border-gray-600">
                  x{selectedItem.quantity}
                </span>
              )}
            </div>

            {/* 物品信息 */}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate" style={{ color: RarityInfo[selectedItem.rarity]?.color }}>
                {selectedItem.name}
              </p>
              <p className="text-xs text-gray-400">
                {RarityInfo[selectedItem.rarity]?.name} · {selectedItem.type}
              </p>
              {selectedItem.slot !== undefined && (
                <p className="text-xs text-gray-500 mt-0.5">
                  装备槽位: {selectedItem.slot}
                </p>
              )}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2 mt-3">
            {selectedItem.type === ItemType.POTION && (
              <button
                onClick={handleUseItem}
                className="flex-1 py-2 rounded font-bold text-sm bg-gradient-to-b from-green-800 to-green-950 border-2 border-green-600 text-green-200 hover:from-green-700 hover:to-green-900 hover:scale-105 active:scale-95 transition-all duration-150 cursor-pointer"
              >
                🧪 使用
              </button>
            )}
            {selectedItem.slot !== undefined && (
              <button
                className="flex-1 py-2 rounded font-bold text-sm bg-gradient-to-b from-blue-800 to-blue-950 border-2 border-blue-600 text-blue-200 hover:from-blue-700 hover:to-blue-900 hover:scale-105 active:scale-95 transition-all duration-150 cursor-pointer"
              >
                ⚔️ 穿戴
              </button>
            )}
            <button
              onClick={() => setSelectedSlot(null)}
              className="px-4 py-2 rounded font-bold text-sm bg-gray-800 border-2 border-gray-600 text-gray-400 hover:border-gray-500 cursor-pointer transition-all duration-150 hover:scale-105 active:scale-95"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 拖拽提示 */}
      {(dragFrom !== null || selectedSlot !== null) && (
        <div className="mx-4 mb-3 px-3 py-2 bg-amber-950/30 border border-amber-700/50 rounded text-xs text-amber-400 text-center">
          {dragFrom !== null ? '拖放到目标格子后释放' : '再次点击格子可交换位置'}
        </div>
      )}

      {/* 空背包提示 */}
      {inventory.usedSlots === 0 && (
        <div className="text-center py-8">
          <p className="text-4xl mb-2 opacity-30">🎒</p>
          <p className="text-gray-500 text-sm">背包空空如也，去战斗获取战利品吧！</p>
        </div>
      )}

      {/* 物品详情浮层 */}
      {hoveredItem && <ItemTooltip item={hoveredItem.item} position={tooltipPos} />}
    </div>
  )
}
