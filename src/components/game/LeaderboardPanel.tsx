/**
 * @fileoverview 排行榜面板组件
 * @description 展示本地积分榜、每日/每周挑战
 */

'use client'

import { useState, useMemo } from 'react'
import { useLeaderboardStore } from '@/stores/leaderboardStore'
import { LeaderboardType } from '@/types/leaderboard'
import type { Challenge } from '@/types/leaderboard'

/**
 * 排行榜类型标签
 */
const LEADERBOARD_LABELS: Record<LeaderboardType, string> = {
  [LeaderboardType.LEVEL]: '等级',
  [LeaderboardType.KILLS]: '击杀',
  [LeaderboardType.GOLD]: '金币',
  [LeaderboardType.DAMAGE]: '伤害',
}

/**
 * 排行榜条目行
 */
function LeaderboardRow({ entry, rank }: { entry: any; rank: number }) {
  const rankStyle = rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-gray-300' : rank === 3 ? 'text-amber-600' : 'text-gray-400'

  return (
    <div className={`flex items-center gap-2 p-2 rounded ${rank <= 3 ? 'bg-gray-800/50' : ''}`}>
      <span className={`w-8 text-center font-bold ${rankStyle}`}>#{rank}</span>
      <span className="flex-1 truncate">{entry.playerName}</span>
      <span className="text-sm text-gray-400">Lv.{entry.level}</span>
      <span className="text-sm text-green-400">{entry.totalKills} 击杀</span>
    </div>
  )
}

/**
 * 挑战卡片
 */
function ChallengeCard({ challenge, onClaim }: { challenge: Challenge; onClaim: () => void }) {
  const progress = Math.min(100, (challenge.currentValue / challenge.targetValue) * 100)
  const isCompleted = challenge.completed
  const isExpired = Date.now() > challenge.endTime

  return (
    <div className={`p-3 rounded-lg border ${isCompleted ? 'border-green-500 bg-green-900/20' : isExpired ? 'border-gray-600 bg-gray-900/50 opacity-50' : 'border-gray-700 bg-gray-900/50'}`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className={`font-medium ${isCompleted ? 'text-green-400' : 'text-gray-200'}`}>
            {challenge.name}
            {isCompleted && <span className="ml-2 text-green-500">✓</span>}
          </p>
          <p className="text-xs text-gray-500">{challenge.description}</p>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded ${challenge.type === 'daily' ? 'bg-orange-900/50 text-orange-400' : 'bg-purple-900/50 text-purple-400'}`}>
          {challenge.type === 'daily' ? '每日' : '每周'}
        </span>
      </div>

      {/* 进度条 */}
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full transition-all ${isCompleted ? 'bg-green-500' : 'bg-amber-500'}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400">{challenge.currentValue} / {challenge.targetValue}</span>
        {challenge.rewards.gold && <span className="text-yellow-400">💰 {challenge.rewards.gold}</span>}
        {challenge.rewards.exp && <span className="text-blue-400">✨ {challenge.rewards.exp}</span>}
      </div>

      {/* 领取按钮 */}
      {isCompleted && !isExpired && (
        <button
          onClick={onClaim}
          className="mt-2 w-full py-1.5 bg-green-600 hover:bg-green-500 text-white text-sm rounded font-medium transition-colors"
        >
          领取奖励
        </button>
      )}
    </div>
  )
}

/**
 * 排行榜面板主组件
 */
export function LeaderboardPanel() {
  const { getLeaderboard, dailyChallenges, weeklyChallenges, claimChallengeReward, resetChallenges } = useLeaderboardStore()
  const [activeTab, setActiveTab] = useState<'rank' | 'daily' | 'weekly'>('rank')
  const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>(LeaderboardType.LEVEL)

  const leaderboard = useMemo(() => getLeaderboard(leaderboardType, 20), [getLeaderboard, leaderboardType])

  return (
    <div className="panel-game p-4">
      <h2 className="text-lg font-bold text-amber-400 mb-4">🏆 排行榜</h2>

      {/* 子标签 */}
      <div className="flex gap-2 mb-4">
        {(['rank', 'daily', 'weekly'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-amber-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-gray-200'
            }`}
          >
            {tab === 'rank' ? '积分榜' : tab === 'daily' ? '每日挑战' : '每周挑战'}
          </button>
        ))}
      </div>

      {/* 积分榜 */}
      {activeTab === 'rank' && (
        <div>
          {/* 排行榜类型选择 */}
          <div className="flex gap-2 mb-4">
            {(Object.keys(LEADERBOARD_LABELS) as LeaderboardType[]).map((type) => (
              <button
                key={type}
                onClick={() => setLeaderboardType(type)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  leaderboardType === type
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-gray-200'
                }`}
              >
                {LEADERBOARD_LABELS[type]}
              </button>
            ))}
          </div>

          {/* 排行榜列表 */}
          <div className="space-y-1">
            {leaderboard.length === 0 ? (
              <p className="text-center text-gray-500 py-8">暂无数据</p>
            ) : (
              leaderboard.map((entry, index) => (
                <LeaderboardRow key={entry.playerId + entry.timestamp} entry={entry} rank={index + 1} />
              ))
            )}
          </div>
        </div>
      )}

      {/* 每日挑战 */}
      {activeTab === 'daily' && (
        <div className="space-y-3">
          {dailyChallenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              onClaim={() => claimChallengeReward(challenge.id)}
            />
          ))}
          <button
            onClick={resetChallenges}
            className="mt-2 w-full py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 text-sm rounded transition-colors"
          >
            重置挑战（测试用）
          </button>
        </div>
      )}

      {/* 每周挑战 */}
      {activeTab === 'weekly' && (
        <div className="space-y-3">
          {weeklyChallenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              onClaim={() => claimChallengeReward(challenge.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
