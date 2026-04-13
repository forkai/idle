/**
 * @fileoverview 装备面板组件
 * @description 展示10个装备槽位，支持穿戴/卸下装备
 */

'use client'

import { useState } from 'react'
import { useInventoryStore } from '@/stores/inventoryStore'
import { useEquipmentStore } from '@/stores/equipmentStore'
import { useGameStore } from '@/stores/gameStore'
import { EquipmentSlot, SlotNames, RarityInfo, ItemType } from '@/types/items'
import type { Item } from '@/types/items'
import { playSound } from '@/lib/game/sound'

const SLOT_ICONS: Record<EquipmentSlot, string> = {
  [EquipmentSlot.HEAD]: '🪖',
  [EquipmentSlot.CHEST]: '🦺',
  [EquipmentSlot.GLOVES]: '🧤',
  [EquipmentSlot.BOOTS]: '👢',
  [EquipmentSlot.BELT]: '🎗️',
  [EquipmentSlot.SHIELD]: '🛡️',
  [EquipmentSlot.RING1]: '💍',
  [EquipmentSlot.RING2]: '💍',
  [EquipmentSlot.AMULET]: '📿',
  [EquipmentSlot.WEAPON]: '⚔️',
}

const SLOT_ORDER: EquipmentSlot[] = [
  EquipmentSlot.WEAPON,
  EquipmentSlot.SHIELD,
  EquipmentSlot.HEAD,
  EquipmentSlot.CHEST,
  EquipmentSlot.GLOVES,
  EquipmentSlot.BOOTS,
  EquipmentSlot.BELT,
  EquipmentSlot.RING1,
  EquipmentSlot.RING2,
  EquipmentSlot.AMULET,
]

/** 装备详情浮层 */
function EquipTooltip({
  item,
  position,
}: {
  item: Item
  position: { x: number; y: number }
}) {
  const style = {
    left: Math.min(position.x + 16, window.innerWidth - 300),
    top: Math.min(position.y - 8, window.innerHeight - 350),
  }
  const rarityColor = RarityInfo[item.rarity]?.color ?? '#fff'

  return (
    <div
      className="fixed z-50 w-72 bg-gray-900/95 border border-gray-500 rounded-lg shadow-2xl shadow-black/80 p-3 pointer-events-none animate-in fade-in zoom-in-95 duration-150"
      style={style}
    >
      <div className="absolute top-0 left-3 right-3 h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-60" />
      <p className="font-bold text-sm mb-1" style={{ color: rarityColor }}>
        {item.icon} {item.name}
      </p>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs px-1.5 py-0.5 rounded border" style={{ color: rarityColor, borderColor: rarityColor }}>
          {RarityInfo[item.rarity]?.name}
        </span>
        <span className="text-xs text-gray-400">{SlotNames[item.slot!]}</span>
      </div>
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
      {item.affixes.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-700 space-y-0.5">
          {item.affixes.map((a, i) => (
            <p key={i} className="text-xs text-amber-300">
              {a.type === 'prefix' ? '▸' : '◂'} {a.name}
            </p>
          ))}
        </div>
      )}
      <div className="absolute bottom-0 left-3 right-3 h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-60" />
      <div className="mt-2 pt-2 border-t border-gray-700">
        <p className="text-xs text-amber-500">💰 售价: {item.sellPrice}</p>
      </div>
    </div>
  )
}

/** 装备槽位 */
function EquipmentSlotButton({
  slot,
  item,
  onHover,
  onLeave,
  onUnequip,
}: {
  slot: EquipmentSlot
  item: Item | null
  onHover: (e: React.MouseEvent) => void
  onLeave: () => void
  onUnequip: () => void
}) {
  const hasItem = item !== null
  const rarityColor = hasItem ? RarityInfo[item!.rarity]?.color ?? '#555' : '#3a3a4a'
  const slotIcon = SLOT_ICONS[slot]

  return (
    <div className="flex items-center gap-3 group">
      {/* 槽位图标 */}
      <div className="relative flex-shrink-0">
        <div
          className={`
            w-16 h-16 rounded-lg border-2 flex items-center justify-center
            transition-all duration-150
            ${hasItem ? 'bg-gray-800 cursor-pointer hover:scale-105' : 'bg-gray-900/50 border-dashed cursor-default'}
          `}
          style={{
            borderColor: rarityColor,
            boxShadow: hasItem ? `inset 0 0 10px ${rarityColor}33` : 'none',
          }}
          onMouseEnter={hasItem ? onHover : undefined}
          onMouseLeave={hasItem ? onLeave : undefined}
          title={hasItem ? item.name : `${SlotNames[slot]} (空)`}
        >
          {hasItem ? (
            <>
              <span className="text-3xl select-none" style={{ filter: 'drop-shadow(0 0 4px black)' }}>
                {item.icon}
              </span>
              {/* 稀有度光晕 */}
              <div
                className="absolute inset-0 rounded pointer-events-none"
                style={{ boxShadow: `inset 0 0 8px ${rarityColor}40` }}
              />
            </>
          ) : (
            <span className="text-2xl opacity-20">{slotIcon}</span>
          )}
        </div>
        {/* 槽位名称 */}
        <p className="text-[10px] text-gray-500 text-center mt-1">{SlotNames[slot]}</p>
      </div>

      {/* 装备信息（如果有） */}
      {hasItem && (
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate" style={{ color: RarityInfo[item.rarity]?.color }}>
            {item.name}
          </p>
          <div className="flex gap-2 mt-0.5">
            {item.stats.damage !== undefined && (
              <span className="text-xs text-red-400">⚔️{item.stats.damage}</span>
            )}
            {item.stats.defense !== undefined && (
              <span className="text-xs text-blue-400">🛡️{item.stats.defense}</span>
            )}
            {item.stats.health !== undefined && (
              <span className="text-xs text-green-400">❤️{item.stats.health}</span>
            )}
          </div>
          <button
            onClick={onUnequip}
            className="mt-1 text-xs px-2 py-0.5 rounded bg-gray-800 border border-gray-600 text-gray-400 hover:border-red-500 hover:text-red-400 cursor-pointer transition-all duration-150"
          >
            卸下
          </button>
        </div>
      )}
    </div>
  )
}

/**
 * 背包中可装备物品列表
 */
function EquipableList({
  onEquip,
  onHover,
  onLeaveHover,
}: {
  onEquip: (item: Item) => void
  onHover: (item: Item, e: React.MouseEvent) => void
  onLeaveHover: () => void
}) {
  const { inventory } = useInventoryStore()

  const equipableItems = inventory.slots.filter(
    (slot): slot is Item => slot !== null && slot.type !== ItemType.POTION && slot.type !== ItemType.MATERIAL && slot.type !== ItemType.QUEST
  )

  if (equipableItems.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-2xl opacity-30 mb-1">⚔️</p>
        <p className="text-xs text-gray-500">背包中暂无可装备物品</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {equipableItems.map(item => (
        <button
          key={item.id}
          onClick={() => onEquip(item)}
          onMouseEnter={(e) => onHover(item, e)}
          onMouseLeave={onLeaveHover}
          className="w-full flex items-center gap-2 p-2 rounded bg-gray-900/50 border border-gray-800 hover:border-gray-600 transition-all duration-150 cursor-pointer text-left"
        >
          <div
            className="w-10 h-10 rounded border flex items-center justify-center flex-shrink-0"
            style={{ borderColor: RarityInfo[item.rarity]?.color }}
          >
            <span className="text-xl">{item.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate" style={{ color: RarityInfo[item.rarity]?.color }}>
              {item.name}
            </p>
            <p className="text-[10px] text-gray-500">{SlotNames[item.slot!]}</p>
          </div>
        </button>
      ))}
    </div>
  )
}

/**
 * 装备面板主组件
 */
export function EquipmentPanel() {
  const { equipment, equipItem, unequipItem } = useEquipmentStore()
  const { refreshComputedStats } = useGameStore()
  const [hoveredItem, setHoveredItem] = useState<{ item: Item; pos: { x: number; y: number } } | null>(null)

  const handleUnequip = (slot: EquipmentSlot) => {
    const item = unequipItem(slot)
    if (item) {
      playSound('pickup')
      refreshComputedStats()
    }
  }

  const handleEquip = (item: Item) => {
    if (equipItem(item)) {
      playSound('levelup')
      refreshComputedStats()
    }
  }

  return (
    <div className="bg-gray-900/95 border border-gray-700 rounded-lg shadow-lg overflow-hidden">
      {/* 标题 */}
      <div className="relative px-4 pt-4 pb-3">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-600 to-transparent" />
        <h2 className="text-lg font-bold text-amber-400 tracking-wider">⚔️ 装备</h2>
      </div>

      <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 左侧：当前装备 */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">当前穿戴</p>
          <div className="space-y-2">
            {SLOT_ORDER.map(slot => (
              <EquipmentSlotButton
                key={slot}
                slot={slot}
                item={equipment[slot]}
                onHover={(e) => {
                  if (equipment[slot]) {
                    setHoveredItem({ item: equipment[slot]!, pos: { x: e.clientX, y: e.clientY } })
                  }
                }}
                onLeave={() => setHoveredItem(null)}
                onUnequip={() => handleUnequip(slot)}
              />
            ))}
          </div>
        </div>

        {/* 右侧：可装备物品 */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">背包可装备</p>
          <EquipableList
            onEquip={handleEquip}
            onHover={(item, e) => setHoveredItem({ item, pos: { x: e.clientX, y: e.clientY } })}
            onLeaveHover={() => setHoveredItem(null)}
          />
        </div>
      </div>

      {hoveredItem && (
        <EquipTooltip item={hoveredItem.item} position={hoveredItem.pos} />
      )}
    </div>
  )
}
