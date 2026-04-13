/**
 * @fileoverview 设置面板组件
 * @description 游戏音效、画面、通知等设置
 */

'use client'

import { useState } from 'react'
import { useSettingsStore } from '@/stores/settingsStore'
import { playSound } from '@/lib/game/sound'

/** 切换开关组件 */
function ToggleSwitch({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => { onChange(!enabled); playSound('click') }}
      className={`
        relative w-11 h-6 rounded-full transition-all duration-200 cursor-pointer
        ${enabled ? 'bg-amber-600' : 'bg-gray-700'}
      `}
    >
      <span
        className={`
          absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200
          ${enabled ? 'left-[22px]' : 'left-0.5'}
        `}
      />
    </button>
  )
}

/** 音量滑条组件 */
function VolumeSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="flex-1 h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-amber-500"
        style={{ accentColor: '#d97706' }}
      />
      <span className="text-xs text-gray-400 w-8 text-right">
        {Math.round(value * 100)}%
      </span>
    </div>
  )
}

/** 设置分段组件 */
function SettingsSection({
  title,
  icon,
  children,
}: {
  title: string
  icon: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-gray-950/60 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm">{icon}</span>
        <h3 className="text-sm font-bold text-gray-300">{title}</h3>
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  )
}

/** 设置行 */
function SettingRow({
  label,
  description,
  children,
}: {
  label: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-200">{label}</p>
        {description && <p className="text-[10px] text-gray-500 mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0">
        {children}
      </div>
    </div>
  )
}

/**
 * 设置面板主组件
 */
export function SettingsPanel() {
  const {
    sound, updateSound,
    display, updateDisplay,
    notifications, updateNotifications,
    resetSettings,
  } = useSettingsStore()

  const [isOpen, setIsOpen] = useState(false)

  const handleOpen = () => {
    setIsOpen(true)
    playSound('click')
  }

  const handleClose = () => {
    setIsOpen(false)
    playSound('click')
  }

  const handleReset = () => {
    resetSettings()
    playSound('click')
  }

  if (!isOpen) {
    return (
      <button
        onClick={handleOpen}
        className="text-gray-400 hover:text-gray-200 transition-colors text-lg cursor-pointer"
        title="设置"
      >
        ⚙️
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 animate-in fade-in duration-200">
      <div
        className="w-full max-w-md max-h-[85vh] bg-gray-900 border border-gray-600 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题栏 */}
        <div className="relative px-4 py-3 shrink-0">
          <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-amber-600 to-transparent" />
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-amber-400">⚙️ 设置</h2>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded bg-gray-800 border border-gray-600 text-gray-400 hover:text-white hover:border-gray-500 cursor-pointer transition-all flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
          {/* 音效设置 */}
          <SettingsSection title="音效" icon="🔊">
            <SettingRow label="音效开关" description="攻击、拾取、升级等音效">
              <ToggleSwitch
                enabled={sound.sfxEnabled}
                onChange={(v) => updateSound({ sfxEnabled: v })}
              />
            </SettingRow>
            {sound.sfxEnabled && (
              <SettingRow label="音效音量">
                <VolumeSlider
                  value={sound.sfxVolume}
                  onChange={(v) => updateSound({ sfxVolume: v })}
                />
              </SettingRow>
            )}
            <SettingRow label="音乐开关" description="背景音乐">
              <ToggleSwitch
                enabled={sound.bgmEnabled}
                onChange={(v) => updateSound({ bgmEnabled: v })}
              />
            </SettingRow>
            {sound.bgmEnabled && (
              <SettingRow label="音乐音量">
                <VolumeSlider
                  value={sound.bgmVolume}
                  onChange={(v) => updateSound({ bgmVolume: v })}
                />
              </SettingRow>
            )}
          </SettingsSection>

          {/* 画面设置 */}
          <SettingsSection title="画面" icon="🎮">
            <SettingRow label="战斗动画" description="播放受击、击杀等动画效果">
              <ToggleSwitch
                enabled={display.combatAnimations}
                onChange={(v) => updateDisplay({ combatAnimations: v })}
              />
            </SettingRow>
            <SettingRow label="伤害数字" description="显示飘字伤害">
              <ToggleSwitch
                enabled={display.showDamageNumbers}
                onChange={(v) => updateDisplay({ showDamageNumbers: v })}
              />
            </SettingRow>
            <SettingRow label="战斗日志" description="显示实时战斗信息">
              <ToggleSwitch
                enabled={display.showCombatLog}
                onChange={(v) => updateDisplay({ showCombatLog: v })}
              />
            </SettingRow>
          </SettingsSection>

          {/* 通知设置 */}
          <SettingsSection title="通知" icon="🔔">
            <SettingRow label="升级提醒" description="升级时弹出提示">
              <ToggleSwitch
                enabled={notifications.levelUpNotify}
                onChange={(v) => updateNotifications({ levelUpNotify: v })}
              />
            </SettingRow>
            <SettingRow label="稀有掉落提醒" description="稀有及以上装备掉落时提示">
              <ToggleSwitch
                enabled={notifications.rareDropNotify}
                onChange={(v) => updateNotifications({ rareDropNotify: v })}
              />
            </SettingRow>
            <SettingRow label="离线收益提醒" description="返回游戏时显示离线收益">
              <ToggleSwitch
                enabled={notifications.offlineRewardNotify}
                onChange={(v) => updateNotifications({ offlineRewardNotify: v })}
              />
            </SettingRow>
          </SettingsSection>

          {/* 重置 */}
          <button
            onClick={handleReset}
            className="w-full py-2.5 rounded-lg bg-gray-800 border border-gray-600 text-gray-400 text-xs font-bold hover:border-red-500 hover:text-red-400 cursor-pointer transition-all duration-150"
          >
            重置所有设置为默认值
          </button>
        </div>
      </div>
    </div>
  )
}
