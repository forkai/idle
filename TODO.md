# TODO.md - Claude Code 开发任务清单

## 当前状态
- **项目阶段**: Sprint 1: 基础框架搭建
- **已完成**: 项目初始化、核心类型系统、基础组件、单元测试、状态管理架构重构、UI组件库、Storybook文档、E2E测试框架
- **下一步**: Sprint 1.3 - 数据层架构（migrations + backup）

---

## 待开发任务（按优先级排序）

### 🔴 高优先级 - Sprint 1 剩余任务

#### 1.2 状态管理架构重构（已完成）
```
src/stores/
├── playerStore.ts      ✅ 玩家数据
├── inventoryStore.ts   ✅ 背包管理
├── equipmentStore.ts  ✅ 装备管理
├── skillStore.ts      ✅ 技能状态
├── zoneStore.ts       ✅ 区域进度
├── combatStore.ts     ✅ 战斗状态（已存在）
├── settingsStore.ts   ✅ 游戏设置
└── gameStore.ts        ✅ 门面模式（向后兼容）
```

**验收标准**：
- [x] 编译通过
- [x] 单元测试通过（28个测试全通过）
- [x] 手动测试各功能正常

---

### 🟡 中优先级 - Sprint 1 收尾

#### 1.3 数据层架构（3小时）
```
src/lib/db/
├── schema.ts          # 已有
├── queries.ts         # 已有
├── migrations/       # 新建 - 迁移脚本
└── backup.ts        # 新建 - 自动备份
```

#### 1.4 基础UI组件库（已完成）
```
src/components/ui/
├── Button.tsx         ✅ 通用按钮
├── Input.tsx          ✅ 文本输入框
├── Select.tsx         ✅ 下拉选择框
├── Modal.tsx          ✅ 弹窗组件
├── Tabs.tsx          ✅ 标签页
├── Tooltip.tsx       ✅ 提示气泡
├── Badge.tsx         ✅ 徽章/稀有度标签
└── ProgressBar.tsx   ✅ 进度条
Storybook文档: src/components/ui/README.md
```

#### 1.5 暗黑主题系统（2小时）
- 更新 `src/app/globals.css`
- 支持亮色/暗色切换

#### 1.6 国际化配置（1小时）
```
src/locales/
├── zh.json           # 中文语言包
└── en.json          # 英文语言包
```

---

### 🟢 低优先级 - Sprint 2+ 任务

#### Sprint 2: 角色系统（8-10小时）
- 角色创建UI完善
- 属性分配面板
- 升级弹窗
- 转职系统设计

#### Sprint 3: 战斗系统（10-12小时）
- 战斗循环优化
- 元素系统
- 技能系统
- 战斗特效

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
├── gameStore.ts     ⚠️ 待拆分
└── combatStore.ts   ✅ 战斗状态
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
└── ZoneSelection.tsx    ✅ 区域选择
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

### 第一步：执行状态管理重构
```bash
cd "c:\文档\Code\idle"
npm run dev  # 启动开发服务器
```

### 参考文件
- `ROADMAP.md` - 完整路线图
- `SPEC.md` - 设计文档
- `src/stores/gameStore.ts` - 需要拆分的内容

---

**最后更新**: 2026-04-13
