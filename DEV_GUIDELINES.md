# 开发准则 (Development Guidelines)

> 所有开发必须严格遵循本准则，后续新增要求需同步更新本文档。

---

## 一、代码组织

### 1.1 文件行数限制
- **单个文件不超过 500 行**（.tsx / .ts）
- 超过时应拆分为更小的组件或工具函数
- 组件内部辅助函数单独提取到 `lib/` 目录

### 1.2 组件化原则
- UI 组件放在 `src/components/ui/`
- 游戏组件放在 `src/components/game/`
- 每个组件独立一个文件，不做多组件合并
- 组件必须有 JSDoc 注释

### 1.3 状态管理与Store
- Zustand Store 负责状态管理
- Store 按功能模块拆分（playerStore / inventoryStore / combatStore 等）
- 组件使用 Store，不做冗余 localState（除非是纯 UI 状态）
- 禁止在 `setInterval` / `setTimeout` 回调中使用闭包捕获的 store 值，必须用 `Store.getState()` 实时读取

### 1.4 纯函数与工具
- 可复用的业务逻辑放在 `src/lib/game/`（如 combat.ts / stats.ts）
- 工具函数放在 `src/lib/utils.ts` 或按功能分文件
- 所有工具函数必须导出为独立函数（而非 class）

---

## 二、代码风格

### 2.1 命名规范
| 类型      | 规范                     | 示例                                   |
| --------- | ------------------------ | -------------------------------------- |
| 组件      | PascalCase               | `CombatArea.tsx`                       |
| Store     | camelCase + Store        | `playerStore.ts`                       |
| 类型/接口 | PascalCase               | `interface PlayerSave`                 |
| 常量      | camelCase 或 UPPER_SNAKE | `MAX_LEVEL` / `DEFAULT_INVENTORY_SIZE` |
| 函数      | camelCase                | `calculateDamage`                      |
| 文件      | camelCase / kebab-case   | `gameStore.ts` / `combat-log.ts`       |

### 2.2 注释规范
- 文件顶部：JSDoc `@fileoverview` + `@description`
- 导出函数/组件：JSDoc 说明用途、参数、返回值
- 复杂逻辑：行内注释说明 **为什么**（而非 **是什么**）

### 2.3 样式规范
- **必须使用 Tailwind CSS**，不允许内联 `<style>` 块
- 动画使用 CSS class（`animate-*`）配合 `globals.css` 中的 keyframes
- 禁止使用 `!important`，用 Tailwind 优先级规则解决
- 响应式：`sm:` / `md:` / `lg:` / `xl:` 前缀

---

## 三、UI/UX 准则

### 3.1 游戏级 UI（核心原则）
> **UI 要像游戏，不像网页。所有操作必须有视觉/听觉反馈。**

#### 必做反馈
- **每个按钮必须有 `cursor-pointer`**
- **每个按钮点击必须播放音效**（通过 `GameSoundProvider` 全局自动注入）
- **状态变化必须有过渡动画**（`transition-all duration-150` 起步）
- **伤害/奖励等事件必须飘字动画**

#### 动画类型（按场景使用）
| 场景         | 动画                                      |
| ------------ | ----------------------------------------- |
| 伤害飘字     | `animate-damage`（上升渐隐）              |
| 暴击         | `animate-crit-shake` + 屏幕微震           |
| 怪物死亡     | `animate-monster-death`                   |
| Boss登场     | `animate-boss-appear`                     |
| 低血量(<30%) | `animate-health-critical`（闪烁）         |
| 胜利         | `animate-victory` + `animate-reward-glow` |
| 失败         | `animate-defeat`                          |
| 战利品获得   | `animate-loot-drop`                       |
| 按钮按下     | `animate-btn-press`                       |
| 经验条       | `bar-exp-shimmer` 渐变流动                |

### 3.2 响应式设计
- **移动端优先**，桌面端增强
- PC 端全宽布局（不限制 `max-w`）
- 侧边栏在窄屏自动折叠到下方
- 所有组件在 375px / 768px / 1280px 三种视口下正常显示

### 3.3 无障碍
- 所有交互按钮有 `title` 属性
- Modal / 对话框支持 ESC 关闭
- 禁用状态按钮明确显示 `cursor-not-allowed`

---

## 四、测试要求

### 4.1 单元测试
- **所有 `src/lib/game/` 下的纯函数必须写单元测试**
- 使用 Vitest + Testing Library
- 测试文件放在 `tests/unit/lib/` 下，与源码一一对应
- 测试覆盖率目标：核心逻辑 100%

### 4.2 E2E 测试
- **所有 UI 组件/页面必须写 Playwright E2E 测试**
- 测试文件放在 `tests/e2e/`
- 必须测试的场景：
  - 元素可见且在视口内
  - 无溢出/重叠
  - 按钮点击有效
  - 响应式布局（多视口）
  - 无控制台 Error 日志

### 4.3 测试命名
```
describe('模块名', () => {
  it('行为描述', () => { ... })
})
```

---

## 五、Git 提交规范

### 5.1 提交粒度
- **一个功能 = 一次提交**
- 禁止"然后再改..."式的大杂烩提交
- Bug 修复单独提交，提交信息包含 Bug ID

### 5.2 提交信息格式
```
<type>: <简短描述>

[可选详细说明]
```

**Type 类型**：
| Type       | 用途                      |
| ---------- | ------------------------- |
| `feat`     | 新功能                    |
| `fix`      | Bug 修复（含 BUG-XXX ID） |
| `refactor` | 重构（不影响功能）        |
| `docs`     | 文档更新                  |
| `test`     | 测试相关                  |
| `style`    | 格式/样式（不影响逻辑）   |
| `perf`     | 性能优化                  |

**示例**：
```
fix: [BUG-002] 修复战斗循环中的死亡判断和状态同步问题
feat: 新增 Web Audio API 音效系统
docs: 更新 CHANGELOG.md，记录 0.2.0 版本所有变更
```

---

## 六、文档更新要求

### 6.1 每次提交必须同步更新
- `CHANGELOG.md` — 记录本次新增/修改的功能
- `SPEC.md` / `ROADMAP.md` — 标记已完成的任务（`[x]`）
- `BUGS.md` — 记录新发现的 Bug，修复后更新状态

### 6.2 文档要求
- 禁止提交"未记录的功能"
- Bug 修复必须记录在 `BUGS.md` 并附上修复方式和提交哈希

---

## 七、音效系统准则

### 7.1 必做音效场景
| 场景     | 音效类型  |
| -------- | --------- |
| 按钮点击 | `click`   |
| 攻击命中 | `attack`  |
| 战斗胜利 | `victory` |
| 战斗失败 | `defeat`  |
| 拾取物品 | `pickup`  |
| 升级     | `levelup` |

### 7.2 实现方式
- 使用 Web Audio API 程序化合成（`src/lib/game/sound.ts`）
- 通过 `GameSoundProvider` 全局注入（事件委托），无需手动在每个按钮添加
- **禁止引入音频文件**（MP3/WAV），零外部依赖

---

## 八 检查TODO.md的待办事项

1. 已经完成的做标记，没完成的继续开发

## 九、持续更新日志

> 每次开发新增要求，在此追加。

### 2026-04-13 新增
- [x] 单文件行数限制 500 行
- [x] UI 组件化
- [x] 所有工具函数写单元测试
- [x] UI 组件写 E2E 测试
- [x] UI 必须有动画和音效反馈
- [x] 每个按钮必须 `cursor-pointer`
- [x] 音效使用 Web Audio API，不引入外部音频文件
- [x] PC 端全宽布局，不限制 max-width
- [x] 每次提交同步更新 CHANGELOG / SPEC / ROADMAP
- [x] Git 提交必须包含功能/修改的描述，禁止大杂烩提交
- [x] 所有 Bug 必须记录到 BUGS.md 并单独 commit

---
