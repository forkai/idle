/**
 * @fileoverview 战斗区域组件
 * @description 游戏主界面的战斗展示区域
 */

'use client'

import { useEffect, useState, useCallback } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { useCombatStore } from '@/stores/combatStore'
import { useZoneStore } from '@/stores/zoneStore'
import { useInventoryStore } from '@/stores/inventoryStore'
import { usePlayerStore } from '@/stores/playerStore'
import { useCodexStore } from '@/stores/codexStore'
import { calculateDamage, calculateMonsterDamage, calculateAttackInterval } from '@/lib/game/combat'
import { getZoneBoss } from '@/constants/enemies'
import type { Monster } from '@/types/enemy'
import { MonsterType } from '@/types/enemy'
import { CombatState } from '@/types/combat'

/**
 * 伤害数字动画组件
 */
interface DamageNumberProps {
  damage: number
  isCrit: boolean
  position: { x: number; y: number }
  onComplete: () => void
}

function DamageNumber({ damage, isCrit, position, onComplete }: DamageNumberProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1000)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div
      className={`
        absolute font-bold pointer-events-none animate-bounce
        ${isCrit ? 'text-2xl text-amber-400' : 'text-lg text-white'}
      `}
      style={{
        left: position.x,
        top: position.y,
        animation: 'float-up 1s ease-out forwards',
      }}
    >
      -{damage}
    </div>
  )
}

/**
 * 怪物卡片组件
 */
function MonsterCard({ monster, health, maxHealth, isDying }: { monster: Monster; health: number; maxHealth: number; isDying?: boolean }) {
  const healthPercent = (health / maxHealth) * 100
  const isBoss = monster.type === MonsterType.BOSS
  const isLowHealth = healthPercent < 30

  return (
    <div className={`
      relative p-4 rounded-lg border-2 text-center
      ${isBoss
        ? 'bg-gradient-to-b from-purple-950 to-gray-900 border-purple-500 animate-boss-appear'
        : 'bg-gray-900 border-gray-700'
      }
      ${isDying ? 'animate-monster-death' : ''}
      ${isLowHealth && !isDying ? 'animate-health-critical' : ''}
    `}>
      {/* Boss标识 */}
      {isBoss && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-purple-800 text-xs font-bold text-purple-200 rounded-full">
          BOSS
        </div>
      )}

      {/* 怪物图标 */}
      <div className={`text-6xl mb-2 ${isDying ? 'animate-monster-death' : ''}`}>
        {monster.icon}
      </div>

      {/* 怪物名称 */}
      <h3 className={`font-bold ${isBoss ? 'text-purple-300' : 'text-gray-200'}`}>
        {monster.name}
      </h3>
      <p className="text-xs text-gray-500">Lv.{monster.level}</p>

      {/* 血条 */}
      <div className="mt-3">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>❤️ {health.toLocaleString()}</span>
          <span>{maxHealth.toLocaleString()}</span>
        </div>
        <div className={`h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700 ${isLowHealth ? 'animate-health-critical' : ''}`}>
          <div
            className="h-full bg-gradient-to-r from-red-700 to-red-900 transition-all duration-300"
            style={{ width: `${healthPercent}%` }}
          />
        </div>
      </div>
    </div>
  )
}

/**
 * 战斗操作按钮组件
 */
function CombatButtons({
  combatState,
  onAttack,
  onSkill,
  onUsePotion,
  onFlee,
  canUseSkill,
  potionCount,
}: {
  combatState: CombatState
  onAttack: () => void
  onSkill: () => void
  onUsePotion: () => void
  onFlee: () => void
  canUseSkill: boolean
  potionCount: number
}) {
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

      {/* 技能按钮 */}
      <button
        onClick={onSkill}
        disabled={!isFighting || !canUseSkill}
        className="
          px-6 py-3 rounded-lg font-bold cursor-pointer
          bg-gradient-to-b from-blue-800 to-blue-950
          border-2 border-blue-600
          text-white
          hover:from-blue-700 hover:to-blue-900
          disabled:from-gray-700 disabled:to-gray-800 disabled:border-gray-600 disabled:cursor-not-allowed
          transition-all duration-200
        "
      >
        ✨ 技能
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

/**
 * 战斗区域组件
 */
export function CombatArea() {
  const { computedStats, updateCombatStats, addGold, addExperience, addToInventory, player, useItem } = useGameStore()
  const { combatState, currentEnemy, startCombat, damageEnemy, resetCombat, attemptFlee, getLoot, combatLog } = useCombatStore()
  const inventoryStore = useInventoryStore()
  const { discoverMonster, discoverEquipment } = useCodexStore()

  const [damageNumbers, setDamageNumbers] = useState<{ id: number; damage: number; isCrit: boolean; pos: { x: number; y: number } }[]>([])
  const [lastSkillTime, setLastSkillTime] = useState(0)
  const [lastRewards, setLastRewards] = useState<{ exp: number; gold: number; items: number } | null>(null)
  const [defeatCountdown, setDefeatCountdown] = useState(3)
  const [isMonsterDying, setIsMonsterDying] = useState(false)

  // 战斗循环（玩家自动攻击）
  useEffect(() => {
    if (combatState !== CombatState.FIGHTING || !currentEnemy) return

    const interval = calculateAttackInterval(computedStats.attackSpeed)
    const timer = setInterval(() => {
      // 每次tick都从store读取最新状态，避免闭包陈旧问题
      const combat = useCombatStore.getState()
      const player = usePlayerStore.getState()
      if (combat.combatState !== CombatState.FIGHTING) return
      if (!combat.currentEnemy) return
      if (player.computedStats.health <= 0) return // 玩家已死亡

      const enemy = combat.currentEnemy

      // 玩家攻击
      const result = calculateDamage(player.computedStats, enemy.monster.stats)
      damageEnemy(result.finalDamage, result.isCrit, result.element)

      // 添加伤害数字
      setDamageNumbers(prev => [
        ...prev,
        {
          id: Date.now(),
          damage: result.finalDamage,
          isCrit: result.isCrit,
          pos: { x: 150 + Math.random() * 100, y: 50 + Math.random() * 50 },
        },
      ])

      // 敌人反击（仅在玩家还活着时）
      const healthAfterHit = usePlayerStore.getState().computedStats.health
      if (healthAfterHit > 0) {
        const enemyDamage = calculateMonsterDamage(enemy.monster.stats, usePlayerStore.getState().computedStats)
        updateCombatStats(healthAfterHit - enemyDamage.finalDamage, undefined)
      }
    }, interval)

    return () => clearInterval(timer)
  }, [combatState, currentEnemy, computedStats])

  // 清理伤害数字
  const removeDamageNumber = useCallback((id: number) => {
    setDamageNumbers(prev => prev.filter(d => d.id !== id))
  }, [])

  // 开始战斗
  const handleStartCombat = (isBoss: boolean = false) => {
    const zoneId = useZoneStore.getState().currentZoneId
    startCombat(zoneId, isBoss)
  }

  // 攻击
  const handleAttack = () => {
    if (!currentEnemy) return
    const result = calculateDamage(computedStats, currentEnemy.monster.stats)
    damageEnemy(result.finalDamage, result.isCrit, result.element)
  }

  // 使用技能（简化版：造成1.5倍伤害）
  const handleSkill = () => {
    if (!currentEnemy || Date.now() - lastSkillTime < 3000) return

    const result = calculateDamage(computedStats, currentEnemy.monster.stats)
    damageEnemy(Math.floor(result.finalDamage * 1.5), true, result.element)
    setLastSkillTime(Date.now())
  }

  // 统计背包中生命药水的数量
  const potionItems = inventoryStore.inventory.slots.filter(
    slot => slot && slot.type === 'potion' && slot.name.includes('生命')
  )
  const potionCount = potionItems.reduce((sum, item) => sum + (item?.quantity ?? 0), 0)

  // 使用药水（从背包消耗）
  const handleUsePotion = () => {
    // 找到第一个生命药水使用
    const potionItem = potionItems[0]
    if (!potionItem) return

    // 使用背包中的药水（会自动加血）
    useItem(potionItem.id)
  }

  // 逃跑
  const handleFlee = () => {
    if (attemptFlee()) {
      setTimeout(resetCombat, 500)
    }
  }

  // 战斗胜利处理
  useEffect(() => {
    if (combatState === CombatState.VICTORY && currentEnemy) {
      setIsMonsterDying(true)
      // 计算并发放奖励
      const expReward = currentEnemy.monster.stats.expReward
      const goldReward = Math.floor(
        Math.random() * (currentEnemy.monster.stats.goldReward.max - currentEnemy.monster.stats.goldReward.min)
      ) + currentEnemy.monster.stats.goldReward.min

      addExperience(expReward)
      addGold(goldReward)

      // 获取掉落
      const loot = getLoot()
      loot.forEach(item => addToInventory(item))

      // 记录怪物已遭遇
      discoverMonster(currentEnemy.monster.templateId ?? currentEnemy.monster.id)
      // 记录掉落装备已发现
      loot.forEach(item => discoverEquipment(item.templateId ?? item.id))

      // 保存奖励用于显示（避免victory界面重新随机计算）
      setLastRewards({ exp: expReward, gold: goldReward, items: loot.length })

      // 3秒后重置战斗
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
      // 启动3秒恢复倒计时
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

  return (
    <div className="panel-game p-4">
      <h2 className="text-lg font-bold text-gray-200 mb-4">⚔️ 战斗区域</h2>

      {/* 战斗状态 */}
      {combatState === CombatState.IDLE ? (
        /* 空闲状态 - 选择战斗类型 */
        <div className="text-center py-8">
          <p className="text-gray-400 mb-4">选择一个区域开始冒险</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => handleStartCombat(false)}
              className="
                px-6 py-3 rounded-lg font-bold cursor-pointer
                bg-gradient-to-b from-red-800 to-red-950
                border-2 border-red-600 text-white
                hover:from-red-700 hover:to-red-900
                transition-all duration-200
              "
            >
              👹 挑战普通怪物
            </button>
            <button
              onClick={() => handleStartCombat(true)}
              className="
                px-6 py-3 rounded-lg font-bold cursor-pointer
                bg-gradient-to-b from-purple-800 to-purple-950
                border-2 border-purple-600 text-purple-200
                hover:from-purple-700 hover:to-purple-900
                transition-all duration-200
              "
            >
              👑 挑战BOSS
            </button>
          </div>
        </div>
      ) : combatState === CombatState.VICTORY ? (
        /* 胜利状态 */
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
        /* 失败状态 - 带倒计时动画 */
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
              className="h-full bg-gradient-to-r from-red-700 to-red-500 transition-all duration-1000"
              style={{ width: `${((3 - defeatCountdown) / 3) * 100}%` }}
            />
          </div>
        </div>
      ) : (
        /* 战斗中 */
        <div className="relative">
          {/* 伤害数字 */}
          {damageNumbers.map(dmg => (
            <DamageNumber
              key={dmg.id}
              damage={dmg.damage}
              isCrit={dmg.isCrit}
              position={dmg.pos}
              onComplete={() => removeDamageNumber(dmg.id)}
            />
          ))}

          {/* 怪物卡片 */}
          {currentEnemy && (
            <MonsterCard
              monster={currentEnemy.monster}
              health={currentEnemy.currentHealth}
              maxHealth={currentEnemy.maxHealth}
              isDying={isMonsterDying}
            />
          )}

          {/* 操作按钮 */}
          <div className="mt-6">
            <CombatButtons
              combatState={combatState}
              onAttack={handleAttack}
              onSkill={handleSkill}
              onUsePotion={handleUsePotion}
              onFlee={handleFlee}
              canUseSkill={Date.now() - lastSkillTime >= 3000}
              potionCount={potionCount}
            />
          </div>
        </div>
      )}

      {/* 战斗日志 */}
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
