/**
 * @fileoverview ProgressBar 进度条组件
 * @description 用于显示HP、MP、经验值、技能冷却等进度信息
 *
 * @example
 * <ProgressBar value={70} max={100} variant="health" showLabel />
 * <ProgressBar value={45} max={100} variant="mana" label="45/100 MP" />
 * <ProgressBar value={2800} max={5000} variant="exp" animated />
 */

import React from 'react'

/**
 * 进度条变体
 * - health: 生命值（红色）
 * - mana: 法力值（蓝色）
 * - exp: 经验值（绿色）
 * - stamina: 体力（黄色）
 * - default: 默认（金色）
 */
export type ProgressBarVariant = 'health' | 'mana' | 'exp' | 'stamina' | 'default'

/**
 * ProgressBar 组件属性
 */
export interface ProgressBarProps {
  /** 当前值 */
  value: number
  /** 最大值 */
  max: number
  /** 变体（控制颜色） */
  variant?: ProgressBarVariant
  /** 是否显示百分比标签 */
  showLabel?: boolean
  /** 自定义标签文字（不设置时显示 value/max） */
  label?: string
  /** 进度条高度（Tailwind类，如 h-2、h-3、h-4） */
  heightClass?: string
  /** 是否启用动画效果（适合升级/回血等场景） */
  animated?: boolean
  /** 额外CSS类 */
  className?: string
}

/** 各变体的进度条颜色 */
const VARIANT_BAR: Record<ProgressBarVariant, string> = {
  health: 'bg-gradient-to-r from-red-700 to-red-500',
  mana: 'bg-gradient-to-r from-blue-700 to-blue-500',
  exp: 'bg-gradient-to-r from-green-700 to-green-400',
  stamina: 'bg-gradient-to-r from-yellow-700 to-yellow-400',
  default: 'bg-gradient-to-r from-amber-700 to-amber-500',
}

/** 各变体的轨道背景色 */
const VARIANT_TRACK: Record<ProgressBarVariant, string> = {
  health: 'bg-red-950/80',
  mana: 'bg-blue-950/80',
  exp: 'bg-green-950/80',
  stamina: 'bg-yellow-950/80',
  default: 'bg-gray-800',
}

/** 各变体的文字颜色 */
const VARIANT_TEXT: Record<ProgressBarVariant, string> = {
  health: 'text-red-300',
  mana: 'text-blue-300',
  exp: 'text-green-300',
  stamina: 'text-yellow-300',
  default: 'text-amber-300',
}

/**
 * 进度条组件
 * 用于游戏内HP、MP、经验值、技能冷却等场景
 */
export function ProgressBar({
  value,
  max,
  variant = 'default',
  showLabel = false,
  label,
  heightClass = 'h-3',
  animated = false,
  className = '',
}: ProgressBarProps) {
  // 计算百分比，防止超过100%
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0
  const displayLabel = label ?? `${Math.floor(value)}/${Math.floor(max)}`

  return (
    <div className={`w-full ${className}`}>
      {/* 标签行 */}
      {showLabel && (
        <div className={`flex justify-between text-xs mb-0.5 ${VARIANT_TEXT[variant]}`}>
          <span>{displayLabel}</span>
          <span>{percent.toFixed(0)}%</span>
        </div>
      )}

      {/* 轨道 */}
      <div
        className={`
          w-full ${heightClass} rounded-full overflow-hidden
          ${VARIANT_TRACK[variant]}
          border border-black/30
        `}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        {/* 进度条填充 */}
        <div
          className={`
            ${heightClass} rounded-full
            ${VARIANT_BAR[variant]}
            ${animated ? 'transition-all duration-500 ease-out' : ''}
          `}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
