/**
 * @fileoverview 图鉴面板组件
 * @description 展示已发现的装备、怪物、技能，未发现的显示为灰色剪影
 */

'use client'

import { useState } from 'react'
import { useCodexStore } from '@/stores/codexStore'
import { useInventoryStore } from '@/stores/inventoryStore'
import { usePlayerStore } from '@/stores/playerStore'
import { EquipmentSlot, SlotNames, RarityInfo, ItemType } from '@/types/items'
import type { Item } from '@/types/items'
import { MONSTERS } from '@/constants/enemies'
import { getSkillsByClass } from '@/constants/skills'
import { BASE_WEAPONS, BASE_ARMORS, BASE_SHIELDS, BASE_JEWELRY } from '@/constants/items'

type CodexTab = 'equipment' | 'monsters' | 'skills'

/** 装备图鉴项 */
function EquipmentCodexItem({ item, discovered }: { item: Item; discovered: boolean }) {
  const [showDetail, setShowDetail] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => discovered && setShowDetail(true)}
        disabled={!discovered}
        className={`
          w-full aspect-square rounded-lg border-2 flex flex-col items-center justify-center
          transition-all duration-150 cursor-pointer relative
          ${discovered
            ? 'bg-gray-800 hover:scale-105 border-gray-600 hover:border-amber-500/60'
            : 'bg-gray-900/50 border-gray-800 cursor-not-allowed opacity-40 grayscale'
          }
        `}
        style={discovered ? {
          borderColor: RarityInfo[item.rarity]?.color,
          boxShadow: `inset 0 0 8px ${RarityInfo[item.rarity]?.color}33`,
        } : {}}
        title={discovered ? item.name : '???'}
      >
        <span className="text-2xl select-none" style={{ filter: discovered ? 'drop-shadow(0 0 3px black)' : 'grayscale(100%)' }}>
          {discovered ? item.icon : '❓'}
        </span>
        <span className="text-[9px] text-gray-500 mt-0.5">{SlotNames[item.slot!]}</span>
      </button>

      {/* 详情浮层 */}
      {showDetail && discovered && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-in fade-in duration-150">
          <div className="w-72 bg-gray-900 border border-gray-600 rounded-lg shadow-2xl p-4 relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowDetail(false)}
              className="absolute top-2 right-2 w-7 h-7 rounded bg-gray-800 border border-gray-600 text-gray-400 hover:text-white hover:border-gray-500 cursor-pointer transition-all text-sm flex items-center justify-center"
            >
              ✕
            </button>
            <div className="absolute top-0 left-3 right-3 h-px bg-linear-to-r from-transparent via-amber-500 to-transparent opacity-60" />
            <div className="absolute bottom-0 left-3 right-3 h-px bg-linear-to-r from-transparent via-amber-500 to-transparent opacity-60" />

            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-14 h-14 rounded-lg border-2 flex items-center justify-center"
                style={{
                  borderColor: RarityInfo[item.rarity]?.color,
                  boxShadow: `inset 0 0 10px ${RarityInfo[item.rarity]?.color}40`,
                }}
              >
                <span className="text-3xl">{item.icon}</span>
              </div>
              <div>
                <p className="font-bold" style={{ color: RarityInfo[item.rarity]?.color }}>{item.name}</p>
                <span className="text-xs px-1.5 py-0.5 rounded border" style={{ color: RarityInfo[item.rarity]?.color, borderColor: RarityInfo[item.rarity]?.color }}>
                  {RarityInfo[item.rarity]?.name}
                </span>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              {item.stats.damage !== undefined && (
                <p className="text-red-400">⚔️ 伤害 <span className="text-gray-300">+{item.stats.damage}</span></p>
              )}
              {item.stats.defense !== undefined && (
                <p className="text-blue-400">🛡️ 防御 <span className="text-gray-300">+{item.stats.defense}</span></p>
              )}
              {item.stats.health !== undefined && (
                <p className="text-green-400">❤️ 生命 <span className="text-gray-300">+{item.stats.health}</span></p>
              )}
              {item.stats.mana !== undefined && (
                <p className="text-blue-300">💧 法力 <span className="text-gray-300">+{item.stats.mana}</span></p>
              )}
            </div>

            {item.affixes.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-700 space-y-0.5">
                {item.affixes.map((a, i) => (
                  <p key={i} className="text-xs text-amber-300">
                    {a.type === 'prefix' ? '▸' : '◂'} {a.name}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/** 怪物图鉴项 */
function MonsterCodexItem({ monster, discovered }: { monster: any; discovered: boolean }) {
  const [showDetail, setShowDetail] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => discovered && setShowDetail(true)}
        disabled={!discovered}
        className={`
          w-full aspect-square rounded-lg border-2 flex flex-col items-center justify-center
          transition-all duration-150 cursor-pointer
          ${discovered
            ? 'bg-gray-800 hover:scale-105 border-gray-600 hover:border-red-500/60'
            : 'bg-gray-900/50 border-gray-800 cursor-not-allowed opacity-40 grayscale'
          }
        `}
        title={discovered ? monster.name : '???'}
      >
        <span className="text-2xl select-none" style={{ filter: discovered ? '' : 'grayscale(100%)' }}>
          {discovered ? monster.icon : '❓'}
        </span>
        <span className="text-[9px] text-gray-500 mt-0.5">Lv.{monster.level}</span>
      </button>

      {showDetail && discovered && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-in fade-in duration-150">
          <div className="w-72 bg-gray-900 border border-gray-600 rounded-lg shadow-2xl p-4 relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowDetail(false)}
              className="absolute top-2 right-2 w-7 h-7 rounded bg-gray-800 border border-gray-600 text-gray-400 hover:text-white hover:border-gray-500 cursor-pointer transition-all text-sm flex items-center justify-center"
            >
              ✕
            </button>
            <div className="absolute top-0 left-3 right-3 h-px bg-linear-to-r from-transparent via-red-500 to-transparent opacity-60" />
            <div className="absolute bottom-0 left-3 right-3 h-px bg-linear-to-r from-transparent via-red-500 to-transparent opacity-60" />

            <div className="flex items-center gap-3 mb-3">
              <div className="w-14 h-14 rounded-lg border-2 border-red-500/50 flex items-center justify-center bg-red-950/30">
                <span className="text-3xl">{monster.icon}</span>
              </div>
              <div>
                <p className="font-bold text-red-400">{monster.name}</p>
                <p className="text-xs text-gray-400">等级 {monster.level} · {monster.type}</p>
              </div>
            </div>

            {monster.description && (
              <p className="text-xs text-gray-500 italic mb-2">{monster.description}</p>
            )}

            <div className="space-y-1 text-xs">
              <p className="text-red-400">⚔️ 伤害 <span className="text-gray-300">+{monster.stats.damage}</span></p>
              <p className="text-green-400">❤️ 生命 <span className="text-gray-300">+{monster.stats.health}</span></p>
              <p className="text-blue-400">🛡️ 防御 <span className="text-gray-300">+{monster.stats.defense}</span></p>
              <p className="text-amber-400">✨ 经验 <span className="text-gray-300">+{monster.stats.expReward}</span></p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/** 技能图鉴项 */
function SkillCodexItem({ skill, unlocked }: { skill: any; unlocked: boolean }) {
  const [showDetail, setShowDetail] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => unlocked && setShowDetail(true)}
        disabled={!unlocked}
        className={`
          w-full aspect-square rounded-lg border-2 flex flex-col items-center justify-center
          transition-all duration-150 cursor-pointer
          ${unlocked
            ? 'bg-gray-800 hover:scale-105 border-gray-600 hover:border-blue-500/60'
            : 'bg-gray-900/50 border-gray-800 cursor-not-allowed opacity-40 grayscale'
          }
        `}
        title={unlocked ? skill.name : '???'}
      >
        <span className="text-2xl select-none" style={{ filter: unlocked ? '' : 'grayscale(100%)' }}>
          {unlocked ? skill.icon : '❓'}
        </span>
        <span className="text-[9px] text-gray-500 mt-0.5">T{skill.tier}</span>
      </button>

      {showDetail && unlocked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-in fade-in duration-150">
          <div className="w-72 bg-gray-900 border border-gray-600 rounded-lg shadow-2xl p-4 relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowDetail(false)}
              className="absolute top-2 right-2 w-7 h-7 rounded bg-gray-800 border border-gray-600 text-gray-400 hover:text-white hover:border-gray-500 cursor-pointer transition-all text-sm flex items-center justify-center"
            >
              ✕
            </button>
            <div className="absolute top-0 left-3 right-3 h-px bg-linear-to-r from-transparent via-blue-500 to-transparent opacity-60" />
            <div className="absolute bottom-0 left-3 right-3 h-px bg-linear-to-r from-transparent via-blue-500 to-transparent opacity-60" />

            <div className="flex items-center gap-3 mb-3">
              <div className="w-14 h-14 rounded-lg border-2 border-blue-500/50 flex items-center justify-center bg-blue-950/30">
                <span className="text-3xl">{skill.icon}</span>
              </div>
              <div>
                <p className="font-bold text-blue-400">{skill.name}</p>
                <p className="text-xs text-gray-400">
                  {skill.type === 'active' ? '主动' : '被动'} · T{skill.tier}阶
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-300 mb-2">{skill.description}</p>

            <div className="space-y-1 text-xs text-gray-400">
              {skill.cost?.mana !== undefined && (
                <p>💧 消耗: {skill.cost.mana} 法力</p>
              )}
              {skill.cooldown !== undefined && (
                <p>⏱️ 冷却: {skill.cooldown}ms</p>
              )}
              <p>📊 效果: {skill.effects?.map((e: any) => `${e.type}+${e.value}`).join(', ')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * 图鉴面板主组件
 */
export function CodexPanel() {
  const [activeTab, setActiveTab] = useState<CodexTab>('equipment')
  const { discoveredEquipment, isEquipmentDiscovered } = useCodexStore()
  const { discoveredMonsters, isMonsterDiscovered } = useCodexStore()
  const { unlockedSkills, isSkillUnlocked } = useCodexStore()
  const { inventory } = useInventoryStore()
  const { player } = usePlayerStore()

  // 收集背包中所有已知的装备实例（用模板生成）
  const allEquipmentTemplates = [
    ...BASE_WEAPONS.map(w => ({ ...w, id: w.name })),
    ...BASE_ARMORS.map(a => ({ ...a, id: a.name })),
    ...BASE_SHIELDS.map(s => ({ ...s, id: s.name })),
    ...BASE_JEWELRY.map(j => ({ ...j, id: j.name })),
  ].filter(Boolean)

  // 背包中已有装备的ID（用于判断是否发现）
  const discoveredEquipmentIds = new Set<string>()
  inventory.slots.forEach(item => {
    if (item) discoveredEquipmentIds.add(item.id)
  })
  // 也标记直接发现的
  discoveredEquipment.forEach(id => discoveredEquipmentIds.add(id))

  const monsterList = Object.values(MONSTERS)
  const skillList = getSkillsByClass(player.classId)

  const tabs: { id: CodexTab; label: string; icon: string }[] = [
    { id: 'equipment', label: '装备', icon: '⚔️' },
    { id: 'monsters', label: '怪物', icon: '👹' },
    { id: 'skills', label: '技能', icon: '⚡' },
  ]

  return (
    <div className="panel-game overflow-hidden">
      {/* 标题 */}
      <div className="relative px-4 pt-4 pb-3">
        <h2 className="text-lg font-bold text-amber-400 tracking-wider">📖 图鉴</h2>
        <p className="text-xs text-gray-500 mt-0.5">已收集的装备、怪物与技能</p>
      </div>

      {/* 标签切换 */}
      <div className="px-4 mb-3">
        <div className="flex gap-1 bg-gray-950/50 rounded-lg p-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 py-2 rounded-md text-xs font-bold transition-all duration-150 cursor-pointer
                ${activeTab === tab.id
                  ? 'bg-amber-600 text-white'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                }
              `}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 内容区 */}
      <div className="px-4 pb-4">
        {/* 装备图鉴 */}
        {activeTab === 'equipment' && (
          <div>
            <p className="text-xs text-gray-500 mb-2">
              已发现 {discoveredEquipmentIds.size} / {allEquipmentTemplates.length}
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-1">
              {allEquipmentTemplates.map(item => {
                const isDiscovered = discoveredEquipmentIds.has(item.id ?? item.name ?? '')
                return (
                  <EquipmentCodexItem
                    key={item.id ?? item.name}
                    item={item as Item}
                    discovered={isDiscovered}
                  />
                )
              })}
            </div>
          </div>
        )}

        {/* 怪物图鉴 */}
        {activeTab === 'monsters' && (
          <div>
            <p className="text-xs text-gray-500 mb-2">
              已遭遇 {discoveredMonsters.size} / {monsterList.length}
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-1">
              {monsterList.map(monster => (
                <MonsterCodexItem
                  key={monster.id}
                  monster={monster}
                  discovered={isMonsterDiscovered(monster.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* 技能图鉴 */}
        {activeTab === 'skills' && (
          <div>
            <p className="text-xs text-gray-500 mb-2">
              已解锁 {unlockedSkills.size} / {skillList.length}
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-1">
              {skillList.map(skill => (
                <SkillCodexItem
                  key={skill.id}
                  skill={skill}
                  unlocked={isSkillUnlocked(skill.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
