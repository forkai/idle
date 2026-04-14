/**
 * @fileoverview 自动探索开关组件
 * @description 切换自动探索模式的开关按钮
 */

'use client'

import { useSettingsStore } from '@/stores/settingsStore'

/**
 * 自动探索开关组件
 */
export function AutoExploreToggle() {
  const { autoExplore, toggleAutoExplore } = useSettingsStore()

  return (
    <button
      onClick={toggleAutoExplore}
      className={`
        relative px-3 py-1.5 rounded-lg border-2 font-bold text-sm
        transition-all duration-200 cursor-pointer
        ${autoExplore.enabled
          ? 'bg-amber-600/20 border-amber-500 text-amber-400 hover:bg-amber-600/30'
          : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-800 hover:border-gray-600'
        }
      `}
      title={autoExplore.enabled ? '关闭自动探索' : '开启自动探索'}
    >
      <span className={autoExplore.enabled ? 'animate-spin-slow' : ''}>🔄</span>
      <span className="ml-1">自动探索</span>
      {autoExplore.enabled && (
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      )}
    </button>
  )
}
