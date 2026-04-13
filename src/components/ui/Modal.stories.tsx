/**
 * @fileoverview Modal 组件 Storybook 文档
 */

'use client'

import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'

const meta: Meta<typeof Modal> = {
  title: 'UI/Modal',
  component: Modal,
  tags: ['autodocs'],
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        component: '通用弹窗组件，支持ESC关闭、遮罩关闭、底部操作区。',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof Modal>

/** 装备确认弹窗 */
export const EquipConfirm: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <div style={{ background: '#111', padding: '24px' }}>
        <Button variant="primary" onClick={() => setOpen(true)}>查看装备详情</Button>
        <Modal open={open} onClose={() => setOpen(false)} title="⚔️ 烈焰巨剑">
          <div style={{ color: '#fcd34d' }}>传说级双手剑</div>
          <div style={{ color: '#9ca3af', marginTop: '8px', fontSize: '13px' }}>
            <div>攻击力: 180-240</div>
            <div>力量 +45</div>
            <div>暴击率 +12%</div>
            <div>点燃伤害 +80%</div>
          </div>
          <Modal.Footer>
            <Button variant="primary" size="sm" onClick={() => setOpen(false)}>装备</Button>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>取消</Button>
          </Modal.Footer>
        </Modal>
      </div>
    )
  },
}

/** 危险操作确认 */
export const DangerConfirm: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <div style={{ background: '#111', padding: '24px' }}>
        <Button variant="danger" onClick={() => setOpen(true)}>重置角色</Button>
        <Modal open={open} onClose={() => setOpen(false)} title="⚠️ 确认重置">
          <p style={{ color: '#f87171' }}>此操作将清除所有进度，无法撤销！</p>
          <Modal.Footer>
            <Button variant="danger" size="sm" onClick={() => setOpen(false)}>确认重置</Button>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>取消</Button>
          </Modal.Footer>
        </Modal>
      </div>
    )
  },
}
