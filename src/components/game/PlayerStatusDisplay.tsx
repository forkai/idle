/**
 * @fileoverview 玩家状态显示组件
 * @description 显示玩家生命值和法力值
 */

'use client'

interface PlayerStatusDisplayProps {
  health: number
  maxHealth: number
  mana: number
  maxMana: number
  healthRegen: number
  manaRegen: number
}

/**
 * 玩家状态显示组件
 * 显示生命值和法力值的进度条
 */
const PlayerStatusDisplay = ({
  health,
  maxHealth,
  mana,
  maxMana,
  healthRegen,
  manaRegen,
}: PlayerStatusDisplayProps) => {
  const healthPercent = (health / maxHealth) * 100
  const manaPercent = (mana / maxMana) * 100

  return (
    <div className="grid grid-cols-2 gap-3 p-3 bg-gray-900/80 rounded-lg border border-gray-700">
      {/* 生命值 */}
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-red-400">❤️ 生命</span>
          <span className="text-gray-400">{Math.floor(health)} / {maxHealth}</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
          <div
            className="h-full bg-gradient-to-r from-red-700 to-red-600 transition-all duration-300"
            style={{ width: `${healthPercent}%` }}
          />
        </div>
        <p className="text-[10px] text-gray-500 mt-0.5">+{healthRegen.toFixed(1)}/秒</p>
      </div>

      {/* 法力值 */}
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-blue-400">💧 法力</span>
          <span className="text-gray-400">{Math.floor(mana)} / {maxMana}</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
          <div
            className="h-full bg-gradient-to-r from-blue-700 to-blue-600 transition-all duration-300"
            style={{ width: `${manaPercent}%` }}
          />
        </div>
        <p className="text-[10px] text-gray-500 mt-0.5">+{manaRegen.toFixed(1)}/秒</p>
      </div>
    </div>
  )
}

export { PlayerStatusDisplay }
