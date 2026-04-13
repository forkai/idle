/**
 * @fileoverview 战斗日志面板组件
 * @description 展示战斗历史记录，支持筛选和搜索
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { useCombatStore } from '@/stores/combatStore'
import { CombatEventType, Element, ElementNames } from '@/types/combat'

type LogFilter = 'all' | 'damage' | 'loot' | 'level' | 'skill'

/** 单条战斗日志项 */
function LogEntry({ event, showTimestamp }: { event: any; showTimestamp: boolean }) {
  const getTimeString = (timestamp: number) => {
    const date = new Date(timestamp)
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`
  }

  const renderContent = () => {
    switch (event.type) {
      case CombatEventType.ATTACK:
        return (
          <div className="flex items-center gap-2">
            <span className="text-red-400">⚔️</span>
            <span className="text-gray-200">对 </span>
            <span className="text-yellow-400 font-semibold">{event.data.targetName}</span>
            <span className="text-gray-400"> 发起攻击</span>
          </div>
        )

      case CombatEventType.DAMAGED:
        if (!event.data.damage) return null
        const dmg = event.data.damage
        const elementIcon = dmg.element === Element.FIRE ? '🔥' :
          dmg.element === Element.COLD ? '❄️' :
            dmg.element === Element.LIGHTNING ? '⚡' :
              dmg.element === Element.POISON ? '☠️' : '💥'
        return (
          <div className="flex items-center gap-2">
            <span>{elementIcon}</span>
            <span className="text-gray-400">
              {event.data.targetName === '你' ? '受到' : ''}
            </span>
            <span className={dmg.isCrit ? 'text-amber-400 font-bold' : 'text-red-400'}>
              {dmg.finalDamage}
              {dmg.isCrit && <span className="ml-1 text-amber-500 animate-pulse">暴击!</span>}
            </span>
            <span className="text-gray-400">
              {event.data.targetName !== '你' ? ' 伤害' : ''}
              {dmg.element !== Element.PHYSICAL && (
                <span className="ml-1 text-blue-300">({ElementNames[dmg.element as Element]})</span>
              )}
            </span>
          </div>
        )

      case CombatEventType.KILL:
        return (
          <div className="flex items-center gap-2">
            <span className="text-green-400">🏆</span>
            <span className="text-gray-200">击杀 </span>
            <span className="text-yellow-400 font-semibold">{event.data.targetName}</span>
          </div>
        )

      case CombatEventType.LEVEL_UP:
        return (
          <div className="flex items-center gap-2">
            <span className="text-amber-400">⭐</span>
            <span className="text-amber-400 font-bold">升级!</span>
            <span className="text-gray-400"> 等级提升到 </span>
            <span className="text-amber-400 font-bold">Lv.{event.data.level}</span>
          </div>
        )

      case CombatEventType.LOOT:
        return (
          <div className="flex items-center gap-2">
            <span className="text-green-400">📦</span>
            <span className="text-green-400">获得战利品</span>
            {event.data.itemId && (
              <span className="text-gray-400"> ({event.data.itemId})</span>
            )}
          </div>
        )

      case CombatEventType.CAST_SKILL:
        return (
          <div className="flex items-center gap-2">
            <span className="text-blue-400">✨</span>
            <span className="text-gray-200">施放技能 </span>
            <span className="text-blue-400 font-semibold">{event.data.skillId || '技能'}</span>
          </div>
        )

      case CombatEventType.DEATH:
        return (
          <div className="flex items-center gap-2">
            <span className="text-red-600">💀</span>
            <span className="text-red-400 font-bold">生命耗尽...</span>
          </div>
        )

      case CombatEventType.REVIVE:
        return (
          <div className="flex items-center gap-2">
            <span className="text-green-400">💚</span>
            <span className="text-green-400 font-bold">复活!</span>
            <span className="text-gray-400"> 恢复全部生命值</span>
          </div>
        )

      default:
        return (
          <div className="text-gray-400">
            未知事件: {event.type}
          </div>
        )
    }
  }

  const getBorderColor = () => {
    switch (event.type) {
      case CombatEventType.ATTACK:
      case CombatEventType.DAMAGED:
        return 'border-l-red-500'
      case CombatEventType.KILL:
      case CombatEventType.LEVEL_UP:
        return 'border-l-amber-500'
      case CombatEventType.LOOT:
        return 'border-l-green-500'
      case CombatEventType.CAST_SKILL:
        return 'border-l-blue-500'
      case CombatEventType.DEATH:
      case CombatEventType.REVIVE:
        return 'border-l-red-600'
      default:
        return 'border-l-gray-600'
    }
  }

  return (
    <div
      className={`
        px-3 py-1.5 border-l-2 ${getBorderColor()}
        bg-gray-900/30 hover:bg-gray-900/60
        transition-colors duration-100
      `}
    >
      <div className="flex items-start gap-2">
        {showTimestamp && (
          <span className="text-[10px] text-gray-600 font-mono shrink-0 mt-0.5">
            {getTimeString(event.timestamp)}
          </span>
        )}
        <div className="flex-1 text-sm">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}

/**
 * 战斗日志面板主组件
 */
export function CombatLogPanel() {
  const { combatLog, killCount, comboCount } = useCombatStore()
  const [filter, setFilter] = useState<LogFilter>('all')
  const [autoScroll, setAutoScroll] = useState(true)
  const [showTimestamp] = useState(true)
  const logContainerRef = useRef<HTMLDivElement>(null)

  const filteredLog = combatLog.filter(event => {
    if (filter === 'all') return true
    if (filter === 'damage') return event.type === CombatEventType.DAMAGED || event.type === CombatEventType.ATTACK
    if (filter === 'loot') return event.type === CombatEventType.LOOT
    if (filter === 'level') return event.type === CombatEventType.LEVEL_UP
    if (filter === 'skill') return event.type === CombatEventType.CAST_SKILL
    return true
  })

  // 自动滚动到底部
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [filteredLog.length, autoScroll])

  // 检测是否在底部
  const handleScroll = () => {
    if (!logContainerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = logContainerRef.current
    setAutoScroll(scrollHeight - scrollTop - clientHeight < 50)
  }

  const filters: { id: LogFilter; label: string; icon: string }[] = [
    { id: 'all', label: '全部', icon: '📜' },
    { id: 'damage', label: '伤害', icon: '⚔️' },
    { id: 'loot', label: '掉落', icon: '📦' },
    { id: 'level', label: '升级', icon: '⭐' },
    { id: 'skill', label: '技能', icon: '✨' },
  ]

  return (
    <div className="panel-game overflow-hidden flex flex-col" style={{ height: '100%' }}>
      {/* 标题栏 */}
      <div className="relative px-4 pt-4 pb-3 shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-amber-400 tracking-wider">⚔️ 战斗日志</h2>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1">
              <span className="text-gray-500">击杀</span>
              <span className="text-red-400 font-bold">{killCount}</span>
            </div>
            {comboCount > 1 && (
              <div className="flex items-center gap-1">
                <span className="text-amber-500 animate-pulse">🔥</span>
                <span className="text-amber-400 font-bold">{comboCount}</span>
                <span className="text-gray-500">连杀</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 筛选标签 */}
      <div className="px-4 pb-2 shrink-0">
        <div className="flex gap-1 bg-gray-950/50 rounded-lg p-1">
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`
                flex-1 py-1.5 rounded-md text-xs font-bold transition-all duration-150 cursor-pointer
                ${filter === f.id
                  ? 'bg-amber-600 text-white'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                }
              `}
            >
              {f.icon} {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 日志列表 */}
      <div
        ref={logContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 pb-4 space-y-0.5 min-h-0"
        style={{ maxHeight: 'calc(100% - 120px)' }}
      >
        {filteredLog.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-3xl mb-2 opacity-30">📜</p>
            <p className="text-gray-500 text-sm">
              {filter === 'all' ? '暂无战斗记录，去挑战怪物吧！' : '没有符合条件的记录'}
            </p>
          </div>
        ) : (
          filteredLog.map((event, index) => (
            <LogEntry
              key={`${event.timestamp}-${index}`}
              event={event}
              showTimestamp={showTimestamp}
            />
          ))
        )}
      </div>

      {/* 滚动提示 */}
      {!autoScroll && filteredLog.length > 5 && (
        <button
          onClick={() => {
            setAutoScroll(true)
            if (logContainerRef.current) {
              logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
            }
          }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-600 text-xs font-bold rounded-full animate-bounce shadow-lg cursor-pointer"
        >
          ⬇️ 滚动到底部
        </button>
      )}
    </div>
  )
}
