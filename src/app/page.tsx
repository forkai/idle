/**
 * @fileoverview 游戏主页
 * @description 游戏主入口页面，根据状态显示角色创建或游戏主界面
 */

'use client'

import { useEffect, useState } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { CharacterCreate, StatusBar, CombatArea, ZoneSelection } from '@/components/game'

/**
 * 游戏主页面组件
 */
export default function GamePage() {
  const { player } = useGameStore()
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'zone' | 'inventory' | 'skills'>('zone')

  // 检查是否有存档
  useEffect(() => {
    // 延迟检查以确保store已恢复
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  // 加载中状态
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

  // 没有角色，显示创建界面
  if (!player.id) {
    return <CharacterCreate />
  }

  // 游戏主界面
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
      {/* 顶部状态栏 */}
      <header className="bg-gray-900/95 border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* 标题 */}
            <h1 className="text-xl font-bold text-amber-500 tracking-wider">
              DIABLO IDLE
            </h1>

            {/* 导航标签 */}
            <nav className="flex gap-1">
              {[
                { id: 'zone', label: '🗺️ 探索' },
                { id: 'inventory', label: '🎒 背包' },
                { id: 'skills', label: '⚡ 技能' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`
                    px-4 py-2 rounded-lg font-medium transition-all
                    ${activeTab === tab.id
                      ? 'bg-amber-600 text-white'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* 设置按钮 */}
            <button className="text-gray-400 hover:text-gray-200 transition-colors">
              ⚙️
            </button>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 左侧边栏 - 状态栏 */}
          <aside className="lg:col-span-3">
            <StatusBar />
          </aside>

          {/* 中间主区域 */}
          <section className="lg:col-span-6">
            {activeTab === 'zone' && <CombatArea />}
            {activeTab === 'inventory' && (
              <div className="bg-gray-900/95 border border-gray-700 rounded-lg p-4">
                <h2 className="text-lg font-bold text-gray-200 mb-4">🎒 背包</h2>
                <p className="text-gray-400 text-center py-8">
                  背包功能开发中...
                </p>
              </div>
            )}
            {activeTab === 'skills' && (
              <div className="bg-gray-900/95 border border-gray-700 rounded-lg p-4">
                <h2 className="text-lg font-bold text-gray-200 mb-4">⚡ 技能</h2>
                <p className="text-gray-400 text-center py-8">
                  技能系统开发中...
                </p>
              </div>
            )}
          </section>

          {/* 右侧边栏 - 区域选择 */}
          <aside className="lg:col-span-3">
            {activeTab === 'zone' && <ZoneSelection />}
          </aside>
        </div>
      </main>

      {/* 底部信息栏 */}
      <footer className="bg-gray-900/95 border-t border-gray-800 mt-6">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>暗黑破坏神风格放置游戏 v0.1.0</span>
            <span>自动保存已开启</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
