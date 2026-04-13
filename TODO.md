# TODO.md - Diablo Idle 开发任务清单

> **重要**: 本文档是唯一的开发计划文档，合并了原 ROADMAP.md 和 SPEC.md 的规划内容。
> 其他文档（BUGS.md、CHANGELOG.md、DEV_GUIDELINES.md）是独立参考文档，不属于开发计划。

---

## 项目概述

**Diablo Idle** - 暗黑破坏神风格的放置idle游戏

### 核心循环
```
玩家创建角色 → 自动战斗打怪 → 获得经验和装备 → 升级和强化角色 → 挑战更强区域 → 获得更好装备 → 循环
```

### 项目工期预估
- Sprint 1-2 (基础框架+成瘾机制): 20-25h ✅ 已完成
- Sprint 3-18 (完整功能): 约 140-170h
- **总工期预估**: 160-195h

---

## 当前状态

| Sprint | 状态 | 完成内容 |
|--------|------|---------|
| Sprint 1 | ✅ 完成 | 基础框架、状态管理、UI组件库、响应式布局、游戏动画、音效、数据库 |
| Sprint 2 | ✅ 完成 | 图鉴系统、战斗日志、设置面板、技能协同、角色属性面板、panel-game渐变样式、程序化生成 |

**下一步**: Sprint 3 - 战斗系统完善

---

## 已完成功能清单

### 基础框架
- [x] Next.js + TypeScript + Tailwind CSS 暗黑主题
- [x] Zustand 状态管理（8个Store）
- [x] SQL.js 数据库 + 自动备份
- [x] Vitest 单元测试 + Playwright E2E测试

### 游戏组件
- [x] 角色创建（战士/法师/刺客）
- [x] 状态栏（HP/MP/经验/属性预览/元素抗性）
- [x] 战斗区域（自动攻击/技能/药水/逃跑）
- [x] 区域选择（4章节/等级解锁）
- [x] 背包面板（拖拽/整理/堆叠/响应式grid）
- [x] 技能面板（技能树/解锁升级/协同显示）
- [x] 装备面板（暗黑风格人形槽位/装备对比）
- [x] 图鉴面板（装备/怪物/技能 - 120+装备/50+怪物）
- [x] 战斗日志面板（过滤/时间戳/击杀统计）
- [x] 角色属性面板（属性分配/详细战斗属性）
- [x] 设置面板（音效/画面/通知/持久化）

### 程序化生成
- [x] 120+ 装备模板 (equipment-templates.json)
- [x] 50+ 怪物模板 (monster-templates.json)
- [x] generateItem / generateMonster / generateLootDrop

---

## 待开发任务（按优先级）

### 🔴 高优先级 - Sprint 3: 战斗系统完善

#### 3.1 技能施放系统
- [x] 技能实际生效（不只是显示）
- [x] 冷却时间显示和计时器
- [x] 技能消耗：法力值消耗
- [x] 协同加成实际计算

#### 3.2 被动技能效果
- [x] 被动技能属性加成实际生效
- [x] 协同加成实际生效
- [x] 技能等级影响数值

#### 3.3 战斗AI
- [ ] 怪物AI行为
- [ ] BOSS特殊技能
- [ ] 元素反应（火焰+冰冷=蒸发等）

---

### 🟡 中优先级 - Sprint 3: 成就与目标

#### 3.4 成就系统
- [x] 成就定义（60+成就，使用JSON数据驱动）
- [x] 成就检测和触发
- [x] 成就奖励：金币、经验、强化石
- [x] 成就界面

#### 3.5 排行榜
- [ ] 本地积分榜
- [ ] 每日/每周挑战

---

### 🟠 中优先级 - Sprint 4: 装备与物品

#### 3.6 装备强化系统
- [x] 强化石材料（普通/高级/完美）
- [x] 强化成功率（0-15级配置）
- [x] 强化特效动画（成功/失败弹窗）

#### 3.7 套装系统
- [x] 套装设计（8套JSON配置）
- [x] 套装奖励计算
- [x] 套装UI（查看激活的套装效果）

#### 3.8 词缀系统
- [x] 前缀池/后缀池（JSON驱动）
- [x] 词缀生成算法
- [x] 暗金装备（uniques.json）

---

### 🟢 低优先级 - Sprint 5: 社交与互动

#### 3.9 公会系统（可选）
- [ ] 创建/加入公会
- [ ] 公会技能
- [ ] 公会战

#### 3.10 聊天系统（可选）
- [ ] 世界频道
- [ ] 私聊

---

### 🟢 低优先级 - Sprint 6: AI创新

#### 3.11 AI队友基础
- [ ] 队友数据模型
- [ ] 性格系统
- [ ] 表情/动作

#### 3.12 AI记忆系统
- [ ] 情景记忆
- [ ] 知识记忆
- [ ] 偏好记忆

#### 3.13 AI酒馆对话
- [ ] 对话生成
- [ ] LangChain集成
- [ ] 好感度系统

---

### 🟢 低优先级 - 未来功能

#### 3.14 SQL.js用户系统
- [ ] schema.ts添加codex表
- [ ] 实现codexStore与sql.js的数据同步
- [ ] 支持多用户数据独立存储

#### 3.15 无尽层数系统
- [ ] 层数递进算法
- [ ] 怪物等级缩放
- [ ] 层数奖励

#### 3.16 离线收益系统
- [ ] 离线计算引擎
- [ ] 收益上限
- [ ] Web Worker后台运行

---

## Sprint 详细规划

### Sprint 1: 基础框架搭建（12-15小时）✅

| 模块 | 状态 | 文件 |
|------|------|------|
| 项目配置 | ✅ | next.config.js, tsconfig.json, tailwind.config.js |
| 状态管理 | ✅ | playerStore, inventoryStore, equipmentStore, skillStore, zoneStore, combatStore, settingsStore |
| 数据层 | ✅ | SQL.js, schema, migrations, backup |
| UI组件库 | ✅ | Button, Input, Modal, Tabs, Tooltip, ProgressBar |
| 暗黑主题 | ✅ | CSS variables, panel-game class |
| 音效系统 | ✅ | Web Audio API, 攻击/拾取/升级音效 |
| 响应式布局 | ✅ | Mobile-first, lg breakpoint |

### Sprint 2: 成瘾机制（8-10小时）✅

| 模块 | 状态 | 文件 |
|------|------|------|
| 图鉴系统 | ✅ | CodexPanel, codexStore |
| 战斗日志 | ✅ | CombatLogPanel |
| 设置面板 | ✅ | SettingsPanel |
| 技能协同 | ✅ | synergies in skills.ts, SkillsPanel tooltip |
| 属性面板 | ✅ | CharacterPanel |
| 渐变样式 | ✅ | panel-game CSS class |
| 程序化生成 | ✅ | procedural.ts, equipment-templates.json, monster-templates.json |

### Sprint 3: 战斗系统完善（10-12小时）📋

| 模块 | 状态 | 优先级 |
|------|------|--------|
| 技能施放 | [ ] | P0 |
| 冷却计时 | [ ] | P0 |
| 法力消耗 | [ ] | P0 |
| 被动技能 | [ ] | P1 |
| 协同计算 | [ ] | P1 |
| 怪物AI | [ ] | P2 |
| 元素反应 | [ ] | P3 |

### Sprint 4: 装备与物品（10-12小时）📋

| 模块 | 状态 | 优先级 |
|------|------|--------|
| 装备强化 | [ ] | P1 |
| 套装系统 | [ ] | P2 |
| 词缀系统 | [ ] | P2 |
| 开箱抽卡 | [ ] | P2 |

### Sprint 5-8: 社交与AI（40-50小时）📋

| 模块 | 状态 | 优先级 |
|------|------|--------|
| 公会系统 | [ ] | P3 |
| 排行榜 | [ ] | P2 |
| AI队友 | [ ] | P3 |
| AI酒馆 | [ ] | P3 |

### Sprint 9-18: 高级功能（60-80小时）📋

| 模块 | 状态 | 优先级 |
|------|------|--------|
| 无尽层数 | [ ] | P2 |
| 离线收益 | [ ] | P2 |
| 魔王系统 | [ ] | P4 |
| 神主系统 | [ ] | P4 |
| 赛季系统 | [ ] | P3 |

---

## 已完成文件清单

### 核心类型
```
src/types/
├── game.ts        ✅ 角色职业、属性、经验
├── combat.ts      ✅ 战斗、元素、伤害
├── items.ts       ✅ 装备、稀有度、词缀
├── enemy.ts       ✅ 怪物、区域
├── skills.ts      ✅ 技能树、协同加成
└── ai.ts          ✅ AI类型定义
```

### 游戏常量
```
src/constants/
├── items.ts        ✅ 物品前缀、后缀
├── enemies.ts      ✅ 怪物数据、区域数据
└── skills.ts      ✅ 三大职业技能树（含协同）
```

### 数据文件
```
src/data/
├── equipment-templates.json  ✅ 120+装备模板
└── monster-templates.json  ✅ 50+怪物模板
```

### 核心逻辑
```
src/lib/game/
├── combat.ts       ✅ 伤害公式、暴击、元素抗性
├── stats.ts        ✅ 属性计算、装备加成
├── sound.ts        ✅ Web Audio音效
└── procedural.ts  ✅ 程序化生成
```

### 数据库
```
src/lib/db/
├── schema.ts       ✅ 表结构
├── queries.ts      ✅ CRUD
├── migrations.ts   ✅ 迁移
└── backup.ts      ✅ 备份
```

### 状态管理
```
src/stores/
├── gameStore.ts        ✅ 门面聚合
├── playerStore.ts      ✅ 玩家数据
├── inventoryStore.ts  ✅ 背包
├── equipmentStore.ts  ✅ 装备
├── skillStore.ts      ✅ 技能
├── zoneStore.ts       ✅ 区域
├── combatStore.ts    ✅ 战斗
├── codexStore.ts     ✅ 图鉴
└── settingsStore.ts ✅ 设置
```

### UI组件
```
src/components/game/
├── CharacterCreate.tsx   ✅ 角色创建
├── StatusBar.tsx         ✅ 状态栏
├── CombatArea.tsx        ✅ 战斗区域
├── ZoneSelection.tsx     ✅ 区域选择
├── InventoryPanel.tsx    ✅ 背包
├── SkillsPanel.tsx      ✅ 技能
├── EquipmentPanel.tsx    ✅ 装备
├── CodexPanel.tsx       ✅ 图鉴
├── CombatLogPanel.tsx   ✅ 战斗日志
├── CharacterPanel.tsx   ✅ 角色属性
└── SettingsPanel.tsx    ✅ 设置
```

### 测试
```
tests/unit/lib/
├── combat.test.ts    ✅ 18个测试
└── stats.test.ts     ✅ 10个测试
tests/e2e/
├── character-create.spec.ts  ✅
└── panels.spec.ts          ✅
```

---

## 开发约定（来自 DEV_GUIDELINES.md）

### 文件行数限制
- 单个文件不超过 500 行
- 超过时拆分组件或工具函数

### 命名规范
| 类型 | 规范 | 示例 |
|------|------|------|
| 组件 | PascalCase | `CombatArea.tsx` |
| Store | camelCase + Store | `playerStore.ts` |
| 类型 | PascalCase | `interface PlayerSave` |
| 常量 | camelCase 或 UPPER_SNAKE | `MAX_LEVEL` |
| 函数 | camelCase | `calculateDamage` |

### 代码规范
- 所有中文注释
- 函数/组件必须有 JSDoc
- 类型定义使用 interface
- 常量使用 const 枚举

### Git提交规范
```
feat: 新功能
fix: 修复bug
refactor: 重构
docs: 文档
test: 测试
style: 格式调整
```

---

## Bug追踪（来自 BUGS.md）

| ID | 描述 | 严重程度 | 状态 |
|----|------|---------|------|
| BUG-001 | 区域选择组件在侧边栏溢出 | 🟡 中 | ✅ 已修复 |
| BUG-002 | 玩家死亡后仍可被攻击 | 🔴 高 | ✅ 已修复 |
| BUG-003 | 胜利界面金币显示不一致 | 🟡 中 | ✅ 已修复 |

---

## 参考文档

- `CHANGELOG.md` - 版本更新历史
- `DEV_GUIDELINES.md` - 开发准则（代码规范、命名、测试要求）
- `BUGS.md` - Bug追踪

---

**最后更新**: 2026-04-13
