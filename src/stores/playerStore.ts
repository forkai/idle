/**
 * @fileoverview 玩家状态管理Store
 * @description 管理玩家基础数据，包括角色属性、经验、金币、属性点分配等
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { CharacterStats, BaseStats } from '@/types/game'
import { CharacterClass } from '@/types/game'
import type { EquipmentState } from '@/types/items'
import { DEFAULT_CHARACTER_STATS, calculateCharacterStats, createInitialStats } from '@/lib/game/stats'
import { v4 as uuidv4 } from 'uuid'

/**
 * 玩家存档数据结构
 * 包含需要持久化保存的所有角色数据
 */
export interface PlayerSave {
  /** 玩家ID（UUID） */
  id: string
  /** 玩家名称 */
  name: string
  /** 职业枚举值 */
  classId: CharacterClass
  /** 当前等级 */
  level: number
  /** 当前经验值 */
  experience: number
  /** 持有金币 */
  gold: number
  /** 基础属性点（由职业决定的初始属性） */
  baseStats: BaseStats
  /** 已分配的属性点（玩家手动分配） */
  allocatedStats: BaseStats
  /** 已解锁的技能ID列表 */
  unlockedSkills: string[]
  /** 各技能的等级映射 */
  skillLevels: Record<string, number>
  /** 角色创建时间戳 */
  createdAt: number
  /** 最后活跃时间戳 */
  lastActiveTime: number
}

/**
 * 玩家Store状态接口
 */
interface PlayerStoreState {
  /** 玩家存档数据 */
  player: PlayerSave
  /** 计算后的完整战斗属性（包含装备、技能加成） */
  computedStats: CharacterStats
  /** 游戏总游玩时间（毫秒） */
  playTime: number
}

/**
 * 玩家Store动作接口
 */
interface PlayerActions {
  /** 创建新角色 */
  createCharacter: (name: string, classId: CharacterClass) => void
  /** 加载存档数据 */
  loadSave: (save: PlayerSave) => void
  /** 获取当前存档数据 */
  getSave: () => PlayerSave
  /** 增加经验值，返回是否升级和新等级 */
  addExperience: (amount: number) => { leveledUp: boolean; newLevel: number }
  /** 增加金币 */
  addGold: (amount: number) => void
  /** 消耗金币，失败返回false */
  spendGold: (amount: number) => boolean
  /** 分配属性点 */
  allocateStat: (stat: keyof BaseStats, points: number) => void
  /** 获取可用属性点数量 */
  getAvailableStatPoints: () => number
  /** 更新计算属性（装备或技能变化后调用） */
  refreshComputedStats: (equipment: EquipmentState, skills: Array<{ skillId: string; level: number; unlocked: boolean }>) => void
  /** 更新战斗中的当前血量/蓝量 */
  updateCombatStats: (health?: number, mana?: number) => void
  /** 重置玩家数据 */
  resetPlayer: () => void
}

/**
 * 创建默认玩家数据
 */
export function createDefaultPlayer(): PlayerSave {
  return {
    id: '',
    name: '',
    classId: CharacterClass.WARRIOR,
    level: 1,
    experience: 0,
    gold: 100,
    baseStats: { strength: 10, dexterity: 10, vitality: 10, energy: 10 },
    allocatedStats: { strength: 0, dexterity: 0, vitality: 0, energy: 0 },
    unlockedSkills: [],
    skillLevels: {},
    createdAt: Date.now(),
    lastActiveTime: Date.now(),
  }
}

/**
 * 获取指定等级所需的累计经验值
 * 经验曲线：每级递增10%基础值，基础增量100
 */
export function getExpForLevel(level: number): number {
  if (level <= 1) return 0
  if (level > 99) level = 99
  let exp = 0
  for (let l = 2; l <= level; l++) {
    exp = Math.floor(exp * 1.1) + 100
  }
  return exp
}

/**
 * 计算玩家当前可用的属性点数
 * 规则：每升一级获得5点属性点
 */
export function calcAvailableStatPoints(player: PlayerSave): number {
  const pointsPerLevel = 5
  const usedPoints =
    player.allocatedStats.strength +
    player.allocatedStats.dexterity +
    player.allocatedStats.vitality +
    player.allocatedStats.energy
  const totalPoints = (player.level - 1) * pointsPerLevel
  return totalPoints - usedPoints
}

/**
 * 玩家状态Store
 * 使用persist中间件持久化到localStorage
 */
export const usePlayerStore = create<PlayerStoreState & PlayerActions>()(
  persist(
    immer((set, get) => ({
      player: createDefaultPlayer(),
      computedStats: DEFAULT_CHARACTER_STATS,
      playTime: 0,

      /**
       * 创建新角色
       * 初始化职业相关基础属性和完整战斗属性
       */
      createCharacter: (name: string, classId: CharacterClass) => {
        const baseStats = createInitialStats(classId)
        const computedStats = calculateCharacterStats(baseStats, 1, {}, [])

        set(state => {
          state.player = {
            id: uuidv4(),
            name,
            classId,
            level: 1,
            experience: 0,
            gold: 100,
            baseStats,
            allocatedStats: { strength: 0, dexterity: 0, vitality: 0, energy: 0 },
            unlockedSkills: [],
            skillLevels: {},
            createdAt: Date.now(),
            lastActiveTime: Date.now(),
          }
          state.computedStats = computedStats
          state.playTime = 0
        })
      },

      /**
       * 从存档加载玩家数据
       */
      loadSave: (save: PlayerSave) => {
        const totalStats = {
          strength: save.baseStats.strength + save.allocatedStats.strength,
          dexterity: save.baseStats.dexterity + save.allocatedStats.dexterity,
          vitality: save.baseStats.vitality + save.allocatedStats.vitality,
          energy: save.baseStats.energy + save.allocatedStats.energy,
        }
        const computedStats = calculateCharacterStats(
          totalStats,
          save.level,
          {},
          save.unlockedSkills.map(id => ({
            skillId: id,
            level: save.skillLevels[id] || 1,
            unlocked: true,
          }))
        )

        set(state => {
          state.player = { ...save, lastActiveTime: Date.now() }
          state.computedStats = computedStats
        })
      },

      /**
       * 获取当前玩家存档
       */
      getSave: () => get().player,

      /**
       * 增加经验值并处理升级逻辑
       */
      addExperience: (amount: number) => {
        const { player } = get()
        const newExp = player.experience + amount
        const expForNextLevel = getExpForLevel(player.level + 1)

        if (newExp >= expForNextLevel && player.level < 99) {
          set(state => {
            state.player.level += 1
            state.player.experience = newExp - expForNextLevel
            state.player.lastActiveTime = Date.now()
          })
          return { leveledUp: true, newLevel: player.level + 1 }
        }

        set(state => {
          state.player.experience = newExp
          state.player.lastActiveTime = Date.now()
        })
        return { leveledUp: false, newLevel: player.level }
      },

      /**
       * 增加金币
       */
      addGold: (amount: number) => {
        set(state => {
          state.player.gold += amount
        })
      },

      /**
       * 消耗金币（余额不足返回false）
       */
      spendGold: (amount: number) => {
        if (get().player.gold < amount) return false
        set(state => {
          state.player.gold -= amount
        })
        return true
      },

      /**
       * 分配属性点到指定属性
       * 会重新计算完整战斗属性
       */
      allocateStat: (stat: keyof BaseStats, points: number) => {
        const state = get()
        const available = calcAvailableStatPoints(state.player)
        if (points > available || points < 0) return

        set(state => {
          state.player.allocatedStats[stat] += points
          const totalStats = {
            strength: state.player.baseStats.strength + state.player.allocatedStats.strength,
            dexterity: state.player.baseStats.dexterity + state.player.allocatedStats.dexterity,
            vitality: state.player.baseStats.vitality + state.player.allocatedStats.vitality,
            energy: state.player.baseStats.energy + state.player.allocatedStats.energy,
          }
          // 更新计算属性（装备传空，稍后由equipmentStore同步）
          state.computedStats = calculateCharacterStats(
            totalStats,
            state.player.level,
            {},
            state.player.unlockedSkills.map(id => ({
              skillId: id,
              level: state.player.skillLevels[id] || 1,
              unlocked: true,
            }))
          )
        })
      },

      /**
       * 获取当前可用属性点
       */
      getAvailableStatPoints: () => calcAvailableStatPoints(get().player),

      /**
       * 装备或技能变化后刷新计算属性
       */
      refreshComputedStats: (equipment, skills) => {
        const { player } = get()
        const totalStats = {
          strength: player.baseStats.strength + player.allocatedStats.strength,
          dexterity: player.baseStats.dexterity + player.allocatedStats.dexterity,
          vitality: player.baseStats.vitality + player.allocatedStats.vitality,
          energy: player.baseStats.energy + player.allocatedStats.energy,
        }
        const computedStats = calculateCharacterStats(totalStats, player.level, equipment, skills)
        set(state => {
          state.computedStats = computedStats
        })
      },

      /**
       * 更新当前血量/蓝量（战斗中受伤/恢复时调用）
       */
      updateCombatStats: (health?: number, mana?: number) => {
        set(state => {
          if (health !== undefined) {
            state.computedStats.health = Math.max(0, Math.min(health, state.computedStats.maxHealth))
          }
          if (mana !== undefined) {
            state.computedStats.mana = Math.max(0, Math.min(mana, state.computedStats.maxMana))
          }
        })
      },

      /**
       * 重置玩家数据（新游戏）
       */
      resetPlayer: () => {
        set(() => ({
          player: createDefaultPlayer(),
          computedStats: DEFAULT_CHARACTER_STATS,
          playTime: 0,
        }))
      },
    })),
    {
      name: 'diablo-idle-player',
      partialize: (state) => ({
        player: state.player,
        playTime: state.playTime,
      }),
    }
  )
)
