/**
 * @fileoverview 装备强化面板组件
 * @description 提供装备强化的UI界面
 */

'use client'

import { useState, useEffect } from 'react'
import { useEnhancementStore } from '@/stores/enhancementStore'
import { useInventoryStore } from '@/stores/inventoryStore'
import { usePlayerStore } from '@/stores/playerStore'
import { useGameStore } from '@/stores/gameStore'
import {
  EnhancementStoneType,
  EnhancementStoneNames,
  ENHANCEMENT_CONFIG,
  EnhancementResult,
  ENHANCEMENT_RESULT_INFO,
  MAX_ENHANCEMENT_LEVEL,
} from '@/constants/enhancement'
import type { Item } from '@/types/items'
import { ItemRarity, RarityInfo } from '@/types/items'
import { playSound } from '@/lib/game/sound'

/**
 * 强化石图标映射
 */
const STONE_ICONS: Record<EnhancementStoneType, string> = {
  [EnhancementStoneType.NORMAL]: '💎',
  [EnhancementStoneType.ADVANCED]: '💠',
  [EnhancementStoneType.PERFECT]: '💟',
}

/**
 * 强化结果动画组件
 */
function EnhancementResultModal({
  result,
  itemName,
  fromLevel,
  toLevel,
  onClose,
}: {
  result: EnhancementResult
  itemName: string
  fromLevel: number
  toLevel: number
  onClose: () => void
}) {
  const info = ENHANCEMENT_RESULT_INFO[result]

  useEffect(() => {
    if (result === EnhancementResult.SUCCESS) {
      playSound('levelup')
    } else {
      playSound('click')
    }

    const timer = setTimeout(onClose, 2000)
    return () => clearTimeout(timer)
  }, [result, onClose])

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-gray-900 border-2 border-gray-700 rounded-xl p-8 text-center max-w-md w-full mx-4 animate-in zoom-in-95 duration-300">
        {/* 动画图标 */}
        <div className={`text-6xl mb-4 ${result === EnhancementResult.SUCCESS ? 'animate-bounce' : 'animate-shake'}`}>
          {result === EnhancementResult.SUCCESS && '✨'}
          {result === EnhancementResult.DEGRADE && '📉'}
          {result === EnhancementResult.BREAK && '💥'}
          {result === EnhancementResult.MAX_LEVEL && '⭐'}
        </div>

        {/* 结果文字 */}
        <p className={`text-xl font-bold mb-2 ${info.color}`}>
          {info.message}
        </p>

        {/* 物品信息 */}
        <p className="text-gray-300 mb-4">
          {itemName}
          {result !== EnhancementResult.BREAK && (
            <span className="text-gray-500 ml-2">
              (+{fromLevel} → +{toLevel})
            </span>
          )}
          {result === EnhancementResult.BREAK && (
            <span className="text-red-400 ml-2">
              (+{fromLevel} → +0)
            </span>
          )}
        </p>

        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
        >
          关闭
        </button>
      </div>
    </div>
  )
}

/**
 * 强化石选择按钮
 */
function StoneButton({
  type,
  selected,
  onClick,
  count,
  successRate,
  disabled,
}: {
  type: EnhancementStoneType
  selected: boolean
  onClick: () => void
  count: number
  successRate: number
  disabled: boolean
}) {
  const canUse = count > 0 && !disabled

  return (
    <button
      onClick={onClick}
      disabled={!canUse}
      className={`
        relative flex flex-col items-center p-3 rounded-lg border-2 transition-all
        ${selected
          ? 'border-amber-500 bg-amber-900/30'
          : canUse
            ? 'border-gray-600 bg-gray-800 hover:border-gray-500'
            : 'border-gray-700 bg-gray-900 opacity-50'
        }
        ${canUse ? 'cursor-pointer' : 'cursor-not-allowed'}
      `}
    >
      <span className="text-2xl">{STONE_ICONS[type]}</span>
      <span className="text-xs text-gray-300 mt-1">{EnhancementStoneNames[type]}</span>
      <span className="text-[10px] text-gray-500">x{count}</span>
      <span className="text-[10px] text-green-400 mt-0.5">
        {Math.round(successRate * 100)}%成功率
      </span>

      {selected && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
          <span className="text-[8px]">✓</span>
        </div>
      )}
    </button>
  )
}

/**
 * 物品卡片组件
 */
function ItemCard({
  item,
  selected,
  onClick,
}: {
  item: Item
  selected: boolean
  onClick: () => void
}) {
  const rarityColor = RarityInfo[item.rarity]?.color || '#ffffff'
  const enhancementLevel = item.enhancementLevel ?? 0

  return (
    <button
      onClick={onClick}
      className={`
        relative p-2 rounded-lg border-2 transition-all text-left
        ${selected
          ? 'border-amber-500 bg-amber-900/30'
          : 'border-gray-700 bg-gray-800 hover:border-gray-600'
        }
      `}
    >
      {/* 强化等级标识 */}
      {enhancementLevel > 0 && (
        <div className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-amber-600 text-[10px] font-bold text-white rounded">
          +{enhancementLevel}
        </div>
      )}

      <div className="flex items-center gap-2">
        <span className="text-2xl">{item.icon}</span>
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-medium truncate"
            style={{ color: rarityColor }}
          >
            {item.name}
          </p>
          <p className="text-[10px] text-gray-500">
            {item.slot ? `装备·${item.slot}` : item.type}
          </p>
        </div>
      </div>
    </button>
  )
}

/**
 * 强化面板主组件
 */
export function EnhancementPanel() {
  const { selectedItem, selectItem, enhance, stones, clearSelection } = useEnhancementStore()
  const { inventory, updateItem } = useInventoryStore()
  const { player, spendGold } = usePlayerStore()
  const { refreshComputedStats } = useGameStore()

  const [selectedStone, setSelectedStone] = useState<EnhancementStoneType>(EnhancementStoneType.NORMAL)
  const [result, setResult] = useState<{
    result: EnhancementResult
    itemName: string
    fromLevel: number
    toLevel: number
  } | null>(null)

  // 获取可强化的装备（排除已锁定的）
  const equippableItems = inventory.slots.filter(
    (slot): slot is Item => slot !== null && slot !== undefined && !slot.locked
  )

  // 当前选中物品的强化配置
  const currentLevel = selectedItem?.enhancementLevel ?? 0
  const nextLevelConfig = ENHANCEMENT_CONFIG[currentLevel]
  const selectedStoneConfig = nextLevelConfig

  // 计算各强化石成功率
  const stoneSuccessRates = {
    [EnhancementStoneType.NORMAL]: currentLevel < MAX_ENHANCEMENT_LEVEL
      ? selectedStoneConfig.normalSuccessRate / 100
      : 0,
    [EnhancementStoneType.ADVANCED]: currentLevel < MAX_ENHANCEMENT_LEVEL
      ? selectedStoneConfig.advancedSuccessRate / 100
      : 0,
    [EnhancementStoneType.PERFECT]: 1.0,
  }

  // 是否有足够的材料和金币
  const hasEnoughMaterials = selectedItem && currentLevel < MAX_ENHANCEMENT_LEVEL
    ? stones[selectedStone] >= selectedStoneConfig.stoneCost
    : false
  const hasEnoughGold = selectedItem && currentLevel < MAX_ENHANCEMENT_LEVEL
    ? player.gold >= selectedStoneConfig.goldCost
    : false

  // 执行强化
  const handleEnhance = () => {
    if (!selectedItem || !hasEnoughMaterials || !hasEnoughGold) return

    const enhanceResult = enhance(selectedItem, selectedStone, player.gold)

    // 扣除金币
    if (enhanceResult.result !== EnhancementResult.INSUFFICIENT_MATERIALS) {
      spendGold(enhanceResult.goldCost)
    }

    // 更新物品
    if (enhanceResult.result !== EnhancementResult.INSUFFICIENT_MATERIALS) {
      updateItem(enhanceResult.newItem)
      refreshComputedStats()

      // 显示结果
      setResult({
        result: enhanceResult.result,
        itemName: selectedItem.name,
        fromLevel: currentLevel,
        toLevel: enhanceResult.newItem.enhancementLevel ?? 0,
      })
    }

    playSound('click')
  }

  // 关闭结果弹窗
  const handleCloseResult = () => {
    setResult(null)
    clearSelection()
  }

  return (
    <div className="panel-game p-4">
      <h2 className="text-lg font-bold text-amber-400 mb-4">🔨 装备强化</h2>

      {/* 强化石库存 */}
      <div className="mb-4">
        <p className="text-sm text-gray-400 mb-2">强化石</p>
        <div className="flex gap-2">
          {Object.values(EnhancementStoneType).map(type => (
            <StoneButton
              key={type}
              type={type}
              selected={selectedStone === type}
              onClick={() => setSelectedStone(type)}
              count={stones[type]}
              successRate={stoneSuccessRates[type]}
              disabled={!selectedItem || currentLevel >= MAX_ENHANCEMENT_LEVEL}
            />
          ))}
        </div>
      </div>

      {/* 选择物品 */}
      <div className="mb-4">
        <p className="text-sm text-gray-400 mb-2">选择装备</p>
        <div className="max-h-48 overflow-y-auto space-y-2">
          {equippableItems.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              背包中没有可强化的装备
            </p>
          ) : (
            equippableItems.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                selected={selectedItem?.id === item.id}
                onClick={() => selectItem(item)}
              />
            ))
          )}
        </div>
      </div>

      {/* 强化预览 */}
      {selectedItem && currentLevel < MAX_ENHANCEMENT_LEVEL && (
        <div className="mb-4 p-3 bg-gray-900/80 rounded-lg border border-gray-700">
          <p className="text-sm text-gray-300 mb-2">
            强化 <span className="text-amber-400">{selectedItem.name}</span>
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">当前等级</span>
              <span className="text-gray-300">+{currentLevel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">目标等级</span>
              <span className="text-amber-400">+{currentLevel + 1}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">成功率</span>
              <span className="text-green-400">
                {Math.round(stoneSuccessRates[selectedStone] * 100)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">消耗金币</span>
              <span className="text-yellow-400">{selectedStoneConfig.goldCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">消耗强化石</span>
              <span className="text-blue-400">x{selectedStoneConfig.stoneCost}</span>
            </div>
            {selectedStoneConfig.breakChance > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">损坏几率</span>
                <span className="text-red-400">{selectedStoneConfig.breakChance}%</span>
              </div>
            )}
          </div>

          {/* 强化按钮 */}
          <button
            onClick={handleEnhance}
            disabled={!hasEnoughMaterials || !hasEnoughGold}
            className={`
              w-full mt-3 py-2 rounded-lg font-bold text-sm transition-all
              ${hasEnoughMaterials && hasEnoughGold
                ? 'bg-gradient-to-b from-amber-700 to-amber-900 border border-amber-500 text-white hover:from-amber-600 hover:to-amber-800 cursor-pointer'
                : 'bg-gray-800 border border-gray-700 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {!selectedItem ? '请选择装备' :
              currentLevel >= MAX_ENHANCEMENT_LEVEL ? '已达最大等级' :
                !hasEnoughMaterials ? '强化石不足' :
                  !hasEnoughGold ? '金币不足' :
                    `强化 (+${currentLevel} → +${currentLevel + 1})`
            }
          </button>
        </div>
      )}

      {/* 已达最大等级提示 */}
      {selectedItem && currentLevel >= MAX_ENHANCEMENT_LEVEL && (
        <div className="mb-4 p-3 bg-gray-900/80 rounded-lg border border-gray-700 text-center">
          <p className="text-amber-400 font-bold">⭐ 已达最大强化等级</p>
          <p className="text-xs text-gray-500 mt-1">+{MAX_ENHANCEMENT_LEVEL} 强化</p>
        </div>
      )}

      {/* 关闭按钮 */}
      <button
        onClick={clearSelection}
        className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-lg transition-colors text-sm"
      >
        关闭
      </button>

      {/* 结果弹窗 */}
      {result && (
        <EnhancementResultModal
          result={result.result}
          itemName={result.itemName}
          fromLevel={result.fromLevel}
          toLevel={result.toLevel}
          onClose={handleCloseResult}
        />
      )}
    </div>
  )
}
