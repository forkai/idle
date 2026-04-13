/**
 * @fileoverview 技能面板组件
 * @description 展示职业技能树，支持技能解锁/升级
 */

'use client'

import { useState } from 'react'
import { useSkillStore } from '@/stores/skillStore'
import { useGameStore } from '@/stores/gameStore'
import { getSkillsByClass } from '@/constants/skills'
import { CharacterClass } from '@/types/game'
import { SkillType, SkillTypeNames, type Skill } from '@/types/skills'
import { playSound } from '@/lib/game/sound'

/** 技能层分组 */
function groupByTier(skills: Skill[]): Record<number, Skill[]> {
  return skills.reduce((acc, skill) => {
    if (!acc[skill.tier]) acc[skill.tier] = []
    acc[skill.tier].push(skill)
    return acc
  }, {} as Record<number, Skill[]>)
}

/** 单个技能图标 */
function SkillIcon({
  skill,
  level,
  isUnlocked,
  canUnlock,
  isSelected,
  onClick,
  onHover,
  onLeave,
}: {
  skill: Skill
  level: number
  isUnlocked: boolean
  canUnlock: boolean
  isSelected: boolean
  onClick: () => void
  onHover: (e: React.MouseEvent) => void
  onLeave: () => void
}) {
  const isLocked = !isUnlocked && !canUnlock
  const borderColor = isUnlocked
    ? 'border-amber-500'
    : canUnlock
      ? 'border-yellow-600 animate-pulse'
      : 'border-gray-700'

  return (
    <button
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      disabled={isLocked}
      className={`
        relative w-14 h-14 rounded-lg border-2 flex flex-col items-center justify-center
        transition-all duration-150
        ${isLocked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:scale-110'}
        ${isSelected ? 'ring-2 ring-amber-400 shadow-lg shadow-amber-500/40' : ''}
        ${borderColor}
        ${isUnlocked ? 'bg-gray-800' : 'bg-gray-900/50'}
      `}
      title={isUnlocked ? `${skill.name} Lv.${level}` : isLocked ? `${skill.name} (未解锁)` : `${skill.name} (可解锁)`}
    >
      <span className={`text-2xl ${!isUnlocked ? 'grayscale' : ''}`}>{skill.icon}</span>
      {isUnlocked && level > 0 && (
        <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-600 rounded-full flex items-center justify-center text-[9px] font-bold text-white">
          {level}
        </span>
      )}
      {canUnlock && !isUnlocked && (
        <span className="absolute -top-1 -right-1 text-[10px]">❗</span>
      )}
    </button>
  )
}

/** 技能详情浮层 */
function SkillTooltip({
  skill,
  level,
  isUnlocked,
  canUnlock,
  playerLevel,
  position,
}: {
  skill: Skill
  level: number
  isUnlocked: boolean
  canUnlock: boolean
  playerLevel: number
  position: { x: number; y: number }
}) {
  const style = {
    left: Math.min(position.x + 16, window.innerWidth - 300),
    top: Math.min(position.y - 8, window.innerHeight - 350),
  }

  return (
    <div
      className="fixed z-50 w-72 bg-gray-900 border border-gray-600 rounded-lg shadow-2xl shadow-black/80 p-3 pointer-events-none animate-in fade-in zoom-in-95 duration-150"
      style={style}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-2xl">{skill.icon}</span>
        <div>
          <p className="font-bold text-sm text-gray-100">{skill.name}</p>
          <p className="text-xs text-amber-400">{SkillTypeNames[skill.type]}</p>
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-2">{skill.description}</p>

      {/* 解锁条件 */}
      {!isUnlocked && (
        <div className="mb-2 p-2 bg-gray-950 rounded border border-gray-700">
          <p className="text-xs text-gray-400 mb-1">解锁条件：</p>
          <p className="text-xs text-gray-300">
            {canUnlock
              ? `✅ 等级达到 ${skill.requiredLevel} 级`
              : `❌ 需要等级 ${skill.requiredLevel} 级（当前 ${playerLevel} 级）`}
          </p>
          {skill.prerequisites.length > 0 && (
            <p className="text-xs text-gray-400 mt-1">
              前置：{skill.prerequisites.join('、')}
            </p>
          )}
        </div>
      )}

      {/* 技能属性 */}
      <div className="space-y-1 mb-2">
        <p className="text-xs text-gray-300">
          💧 法力消耗：<span className="text-blue-300">{skill.cost.mana}</span>
        </p>
        <p className="text-xs text-gray-300">
          ⏱️ 冷却时间：<span className="text-yellow-300">{skill.cooldown / 1000}秒</span>
        </p>
        <p className="text-xs text-gray-300">
          📊 技能等级：<span className="text-amber-300">{level} / {skill.maxLevel}</span>
        </p>
      </div>

      {/* 效果 */}
      <div className="border-t border-gray-700 pt-2">
        <p className="text-xs text-gray-400 mb-1">效果：</p>
        {skill.effects.map((e, i) => (
          <p key={i} className="text-xs text-gray-300">
            {e.type === 'damage' && `⚔️ 伤害: ${(e.value * 100).toFixed(0)}%`}
            {e.type === 'heal' && `❤️ 治疗: ${e.value}`}
            {e.type === 'buff' && `✨ Buff: +${e.value}%`}
            {e.type === 'debuff' && `💀 减益: ${e.value}%`}
            {e.type === 'shield' && `🛡️ 护盾: ${e.value}`}
            {e.element && ` (${e.element})`}
          </p>
        ))}
      </div>

      {/* 协同技能 */}
      {skill.synergies && skill.synergies.length > 0 && (
        <div className="border-t border-gray-700 pt-2 mt-2">
          <p className="text-xs text-amber-400 mb-1">⚡ 协同加成：</p>
          <div className="space-y-1">
            {skill.synergies.map((syn, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span>{syn.icon}</span>
                <span className="text-gray-300">{syn.name}</span>
                <span className="text-green-400 ml-auto">+{(syn.bonus * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/** 技能树层 */
function SkillTierRow({
  tier,
  skills,
  unlockedSkills,
  skillLevels,
  playerLevel,
  selectedSkill,
  onSelect,
  onHover,
  onLeaveHover,
  tooltipPos,
}: {
  tier: number
  skills: Skill[]
  unlockedSkills: string[]
  skillLevels: Record<string, number>
  playerLevel: number
  selectedSkill: Skill | null
  onSelect: (skill: Skill) => void
  onHover: (skill: Skill, e: React.MouseEvent) => void
  onLeaveHover: () => void
  tooltipPos: { x: number; y: number }
}) {
  const isUnlocked = (s: Skill) => unlockedSkills.includes(s.id)
  const canUnlock = (s: Skill) =>
    !unlockedSkills.includes(s.id) && playerLevel >= s.requiredLevel

  return (
    <div className="flex items-center gap-4 py-3">
      {/* 层标签 */}
      <div className="w-16 flex-shrink-0">
        <div className="text-center">
          <p className="text-xs font-bold text-amber-500">第{tier}层</p>
          <p className="text-[10px] text-gray-500">需Lv.{skills[0]?.requiredLevel}</p>
        </div>
      </div>

      {/* 连接线 */}
      <div className="flex-shrink-0 w-4 h-0.5 bg-gray-700" />

      {/* 技能图标组 */}
      <div className="flex gap-2 flex-wrap">
        {skills.map(skill => (
          <SkillIcon
            key={skill.id}
            skill={skill}
            level={skillLevels[skill.id] ?? 0}
            isUnlocked={isUnlocked(skill)}
            canUnlock={canUnlock(skill)}
            isSelected={selectedSkill?.id === skill.id}
            onClick={() => onSelect(skill)}
            onHover={(e) => onHover(skill, e)}
            onLeave={onLeaveHover}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * 技能面板主组件
 */
export function SkillsPanel() {
  const { player } = useGameStore()
  const { unlockedSkills, skillLevels, unlockSkill, upgradeSkill } = useSkillStore()
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)
  const [hoveredSkill, setHoveredSkill] = useState<{ skill: Skill; pos: { x: number; y: number } } | null>(null)

  const classSkills = getSkillsByClass(player.classId)
  const tiers = groupByTier(classSkills)
  const tierNumbers = Object.keys(tiers).map(Number).sort((a, b) => a - b)

  const selectedIsUnlocked = selectedSkill ? unlockedSkills.includes(selectedSkill.id) : false
  const selectedLevel = selectedSkill ? skillLevels[selectedSkill.id] ?? 0 : 0

  const handleSelect = (skill: Skill) => {
    setSelectedSkill(skill)
    playSound('click')
  }

  const handleUnlock = () => {
    if (!selectedSkill) return
    if (unlockedSkills.includes(selectedSkill.id)) {
      // 升级
      if (upgradeSkill(selectedSkill.id)) {
        playSound('levelup')
      }
    } else {
      // 解锁
      if (unlockSkill(selectedSkill.id, player.level, unlockedSkills)) {
        playSound('levelup')
      }
    }
  }

  return (
    <div className="panel-game p-4">
      {/* 标题 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-amber-400">⚡ 技能</h2>
        <span className="text-xs text-amber-400">已解锁 {unlockedSkills.length} / {classSkills.length}</span>
      </div>

      {/* 技能树 */}
      <div className="space-y-1">
        {tierNumbers.map(tierNum => (
          <SkillTierRow
            key={tierNum}
            tier={tierNum}
            skills={tiers[tierNum]}
            unlockedSkills={unlockedSkills}
            skillLevels={skillLevels}
            playerLevel={player.level}
            selectedSkill={selectedSkill}
            onSelect={handleSelect}
            onHover={(skill, e) => setHoveredSkill({ skill, pos: { x: e.clientX, y: e.clientY } })}
            onLeaveHover={() => setHoveredSkill(null)}
            tooltipPos={hoveredSkill?.pos ?? { x: 0, y: 0 }}
          />
        ))}
      </div>

      {/* 选中技能详情 */}
      {selectedSkill && (
        <div className="mt-4 p-3 bg-gray-950/50 rounded border border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-lg border-2 border-amber-500 bg-gray-800 flex items-center justify-center">
              <span className="text-3xl">{selectedSkill.icon}</span>
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm text-gray-100">{selectedSkill.name}</p>
              <p className="text-xs text-amber-400">{SkillTypeNames[selectedSkill.type]}</p>
              {selectedIsUnlocked ? (
                <p className="text-xs text-gray-400">等级 {selectedLevel} / {selectedSkill.maxLevel}</p>
              ) : (
                <p className="text-xs text-red-400">未解锁 · 需要 {selectedSkill.requiredLevel} 级</p>
              )}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2 mt-3">
            {selectedIsUnlocked ? (
              <>
                <button
                  onClick={handleUnlock}
                  disabled={selectedLevel >= selectedSkill.maxLevel}
                  className={`
                    flex-1 py-2 rounded font-bold text-sm cursor-pointer
                    transition-all duration-150
                    ${selectedLevel >= selectedSkill.maxLevel
                      ? 'bg-gray-800 border border-gray-700 text-gray-600 cursor-not-allowed'
                      : 'bg-gradient-to-b from-blue-800 to-blue-950 border border-blue-600 text-blue-200 hover:from-blue-700 hover:to-blue-900'
                    }
                  `}
                >
                  升级 ({selectedLevel}/{selectedSkill.maxLevel})
                </button>
              </>
            ) : (
              <button
                onClick={handleUnlock}
                disabled={player.level < selectedSkill.requiredLevel}
                className={`
                  flex-1 py-2 rounded font-bold text-sm cursor-pointer
                  transition-all duration-150
                  ${player.level < selectedSkill.requiredLevel
                    ? 'bg-gray-800 border border-gray-700 text-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-b from-green-800 to-green-950 border border-green-600 text-green-200 hover:from-green-700 hover:to-green-900'
                  }
                `}
              >
                解锁
              </button>
            )}
            <button
              onClick={() => setSelectedSkill(null)}
              className="px-4 py-2 rounded font-bold text-sm bg-gray-800 border border-gray-600 text-gray-400 hover:border-gray-500 cursor-pointer transition-all duration-150"
            >
              关闭
            </button>
          </div>

          {/* 协同技能信息 */}
          {selectedSkill.synergies && selectedSkill.synergies.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-700">
              <p className="text-xs text-amber-400 mb-2">⚡ 协同加成：</p>
              <div className="grid grid-cols-2 gap-1">
                {selectedSkill.synergies.map((syn, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs bg-gray-900/50 p-1.5 rounded">
                    <span>{syn.icon}</span>
                    <span className="text-gray-300 truncate">{syn.name}</span>
                    <span className="text-green-400 ml-auto">+{(syn.bonus * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 提示 */}
      {unlockedSkills.length === 0 && (
        <p className="text-xs text-gray-500 mt-3 text-center">
          点击高亮技能可解锁，升级后属性增强
        </p>
      )}

      {/* 详情浮层 */}
      {hoveredSkill && (
        <SkillTooltip
          skill={hoveredSkill.skill}
          level={skillLevels[hoveredSkill.skill.id] ?? 0}
          isUnlocked={unlockedSkills.includes(hoveredSkill.skill.id)}
          canUnlock={player.level >= hoveredSkill.skill.requiredLevel && !unlockedSkills.includes(hoveredSkill.skill.id)}
          playerLevel={player.level}
          position={hoveredSkill.pos}
        />
      )}
    </div>
  )
}
