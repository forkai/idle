/**
 * @fileoverview 游戏设置状态管理Store
 * @description 管理游戏配置，包括音效、画面、通知、AI功能开关等
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

/**
 * 音效设置
 */
export interface SoundSettings {
  /** 是否开启音效 */
  sfxEnabled: boolean
  /** 音效音量 0-1 */
  sfxVolume: number
  /** 是否开启背景音乐 */
  bgmEnabled: boolean
  /** 背景音乐音量 0-1 */
  bgmVolume: number
}

/**
 * 画面设置
 */
export interface DisplaySettings {
  /** 是否开启战斗动画 */
  combatAnimations: boolean
  /** 是否显示伤害数字 */
  showDamageNumbers: boolean
  /** 是否显示战斗日志 */
  showCombatLog: boolean
  /** 战斗日志最大条数 */
  combatLogMaxLines: number
  /** 语言 zh-CN | en-US */
  language: 'zh-CN' | 'en-US'
}

/**
 * 通知设置
 */
export interface NotificationSettings {
  /** 升级提醒 */
  levelUpNotify: boolean
  /** 稀有装备掉落提醒 */
  rareDropNotify: boolean
  /** 离线收益提醒 */
  offlineRewardNotify: boolean
}

/**
 * AI功能设置（付费DLC模块，默认关闭）
 */
export interface AISettings {
  /** 是否已启用AI功能（用户提供API Key后自动开启） */
  enabled: boolean
  /** 用户自定义的LLM API Key */
  apiKey: string
  /** LLM提供商 */
  provider: 'openai' | 'anthropic' | 'deepseek' | 'custom'
  /** 自定义API端点（provider为custom时使用） */
  customEndpoint: string
  /** 使用的模型名称 */
  modelName: string
  /** AI伴侣是否启用 */
  companionEnabled: boolean
}

/**
 * 设置Store状态接口
 */
interface SettingsStoreState {
  /** 音效设置 */
  sound: SoundSettings
  /** 画面设置 */
  display: DisplaySettings
  /** 通知设置 */
  notifications: NotificationSettings
  /** AI功能设置 */
  ai: AISettings
}

/**
 * 设置Store动作接口
 */
interface SettingsActions {
  /** 更新音效设置（部分更新） */
  updateSound: (settings: Partial<SoundSettings>) => void
  /** 更新画面设置（部分更新） */
  updateDisplay: (settings: Partial<DisplaySettings>) => void
  /** 更新通知设置（部分更新） */
  updateNotifications: (settings: Partial<NotificationSettings>) => void
  /** 配置AI功能（用户输入API Key后调用） */
  configureAI: (apiKey: string, provider: AISettings['provider'], modelName?: string) => void
  /** 更新自定义AI端点 */
  updateAIEndpoint: (endpoint: string) => void
  /** 开关AI功能 */
  toggleAI: (enabled: boolean) => void
  /** 开关AI伴侣 */
  toggleCompanion: (enabled: boolean) => void
  /** 重置所有设置为默认值 */
  resetSettings: () => void
}

/**
 * 默认设置值
 */
const DEFAULT_SETTINGS: SettingsStoreState = {
  sound: {
    sfxEnabled: true,
    sfxVolume: 0.7,
    bgmEnabled: true,
    bgmVolume: 0.5,
  },
  display: {
    combatAnimations: true,
    showDamageNumbers: true,
    showCombatLog: true,
    combatLogMaxLines: 50,
    language: 'zh-CN',
  },
  notifications: {
    levelUpNotify: true,
    rareDropNotify: true,
    offlineRewardNotify: true,
  },
  ai: {
    enabled: false,
    apiKey: '',
    provider: 'openai',
    customEndpoint: '',
    modelName: 'gpt-4o-mini',
    companionEnabled: false,
  },
}

/**
 * 设置状态Store
 */
export const useSettingsStore = create<SettingsStoreState & SettingsActions>()(
  persist(
    immer((set) => ({
      ...DEFAULT_SETTINGS,

      /**
       * 更新音效设置
       */
      updateSound: (settings: Partial<SoundSettings>) => {
        set(state => {
          Object.assign(state.sound, settings)
        })
      },

      /**
       * 更新画面设置
       */
      updateDisplay: (settings: Partial<DisplaySettings>) => {
        set(state => {
          Object.assign(state.display, settings)
        })
      },

      /**
       * 更新通知设置
       */
      updateNotifications: (settings: Partial<NotificationSettings>) => {
        set(state => {
          Object.assign(state.notifications, settings)
        })
      },

      /**
       * 配置AI功能（用户输入API Key激活）
       * API Key非空时自动启用AI功能
       */
      configureAI: (apiKey: string, provider: AISettings['provider'], modelName?: string) => {
        set(state => {
          state.ai.apiKey = apiKey
          state.ai.provider = provider
          if (modelName) state.ai.modelName = modelName
          state.ai.enabled = apiKey.trim().length > 0
        })
      },

      /**
       * 更新自定义API端点
       */
      updateAIEndpoint: (endpoint: string) => {
        set(state => {
          state.ai.customEndpoint = endpoint
        })
      },

      /**
       * 开关AI功能（需要已有API Key才能开启）
       */
      toggleAI: (enabled: boolean) => {
        set(state => {
          if (enabled && !state.ai.apiKey) return // 没有API Key不能启用
          state.ai.enabled = enabled
          if (!enabled) state.ai.companionEnabled = false
        })
      },

      /**
       * 开关AI伴侣（需要AI功能已启用）
       */
      toggleCompanion: (enabled: boolean) => {
        set(state => {
          if (enabled && !state.ai.enabled) return // AI功能未启用
          state.ai.companionEnabled = enabled
        })
      },

      /**
       * 恢复默认设置
       */
      resetSettings: () => {
        set(() => ({ ...DEFAULT_SETTINGS }))
      },
    })),
    {
      name: 'diablo-idle-settings',
      // API Key加密存储（简单处理，生产环境应使用更安全的方式）
      partialize: (state) => ({
        sound: state.sound,
        display: state.display,
        notifications: state.notifications,
        ai: {
          ...state.ai,
          // API Key存储前不做额外处理（用户自己的浏览器localStorage）
        },
      }),
    }
  )
)
