/**
 * @fileoverview 技能热键栏组件
 * @description 显示和操作技能快捷栏
 */

'use client'

import { CombatState } from '@/types/combat'
import { getSkillById } from '@/constants/skills'
import { cn } from '@/lib/utils'

interface SkillHotbarProps {
  unlockedSkills: string[]
  skillLevels: Record<string, number>
  getSkillCooldownRemaining: (skillId: string) => number
  onSkillClick: (skillId: string) => void
  canUseSkill: (skillId: string) => boolean
  combatState: CombatState
  computedStats: { mana: number; maxMana: number }
}

/**
 * 技能热键栏组件
 * 显示前4个技能及其冷却状态
 */
const SkillHotbar = ({
  unlockedSkills,
  skillLevels,
  getSkillCooldownRemaining,
  onSkillClick,
  canUseSkill,
  combatState,
  computedStats,
}: SkillHotbarProps) => {
  const isFighting = combatState === CombatState.FIGHTING

  // 只显示前4个技能
  const displaySkills = unlockedSkills.slice(0, 4)

  return (
    <div className="flex justify-center gap-2 mt-3">
      {displaySkills.map((skillId, index) => {
        const skill = getSkillById(skillId)
        if (!skill) return null

        const level = skillLevels[skillId] ?? 1
        const cooldownRemaining = getSkillCooldownRemaining(skillId)
        const cooldownTotal = skill.cooldown
        const cooldownPercent = cooldownTotal > 0 ? ((cooldownTotal - cooldownRemaining) / cooldownTotal) * 100 : 100
        const manaCost = skill.cost.mana * (1 + (level - 1) * 0.1)
        const hasEnoughMana = computedStats.mana >= manaCost
        const isReady = cooldownRemaining === 0 && hasEnoughMana

        return (
          <button
            key={skillId}
            onClick={() => onSkillClick(skillId)}
            disabled={!isFighting || !isReady}
            className={cn(
              'relative w-12 h-12 rounded-lg border-2 flex flex-col items-center justify-center',
              'transition-all duration-150 cursor-pointer',
              isReady
                ? 'bg-gray-800 border-amber-500 hover:border-amber-400 hover:scale-110'
                : 'bg-gray-900 border-gray-700 opacity-60',
              'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100'
            )}
            title={`${skill.name} (${index + 1})`}
          >
            {/* 冷却进度条背景 */}
            {cooldownPercent < 100 && (
              <div
                className="absolute inset-0 bg-black/60 rounded-md transition-all duration-100 rounded-l-md"
                style={{ width: `${cooldownPercent}%` }}
              />
            )}

            <span className={cn('text-xl', cooldownPercent < 100 && 'grayscale')}>{skill.icon}</span>

            {/* 法力不足指示 */}
            {!hasEnoughMana && cooldownRemaining === 0 && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-[8px]">💧</span>
              </div>
            )}

            {/* 热键提示 */}
            <span className="absolute -bottom-1 text-[8px] text-gray-500">{index + 1}</span>
          </button>
        )
      })}
    </div>
  )
}

export { SkillHotbar }
