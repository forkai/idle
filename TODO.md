# TODO.md - Claude Code 开发任务清单

## 当前状态
- **项目阶段**: Sprint 1: 基础框架搭建 ✅ 完成
- **已完成**: 项目初始化、核心类型系统、基础组件、单元测试、状态管理架构重构、UI组件库、Storybook文档、E2E测试框架、响应式布局、游戏动画、全球音效、数据层（迁移+备份）、背包UI（拖拽+详情+排序）、技能UI（技能树+解锁升级）、装备面板（暗黑风格人形+位置槽位）
- **下一步**: Sprint 2 - 图鉴系统 + 战斗记录 + 设置功能

---

## 待办事项（用户随时会加新的需求，完成了请做标记）

1. 装备系统：增加装备和已穿戴的装备的对比；
2. 修复装备系统UI布局
3. 研究怎么生成上百种装备和怪物，每个装备和怪物都有自己的属性和技能，并且这些数据全部放在json中去
4. 按钮或者各种面板添加渐变色或者背景，不要纯色，纯色不像游戏


## 待开发任务（按优先级排序）

### 🔴 高优先级 - Sprint 2: 图鉴系统

#### 2.1 装备图鉴
- 图鉴页面：显示所有已知装备
- 未获得的装备显示为灰色剪影
- 点击可查看装备详情（属性、词缀、掉落地）
- 分类筛选（按槽位、按稀有度）

#### 2.2 怪物图鉴
- 图鉴页面：显示所有遇到的怪物
- 未遇到的怪物显示为灰色剪影
- 点击查看怪物详情（属性、技能、掉落）
- 区域分类筛选

#### 2.3 技能图鉴
- 显示所有职业技能
- 未解锁技能显示为灰色
- 查看技能效果、冷却、消耗

---

### 🟡 中优先级 - Sprint 2: 战斗记录

#### 2.4 战斗记录系统
- 记录每场战斗：玩家伤害、承受伤害、击杀时间
- 战斗统计：最高伤害、技能使用次数
- 伤害统计：物理/魔法伤害占比
- 战斗回放日志

---

### 🟡 中优先级 - Sprint 2: 设置功能

#### 2.5 设置面板
- 音效开关（攻击/拾取/升级/按钮音效）
- 音效音量调节
- 自动播放音效开关
- 游戏速度（1x/2x）
- 离线收益开关

---

### 🟠 中优先级 - Sprint 3: 角色系统复杂化

#### 3.1 技能树复杂化
- 每职业至少3层进阶技能
- 主动/被动技能分类
- 技能觉醒系统（高级形态）
- 技能联动效果显示

#### 3.2 角色属性面板复杂化
- 详细属性面板：抗性、穿透、减免等
- 属性变化历史/收益统计
- 战斗力评分系统
- 装备评分/对比

---

---

## 已完成文件清单

### 核心类型（不可修改）
```
src/types/
├── game.ts           ✅ 角色职业、属性、经验
├── combat.ts         ✅ 战斗、元素、伤害
├── items.ts          ✅ 装备、稀有度、词缀
├── enemy.ts          ✅ 怪物、区域
├── skills.ts        ✅ 技能树、技能效果
└── ai.ts            ✅ AI类型定义
```

### 游戏常量
```
src/constants/
├── items.ts         ✅ 物品前缀、后缀、装备模板
├── enemies.ts        ✅ 怪物数据、区域数据
└── skills.ts       ✅ 三大职业技能树
```

### 核心逻辑
```
src/lib/game/
├── combat.ts        ✅ 伤害公式、暴击、元素抗性
└── stats.ts         ✅ 属性计算、装备加成
```

### 状态管理
```
src/stores/
├── gameStore.ts        ✅ 门面模式（聚合各Store）
├── playerStore.ts      ✅ 玩家数据
├── inventoryStore.ts   ✅ 背包管理
├── equipmentStore.ts   ✅ 装备管理
├── skillStore.ts       ✅ 技能状态
├── zoneStore.ts        ✅ 区域进度
├── combatStore.ts      ✅ 战斗状态
└── settingsStore.ts    ✅ 游戏设置
```

### 数据库
```
src/lib/db/
├── schema.ts        ✅ 表结构定义
└── queries.ts       ✅ CRUD操作
```

### UI组件
```
src/components/game/
├── CharacterCreate.tsx   ✅ 角色创建
├── StatusBar.tsx        ✅ 状态栏
├── CombatArea.tsx       ✅ 战斗区域
├── ZoneSelection.tsx    ✅ 区域选择
├── InventoryPanel.tsx   ✅ 背包面板（拖拽+详情+排序）
├── SkillsPanel.tsx      ✅ 技能面板（技能树+解锁升级）
└── EquipmentPanel.tsx   ✅ 装备面板（暗黑风格人形槽位）
```

### 测试
```
tests/unit/lib/
├── combat.test.ts    ✅ 18个测试
└── stats.test.ts     ✅ 10个测试
tests/setup.ts         ✅ 测试配置
```

### 文档
```
SPEC.md               ✅ 设计文档
ROADMAP.md           ✅ 开发路线图
CHANGELOG.md         ✅ 更新日志
```

---

## 开发约定

### 代码规范
- 所有中文注释
- 函数/组件必须有JSDoc
- 类型定义使用interface
- 常量使用const枚举

### Git提交规范
```
feat: 新功能
fix: 修复bug
refactor: 重构
docs: 文档
test: 测试
style: 格式调整
```

### 文件命名
- 组件：PascalCase（`CharacterCreate.tsx`）
- Store：camelCase + Store后缀（`playerStore.ts`）
- 类型：PascalCase（`CharacterClass`）
- 常量：camelCase（`MAX_LEVEL`）

---

## 下次继续开发

### 第一步：开始Sprint 2 - 图鉴系统
```bash
cd "c:\文档\Code\idle"
npm run dev  # 启动开发服务器
```

### 新增功能入口
- 图鉴系统：新增导航标签 📖
- 战斗记录：集成到战斗面板
- 设置功能：点击 ⚙️ 按钮打开

### 参考文件
- `ROADMAP.md` - 完整路线图
- `SPEC.md` - 设计文档
- `TODO.md` - 当前任务清单

---

**最后更新**: 2026-04-13
