/**
 * @fileoverview Input 输入框组件
 * @description 通用文本输入框，支持标签、前后缀、错误提示、禁用状态
 *
 * @example
 * <Input label="角色名称" placeholder="请输入名称" value={name} onChange={setName} />
 * <Input label="搜索" leftAddon="🔍" error="名称不能为空" />
 * <Input type="number" label="数量" min={1} max={99} />
 */

import React from 'react'

/**
 * Input 组件属性
 */
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  /** 输入框标签 */
  label?: string
  /** 错误提示文字（有值时显示红色边框） */
  error?: string
  /** 帮助文字（灰色小字） */
  hint?: string
  /** 左侧附加内容（emoji或文字） */
  leftAddon?: React.ReactNode
  /** 右侧附加内容（emoji或文字） */
  rightAddon?: React.ReactNode
  /** 值变化回调（简化了原生onChange类型） */
  onChange?: (value: string) => void
  /** 额外CSS类（应用于input元素） */
  className?: string
  /** 包裹容器的额外类 */
  wrapperClassName?: string
}

/**
 * 文本输入框组件
 */
export function Input({
  label,
  error,
  hint,
  leftAddon,
  rightAddon,
  onChange,
  className = '',
  wrapperClassName = '',
  disabled,
  id,
  ...props
}: InputProps) {
  const inputId = id ?? `input-${label?.replace(/\s+/g, '-').toLowerCase()}`

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value)
  }

  return (
    <div className={`w-full ${wrapperClassName}`}>
      {/* 标签 */}
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-medium text-gray-400 mb-1 tracking-wide"
        >
          {label}
        </label>
      )}

      {/* 输入框容器（含前后缀） */}
      <div className={`
        flex items-center
        bg-gray-800 border rounded-md overflow-hidden
        transition-colors duration-150
        ${error ? 'border-red-600 focus-within:border-red-500' : 'border-gray-600 focus-within:border-amber-500/70'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}>
        {/* 左侧附加 */}
        {leftAddon && (
          <span className="px-3 text-gray-400 text-sm flex-shrink-0 border-r border-gray-600">
            {leftAddon}
          </span>
        )}

        {/* 输入框本体 */}
        <input
          {...props}
          id={inputId}
          disabled={disabled}
          onChange={handleChange}
          className={`
            flex-1 bg-transparent px-3 py-2
            text-sm text-gray-200 placeholder-gray-600
            outline-none
            disabled:cursor-not-allowed
            ${className}
          `.replace(/\s+/g, ' ').trim()}
        />

        {/* 右侧附加 */}
        {rightAddon && (
          <span className="px-3 text-gray-400 text-sm flex-shrink-0 border-l border-gray-600">
            {rightAddon}
          </span>
        )}
      </div>

      {/* 错误提示 */}
      {error && (
        <p className="mt-1 text-xs text-red-400" role="alert">{error}</p>
      )}

      {/* 帮助文字 */}
      {!error && hint && (
        <p className="mt-1 text-xs text-gray-500">{hint}</p>
      )}
    </div>
  )
}
