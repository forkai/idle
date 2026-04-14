/**
 * @fileoverview 伤害数字动画组件
 * @description 显示战斗中的伤害数字，支持暴击效果
 */

'use client'

import { useEffect } from 'react'

interface DamageNumberProps {
  damage: number
  isCrit: boolean
  position: { x: number; y: number }
  onComplete: () => void
}

/**
 * 伤害数字动画组件
 * 在战斗中显示造成的伤害数字，支持暴击样式
 */
const DamageNumber = ({ damage, isCrit, position, onComplete }: DamageNumberProps) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1000)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div
      className={`
        absolute font-bold pointer-events-none animate-bounce
        ${isCrit ? 'text-2xl text-amber-400' : 'text-lg text-white'}
      `}
      style={{
        left: position.x,
        top: position.y,
        animation: 'float-up 1s ease-out forwards',
      }}
    >
      -{damage}
    </div>
  )
}

export { DamageNumber }
