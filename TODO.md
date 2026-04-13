# TODO.md - Claude Code 开发任务清单

## 当前状态
- **项目阶段**: Sprint 2 ✅ 完成
- **已完成**: 项目初始化、核心类型系统、基础组件、单元测试、状态管理架构重构、UI组件库、Storybook文档、E2E测试框架、响应式布局、游戏动画、全球音效、数据层（迁移+备份）、背包UI（拖拽+详情+排序）、技能UI（技能树+解锁升级）、装备面板（暗黑风格人形+位置槽位）、图鉴系统（装备/怪物/技能）、战斗日志系统、技能协同系统、角色属性面板、设置面板、panel-game渐变样式、程序化生成系统（120+装备、50+怪物JSON数据）
- **下一步**: Sprint 3 - 战斗系统完善、成就系统、排行榜

---

## 待办事项（用户随时会加新的需求，完成了请做标记）

1. 装备系统：增加装备和已穿戴的装备的对比 ✅ 已完成
2. 修复装备系统UI布局 ✅ 已完成
3. 研究怎么生成上百种装备和怪物，每个装备和怪物都有自己的属性和技能，并且这些数据全部放在json中去 ✅ 已完成（120+装备模板、50+怪物模板）
4. 按钮或者各种面板添加渐变色或者背景，不要纯色，纯色不像游戏 ✅ 已完成（panel-game CSS类）


## Sprint 2 已完成详情

### 图鉴系统 ✅
- [x] 装备图鉴：显示所有已知装备，未获得显示灰色剪影，点击查看详情
- [x] 怪物图鉴：显示所有遇到的怪物，未遇到显示灰色剪影
- [x] 技能图鉴：显示所有职业技能，未解锁显示灰色

### 战斗记录系统 ✅
- [x] CombatLogPanel组件：过滤标签（全部/伤害/掉落/升级/技能）
- [x] 颜色编码日志条目，带时间戳
- [x] 击杀计数器和连杀显示
- [x] 自动滚动，底部滚动提示按钮

### 设置功能 ✅
- [x] SettingsPanel组件：音效开关、音量调节
- [x] 画面设置：战斗动画、伤害数字、战斗日志
- [x] 通知设置：升级、稀有掉落、离线奖励
- [x] localStorage持久化

### 技能树复杂化 ✅
- [x] 技能协同系统：所有24个技能添加synergies字段
- [x] 协同加成显示：悬浮提示和详情面板
- [x] 战士/法师/刺客各有8-10个技能带协同

### 角色属性面板 ✅
- [x] CharacterPanel组件：属性点分配（力量/敏捷/体力/能量）
- [x] 详细战斗属性：伤害、防御、暴击、攻速、暴击伤害
- [x] 元素抗性：火焰/冰冷/闪电/毒素
- [x] HP/Mana恢复速度显示

### UI增强 ✅
- [x] panel-game CSS类：渐变背景+金色装饰线
- [x] 新导航标签：📜战斗日志、👤角色属性
- [x] StatusBar增强：元素抗性行、恢复属性

### 程序化生成 ✅
- [x] equipment-templates.json：120+装备模板
- [x] monster-templates.json：50+怪物模板
- [x] procedural.ts：generateItem、generateMonster、generateLootDrop


---

## 待开发任务（按优先级排序）

### 🔴 高优先级 - Sprint 3: 战斗系统完善

#### 3.1 技能施放系统
- [ ] 技能实际生效（不只是显示）
- [ ] 冷却时间显示和计时器
- [ ] 技能消耗：法力值消耗

#### 3.2 被动技能效果
- [ ] 被动技能属性加成实际生效
- [ ] 协同加成实际生效

#### 3.3 战斗AI
- [ ] 怪物AI行为
- [ ] BOSS特殊技能

---

### 🟡 中优先级 - Sprint 3: 成就系统

#### 3.4 成就系统
- [ ] 成就定义（100+成就）
- [ ] 成就检测和触发
- [ ] 成就奖励：金币、经验、专属装备
- [ ] 成就界面

#### 3.5 排行榜
- [ ] 本地积分榜
- [ ] 每日/每周挑战

---

### 🟢 低优先级 - Sprint 3: 社交与互动

#### 3.6 公会系统（可选）
- [ ] 创建/加入公会
- [ ] 公会技能
- [ ] 公会战

#### 3.7 聊天系统（可选）
- [ ] 世界频道
- [ ] 私聊

---

## 已完成文件清单

### 核心类型（不可修改）
```
src/types/
├── game.ts           ✅ 角色职业、属性、经验
├── combat.ts         ✅ 战斗、元素、伤害
├── items.ts          ✅ 装备、稀有度、词缀
├── enemy.ts          ✅ 怪物、区域
├── skills.ts        ✅ 技能树、技能效果、协同加成
└── ai.ts            ✅ AI类型定义
```

### 游戏常量
```
src/constants/
├── items.ts         ✅ 物品前缀、后缀、装备模板
├── enemies.ts        ✅ 怪物数据、区域数据
└── skills.ts       ✅ 三大职业技能树（含协同）
```

### 数据文件
```
src/data/
├── equipment-templates.json  ✅ 120+装备模板（程序化生成源）
└── monster-templates.json   ✅ 50+怪物模板（程序化生成源）
```

### 核心逻辑
```
src/lib/game/
├── combat.ts        ✅ 伤害公式、暴击、元素抗性
├── stats.ts         ✅ 属性计算、装备加成
├── sound.ts         ✅ Web Audio音效
└── procedural.ts    ✅ 程序化生成（装备/怪物/掉落）
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
├── codexStore.ts       ✅ 图鉴定居（新增）
└── settingsStore.ts    ✅ 游戏设置
```

### UI组件
```
src/components/game/
├── CharacterCreate.tsx   ✅ 角色创建
├── StatusBar.tsx        ✅ 状态栏（含元素抗性、恢复属性）
├── CombatArea.tsx       ✅ 战斗区域
├── ZoneSelection.tsx    ✅ 区域选择
├── InventoryPanel.tsx   ✅ 背包面板（响应式grid+拖拽）
├── SkillsPanel.tsx     ✅ 技能面板（协同显示）
├── EquipmentPanel.tsx  ✅ 装备面板（暗黑风格人形槽位）
├── CodexPanel.tsx      ✅ 图鉴面板（装备/怪物/技能）
├── CombatLogPanel.tsx  ✅ 战斗日志面板（过滤+时间戳）
├── CharacterPanel.tsx  ✅ 角色属性面板（属性分配）
└── SettingsPanel.tsx   ✅ 设置面板（音效/画面/通知）
```

### 测试
```
tests/unit/lib/
├── combat.test.ts    ✅ 18个测试
└── stats.test.ts     ✅ 10个测试
tests/e2e/
├── character-create.spec.ts  ✅ 角色创建E2E测试
└── panels.spec.ts           ✅ 面板导航E2E测试
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

### 第一步：开始Sprint 3 - 战斗系统完善
```bash
cd "c:\文档\Code\idle"
npm run dev  # 启动开发服务器
```

### Sprint 3 功能入口
- 技能施放：战斗中点击技能按钮释放
- 成就系统：新增导航标签 🏆
- 排行榜：集成到角色面板

### 参考文件
- `ROADMAP.md` - 完整路线图
- `SPEC.md` - 设计文档
- `TODO.md` - 当前任务清单

---

**最后更新**: 2026-04-13
