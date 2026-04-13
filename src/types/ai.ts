/**
 * @fileoverview AI系统类型定义
 * @description 定义LangChain和LangGraph相关的类型，用于AI功能集成
 */

/**
 * AI功能状态枚举
 */
export enum AIFeatureState {
  /** 不可用 */
  UNAVAILABLE = 'unavailable',
  /** 可用但未启用 */
  AVAILABLE = 'available',
  /** 启用 */
  ENABLED = 'enabled',
  /** 加载中 */
  LOADING = 'loading',
  /** 错误 */
  ERROR = 'error',
}

/**
 * AI模型提供商枚举
 */
export enum AIProvider {
  /** Anthropic (Claude) */
  ANTHROPIC = 'anthropic',
  /** OpenAI (GPT) */
  OPENAI = 'openai',
  /** 本地模型 */
  LOCAL = 'local',
  /** 模拟/离线模式 */
  MOCK = 'mock',
}

/**
 * AI配置接口
 */
export interface AIConfig {
  /** 提供商 */
  provider: AIProvider
  /** API密钥（如果需要） */
  apiKey?: string
  /** 模型名称 */
  modelName: string
  /** API基础URL（如果使用代理） */
  baseUrl?: string
  /** 最大Token数 */
  maxTokens: number
  /** 温度参数 */
  temperature: number
}

/**
 * 默认AI配置
 */
export const DEFAULT_AI_CONFIG: AIConfig = {
  provider: AIProvider.MOCK, // 默认使用模拟模式，不依赖外部API
  modelName: 'claude-sonnet-4-20250514',
  maxTokens: 1024,
  temperature: 0.7,
}

/**
 * 战斗建议接口
 */
export interface CombatAdvice {
  /** 建议ID */
  id: string
  /** 建议类型 */
  type: 'attack' | 'defend' | 'skill' | 'item' | 'flee'
  /** 优先级（1-5，1最高） */
  priority: number
  /** 建议描述 */
  description: string
  /** 建议理由 */
  reasoning: string
  /** 预期结果 */
  expectedOutcome: string
  /** 置信度（0-1） */
  confidence: number
}

/**
 * 装备推荐接口
 */
export interface EquipmentRecommendation {
  /** 推荐ID */
  id: string
  /** 当前装备 */
  currentItemId: string
  /** 推荐替换装备 */
  recommendedItemId: string
  /** 优先级 */
  priority: number
  /** 属性变化 */
  statChanges: {
    stat: string
    before: number
    after: number
    change: number
  }[]
  /** 综合评分变化 */
  overallScoreChange: number
  /** 推荐理由 */
  reason: string
}

/**
 * 战斗状态接口（用于LangGraph）
 */
export interface CombatAgentState {
  /** 玩家生命值 */
  playerHealth: number
  /** 玩家法力值 */
  playerMana: number
  /** 敌人生命值 */
  enemyHealth: number
  /** 敌人名称 */
  enemyName: string
  /** 可用技能列表 */
  availableSkills: string[]
  /** 冷却中的技能 */
  skillsOnCooldown: string[]
  /** 背包中的药水数量 */
  potionCount: number
  /** 战斗历史 */
  combatHistory: CombatAdvice[]
  /** 当前建议 */
  currentAdvice: CombatAdvice | null
  /** 思考过程 */
  reasoning: string
  /** 错误信息 */
  error?: string
}

/**
 * Build分析接口
 */
export interface BuildAnalysis {
  /** 分析ID */
  id: string
  /** 当前Build描述 */
  currentBuild: string
  /** 优势 */
  strengths: string[]
  /** 劣势 */
  weaknesses: string[]
  /** 建议 */
  suggestions: string[]
  /** 综合评分 */
  overallScore: number
}

/**
 * 对话消息接口
 */
export interface DialogueMessage {
  /** 角色ID */
  speakerId: string
  /** 角色名称 */
  speakerName: string
  /** 消息内容 */
  content: string
  /** 时间戳 */
  timestamp: number
}

/**
 * AI功能模块接口
 */
export interface AIFeatures {
  /** 战斗助手状态 */
  combatAdvisor: AIFeatureState
  /** 装备推荐状态 */
  equipmentRecommender: AIFeatureState
  /** Build优化器状态 */
  buildOptimizer: AIFeatureState
  /** 对话系统状态 */
  dialogueSystem: AIFeatureState
}
