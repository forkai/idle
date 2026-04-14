/**
 * @fileoverview 技能数据常量
 * @description 定义游戏中的所有技能数据，包括三大职业的技能树
 */

import type { Skill, SkillTree, SkillTier } from '@/types/skills'
import { CharacterClass } from '@/types/game'
import { SkillType, SkillTarget } from '@/types/skills'
import skillsData from '@/data/skills.json'

/**
 * 从JSON数据获取职业技能
 * @param classId - 职业ID
 * @returns 技能数组
 */
const getSkillsFromJson = (classId: CharacterClass): Skill[] => {
  // JSON使用大写key (WARRIOR, SORCERER, ROGUE)
  const classKey = classId.toUpperCase() as keyof typeof skillsData.classes
  if (!skillsData.classes[classKey]) return []
  const classData = skillsData.classes[classKey]
  return classData.skills.map(skill => ({
    ...skill,
    classId,
    type: SkillType[skill.type as keyof typeof SkillType],
    target: SkillTarget[skill.target as keyof typeof SkillTarget],
  })) as Skill[]
}

/**
 * 根据职业获取技能树
 * @param classId - 职业ID
 * @returns 技能树
 */
export function getSkillTree(classId: CharacterClass): SkillTree {
  const skills = getSkillsFromJson(classId)

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
