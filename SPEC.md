# 暗黑破坏神风格放置idle游戏 - 开发设计文档

## 📋 项目概述

### 项目名称
**Diablo Idle** - 暗黑破坏神风格的放置idle游戏

### 项目愿景
一款融合暗黑破坏神经典元素的放置类挂机游戏，玩家扮演冒险者在地牢中探险，击败恶魔获取装备和经验，通过离线收益和自动化战斗机制实现持续成长。游戏强调：
- 暗黑破坏神的哥特式视觉风格
- 丰富的装备系统和词缀机制
- 多职业体系与技能树
- 离线收益与放置机制
- AI辅助的智能战斗系统

---

## 📐 项目架构设计

### 技术栈
```
前端框架: Next.js 14+ (App Router)
语言: TypeScript 5.x (严格模式)
样式: Tailwind CSS 4.x + shadcn/ui
状态管理: Zustand + Immer
数据库: SQL.js (浏览器端SQLite)
测试: Vitest + React Testing Library + Playwright
AI集成: LangChain + LangGraph (规划中)
打包: Turbopack
```

### 项目目录结构
```
diablo-idle/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (game)/               # 游戏主页面组
│   │   │   ├── layout.tsx        # 游戏布局
│   │   │   ├── page.tsx          # 游戏主界面
│   │   │   ├── inventory/        # 背包页面
│   │   │   ├── skills/           # 技能树页面
│   │   │   ├── equipment/        # 装备页面
│   │   │   └── settings/         # 设置页面
│   │   ├── api/                  # API路由
│   │   │   └── ai/               # AI相关API
│   │   ├── layout.tsx            # 根布局
│   │   └── globals.css           # 全局样式
│   │
│   ├── components/               # React组件
│   │   ├── ui/                   # shadcn/ui基础组件
│   │   ├── game/                 # 游戏业务组件
│   │   │   ├── Character/        # 角色展示组件
│   │   │   ├── Combat/           # 战斗系统组件
│   │   │   ├── Equipment/        # 装备系统组件
│   │   │   ├── Skills/           # 技能系统组件
│   │   │   └── Map/              # 地图系统组件
│   │   └── layout/               # 布局组件
│   │
│   ├── lib/                      # 工具库
│   │   ├── db/                   # 数据库相关
│   │   │   ├── schema.ts        # 数据模型
│   │   │   ├── queries.ts       # 数据库操作
│   │   │   └── migrations/      # 数据库迁移
│   │   ├── game/                 # 游戏核心逻辑
│   │   │   ├── combat.ts        # 战斗计算
│   │   │   ├── items.ts         # 物品系统
│   │   │   ├── skills.ts        # 技能系统
│   │   │   └── stats.ts         # 属性计算
│   │   ├── ai/                   # AI集成模块
│   │   │   ├── agent.ts         # AI代理
│   │   │   ├── chains.ts        # LangChain链
│   │   │   └── graph.ts         # LangGraph工作流
│   │   └── utils/               # 通用工具
│   │
│   ├── stores/                  # Zustand状态管理
│   │   ├── gameStore.ts         # 游戏状态
│   │   ├── playerStore.ts       # 玩家状态
│   │   └── uiStore.ts           # UI状态
│   │
│   ├── hooks/                    # 自定义Hooks
│   │   ├── useGameLoop.ts       # 游戏循环
│   │   ├── useOfflineProgress.ts # 离线收益
│   │   └── useAutoSave.ts       # 自动保存
│   │
│   ├── types/                    # TypeScript类型定义
│   │   ├── game.ts              # 游戏类型
│   │   ├── combat.ts            # 战斗类型
│   │   ├── items.ts             # 物品类型
│   │   └── ai.ts                # AI类型
│   │
│   └── constants/               # 常量定义
│       ├── items.ts             # 物品数据
│       ├── enemies.ts           # 敌人数据
│       ├── skills.ts            # 技能数据
│       └── zones.ts             # 区域数据
│
├── tests/                        # 测试文件
│   ├── unit/                    # 单元测试
│   │   ├── lib/
│   │   ├── components/
│   │   └── stores/
│   └── integration/             # 集成测试
│
├── public/                       # 静态资源
│   └── assets/
│
├── docs/                         # 开发文档
│   ├── architecture.md         # 架构文档
│   ├── database-schema.md     # 数据库设计
│   └── ai-integration.md      # AI集成设计
│
└── package.json
```

---

## 🎮 功能模块详细设计

### 1. 角色系统 (Character System)

#### 1.1 职业体系
```typescript
// 三大经典职业
enum CharacterClass {
  WARRIOR = "warrior",     // 战士 - 物理近战
  SORCERER = "sorcerer",   // 法师 - 魔法远程
  ROGUE = "rogue"          // 刺客 - 物理远程/陷阱
}

// 每个职业有独特的属性成长和技能树
```

#### 1.2 属性系统
```typescript
interface CharacterStats {
  // 基础属性
  strength: number;      // 力量 - 物理伤害
  dexterity: number;     // 敏捷 - 攻击速度/闪避
  vitality: number;     // 体力 - 生命值/防御
  energy: number;        // 能量 - 法力值/魔法伤害

  // 战斗属性
  health: number;        // 当前生命
  mana: number;          // 当前法力
  damage: number;        // 伤害
  defense: number;        // 防御
  attackSpeed: number;   // 攻击速度
  critChance: number;    // 暴击率
  critDamage: number;    // 暴击伤害

  // 抗性
  fireResist: number;    // 火焰抗性
  coldResist: number;    // 冰冷抗性
  lightningResist: number; // 闪电抗性
  poisonResist: number;  // 毒素抗性
}
```

### 2. 战斗系统 (Combat System)

#### 2.1 实时战斗机制
- 自动攻击：角色自动攻击当前目标
- 攻击间隔：根据攻击速度计算
- 伤害计算：参考暗黑破坏神公式
- 暴击机制：暴击造成双倍伤害
- 元素伤害：火、冰、电、毒四种元素

#### 2.2 战斗公式（暗黑破坏神风格）
```typescript
// 伤害计算公式
const calculateDamage = (attacker: CharacterStats, defender: CharacterStats, skill: Skill): DamageResult => {
  const weaponDamage = attacker.damage;
  const skillMultiplier = skill.damageMultiplier;

  // 基础伤害
  let damage = weaponDamage * skillMultiplier;

  // 暴击判定
  const isCrit = Math.random() < attacker.critChance;
  if (isCrit) {
    damage *= attacker.critDamage;
  }

  // 防御减免 (暗黑风格: 伤害 * 防御 / (防御 + 某个常数))
  const damageReduction = defender.defense / (defender.defense + 100);
  damage *= (1 - damageReduction);

  // 元素伤害加成
  if (skill.element) {
    damage = applyElementalResist(damage, defender, skill.element);
  }

  return { damage, isCrit, finalDamage: Math.floor(damage) };
};
```

### 3. 装备系统 (Equipment System)

#### 3.1 装备槽位
```typescript
enum EquipmentSlot {
  HEAD = "head",           // 头部
  CHEST = "chest",         // 胸甲
  GLOVES = "gloves",       // 手套
  BOOTS = "boots",         // 靴子
  BELT = "belt",           // 腰带
  SHIELD = "shield",       // 盾牌
  RING1 = "ring1",         // 戒指1
  RING2 = "ring2",         // 戒指2
  AMULET = "amulet",       // 护符
  WEAPON = "weapon",       // 武器
}
```

#### 3.2 装备稀有度
```typescript
enum ItemRarity {
  NORMAL = "normal",       // 普通 - 白色
  MAGIC = "magic",         // 魔法 - 蓝色
  RARE = "rare",           // 稀有 - 黄色
  UNIQUE = "unique",       // 独特 - 橙色
  SET = "set"              // 套装 - 绿色
}
```

#### 3.3 词缀系统（暗黑风格）
```typescript
// 前缀 (影响数值)
const prefixes = [
  { name: "强化的", effect: { damage: 10 } },
  { name: "活力的", effect: { health: 50 } },
  { name: "聪慧的", effect: { mana: 30 } },
  // ... 更多前缀
];

// 后缀 (附加属性)
const suffixes = [
  { name: "力量", effect: { strength: 5 } },
  { name: "敏捷", effect: { dexterity: 5 } },
  // ... 更多后缀
];

// 暗金物品有固定词缀
interface UniqueItem extends Item {
  fixedAffixes: Affix[];  // 固定词缀
  setBonus?: SetBonus;    // 套装奖励
}
```

### 4. 技能系统 (Skill System)

#### 4.1 技能树结构
```typescript
// 每个职业有独立技能树
interface SkillTree {
  classId: CharacterClass;
  tiers: SkillTier[];  // 技能层
}

interface SkillTier {
  level: number;       // 解锁等级
  skills: Skill[];     // 该层技能
}

// 技能分类
enum SkillType {
  PASSIVE = "passive",     // 被动技能
  ACTIVE = "active",       // 主动技能
  AURA = "aura",           // 光环技能
  SUMMON = "summon",       // 召唤技能
}
```

#### 4.2 战士技能树示例
```typescript
const warriorSkills: SkillTree = {
  classId: CharacterClass.WARRIOR,
  tiers: [
    {
      level: 1,
      skills: [
        { id: "slash", name: "重砍", type: SkillType.ACTIVE, damage: 1.2, manaCost: 5 },
        { id: "block", name: "格挡", type: SkillType.ACTIVE, defense: 20, duration: 3000 },
      ]
    },
    {
      level: 6,
      skills: [
        { id: "cleave", name: "顺劈", type: SkillType.ACTIVE, damage: 1.5, aoe: true },
        { id: "battleOrders", name: "战斗号令", type: SkillType.AURA, effect: { allStats: 10% } },
      ]
    },
    // ... 更多层
  ]
};
```

### 5. 地图系统 (Map System)

#### 5.1 区域设计
```typescript
interface Zone {
  id: string;
  name: string;                // 区域名称
  description: string;           // 描述
  requiredLevel: number;         // 等级要求
  monsters: MonsterType[];       // 怪物类型
  boss?: Monster;                // Boss
  rewards: ZoneRewards;          // 奖励加成
  background: string;            // 背景图
  music: string;                 // 背景音乐
}

const zones: Zone[] = [
  {
    id: "blood-marsh",
    name: "鲜血湿地",
    description: "一片被诅咒的沼泽，充斥着腐烂的气息...",
    requiredLevel: 1,
    monsters: ["skeleton", "zombie", "corrupt-spirit"],
    boss: { id: "blood-witch", name: "血腥女巫", health: 500 },
    rewards: { goldBonus: 1.0, expBonus: 1.0 },
  },
  // ... 更多区域
];
```

#### 5.2 世界结构
```typescript
// 五大章节
enum Act {
  ACT_1 = "act1",    // 堕落者的洞穴
  ACT_2 = "act2",    // 沙漠之城
  ACT_3 = "act3",    // 库拉斯特丛林
  ACT_4 = "act4",    // 地狱难度
  ACT_5 = "act5",    // 混沌难度
}

// 每章节有多个区域
const acts = {
  act1: {
    name: "第一章：堕落者的洞穴",
    zones: ["blood-marsh", "dark-cave", "undead Crypt", "boss:diablo-clone"],
    difficulty: 1,
  },
  // ...
};
```

### 6. 离线收益系统 (Offline Progress)

#### 6.1 离线计算机制
```typescript
interface OfflineProgress {
  startTime: number;       // 离线开始时间
  endTime: number;         // 离线结束时间
  duration: number;        // 离线时长(秒)
  zoneId: string;          // 所在区域
  monstersKilled: number;  // 击杀怪物数
  goldEarned: number;      // 获得金币
  expEarned: number;       // 获得经验
  itemsFound: Item[];      // 获得物品
}

const calculateOfflineProgress = async (lastSave: GameSave): Promise<OfflineProgress> => {
  const now = Date.now();
  const duration = Math.min(now - lastSave.lastActiveTime, MAX_OFFLINE_TIME); // 最多24小时

  // 基于历史战斗数据推算收益
  const avgGoldPerSecond = lastSave.goldPerMinute / 60;
  const avgExpPerSecond = lastSave.expPerMinute / 60;

  return {
    startTime: lastSave.lastActiveTime,
    endTime: now,
    duration,
    zoneId: lastSave.currentZone,
    monstersKilled: Math.floor(duration / lastSave.avgKillTime),
    goldEarned: Math.floor(avgGoldPerSecond * duration),
    expEarned: Math.floor(avgExpPerSecond * duration),
    itemsFound: generateLoot(duration, lastSave.luckBonus),
  };
};
```

### 7. 怪物系统 (Monster System)

#### 7.1 怪物类型
```typescript
interface Monster {
  id: string;
  name: string;
  type: MonsterType;
  health: number;
  damage: number;
  defense: number;
  attackSpeed: number;
  element?: Element;       // 元素属性
  abilities: string[];     // 特殊能力
  lootTable: LootEntry[];  // 掉落表
  expReward: number;        // 经验奖励
  goldReward: number;       // 金币奖励
}

enum MonsterType {
  BEAST = "beast",         // 野兽
  UNDEAD = "undead",       // 不死族
  DEMON = "demon",         // 恶魔
  ELEMENTAL = "elemental", // 元素生物
  BOSS = "boss",           // Boss
}
```

### 8. 背包系统 (Inventory System)

#### 8.1 背包配置
```typescript
const INVENTORY_SIZE = 60;  // 60格背包
const STASH_SIZE = 120;     // 仓库120格
const CUBE_SIZE = 4;        // 合成框4格

interface Inventory {
  slots: (Item | null)[];  // 60个槽位
  gold: number;             // 金币
  gems: Gem[];             // 宝石
}
```

#### 8.2 物品堆叠规则
```typescript
const STACK_LIMITS = {
  gold: Infinity,           // 金币不限制
  potion: 99,              // 药水99个
  gem: 99,                 // 宝石99个
  material: 99,            // 材料99个
  equipment: 1,            // 装备不可堆叠
};
```

---

## 🤖 AI集成设计 (LangChain + LangGraph) - 付费模块

### ⚠️ 重要更新：AI功能现在是付费模块
AI辅助功能作为游戏的付费DLC模块出售，默认不启用。用户需要购买后才能体验AI功能。
未购买AI模块时，游戏提供基础的自动战斗和手动操作体验。

### 设计目标
利用AI增强游戏体验，提供智能战斗辅助、个性化推荐、剧情生成等功能。

### 付费模块定价策略（建议）
```
AI战斗助手模块 - ¥18（一次性购买）
├── 智能战斗建议
├── 自动战斗优化
└── 怪物弱点分析

AI全套尊享包 - ¥48（一次性购买）
├── AI战斗助手模块全部功能
├── 智能装备推荐
├── Build优化器
├── 自动刷图优化
└── 未来更新免费
```

### 免费功能 vs 付费功能对比
| 功能 | 免费版 | AI尊享包 |
|------|--------|----------|
| 自动战斗 | ✅ 基础版 | ✅ AI优化版 |
| 装备管理 | ✅ 手动 | ✅ AI推荐 |
| 技能释放 | ✅ 手动/自动 | ✅ AI智能 |
| 地图探索 | ✅ 手动 | ✅ AI优化路线 |
| Build建议 | ❌ 无 | ✅ AI分析 |
| 剧情对话 | ❌ 无 | ✅ AI生成 |

### 架构设计
```
┌─────────────────────────────────────────────────────────┐
│                    用户界面 (UI Layer)                   │
├─────────────────────────────────────────────────────────┤
│                  Next.js App Router                     │
├─────────────────────────────────────────────────────────┤
│                   游戏逻辑层 (Game Logic)                 │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  LangChain  │  │  LangGraph  │  │   工具链   │     │
│  │  (LLM调用)  │  │ (工作流编排) │  │ (游戏API)  │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
├─────────────────────────────────────────────────────────┤
│                    模型层 (Model Layer)                   │
│         Claude / GPT-4 / 本地模型 (可选)                  │
└─────────────────────────────────────────────────────────┘
```

### AI功能模块

#### 1. 智能战斗助手 (Combat Advisor)
```typescript
// LangGraph 战斗决策图
const combatAdvisorGraph = new StateGraph({
  state: CombatState,
  nodes: {
    analyzeEnemy: analyzeEnemyNode,
    evaluateSkills: evaluateSkillsNode,
    selectAction: selectActionNode,
    executeAndLearn: executeAndLearnNode,
  },
  edges: [
    ["analyzeEnemy", "evaluateSkills"],
    ["evaluateSkills", "selectAction"],
    ["selectAction", "executeAndLearn"],
    ["executeAndLearn", "analyzeEnemy"], // 循环直到战斗结束
  ],
});
```

#### 2. 智能装备推荐
```typescript
// 根据当前Build推荐最佳装备
const equipmentRecommender = new RunnableSequence([
  // 1. 分析当前角色属性
  analyzeCharacterStats,
  // 2. 分析当前装备
  analyzeCurrentEquipment,
  // 3. 计算最优替换
  calculateOptimalBuild,
  // 4. 生成推荐理由
  generateRecommendationReason,
]);
```

#### 3. 自动战斗策略生成
```typescript
// 使用LangChain生成战斗策略
const strategyPrompt = `你是暗黑破坏神游戏的战斗策略专家。
当前角色：{characterClass} Lv.{level}
当前装备：{equipment}
面对怪物：{monsterType}
分析最佳战斗策略...`;
```

#### 4. 剧情对话系统（规划中）
```typescript
// NPC对话生成
const npcDialogueChain = new LLMChain({
  llm: chatModel,
  prompt: dialoguePrompt,
  outputParser: dialogueParser,
});
```

### LangChain集成点
```typescript
// src/lib/ai/agent.ts - AI代理核心
import { ChatOpenAI } from "@langchain/openai";
import { initializeAgentExecutor } from "langchain/agents";
import { SerpAPI, DatabaseTool, CombatTool } from "./tools";

// 可用工具
const tools = [
  new CombatTool(),      // 战斗操作
  new InventoryTool(),   // 背包管理
  new EquipmentTool(),    // 装备管理
  new StatsTool(),       // 属性查询
  new SearchTool(),      // 搜索游戏数据
];
```

### 未来增强功能（付费DLC内容）
1. **AI战斗助手**：智能战斗建议和自动战斗优化
2. **AI装备推荐**：根据Build分析最优装备搭配
3. **AI酒馆**：与AI NPC对话，获取游戏攻略和建议（LangChain驱动）
4. **AI地图探索**：AI决定最优探索路线
5. **AI剧情生成**：动态生成事件和对话内容
6. **语音交互**：支持语音指挥战斗（规划中）

---


---

## 🗄️ 数据库设计 (SQL.js)

### 核心表结构
```sql
-- 玩家存档表
CREATE TABLE player (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  class TEXT NOT NULL,
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  gold INTEGER DEFAULT 0,
  created_at INTEGER,
  updated_at INTEGER
);

-- 角色属性表
CREATE TABLE character_stats (
  player_id TEXT PRIMARY KEY,
  strength INTEGER DEFAULT 10,
  dexterity INTEGER DEFAULT 10,
  vitality INTEGER DEFAULT 10,
  energy INTEGER DEFAULT 10,
  health INTEGER DEFAULT 100,
  mana INTEGER DEFAULT 50,
  FOREIGN KEY (player_id) REFERENCES player(id)
);

-- 装备表
CREATE TABLE equipment (
  id TEXT PRIMARY KEY,
  player_id TEXT,
  slot TEXT,
  item_data TEXT,  -- JSON存储物品数据
  is_equipped INTEGER DEFAULT 0,
  FOREIGN KEY (player_id) REFERENCES player(id)
);

-- 背包表
CREATE TABLE inventory (
  id TEXT PRIMARY KEY,
  player_id TEXT,
  slot_index INTEGER,
  item_id TEXT,
  quantity INTEGER DEFAULT 1,
  FOREIGN KEY (player_id) REFERENCES player(id)
);

-- 技能表
CREATE TABLE skills (
  player_id TEXT,
  skill_id TEXT,
  level INTEGER DEFAULT 1,
  unlocked INTEGER DEFAULT 0,
  PRIMARY KEY (player_id, skill_id),
  FOREIGN KEY (player_id) REFERENCES player(id)
);

-- 游戏进度表
CREATE TABLE game_progress (
  player_id TEXT PRIMARY KEY,
  current_zone TEXT DEFAULT 'blood-marsh',
  highest_zone TEXT DEFAULT 'blood-marsh',
  current_act INTEGER DEFAULT 1,
  FOREIGN KEY (player_id) REFERENCES player(id)
);

-- 统计表
CREATE TABLE statistics (
  player_id TEXT,
  total_damage_dealt INTEGER DEFAULT 0,
  total_monsters_killed INTEGER DEFAULT 0,
  total_gold_earned INTEGER DEFAULT 0,
  total_time_played INTEGER DEFAULT 0,
  PRIMARY KEY (player_id),
  FOREIGN KEY (player_id) REFERENCES player(id)
);
```

---

## 🎨 UI/UX设计

### 视觉风格
- **主题**：暗黑破坏神哥特式风格
- **主色调**：深红(#8B0000)、暗金(#B8860B)、深紫(#2E1A47)
- **强调色**：血红(#DC143C)、金色(#FFD700)
- **背景**：暗色系，带有纹理质感
- **字体**：哥特式/中世纪风格字体

### 组件设计
使用shadcn/ui组件，定制暗黑主题：
- 深色背景的卡片组件
- 红色/金色边框的按钮
- 暗色输入框和选择器
- 符文风格的图标
- 技能图标使用暗黑风格设计

### 布局结构
```
┌──────────────────────────────────────────────────────┐
│  顶部状态栏 (金币/经验/角色信息)                       │
├────────────┬─────────────────────────┬───────────────┤
│            │                         │               │
│  左侧菜单   │      主游戏区域          │   右侧面板    │
│  (技能/背包 │   (地图/战斗动画)         │  (怪物/掉落)  │
│   /装备)   │                         │               │
│            │                         │               │
├────────────┴─────────────────────────┴───────────────┤
│  底部工具栏 (快捷技能/角色状态/设置)                    │
└──────────────────────────────────────────────────────┘
```

---

## 🧪 测试策略

### 单元测试 (Vitest)
- 游戏逻辑计算函数
- 状态管理Store
- 工具函数
- 组件渲染测试

### 集成测试
- 数据库操作
- 游戏流程测试
- 保存/加载功能

### 测试覆盖率目标
- 核心逻辑: 90%+
- 组件: 80%+
- 总覆盖率: 70%+

---

## 📅 开发计划

### Phase 1: 项目基础 (MVP)
- [x] 项目初始化
- [ ] 数据库设计
- [ ] 基础状态管理
- [ ] 角色创建
- [ ] 基础战斗系统

### Phase 2: 核心循环
- [ ] 地图系统
- [ ] 怪物系统
- [ ] 装备系统
- [ ] 背包系统

### Phase 3: 深度系统
- [ ] 技能树系统
- [ ] 离线收益
- [ ] 存档系统

### Phase 4: 内容扩展（后续版本）
- [ ] 更多区域和章节
- [ ] 更多装备和暗金物品
- [ ] 套装系统
- [ ] 剧情事件系统

### Phase 5: AI功能扩展（付费DLC）
- [ ] AI战斗助手模块
- [ ] AI装备推荐系统
- [ ] AI酒馆交互功能（LangChain对话）
- [ ] AI地图探索优化
- [ ] LangChain + LangGraph集成

---

> 📝 更新日志已移至 [CHANGELOG.md](CHANGELOG.md)
