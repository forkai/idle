/**
 * @fileoverview 敌人/怪物数据常量
 * @description 定义游戏中的所有怪物数据
 */

import type { Monster, Zone, Act } from '@/types/enemy'
import { MonsterType } from '@/types/enemy'
import { v4 as uuidv4 } from 'uuid'

/**
 * 怪物数据
 */
export const MONSTERS: Record<string, Monster> = {
  // === 第一章：鲜血湿地 怪物 ===
  skeleton: {
    id: 'skeleton',
    name: '骷髅',
    type: MonsterType.UNDEAD,
    level: 1,
    stats: {
      health: 30,
      damage: 3,
      defense: 1,
      attackSpeed: 0.8,
      expReward: 8,
      goldReward: { min: 3, max: 8 },
      resists: { fire: -10, cold: 20, lightning: 0, poison: 30 },
    },
    abilities: [],
    lootTable: [],
    zoneId: 'blood-marsh',
    icon: '💀',
    description: '被黑暗力量复活的亡者骨架',
  },
  zombie: {
    id: 'zombie',
    name: '僵尸',
    type: MonsterType.UNDEAD,
    level: 2,
    stats: {
      health: 45,
      damage: 4,
      defense: 2,
      attackSpeed: 0.5,
      expReward: 12,
      goldReward: { min: 5, max: 12 },
      resists: { fire: -20, cold: 30, lightning: 0, poison: 50 },
    },
    abilities: [
      {
        id: 'zombie_poison',
        name: '尸毒',
        description: '攻击时附带毒素',
        triggerChance: 0.2,
        effectType: 'debuff',
        effectValue: 2,
        cooldown: 3000,
      },
    ],
    lootTable: [],
    zoneId: 'blood-marsh',
    icon: '🧟',
    description: '腐烂的尸体在沼泽中游荡',
  },
  corrupt_spirit: {
    id: 'corrupt_spirit',
    name: '腐化幽灵',
    type: MonsterType.DEMON,
    level: 3,
    stats: {
      health: 40,
      damage: 6,
      defense: 0,
      attackSpeed: 1.2,
      expReward: 18,
      goldReward: { min: 8, max: 15 },
      resists: { fire: 20, cold: 20, lightning: 20, poison: 20 },
    },
    abilities: [],
    lootTable: [],
    zoneId: 'blood-marsh',
    icon: '👻',
    description: '被腐蚀的灵魂生物',
  },
  blood_witch: {
    id: 'blood_witch',
    name: '血腥女巫',
    type: MonsterType.BOSS,
    level: 5,
    stats: {
      health: 200,
      damage: 12,
      defense: 5,
      attackSpeed: 0.7,
      expReward: 80,
      goldReward: { min: 50, max: 100 },
      resists: { fire: 30, cold: 30, lightning: 30, poison: 30 },
    },
    abilities: [
      {
        id: 'witch_curse',
        name: '诅咒',
        description: '降低玩家防御',
        triggerChance: 0.3,
        effectType: 'debuff',
        effectValue: 3,
        cooldown: 5000,
      },
      {
        id: 'witch_heal',
        name: '生命汲取',
        description: '吸取玩家生命',
        triggerChance: 0.15,
        effectType: 'damage',
        effectValue: 8,
        cooldown: 8000,
      },
    ],
    lootTable: [
      { itemId: 'magic_robe', chance: 0.3, minQuantity: 1, maxQuantity: 1 },
    ],
    zoneId: 'blood-marsh',
    icon: '🧙‍♀️',
    description: '鲜血湿地的统治者，使用黑暗魔法',
  },

  // === 黑暗洞穴 怪物 ===
  cave_rat: {
    id: 'cave_rat',
    name: '洞穴鼠',
    type: MonsterType.BEAST,
    level: 3,
    stats: {
      health: 25,
      damage: 5,
      defense: 0,
      attackSpeed: 1.5,
      expReward: 10,
      goldReward: { min: 2, max: 6 },
      resists: { fire: -10, cold: 0, lightning: 0, poison: 10 },
    },
    abilities: [],
    lootTable: [],
    zoneId: 'dark-cave',
    icon: '🐀',
    description: '洞穴中的变异老鼠',
  },
  bat_swarm: {
    id: 'bat_swarm',
    name: '蝙蝠群',
    type: MonsterType.BEAST,
    level: 4,
    stats: {
      health: 60,
      damage: 7,
      defense: 1,
      attackSpeed: 2.0,
      expReward: 20,
      goldReward: { min: 5, max: 10 },
      resists: { fire: -20, cold: 0, lightning: 0, poison: 0 },
    },
    abilities: [],
    lootTable: [],
    zoneId: 'dark-cave',
    icon: '🦇',
    description: '成群结队的吸血蝙蝠',
  },
  shadow_cave: {
    id: 'shadow_cave',
    name: '暗影',
    type: MonsterType.DEMON,
    level: 5,
    stats: {
      health: 70,
      damage: 10,
      defense: 3,
      attackSpeed: 1.0,
      expReward: 30,
      goldReward: { min: 10, max: 20 },
      resists: { fire: 20, cold: 20, lightning: 20, poison: 20 },
    },
    abilities: [
      {
        id: 'shadow_strike',
        name: '暗影打击',
        description: '造成额外伤害',
        triggerChance: 0.25,
        effectType: 'damage',
        effectValue: 5,
        cooldown: 3000,
      },
    ],
    lootTable: [],
    zoneId: 'dark-cave',
    icon: '🌑',
    description: '从黑暗中诞生的暗影生物',
  },
  cave_troll: {
    id: 'cave_troll',
    name: '洞穴巨魔',
    type: MonsterType.BEAST,
    level: 8,
    stats: {
      health: 150,
      damage: 18,
      defense: 8,
      attackSpeed: 0.6,
      expReward: 60,
      goldReward: { min: 20, max: 40 },
      resists: { fire: -20, cold: 20, lightning: 0, poison: 30 },
    },
    abilities: [
      {
        id: 'troll_regen',
        name: '再生',
        description: '缓慢恢复生命',
        triggerChance: 0.1,
        effectType: 'buff',
        effectValue: 5,
        cooldown: 2000,
      },
    ],
    lootTable: [],
    zoneId: 'dark-cave',
    icon: '🧌',
    description: '潜伏在洞穴深处的巨大生物',
  },

  // === 不死族墓穴 怪物 ===
  skeleton_warrior: {
    id: 'skeleton_warrior',
    name: '骷髅战士',
    type: MonsterType.UNDEAD,
    level: 6,
    stats: {
      health: 80,
      damage: 12,
      defense: 5,
      attackSpeed: 0.9,
      expReward: 35,
      goldReward: { min: 12, max: 25 },
      resists: { fire: -10, cold: 30, lightning: 10, poison: 40 },
    },
    abilities: [],
    lootTable: [],
    zoneId: 'undead-crypt',
    icon: '💀',
    description: '穿着铠甲的骷髅战士',
  },
  ghost: {
    id: 'ghost',
    name: '幽灵',
    type: MonsterType.UNDEAD,
    level: 7,
    stats: {
      health: 60,
      damage: 15,
      defense: 0,
      attackSpeed: 1.3,
      expReward: 40,
      goldReward: { min: 15, max: 30 },
      resists: { fire: -30, cold: 50, lightning: 20, poison: 50 },
    },
    abilities: [
      {
        id: 'ghost_phase',
        name: '相位变换',
        description: '回避下一次攻击',
        triggerChance: 0.15,
        effectType: 'buff',
        effectValue: 0,
        cooldown: 10000,
      },
    ],
    lootTable: [],
    zoneId: 'undead-crypt',
    icon: '👻',
    description: '在墓穴中游荡的怨灵',
  },
  mummy: {
    id: 'mummy',
    name: '木乃伊',
    type: MonsterType.UNDEAD,
    level: 9,
    stats: {
      health: 120,
      damage: 16,
      defense: 6,
      attackSpeed: 0.7,
      expReward: 55,
      goldReward: { min: 18, max: 35 },
      resists: { fire: -20, cold: 20, lightning: 20, poison: 80 },
    },
    abilities: [
      {
        id: 'mummy_curse',
        name: '法老诅咒',
        description: '降低玩家攻击力',
        triggerChance: 0.2,
        effectType: 'debuff',
        effectValue: 3,
        cooldown: 6000,
      },
    ],
    lootTable: [],
    zoneId: 'undead-crypt',
    icon: '🧌',
    description: '古老埃及法老的守卫',
  },
  crypt_lord: {
    id: 'crypt_lord',
    name: '墓穴领主',
    type: MonsterType.BOSS,
    level: 12,
    stats: {
      health: 500,
      damage: 25,
      defense: 15,
      attackSpeed: 0.8,
      expReward: 200,
      goldReward: { min: 100, max: 200 },
      resists: { fire: 10, cold: 40, lightning: 20, poison: 60 },
    },
    abilities: [
      {
        id: 'crypt_summon',
        name: '召唤骷髅',
        description: '召唤骷髅助手',
        triggerChance: 0.1,
        effectType: 'summon',
        effectValue: 2,
        cooldown: 15000,
      },
      {
        id: 'crypt_smash',
        name: '重击',
        description: '造成大量伤害',
        triggerChance: 0.2,
        effectType: 'damage',
        effectValue: 15,
        cooldown: 5000,
      },
    ],
    lootTable: [
      { itemId: 'ancient_sword', chance: 0.2, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'cursed_shield', chance: 0.15, minQuantity: 1, maxQuantity: 1 },
    ],
    zoneId: 'undead-crypt',
    icon: '👑',
    description: '不死族墓穴的最高统治者',
  },
}

/**
 * 区域数据
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
    monsters: ['skeleton', 'zombie', 'corrupt_spirit'],
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
    monsters: ['skeleton_warrior', 'ghost', 'mummy'],
    bossId: 'crypt_lord',
    rewards: { goldBonus: 1.5, expBonus: 1.5, lootBonus: 1.3 },
    unlocked: false,
    act: 1,
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
