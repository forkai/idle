/**
 * @fileoverview Tooltip 组件 Storybook 文档
 */

import type { Meta, StoryObj } from '@storybook/react'
import { Tooltip } from './Tooltip'

const meta: Meta<typeof Tooltip> = {
  title: 'UI/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        component: '悬停提示气泡，适合装备词缀说明、技能描述等场景。支持富文本内容。',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof Tooltip>

export const Basic: Story = {
  render: () => (
    <div style={{ background: '#111', padding: '48px', display: 'flex', justifyContent: 'center' }}>
      <Tooltip content="双手持剑，攻击力 +120，力量 +45">
        <span style={{ color: '#fcd34d', cursor: 'pointer', fontSize: '14px' }}>⚔️ 烈焰巨剑（悬停查看）</span>
      </Tooltip>
    </div>
  ),
}

export const RichContent: Story = {
  render: () => (
    <div style={{ background: '#111', padding: '48px', display: 'flex', justifyContent: 'center' }}>
      <Tooltip
        content={
          <div>
            <div style={{ color: '#fcd34d', fontWeight: 'bold', marginBottom: '4px' }}>🔥 烈焰词缀</div>
            <div style={{ color: '#fb923c' }}>火焰伤害 +80</div>
            <div style={{ color: '#9ca3af', fontSize: '11px', marginTop: '4px' }}>命中时有20%几率点燃敌人</div>
          </div>
        }
        placement="right"
      >
        <span style={{ color: '#fb923c', cursor: 'pointer', fontSize: '13px' }}>🔥 烈焰（悬停查看）</span>
      </Tooltip>
    </div>
  ),
}

export const Placements: Story = {
  render: () => (
    <div style={{ background: '#111', padding: '80px', display: 'flex', gap: '48px', justifyContent: 'center', flexWrap: 'wrap' }}>
      {(['top', 'bottom', 'left', 'right'] as const).map(p => (
        <Tooltip key={p} content={`显示在${p}`} placement={p}>
          <span style={{ color: '#9ca3af', border: '1px solid #374151', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>
            {p}
          </span>
        </Tooltip>
      ))}
    </div>
  ),
}
