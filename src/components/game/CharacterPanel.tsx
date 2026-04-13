/**
 * @fileoverview 角色属性面板组件
 * @description 展示详细角色属性，支持属性点分配
 */

'use client'

import { useGameStore } from '@/stores/gameStore'
import { CharacterClassNames } from '@/types/game'
import { playSound } from '@/lib/game/sound'

/** 属性图标映射 */
const STAT_ICONS: Record<string, string> = {
  strength: '💪',
  dexterity: '🏃',
  vitality: '❤️',
  energy: '🔮',
}

/** 属性中文名映射 */
const STAT_NAMES: Record<string, string> = {
  strength: '力量',
  dexterity: '敏捷',
  vitality: '体力',
  energy: '能量',
}

/** 战斗属性显示项 */
function CombatStatRow({ icon, label, value, color, subValue }: {
  icon: string; label: string; value: string | number; color: string; subValue?: string
}) {
  return (
    <div className="flex items-center justify-between py-1.5 px-2 bg-gray-900/30 rounded">
      <div className="flex items-center gap-2">
        <span className="text-sm">{icon}</span>
        <span className="text-xs text-gray-400">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {subValue && <span className="text-[10px] text-gray-600">{subValue}</span>}
        <span className={`text-sm font-bold ${color}`}>{value}</span>
      </div>
    </div>
  )
}

/** 属性分配按钮 */
function StatAllocator({ stat, value, allocated, available, onAdd, onRemove }: {
  stat: string
  value: number
  allocated: number
  available: number
  onAdd: () => void
  onRemove: () => void
}) {
  return (
    <div className="flex items-center justify-between py-2 px-2 bg-gray-900/30 rounded">
      <div className="flex items-center gap-2">
        <span className="text-lg">{STAT_ICONS[stat]}</span>
        <div>
          <p className="text-sm text-gray-200">{STAT_NAMES[stat]}</p>
          <p className="text-[10px] text-gray-500">
            总计: {value + allocated} = {value}基础 + {allocated}已分配
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {allocated > 0 && (
          <button
            onClick={onRemove}
            className="w-7 h-7 rounded bg-gray-800 border border-gray-600 text-red-400 font-bold hover:border-red-500 hover:bg-gray-700 transition-all cursor-pointer"
          >
            -
          </button>
        )}
        <span className="w-6 text-center text-amber-400 font-bold text-sm">{allocated}</span>
        {available > 0 && (
          <button
            onClick={onAdd}
            className="w-7 h-7 rounded bg-gray-800 border border-gray-600 text-green-400 font-bold hover:border-green-500 hover:bg-gray-700 transition-all cursor-pointer"
          >
            +
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * 角色属性面板主组件
 */
export function CharacterPanel() {
  const { player, computedStats, allocateStat, getAvailableStatPoints } = useGameStore()
  const availablePoints = getAvailableStatPoints()

  // 获取属性加成描述
  const getStatBonus = (stat: 'strength' | 'dexterity' | 'vitality' | 'energy') => {
    const bonus = player.allocatedStats[stat]
    if (stat === 'strength') return `+${bonus * 1} 伤害`
    if (stat === 'dexterity') return `+${bonus * 0.5}% 攻速, +${bonus * 0.3}% 暴击`
    if (stat === 'vitality') return `+${bonus * 10} 生命, +${bonus * 0.5} 防御`
    if (stat === 'energy') return `+${bonus * 5} 法力, +${bonus * 0.3} 回蓝`
    return ''
  }

  return (
    <div className="panel-game overflow-hidden">
      {/* 标题区 */}
      <div className="relative px-4 pt-4 pb-3">
        <h2 className="text-lg font-bold text-amber-400 tracking-wider">👤 角色属性</h2>
        <p className="text-xs text-gray-500 mt-0.5">分配属性点提升角色能力</p>
      </div>

      {/* 可用属性点 */}
      <div className="px-4 pb-3">
        <div className="flex items-center justify-between bg-amber-950/30 border border-amber-700/50 rounded-lg px-3 py-2">
          <span className="text-sm text-amber-400">可用属性点</span>
          <span className="text-xl font-bold text-amber-400">{availablePoints}</span>
        </div>
      </div>

      {/* 属牆分配区域 */}
      <div className="px-4 pb-3">
        <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">分配属性</p>
        <div className="space-y-1">
          <StatAllocator
            stat="strength"
            value={player.baseStats.strength}
            allocated={player.allocatedStats.strength}
            available={availablePoints}
            onAdd={() => { allocateStat('strength', 1); playSound('click') }}
            onRemove={() => { allocateStat('strength', -1); playSound('click') }}
          />
          <StatAllocator
            stat="dexterity"
            value={player.baseStats.dexterity}
            allocated={player.allocatedStats.dexterity}
            available={availablePoints}
            onAdd={() => { allocateStat('dexterity', 1); playSound('click') }}
            onRemove={() => { allocateStat('dexterity', -1); playSound('click') }}
          />
          <StatAllocator
            stat="vitality"
            value={player.baseStats.vitality}
            allocated={player.allocatedStats.vitality}
            available={availablePoints}
            onAdd={() => { allocateStat('vitality', 1); playSound('click') }}
            onRemove={() => { allocateStat('vitality', -1); playSound('click') }}
          />
          <StatAllocator
            stat="energy"
            value={player.baseStats.energy}
            allocated={player.allocatedStats.energy}
            available={availablePoints}
            onAdd={() => { allocateStat('energy', 1); playSound('click') }}
            onRemove={() => { allocateStat('energy', -1); playSound('click') }}
          />
        </div>
      </div>

      {/* 详细战斗属性 */}
      <div className="px-4 pb-4">
        <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">战斗属性</p>

        {/* 主要属性 */}
        <div className="space-y-0.5 mb-3">
          <CombatStatRow icon="⚔️" label="物理伤害" value={computedStats.damage} color="text-red-400" />
          <CombatStatRow icon="🛡️" label="防御力" value={computedStats.defense} color="text-blue-400" />
          <CombatStatRow icon="💥" label="暴击率" value={`${(computedStats.critChance * 100).toFixed(1)}%`} color="text-yellow-400" />
          <CombatStatRow icon="⚡" label="攻击速度" value={`${computedStats.attackSpeed.toFixed(2)}/秒`} color="text-green-400" />
          <CombatStatRow icon="💢" label="暴击伤害" value={`${(computedStats.critDamage * 100).toFixed(0)}%`} color="text-orange-400" />
        </div>

        {/* 生命与法力 */}
        <div className="space-y-0.5 mb-3">
          <CombatStatRow
            icon="❤️"
            label="最大生命"
            value={computedStats.maxHealth.toLocaleString()}
            color="text-red-400"
            subValue={`+${computedStats.healthRegen}/秒`}
          />
          <CombatStatRow
            icon="💧"
            label="最大法力"
            value={computedStats.maxMana.toLocaleString()}
            color="text-blue-400"
            subValue={`+${computedStats.manaRegen}/秒`}
          />
        </div>

        {/* 元素抗性 */}
        <p className="text-xs text-gray-500 mb-1">元素抗性</p>
        <div className="grid grid-cols-2 gap-1 mb-3">
          <CombatStatRow icon="🔥" label="火焰抗性" value={`${computedStats.fireResist || 0}%`} color="text-orange-400" />
          <CombatStatRow icon="❄️" label="冰冷抗性" value={`${computedStats.coldResist || 0}%`} color="text-cyan-400" />
          <CombatStatRow icon="⚡" label="闪电抗性" value={`${computedStats.lightningResist || 0}%`} color="text-yellow-300" />
          <CombatStatRow icon="☠️" label="毒素抗性" value={`${computedStats.poisonResist || 0}%`} color="text-green-500" />
        </div>

        {/* 职业信息 */}
        <div className="pt-2 border-t border-gray-700">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">职业</span>
            <span className="text-gray-300">{CharacterClassNames[player.classId]}</span>
          </div>
          <div className="flex items-center justify-between text-xs mt-1">
            <span className="text-gray-500">等级</span>
            <span className="text-amber-400 font-bold">Lv.{player.level}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
