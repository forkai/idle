/**
 * @fileoverview 状态管理Store统一导出
 * @description 导出所有模块化Store，使用时按需导入对应Store
 *
 * 模块化Store（推荐直接使用）：
 *   - usePlayerStore    - 玩家数据（属性/经验/金币）
 *   - useInventoryStore - 背包管理
 *   - useEquipmentStore - 装备管理
 *   - useSkillStore     - 技能系统
 *   - useZoneStore      - 区域进度
 *   - useSettingsStore  - 游戏设置
 *   - useCombatStore    - 战斗状态
 *
 * 兼容层（旧组件使用）：
 *   - useGameStore      - 聚合门面，内部调用各模块化Store
 */

export * from './playerStore'
export * from './inventoryStore'
export * from './equipmentStore'
export * from './skillStore'
export * from './zoneStore'
export * from './settingsStore'
export * from './combatStore'
// 门面导出（向后兼容）
export { useGameStore } from './gameStore'
export type { PlayerSave } from './gameStore'
