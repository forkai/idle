# 自动探索系统设计文档

## 概述

自动探索模式是idle游戏的核心功能，让玩家可以"解放双手"同时保持参与感。本系统让玩家在开启后自动完成以下操作：

- 自动开始战斗
- 战后自动继续下一场战斗
- 低血量自动使用药水
- 区域效率降低时自动切换区域
- 优先挑战精英怪和Boss

---

## 1. 设计方案

### 1.1 自动探索开关

**位置**：战斗区域右上角 + 设置面板

**UI设计**：
```
┌─────────────────────────────┐
│  ⚔️ 战斗区域          [🔄]  │
│                     自动探索 │
└─────────────────────────────┘
```

- 按钮样式：`bg-amber-600/20 border-amber-500` 激活状态
- 悬停提示："自动探索模式"
- 开启时显示旋转动画

### 1.2 战斗流程自动化

**当前流程**：
```
玩家点击"挑战" → 战斗 → 胜利 → 手动点击"继续"或"下一区域"
```

**自动探索流程**：
```
自动开始战斗 → 战斗 → 胜利/失败
       ↓
[自动探索开启?] ──是──→ 自动开始下一场
       ↓否
   等待玩家
```

**实现要点**：
- 使用 `setInterval` 在战斗间隙自动调用 `startCombat()`
- 胜利后延迟 500ms 再开始下一场（给玩家看到奖励）
- 失败后延迟 3 秒（等待复活动画）再重试

### 1.3 药水自动使用

**策略**：
| 血量条件 | 使用药水 | 冷却 |
|---------|---------|------|
| HP < 30% | 小血瓶 | 15秒 |
| HP < 15% | 大血瓶 | 60秒 |
| HP < 5% | 优先大血瓶 | 60秒 |

**实现**：
```typescript
// 自动喝药水逻辑
const AUTO_POTION_COOLDOWN = 2000 // 2秒冷却防止重复触发
if (healthPercent < 0.3 && potionCount > 0 && !autoPotionCooldown) {
  useItem(potionItem.id)
  autoPotionCooldown = true
  setTimeout(() => { autoPotionCooldown = false }, AUTO_POTION_COOLDOWN)
}
```

### 1.4 区域饱和度系统

**概念**：每个区域有个"饱和点"，超过后掉落效率大幅降低，提示玩家换区。

**计算公式**：
```typescript
const SATURATION_POINT_BASE = 50
const SATURATION_POINT_PER_LEVEL = 10

// 区域饱和点
const saturationPoint = SATURATION_POINT_BASE + zoneLevel * SATURATION_POINT_PER_LEVEL

// 当前效率
const efficiency = Math.max(0.3, 1 - (killCount / saturationPoint))
```

**UI显示**：
```
暮光森林  Lv.10-18
💰1.0  ⭐1.0  📦1.0
██████████████████░░░░  效率: 67%
已击杀: 85/120    🔄 自动探索中
```

**自动切换逻辑**：
```typescript
if (efficiency < 0.5) {
  // 寻找下一个效率>70%的可探索区域
  const nextZone = findNextAvailableZone(currentZoneId, playerLevel)
  if (nextZone) {
    changeZone(nextZone.id)
    resetZoneKillCount()
  }
}
```

### 1.5 精英怪与Boss优先级

**策略**：
- 每击杀3只普通怪，有30%概率遇到精英怪
- 精英怪：2x经验和金币，必定掉落蓝色以上装备
- 每5场战斗后必定出现一次Boss（或手动挑战）

**UI提示**：
```
👹 挑战普通怪物  [👹+精英 30%]
👑 挑战BOSS     [⭐ 击杀后下次Boss血量+25%]
```

---

## 2. 数据结构

### 2.1 设置存储 (settingsStore)

```typescript
interface AutoExploreSettings {
  /** 是否开启自动探索 */
  enabled: boolean
  /** 自动使用药水 */
  autoPotion: boolean
  /** 自动切换区域 */
  autoSwitchZone: boolean
  /** 最低效率阈值（低于此值切换区域） */
  minEfficiencyThreshold: number // 0.3 ~ 0.7
  /** 优先挑战Boss */
  prioritizeBoss: boolean
}
```

### 2.2 区域状态扩展 (zoneStore)

```typescript
interface ZoneProgress {
  zoneId: string
  highestKills: number
  bossDefeated: boolean
  completedAt: number | null
  /** 当前区域击杀数（用于饱和度计算） */
  currentKillCount: number
  /** 累计获得的金币 */
  totalGoldEarned: number
  /** 累计获得的经验 */
  totalExpEarned: number
}
```

---

## 3. 组件设计

### 3.1 AutoExploreToggle 组件

**文件位置**：`src/components/game/AutoExploreToggle.tsx`

**功能**：
- 显示当前自动探索状态
- 点击切换开关
- 悬停显示详细设置弹窗

### 3.2 ZoneEfficiencyIndicator 组件

**文件位置**：`src/components/game/ZoneEfficiencyIndicator.tsx`

**功能**：
- 显示当前区域效率百分比
- 进度条可视化
- 效率过低时变色警告

### 3.3 CombatArea 改造

**新增**：
- 自动探索状态读取
- 自动战斗逻辑
- 自动喝水逻辑

---

## 4. 实现步骤

### Phase 1: 基础开关
- [ ] 在 settingsStore 添加 AutoExploreSettings
- [ ] 创建 AutoExploreToggle 组件
- [ ] 在 CombatArea 集成开关

### Phase 2: 自动战斗
- [ ] 实现 IDLE → 自动开始战斗
- [ ] 实现 VICTORY → 延迟后自动继续
- [ ] 实现 DEFEAT → 延迟后重试

### Phase 3: 自动药水
- [ ] 实现低血量自动喝水
- [ ] 添加冷却防止重复触发
- [ ] 显示"自动喝水"提示

### Phase 4: 区域切换
- [ ] 在 zoneStore 添加 currentKillCount
- [ ] 创建 ZoneEfficiencyIndicator 组件
- [ ] 实现效率检测和自动切换

### Phase 5: 精英怪
- [ ] 实现精英怪刷新逻辑
- [ ] UI显示精英怪概率
- [ ] 精英怪击杀奖励翻倍

---

## 5. 数值平衡

| 参数 | 默认值 | 说明 |
|-----|-------|------|
| SATURATION_POINT_BASE | 50 | 基础饱和点 |
| SATURATION_POINT_PER_LEVEL | 10 | 每级增加饱和点 |
| MIN_EFFICIENCY_THRESHOLD | 0.5 | 最低效率阈值 |
| AUTO_POTION_THRESHOLD_1 | 0.3 | 小血瓶阈值 |
| AUTO_POTION_THRESHOLD_2 | 0.15 | 大血瓶阈值 |
| ELITE_SPAWN_CHANCE | 0.3 | 精英怪刷新概率 |
| ELITE_KILL_FOR_BOSS | 5 | 精英杀完出现Boss |

---

## 6. 界面预览

### 战斗区域（自动探索开启）
```
┌────────────────────────────────────────┐
│ ⚔️ 战斗区域               [🔄 ⚙️]    │
├────────────────────────────────────────┤
│ 🧙 战士 Lv.25           💰 12,345    │
│ ❤️ ████████░░ 8,234/10,000           │
│ 💧 ██████░░░░ 456/800                 │
│ ⬆️ Lv.26还需 1,234 exp                │
├────────────────────────────────────────┤
│         🦇 暗影刺客                     │
│         Lv.24                          │
│         ❤️ ████████░░ 823/1,200        │
│                                        │
│    💥 -1,234 (暴击!)                  │
│    🔥 连击 x3 +10%                    │
├────────────────────────────────────────┤
│ [⚔️ 攻击] [✨ 技能] [🧪 药水:5] [💨] │
├────────────────────────────────────────┤
│ 暮光森林 Lv.10-18  效率: 67%  🔄 ON   │
│ ████████████░░░░░░  已击杀: 85/120   │
└────────────────────────────────────────┘
```

---

**最后更新**: 2026-04-14
