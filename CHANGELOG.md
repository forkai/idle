# 更新日志 (Changelog)

## [Unreleased]

---

## [0.2.0] - 2026-04-13

### Sprint 1.2: 状态管理架构重构

#### 重构
- **Store模块化拆分**: 将 `gameStore.ts` 拆分为 7 个独立 Store
  - `playerStore.ts` - 玩家数据（属性、经验、金币、等级）
  - `inventoryStore.ts` - 背包管理（物品堆叠、使用道具）
  - `equipmentStore.ts` - 装备管理（穿戴、卸下、属性刷新）
  - `skillStore.ts` - 技能状态（解锁、学习）
  - `zoneStore.ts` - 区域进度（当前区域、章节）
  - `combatStore.ts` - 战斗状态（自动攻击循环、敌人状态）
  - `settingsStore.ts` - 游戏设置（音效等）
  - `gameStore.ts` - 门面模式（向后兼容，组合7个Store）
- Zustand `getState()` 模式解决战斗循环中的闭包陈旧问题

#### 新增功能
- **Playwright E2E测试框架** (`tests/e2e/`)
  - `ui-layout.spec.ts` - 12项UI布局验证测试（溢出、重叠、可见性）
  - `playwright.config.ts` - 多浏览器配置（Chromium/Firefox/Mobile）
- **Storybook文档工具** - 组件自动化文档

### Sprint 1.4 收尾 + UI/UX优化

#### 样式与动画
- **游戏级CSS动画** (`src/app/globals.css`)
  - `damage-float` - 伤害飘字（上升渐隐）
  - `crit-shake` - 暴击屏幕震动
  - `monster-death` - 怪物死亡动画（缩放+变暗）
  - `boss-appear` - Boss登场动画（缩放+模糊消失）
  - `victory-bounce` - 胜利弹跳动画
  - `defeat-pulse` - 失败呼吸脉冲
  - `health-critical` - 低血量危险闪烁（HP<30%）
  - `loot-drop` - 战利品掉落弹跳
  - `btn-press` - 按钮按下反馈
  - `atk-flash` - 攻击闪烁
  - `reward-glow` - 奖励金色光晕
  - `zone-pulse` - 区域选中呼吸光效
  - `screen-shake` - 屏幕震动（大型暴击）
  - `bar-shimmer` - 经验条渐变流动
- **动画应用**:
  - MonsterCard: Boss登场 `animate-boss-appear`、低血量 `animate-health-critical`、死亡 `animate-monster-death`
  - 胜利状态: `animate-victory` + `animate-reward-glow` + `animate-loot-drop`
  - 失败状态: `animate-defeat`

#### 响应式布局
- **全宽PC布局**: 移除 `max-w` 宽度限制，主区域全宽
- **桌面端三栏**: 左侧状态栏 `xl:col-span-2`、中间战斗区 `xl:col-span-8`、右侧区域选择 `xl:col-span-2`
- **移动端**: 顶部紧凑状态栏、底部区域选择

#### 音效系统
- **Web Audio API音效** (`src/lib/game/sound.ts`)
  - 6种程序化合成音效：click / attack / victory / defeat / pickup / levelup
  - 无需外部音频文件，零依赖
- **全局点击音效** (`src/components/game/GameSoundProvider.tsx`)
  - 事件委托自动注入，所有按钮点击播放 click 音效

#### Bug修复
- **BUG-001**: ZoneSelection侧边栏溢出 → 改为 `flex-col` 单列布局
- **BUG-002**: 玩家死亡后敌人继续攻击 → 战斗循环内使用 `usePlayerStore.getState()` + HP>0判断
- **BUG-003**: 胜利金币随机不一致 → `lastRewards` state 保存实际计算值
- **BUG-004**: 死亡后无恢复提示 → DEFEAT状态显示3秒倒计时进度条
- **BUG-005**: 药水不消耗 → 从 `inventoryStore` 真实读取和消耗

#### 细节优化
- **cursor-pointer**: 所有按钮统一添加（包括 CombatArea/CharacterCreate/Modal/Tabs/page.tsx）
- **BUGS.md**: 新增 bug 跟踪文档，每次修复单独提交

---

## [0.1.0] - 2026-04-13

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
