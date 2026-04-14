/**
 * @fileoverview 装备槽按钮组件
 * @description 人形轮廓上的装备槽位组件
 */

'use client'

import { EquipmentSlot, RarityInfo } from '@/types/items'
import type { Item } from '@/types/items'

/** 装备槽位置（沿人形轮廓分布，不重叠） */
const SLOT_LAYOUT: { slot: EquipmentSlot; label: string; icon: string; top: string; left: string; right?: string }[] = [
  { slot: EquipmentSlot.HEAD, label: '头部', icon: '🪖', top: '0px', left: '50%' },
  { slot: EquipmentSlot.AMULET, label: '护符', icon: '📿', top: '28px', left: '50%' },
  { slot: EquipmentSlot.SHIELD, label: '盾牌', icon: '🛡️', top: '56px', left: '8px' },
  { slot: EquipmentSlot.CHEST, label: '胸甲', icon: '🦺', top: '84px', left: '50%' },
  { slot: EquipmentSlot.GLOVES, label: '手套', icon: '🧤', top: '112px', left: '8px' },
  { slot: EquipmentSlot.WEAPON, label: '武器', icon: '⚔️', top: '112px', right: '8px', left: 'auto' },
  { slot: EquipmentSlot.RING1, label: '戒指', icon: '💍', top: '140px', left: '8px' },
  { slot: EquipmentSlot.BELT, label: '腰带', icon: '🎗️', top: '168px', left: '50%' },
  { slot: EquipmentSlot.RING2, label: '戒指', icon: '💍', top: '168px', right: '8px', left: 'auto' },
  { slot: EquipmentSlot.BOOTS, label: '靴子', icon: '👢', top: '196px', left: '50%' },
]

/** 装备槽按钮 */
function EquipSlotButton({
  slot,
  item,
  onClick,
  onDragOver,
  onDrop,
  isDragOver,
}: {
  slot: EquipmentSlot
  item: Item | null
  onClick: () => void
  onDragOver: (slot: EquipmentSlot) => void
  onDrop: (slot: EquipmentSlot) => void
  isDragOver: boolean
}) {
  const hasItem = item !== null
  const rarityColor = hasItem ? RarityInfo[item!.rarity]?.color ?? '#555' : '#3a3a4a'
  const slotDef = SLOT_LAYOUT.find(s => s.slot === slot)

  return (
    <button
      onClick={onClick}
      onDragOver={(e) => { e.preventDefault(); onDragOver(slot) }}
      onDrop={() => onDrop(slot)}
      className={`
        absolute w-14 h-14 rounded-lg border-2 flex flex-col items-center justify-center
        transition-all duration-150 cursor-pointer
        ${hasItem ? 'bg-gray-800 hover:scale-110' : 'bg-gray-900/50 border-dashed hover:bg-gray-800/70'}
        ${isDragOver ? 'scale-110 border-amber-400 shadow-lg shadow-amber-500/40 z-20' : ''}
      `}
      style={{
        borderColor: rarityColor,
        boxShadow: hasItem ? `0 0 10px ${rarityColor}55, inset 0 0 6px ${rarityColor}22` : 'none',
        top: slotDef?.top,
        left: slotDef?.left,
        transform: slotDef?.left === '50%' ? 'translateX(-50%)' : undefined,
        right: slotDef?.right,
      }}
      title={hasItem ? `${slotDef?.label}: ${item.name}` : `${slotDef?.label} (空)`}
    >
      {hasItem ? (
        <>
          <span className="text-2xl select-none" style={{ filter: 'drop-shadow(0 0 3px black)' }}>
            {item.icon}
          </span>
          <span className="text-[8px] text-gray-400 mt-0.5 leading-tight">{slotDef?.label}</span>
        </>
      ) : (
        <span className="text-xl opacity-20">{slotDef?.icon}</span>
      )}
    </button>
  )
}

export { EquipSlotButton, SLOT_LAYOUT }
