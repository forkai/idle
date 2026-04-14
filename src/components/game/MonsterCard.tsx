/**
 * @fileoverview 怪物卡片组件
 * @description 显示怪物的状态和信息
 */

'use client'

import type { Monster } from '@/types/enemy'
import { MonsterType } from '@/types/enemy'
import { cn } from '@/lib/utils'

interface MonsterCardProps {
  monster: Monster
  health: number
  maxHealth: number
  isDying?: boolean
}

/**
 * 怪物卡片组件
 * 显示怪物图标、名称、等级和血条
 */
const MonsterCard = ({ monster, health, maxHealth, isDying }: MonsterCardProps) => {
  const healthPercent = (health / maxHealth) * 100
  const isBoss = monster.type === MonsterType.BOSS
  const isLowHealth = healthPercent < 30

  return (
    <div className={cn(
      'relative p-4 rounded-lg border-2 text-center',
      isBoss
        ? 'bg-gradient-to-b from-purple-950 to-gray-900 border-purple-500 animate-boss-appear'
        : 'bg-gray-900 border-gray-700',
      isDying && 'animate-monster-death',
      isLowHealth && !isDying && 'animate-health-critical'
    )}>
      {/* Boss标识 */}
      {isBoss && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-purple-800 text-xs font-bold text-purple-200 rounded-full">
          BOSS
        </div>
      )}

      {/* 怪物图标 */}
      <div className={cn('text-6xl mb-2', isDying && 'animate-monster-death')}>
        {monster.icon}
      </div>

      {/* 怪物名称 */}
      <h3 className={cn('font-bold', isBoss ? 'text-purple-300' : 'text-gray-200')}>
        {monster.name}
      </h3>
      <p className="text-xs text-gray-500">Lv.{monster.level}</p>

      {/* 血条 */}
      <div className="mt-3">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>❤️ {health.toLocaleString()}</span>
          <span>{maxHealth.toLocaleString()}</span>
        </div>
        <div className={cn(
          'h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700',
          isLowHealth && 'animate-health-critical'
        )}>
          <div
            className="h-full bg-gradient-to-r from-red-700 to-red-900 transition-all duration-300 rounded-full"
            style={{ width: `${healthPercent}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export { MonsterCard }
