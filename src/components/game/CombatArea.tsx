/**
 * @fileoverview 战斗区域组件
 * @description 游戏主界面的战斗展示区域
 */

'use client'

import { useEffect, useState, useCallback } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { useCombatStore } from '@/stores/combatStore'
import { useSkillStore } from '@/stores/skillStore'
import { useZoneStore } from '@/stores/zoneStore'
import { useInventoryStore } from '@/stores/inventoryStore'
import { usePlayerStore } from '@/stores/playerStore'
import { useCodexStore } from '@/stores/codexStore'
import { calculateDamage, calculateMonsterDamage, calculateAttackInterval } from '@/lib/game/combat'
import { CombatState, Element } from '@/types/combat'
import { DamageNumber } from './DamageNumber'
import { MonsterCard } from './MonsterCard'
import { CombatButtons } from './CombatButtons'
import { PlayerStatusDisplay } from './PlayerStatusDisplay'
import { SkillHotbar } from './SkillHotbar'
import { cn } from '@/lib/utils'

/**
 * 战斗区域组件
 */
const CombatArea = () => {
  const { computedStats, updateCombatStats, addGold, addExperience, addToInventory, useItem } = useGameStore()
  const { combatState, currentEnemy, startCombat, damageEnemy, resetCombat, attemptFlee, getLoot } = useCombatStore()
  const { unlockedSkills, skillLevels, getSkillCooldownRemaining, useSkill } = useSkillStore()
  const inventoryStore = useInventoryStore()
  const { discoverMonster, discoverEquipment } = useCodexStore()

  const [damageNumbers, setDamageNumbers] = useState<{ id: number; damage: number; isCrit: boolean; pos: { x: number; y: number } }[]>([])
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null)
  const [, setCooldownTick] = useState(0)
  const [lastRewards, setLastRewards] = useState<{ exp: number; gold: number; items: number } | null>(null)
  const [defeatCountdown, setDefeatCountdown] = useState(3)
  const [isMonsterDying, setIsMonsterDying] = useState(false)
  const [elementalReaction, setElementalReaction] = useState<string | null>(null)

  // 获取当前可用的第一个技能
  const currentSkill = selectedSkillId && unlockedSkills.includes(selectedSkillId)
    ? unlockedSkills.find(skillId => skillId === selectedSkillId)
    : unlockedSkills.length > 0
      ? unlockedSkills[0]
      : null

  const cooldownRemaining = currentSkill ? getSkillCooldownRemaining(currentSkill) : 0
  const cooldownTotal = 1000 // 默认值
  const cooldownPercent = cooldownTotal > 0 ? ((cooldownTotal - cooldownRemaining) / cooldownTotal) * 100 : 100

  // 药水数量
  const potionItems = inventoryStore.inventory.slots.filter(
    slot => slot && slot.type === 'potion' && slot.name.includes('生命')
  )
  const potionCount = potionItems.reduce((sum, item) => sum + (item?.quantity ?? 0), 0)

  // 冷却刷新定时器
  useEffect(() => {
    if (combatState !== CombatState.FIGHTING) return
    const interval = setInterval(() => {
      setCooldownTick(t => t + 1)
    }, 100)
    return () => clearInterval(interval)
  }, [combatState])

  // 生命/法力恢复 + 低血量自动喝药水
  useEffect(() => {
    if (combatState !== CombatState.FIGHTING) return

    let autoPotionCooldown = false

    const regenInterval = setInterval(() => {
      const playerState = usePlayerStore.getState()
      const stats = playerState.computedStats
      const regenTick = 0.1

      let newHealth = stats.health
      let newMana = stats.mana

      newHealth = Math.min(stats.maxHealth, newHealth + stats.healthRegen * regenTick)
      newMana = Math.min(stats.maxMana, newMana + stats.manaRegen * regenTick)

      if (newHealth / stats.maxHealth < 0.3 && potionCount > 0 && !autoPotionCooldown) {
        const potionItem = potionItems[0]
        if (potionItem) {
          useItem(potionItem.id)
          autoPotionCooldown = true
          setTimeout(() => { autoPotionCooldown = false }, 2000)
        }
      }

      if (newHealth !== stats.health || newMana !== stats.mana) {
        playerState.updateCombatStats(newHealth, newMana)
      }
    }, 100)

    return () => clearInterval(regenInterval)
  }, [combatState, potionCount])

  // 战斗循环
  useEffect(() => {
    if (combatState !== CombatState.FIGHTING || !currentEnemy) return

    const interval = calculateAttackInterval(computedStats.attackSpeed)
    const timer = setInterval(() => {
      const combat = useCombatStore.getState()
      const player = usePlayerStore.getState()
      if (combat.combatState !== CombatState.FIGHTING) return
      if (!combat.currentEnemy) return
      if (player.computedStats.health <= 0) return

      const enemy = combat.currentEnemy
      const currentMana = player.computedStats.mana
      const skills = useSkillStore.getState()

      let skillUsed = false

      for (const skillId of skills.unlockedSkills) {
        const skill = skills.unlockedSkills.includes(skillId)
        if (!skill) continue

        const skillLevel = skills.skillLevels[skillId] ?? 1
        const cooldownRemaining = skills.getSkillCooldownRemaining(skillId)
        const manaCost = 10 * (1 + (skillLevel - 1) * 0.1)

        if (cooldownRemaining === 0 && currentMana >= manaCost) {
          const result = calculateDamage(player.computedStats, enemy.monster.stats)
          const newMana = currentMana - manaCost
          player.updateCombatStats(undefined, newMana)
          damageEnemy(result.finalDamage, result.isCrit, result.element)

          if (result.element !== Element.PHYSICAL) {
            setElementalReaction(result.element)
            setTimeout(() => setElementalReaction(null), 1500)
          }

          setDamageNumbers(prev => [
            ...prev,
            {
              id: Date.now(),
              damage: result.finalDamage,
              isCrit: result.isCrit,
              pos: { x: 150 + Math.random() * 100, y: 50 + Math.random() * 50 },
            },
          ])

          skills.useSkill(skillId)
          skillUsed = true
          break
        }
      }

      if (!skillUsed) {
        const result = calculateDamage(player.computedStats, enemy.monster.stats)
        damageEnemy(result.finalDamage, result.isCrit, result.element)

        setDamageNumbers(prev => [
          ...prev,
          {
            id: Date.now(),
            damage: result.finalDamage,
            isCrit: result.isCrit,
            pos: { x: 150 + Math.random() * 100, y: 50 + Math.random() * 50 },
          },
        ])
      }

      const healthAfterHit = usePlayerStore.getState().computedStats.health
      if (healthAfterHit > 0) {
        const enemyDamage = calculateMonsterDamage(enemy.monster.stats, usePlayerStore.getState().computedStats)
        updateCombatStats(healthAfterHit - enemyDamage.finalDamage, undefined)
      }
    }, interval)

    return () => clearInterval(timer)
  }, [combatState, currentEnemy, computedStats])

  // 技能热键栏点击
  const handleSkillHotbarClick = useCallback((skillId: string) => {
    if (!currentEnemy) return
    const cooldownRemaining = getSkillCooldownRemaining(skillId)
    if (cooldownRemaining > 0) return
    if (computedStats.mana < 10) return

    const result = calculateDamage(computedStats, currentEnemy.monster.stats)
    usePlayerStore.getState().updateCombatStats(undefined, computedStats.mana - 10)
    damageEnemy(result.finalDamage, result.isCrit, result.element)

    setDamageNumbers(prev => [
      ...prev,
      {
        id: Date.now(),
        damage: result.finalDamage,
        isCrit: result.isCrit,
        pos: { x: 150 + Math.random() * 100, y: 50 + Math.random() * 50 },
      },
    ])

    useSkill(skillId)
  }, [currentEnemy, computedStats, getSkillCooldownRemaining, useSkill, damageEnemy])

  const canUseSkillCheck = useCallback((skillId: string) => {
    const cooldownRemaining = getSkillCooldownRemaining(skillId)
    return cooldownRemaining === 0 && computedStats.mana >= 10
  }, [computedStats.mana, getSkillCooldownRemaining])

  const removeDamageNumber = useCallback((id: number) => {
    setDamageNumbers(prev => prev.filter(d => d.id !== id))
  }, [])

  const handleStartCombat = useCallback((isBoss: boolean = false) => {
    const zoneId = useZoneStore.getState().currentZoneId
    startCombat(zoneId, isBoss)
  }, [startCombat])

  const handleAttack = useCallback(() => {
    if (!currentEnemy) return
    const result = calculateDamage(computedStats, currentEnemy.monster.stats)
    damageEnemy(result.finalDamage, result.isCrit, result.element)
  }, [currentEnemy, computedStats, damageEnemy])

  const handleSkill = useCallback(() => {
    if (!currentEnemy || !currentSkill) return
    if (cooldownRemaining > 0) return
    if (computedStats.mana < 10) return

    const result = calculateDamage(computedStats, currentEnemy.monster.stats)
    usePlayerStore.getState().updateCombatStats(undefined, computedStats.mana - 10)
    damageEnemy(result.finalDamage, result.isCrit, result.element)
    useSkill(currentSkill)
  }, [currentEnemy, currentSkill, cooldownRemaining, computedStats, useSkill, damageEnemy])

  const handleUsePotion = useCallback(() => {
    const potionItem = potionItems[0]
    if (!potionItem) return
    useItem(potionItem.id)
  }, [potionItems, useItem])

  const handleFlee = useCallback(() => {
    if (attemptFlee()) {
      setTimeout(resetCombat, 500)
    }
  }, [attemptFlee, resetCombat])

  // 战斗胜利处理
  useEffect(() => {
    if (combatState === CombatState.VICTORY && currentEnemy) {
      setIsMonsterDying(true)
      const expReward = currentEnemy.monster.stats.expReward
      const goldReward = Math.floor(
        Math.random() * (currentEnemy.monster.stats.goldReward.max - currentEnemy.monster.stats.goldReward.min)
      ) + currentEnemy.monster.stats.goldReward.min

      addExperience(expReward)
      addGold(goldReward)

      const loot = getLoot()
      loot.forEach(item => addToInventory(item))
      discoverMonster(currentEnemy.monster.templateId ?? currentEnemy.monster.id)
      loot.forEach(item => discoverEquipment(item.templateId ?? item.id))

      setLastRewards({ exp: expReward, gold: goldReward, items: loot.length })

      setTimeout(() => {
        resetCombat()
        setLastRewards(null)
        setIsMonsterDying(false)
      }, 3000)
    }
  }, [combatState, currentEnemy])

  // 战斗失败处理
  useEffect(() => {
    if (combatState === CombatState.DEFEAT) {
      setDefeatCountdown(3)
      const tick = setInterval(() => {
        setDefeatCountdown(prev => {
          if (prev <= 1) {
            clearInterval(tick)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      setTimeout(() => {
        clearInterval(tick)
        updateCombatStats(computedStats.maxHealth, computedStats.maxMana)
        resetCombat()
        setIsMonsterDying(false)
      }, 3000)
    }
  }, [combatState])

  const combatLog = useCombatStore(state => state.combatLog)
  const comboCount = useCombatStore(state => state.comboCount)

  return (
    <div className="panel-game p-4">
      <h2 className="text-lg font-bold text-gray-200 mb-4">⚔️ 战斗区域</h2>

      {combatState === CombatState.IDLE ? (
        <div className="text-center py-8">
          <p className="text-gray-400 mb-4">选择一个区域开始冒险</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => handleStartCombat(false)}
              className="px-6 py-3 rounded-lg font-bold cursor-pointer bg-gradient-to-b from-red-800 to-red-950 border-2 border-red-600 text-white hover:from-red-700 hover:to-red-900 transition-all duration-200"
            >
              👹 挑战普通怪物
            </button>
            <button
              onClick={() => handleStartCombat(true)}
              className="px-6 py-3 rounded-lg font-bold cursor-pointer bg-gradient-to-b from-purple-800 to-purple-950 border-2 border-purple-600 text-purple-200 hover:from-purple-700 hover:to-purple-900 transition-all duration-200"
            >
              👑 挑战BOSS
            </button>
          </div>
        </div>
      ) : combatState === CombatState.VICTORY ? (
        <div className="text-center py-8 animate-victory">
          <p className="text-3xl mb-2">🎉</p>
          <p className="text-2xl font-bold text-amber-400 mb-2 animate-victory">胜利!</p>
          {lastRewards && (
            <div className="space-y-1 text-gray-300 animate-reward-glow inline-block px-4 py-2 rounded-lg">
              <p>+{lastRewards.exp} 经验</p>
              <p>+{lastRewards.gold} 金币</p>
              {lastRewards.items > 0 && (
                <p className="text-green-400 animate-loot-drop">📦 获得 {lastRewards.items} 件战利品（已放入背包）</p>
              )}
            </div>
          )}
        </div>
      ) : combatState === CombatState.DEFEAT ? (
        <div className="text-center py-8 animate-defeat">
          <p className="text-4xl mb-2">💀</p>
          <p className="text-2xl font-bold text-red-400 mb-2">体力耗尽...</p>
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <span className="text-sm">恢复中</span>
            <span className="text-xl font-bold text-amber-400">{defeatCountdown}</span>
            <span className="text-sm">秒</span>
          </div>
          <div className="mt-4 w-48 mx-auto h-1 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-700 to-red-500 transition-all duration-1000 rounded-full"
              style={{ width: `${((3 - defeatCountdown) / 3) * 100}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="relative">
          <PlayerStatusDisplay
            health={computedStats.health}
            maxHealth={computedStats.maxHealth}
            mana={computedStats.mana}
            maxMana={computedStats.maxMana}
            healthRegen={computedStats.healthRegen}
            manaRegen={computedStats.manaRegen}
          />

          {damageNumbers.map(dmg => (
            <DamageNumber
              key={dmg.id}
              damage={dmg.damage}
              isCrit={dmg.isCrit}
              position={dmg.pos}
              onComplete={() => removeDamageNumber(dmg.id)}
            />
          ))}

          {currentEnemy && (
            <MonsterCard
              monster={currentEnemy.monster}
              health={currentEnemy.currentHealth}
              maxHealth={currentEnemy.maxHealth}
              isDying={isMonsterDying}
            />
          )}

          {comboCount > 1 && (
            <div className="absolute top-2 right-2 px-3 py-1 bg-amber-600/80 rounded-full animate-bounce">
              <span className="text-amber-100 font-bold">🔥 {comboCount} 连击!</span>
            </div>
          )}

          {elementalReaction && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-elemental-reaction">
              <div className={cn(
                'px-4 py-2 rounded-lg font-bold text-white',
                elementalReaction === 'vaporize' && 'bg-cyan-500/80',
                elementalReaction === 'freeze' && 'bg-blue-500/80',
                elementalReaction === 'shock' && 'bg-yellow-500/80',
                elementalReaction === 'burn' && 'bg-orange-500/80',
                elementalReaction === 'melt' && 'bg-red-500/80',
                elementalReaction === 'supercharge' && 'bg-purple-500/80',
                !['vaporize', 'freeze', 'shock', 'burn', 'melt', 'supercharge'].includes(elementalReaction) && 'bg-gray-500/80'
              )}>
                {elementalReaction === 'vaporize' && '💥 蒸发!'}
                {elementalReaction === 'freeze' && '❄️ 冻结!'}
                {elementalReaction === 'shock' && '⚡ 感电!'}
                {elementalReaction === 'burn' && '🔥 燃烧!'}
                {elementalReaction === 'melt' && '🩷 融化!'}
                {elementalReaction === 'supercharge' && '💫 过载!'}
              </div>
            </div>
          )}

          {unlockedSkills.length > 0 && (
            <SkillHotbar
              unlockedSkills={unlockedSkills}
              skillLevels={skillLevels}
              getSkillCooldownRemaining={getSkillCooldownRemaining}
              onSkillClick={handleSkillHotbarClick}
              canUseSkill={canUseSkillCheck}
              combatState={combatState}
              computedStats={computedStats}
            />
          )}

          <div className="mt-4">
            <CombatButtons
              combatState={combatState}
              onAttack={handleAttack}
              onSkill={handleSkill}
              onUsePotion={handleUsePotion}
              onFlee={handleFlee}
              canUseSkill={!!currentSkill && cooldownRemaining === 0 && computedStats.mana >= 10}
              potionCount={potionCount}
              skillCooldownPercent={cooldownPercent}
              skillName="✨"
            />
          </div>
        </div>
      )}

      {combatLog.length > 0 && (
        <div className="mt-4 p-2 bg-black/50 rounded text-xs font-mono max-h-32 overflow-y-auto">
          {combatLog.slice(-10).reverse().map((log, i) => (
            <div key={i} className="text-gray-400 py-0.5">
              {log.type === 'attack' && `⚔️ 攻击 ${log.data.targetName}`}
              {log.type === 'damaged' && log.data.damage && `💥 受到 ${log.data.damage.finalDamage} ${log.data.damage.isCrit ? '(暴击!)' : ''} 伤害`}
              {log.type === 'kill' && `🏆 击杀 ${log.data.targetName}`}
              {log.type === 'loot' && `📦 获得物品`}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export { CombatArea }
