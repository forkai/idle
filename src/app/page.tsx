/**
 * @fileoverview 游戏主页
 * @description 游戏主入口页面，根据状态显示角色创建或游戏主界面
 */

'use client'

import { useEffect, useState } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { CharacterCreate, StatusBar, CombatArea, ZoneSelection, InventoryPanel, SkillsPanel, EquipmentPanel } from '@/components/game'

/**
 * 游戏主页面组件
 */
export default function GamePage() {
  const { player } = useGameStore()
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'zone' | 'inventory' | 'equipment' | 'skills'>('zone')

  // 检查是否有存档
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 100)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">⚔️</p>
          <p className="text-amber-500 font-bold">加载中...</p>
        </div>
      </div>
    )
  }

  if (!player.id) {
    return <CharacterCreate />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 flex flex-col">
      {/* 顶部导航栏 */}
      <header className="bg-gray-900/95 border-b border-gray-800 sticky top-0 z-50 shrink-0">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-sm sm:text-xl font-bold text-amber-500 tracking-wider">
              DIABLO IDLE
            </h1>

            {/* 导航标签（移动端图标模式） */}
            <nav className="flex gap-0.5 sm:gap-1">
              {[
                { id: 'zone', label: '🗺️', labelFull: '探索' },
                { id: 'equipment', label: '⚔️', labelFull: '装备' },
                { id: 'inventory', label: '🎒', labelFull: '背包' },
                { id: 'skills', label: '⚡', labelFull: '技能' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  title={tab.labelFull}
                  className={`
                    flex flex-col sm:flex-row items-center gap-0 sm:gap-1.5
                    px-2 sm:px-3 py-1.5 rounded-md font-medium transition-all text-xs sm:text-sm
                    ${activeTab === tab.id
                      ? 'bg-amber-600 text-white cursor-pointer'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800 cursor-pointer'
                    }
                  `}
                >
                  <span>{tab.label}</span>
                  <span className="hidden sm:inline">{tab.labelFull}</span>
                </button>
              ))}
            </nav>

            <button className="text-gray-400 hover:text-gray-200 transition-colors text-lg cursor-pointer">
              ⚙️
            </button>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="flex-1 w-full px-3 sm:px-4 py-3 sm:py-4">
        {/* 移动端：状态栏折叠为紧凑行 */}
        <div className="lg:hidden mb-3">
          <StatusBar />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4">
          {/* 左侧边栏 - 状态栏（桌面端） */}
          <aside className="hidden lg:block lg:col-span-3 xl:col-span-2">
            <StatusBar />
          </aside>

          {/* 中间主区域 */}
          <section className="col-span-12 lg:col-span-6 xl:col-span-8">
            {activeTab === 'zone' && <CombatArea />}
            {activeTab === 'inventory' && <InventoryPanel />}
            {activeTab === 'equipment' && <EquipmentPanel />}
            {activeTab === 'skills' && <SkillsPanel />}
          </section>

          {/* 右侧边栏 - 区域选择（桌面端） */}
          <aside className="hidden lg:block lg:col-span-3 xl:col-span-2">
            {activeTab === 'zone' && <ZoneSelection />}
          </aside>
        </div>

        {/* 移动端：区域选择显示在战斗区下方 */}
        <div className="lg:hidden mt-4">
          {activeTab === 'zone' && <ZoneSelection />}
        </div>
      </main>

      {/* 底部信息栏 */}
      <footer className="bg-gray-900/95 border-t border-gray-800 shrink-0">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between text-[10px] sm:text-xs text-gray-500">
            <span>v0.1.0</span>
            <span>自动保存</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
