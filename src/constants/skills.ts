/**
 * @fileoverview 技能数据常量
 * @description 定义游戏中的所有技能数据，包括三大职业的技能树
 */

import type { Skill, SkillTree, SkillTier } from '@/types/skills'
import { CharacterClass } from '@/types/game'
import { Element } from '@/types/combat'
import { SkillType, SkillTarget } from '@/types/skills'

/**
 * 战士技能列表
 */
const WARRIOR_SKILLS: Skill[] = [
  // 第一层技能 (Lv.1)
  {
    id: 'warrior_slash',
    name: '重砍',
    classId: CharacterClass.WARRIOR,
    type: SkillType.ACTIVE,
    icon: '⚔️',
    description: '用武器猛力砍击敌人，造成100%武器伤害。',
    effects: [{ type: 'damage', value: 1.0, element: Element.PHYSICAL }],
    cost: { mana: 5 },
    cooldown: 1000,
    target: SkillTarget.SINGLE_ENEMY,
    tier: 1,
    requiredLevel: 1,
    prerequisites: [],
    maxLevel: 10,
    synergies: [
      { skillId: 'warrior_cleave', name: '顺劈协同', icon: '🪓', description: '顺劈提高重砍伤害', bonus: 0.05 },
      { skillId: 'warrior_heavy_strike', name: '重击协同', icon: '💥', description: '重击提高重砍伤害', bonus: 0.05 },
    ],
  },
  {
    id: 'warrior_block',
    name: '格挡',
    classId: CharacterClass.WARRIOR,
    type: SkillType.ACTIVE,
    icon: '🛡️',
    description: '举起盾牌格挡，减少受到的伤害。',
    effects: [{ type: 'buff', value: 20, duration: 3000 }],
    cost: { mana: 8 },
    cooldown: 5000,
    target: SkillTarget.SELF,
    tier: 1,
    requiredLevel: 1,
    prerequisites: [],
    maxLevel: 10,
  },
  // 第二层技能 (Lv.6)
  {
    id: 'warrior_cleave',
    name: '顺劈',
    classId: CharacterClass.WARRIOR,
    type: SkillType.ACTIVE,
    icon: '🪓',
    description: '挥动武器，对范围内所有敌人造成伤害。',
    effects: [{ type: 'damage', value: 0.8, element: Element.PHYSICAL }],
    cost: { mana: 12 },
    cooldown: 2000,
    target: SkillTarget.AOE_ENEMY,
    tier: 2,
    requiredLevel: 6,
    prerequisites: ['warrior_slash'],
    maxLevel: 10,
    synergies: [
      { skillId: 'warrior_slash', name: '重砍协同', icon: '⚔️', description: '重砍提高顺劈伤害', bonus: 0.05 },
      { skillId: 'warrior_whirlwind', name: '旋风斩协同', icon: '🌀', description: '旋风斩提高顺劈伤害', bonus: 0.08 },
    ],
  },
  {
    id: 'warrior_battle_orders',
    name: '战斗号令',
    classId: CharacterClass.WARRIOR,
    type: SkillType.AURA,
    icon: '📢',
    description: '激活光环，增加范围内队友的所有属性。',
    effects: [{ type: 'buff', value: 0.1, duration: 10000 }],
    cost: { mana: 20 },
    cooldown: 30000,
    target: SkillTarget.AOE_ALLY,
    tier: 2,
    requiredLevel: 6,
    prerequisites: [],
    maxLevel: 5,
  },
  // 第三层技能 (Lv.12)
  {
    id: 'warrior_heavy_strike',
    name: '重击',
    classId: CharacterClass.WARRIOR,
    type: SkillType.ACTIVE,
    icon: '💥',
    description: '全力重击，造成150%伤害并有几率击晕敌人。',
    effects: [{ type: 'damage', value: 1.5, element: Element.PHYSICAL }],
    cost: { mana: 15 },
    cooldown: 3000,
    target: SkillTarget.SINGLE_ENEMY,
    tier: 3,
    requiredLevel: 12,
    prerequisites: ['warrior_slash', 'warrior_cleave'],
    maxLevel: 10,
    synergies: [
      { skillId: 'warrior_slash', name: '重砍协同', icon: '⚔️', description: '重砍增加重击伤害', bonus: 0.05 },
      { skillId: 'warrior_berserk', name: '狂暴协同', icon: '😤', description: '狂暴增加重击伤害', bonus: 0.1 },
    ],
  },
  {
    id: 'warrior_find_item',
    name: '探查物品',
    classId: CharacterClass.WARRIOR,
    type: SkillType.ACTIVE,
    icon: '🔍',
    description: '仔细搜索敌人尸体，提高掉落物品几率。',
    effects: [{ type: 'buff', value: 0.5, duration: 5000 }],
    cost: { mana: 10 },
    cooldown: 10000,
    target: SkillTarget.SELF,
    tier: 3,
    requiredLevel: 12,
    prerequisites: [],
    maxLevel: 5,
  },
  // 第四层技能 (Lv.18)
  {
    id: 'warrior_whirlwind',
    name: '旋风斩',
    classId: CharacterClass.WARRIOR,
    type: SkillType.ACTIVE,
    icon: '🌀',
    description: '高速旋转攻击，对周围所有敌人造成连续伤害。',
    effects: [{ type: 'damage', value: 0.6, element: Element.PHYSICAL }],
    cost: { mana: 25, health: 10 },
    cooldown: 5000,
    target: SkillTarget.AOE_ENEMY,
    tier: 4,
    requiredLevel: 18,
    prerequisites: ['warrior_cleave', 'warrior_heavy_strike'],
    maxLevel: 10,
    synergies: [
      { skillId: 'warrior_cleave', name: '顺劈协同', icon: '🪓', description: '顺劈增加旋风斩伤害', bonus: 0.08 },
      { skillId: 'warrior_berserk', name: '狂暴协同', icon: '😤', description: '狂暴增加旋风斩伤害', bonus: 0.1 },
    ],
  },
  {
    id: 'warrior_increased_endurance',
    name: '增强耐力',
    classId: CharacterClass.WARRIOR,
    type: SkillType.PASSIVE,
    icon: '💪',
    description: '被动增加最大生命值和生命恢复速度。',
    effects: [{ type: 'buff', value: 0.15 }],
    cost: { mana: 0 },
    cooldown: 0,
    target: SkillTarget.SELF,
    tier: 4,
    requiredLevel: 18,
    prerequisites: ['warrior_battle_orders'],
    maxLevel: 5,
  },
  // 第五层技能 (Lv.24)
  {
    id: 'warrior_berserk',
    name: '狂暴',
    classId: CharacterClass.WARRIOR,
    type: SkillType.ACTIVE,
    icon: '😤',
    description: '进入狂暴状态，大幅提升攻击力和攻击速度，但受到的伤害也增加。',
    effects: [{ type: 'buff', value: 0.5, duration: 10000 }],
    cost: { mana: 30, health: 20 },
    cooldown: 60000,
    target: SkillTarget.SELF,
    tier: 5,
    requiredLevel: 24,
    prerequisites: ['warrior_whirlwind', 'warrior_increased_endurance'],
    maxLevel: 5,
    synergies: [
      { skillId: 'warrior_heavy_strike', name: '重击协同', icon: '💥', description: '重击增强狂暴效果', bonus: 0.1 },
      { skillId: 'warrior_whirlwind', name: '旋风斩协同', icon: '🌀', description: '旋风斩增强狂暴效果', bonus: 0.08 },
    ],
  },
  {
    id: 'warrior_weapon_mastery',
    name: '武器大师',
    classId: CharacterClass.WARRIOR,
    type: SkillType.PASSIVE,
    icon: '🏆',
    description: '被动增加所有武器的伤害和暴击率。',
    effects: [{ type: 'buff', value: 0.2 }],
    cost: { mana: 0 },
    cooldown: 0,
    target: SkillTarget.SELF,
    tier: 5,
    requiredLevel: 24,
    prerequisites: ['warrior_heavy_strike'],
    maxLevel: 5,
    synergies: [
      { skillId: 'warrior_slash', name: '重砍协同', icon: '⚔️', description: '重砍增加武器大师收益', bonus: 0.05 },
      { skillId: 'warrior_cleave', name: '顺劈协同', icon: '🪓', description: '顺劈增加武器大师收益', bonus: 0.05 },
      { skillId: 'warrior_heavy_strike', name: '重击协同', icon: '💥', description: '重击增加武器大师收益', bonus: 0.08 },
    ],
  },
]

/**
 * 法师技能列表
 */
const SORCERER_SKILLS: Skill[] = [
  // 第一层技能 (Lv.1)
  {
    id: 'sorcerer_fireball',
    name: '火球术',
    classId: CharacterClass.SORCERER,
    type: SkillType.ACTIVE,
    icon: '🔥',
    description: '发射一个火球攻击敌人，造成火焰伤害。',
    effects: [{ type: 'damage', value: 1.2, element: Element.FIRE }],
    cost: { mana: 8 },
    cooldown: 1500,
    target: SkillTarget.SINGLE_ENEMY,
    tier: 1,
    requiredLevel: 1,
    prerequisites: [],
    maxLevel: 10,
    synergies: [
      { skillId: 'sorcerer_lightning', name: '闪电协同', icon: '⚡', description: '闪电链提高火球伤害', bonus: 0.05 },
      { skillId: 'sorcerer_meteor', name: '陨石协同', icon: '☄️', description: '陨石术提高火球伤害', bonus: 0.08 },
    ],
  },
  {
    id: 'sorcerer_chill',
    name: '寒冰弹',
    classId: CharacterClass.SORCERER,
    type: SkillType.ACTIVE,
    icon: '❄️',
    description: '发射寒冰弹攻击敌人，造成冰冷伤害并减速。',
    effects: [{ type: 'damage', value: 0.8, element: Element.COLD }],
    cost: { mana: 6 },
    cooldown: 1200,
    target: SkillTarget.SINGLE_ENEMY,
    tier: 1,
    requiredLevel: 1,
    prerequisites: [],
    maxLevel: 10,
    synergies: [
      { skillId: 'sorcerer_frost_nova', name: '冰霜协同', icon: '🌨️', description: '冰霜新星提高寒冰弹伤害', bonus: 0.05 },
      { skillId: 'sorcerer_blizzard', name: '暴风雪协同', icon: '❄️', description: '暴风雪提高寒冰弹伤害', bonus: 0.08 },
    ],
  },
  // 第二层技能 (Lv.6)
  {
    id: 'sorcerer_lightning',
    name: '闪电链',
    classId: CharacterClass.SORCERER,
    type: SkillType.ACTIVE,
    icon: '⚡',
    description: '释放闪电，在敌人之间弹跳。',
    effects: [{ type: 'damage', value: 0.7, element: Element.LIGHTNING }],
    cost: { mana: 12 },
    cooldown: 2000,
    target: SkillTarget.AOE_ENEMY,
    tier: 2,
    requiredLevel: 6,
    prerequisites: ['sorcerer_fireball'],
    maxLevel: 10,
    synergies: [
      { skillId: 'sorcerer_fireball', name: '火球协同', icon: '🔥', description: '火球术提高闪电链伤害', bonus: 0.05 },
    ],
  },
  {
    id: 'sorcerer_frost_nova',
    name: '冰霜新星',
    classId: CharacterClass.SORCERER,
    type: SkillType.ACTIVE,
    icon: '🌨️',
    description: '在周围产生冰霜爆发，伤害并冻结所有敌人。',
    effects: [{ type: 'damage', value: 0.6, element: Element.COLD }],
    cost: { mana: 18 },
    cooldown: 8000,
    target: SkillTarget.AOE_ENEMY,
    tier: 2,
    requiredLevel: 6,
    prerequisites: ['sorcerer_chill'],
    maxLevel: 10,
  },
  // 第三层技能 (Lv.12)
  {
    id: 'sorcerer_poison',
    name: '剧毒新星',
    classId: CharacterClass.SORCERER,
    type: SkillType.ACTIVE,
    icon: '☠️',
    description: '释放毒素，对范围内敌人造成持续毒素伤害。',
    effects: [{ type: 'damage', value: 0.5, element: Element.POISON }],
    cost: { mana: 15 },
    cooldown: 3000,
    target: SkillTarget.AOE_ENEMY,
    tier: 3,
    requiredLevel: 12,
    prerequisites: ['sorcerer_lightning'],
    maxLevel: 10,
    synergies: [
      { skillId: 'sorcerer_lightning', name: '闪电协同', icon: '⚡', description: '闪电链提高毒素伤害', bonus: 0.05 },
    ],
  },
  {
    id: 'sorcerer_teleport',
    name: '传送',
    classId: CharacterClass.SORCERER,
    type: SkillType.ACTIVE,
    icon: '✨',
    description: '瞬间移动到指定位置。',
    effects: [{ type: 'buff', value: 0, duration: 0 }],
    cost: { mana: 25 },
    cooldown: 5000,
    target: SkillTarget.SELF,
    tier: 3,
    requiredLevel: 12,
    prerequisites: [],
    maxLevel: 5,
  },
  // 第四层技能 (Lv.18)
  {
    id: 'sorcerer_fire_mastery',
    name: '火焰精通',
    classId: CharacterClass.SORCERER,
    type: SkillType.PASSIVE,
    icon: '🔥',
    description: '被动增加火焰伤害和火焰抗性。',
    effects: [{ type: 'buff', value: 0.2 }],
    cost: { mana: 0 },
    cooldown: 0,
    target: SkillTarget.SELF,
    tier: 4,
    requiredLevel: 18,
    prerequisites: ['sorcerer_fireball', 'sorcerer_lightning'],
    maxLevel: 5,
    synergies: [
      { skillId: 'sorcerer_fireball', name: '火球协同', icon: '🔥', description: '火球术增强火焰精通效果', bonus: 0.05 },
      { skillId: 'sorcerer_meteor', name: '陨石协同', icon: '☄️', description: '陨石术增强火焰精通效果', bonus: 0.1 },
    ],
  },
  {
    id: 'sorcerer_cold_mastery',
    name: '寒冰精通',
    classId: CharacterClass.SORCERER,
    type: SkillType.PASSIVE,
    icon: '❄️',
    description: '被动增加冰冷伤害和冰冷抗性。',
    effects: [{ type: 'buff', value: 0.2 }],
    cost: { mana: 0 },
    cooldown: 0,
    target: SkillTarget.SELF,
    tier: 4,
    requiredLevel: 18,
    prerequisites: ['sorcerer_chill', 'sorcerer_frost_nova'],
    maxLevel: 5,
    synergies: [
      { skillId: 'sorcerer_chill', name: '寒冰弹协同', icon: '❄️', description: '寒冰弹增强寒冰精通效果', bonus: 0.05 },
      { skillId: 'sorcerer_blizzard', name: '暴风雪协同', icon: '🌨️', description: '暴风雪增强寒冰精通效果', bonus: 0.1 },
    ],
  },
  // 第五层技能 (Lv.24)
  {
    id: 'sorcerer_meteor',
    name: '陨石术',
    classId: CharacterClass.SORCERER,
    type: SkillType.ACTIVE,
    icon: '☄️',
    description: '召唤陨石坠落，造成大量火焰伤害。',
    effects: [{ type: 'damage', value: 2.5, element: Element.FIRE }],
    cost: { mana: 40 },
    cooldown: 15000,
    target: SkillTarget.AOE_ENEMY,
    tier: 5,
    requiredLevel: 24,
    prerequisites: ['sorcerer_fire_mastery'],
    maxLevel: 10,
    synergies: [
      { skillId: 'sorcerer_fireball', name: '火球协同', icon: '🔥', description: '火球术增强陨石伤害', bonus: 0.05 },
    ],
  },
  {
    id: 'sorcerer_blizzard',
    name: '暴风雪',
    classId: CharacterClass.SORCERER,
    type: SkillType.ACTIVE,
    icon: '🌨️',
    description: '召唤持续暴风雪，对范围内敌人造成大量冰冷伤害。',
    effects: [{ type: 'damage', value: 0.4, element: Element.COLD }],
    cost: { mana: 35 },
    cooldown: 12000,
    target: SkillTarget.AOE_ENEMY,
    tier: 5,
    requiredLevel: 24,
    prerequisites: ['sorcerer_cold_mastery'],
    maxLevel: 10,
    synergies: [
      { skillId: 'sorcerer_chill', name: '寒冰弹协同', icon: '❄️', description: '寒冰弹增强暴风雪伤害', bonus: 0.05 },
      { skillId: 'sorcerer_frost_nova', name: '冰霜协同', icon: '🌨️', description: '冰霜新星增强暴风雪伤害', bonus: 0.08 },
    ],
  },
]

/**
 * 刺客技能列表
 */
const ROGUE_SKILLS: Skill[] = [
  // 第一层技能 (Lv.1)
  {
    id: 'rogue_arrow',
    name: '箭矢',
    classId: CharacterClass.ROGUE,
    type: SkillType.ACTIVE,
    icon: '🏹',
    description: '射出一支箭攻击敌人。',
    effects: [{ type: 'damage', value: 1.0, element: Element.PHYSICAL }],
    cost: { mana: 4 },
    cooldown: 800,
    target: SkillTarget.SINGLE_ENEMY,
    tier: 1,
    requiredLevel: 1,
    prerequisites: [],
    maxLevel: 10,
    synergies: [
      { skillId: 'rogue_multiple_shot', name: '多重射击协同', icon: '🎯', description: '多重射击增强箭矢伤害', bonus: 0.05 },
      { skillId: 'rogue_critical_shot', name: '致命射击协同', icon: '💀', description: '致命射击增强箭矢伤害', bonus: 0.08 },
    ],
  },
  {
    id: 'rogue_dagger',
    name: '飞刀',
    classId: CharacterClass.ROGUE,
    type: SkillType.ACTIVE,
    icon: '🗡️',
    description: '投掷飞刀攻击敌人，伤害高但需要冷却。',
    effects: [{ type: 'damage', value: 1.5, element: Element.PHYSICAL }],
    cost: { mana: 8 },
    cooldown: 2000,
    target: SkillTarget.SINGLE_ENEMY,
    tier: 1,
    requiredLevel: 1,
    prerequisites: [],
    maxLevel: 10,
    synergies: [
      { skillId: 'rogue_evade', name: '闪避协同', icon: '💨', description: '闪避增强飞刀伤害', bonus: 0.05 },
    ],
  },
  // 第二层技能 (Lv.6)
  {
    id: 'rogue_multiple_shot',
    name: '多重射击',
    classId: CharacterClass.ROGUE,
    type: SkillType.ACTIVE,
    icon: '🎯',
    description: '同时射出多支箭，攻击多个敌人。',
    effects: [{ type: 'damage', value: 0.5, element: Element.PHYSICAL }],
    cost: { mana: 12 },
    cooldown: 3000,
    target: SkillTarget.AOE_ENEMY,
    tier: 2,
    requiredLevel: 6,
    prerequisites: ['rogue_arrow'],
    maxLevel: 10,
    synergies: [
      { skillId: 'rogue_arrow', name: '箭矢协同', icon: '🏹', description: '箭矢增强多重射击伤害', bonus: 0.05 },
      { skillId: 'rogue_critical_shot', name: '致命射击协同', icon: '💀', description: '致命射击增强多重射击伤害', bonus: 0.08 },
    ],
  },
  {
    id: 'rogue_trap',
    name: '陷阱',
    classId: CharacterClass.ROGUE,
    type: SkillType.ACTIVE,
    icon: '⚙️',
    description: '在当前位置设置陷阱，敌人触发时造成伤害。',
    effects: [{ type: 'damage', value: 1.0, element: Element.PHYSICAL }],
    cost: { mana: 15 },
    cooldown: 10000,
    target: SkillTarget.AOE_ENEMY,
    tier: 2,
    requiredLevel: 6,
    prerequisites: [],
    maxLevel: 5,
    synergies: [
      { skillId: 'rogue_poison_arrow', name: '毒箭协同', icon: '🏹', description: '毒箭增强陷阱伤害', bonus: 0.05 },
    ],
  },
  // 第三层技能 (Lv.12)
  {
    id: 'rogue_poison_arrow',
    name: '毒箭',
    classId: CharacterClass.ROGUE,
    type: SkillType.ACTIVE,
    icon: '🏹',
    description: '射出一支涂毒的箭，造成持续毒素伤害。',
    effects: [{ type: 'damage', value: 0.6, element: Element.POISON }],
    cost: { mana: 10 },
    cooldown: 2000,
    target: SkillTarget.SINGLE_ENEMY,
    tier: 3,
    requiredLevel: 12,
    prerequisites: ['rogue_arrow', 'rogue_trap'],
    maxLevel: 10,
    synergies: [
      { skillId: 'rogue_trap', name: '陷阱协同', icon: '⚙️', description: '陷阱增强毒箭伤害', bonus: 0.05 },
    ],
  },
  {
    id: 'rogue_evade',
    name: '闪避',
    classId: CharacterClass.ROGUE,
    type: SkillType.ACTIVE,
    icon: '💨',
    description: '快速闪避攻击，有几率完全躲避伤害。',
    effects: [{ type: 'buff', value: 0.3, duration: 3000 }],
    cost: { mana: 12 },
    cooldown: 8000,
    target: SkillTarget.SELF,
    tier: 3,
    requiredLevel: 12,
    prerequisites: [],
    maxLevel: 5,
    synergies: [
      { skillId: 'rogue_dagger', name: '飞刀协同', icon: '🗡️', description: '飞刀增强闪避效果', bonus: 0.05 },
      { skillId: 'rogue_stealth', name: '隐身协同', icon: '👻', description: '隐身增强闪避效果', bonus: 0.08 },
    ],
  },
  // 第四层技能 (Lv.18)
  {
    id: 'rogue_critical_shot',
    name: '致命射击',
    classId: CharacterClass.ROGUE,
    type: SkillType.ACTIVE,
    icon: '💀',
    description: '精准瞄准，造成致命伤害，必定暴击。',
    effects: [{ type: 'damage', value: 2.0, element: Element.PHYSICAL }],
    cost: { mana: 20 },
    cooldown: 5000,
    target: SkillTarget.SINGLE_ENEMY,
    tier: 4,
    requiredLevel: 18,
    prerequisites: ['rogue_multiple_shot', 'rogue_poison_arrow'],
    maxLevel: 10,
    synergies: [
      { skillId: 'rogue_arrow', name: '箭矢协同', icon: '🏹', description: '箭矢增强致命射击伤害', bonus: 0.05 },
      { skillId: 'rogue_exploding_arrow', name: '爆炸箭协同', icon: '💥', description: '爆炸箭增强致命射击伤害', bonus: 0.08 },
    ],
  },
  {
    id: 'rogue_stealth',
    name: '隐身',
    classId: CharacterClass.ROGUE,
    type: SkillType.ACTIVE,
    icon: '👻',
    description: '进入隐身状态，敌人无法发现你。',
    effects: [{ type: 'buff', value: 0, duration: 5000 }],
    cost: { mana: 25 },
    cooldown: 30000,
    target: SkillTarget.SELF,
    tier: 4,
    requiredLevel: 18,
    prerequisites: ['rogue_evade'],
    maxLevel: 5,
    synergies: [
      { skillId: 'rogue_evade', name: '闪避协同', icon: '💨', description: '闪避增强隐身效果', bonus: 0.05 },
    ],
  },
  // 第五层技能 (Lv.24)
  {
    id: 'rogue_exploding_arrow',
    name: '爆炸箭',
    classId: CharacterClass.ROGUE,
    type: SkillType.ACTIVE,
    icon: '💥',
    description: '射出一支爆炸箭，造成范围火焰伤害。',
    effects: [{ type: 'damage', value: 1.8, element: Element.FIRE }],
    cost: { mana: 25 },
    cooldown: 8000,
    target: SkillTarget.AOE_ENEMY,
    tier: 5,
    requiredLevel: 24,
    prerequisites: ['rogue_critical_shot', 'rogue_stealth'],
    maxLevel: 10,
    synergies: [
      { skillId: 'rogue_arrow', name: '箭矢协同', icon: '🏹', description: '箭矢增强爆炸箭伤害', bonus: 0.05 },
      { skillId: 'rogue_multiple_shot', name: '多重射击协同', icon: '🎯', description: '多重射击增强爆炸箭伤害', bonus: 0.08 },
    ],
  },
  {
    id: 'rogue_markmanship',
    name: '箭术精通',
    classId: CharacterClass.ROGUE,
    type: SkillType.PASSIVE,
    icon: '🎯',
    description: '被动增加远程攻击伤害和暴击率。',
    effects: [{ type: 'buff', value: 0.25 }],
    cost: { mana: 0 },
    cooldown: 0,
    target: SkillTarget.SELF,
    tier: 5,
    requiredLevel: 24,
    prerequisites: ['rogue_multiple_shot', 'rogue_critical_shot'],
    maxLevel: 5,
    synergies: [
      { skillId: 'rogue_arrow', name: '箭矢协同', icon: '🏹', description: '箭矢增强箭术精通效果', bonus: 0.05 },
      { skillId: 'rogue_critical_shot', name: '致命射击协同', icon: '💀', description: '致命射击增强箭术精通效果', bonus: 0.08 },
      { skillId: 'rogue_exploding_arrow', name: '爆炸箭协同', icon: '💥', description: '爆炸箭增强箭术精通效果', bonus: 0.1 },
    ],
  },
]

/**
 * 根据职业获取技能树
 * @param classId - 职业ID
 * @returns 技能树
 */
export function getSkillTree(classId: CharacterClass): SkillTree {
  let skills: Skill[]

  switch (classId) {
    case CharacterClass.WARRIOR:
      skills = WARRIOR_SKILLS
      break
    case CharacterClass.SORCERER:
      skills = SORCERER_SKILLS
      break
    case CharacterClass.ROGUE:
      skills = ROGUE_SKILLS
      break
    default:
      skills = []
  }

  // 按层组织技能
  const tierMap = new Map<number, Skill[]>()

  for (const skill of skills) {
    const tier = skill.tier
    if (!tierMap.has(tier)) {
      tierMap.set(tier, [])
    }
    tierMap.get(tier)!.push(skill)
  }

  const tiers: SkillTier[] = Array.from(tierMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([tierNum, tierSkills]) => ({
      level: tierNum * 6,
      requiredLevel: tierNum * 6,
      skills: tierSkills,
    }))

  const classNames: Record<CharacterClass, string> = {
    [CharacterClass.WARRIOR]: '战士技能树',
    [CharacterClass.SORCERER]: '法师技能树',
    [CharacterClass.ROGUE]: '刺客技能树',
  }

  return {
    classId,
    name: classNames[classId],
    tiers,
  }
}

/**
 * 获取职业的所有技能
 * @param classId - 职业ID
 * @returns 技能数组
 */
export function getSkillsByClass(classId: CharacterClass): Skill[] {
  const tree = getSkillTree(classId)
  return tree.tiers.flatMap(t => t.skills)
}

/**
 * 根据ID获取技能
 * @param skillId - 技能ID
 * @returns 技能
 */
export function getSkillById(skillId: string): Skill | null {
  for (const classId of Object.values(CharacterClass)) {
    const skills = getSkillsByClass(classId)
    const skill = skills.find(s => s.id === skillId)
    if (skill) return skill
  }
  return null
}

/**
 * 检查技能是否可解锁
 * @param skill - 技能
 * @param playerLevel - 玩家等级
 * @param unlockedSkills - 已解锁技能ID列表
 * @returns 是否可解锁
 */
export function canUnlockSkill(skill: Skill, playerLevel: number, unlockedSkills: string[]): boolean {
  if (playerLevel < skill.requiredLevel) return false
  for (const prereq of skill.prerequisites) {
    if (!unlockedSkills.includes(prereq)) return false
  }
  return true
}

/**
 * 获取技能解锁所需的前置技能
 * @param skill - 技能
 * @returns 前置技能列表
 */
export function getSkillPrerequisites(skill: Skill): Skill[] {
  return skill.prerequisites.map(id => getSkillById(id)).filter((s): s is Skill => s !== null)
}
