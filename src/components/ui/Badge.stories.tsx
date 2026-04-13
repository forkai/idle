/**
 * @fileoverview Badge 组件 Storybook 文档
 */

import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from './Badge'

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  tags: ['autodocs'],
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        component: '徽章组件，对应游戏装备稀有度（普通/魔法/稀有/传说/套装）和状态标签。',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof Badge>

export const Normal: Story = { args: { variant: 'default', children: '普通' } }
export const Magic: Story = { args: { variant: 'magic', children: '魔法' } }
export const Rare: Story = { args: { variant: 'rare', children: '稀有' } }
export const Unique: Story = { args: { variant: 'unique', children: '传说' } }
export const Set: Story = { args: { variant: 'set', children: '套装' } }

/** 装备稀有度完整展示 */
export const AllRarities: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', background: '#111', padding: '16px' }}>
      <Badge variant="default">普通</Badge>
      <Badge variant="magic">魔法</Badge>
      <Badge variant="rare">稀有</Badge>
      <Badge variant="unique">传说</Badge>
      <Badge variant="set">套装</Badge>
    </div>
  ),
}

/** 状态点 */
export const StatusDots: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: '#111', padding: '16px' }}>
      <span style={{ color: '#9ca3af', fontSize: '12px' }}>在线 <Badge dot variant="success" /></span>
      <span style={{ color: '#9ca3af', fontSize: '12px' }}>战斗中 <Badge dot variant="danger" /></span>
      <span style={{ color: '#9ca3af', fontSize: '12px' }}>离线 <Badge dot variant="default" /></span>
    </div>
  ),
}
