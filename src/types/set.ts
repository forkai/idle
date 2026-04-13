/**
 * @fileoverview 套装系统类型定义
 */

import type { Element } from './combat'

/**
 * 套装部件接口
 */
export interface SetPiece {
  slot: string
  name: string
  icon: string
}

/**
 * 套装奖励效果
 */
export interface SetBonusEffect {
  strength?: number
  dexterity?: number
  vitality?: number
  energy?: number
  health?: number
  mana?: number
  damage?: number
  defense?: number
  attackSpeed?: number
  critChance?: number
  critDamage?: number
  fireResist?: number
  coldResist?: number
  lightningResist?: number
  poisonResist?: number
  fireDamage?: number
  coldDamage?: number
  lightningDamage?: number
  poisonDamage?: number
  damagePercent?: number
  healthRegenPercent?: number
  allElementDamage?: number
  damageToDragon?: number
  dodge?: number
  deathResist?: number
  onDeathRevive?: number
  freezeChance?: number
}

/**
 * 套装奖励
 */
export interface SetBonus {
  threshold: number
  description: string
  effects: SetBonusEffect
}

/**
 * 套装接口（JSON格式）
 */
export interface SetJson {
  id: string
  name: string
  icon: string
  pieces: SetPiece[]
  bonuses: SetBonus[]
}

/**
 * 玩家已激活的套装效果
 */
export interface ActivatedSetBonus {
  setId: string
  setName: string
  setIcon: string
  activeBonus: SetBonus
}
