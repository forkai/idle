/**
 * @fileoverview 角色创建组件
 * @description 游戏开始时的角色创建界面
 */

'use client'

import { useState } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { CharacterClass, CharacterClassNames, CharacterClassDescriptions } from '@/types/game'
import type { CharacterClass as CharacterClassType } from '@/types/game'

/**
 * 职业选择卡片属性
 */
interface ClassCardProps {
  classId: CharacterClassType
  name: string
  description: string
  icon: string
  selected: boolean
  onClick: () => void
}

/**
 * 职业选择卡片组件
 */
function ClassCard({ classId, name, description, icon, selected, onClick }: ClassCardProps) {
  return (
    <button
      onClick={onClick}
      className={`
        p-4 rounded-lg border-2 transition-all duration-200 text-left
        ${selected
          ? 'border-amber-500 bg-amber-950/30 shadow-lg shadow-amber-500/20'
          : 'border-gray-700 bg-gray-900/50 hover:border-gray-500'
        }
      `}
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="text-4xl">{icon}</span>
        <div>
          <h3 className={`text-lg font-bold ${selected ? 'text-amber-400' : 'text-gray-200'}`}>
            {name}
          </h3>
          <p className="text-xs text-gray-500 uppercase tracking-wider">{classId}</p>
        </div>
      </div>
      <p className="text-sm text-gray-400">{description}</p>
    </button>
  )
}

/**
 * 角色创建组件
 */
export function CharacterCreate() {
  const [name, setName] = useState('')
  const [selectedClass, setSelectedClass] = useState<CharacterClassType>(CharacterClass.WARRIOR)
  const { createCharacter } = useGameStore()

  // 职业数据
  const classes = [
    {
      classId: CharacterClass.WARRIOR,
      name: CharacterClassNames[CharacterClass.WARRIOR],
      description: CharacterClassDescriptions[CharacterClass.WARRIOR],
      icon: '⚔️',
    },
    {
      classId: CharacterClass.SORCERER,
      name: CharacterClassNames[CharacterClass.SORCERER],
      description: CharacterClassDescriptions[CharacterClass.SORCERER],
      icon: '🔥',
    },
    {
      classId: CharacterClass.ROGUE,
      name: CharacterClassNames[CharacterClass.ROGUE],
      description: CharacterClassDescriptions[CharacterClass.ROGUE],
      icon: '🏹',
    },
  ]

  /**
   * 处理角色创建
   */
  const handleCreate = () => {
    if (!name.trim()) {
      alert('请输入角色名称')
      return
    }
    createCharacter(name.trim(), selectedClass)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-500 mb-2 tracking-wider">
            DIABLO IDLE
          </h1>
          <p className="text-gray-500 text-sm">暗黑破坏神风格放置游戏</p>
        </div>

        {/* 角色创建表单 */}
        <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6 shadow-2xl">
          <h2 className="text-xl text-gray-200 font-bold mb-4">创建角色</h2>

          {/* 角色名称输入 */}
          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-2">角色名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="请输入角色名称..."
              maxLength={20}
              className="
                w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg
                text-gray-200 placeholder-gray-500
                focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500
                transition-colors
              "
            />
          </div>

          {/* 职业选择 */}
          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-2">选择职业</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {classes.map((cls) => (
                <ClassCard
                  key={cls.classId}
                  classId={cls.classId}
                  name={cls.name}
                  description={cls.description}
                  icon={cls.icon}
                  selected={selectedClass === cls.classId}
                  onClick={() => setSelectedClass(cls.classId)}
                />
              ))}
            </div>
          </div>

          {/* 职业属性预览 */}
          <div className="mb-6 p-4 bg-gray-950/50 rounded-lg border border-gray-800">
            <h3 className="text-sm text-gray-400 mb-3">初始属性</h3>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-red-500">⚔️</p>
                <p className="text-xs text-gray-500">力量</p>
                <p className="text-sm text-gray-300">
                  {selectedClass === CharacterClass.WARRIOR ? '13' :
                   selectedClass === CharacterClass.SORCERER ? '11' : '12'}
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-500">🏃</p>
                <p className="text-xs text-gray-500">敏捷</p>
                <p className="text-sm text-gray-300">
                  {selectedClass === CharacterClass.WARRIOR ? '12' :
                   selectedClass === CharacterClass.SORCERER ? '12' : '14'}
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-500">💪</p>
                <p className="text-xs text-gray-500">体力</p>
                <p className="text-sm text-gray-300">
                  {selectedClass === CharacterClass.WARRIOR ? '13' :
                   selectedClass === CharacterClass.SORCERER ? '12' : '12'}
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-500">✨</p>
                <p className="text-xs text-gray-500">能量</p>
                <p className="text-sm text-gray-300">
                  {selectedClass === CharacterClass.WARRIOR ? '11' :
                   selectedClass === CharacterClass.SORCERER ? '14' : '12'}
                </p>
              </div>
            </div>
          </div>

          {/* 创建按钮 */}
          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="
              w-full py-3 rounded-lg font-bold text-lg
              bg-gradient-to-b from-red-800 to-red-950
              border-2 border-amber-600
              text-amber-400
              hover:from-red-700 hover:to-red-900
              disabled:from-gray-700 disabled:to-gray-800
              disabled:border-gray-600 disabled:text-gray-500
              transition-all duration-200
              shadow-lg hover:shadow-red-900/50
            "
          >
            开始冒险
          </button>
        </div>

        {/* 底部信息 */}
        <p className="text-center text-gray-600 text-xs mt-6">
          暗黑破坏神风格放置游戏 v0.1.0
        </p>
      </div>
    </div>
  )
}
