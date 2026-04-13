/**
 * @fileoverview 数据库Schema定义
 * @description 使用SQL.js定义游戏数据库表结构
 */

/**
 * SQL.js数据库初始化和迁移管理
 */

/**
 * 数据库版本号
 */
export const DB_VERSION = 1

/**
 * 数据库名称
 */
export const DB_NAME = 'diablo_idle.db'

/**
 * 创建所有数据库表的SQL语句
 */
export const CREATE_TABLES_SQL = `
-- 玩家存档表
CREATE TABLE IF NOT EXISTS player (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  class_id TEXT NOT NULL,
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  gold INTEGER DEFAULT 100,
  base_stats TEXT DEFAULT '{}',
  allocated_stats TEXT DEFAULT '{}',
  unlocked_skills TEXT DEFAULT '[]',
  skill_levels TEXT DEFAULT '{}',
  current_zone TEXT DEFAULT 'blood-marsh',
  play_time INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- 角色属性表（存储计算后的属性快照）
CREATE TABLE IF NOT EXISTS character_stats (
  player_id TEXT PRIMARY KEY,
  strength INTEGER DEFAULT 10,
  dexterity INTEGER DEFAULT 10,
  vitality INTEGER DEFAULT 10,
  energy INTEGER DEFAULT 10,
  health INTEGER DEFAULT 100,
  mana INTEGER DEFAULT 50,
  max_health INTEGER DEFAULT 100,
  max_mana INTEGER DEFAULT 50,
  damage INTEGER DEFAULT 5,
  defense INTEGER DEFAULT 2,
  attack_speed REAL DEFAULT 1.0,
  crit_chance REAL DEFAULT 0.05,
  crit_damage REAL DEFAULT 1.5,
  health_regen REAL DEFAULT 1.0,
  mana_regen REAL DEFAULT 0.5,
  fire_resist INTEGER DEFAULT 0,
  cold_resist INTEGER DEFAULT 0,
  lightning_resist INTEGER DEFAULT 0,
  poison_resist INTEGER DEFAULT 0,
  FOREIGN KEY (player_id) REFERENCES player(id)
);

-- 装备表
CREATE TABLE IF NOT EXISTS equipment (
  id TEXT PRIMARY KEY,
  player_id TEXT NOT NULL,
  slot TEXT NOT NULL,
  item_data TEXT NOT NULL,
  is_equipped INTEGER DEFAULT 1,
  FOREIGN KEY (player_id) REFERENCES player(id)
);

-- 背包表
CREATE TABLE IF NOT EXISTS inventory (
  id TEXT PRIMARY KEY,
  player_id TEXT NOT NULL,
  slot_index INTEGER NOT NULL,
  item_data TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  FOREIGN KEY (player_id) REFERENCES player(id)
);

-- 游戏进度表
CREATE TABLE IF NOT EXISTS game_progress (
  player_id TEXT PRIMARY KEY,
  current_zone TEXT DEFAULT 'blood-marsh',
  highest_zone TEXT DEFAULT 'blood-marsh',
  current_act INTEGER DEFAULT 1,
  zones_completed TEXT DEFAULT '[]',
  FOREIGN KEY (player_id) REFERENCES player(id)
);

-- 统计数据表
CREATE TABLE IF NOT EXISTS statistics (
  player_id TEXT PRIMARY KEY,
  total_damage_dealt INTEGER DEFAULT 0,
  total_monsters_killed INTEGER DEFAULT 0,
  total_gold_earned INTEGER DEFAULT 0,
  total_time_played INTEGER DEFAULT 0,
  total_items_found INTEGER DEFAULT 0,
  total_bosses_killed INTEGER DEFAULT 0,
  highest_level INTEGER DEFAULT 1,
  FOREIGN KEY (player_id) REFERENCES player(id)
);

-- 成就表
CREATE TABLE IF NOT EXISTS achievements (
  player_id TEXT NOT NULL,
  achievement_id TEXT NOT NULL,
  unlocked_at INTEGER,
  progress INTEGER DEFAULT 0,
  PRIMARY KEY (player_id, achievement_id),
  FOREIGN KEY (player_id) REFERENCES player(id)
);

-- 设置表
CREATE TABLE IF NOT EXISTS settings (
  player_id TEXT PRIMARY KEY,
  settings_data TEXT DEFAULT '{}',
  FOREIGN KEY (player_id) REFERENCES player(id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_equipment_player ON equipment(player_id);
CREATE INDEX IF NOT EXISTS idx_inventory_player ON inventory(player_id);
CREATE INDEX IF NOT EXISTS idx_inventory_slot ON inventory(player_id, slot_index);
CREATE INDEX IF NOT EXISTS idx_achievements_player ON achievements(player_id);
`

/**
 * 表名枚举
 */
export const TableNames = {
  PLAYER: 'player',
  CHARACTER_STATS: 'character_stats',
  EQUIPMENT: 'equipment',
  INVENTORY: 'inventory',
  GAME_PROGRESS: 'game_progress',
  STATISTICS: 'statistics',
  ACHIEVEMENTS: 'achievements',
  SETTINGS: 'settings',
} as const

/**
 * 数据库表字段映射
 */
export const TableColumns = {
  [TableNames.PLAYER]: [
    'id',
    'name',
    'class_id',
    'level',
    'experience',
    'gold',
    'base_stats',
    'allocated_stats',
    'unlocked_skills',
    'skill_levels',
    'current_zone',
    'play_time',
    'created_at',
    'updated_at',
  ],
  [TableNames.CHARACTER_STATS]: [
    'player_id',
    'strength',
    'dexterity',
    'vitality',
    'energy',
    'health',
    'mana',
    'max_health',
    'max_mana',
    'damage',
    'defense',
    'attack_speed',
    'crit_chance',
    'crit_damage',
    'health_regen',
    'mana_regen',
    'fire_resist',
    'cold_resist',
    'lightning_resist',
    'poison_resist',
  ],
  [TableNames.EQUIPMENT]: [
    'id',
    'player_id',
    'slot',
    'item_data',
    'is_equipped',
  ],
  [TableNames.INVENTORY]: [
    'id',
    'player_id',
    'slot_index',
    'item_data',
    'quantity',
  ],
  [TableNames.GAME_PROGRESS]: [
    'player_id',
    'current_zone',
    'highest_zone',
    'current_act',
    'zones_completed',
  ],
  [TableNames.STATISTICS]: [
    'player_id',
    'total_damage_dealt',
    'total_monsters_killed',
    'total_gold_earned',
    'total_time_played',
    'total_items_found',
    'total_bosses_killed',
    'highest_level',
  ],
  [TableNames.ACHIEVEMENTS]: [
    'player_id',
    'achievement_id',
    'unlocked_at',
    'progress',
  ],
  [TableNames.SETTINGS]: [
    'player_id',
    'settings_data',
  ],
} as const

/**
 * 数据库配置
 */
export const DatabaseConfig = {
  /** 数据库文件名 */
  filename: DB_NAME,
  /** 数据库版本 */
  version: DB_VERSION,
  /** 自动保存间隔（毫秒） */
  autoSaveInterval: 30000,
  /** 是否启用WAL模式 */
  enableWAL: false,
}
