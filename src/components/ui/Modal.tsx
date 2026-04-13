/**
 * @fileoverview Modal 弹窗组件
 * @description 通用对话框/弹出层，支持标题、正文、底部操作区
 *
 * @example
 * <Modal open={open} onClose={() => setOpen(false)} title="确认操作">
 *   <p>确定要删除这件装备吗？</p>
 *   <Modal.Footer>
 *     <Button variant="danger" onClick={onConfirm}>删除</Button>
 *     <Button variant="ghost" onClick={() => setOpen(false)}>取消</Button>
 *   </Modal.Footer>
 * </Modal>
 */

'use client'

import React, { useEffect, useCallback } from 'react'

/**
 * Modal 尺寸
 */
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

/**
 * Modal 组件属性
 */
export interface ModalProps {
  /** 是否显示弹窗 */
  open: boolean
  /** 关闭回调（点击遮罩或Esc键触发） */
  onClose: () => void
  /** 弹窗标题 */
  title?: React.ReactNode
  /** 弹窗尺寸 */
  size?: ModalSize
  /** 是否可通过点击遮罩关闭 */
  closeOnBackdrop?: boolean
  /** 是否显示关闭按钮 */
  showClose?: boolean
  /** 额外CSS类（应用于弹窗容器） */
  className?: string
  children: React.ReactNode
}

/**
 * Modal.Footer 属性
 */
export interface ModalFooterProps {
  children: React.ReactNode
  className?: string
}

/** 各尺寸的宽度 */
const SIZE_STYLES: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full mx-4',
}

/**
 * Modal底部操作区子组件
 */
function ModalFooter({ children, className = '' }: ModalFooterProps) {
  return (
    <div className={`flex justify-end gap-2 mt-4 pt-3 border-t border-gray-700 ${className}`}>
      {children}
    </div>
  )
}

/**
 * 通用弹窗组件
 * 遵循游戏暗黑风格，支持ESC关闭、背景滚动锁定
 */
export function Modal({
  open,
  onClose,
  title,
  size = 'md',
  closeOnBackdrop = true,
  showClose = true,
  className = '',
  children,
}: ModalProps) {
  // ESC键关闭
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose()
    },
    [open, onClose]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    // 打开时锁定背景滚动
    if (open) document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, handleKeyDown])

  if (!open) return null

  return (
    // 遮罩层
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* 半透明背景 */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={closeOnBackdrop ? onClose : undefined}
      />

      {/* 弹窗主体 */}
      <div
        className={`
          relative w-full ${SIZE_STYLES[size]}
          bg-gray-900 border border-gray-700
          rounded-lg shadow-2xl shadow-black/80
          animate-in fade-in zoom-in-95 duration-150
          ${className}
        `.replace(/\s+/g, ' ').trim()}
      >
        {/* 顶部标题栏 */}
        {(title || showClose) && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
            {title && (
              <h2 className="text-base font-bold text-amber-400 tracking-wide">
                {title}
              </h2>
            )}
            {showClose && (
              <button
                onClick={onClose}
                className="ml-auto text-gray-500 hover:text-gray-300 transition-colors text-lg leading-none cursor-pointer"
                aria-label="关闭"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* 弹窗内容 */}
        <div className="px-4 py-4 text-gray-300 text-sm">
          {children}
        </div>
      </div>
    </div>
  )
}

/** 挂载子组件 */
Modal.Footer = ModalFooter
