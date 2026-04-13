/**
 * @fileoverview 游戏状态管理Store
 * @description 管理游戏的全局状态，包括玩家数据、背包、装备等
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { CharacterStats, BaseStats } from '@/types/game'
import { CharacterClass, CharacterClassNames, CharacterClassDescriptions } from '@/types/game'
import type { EquipmentState, Inventory, Item, EquipmentSlot } from '@/types/items'
import { ItemRarity, EquipmentSlot as Slot, DEFAULT_INVENTORY_SIZE } from '@/types/items'
import type { PlayerSkill } from '@/types/skills'
import { getSkillsByClass, getSkillById } from '@/constants/skills'
import { DEFAULT_CHARACTER_STATS, calculateCharacterStats, createInitialStats } from '@/lib/game/stats'
import { v4 as uuidv4 } from 'uuid'

/**
 * 玩家存档数据结构
 */
export interface PlayerSave {
  /** 玩家ID */
  id: string
  /** 玩家名称 */
  name: string
  /** 职业 */
  classId: CharacterClass
  /** 等级 */
  level: number
  /** 经验值 */
  experience: number
  /** 金币 */
  gold: number
  /** 基础属性点 */
  baseStats: BaseStats
  /** 已分配的属性点 */
  allocatedStats: BaseStats
  /** 已解锁的技能 */
  unlockedSkills: string[]
  /** 技能等级 */
  skillLevels: Record<string, number>
  /** 创建时间 */
  createdAt: number
  /** 最后活跃时间 */
  lastActiveTime: number
}

/**
 * 角色状态（包含计算后的完整属性）
 */
export interface CharacterState {
  /** 玩家存档 */
  player: PlayerSave
  /** 计算后的完整属性 */
  computedStats: CharacterStats
  /** 当前装备 */
  equipment: EquipmentState
  /** 背包 */
  inventory: Inventory
  /** 当前区域 */
  currentZoneId: string
  /** 游戏开始时间 */
  playTime: number
}

/**
 * 游戏Store动作接口
 */
interface GameActions {
  /** 创建新角色 */
  createCharacter: (name: string, classId: CharacterClass) => void
  /** 加载存档 */
  loadSave: (save: PlayerSave) => void
  /** 获取存档 */
  getSave: () => PlayerSave
  /** 增加经验 */
  addExperience: (amount: number) => { leveledUp: boolean; newLevel: number }
  /** 增加金币 */
  addGold: (amount: number) => void
  /** 消耗金币 */
  spendGold: (amount: number) => boolean
  /** 分配属性点 */
  allocateStat: (stat: keyof BaseStats, points: number) => void
  /** 解锁技能 */
  unlockSkill: (skillId: string) => boolean
  /** 升级技能 */
  upgradeSkill: (skillId: string) => boolean
  /** 装备物品 */
  equipItem: (item: Item) => boolean
  /** 卸下装备 */
  unequipItem: (slot: EquipmentSlot) => Item | null
  /** 添加物品到背包 */
  addToInventory: (item: Item) => boolean
  /** 从背包移除物品 */
  removeFromInventory: (itemId: string, quantity?: number) => boolean
  /** 使用物品 */
  useItem: (itemId: string) => boolean
  /** 切换区域 */
  changeZone: (zoneId: string) => void
  /** 更新战斗属性 */
  updateCombatStats: (health?: number, mana?: number) => void
  /** 重置角色（用于重新开始） */
  resetCharacter: () => void
  /** 获取背包可用槽位 */
  getAvailableInventorySlots: () => number
}

/**
 * 初始空状态
 */
const createEmptyState = (): CharacterState => ({
  player: {
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
  },
  computedStats: DEFAULT_CHARACTER_STATS,
  equipment: {
    head: null,
    chest: null,
    gloves: null,
    boots: null,
    belt: null,
    shield: null,
    ring1: null,
    ring2: null,
    amulet: null,
    weapon: null,
  },
  inventory: {
    slots: Array(DEFAULT_INVENTORY_SIZE).fill(null),
    usedSlots: 0,
    maxSlots: DEFAULT_INVENTORY_SIZE,
  },
  currentZoneId: 'blood-marsh',
  playTime: 0,
})

/**
 * 游戏状态Store
 */
export const useGameStore = create<CharacterState & GameActions>()(
  persist(
    immer((set, get) => ({
      ...createEmptyState(),

      /**
       * 创建新角色
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
          state.equipment = createEmptyState().equipment
          state.inventory = createEmptyState().inventory
          state.currentZoneId = 'blood-marsh'
          state.playTime = 0
        })
      },

      /**
       * 加载存档
       */
      loadSave: (save: PlayerSave) => {
        const computedStats = calculateCharacterStats(
          {
            strength: save.baseStats.strength + save.allocatedStats.strength,
            dexterity: save.baseStats.dexterity + save.allocatedStats.dexterity,
            vitality: save.baseStats.vitality + save.allocatedStats.vitality,
            energy: save.baseStats.energy + save.allocatedStats.energy,
          },
          save.level,
          get().equipment,
          save.unlockedSkills.map(id => ({
            skillId: id,
            level: save.skillLevels[id] || 1,
            unlocked: true,
          }))
        )

        set(state => {
          state.player = save
          state.computedStats = computedStats
          state.player.lastActiveTime = Date.now()
        })
      },

      /**
       * 获取存档数据
       */
      getSave: () => {
        return get().player
      },

      /**
       * 增加经验值
       */
      addExperience: (amount: number) => {
        const state = get()
        const { level, experience } = state.player
        const newExp = experience + amount

        // 查找升级所需经验（简化计算）
        const expForNextLevel = getExpForLevel(level + 1)
        const expForCurrentLevel = getExpForLevel(level)

        if (newExp >= expForNextLevel && level < 99) {
          // 升级
          set(state => {
            state.player.level += 1
            state.player.experience = newExp - expForNextLevel
            state.player.lastActiveTime = Date.now()
          })
          return { leveledUp: true, newLevel: level + 1 }
        }

        set(state => {
          state.player.experience = newExp
          state.player.lastActiveTime = Date.now()
        })
        return { leveledUp: false, newLevel: level }
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
       * 消耗金币
       */
      spendGold: (amount: number) => {
        const state = get()
        if (state.player.gold < amount) return false

        set(state => {
          state.player.gold -= amount
        })
        return true
      },

      /**
       * 分配属性点
       */
      allocateStat: (stat: keyof BaseStats, points: number) => {
        const state = get()
        const availablePoints = getAvailableStatPoints(state.player)

        if (points > availablePoints || points < 0) return

        set(state => {
          state.player.allocatedStats[stat] += points
          // 重新计算属性
          const totalStats = {
            strength: state.player.baseStats.strength + state.player.allocatedStats.strength,
            dexterity: state.player.baseStats.dexterity + state.player.allocatedStats.dexterity,
            vitality: state.player.baseStats.vitality + state.player.allocatedStats.vitality,
            energy: state.player.baseStats.energy + state.player.allocatedStats.energy,
          }
          state.computedStats = calculateCharacterStats(
            totalStats,
            state.player.level,
            state.equipment,
            state.player.unlockedSkills.map(id => ({
              skillId: id,
              level: state.player.skillLevels[id] || 1,
              unlocked: true,
            }))
          )
        })
      },

      /**
       * 解锁技能
       */
      unlockSkill: (skillId: string) => {
        const state = get()
        const skill = getSkillById(skillId)

        if (!skill) return false
        if (state.player.unlockedSkills.includes(skillId)) return false
        if (state.player.level < skill.requiredLevel) return false

        // 检查前置技能
        for (const prereq of skill.prerequisites) {
          if (!state.player.unlockedSkills.includes(prereq)) return false
        }

        set(state => {
          state.player.unlockedSkills.push(skillId)
          state.player.skillLevels[skillId] = 1
        })
        return true
      },

      /**
       * 升级技能
       */
      upgradeSkill: (skillId: string) => {
        const state = get()
        if (!state.player.unlockedSkills.includes(skillId)) return false

        const skill = getSkillById(skillId)
        if (!skill) return false

        const currentLevel = state.player.skillLevels[skillId] || 1
        if (currentLevel >= skill.maxLevel) return false

        set(state => {
          state.player.skillLevels[skillId] = currentLevel + 1
        })
        return true
      },

      /**
       * 装备物品
       */
      equipItem: (item: Item) => {
        const state = get()
        if (!item.slot) return false

        const slot = item.slot as EquipmentSlot
        // 检查是否已有装备
        const currentEquipped = state.equipment[slot]

        set(state => {
          // 如果有新装备，先放入背包（如果背包满了则替换到原位）
          if (currentEquipped) {
            const updatedSlots = addItemToSlots(state.inventory.slots, currentEquipped)
            if (updatedSlots) {
              state.inventory.slots = updatedSlots
            }
          }

          // 装备新物品
          state.equipment[slot] = item

          // 从背包移除
          state.inventory.slots = removeItemFromSlots(state.inventory.slots, item.id)
        })

        return true
      },

      /**
       * 卸下装备
       */
      unequipItem: (slot: EquipmentSlot) => {
        const state = get()
        const item = state.equipment[slot]
        if (!item) return null

        // 检查背包空间
        const availableSlots = get().getAvailableInventorySlots()
        if (availableSlots === 0) return null

        set(state => {
          // 将物品放入背包
          const slots = addItemToSlots(state.inventory.slots, item)
          if (slots) {
            state.inventory.slots = slots
            state.equipment[slot] = null
          }
        })

        return item
      },

      /**
       * 添加物品到背包
       */
      addToInventory: (item: Item) => {
        const state = get()
        const availableSlots = get().getAvailableInventorySlots()

        if (availableSlots === 0) return false

        set(state => {
          const slots = addItemToSlots(state.inventory.slots, item)
          if (slots) {
            state.inventory.slots = slots
          }
        })

        return true
      },

      /**
       * 从背包移除物品
       */
      removeFromInventory: (itemId: string, quantity: number = 1) => {
        set(state => {
          state.inventory.slots = removeItemFromSlots(state.inventory.slots, itemId, quantity)
        })
        return true
      },

      /**
       * 使用物品
       */
      useItem: (itemId: string) => {
        const state = get()

        // 查找物品
        const slotIndex = state.inventory.slots.findIndex(
          slot => slot && slot.id === itemId
        )

        if (slotIndex === -1) return false

        const item = state.inventory.slots[slotIndex]
        if (!item) return false

        // 处理药水
        if (item.type === 'potion') {
          set(state => {
            if (item.name.includes('生命')) {
              state.computedStats.health = Math.min(
                state.computedStats.health + 50,
                state.computedStats.maxHealth
              )
            } else if (item.name.includes('法力')) {
              state.computedStats.mana = Math.min(
                state.computedStats.mana + 30,
                state.computedStats.maxMana
              )
            }

            // 减少数量
            if (item.quantity > 1) {
              state.inventory.slots[slotIndex]!.quantity -= 1
            } else {
              state.inventory.slots[slotIndex] = null
            }
          })
          return true
        }

        return false
      },

      /**
       * 切换区域
       */
      changeZone: (zoneId: string) => {
        set(state => {
          state.currentZoneId = zoneId
        })
      },

      /**
       * 更新战斗属性
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
       * 重置角色
       */
      resetCharacter: () => {
        set(() => createEmptyState())
      },

      /**
       * 获取可用背包槽位
       */
      getAvailableInventorySlots: () => {
        const state = get()
        return state.inventory.slots.filter(slot => slot === null).length
      },
    })),
    {
      name: 'diablo-idle-save',
      partialize: (state) => ({
        player: state.player,
        equipment: state.equipment,
        inventory: state.inventory,
        currentZoneId: state.currentZoneId,
        playTime: state.playTime,
        // 重新计算computedStats
        computedStats: calculateCharacterStats(
          {
            strength: state.player.baseStats.strength + state.player.allocatedStats.strength,
            dexterity: state.player.baseStats.dexterity + state.player.allocatedStats.dexterity,
            vitality: state.player.baseStats.vitality + state.player.allocatedStats.vitality,
            energy: state.player.baseStats.energy + state.player.allocatedStats.energy,
          },
          state.player.level,
          state.equipment,
          state.player.unlockedSkills.map(id => ({
            skillId: id,
            level: state.player.skillLevels[id] || 1,
            unlocked: true,
          }))
        ),
      }),
    }
  )
)

/**
 * 获取指定等级所需经验
 */
function getExpForLevel(level: number): number {
  if (level <= 1) return 0
  if (level > 99) level = 99
  let exp = 0
  for (let l = 2; l <= level; l++) {
    exp = Math.floor(exp * 1.1) + 100
  }
  return exp
}

/**
 * 获取可用属性点
 */
function getAvailableStatPoints(player: PlayerSave): number {
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
 * 添加物品到背包槽位（处理堆叠）
 */
function addItemToSlots(slots: (Item | null)[], item: Item): (Item | null)[] | null {
  const newSlots = [...slots]

  // 如果可堆叠，尝试合并
  if (item.quantity > 1 || item.type === 'potion') {
    for (let i = 0; i < newSlots.length; i++) {
      const slot = newSlots[i]
      if (slot && slot.name === item.name && slot.rarity === item.rarity) {
        // 可以堆叠
        newSlots[i] = { ...slot, quantity: slot.quantity + item.quantity }
        return newSlots
      }
    }
  }

  // 找空槽位
  const emptyIndex = newSlots.findIndex(slot => slot === null)
  if (emptyIndex === -1) return null

  newSlots[emptyIndex] = { ...item }
  return newSlots
}

/**
 * 从背包槽位移除物品
 */
function removeItemFromSlots(slots: (Item | null)[], itemId: string, quantity: number = 1): (Item | null)[] {
  const newSlots = [...slots]
  const slotIndex = newSlots.findIndex(slot => slot && slot.id === itemId)

  if (slotIndex === -1) return newSlots

  const item = newSlots[slotIndex]
  if (!item) return newSlots

  if (item.quantity <= quantity) {
    newSlots[slotIndex] = null
  } else {
    newSlots[slotIndex] = { ...item, quantity: item.quantity - quantity }
  }

  return newSlots
}
