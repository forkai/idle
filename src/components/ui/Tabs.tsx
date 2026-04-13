/**
 * @fileoverview Tabs 标签页组件
 * @description 用于切换不同面板内容（背包/装备/技能等分页）
 *
 * @example
 * <Tabs
 *   tabs={[
 *     { key: 'inventory', label: '背包', icon: '🎒' },
 *     { key: 'equipment', label: '装备', icon: '⚔️' },
 *     { key: 'skills', label: '技能', icon: '✨' },
 *   ]}
 *   activeKey="inventory"
 *   onChange={setActiveTab}
 * />
 */

import React from 'react'

/**
 * 单个Tab定义
 */
export interface TabItem {
  /** 唯一标识符 */
  key: string
  /** 显示标签 */
  label: string
  /** 左侧图标（emoji） */
  icon?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 徽章数字（未读数等） */
  badge?: number
}

/**
 * Tabs 样式变体
 * - line: 下划线式（轻量，适合内页导航）
 * - pill: 胶囊式（适合切换面板）
 */
export type TabsVariant = 'line' | 'pill'

/**
 * Tabs 组件属性
 */
export interface TabsProps {
  /** Tab列表 */
  tabs: TabItem[]
  /** 当前激活的Tab key */
  activeKey: string
  /** 切换回调 */
  onChange: (key: string) => void
  /** 样式变体 */
  variant?: TabsVariant
  /** 额外CSS类 */
  className?: string
}

/**
 * 标签页组件
 * 遵循游戏暗黑风格，支持图标、禁用、徽章
 */
export function Tabs({
  tabs,
  activeKey,
  onChange,
  variant = 'pill',
  className = '',
}: TabsProps) {
  return (
    <div
      className={`
        flex gap-1
        ${variant === 'line' ? 'border-b border-gray-700 pb-0' : 'bg-gray-800/50 rounded-lg p-1'}
        ${className}
      `}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeKey

        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={isActive}
            disabled={tab.disabled}
            onClick={() => !tab.disabled && onChange(tab.key)}
            className={`
              relative flex items-center gap-1.5
              text-sm font-medium
              transition-all duration-150
              disabled:cursor-not-allowed disabled:opacity-40
              outline-none
              ${variant === 'pill'
                ? `
                    px-3 py-1.5 rounded-md flex-1 justify-center
                    ${isActive
                      ? 'bg-amber-700/80 text-amber-200 shadow-sm'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
                    }
                  `
                : `
                    px-3 py-2
                    ${isActive
                      ? 'text-amber-400 border-b-2 border-amber-500'
                      : 'text-gray-400 hover:text-gray-200 border-b-2 border-transparent'
                    }
                  `
              }
            `.replace(/\s+/g, ' ').trim()}
          >
            {tab.icon && <span>{tab.icon}</span>}
            <span>{tab.label}</span>

            {/* 徽章数字 */}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center font-bold">
                {tab.badge > 99 ? '99+' : tab.badge}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
