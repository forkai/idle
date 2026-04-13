/**
 * @fileoverview 背包面板组件
 * @description 展示玩家背包物品，支持物品详情、排序、拖拽移动
 */

'use client'

import { useState, useRef } from 'react'
import { useInventoryStore } from '@/stores/inventoryStore'
import { useGameStore } from '@/stores/gameStore'
import { ItemRarity, RarityInfo, ItemType, STACK_LIMITS } from '@/types/items'
import type { Item } from '@/types/items'
import { playSound } from '@/lib/game/sound'

/**
 * 物品图标组件
 */
function ItemIcon({ item, size = 'md' }: { item: Item; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  }

  const rarityColor = RarityInfo[item.rarity]?.color ?? '#fff'

  return (
    <div
      className={`
        ${sizeClasses[size]}
        rounded border flex items-center justify-center
        bg-gray-800 relative
      `}
      style={{ borderColor: rarityColor }}
    >
      <span className="text-xl">{item.icon}</span>
      {item.quantity > 1 && (
        <span
          className="absolute bottom-0 right-0 text-[10px] font-bold text-white"
          style={{ textShadow: '1px 1px 1px #000' }}
        >
          {item.quantity}
        </span>
      )}
    </div>
  )
}

/**
 * 物品详情提示框
 */
function ItemTooltip({ item, position }: { item: Item; position: { x: number; y: number } }) {
  const tooltipStyle = {
    left: Math.min(position.x + 16, window.innerWidth - 280),
    top: Math.min(position.y - 8, window.innerHeight - 300),
  }

  const rarityColor = RarityInfo[item.rarity]?.color ?? '#fff'
  const isEquipable = item.slot !== undefined

  return (
    <div
      className="fixed z-50 w-64 bg-gray-900 border border-gray-600 rounded-lg shadow-2xl shadow-black/80 p-3 pointer-events-none animate-in fade-in zoom-in-95 duration-150"
      style={tooltipStyle}
    >
      {/* 物品名称 */}
      <p className="font-bold text-sm mb-1" style={{ color: rarityColor }}>
        {item.icon} {item.name}
      </p>
      <p className="text-xs text-gray-400 mb-2">{RarityInfo[item.rarity]?.name}</p>

      {/* 物品类型 */}
      <p className="text-xs text-gray-300 mb-2">{item.type}</p>

      {/* 分割线 */}
      <div className="border-t border-gray-700 my-2" />

      {/* 装备属性 */}
      {isEquipable && item.stats && (
        <div className="space-y-1 mb-2">
          {item.stats.damage !== undefined && (
            <p className="text-xs text-red-400">⚔️ 伤害: +{item.stats.damage}</p>
          )}
          {item.stats.defense !== undefined && (
            <p className="text-xs text-blue-400">🛡️ 防御: +{item.stats.defense}</p>
          )}
          {item.stats.health !== undefined && (
            <p className="text-xs text-green-400">❤️ 生命: +{item.stats.health}</p>
          )}
          {item.stats.mana !== undefined && (
            <p className="text-xs text-blue-300">💧 法力: +{item.stats.mana}</p>
          )}
          {item.stats.attackSpeed !== undefined && (
            <p className="text-xs text-yellow-400">⚡ 攻速: +{item.stats.attackSpeed}</p>
          )}
          {item.stats.critChance !== undefined && (
            <p className="text-xs text-orange-400">💥 暴击: +{(item.stats.critChance * 100).toFixed(0)}%</p>
          )}
        </div>
      )}

      {/* 词缀 */}
      {item.affixes.length > 0 && (
        <div className="space-y-0.5 mb-2">
          {item.affixes.map((affix, i) => (
            <p key={i} className="text-xs text-amber-300">
              {affix.type === 'prefix' ? '▸' : '◂'} {affix.name}
            </p>
          ))}
        </div>
      )}

      {/* 描述 */}
      {item.description && (
        <p className="text-xs text-gray-400 italic mb-2">{item.description}</p>
      )}

      {/* 等级要求 */}
      {item.stats.requiredLevel !== undefined && (
        <p className="text-xs text-gray-500">需要等级: {item.stats.requiredLevel}</p>
      )}

      {/* 售价 */}
      <div className="border-t border-gray-700 my-2" />
      <p className="text-xs text-amber-500">💰 售价: {item.sellPrice}</p>
    </div>
  )
}

/**
 * 背包格子组件
 */
function InventorySlot({
  item,
  index,
  onSelect,
  selected,
  onMouseEnter,
  onMouseLeave,
}: {
  item: Item | null
  index: number
  onSelect: () => void
  selected: boolean
  onMouseEnter: (e: React.MouseEvent) => void
  onMouseLeave: () => void
}) {
  if (!item) {
    return (
      <button
        onClick={onSelect}
        className={`
          w-10 h-10 rounded border bg-gray-900/50 border-gray-800
          hover:border-gray-600 transition-all duration-150 cursor-pointer
          ${selected ? 'border-amber-500 bg-amber-950/30' : ''}
        `}
        title={`槽位 ${index + 1}（空）`}
      />
    )
  }

  const rarityColor = RarityInfo[item.rarity]?.color ?? '#fff'

  return (
    <button
      onClick={onSelect}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`
        w-10 h-10 rounded border-2 flex items-center justify-center relative
        bg-gray-900 hover:brightness-125 transition-all duration-150 cursor-pointer
        ${selected ? 'border-amber-500 shadow-lg shadow-amber-500/30' : ''}
      `}
      style={{ borderColor: selected ? '#f59e0b' : rarityColor }}
      title={item.name}
    >
      <span className="text-xl">{item.icon}</span>
      {item.quantity > 1 && (
        <span
          className="absolute bottom-0 right-0 text-[9px] font-bold text-white"
          style={{ textShadow: '1px 1px 1px #000' }}
        >
          {item.quantity}
        </span>
      )}
    </button>
  )
}

/**
 * 背包面板主组件
 */
export function InventoryPanel() {
  const { inventory, sortItems, moveItem } = useInventoryStore()
  const { useItem } = useGameStore()
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null)
  const [hoveredItem, setHoveredItem] = useState<{ item: Item; pos: { x: number; y: number } } | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const gridRef = useRef<HTMLDivElement>(null)

  const COLS = 6

  const handleSlotClick = (index: number) => {
    if (selectedSlot === null) {
      setSelectedSlot(index)
    } else if (selectedSlot === index) {
      setSelectedSlot(null)
    } else {
      // 交换两个槽位
      moveItem(selectedSlot, index)
      setSelectedSlot(null)
    }
  }

  const handleUseItem = () => {
    if (selectedSlot === null) return
    const item = inventory.slots[selectedSlot]
    if (!item) return

    if (item.type === ItemType.POTION) {
      useItem(item.id)
      setSelectedSlot(null)
    }
  }

  const handleSort = () => {
    sortItems()
    playSound('click')
  }

  return (
    <div className="bg-gray-900/95 border border-gray-700 rounded-lg p-4 shadow-lg">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-200">🎒 背包</h2>
        <div className="flex gap-2">
          <button
            onClick={handleSort}
            className="px-3 py-1.5 text-xs font-bold rounded bg-gray-800 border border-gray-600 text-gray-300 hover:border-amber-500 hover:text-amber-400 cursor-pointer transition-all duration-150"
          >
            整理
          </button>
        </div>
      </div>

      {/* 容量显示 */}
      <div className="flex justify-between text-xs text-gray-400 mb-3">
        <span>容量</span>
        <span>
          <span className={inventory.usedSlots >= inventory.maxSlots ? 'text-red-400' : 'text-gray-300'}>
            {inventory.usedSlots}
          </span>
          /{inventory.maxSlots}
        </span>
      </div>

      {/* 背包网格 */}
      <div
        ref={gridRef}
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
      >
        {inventory.slots.map((item, index) => (
          <InventorySlot
            key={index}
            item={item}
            index={index}
            selected={selectedSlot === index}
            onSelect={() => handleSlotClick(index)}
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

      {/* 物品操作栏 */}
      {selectedSlot !== null && inventory.slots[selectedSlot] && (
        <div className="mt-4 p-3 bg-gray-950/50 rounded border border-gray-800">
          <div className="flex items-center gap-3">
            <ItemIcon item={inventory.slots[selectedSlot]!} size="lg" />
            <div className="flex-1">
              <p className="font-bold text-sm" style={{ color: RarityInfo[inventory.slots[selectedSlot]!.rarity]?.color }}>
                {inventory.slots[selectedSlot]!.name}
              </p>
              <p className="text-xs text-gray-400">
                {RarityInfo[inventory.slots[selectedSlot]!.rarity]?.name} · {inventory.slots[selectedSlot]!.type}
              </p>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2 mt-3">
            {inventory.slots[selectedSlot]!.type === ItemType.POTION && (
              <button
                onClick={handleUseItem}
                className="flex-1 py-2 rounded font-bold text-sm bg-gradient-to-b from-green-800 to-green-950 border border-green-600 text-green-200 hover:from-green-700 hover:to-green-900 cursor-pointer transition-all duration-150"
              >
                使用
              </button>
            )}
            <button
              onClick={() => setSelectedSlot(null)}
              className="flex-1 py-2 rounded font-bold text-sm bg-gray-800 border border-gray-600 text-gray-300 hover:border-gray-500 cursor-pointer transition-all duration-150"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* 提示：选中提示 */}
      {selectedSlot === null && inventory.usedSlots > 0 && (
        <p className="text-xs text-gray-500 mt-3 text-center">
          点击物品选中，再点击另一个格子可交换位置
        </p>
      )}

      {/* 物品详情提示 */}
      {hoveredItem && <ItemTooltip item={hoveredItem.item} position={tooltipPos} />}
    </div>
  )
}
