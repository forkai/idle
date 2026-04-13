/**
 * @fileoverview Select 组件 Storybook 文档
 */

import type { Meta, StoryObj } from '@storybook/react'
import { Select } from './Select'

const meta: Meta<typeof Select> = {
  title: 'UI/Select',
  component: Select,
  tags: ['autodocs'],
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: { component: '游戏风格下拉选择框，支持选项分组、禁用项。' },
    },
  },
}

export default meta
type Story = StoryObj<typeof Select>

export const Default: Story = {
  args: {
    label: '选择职业',
    value: 'warrior',
    options: [
      { value: 'warrior', label: '⚔️ 战士' },
      { value: 'mage', label: '🔮 法师' },
      { value: 'rogue', label: '🗡️ 刺客' },
    ],
    onChange: () => {},
  },
}

export const WithPlaceholder: Story = {
  args: {
    label: '选择区域',
    value: '',
    placeholder: '请选择...',
    options: [
      { value: 'blood-marsh', label: '🩸 鲜血湿地' },
      { value: 'dark-cave', label: '🌑 黑暗洞穴' },
      { value: 'undead-crypt', label: '💀 不死族墓穴' },
    ],
    onChange: () => {},
  },
}

export const Grouped: Story = {
  args: {
    label: '选择排序',
    value: 'level_desc',
    options: [
      {
        label: '等级',
        options: [
          { value: 'level_desc', label: '等级：从高到低' },
          { value: 'level_asc', label: '等级：从低到高' },
        ],
      },
      {
        label: '稀有度',
        options: [
          { value: 'rarity_desc', label: '稀有度：从高到低' },
          { value: 'rarity_asc', label: '稀有度：从低到高' },
        ],
      },
    ],
    onChange: () => {},
  },
}
