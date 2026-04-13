/**
 * @fileoverview 战斗状态管理Store
 * @description 管理战斗相关的状态，包括当前敌人、战斗循环、战斗日志等
 */

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { Monster } from '@/types/enemy'
import { MonsterType } from '@/types/enemy'
import { MONSTERS, getRandomMonster, getZoneBoss } from '@/constants/enemies'
import type { CombatEvent } from '@/types/combat'
import { CombatEventType, CombatState as CombatStateEnum, Element } from '@/types/combat'
import type { Item } from '@/types/items'
import { generateRandomItem } from '@/constants/items'
import { v4 as uuidv4 } from 'uuid'
import { makeAIDecision, applyBossAbility, checkElementalReaction } from '@/lib/game/combat-ai'

/**
 * 战斗中怪物状态
 */
export interface CombatMonsterState {
  /** 怪物ID */
  id: string
  /** 怪物数据 */
  monster: Monster
  /** 当前生命值 */
  currentHealth: number
  /** 最大生命值 */
  maxHealth: number
  /** 是否Boss */
  isBoss: boolean
}

/**
 * 战斗状态接口
 */
interface CombatStoreState {
  /** 战斗状态 */
  combatState: CombatStateEnum
  /** 当前怪物 */
  currentEnemy: CombatMonsterState | null
  /** 战斗事件日志 */
  combatLog: CombatEvent[]
  /** 击杀数统计 */
  killCount: number
  /** 连续击杀数 */
  comboCount: number
  /** 当前战斗开始时间 */
  combatStartTime: number | null
  /** 逃跑成功几率 */
  fleeChance: number
}

/**
 * 战斗Store动作接口
 */
interface CombatActions {
  /** 开始战斗 */
  startCombat: (zoneId: string, isBoss: boolean) => void
  /** 结束战斗（胜利） */
  endCombatVictory: () => void
  /** 结束战斗（失败） */
  endCombatDefeat: () => void
  /** 对敌人造成伤害 */
  damageEnemy: (damage: number, isCrit: boolean, element: string) => void
  /** 敌人攻击（返回伤害） */
  enemyAttack: () => number
  /** 添加战斗日志 */
  addCombatLog: (event: CombatEvent) => void
  /** 重置战斗状态 */
  resetCombat: () => void
  /** 尝试逃跑 */
  attemptFlee: () => boolean
  /** 获取掉落物品 */
  getLoot: () => Item[]
  /** 增加击杀数 */
  addKill: () => void
}

/**
 * 初始战斗状态
 */
const initialState: CombatStoreState = {
  combatState: CombatStateEnum.IDLE,
  currentEnemy: null,
  combatLog: [],
  killCount: 0,
  comboCount: 0,
  combatStartTime: null,
  fleeChance: 0.5,
}

/**
 * 战斗状态Store
 */
export const useCombatStore = create<CombatStoreState & CombatActions>()(
  immer((set, get) => ({
    ...initialState,

    /**
     * 开始战斗
     */
    startCombat: (zoneId: string, isBoss: boolean) => {
      const monster = isBoss
        ? getZoneBoss(zoneId)
        : getRandomMonster(zoneId)

      if (!monster) return

      const combatMonster: CombatMonsterState = {
        id: uuidv4(),
        monster,
        currentHealth: monster.stats.health,
        maxHealth: monster.stats.health,
        isBoss: monster.type === MonsterType.BOSS,
      }

      set(state => {
        state.combatState = CombatStateEnum.FIGHTING
        state.currentEnemy = combatMonster
        state.combatStartTime = Date.now()
        state.combatLog = []
        state.combatLog.push({
          type: CombatEventType.ATTACK,
          timestamp: Date.now(),
          data: {
            targetId: combatMonster.id,
            targetName: monster.name,
          },
        })
      })
    },

    /**
     * 结束战斗（胜利）
     */
    endCombatVictory: () => {
      const state = get()
      const enemy = state.currentEnemy

      set(state => {
        state.combatState = CombatStateEnum.VICTORY

        if (enemy) {
          state.combatLog.push({
            type: CombatEventType.KILL,
            timestamp: Date.now(),
            data: {
              targetId: enemy.id,
              targetName: enemy.monster.name,
            },
          })
        }

        state.killCount += 1
        state.comboCount += 1
      })
    },

    /**
     * 结束战斗（失败）
     */
    endCombatDefeat: () => {
      const state = get()

      set(state => {
        state.combatState = CombatStateEnum.DEFEAT
        state.comboCount = 0

        state.combatLog.push({
          type: CombatEventType.DEATH,
          timestamp: Date.now(),
          data: {},
        })
      })
    },

    /**
     * 对敌人造成伤害
     */
    damageEnemy: (damage: number, isCrit: boolean, element: string) => {
      const state = get()
      const enemy = state.currentEnemy

      if (!enemy || state.combatState !== CombatStateEnum.FIGHTING) return

      const newHealth = Math.max(0, enemy.currentHealth - damage)

      set(state => {
        if (state.currentEnemy) {
          state.currentEnemy.currentHealth = newHealth
        }

        state.combatLog.push({
          type: CombatEventType.DAMAGED,
          timestamp: Date.now(),
          data: {
            damage: {
              baseDamage: damage,
              finalDamage: damage,
              isCrit,
              element: element as any,
            },
            targetId: enemy.id,
            targetName: enemy.monster.name,
          },
        })
      })

      // 检查是否击杀
      if (newHealth <= 0) {
        get().endCombatVictory()
      }
    },

    /**
     * 敌人攻击（使用AI决策）
     */
    enemyAttack: () => {
      const state = get()
      const enemy = state.currentEnemy

      if (!enemy || state.combatState !== CombatStateEnum.FIGHTING) return 0

      // 使用AI决策
      const healthPercent = enemy.currentHealth / enemy.maxHealth
      const decision = makeAIDecision(enemy.monster, healthPercent, 1.0)

      let damage = enemy.monster.stats.damage
      let isCrit = false
      let actionDesc = ''

      // 根据AI决策执行动作
      if (decision.action === 'ability' && decision.ability) {
        const result = applyBossAbility(enemy.monster, decision.ability, { health: enemy.currentHealth, maxHealth: enemy.maxHealth })
        damage += result.damage
        actionDesc = decision.reasoning
      } else if (decision.action === 'attack') {
        isCrit = Math.random() < 0.1
        if (isCrit) {
          damage = Math.floor(damage * 1.5)
        }
        actionDesc = decision.reasoning
      } else if (decision.action === 'flee') {
        actionDesc = decision.reasoning
      }

      // 元素反应检查
      const reactionResult = checkElementalReaction(null, enemy.monster.stats.resists, [])
      damage = Math.floor(damage * reactionResult.bonusDamage)

      set(state => {
        state.combatLog.push({
          type: CombatEventType.DAMAGED,
          timestamp: Date.now(),
          data: {
            damage: {
              baseDamage: damage,
              finalDamage: damage,
              isCrit,
              element: Element.PHYSICAL,
            },
            targetName: '你',
          },
        })
      })

      return damage
    },

    /**
     * 添加战斗日志
     */
    addCombatLog: (event: CombatEvent) => {
      set(state => {
        state.combatLog.push(event)
        // 限制日志数量
        if (state.combatLog.length > 100) {
          state.combatLog = state.combatLog.slice(-50)
        }
      })
    },

    /**
     * 重置战斗状态
     */
    resetCombat: () => {
      set(() => ({
        combatState: CombatStateEnum.IDLE,
        currentEnemy: null,
        combatStartTime: null,
      }))
    },

    /**
     * 尝试逃跑
     */
    attemptFlee: () => {
      const state = get()
      if (!state.currentEnemy || state.combatState !== CombatStateEnum.FIGHTING) return false

      // 基础逃跑成功率50%，每级差+10%
      const baseChance = 0.5
      const success = Math.random() < baseChance

      if (success) {
        set(state => {
          state.combatState = CombatStateEnum.FLEEING
          state.comboCount = 0
        })
      } else {
        // 逃跑失败，敌人攻击一次
        const damage = state.currentEnemy.monster.stats.damage
        set(state => {
          state.fleeChance = state.fleeChance * 0.9 // 下次逃跑更容易
          state.combatLog.push({
            type: CombatEventType.DAMAGED,
            timestamp: Date.now(),
            data: {
              damage: {
                baseDamage: damage,
                finalDamage: damage,
                isCrit: false,
                element: Element.PHYSICAL,
              },
              targetName: '你',
            },
          })
        })
      }

      return success
    },

    /**
     * 获取掉落物品
     */
    getLoot: () => {
      const state = get()
      const enemy = state.currentEnemy

      if (!enemy) return []

      const loot: Item[] = []
      const lootBonus = 1.0 // 可以从区域奖励获取

      // 检查掉落表
      for (const entry of enemy.monster.lootTable) {
        if (Math.random() < entry.chance * lootBonus) {
          const quantity = Math.floor(
            Math.random() * (entry.maxQuantity - entry.minQuantity + 1)
          ) + entry.minQuantity

          const item = generateRandomItem(enemy.monster.level)
          item.quantity = quantity
          loot.push(item)
        }
      }

      // 额外随机掉落
      if (Math.random() < 0.3) {
        loot.push(generateRandomItem(enemy.monster.level))
      }

      set(state => {
        state.combatLog.push({
          type: CombatEventType.LOOT,
          timestamp: Date.now(),
          data: {
            itemId: loot[0]?.id,
          },
        })
      })

      return loot
    },

    /**
     * 增加击杀数
     */
    addKill: () => {
      set(state => {
        state.killCount += 1
        state.comboCount += 1
      })
    },
  }))
)

/**
 * 获取战斗持续时间（秒）
 */
export function getCombatDuration(state: CombatStoreState): number {
  if (!state.combatStartTime) return 0
  return Math.floor((Date.now() - state.combatStartTime) / 1000)
}

/**
 * 获取敌人剩余血量百分比
 */
export function getEnemyHealthPercent(state: CombatStoreState): number {
  if (!state.currentEnemy) return 0
  return (state.currentEnemy.currentHealth / state.currentEnemy.maxHealth) * 100
}
