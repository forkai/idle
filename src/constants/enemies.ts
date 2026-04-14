/**
 * @fileoverview 敌人/怪物数据常量
 * @description 定义游戏中的所有怪物数据（从JSON统一加载）
 */

import type { Monster, Zone, Act } from '@/types/enemy'
import { MonsterType } from '@/types/enemy'
import monsterData from '@/data/monster-templates.json'

/**
 * 怪物数据映射（从JSON加载）
 */
export const MONSTERS: Record<string, Monster> = {}

// 初始化怪物数据
const initMonsters = () => {
  for (const zone of Object.values(monsterData.zones)) {
    for (const m of zone.monsters) {
      MONSTERS[m.id] = {
        id: m.id,
        name: m.name,
        type: MonsterType[m.type as keyof typeof MonsterType] || MonsterType.BEAST,
        level: m.level,
        stats: {
          health: m.baseStats.health,
          damage: m.baseStats.damage,
          defense: m.baseStats.defense,
          attackSpeed: m.baseStats.attackSpeed,
          expReward: m.baseStats.expReward,
          goldReward: m.baseStats.goldReward,
          resists: m.baseStats.resists,
        },
        abilities: m.abilities.map(a => ({
          id: a.id,
          name: a.name,
          description: a.description,
          triggerChance: a.triggerChance,
          effectType: a.effectType as 'damage' | 'debuff' | 'buff' | 'heal' | 'summon',
          effectValue: a.effectValue,
          cooldown: a.cooldown,
          element: a.element,
        })),
        lootTable: m.lootTable.map(l => ({
          itemId: l.itemId,
          chance: l.chance,
          minQuantity: l.minQuantity,
          maxQuantity: l.maxQuantity,
        })),
        zoneId: m.id.includes('blood_witch') || m.id.includes('blood_golem') ? 'blood-marsh' :
                m.id.includes('crypt') || m.id.includes('skeleton_warrior') || m.id.includes('mummy') ? 'undead-crypt' :
                m.id.includes('forest') || m.id.includes('ancient_golem') || m.id.includes('plague_rat') || m.id.includes('shadow_assassin') || m.id.includes('cursed_knight') ? 'twilight-forest' :
                m.id.includes('demon') || m.id.includes('hellfire') || m.id.includes('pit_fiend') ? 'demon-fortress' :
                m.id.includes('cave') || m.id.includes('bat') ? 'dark-cave' : 'blood-marsh',
        icon: m.icon,
        description: m.description,
      }
    }
  }
}

initMonsters()

/**
 * 区域数据（从JSON加载）
 */
export const ZONES: Record<string, Zone> = {
  'blood-marsh': {
    id: 'blood-marsh',
    name: '鲜血湿地',
    description: '一片被诅咒的沼泽，充斥着腐烂的气息。骷髅和僵尸在这里游荡。',
    background: '沼泽',
    requiredLevel: 1,
    monsterLevelRange: { min: 1, max: 5 },
    monsterTypes: [MonsterType.UNDEAD, MonsterType.DEMON],
    monsters: ['skeleton', 'zombie', 'corrupt_spirit', 'blood_witch'],
    bossId: 'blood_witch',
    rewards: { goldBonus: 1.0, expBonus: 1.0, lootBonus: 1.0 },
    unlocked: true,
    act: 1,
  },
  'dark-cave': {
    id: 'dark-cave',
    name: '黑暗洞穴',
    description: '深邃的地下洞穴，是各种变异生物的栖息地。',
    background: '洞穴',
    requiredLevel: 3,
    monsterLevelRange: { min: 3, max: 8 },
    monsterTypes: [MonsterType.BEAST, MonsterType.DEMON],
    monsters: ['cave_rat', 'bat_swarm', 'shadow_cave', 'cave_troll'],
    bossId: 'cave_troll',
    rewards: { goldBonus: 1.2, expBonus: 1.2, lootBonus: 1.1 },
    unlocked: false,
    act: 1,
  },
  'undead-crypt': {
    id: 'undead-crypt',
    name: '不死族墓穴',
    description: '古老的墓穴，沉睡着强大的不死族生物。',
    background: '墓穴',
    requiredLevel: 6,
    monsterLevelRange: { min: 6, max: 12 },
    monsterTypes: [MonsterType.UNDEAD],
    monsters: ['skeleton_warrior', 'ghost', 'mummy', 'crypt_lord'],
    bossId: 'crypt_lord',
    rewards: { goldBonus: 1.5, expBonus: 1.5, lootBonus: 1.3 },
    unlocked: false,
    act: 1,
  },
  'twilight-forest': {
    id: 'twilight-forest',
    name: '暮光森林',
    description: '神秘的暮光森林，蕴含着强大的自然力量与元素能量。',
    background: '森林',
    requiredLevel: 10,
    monsterLevelRange: { min: 10, max: 18 },
    monsterTypes: [MonsterType.BEAST, MonsterType.ELEMENTAL],
    monsters: ['forest_wolf', 'fire_sprite', 'ice_shard', 'lightning_eagle', 'corrupted_tree', 'forest_spirit_queen'],
    bossId: 'forest_spirit_queen',
    rewards: { goldBonus: 2.0, expBonus: 2.0, lootBonus: 1.5 },
    unlocked: false,
    act: 2,
  },
  'cursed-city': {
    id: 'cursed-city',
    name: '诅咒古城',
    description: '被诅咒的古城遗址，瘟疫与暗影在这里蔓延。',
    background: '废墟',
    requiredLevel: 18,
    monsterLevelRange: { min: 18, max: 28 },
    monsterTypes: [MonsterType.UNDEAD, MonsterType.DEMON, MonsterType.BEAST],
    monsters: ['ancient_golem', 'plague_rat', 'shadow_assassin', 'cursed_knight', 'plague_lord'],
    bossId: 'plague_lord',
    rewards: { goldBonus: 2.5, expBonus: 2.5, lootBonus: 1.8 },
    unlocked: false,
    act: 2,
  },
  'demon-fortress': {
    id: 'demon-fortress',
    name: '恶魔要塞',
    description: '通往地狱的大门，恶魔的巢穴。',
    background: '地狱',
    requiredLevel: 25,
    monsterLevelRange: { min: 25, max: 35 },
    monsterTypes: [MonsterType.DEMON, MonsterType.ELEMENTAL],
    monsters: ['demon_hunter', 'hellfire_imp', 'pit_fiend', 'demon_lord'],
    bossId: 'demon_lord',
    rewards: { goldBonus: 3.0, expBonus: 3.0, lootBonus: 2.0 },
    unlocked: false,
    act: 2,
  },
}

/**
 * 章节数据
 */
export const ACTS: Record<string, Act> = {
  act1: {
    id: 'act1',
    name: '第一章：堕落者的洞穴',
    description: '冒险者踏入被黑暗侵蚀的土地，面对不死族的威胁。',
    difficulty: 1,
    zones: ['blood-marsh', 'dark-cave', 'undead-crypt'],
  },
  act2: {
    id: 'act2',
    name: '第二章：暮光森林',
    description: '穿越黑暗森林，探索诅咒古城，最终挑战地狱领主。',
    difficulty: 2,
    zones: ['twilight-forest', 'cursed-city', 'demon-fortress'],
  },
}

/**
 * 获取区域内所有怪物
 * @param zoneId - 区域ID
 * @returns 怪物数组
 */
export function getMonstersInZone(zoneId: string): Monster[] {
  const zone = ZONES[zoneId]
  if (!zone) return []
  return zone.monsters.map(id => MONSTERS[id]).filter(Boolean)
}

/**
 * 获取区域的Boss
 * @param zoneId - 区域ID
 * @returns Boss怪物
 */
export function getZoneBoss(zoneId: string): Monster | null {
  const zone = ZONES[zoneId]
  if (!zone || !zone.bossId) return null
  return MONSTERS[zone.bossId] || null
}

/**
 * 获取随机怪物
 * @param zoneId - 区域ID
 * @returns 随机怪物
 */
export function getRandomMonster(zoneId: string): Monster | null {
  const monsters = getMonstersInZone(zoneId)
  if (monsters.length === 0) return null
  return monsters[Math.floor(Math.random() * monsters.length)]
}

/**
 * 根据等级获取推荐区域
 * @param level - 玩家等级
 * @returns 区域ID
 */
export function getRecommendedZone(level: number): string {
  for (const zone of Object.values(ZONES).sort((a, b) => a.requiredLevel - b.requiredLevel)) {
    if (zone.requiredLevel <= level && zone.unlocked) {
      return zone.id
    }
  }
  return 'blood-marsh'
}
