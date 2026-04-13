/**
 * @fileoverview 套装面板组件
 * @description 展示玩家当前激活的套装效果
 */

'use client'

import { useMemo } from 'react'
import { useEquipmentStore } from '@/stores/equipmentStore'
import { getSetsJson, getSetById } from '@/constants/sets'
import type { SetJson } from '@/types/set'

/**
 * 套装部件显示
 */
function SetPieceItem({ slot, name, icon, equipped }: {
  slot: string
  name: string
  icon: string
  equipped: boolean
}) {
  return (
    <div className={`flex items-center gap-2 p-2 rounded ${equipped ? 'bg-green-900/30' : 'bg-gray-900/50'}`}>
      <span className={`text-xl ${equipped ? '' : 'grayscale opacity-50'}`}>{icon}</span>
      <div>
        <p className={`text-sm ${equipped ? 'text-green-400' : 'text-gray-500'}`}>{name}</p>
        <p className="text-xs text-gray-600">{slot}</p>
      </div>
      {equipped && <span className="ml-auto text-green-500">✓</span>}
    </div>
  )
}

/**
 * 套装卡片
 */
function SetCard({ set, equippedCount }: { set: SetJson; equippedCount: number }) {
  const activeBonuses = set.bonuses.filter(b => b.threshold <= equippedCount)
  const hasPartial = equippedCount > 0 && activeBonuses.length === 0
  const isComplete = equippedCount >= set.pieces.length

  return (
    <div className={`p-3 rounded-lg border ${isComplete ? 'border-green-500 bg-green-900/20' : hasPartial ? 'border-amber-500 bg-amber-900/20' : 'border-gray-700 bg-gray-900/50'}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{set.icon}</span>
        <div>
          <p className={`font-bold ${isComplete ? 'text-green-400' : 'text-gray-200'}`}>{set.name}</p>
          <p className="text-xs text-gray-500">
            {equippedCount} / {set.pieces.length} 件装备
          </p>
        </div>
      </div>

      {/* 套装部件 */}
      <div className="space-y-1 mb-3">
        {set.pieces.map((piece, i) => (
          <SetPieceItem
            key={i}
            slot={piece.slot}
            name={piece.name}
            icon={piece.icon}
            equipped={false}
          />
        ))}
      </div>

      {/* 套装奖励 */}
      <div className="border-t border-gray-700 pt-2">
        <p className="text-xs text-amber-400 mb-1">套装效果：</p>
        {set.bonuses.map((bonus, i) => {
          const isActive = bonus.threshold <= equippedCount
          return (
            <div key={i} className={`text-xs p-1 rounded ${isActive ? 'text-green-400' : 'text-gray-600'}`}>
              <span className="font-bold">[{bonus.threshold}件]</span> {bonus.description}
              {isActive && <span className="ml-1">✓</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * 套装面板主组件
 */
export function SetPanel() {
  const { equipment } = useEquipmentStore()

  // 计算当前装备的套装情况
  const setStatus = useMemo(() => {
    const status: Record<string, { set: SetJson; count: number }> = {}

    for (const item of Object.values(equipment)) {
      if (item?.setId) {
        if (!status[item.setId]) {
          const setData = getSetById(item.setId)
          if (setData) {
            status[item.setId] = { set: setData, count: 0 }
          }
        }
        if (status[item.setId]) {
          status[item.setId].count++
        }
      }
    }

    return Object.values(status).sort((a, b) => b.count - a.count)
  }, [equipment])

  const allSets = getSetsJson()
  const equippedSetIds = new Set(setStatus.map(s => s.set.id))

  return (
    <div className="panel-game p-4">
      <h2 className="text-lg font-bold text-amber-400 mb-2">🛡️ 套装</h2>

      {/* 套装概览 */}
      <div className="flex items-center gap-4 mb-4 p-2 bg-gray-900/80 rounded-lg">
        <div className="text-center">
          <p className="text-xl font-bold text-green-400">{setStatus.length}</p>
          <p className="text-[10px] text-gray-500">已激活套装</p>
        </div>
        <div className="flex-1">
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-700 to-green-500"
              style={{ width: `${(setStatus.length / allSets.length) * 100}%` }}
            />
          </div>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-gray-400">{allSets.length}</p>
          <p className="text-[10px] text-gray-500">总套装</p>
        </div>
      </div>

      {/* 已激活的套装 */}
      {setStatus.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-2">已激活</p>
          <div className="space-y-2">
            {setStatus.map(({ set, count }) => (
              <SetCard key={set.id} set={set} equippedCount={count} />
            ))}
          </div>
        </div>
      )}

      {/* 未激活的套装 */}
      <div>
        <p className="text-sm text-gray-400 mb-2">未激活</p>
        <div className="space-y-2">
          {allSets
            .filter(set => !equippedSetIds.has(set.id))
            .map(set => (
              <SetCard key={set.id} set={set} equippedCount={0} />
            ))}
        </div>
      </div>
    </div>
  )
}
