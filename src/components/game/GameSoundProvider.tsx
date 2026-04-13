/**
 * @fileoverview 游戏音效提供者
 * @description 全局点击音效，所有按钮点击自动触发
 */

'use client'

import { useEffect } from 'react'
import { playSound } from '@/lib/game/sound'

export function GameSoundProvider() {
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement
      // 只对按钮类元素触发
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        playSound('click')
      }
    }

    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [])

  return null
}
