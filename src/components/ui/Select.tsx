/**
 * @fileoverview Select 下拉选择组件
 * @description 通用下拉选择框，支持分组、禁用项、图标
 *
 * @example
 * <Select
 *   label="选择职业"
 *   options={[
 *     { value: 'warrior', label: '⚔️ 战士' },
 *     { value: 'mage', label: '🔮 法师' },
 *     { value: 'rogue', label: '🗡️ 刺客' },
 *   ]}
 *   value={classId}
 *   onChange={setClassId}
 * />
 */

import React from 'react'

/**
 * 下拉选项
 */
export interface SelectOption {
  /** 选项值 */
  value: string
  /** 显示文字 */
  label: string
  /** 是否禁用 */
  disabled?: boolean
}

/**
 * 选项分组
 */
export interface SelectGroup {
  /** 分组标签 */
  label: string
  /** 分组内选项 */
  options: SelectOption[]
}

/**
 * Select 组件属性
 */
export interface SelectProps {
  /** 选项列表（平铺或分组） */
  options: SelectOption[] | SelectGroup[]
  /** 当前选中值 */
  value: string
  /** 值变化回调 */
  onChange: (value: string) => void
  /** 标签文字 */
  label?: string
  /** 占位符 */
  placeholder?: string
  /** 错误提示 */
  error?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 额外CSS类 */
  className?: string
  /** id */
  id?: string
}

/**
 * 判断是否为分组选项
 */
function isGrouped(options: SelectOption[] | SelectGroup[]): options is SelectGroup[] {
  return options.length > 0 && 'options' in options[0]
}

/**
 * 下拉选择组件
 */
export function Select({
  options,
  value,
  onChange,
  label,
  placeholder,
  error,
  disabled,
  className = '',
  id,
}: SelectProps) {
  const selectId = id ?? `select-${label?.replace(/\s+/g, '-').toLowerCase()}`

  return (
    <div className="w-full">
      {/* 标签 */}
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-medium text-gray-400 mb-1 tracking-wide"
        >
          {label}
        </label>
      )}

      {/* 选择框包裹（自定义箭头） */}
      <div className="relative">
        <select
          id={selectId}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={`
            w-full appearance-none
            bg-gray-800 border rounded-md
            px-3 py-2 pr-8
            text-sm text-gray-200
            outline-none transition-colors duration-150
            cursor-pointer disabled:cursor-not-allowed disabled:opacity-50
            ${error ? 'border-red-600 focus:border-red-500' : 'border-gray-600 focus:border-amber-500/70'}
            ${className}
          `.replace(/\s+/g, ' ').trim()}
        >
          {/* 占位符 */}
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}

          {/* 渲染选项 */}
          {isGrouped(options)
            ? options.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.options.map((opt) => (
                    <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                      {opt.label}
                    </option>
                  ))}
                </optgroup>
              ))
            : (options as SelectOption[]).map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))}
        </select>

        {/* 自定义下拉箭头 */}
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-xs">
          ▼
        </span>
      </div>

      {/* 错误提示 */}
      {error && (
        <p className="mt-1 text-xs text-red-400" role="alert">{error}</p>
      )}
    </div>
  )
}
