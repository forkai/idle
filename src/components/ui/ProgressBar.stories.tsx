/**
 * @fileoverview ProgressBar 组件 Storybook 文档
 */

import type { Meta, StoryObj } from '@storybook/react'
import { ProgressBar } from './ProgressBar'

const meta: Meta<typeof ProgressBar> = {
  title: 'UI/ProgressBar',
  component: ProgressBar,
  tags: ['autodocs'],
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        component: '游戏进度条，用于HP/MP/经验值/技能冷却等场景，支持动画过渡。',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['health', 'mana', 'exp', 'stamina', 'default'],
    },
    heightClass: {
      control: 'select',
      options: ['h-1', 'h-2', 'h-3', 'h-4', 'h-5', 'h-6'],
    },
    animated: { control: 'boolean' },
    showLabel: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof ProgressBar>

/** 生命值条 */
export const Health: Story = {
  args: { value: 350, max: 500, variant: 'health', showLabel: true, animated: true },
}

/** 法力值条 */
export const Mana: Story = {
  args: { value: 120, max: 200, variant: 'mana', showLabel: true },
}

/** 经验值条 */
export const Experience: Story = {
  args: { value: 2800, max: 5000, variant: 'exp', showLabel: true, label: '2800/5000 EXP' },
}

/** 临界告警状态（血量低） */
export const LowHealth: Story = {
  args: { value: 50, max: 500, variant: 'health', showLabel: true, animated: true },
}

/** 完整状态面板展示 */
export const StatusPanel: Story = {
  render: () => (
    <div style={{ background: '#111', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', width: '300px' }}>
      <div>
        <span style={{ color: '#f87171', fontSize: '12px' }}>❤️ 生命值</span>
        <ProgressBar value={350} max={500} variant="health" showLabel animated />
      </div>
      <div>
        <span style={{ color: '#60a5fa', fontSize: '12px' }}>💙 法力值</span>
        <ProgressBar value={120} max={200} variant="mana" showLabel animated />
      </div>
      <div>
        <span style={{ color: '#4ade80', fontSize: '12px' }}>⭐ 经验值</span>
        <ProgressBar value={2800} max={5000} variant="exp" showLabel animated heightClass="h-2" />
      </div>
    </div>
  ),
}
