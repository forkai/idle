/**
 * @fileoverview 区域选择组件
 * @description 显示可探索的区域列表
 */

'use client'

import { useGameStore } from '@/stores/gameStore'
import { ZONES } from '@/constants/enemies'
import type { Zone } from '@/types/enemy'

/**
 * 区域卡片组件
 */
function ZoneCard({ zone, current, onSelect }: { zone: Zone; current: boolean; onSelect: () => void }) {
  const isLocked = !zone.unlocked
  const canEnter = zone.unlocked

  return (
    <button
      onClick={onSelect}
      disabled={!canEnter}
      className={`
        relative w-full p-2.5 rounded-md border text-left transition-all duration-150 cursor-pointer
        ${current
          ? 'border-amber-500 bg-amber-950/40'
          : canEnter
            ? 'border-gray-700 bg-gray-900/50 hover:border-gray-500 hover:bg-gray-800/50'
            : 'border-gray-800 bg-gray-900/30 opacity-50 cursor-not-allowed'
        }
      `}
    >
      {/* 锁定标识 */}
      {isLocked && (
        <span className="absolute top-1 right-1.5 text-gray-500 text-xs">🔒</span>
      )}

      {/* 区域名称 + 等级 */}
      <div className="flex items-center justify-between gap-1 mb-0.5">
        <span className={`font-semibold text-xs truncate ${current ? 'text-amber-400' : 'text-gray-200'}`}>
          {zone.name}
        </span>
        <span className="text-[10px] text-gray-500 flex-shrink-0">Lv.{zone.requiredLevel}</span>
      </div>

      {/* 奖励行 */}
      <div className="flex gap-1.5 text-[10px]">
        <span className="text-amber-500">💰{zone.rewards.goldBonus}</span>
        <span className="text-blue-400">⭐{zone.rewards.expBonus}</span>
        <span className="text-green-400">📦{zone.rewards.lootBonus}</span>
        {current && <span className="text-amber-400 ml-auto font-bold">●</span>}
      </div>
    </button>
  )
}

/**
 * 区域选择组件
 */
export function ZoneSelection() {
  const { currentZoneId, changeZone, player } = useGameStore()

  // 按章节分组显示区域
  const zonesByAct = Object.values(ZONES).reduce((acc, zone) => {
    if (!acc[zone.act]) acc[zone.act] = []
    acc[zone.act].push(zone)
    return acc
  }, {} as Record<number, Zone[]>)

  const handleSelectZone = (zoneId: string) => {
    const zone = ZONES[zoneId]
    if (!zone) return

    // 检查等级要求
    if (zone.requiredLevel > player.level) {
      alert(`需要等级 ${zone.requiredLevel} 才能进入此区域`)
      return
    }

    changeZone(zoneId)
  }

  return (
    <div className="panel-game p-4">
      <h2 className="text-lg font-bold text-gray-200 mb-4">🗺️ 区域选择</h2>

      {/* 区域列表 */}
      <div className="space-y-6">
        {Object.entries(zonesByAct).map(([act, zones]) => (
          <div key={act}>
            {/* 章节标题 */}
            <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">
              第一章：堕落者的洞穴
            </h3>

            {/* 区域网格 - 侧边栏单列布局 */}
            <div className="flex flex-col gap-2">
              {zones.map(zone => (
                <ZoneCard
                  key={zone.id}
                  zone={zone}
                  current={currentZoneId === zone.id}
                  onSelect={() => handleSelectZone(zone.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 当前区域详情 */}
      {currentZoneId && ZONES[currentZoneId] && (
        <div className="mt-4 p-3 bg-gray-950/50 rounded-lg border border-gray-800">
          <h4 className="text-sm font-bold text-gray-300 mb-2">当前区域详情</h4>
          <p className="text-sm text-gray-400">
            {ZONES[currentZoneId].description}
          </p>
        </div>
      )}
    </div>
  )
}
