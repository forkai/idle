/**
 * @fileoverview 离线收益弹窗组件
 * @description 玩家返回时显示离线期间获得的收益
 */

'use client'

import { useState, useEffect } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { calculateOfflineRewards, formatOfflineTime, shouldCalculateOfflineRewards, type OfflineRewards } from '@/lib/game/offline-rewards'
import { usePlayerStore } from '@/stores/playerStore'
import { useInventoryStore } from '@/stores/inventoryStore'
import { useZoneStore } from '@/stores/zoneStore'

/**
 * 离线收益弹窗属性
 */
interface OfflineRewardModalProps {
  isOpen: boolean
  onClose: () => void
  lastSaveTime: number
}

/**
 * 离线收益弹窗组件
 */
export function OfflineRewardModal({ isOpen, onClose, lastSaveTime }: OfflineRewardModalProps) {
  const { player } = useGameStore()
  const { addExperience, addGold } = usePlayerStore()
  const { addToInventory } = useInventoryStore()
  const { currentZoneId } = useZoneStore()
  const [rewards, setRewards] = useState<OfflineRewards | null>(null)
  const [claimed, setClaimed] = useState(false)

  useEffect(() => {
    if (isOpen && shouldCalculateOfflineRewards(lastSaveTime)) {
      const offlineRewards = calculateOfflineRewards(
        lastSaveTime,
        { level: player.level } as any,
        { level: 1, goldBonus: 1, expBonus: 1 }
      )
      setRewards(offlineRewards)
    }
  }, [isOpen, lastSaveTime, player.level])

  const handleClaim = () => {
    if (!rewards || claimed) return

    // 添加经验
    if (rewards.exp > 0) {
      addExperience(rewards.exp)
    }

    // 添加金币
    if (rewards.gold > 0) {
      addGold(rewards.gold)
    }

    // 添加物品
    for (const item of rewards.items) {
      addToInventory(item)
    }

    setClaimed(true)
    setTimeout(onClose, 500)
  }

  if (!isOpen || !rewards || rewards.offlineTime === 0) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="panel-game w-full max-w-md mx-4 p-6 border-2 border-amber-500">
        <h2 className="text-xl font-bold text-amber-400 text-center mb-2">
          ⏰ 离线收益
        </h2>
        <p className="text-center text-gray-400 text-sm mb-4">
          你离开了 {formatOfflineTime(rewards.offlineTime)}
        </p>

        {/* 收益统计 */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded">
            <span className="text-gray-400">击杀怪物</span>
            <span className="text-lg font-bold text-white">{rewards.kills}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded">
            <span className="text-gray-400">获得经验</span>
            <span className="text-lg font-bold text-blue-400">+{rewards.exp.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded">
            <span className="text-gray-400">获得金币</span>
            <span className="text-lg font-bold text-yellow-400">+{rewards.gold.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded">
            <span className="text-gray-400">获得物品</span>
            <span className="text-lg font-bold text-green-400">+{rewards.items.length} 件</span>
          </div>
        </div>

        {/* 物品预览 */}
        {rewards.items.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-400 mb-2">物品预览：</p>
            <div className="flex flex-wrap gap-2 p-3 bg-gray-900/50 rounded max-h-32 overflow-y-auto">
              {rewards.items.slice(0, 8).map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1 px-2 py-1 bg-gray-800 rounded text-xs"
                  title={item.name}
                >
                  <span>{item.icon}</span>
                  <span className="text-gray-300">{item.name}</span>
                </div>
              ))}
              {rewards.items.length > 8 && (
                <span className="text-gray-500 text-xs">...还有 {rewards.items.length - 8} 件</span>
              )}
            </div>
          </div>
        )}

        {/* 提示 */}
        {rewards.exp >= rewards.cap.exp && (
          <p className="text-xs text-amber-500 mb-4 text-center">
            经验已达上限，实际收益可能更高
          </p>
        )}

        {/* 按钮 */}
        <button
          onClick={handleClaim}
          disabled={claimed}
          className={`w-full py-3 rounded-lg font-bold text-lg transition-all ${
            claimed
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-amber-600 hover:bg-amber-500 text-white'
          }`}
        >
          {claimed ? '已领取 ✓' : '领取奖励'}
        </button>
      </div>
    </div>
  )
}
