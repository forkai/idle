/**
 * @fileoverview Tabs 组件 Storybook 文档
 */

'use client'

import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Tabs } from './Tabs'

const meta: Meta<typeof Tabs> = {
  title: 'UI/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        component: '游戏面板标签切换，支持图标、徽章数字（未读提示）、禁用状态。',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof Tabs>

const GAME_TABS = [
  { key: 'inventory', label: '背包', icon: '🎒', badge: 3 },
  { key: 'equipment', label: '装备', icon: '⚔️' },
  { key: 'skills', label: '技能', icon: '✨' },
  { key: 'map', label: '地图', icon: '🗺️', disabled: true },
]

/** 胶囊式（默认） */
export const Pill: Story = {
  render: () => {
    const [active, setActive] = useState('inventory')
    return (
      <div style={{ background: '#111', padding: '16px', width: '400px' }}>
        <Tabs tabs={GAME_TABS} activeKey={active} onChange={setActive} variant="pill" />
        <div style={{ color: '#9ca3af', marginTop: '12px', fontSize: '12px' }}>
          当前页面: {active}
        </div>
      </div>
    )
  },
}

/** 下划线式 */
export const Line: Story = {
  render: () => {
    const [active, setActive] = useState('equipment')
    return (
      <div style={{ background: '#111', padding: '16px', width: '400px' }}>
        <Tabs tabs={GAME_TABS} activeKey={active} onChange={setActive} variant="line" />
      </div>
    )
  },
}
