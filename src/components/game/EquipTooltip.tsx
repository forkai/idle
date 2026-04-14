/**
 * @fileoverview 装备详情浮层组件
 * @description 显示装备属性详情和对比信息
 */

'use client'

import { SlotNames, RarityInfo } from '@/types/items'
import type { Item } from '@/types/items'

/** 装备详情浮层（支持对比） */
function EquipTooltip({ item, position, equipped }: { item: Item; position: { x: number; y: number }; equipped?: Item | null }) {
  if (typeof window === 'undefined') return null
  const style = {
    left: Math.min(position.x + 16, window.innerWidth - 320),
    top: Math.max(position.y - 200, 8),
  }
  const rarityColor = RarityInfo[item.rarity]?.color ?? '#fff'

  /** 渲染单个属性行（带对比） */
  const renderStat = (
    key: string,
    label: string,
    icon: string,
    color: string,
    format?: (v: number) => string
  ) => {
    const newVal = item.stats[key as keyof typeof item.stats] as number | undefined
    const oldVal = equipped?.stats[key as keyof typeof equipped.stats] as number | undefined
    if (newVal === undefined) return null
    const display = format ? format(newVal) : `+${newVal}`
    const diff = oldVal !== undefined ? newVal - oldVal : null
    const diffStr = diff !== null ? (diff > 0 ? ` (+${format ? format(diff) : diff})` : diff < 0 ? ` (${format ? format(diff) : diff})` : ' (0)') : ''
    return (
      <p className="text-xs">
        <span style={{ color }}>{icon} {label}</span>
        <span className="text-gray-300">{display}</span>
        <span className={diff !== null && diff > 0 ? 'text-green-400' : diff !== null && diff < 0 ? 'text-red-400' : 'text-gray-500'}>
          {diffStr}
        </span>
      </p>
    )
  }

  return (
    <div
      className="fixed z-50 w-80 bg-gray-900/95 border border-gray-500 rounded-lg shadow-2xl shadow-black/80 p-3 pointer-events-none animate-in fade-in zoom-in-95 duration-150"
      style={style}
    >
      <div className="absolute top-0 left-3 right-3 h-px bg-linear-to-r from-transparent via-amber-500 to-transparent opacity-60" />
      <p className="font-bold text-sm mb-1" style={{ color: rarityColor }}>
        {item.icon} {item.name}
      </p>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs px-1.5 py-0.5 rounded border" style={{ color: rarityColor, borderColor: rarityColor }}>
          {RarityInfo[item.rarity]?.name}
        </span>
        <span className="text-xs text-gray-400">{SlotNames[item.slot!]}</span>
      </div>

      {/* 新装备属性 */}
      <div className="space-y-0.5">
        {renderStat('damage', '伤害', '⚔️', '#f87171')}
        {renderStat('defense', '防御', '🛡️', '#60a5fa')}
        {renderStat('health', '生命', '❤️', '#4ade80')}
        {renderStat('mana', '法力', '💧', '#7dd3fc')}
        {renderStat('attackSpeed', '攻速', '⚡', '#facc15', v => `+${(v * 100).toFixed(0)}%`)}
        {renderStat('critChance', '暴击', '💥', '#fb923c', v => `+${(v * 100).toFixed(0)}%`)}
      </div>

      {/* 对比栏 */}
      {equipped && (
        <div className="mt-2 pt-2 border-t border-gray-700">
          <p className="text-xs text-gray-400 mb-1">vs 已穿戴 ({equipped.name})</p>
          <div className="space-y-0.5">
            {renderStat('damage', '伤害', '⚔️', '#f87171')}
            {renderStat('defense', '防御', '🛡️', '#60a5fa')}
            {renderStat('health', '生命', '❤️', '#4ade80')}
            {renderStat('mana', '法力', '💧', '#7dd3fc')}
            {renderStat('attackSpeed', '攻速', '⚡', '#facc15', v => `+${(v * 100).toFixed(0)}%`)}
            {renderStat('critChance', '暴击', '💥', '#fb923c', v => `+${(v * 100).toFixed(0)}%`)}
          </div>
        </div>
      )}

      {/* 词缀 */}
      {item.affixes.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-700 space-y-0.5">
          {item.affixes.map((a, i) => (
            <p key={i} className="text-xs text-amber-300">
              {a.type === 'prefix' ? '▸' : '◂'} {a.name}
            </p>
          ))}
        </div>
      )}
      <div className="absolute bottom-0 left-3 right-3 h-px bg-linear-to-r from-transparent via-amber-500 to-transparent opacity-60" />
    </div>
  )
}

export { EquipTooltip }
