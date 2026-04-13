/**
 * @fileoverview 游戏Store门面（Facade）
 * @description 将playerStore、inventoryStore、equipmentStore、skillStore、zoneStore
 *              整合成统一的useGameStore接口，保持与旧代码的向后兼容性
 *
 * @deprecated 新代码请直接导入各自的Store：
 *   - usePlayerStore    from './playerStore'
 *   - useInventoryStore from './inventoryStore'
 *   - useEquipmentStore from './equipmentStore'
 *   - useSkillStore     from './skillStore'
 *   - useZoneStore      from './zoneStore'
 */

export type { PlayerSave } from './playerStore'

import { usePlayerStore } from './playerStore'
import { useInventoryStore } from './inventoryStore'
import { useEquipmentStore } from './equipmentStore'
import { useSkillStore } from './skillStore'
import { useZoneStore } from './zoneStore'
import type { CharacterClass, BaseStats } from '@/types/game'
import type { Item, EquipmentSlot } from '@/types/items'

/**
 * 游戏Store门面Hook
 * 从各个模块化Store中读取状态并聚合动作，供旧组件无缝使用
 */
export function useGameStore() {
  // 读取各Store状态
  const playerState = usePlayerStore()
  const inventoryState = useInventoryStore()
  const equipmentState = useEquipmentStore()
  const skillState = useSkillStore()
  const zoneState = useZoneStore()

  return {
    // ---- 状态字段 ----
    /** 玩家基础数据 */
    player: playerState.player,
    /** 计算后的完整战斗属性 */
    computedStats: playerState.computedStats,
    /** 背包数据 */
    inventory: inventoryState.inventory,
    /** 装备槽位数据 */
    equipment: equipmentState.equipment,
    /** 当前区域ID */
    currentZoneId: zoneState.currentZoneId,
    /** 游戏总时间 */
    playTime: playerState.playTime,

    // ---- 玩家动作 ----
    /** 创建新角色（同时重置所有关联Store） */
    createCharacter: (name: string, classId: CharacterClass) => {
      playerState.createCharacter(name, classId)
      inventoryState.resetInventory()
      equipmentState.resetEquipment()
      skillState.resetSkills()
      zoneState.resetZones()
    },
    /** 加载存档 */
    loadSave: playerState.loadSave,
    /** 获取存档数据 */
    getSave: playerState.getSave,
    /** 增加经验 */
    addExperience: playerState.addExperience,
    /** 增加金币 */
    addGold: playerState.addGold,
    /** 消耗金币 */
    spendGold: playerState.spendGold,
    /** 分配属性点 */
    allocateStat: playerState.allocateStat,
    /** 获取可用属性点 */
    getAvailableStatPoints: playerState.getAvailableStatPoints,
    /** 更新战斗中血量/蓝量 */
    updateCombatStats: playerState.updateCombatStats,
    /** 刷新计算属性（穿戴/卸下装备后调用） */
    refreshComputedStats: () => {
      playerState.refreshComputedStats(equipmentState.equipment, skillState.unlockedSkills.map(id => ({
        skillId: id,
        level: skillState.skillLevels[id] ?? 1,
        unlocked: true,
      })))
    },
    /** 重置所有数据（回到初始状态） */
    resetCharacter: () => {
      playerState.resetPlayer()
      inventoryState.resetInventory()
      equipmentState.resetEquipment()
      skillState.resetSkills()
      zoneState.resetZones()
    },

    // ---- 技能动作 ----
    /** 解锁技能 */
    unlockSkill: (skillId: string) =>
      skillState.unlockSkill(
        skillId,
        playerState.player.level,
        playerState.player.unlockedSkills
      ),
    /** 升级技能 */
    upgradeSkill: skillState.upgradeSkill,

    // ---- 装备动作 ----
    /** 装备物品 */
    equipItem: (item: Item) => {
      const ok = equipmentState.equipItem(item)
      if (ok) {
        // 刷新战斗属性（装备变化会影响属性）
        const skills = skillState.unlockedSkills.map(id => ({
          skillId: id,
          level: skillState.skillLevels[id] ?? 1,
          unlocked: true,
        }))
        playerState.refreshComputedStats(equipmentState.equipment, skills)
      }
      return ok
    },
    /** 卸下装备 */
    unequipItem: (slot: EquipmentSlot) => {
      const item = equipmentState.unequipItem(slot)
      if (item) {
        const skills = skillState.unlockedSkills.map(id => ({
          skillId: id,
          level: skillState.skillLevels[id] ?? 1,
          unlocked: true,
        }))
        playerState.refreshComputedStats(equipmentState.equipment, skills)
      }
      return item
    },

    // ---- 背包动作 ----
    /** 添加物品到背包 */
    addToInventory: inventoryState.addToInventory,
    /** 从背包移除物品 */
    removeFromInventory: inventoryState.removeFromInventory,
    /** 使用物品 */
    useItem: (itemId: string) =>
      inventoryState.useItem(itemId, (hp, mp) => {
        const { computedStats } = playerState
        playerState.updateCombatStats(
          hp > 0 ? computedStats.health + hp : undefined,
          mp > 0 ? computedStats.mana + mp : undefined
        )
      }),
    /** 获取背包空余槽位数 */
    getAvailableInventorySlots: inventoryState.getAvailableSlots,

    // ---- 区域动作 ----
    /** 切换区域 */
    changeZone: zoneState.changeZone,
  }
}
