# UI 组件库文档

> 本目录包含所有可复用的基础UI组件，遵循暗黑破坏神风格设计（深色背景、琥珀/金色主色调）。
> 使用 Storybook 查看交互式文档：`npm run storybook`

---

## 组件列表

### Button — 按钮

文件：`Button.tsx`

通用按钮组件，支持多种视觉变体和尺寸。

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `variant` | `'primary' \| 'secondary' \| 'danger' \| 'ghost' \| 'success'` | `'secondary'` | 视觉变体 |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | 尺寸 |
| `loading` | `boolean` | `false` | 加载状态（禁用点击+显示spinner） |
| `leftIcon` | `ReactNode` | — | 左侧图标 |
| `rightIcon` | `ReactNode` | — | 右侧图标 |
| `fullWidth` | `boolean` | `false` | 撑满父容器 |

```tsx
<Button variant="primary" onClick={handleEquip}>装备</Button>
<Button variant="danger" size="sm">丢弃</Button>
<Button loading>战斗中...</Button>
```

---

### ProgressBar — 进度条

文件：`ProgressBar.tsx`

HP/MP/经验值进度条，支持动画和标签显示。

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `value` | `number` | — | 当前值 |
| `max` | `number` | — | 最大值 |
| `variant` | `'health' \| 'mana' \| 'exp' \| 'stamina' \| 'default'` | `'default'` | 颜色变体 |
| `showLabel` | `boolean` | `false` | 显示 value/max 标签 |
| `label` | `string` | — | 自定义标签文字 |
| `heightClass` | `string` | `'h-3'` | 高度（Tailwind类） |
| `animated` | `boolean` | `false` | 数值变化时平滑过渡 |

```tsx
<ProgressBar value={350} max={500} variant="health" showLabel animated />
<ProgressBar value={120} max={200} variant="mana" heightClass="h-2" />
<ProgressBar value={2800} max={5000} variant="exp" label="Lv.12 经验" />
```

---

### Badge — 徽章/标签

文件：`Badge.tsx`

装备稀有度、状态标识等小型标签组件。

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `variant` | `'default' \| 'magic' \| 'rare' \| 'unique' \| 'set' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'default'` | 颜色变体 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 尺寸 |
| `dot` | `boolean` | `false` | 仅显示圆形状态点 |

辅助函数：
- `getRarityBadgeVariant(rarity)` — 将物品稀有度字符串转换为Badge变体

```tsx
<Badge variant="rare">稀有</Badge>
<Badge variant="unique">传说</Badge>
<Badge dot variant="success" />  {/* 绿色状态点 */}
```

---

### Modal — 弹窗

文件：`Modal.tsx`

通用对话框，支持标题栏、底部操作区、ESC关闭。

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `open` | `boolean` | — | 是否显示 |
| `onClose` | `() => void` | — | 关闭回调 |
| `title` | `ReactNode` | — | 标题文字 |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `'md'` | 尺寸 |
| `closeOnBackdrop` | `boolean` | `true` | 点击遮罩是否关闭 |
| `showClose` | `boolean` | `true` | 是否显示关闭按钮 |

子组件：`Modal.Footer` — 底部操作区（右对齐，带分隔线）

```tsx
<Modal open={open} onClose={close} title="装备详情" size="sm">
  <p>烈焰巨剑 +120 攻击力</p>
  <Modal.Footer>
    <Button variant="primary" onClick={equip}>装备</Button>
    <Button variant="ghost" onClick={close}>取消</Button>
  </Modal.Footer>
</Modal>
```

---

### Input — 输入框

文件：`Input.tsx`

文本输入框，支持标签、前后缀、错误提示。

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `label` | `string` | — | 标签文字 |
| `error` | `string` | — | 错误提示（同时触发红色边框） |
| `hint` | `string` | — | 帮助文字 |
| `leftAddon` | `ReactNode` | — | 左侧附加内容 |
| `rightAddon` | `ReactNode` | — | 右侧附加内容 |
| `onChange` | `(value: string) => void` | — | 值变化回调 |

```tsx
<Input label="角色名称" value={name} onChange={setName} error={nameError} />
<Input label="搜索" leftAddon="🔍" placeholder="搜索物品..." />
```

---

### Tabs — 标签页

文件：`Tabs.tsx`

分页导航，支持图标、徽章数字、禁用状态。

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `tabs` | `TabItem[]` | — | Tab列表（key/label/icon/disabled/badge） |
| `activeKey` | `string` | — | 当前激活的key |
| `onChange` | `(key: string) => void` | — | 切换回调 |
| `variant` | `'line' \| 'pill'` | `'pill'` | 样式变体 |

```tsx
<Tabs
  tabs={[
    { key: 'bag', label: '背包', icon: '🎒', badge: 3 },
    { key: 'equip', label: '装备', icon: '⚔️' },
    { key: 'skill', label: '技能', icon: '✨', disabled: true },
  ]}
  activeKey={activeTab}
  onChange={setActiveTab}
/>
```

---

### Tooltip — 提示气泡

文件：`Tooltip.tsx`

鼠标悬停提示，适合装备词缀、技能说明等。

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `content` | `ReactNode` | — | 提示内容（支持富文本） |
| `placement` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` | 弹出方向 |
| `delay` | `number` | `200` | 延迟显示（毫秒） |
| `disabled` | `boolean` | `false` | 禁用提示 |

```tsx
<Tooltip content="暴击率 +15%，攻击速度 +10%">
  <span>🗡️ 影刃匕首</span>
</Tooltip>
```

---

### Select — 下拉选择

文件：`Select.tsx`

下拉选择框，支持分组、禁用项。

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `options` | `SelectOption[] \| SelectGroup[]` | — | 选项列表（支持分组） |
| `value` | `string` | — | 当前值 |
| `onChange` | `(value: string) => void` | — | 变化回调 |
| `label` | `string` | — | 标签 |
| `placeholder` | `string` | — | 占位符 |
| `error` | `string` | — | 错误提示 |

```tsx
<Select
  label="排序方式"
  options={[
    { value: 'level', label: '按等级' },
    { value: 'rarity', label: '按稀有度' },
    { value: 'type', label: '按类型' },
  ]}
  value={sortBy}
  onChange={setSortBy}
/>
```

---

## 设计规范

### 颜色体系
- **主色**：`amber-500/600/700` — 金色，用于主要操作和强调
- **危险**：`red-700/800/900` — 红色，用于删除、HP告急
- **魔法**：`blue-600/700` — 蓝色，用于魔法属性、MP
- **稀有**：`yellow-400/500` — 黄色，稀有装备
- **传说**：`orange-400/500` — 橙色，独特装备
- **套装**：`green-400/500` — 绿色，套装装备

### 背景层次
- `bg-gray-950` — 最深层（页面背景）
- `bg-gray-900` — 面板/卡片
- `bg-gray-800` — 输入框/元素
- `bg-gray-700` — 悬停态

### 间距规范
- 小间距：`gap-1 p-1.5`（紧凑元素）
- 中间距：`gap-2 p-3`（普通组件）
- 大间距：`gap-4 p-4`（面板内边距）
