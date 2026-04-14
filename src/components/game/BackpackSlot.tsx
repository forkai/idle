/**
 * @fileoverview 背包网格物品格子组件
 * @description 支持拖拽和点击操作的物品格子
 */

'use client'

import { RarityInfo } from '@/types/items'
import type { Item } from '@/types/items'

/** 背包网格物品格子 */
function BackpackSlot({
  item,
  index,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onClick,
  isDragOver,
}: {
  item: Item | null
  index: number
  onDragStart: (index: number) => void
  onDragOver: (index: number) => void
  onDrop: (index: number) => void
  onDragEnd: () => void
  onClick: () => void
  isDragOver: boolean
}) {
  const rarityColor = item ? RarityInfo[item.rarity]?.color ?? '#555' : undefined
  const isEquipable = item?.slot !== undefined

  if (!item) {
    return (
      <div
        onClick={onClick}
        onDragOver={(e) => { e.preventDefault(); onDragOver(index) }}
        onDrop={() => onDrop(index)}
        className={`
          w-full aspect-square rounded border-2 border-dashed transition-all duration-150 cursor-pointer
          ${isDragOver ? 'border-amber-500 bg-amber-950/40 scale-105' : 'border-gray-800 bg-gray-900/30 hover:border-gray-600'}
        `}
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
      className={`
        w-full aspect-square rounded border-2 flex items-center justify-center relative
        transition-all duration-150 cursor-grab active:cursor-grabbing
        hover:scale-105 hover:z-10
        ${isDragOver ? 'scale-110 border-amber-400 shadow-lg shadow-amber-500/40 z-10' : ''}
        ${isEquipable ? 'bg-gray-800' : 'bg-gray-900/80'}
      `}
      style={{
        borderColor: rarityColor,
        boxShadow: `inset 0 0 8px ${rarityColor}33`,
      }}
      title={item.name}
    >
      <span className="text-3xl select-none" style={{ filter: 'drop-shadow(0 0 3px black)' }}>
        {item.icon}
      </span>
      {item.quantity > 1 && (
        <span
          className="absolute bottom-0 right-0 text-[9px] font-bold px-0.5 rounded-sm text-white"
          style={{ textShadow: '1px 1px 2px #000' }}
        >
          {item.quantity}
        </span>
      )}
      {/* 可装备标识 */}
      {isEquipable && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-600 rounded-full flex items-center justify-center">
          <span className="text-[6px] text-white font-bold">E</span>
        </span>
      )}
    </div>
  )
}

export { BackpackSlot }
