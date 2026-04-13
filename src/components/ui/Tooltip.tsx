/**
 * @fileoverview Tooltip 提示气泡组件
 * @description 鼠标悬停显示提示信息，用于装备词缀、技能说明等
 *
 * @example
 * <Tooltip content="双手持剑，攻击力+50%">
 *   <span>⚔️ 烈焰巨剑</span>
 * </Tooltip>
 *
 * <Tooltip content={<ItemStats item={item} />} placement="right">
 *   <ItemIcon item={item} />
 * </Tooltip>
 */

'use client'

import React, { useState, useRef, useCallback } from 'react'

/**
 * Tooltip 弹出方向
 */
export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right'

/**
 * Tooltip 组件属性
 */
export interface TooltipProps {
  /** 提示内容（支持字符串或ReactNode用于富文本） */
  content: React.ReactNode
  /** 弹出方向 */
  placement?: TooltipPlacement
  /** 延迟显示时间（毫秒） */
  delay?: number
  /** 是否禁用 */
  disabled?: boolean
  /** 额外CSS类（应用于气泡） */
  className?: string
  children: React.ReactNode
}

/** 各方向的定位样式 */
const PLACEMENT_STYLES: Record<TooltipPlacement, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
}

/** 各方向的箭头样式 */
const ARROW_STYLES: Record<TooltipPlacement, string> = {
  top: 'bottom-[-4px] left-1/2 -translate-x-1/2 border-t-gray-700 border-t-4 border-x-4 border-x-transparent border-b-0',
  bottom: 'top-[-4px] left-1/2 -translate-x-1/2 border-b-gray-700 border-b-4 border-x-4 border-x-transparent border-t-0',
  left: 'right-[-4px] top-1/2 -translate-y-1/2 border-l-gray-700 border-l-4 border-y-4 border-y-transparent border-r-0',
  right: 'left-[-4px] top-1/2 -translate-y-1/2 border-r-gray-700 border-r-4 border-y-4 border-y-transparent border-l-0',
}

/**
 * Tooltip 提示气泡组件
 * 用于装备详情、技能说明、词缀解释等hover提示场景
 */
export function Tooltip({
  content,
  placement = 'top',
  delay = 200,
  disabled = false,
  className = '',
  children,
}: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const show = useCallback(() => {
    if (disabled) return
    timerRef.current = setTimeout(() => setVisible(true), delay)
  }, [disabled, delay])

  const hide = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setVisible(false)
  }, [])

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}

      {visible && (
        <span
          role="tooltip"
          className={`
            absolute z-50 ${PLACEMENT_STYLES[placement]}
            min-w-[160px] max-w-[280px]
            bg-gray-900 border border-gray-700
            rounded-md shadow-xl shadow-black/60
            px-3 py-2 text-xs text-gray-200
            pointer-events-none
            animate-in fade-in duration-100
            ${className}
          `.replace(/\s+/g, ' ').trim()}
        >
          {content}
          {/* 箭头 */}
          <span className={`absolute w-0 h-0 ${ARROW_STYLES[placement]}`} />
        </span>
      )}
    </span>
  )
}
