# 更新日志 (Changelog)

## [Unreleased] - 详细开发规划

### 重大更新：完整开发计划

#### 新增内容

##### 详细开发规划文档
- **总工期预估**: 83-106小时（12-13个Sprint）
- **Sprint 1**: 基础框架搭建（12-15小时）
  - 项目配置与初始化
  - 状态管理架构（7个Store模块）
  - 数据层架构（SQL.js + 迁移系统）
  - 基础UI组件库（10+组件）
  - 暗黑主题系统
  - 国际化配置
- **Sprint 2**: 角色系统（8-10小时）
  - 角色创建系统
  - 属性系统与分配
  - 升级系统
  - 三大职业深度开发
- **Sprint 3**: 战斗系统（10-12小时）
  - 基础战斗机制
  - 元素系统
  - 技能系统
  - 战斗UI与动画
- **Sprint 4**: 地图与怪物系统（8-10小时）
  - 区域系统
  - 怪物AI与掉落
  - 第一章完整内容
- **Sprint 5**: 装备系统（10-12小时）
  - 10个装备槽位
  - 60+词缀
  - 强化与打造系统
- **Sprint 6**: 背包与仓库（4-5小时）
- **Sprint 7**: 技能树系统（6-8小时）
- **Sprint 8**: 离线收益系统（4-5小时）
- **Sprint 9**: 经济系统（4-5小时）
- **Sprint 10**: 成就与进度系统（3-4小时）
- **Sprint 11**: UI/UX优化（4-5小时）
- **Sprint 12**: AI功能付费DLC（12-15小时）
  - AI战斗助手
  - AI装备推荐
  - AI酒馆系统
  - AI地图探索
- **Sprint 13**: 内容扩展（8-10小时）

##### 功能模块细化
- 伤害计算公式详解
- 装备稀有度系统详细设计
- 核心玩法循环图

---

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
- AI功能（作为付费DLC模块设计）

#### 构建状态
- ✅ TypeScript编译通过
- ✅ 生产构建成功
- ✅ 28个单元测试全部通过
