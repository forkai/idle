/**
 * @fileoverview Button 通用按钮组件
 * @description 支持多种变体（primary/secondary/danger/ghost）和尺寸的按钮
 *
 * @example
 * <Button variant="primary" size="md" onClick={handleClick}>确认</Button>
 * <Button variant="danger" disabled>不可用</Button>
 * <Button variant="ghost" loading>加载中</Button>
 */

import React from 'react'

/**
 * 按钮变体类型
 * - primary: 主操作按钮（金色，用于重要操作）
 * - secondary: 次要按钮（灰色，用于普通操作）
 * - danger: 危险操作按钮（红色，用于删除/重置等）
 * - ghost: 幽灵按钮（透明背景，用于次级入口）
 * - success: 成功状态按钮（绿色，用于确认/完成）
 */
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success'

/**
 * 按钮尺寸类型
 */
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/**
 * Button 组件属性
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 按钮变体，控制颜色和风格 */
  variant?: ButtonVariant
  /** 按钮尺寸 */
  size?: ButtonSize
  /** 是否处于加载状态（显示spinner，禁用点击） */
  loading?: boolean
  /** 左侧图标（emoji或ReactNode） */
  leftIcon?: React.ReactNode
  /** 右侧图标（emoji或ReactNode） */
  rightIcon?: React.ReactNode
  /** 是否撑满父容器宽度 */
  fullWidth?: boolean
  children: React.ReactNode
}

/** 各变体的样式映射 */
const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary: `
    bg-amber-700 hover:bg-amber-600 active:bg-amber-800
    text-amber-100 border border-amber-500
    shadow-md shadow-amber-900/50
    disabled:bg-amber-900/40 disabled:text-amber-700 disabled:border-amber-800
  `,
  secondary: `
    bg-gray-700 hover:bg-gray-600 active:bg-gray-800
    text-gray-200 border border-gray-500
    disabled:bg-gray-800/40 disabled:text-gray-600 disabled:border-gray-700
  `,
  danger: `
    bg-red-900 hover:bg-red-800 active:bg-red-950
    text-red-200 border border-red-700
    shadow-md shadow-red-900/50
    disabled:bg-red-950/40 disabled:text-red-800 disabled:border-red-900
  `,
  ghost: `
    bg-transparent hover:bg-white/5 active:bg-white/10
    text-gray-300 border border-transparent hover:border-gray-600
    disabled:text-gray-600
  `,
  success: `
    bg-green-900 hover:bg-green-800 active:bg-green-950
    text-green-200 border border-green-700
    disabled:bg-green-950/40 disabled:text-green-800
  `,
}

/** 各尺寸的样式映射 */
const SIZE_STYLES: Record<ButtonSize, string> = {
  xs: 'px-2 py-1 text-xs rounded',
  sm: 'px-3 py-1.5 text-sm rounded',
  md: 'px-4 py-2 text-sm rounded-md',
  lg: 'px-5 py-2.5 text-base rounded-md',
  xl: 'px-6 py-3 text-lg rounded-lg',
}

/**
 * 通用按钮组件
 * 遵循游戏暗黑风格设计，支持状态管理和图标
 */
export function Button({
  variant = 'secondary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center gap-2
        font-medium transition-all duration-150
        cursor-pointer disabled:cursor-not-allowed
        select-none outline-none
        focus-visible:ring-2 focus-visible:ring-amber-500/50
        ${VARIANT_STYLES[variant]}
        ${SIZE_STYLES[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `.replace(/\s+/g, ' ').trim()}
    >
      {/* 加载中spinner */}
      {loading && (
        <span className="animate-spin text-base">⟳</span>
      )}

      {/* 左侧图标 */}
      {!loading && leftIcon && (
        <span className="flex-shrink-0">{leftIcon}</span>
      )}

      {/* 按钮文字 */}
      <span>{children}</span>

      {/* 右侧图标 */}
      {rightIcon && (
        <span className="flex-shrink-0">{rightIcon}</span>
      )}
    </button>
  )
}
