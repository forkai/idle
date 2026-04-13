/**
 * @fileoverview 图鉴Store - 追踪已发现的装备、怪物、技能
 * @description 记录玩家已遇到的装备/怪物/已解锁的技能，未发现的显示为灰色剪影
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/** 已发现的装备ID集合 */
type DiscoveredEquipment = Set<string>
/** 已遇到的怪物ID集合 */
type DiscoveredMonsters = Set<string>
/** 已解锁的技能ID集合 */
type UnlockedSkills = Set<string>

interface CodexState {
  /** 已发现装备 */
  discoveredEquipment: DiscoveredEquipment
  /** 已遇到怪物 */
  discoveredMonsters: DiscoveredMonsters
  /** 已解锁技能 */
  unlockedSkills: UnlockedSkills

  // ---- 装备图鉴动作 ----
  /** 记录发现装备 */
  discoverEquipment: (itemId: string) => void
  /** 批量记录发现装备 */
  discoverEquipmentBatch: (itemIds: string[]) => void
  /** 检查装备是否已发现 */
  isEquipmentDiscovered: (itemId: string) => boolean

  // ---- 怪物图鉴动作 ----
  /** 记录遇到怪物 */
  discoverMonster: (monsterId: string) => void
  /** 批量记录遇到怪物 */
  discoverMonsterBatch: (monsterIds: string[]) => void
  /** 检查怪物是否已遇到 */
  isMonsterDiscovered: (monsterId: string) => boolean

  // ---- 技能图鉴动作 ----
  /** 记录解锁技能 */
  unlockSkill: (skillId: string) => void
  /** 批量记录解锁技能 */
  unlockSkillBatch: (skillIds: string[]) => void
  /** 检查技能是否已解锁 */
  isSkillUnlocked: (skillId: string) => boolean

  // ---- 统计 ----
  /** 获取图鉴完成度 */
  getCompletionStats: () => {
    equipmentDiscovered: number
    equipmentTotal: number
    monstersDiscovered: number
    monstersTotal: number
    skillsUnlocked: number
    skillsTotal: number
  }

  // ---- 重置 ----
  /** 重置所有图鉴数据 */
  resetCodex: () => void
}

/** 空集合工厂 */
const emptySetFactory = () => new Set<string>()

export const useCodexStore = create<CodexState>()(
  persist(
    (set, get) => ({
      discoveredEquipment: emptySetFactory(),
      discoveredMonsters: emptySetFactory(),
      unlockedSkills: emptySetFactory(),

      // ---- 装备 ----
      discoverEquipment: (itemId) =>
        set((state) => ({
          discoveredEquipment: new Set([...state.discoveredEquipment, itemId]),
        })),

      discoverEquipmentBatch: (itemIds) =>
        set((state) => ({
          discoveredEquipment: new Set([...state.discoveredEquipment, ...itemIds]),
        })),

      isEquipmentDiscovered: (itemId) =>
        get().discoveredEquipment.has(itemId),

      // ---- 怪物 ----
      discoverMonster: (monsterId) =>
        set((state) => ({
          discoveredMonsters: new Set([...state.discoveredMonsters, monsterId]),
        })),

      discoverMonsterBatch: (monsterIds) =>
        set((state) => ({
          discoveredMonsters: new Set([...state.discoveredMonsters, ...monsterIds]),
        })),

      isMonsterDiscovered: (monsterId) =>
        get().discoveredMonsters.has(monsterId),

      // ---- 技能 ----
      unlockSkill: (skillId) =>
        set((state) => ({
          unlockedSkills: new Set([...state.unlockedSkills, skillId]),
        })),

      unlockSkillBatch: (skillIds) =>
        set((state) => ({
          unlockedSkills: new Set([...state.unlockedSkills, ...skillIds]),
        })),

      isSkillUnlocked: (skillId) =>
        get().unlockedSkills.has(skillId),

      // ---- 统计 ----
      getCompletionStats: () => {
        // 总装备数从装备常量获取
        const { EQUIPMENT_TEMPLATES } = require('@/constants/items')
        // 总怪物数从怪物常量获取
        const { MONSTERS } = require('@/constants/enemies')
        // 总技能数从技能常量获取
        const { SKILLS } = require('@/constants/skills')

        return {
          equipmentDiscovered: get().discoveredEquipment.size,
          equipmentTotal: Object.keys(EQUIPMENT_TEMPLATES).length,
          monstersDiscovered: get().discoveredMonsters.size,
          monstersTotal: MONSTERS.length,
          skillsUnlocked: get().unlockedSkills.size,
          skillsTotal: SKILLS.length,
        }
      },

      // ---- 重置 ----
      resetCodex: () =>
        set({
          discoveredEquipment: emptySetFactory(),
          discoveredMonsters: emptySetFactory(),
          unlockedSkills: emptySetFactory(),
        }),
    }),
    {
      name: 'codex-storage',
      // 自定义序列化，因为Set不是JSON可序列化的
      partialize: (state) => ({
        discoveredEquipment: [...state.discoveredEquipment],
        discoveredMonsters: [...state.discoveredMonsters],
        unlockedSkills: [...state.unlockedSkills],
      }),
      merge: (persisted, current) => {
        const p = persisted as any
        return {
          ...current,
          discoveredEquipment: new Set(p?.discoveredEquipment ?? []),
          discoveredMonsters: new Set(p?.discoveredMonsters ?? []),
          unlockedSkills: new Set(p?.unlockedSkills ?? []),
        }
      },
    }
  )
)
