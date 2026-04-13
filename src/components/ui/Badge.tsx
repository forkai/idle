/**
 * @fileoverview Badge 徽章/标签组件
 * @description 用于显示稀有度、状态标签、数量等小型标识信息
 *
 * @example
 * <Badge variant="rare">稀有</Badge>
 * <Badge variant="unique" size="lg">传说</Badge>
 * <Badge variant="default" dot>在线</Badge>
 */

import React from 'react'

/**
 * 徽章变体
 * 对应游戏中的装备稀有度和状态类型
 */
export type BadgeVariant =
  | 'default'    // 普通（白色）
  | 'magic'      // 魔法（蓝色）
  | 'rare'       // 稀有（黄色）
  | 'unique'     // 独特（橙色）
  | 'set'        // 套装（绿色）
  | 'success'    // 成功（绿色）
  | 'warning'    // 警告（黄色）
  | 'danger'     // 危险（红色）
  | 'info'       // 信息（蓝色）

/**
 * 徽章尺寸
 */
export type BadgeSize = 'sm' | 'md' | 'lg'

/**
 * Badge 组件属性
 */
export interface BadgeProps {
  /** 变体（颜色和语义） */
  variant?: BadgeVariant
  /** 尺寸 */
  size?: BadgeSize
  /** 是否显示圆形状态点（无文字） */
  dot?: boolean
  /** 额外CSS类 */
  className?: string
  children?: React.ReactNode
}

/** 各变体样式 */
const VARIANT_STYLES: Record<BadgeVariant, string> = {
  default: 'bg-gray-700 text-gray-200 border-gray-600',
  magic: 'bg-blue-900/80 text-blue-300 border-blue-700',
  rare: 'bg-yellow-900/80 text-yellow-300 border-yellow-700',
  unique: 'bg-orange-900/80 text-orange-300 border-orange-700',
  set: 'bg-green-900/80 text-green-300 border-green-700',
  success: 'bg-emerald-900/80 text-emerald-300 border-emerald-700',
  warning: 'bg-yellow-900/80 text-yellow-300 border-yellow-700',
  danger: 'bg-red-900/80 text-red-300 border-red-700',
  info: 'bg-blue-900/80 text-blue-300 border-blue-700',
}

/** 圆形状态点颜色 */
const DOT_COLORS: Record<BadgeVariant, string> = {
  default: 'bg-gray-400',
  magic: 'bg-blue-400',
  rare: 'bg-yellow-400',
  unique: 'bg-orange-400',
  set: 'bg-green-400',
  success: 'bg-emerald-400',
  warning: 'bg-yellow-400',
  danger: 'bg-red-400',
  info: 'bg-blue-400',
}

/** 各尺寸样式 */
const SIZE_STYLES: Record<BadgeSize, string> = {
  sm: 'text-xs px-1.5 py-0.5 rounded',
  md: 'text-xs px-2 py-0.5 rounded-md',
  lg: 'text-sm px-2.5 py-1 rounded-md',
}

/**
 * 徽章组件
 * 用于标识装备稀有度、角色状态、任务标签等
 */
export function Badge({
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
  children,
}: BadgeProps) {
  // 纯状态点模式
  if (dot) {
    return (
      <span
        className={`
          inline-block w-2 h-2 rounded-full
          ${DOT_COLORS[variant]}
          ${className}
        `}
      />
    )
  }

  return (
    <span
      className={`
        inline-flex items-center gap-1
        font-medium border
        ${VARIANT_STYLES[variant]}
        ${SIZE_STYLES[size]}
        ${className}
      `.replace(/\s+/g, ' ').trim()}
    >
      {children}
    </span>
  )
}

/**
 * 根据物品稀有度返回对应Badge变体
 * @param rarity 物品稀有度字符串
 */
export function getRarityBadgeVariant(rarity: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    normal: 'default',
    magic: 'magic',
    rare: 'rare',
    unique: 'unique',
    set: 'set',
  }
  return map[rarity] ?? 'default'
}
