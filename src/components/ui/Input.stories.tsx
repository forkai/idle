/**
 * @fileoverview Input 组件 Storybook 文档
 */

import type { Meta, StoryObj } from '@storybook/react'
import { Input } from './Input'

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: { component: '游戏风格输入框，支持标签、前后缀图标、错误/帮助文字。' },
    },
  },
}

export default meta
type Story = StoryObj<typeof Input>

export const Default: Story = {
  args: { label: '角色名称', placeholder: '请输入角色名...' },
}

export const WithError: Story = {
  args: { label: '角色名称', value: 'a', error: '名称至少需要2个字符' },
}

export const WithHint: Story = {
  args: { label: '角色名称', hint: '2-12个字符，不含特殊符号', placeholder: '请输入...' },
}

export const WithAddon: Story = {
  args: { label: '搜索物品', leftAddon: '🔍', placeholder: '输入物品名称...' },
}

export const Disabled: Story = {
  args: { label: '服务器', value: '亚服-01', disabled: true },
}
