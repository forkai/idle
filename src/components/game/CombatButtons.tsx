/**
 * @fileoverview 战斗操作按钮组件
 * @description 攻击、技能、药水、逃跑按钮
 */

'use client'

import { CombatState } from '@/types/combat'

interface CombatButtonsProps {
  combatState: CombatState
  onAttack: () => void
  onSkill: () => void
  onUsePotion: () => void
  onFlee: () => void
  canUseSkill: boolean
  potionCount: number
  skillCooldownPercent?: number
  skillName?: string
}

/**
 * 战斗操作按钮组件
 */
const CombatButtons = ({
  combatState,
  onAttack,
  onSkill,
  onUsePotion,
  onFlee,
  canUseSkill,
  potionCount,
  skillCooldownPercent,
  skillName,
}: CombatButtonsProps) => {
  const isFighting = combatState === CombatState.FIGHTING

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {/* 攻击按钮 */}
      <button
        onClick={onAttack}
        disabled={!isFighting}
        className="
          px-6 py-3 rounded-lg font-bold cursor-pointer
          bg-gradient-to-b from-red-800 to-red-950
          border-2 border-red-600
          text-white
          hover:from-red-700 hover:to-red-900
          disabled:from-gray-700 disabled:to-gray-800 disabled:border-gray-600 disabled:cursor-not-allowed
          transition-all duration-200
        "
      >
        ⚔️ 攻击
      </button>

      {/* 技能按钮（带冷却进度） */}
      <button
        onClick={onSkill}
        disabled={!isFighting || !canUseSkill}
        className="
          relative px-6 py-3 rounded-lg font-bold cursor-pointer
          bg-gradient-to-b from-blue-800 to-blue-950
          border-2 border-blue-600
          text-white
          hover:from-blue-700 hover:to-blue-900
          disabled:from-gray-700 disabled:to-gray-800 disabled:border-gray-600 disabled:cursor-not-allowed
          transition-all duration-200
        "
      >
        {/* 冷却进度条背景 */}
        {skillCooldownPercent !== undefined && skillCooldownPercent > 0 && (
          <div
            className="absolute inset-0 bg-blue-600/50 rounded-lg transition-all duration-100"
            style={{ width: `${skillCooldownPercent}%` }}
          />
        )}
        <span className="relative z-10">
          {skillName || '✨'} {skillCooldownPercent !== undefined && skillCooldownPercent > 0 ? `${Math.round(skillCooldownPercent)}%` : ''}
        </span>
      </button>

      {/* 药水按钮 */}
      <button
        onClick={onUsePotion}
        disabled={!isFighting || potionCount <= 0}
        className="
          px-6 py-3 rounded-lg font-bold cursor-pointer
          bg-gradient-to-b from-green-800 to-green-950
          border-2 border-green-600
          text-white
          hover:from-green-700 hover:to-green-900
          disabled:from-gray-700 disabled:to-gray-800 disabled:border-gray-600 disabled:cursor-not-allowed
          transition-all duration-200
        "
      >
        🧪 药水 ({potionCount})
      </button>

      {/* 逃跑按钮 */}
      <button
        onClick={onFlee}
        disabled={!isFighting}
        className="
          px-6 py-3 rounded-lg font-bold cursor-pointer
          bg-gradient-to-b from-gray-700 to-gray-850
          border-2 border-gray-600
          text-gray-300
          hover:from-gray-600 hover:to-gray-800
          disabled:from-gray-800 disabled:to-gray-900 disabled:border-gray-700 disabled:text-gray-600 disabled:cursor-not-allowed
          transition-all duration-200
        "
      >
        💨 逃跑
      </button>
    </div>
  )
}

export { CombatButtons }
