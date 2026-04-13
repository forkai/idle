/**
 * @fileoverview 技能状态管理Store
 * @description 管理玩家已解锁的技能及技能等级，处理技能解锁/升级逻辑
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { getSkillById } from '@/constants/skills'

/**
 * 技能Store状态接口
 */
interface SkillStoreState {
  /** 已解锁的技能ID列表 */
  unlockedSkills: string[]
  /** 技能等级映射 skillId -> level */
  skillLevels: Record<string, number>
  /** 技能冷却时间记录 skillId -> 上次使用时间戳 */
  skillCooldowns: Record<string, number>
}

/**
 * 技能Store动作接口
 */
interface SkillActions {
  /**
   * 解锁技能
   * 检查：等级要求、前置技能、是否已解锁
   * @returns 解锁成功返回true
   */
  unlockSkill: (skillId: string, playerLevel: number, unlockedSkillIds: string[]) => boolean
  /**
   * 升级已解锁的技能
   * @returns 升级成功返回true
   */
  upgradeSkill: (skillId: string) => boolean
  /**
   * 获取技能当前等级（未解锁返回0）
   */
  getSkillLevel: (skillId: string) => number
  /**
   * 记录技能已使用（设置冷却）
   */
  useSkill: (skillId: string) => void
  /**
   * 检查技能是否在冷却中
   * @returns 剩余冷却时间（毫秒），0表示可用
   */
  getSkillCooldownRemaining: (skillId: string) => number
  /**
   * 重置技能数据（新游戏时调用）
   */
  resetSkills: () => void
  /**
   * 从存档同步技能数据
   */
  syncFromSave: (unlockedSkills: string[], skillLevels: Record<string, number>) => void
}

/**
 * 技能状态Store
 */
export const useSkillStore = create<SkillStoreState & SkillActions>()(
  persist(
    immer((set, get) => ({
      unlockedSkills: [],
      skillLevels: {},
      skillCooldowns: {},

      /**
       * 解锁技能
       * 需满足：职业技能、等级要求、前置技能均已解锁
       */
      unlockSkill: (skillId: string, playerLevel: number, unlockedSkillIds: string[]) => {
        const skill = getSkillById(skillId)
        if (!skill) return false

        const { unlockedSkills } = get()
        if (unlockedSkills.includes(skillId)) return false
        if (playerLevel < skill.requiredLevel) return false

        // 检查所有前置技能已解锁
        for (const prereq of skill.prerequisites) {
          if (!unlockedSkillIds.includes(prereq)) return false
        }

        set(state => {
          state.unlockedSkills.push(skillId)
          state.skillLevels[skillId] = 1
        })
        return true
      },

      /**
       * 技能升级（不超过最大等级）
       */
      upgradeSkill: (skillId: string) => {
        const { unlockedSkills, skillLevels } = get()
        if (!unlockedSkills.includes(skillId)) return false

        const skill = getSkillById(skillId)
        if (!skill) return false

        const currentLevel = skillLevels[skillId] ?? 1
        if (currentLevel >= skill.maxLevel) return false

        set(state => {
          state.skillLevels[skillId] = currentLevel + 1
        })
        return true
      },

      /**
       * 获取技能当前等级
       */
      getSkillLevel: (skillId: string) => {
        const { skillLevels } = get()
        return skillLevels[skillId] ?? 0
      },

      /**
       * 记录技能已使用（设置冷却时间）
       */
      useSkill: (skillId: string) => {
        const skill = getSkillById(skillId)
        if (!skill) return

        set(state => {
          state.skillCooldowns[skillId] = Date.now() + skill.cooldown
        })
      },

      /**
       * 检查技能是否在冷却中
       * @returns 剩余冷却时间（毫秒），0表示可用
       */
      getSkillCooldownRemaining: (skillId: string) => {
        const { skillCooldowns } = get()
        const cooldownEnd = skillCooldowns[skillId] ?? 0
        const remaining = cooldownEnd - Date.now()
        return Math.max(0, remaining)
      },

      /**
       * 重置技能（新游戏）
       */
      resetSkills: () => {
        set(() => ({
          unlockedSkills: [],
          skillLevels: {},
          skillCooldowns: {},
        }))
      },

      /**
       * 从存档同步（角色加载时调用）
       */
      syncFromSave: (unlockedSkills: string[], skillLevels: Record<string, number>) => {
        set(() => ({
          unlockedSkills: [...unlockedSkills],
          skillLevels: { ...skillLevels },
          skillCooldowns: {},
        }))
      },
    })),
    {
      name: 'diablo-idle-skills',
      partialize: (state) => ({
        unlockedSkills: state.unlockedSkills,
        skillLevels: state.skillLevels,
        // skillCooldowns 不持久化，刷新页面后冷却重置
      }),
    }
  )
)
