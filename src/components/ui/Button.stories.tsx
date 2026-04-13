/**
 * @fileoverview Button 组件 Storybook 文档
 */

import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        component: '游戏风格按钮，支持多种变体（primary/secondary/danger/ghost/success）和尺寸。',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger', 'ghost', 'success'],
      description: '按钮样式变体',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: '按钮尺寸',
    },
    loading: { control: 'boolean', description: '加载状态' },
    disabled: { control: 'boolean', description: '禁用状态' },
    fullWidth: { control: 'boolean', description: '撑满宽度' },
  },
}

export default meta
type Story = StoryObj<typeof Button>

/** 主操作按钮 */
export const Primary: Story = {
  args: { variant: 'primary', children: '装备' },
}

/** 次要操作按钮 */
export const Secondary: Story = {
  args: { variant: 'secondary', children: '取消' },
}

/** 危险操作按钮 */
export const Danger: Story = {
  args: { variant: 'danger', children: '丢弃装备' },
}

/** 幽灵按钮 */
export const Ghost: Story = {
  args: { variant: 'ghost', children: '查看详情' },
}

/** 加载中状态 */
export const Loading: Story = {
  args: { variant: 'primary', loading: true, children: '战斗中...' },
}

/** 禁用状态 */
export const Disabled: Story = {
  args: { variant: 'primary', disabled: true, children: '背包已满' },
}

/** 带图标 */
export const WithIcon: Story = {
  args: {
    variant: 'primary',
    leftIcon: '⚔️',
    children: '开始战斗',
  },
}

/** 全部变体展示 */
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', background: '#111', padding: '16px' }}>
      <Button variant="primary">主要操作</Button>
      <Button variant="secondary">次要操作</Button>
      <Button variant="danger">危险操作</Button>
      <Button variant="ghost">幽灵按钮</Button>
      <Button variant="success">成功状态</Button>
    </div>
  ),
}

/** 全部尺寸展示 */
export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#111', padding: '16px' }}>
      <Button variant="primary" size="xs">超小</Button>
      <Button variant="primary" size="sm">小</Button>
      <Button variant="primary" size="md">中</Button>
      <Button variant="primary" size="lg">大</Button>
      <Button variant="primary" size="xl">超大</Button>
    </div>
  ),
}
