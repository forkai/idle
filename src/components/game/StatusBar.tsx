/**
 * @fileoverview 角色状态栏组件
 * @description 显示角色头顶的状态信息（HP、MP、等级、金币等）
 */

'use client'

import { useGameStore } from '@/stores/gameStore'
import { CharacterClassNames } from '@/types/game'
import { getExpForLevel } from '@/types/game'
import { cn } from '@/lib/utils'

/**
 * 状态条组件属性
 */
interface StatBarProps {
  current: number
  max: number
  color: 'health' | 'mana' | 'exp'
  label?: string
}

/**
 * 状态条组件
 */
const StatBar = ({ current, max, color, label }: StatBarProps) => {
  const percentage = Math.min(100, (current / max) * 100)

  const colors = {
    health: 'bg-gradient-to-r from-red-700 to-red-900',
    mana: 'bg-gradient-to-r from-blue-600 to-blue-800',
    exp: 'bg-gradient-to-r from-amber-500 to-amber-700',
  }

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">{label}</span>
          <span className="text-gray-300">{current.toLocaleString()} / {max.toLocaleString()}</span>
        </div>
      )}
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
        <div
          className={cn('h-full rounded-full transition-all duration-300', colors[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

/**
 * 角色图标组件
 */
const CharacterIcon = ({ classId }: { classId: string }) => {
  const icons: Record<string, string> = {
    warrior: '⚔️',
    sorcerer: '🔥',
    rogue: '🏹',
  }
  return <span className="text-3xl">{icons[classId] || '❓'}</span>
}

/**
 * 角色状态栏组件
 */
export function StatusBar() {
  const { player, computedStats } = useGameStore()

  // 计算升级进度
  const currentLevelExp = getExpForLevel(player.level)
  const nextLevelExp = getExpForLevel(player.level + 1)
  const expProgress = nextLevelExp > currentLevelExp
    ? ((player.experience - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100
    : 100

  return (
    <div className="panel-game p-4 min-h-full">
      {/* 顶部：角色信息 */}
      <div className="flex items-center gap-4 mb-4">
        {/* 角色头像 */}
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border-2 border-amber-600 flex items-center justify-center">
            <CharacterIcon classId={player.classId} />
          </div>
          {/* 等级标识 */}
          <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-red-800 border-2 border-amber-500 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-amber-400">{player.level}</span>
          </div>
        </div>

        {/* 角色信息 */}
        <div className="flex-1">
          <h2 className="text-lg font-bold text-gray-200">{player.name}</h2>
          <p className="text-sm text-gray-500">{CharacterClassNames[player.classId]}</p>
        </div>

        {/* 金币 */}
        <div className="flex items-center gap-2 bg-gray-800/50 px-3 py-2 rounded-lg">
          <span className="text-xl">💰</span>
          <span className="text-amber-400 font-bold">{player.gold.toLocaleString()}</span>
        </div>
      </div>

      {/* 状态条 */}
      <div className="space-y-3">
        {/* 生命值 */}
        <div>
          <StatBar
            current={computedStats.health}
            max={computedStats.maxHealth}
            color="health"
            label="❤️ 生命"
          />
        </div>

        {/* 法力值 */}
        <div>
          <StatBar
            current={computedStats.mana}
            max={computedStats.maxMana}
            color="mana"
            label="💧 法力"
          />
        </div>

        {/* 经验条 */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-400">⬆️ 经验</span>
            <span className="text-gray-400">
              {player.level < 99
                ? `${(player.experience - getExpForLevel(player.level)).toLocaleString()} / ${(getExpForLevel(player.level + 1) - getExpForLevel(player.level)).toLocaleString()}`
                : '已满级'
              }
            </span>
          </div>
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-700 transition-all duration-300 rounded-full"
              style={{ width: `${expProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* 战斗属性预览 */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        {/* 基础属性行 */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs mb-2">
          <div className="bg-gray-800/50 p-2 rounded">
            <p className="text-red-400">⚔️ {computedStats.damage}</p>
            <p className="text-gray-500">伤害</p>
          </div>
          <div className="bg-gray-800/50 p-2 rounded">
            <p className="text-blue-400">🛡️ {computedStats.defense}</p>
            <p className="text-gray-500">防御</p>
          </div>
          <div className="bg-gray-800/50 p-2 rounded">
            <p className="text-yellow-400">💥 {(computedStats.critChance * 100).toFixed(0)}%</p>
            <p className="text-gray-500">暴击</p>
          </div>
          <div className="bg-gray-800/50 p-2 rounded">
            <p className="text-green-400">⚡ {computedStats.attackSpeed.toFixed(2)}</p>
            <p className="text-gray-500">攻速</p>
          </div>
        </div>

        {/* 元素抗性行 */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="bg-gray-800/30 p-1.5 rounded">
            <p className="text-orange-400">🔥 {computedStats.fireResist || 0}%</p>
            <p className="text-gray-600 text-[10px]">火抗</p>
          </div>
          <div className="bg-gray-800/30 p-1.5 rounded">
            <p className="text-cyan-400">❄️ {computedStats.coldResist || 0}%</p>
            <p className="text-gray-600 text-[10px]">冰抗</p>
          </div>
          <div className="bg-gray-800/30 p-1.5 rounded">
            <p className="text-yellow-300">⚡ {computedStats.lightningResist || 0}%</p>
            <p className="text-gray-600 text-[10px]">雷抗</p>
          </div>
          <div className="bg-gray-800/30 p-1.5 rounded">
            <p className="text-green-500">☠️ {computedStats.poisonResist || 0}%</p>
            <p className="text-gray-600 text-[10px]">毒抗</p>
          </div>
        </div>

        {/* 恢复属性 */}
        <div className="grid grid-cols-2 gap-2 text-center text-xs mt-2">
          <div className="bg-gray-800/30 p-1.5 rounded flex items-center justify-center gap-1">
            <span className="text-red-400">❤️</span>
            <span className="text-gray-400">+{computedStats.healthRegen || 0}/秒</span>
          </div>
          <div className="bg-gray-800/30 p-1.5 rounded flex items-center justify-center gap-1">
            <span className="text-blue-400">💧</span>
            <span className="text-gray-400">+{computedStats.manaRegen || 0}/秒</span>
          </div>
        </div>
      </div>
    </div>
  )
}
