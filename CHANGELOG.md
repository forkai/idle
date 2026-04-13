# 更新日志 (Changelog)

## [0.1.0] - 2026-04-13

### 首次提交 - 项目基础框架

#### 新增功能

##### 项目初始化
- Next.js 14+ 项目配置
- TypeScript 严格模式配置
- Tailwind CSS 暗黑风格主题配置
- Vitest 单元测试框架配置

##### 游戏核心类型系统
- `src/types/game.ts` - 游戏核心类型（角色职业、属性、经验系统）
- `src/types/combat.ts` - 战斗类型（元素、伤害、战斗事件）
- `src/types/items.ts` - 物品系统类型（装备、稀有度、词缀）
- `src/types/enemy.ts` - 怪物系统类型（区域、怪物分类）
- `src/types/skills.ts` - 技能系统类型（技能树、技能效果）
- `src/types/ai.ts` - AI系统类型定义（付费模块预留）

##### 游戏常量数据
- `src/constants/items.ts` - 物品数据（前缀、后缀、基础装备模板）
- `src/constants/enemies.ts` - 怪物数据（第一章区域、怪物、Boss）
- `src/constants/skills.ts` - 技能数据（三大职业完整技能树）

##### 游戏核心逻辑
- `src/lib/game/combat.ts` - 战斗计算系统（伤害公式、元素抗性、暴击判定）
- `src/lib/game/stats.ts` - 属性计算系统（角色属性、装备加成）

##### 状态管理
- `src/stores/gameStore.ts` - 游戏状态Store（玩家数据、背包、装备）
- `src/stores/combatStore.ts` - 战斗状态Store（战斗循环、战斗日志）

##### 数据库层
- `src/lib/db/schema.ts` - 数据库Schema定义（SQL.js）
- `src/lib/db/queries.ts` - 数据库CRUD操作

##### UI组件
- `src/components/game/CharacterCreate.tsx` - 角色创建组件
- `src/components/game/StatusBar.tsx` - 角色状态栏组件
- `src/components/game/CombatArea.tsx` - 战斗区域组件
- `src/components/game/ZoneSelection.tsx` - 区域选择组件

##### 样式设计
- `src/app/globals.css` - 暗黑破坏神风格全局样式（配色、按钮、状态条等）

##### 测试文件
- `tests/unit/lib/combat.test.ts` - 战斗系统单元测试（18个测试）
- `tests/unit/lib/stats.test.ts` - 属性系统单元测试（10个测试）
- `tests/setup.ts` - Vitest测试环境配置

#### 技术栈
- **前端框架**: Next.js 16.2.3 (App Router)
- **语言**: TypeScript 5.x
- **样式**: Tailwind CSS 4.x
- **状态管理**: Zustand 5.x + Immer
- **数据库**: SQL.js (浏览器端SQLite)
- **测试**: Vitest 4.x + Testing Library

#### 游戏功能
- 三大职业：战士、法师、刺客
- 第一章区域：鲜血湿地、黑暗洞穴、不死族墓穴
- 战斗系统：自动攻击、技能、暴击、元素抗性
- 物品系统：随机装备生成、词缀系统、稀有度
- 技能系统：三大职业完整技能树（每职业10个技能）
- 离线收益系统（设计完成，待实现）
- AI功能（作为付费DLC模块设计）

#### 设计文档
- `SPEC.md` - 完整游戏设计文档
- `CHANGELOG.md` - 本更新日志

---

## 计划中的功能

### Phase 1: MVP完成
- 背包系统UI
- 装备系统UI
- 技能树UI

### Phase 2: 深度系统
- 技能树系统完善
- 离线收益系统
- 存档系统

### Phase 3: 内容扩展
- 更多区域和章节
- 更多装备和暗金物品
- 套装系统
- 剧情事件系统

### Phase 4: AI功能（付费DLC）
- AI战斗助手模块
- AI装备推荐系统
- AI酒馆交互功能
- LangChain + LangGraph集成
