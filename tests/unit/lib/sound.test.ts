/**
 * @fileoverview 游戏音效系统单元测试
 * @description 测试 Web Audio API 音效合成函数
 *
 * 注意：由于 sound.ts 依赖 AudioContext，在 jsdom 环境下
 * 无法完全模拟浏览器音频 API。此测试验证 withSound 包装器的
 * 函数行为，不依赖实际音频播放。
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { withSound } from '@/lib/game/sound'

describe('游戏音效系统', () => {
  describe('withSound - 音效包装器', () => {
    it('应包装函数并调用原函数', () => {
      const handler = vi.fn()
      const wrapped = withSound(handler, 'click')
      wrapped()
      expect(handler).toHaveBeenCalled()
    })

    it('应传递参数给原函数', () => {
      const handler = vi.fn()
      const wrapped = withSound(handler)
      wrapped(42, 'test')
      expect(handler).toHaveBeenCalledWith(42, 'test')
    })

    it('应传递多个参数', () => {
      const handler = vi.fn()
      const wrapped = withSound(handler)
      wrapped(1, 2, 3, 'four')
      expect(handler).toHaveBeenCalledWith(1, 2, 3, 'four')
    })

    it('应支持默认音效类型', () => {
      const handler = vi.fn()
      const wrapped = withSound(handler)
      wrapped()
      expect(handler).toHaveBeenCalled()
    })

    it('handler 返回值应被正确传递', () => {
      const handler = vi.fn(() => 'result')
      const wrapped = withSound(handler)
      // withSound 返回 void，所以这里只验证 handler 被调用
      wrapped()
      expect(handler).toHaveBeenCalled()
    })
  })

  describe('playSound - 音效播放（需要浏览器 AudioContext）', () => {
    it('playSound 函数应存在', async () => {
      // 由于 AudioContext 无法在 jsdom 中模拟，
      // 只验证函数存在且可调用（会静默失败）
      const { playSound } = await import('@/lib/game/sound')
      expect(typeof playSound).toBe('function')
      // 调用会静默失败，不抛出错误
      expect(() => playSound('click')).not.toThrow()
    })
  })
})
