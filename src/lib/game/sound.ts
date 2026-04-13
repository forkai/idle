/**
 * @fileoverview 游戏音效系统
 * @description 使用 Web Audio API 实现，无需外部依赖
 *
 * 音效类型：
 * - click: 按钮点击（短促咔哒）
 * - attack: 攻击命中（重击音）
 * - victory: 战斗胜利（上升和弦）
 * - defeat: 战斗失败（下降音）
 * - pickup: 拾取物品（叮咚）
 * - levelup: 升级（嘹亮上升音）
 */

type SoundType = 'click' | 'attack' | 'victory' | 'defeat' | 'pickup' | 'levelup'

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  }
  return audioCtx
}

/**
 * 播放指定类型的音效
 */
export function playSound(type: SoundType): void {
  try {
    const ctx = getAudioContext()
    if (ctx.state === 'suspended') ctx.resume()

    switch (type) {
      case 'click':
        playClick(ctx)
        break
      case 'attack':
        playAttack(ctx)
        break
      case 'victory':
        playVictory(ctx)
        break
      case 'defeat':
        playDefeat(ctx)
        break
      case 'pickup':
        playPickup(ctx)
        break
      case 'levelup':
        playLevelUp(ctx)
        break
    }
  } catch (e) {
    // 音效失败不影响主流程
  }
}

function playClick(ctx: AudioContext): void {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.frequency.setValueAtTime(800, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05)
  gain.gain.setValueAtTime(0.15, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.08)
}

function playAttack(ctx: AudioContext): void {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(150, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.15)
  gain.gain.setValueAtTime(0.3, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.15)
}

function playVictory(ctx: AudioContext): void {
  const notes = [523.25, 659.25, 783.99, 1046.5] // C5 E5 G5 C6
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12)
    gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.12)
    gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + i * 0.12 + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.4)
    osc.start(ctx.currentTime + i * 0.12)
    osc.stop(ctx.currentTime + i * 0.12 + 0.4)
  })
}

function playDefeat(ctx: AudioContext): void {
  const notes = [392, 349.23, 293.66, 220] // G4 F4 D4 A3
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.2)
    gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.2)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.2 + 0.3)
    osc.start(ctx.currentTime + i * 0.2)
    osc.stop(ctx.currentTime + i * 0.2 + 0.3)
  })
}

function playPickup(ctx: AudioContext): void {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.type = 'sine'
  osc.frequency.setValueAtTime(880, ctx.currentTime)
  osc.frequency.setValueAtTime(1108, ctx.currentTime + 0.08)
  gain.gain.setValueAtTime(0.12, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.2)
}

function playLevelUp(ctx: AudioContext): void {
  const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5]
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1)
    gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.1)
    gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + i * 0.1 + 0.03)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.5)
    osc.start(ctx.currentTime + i * 0.1)
    osc.stop(ctx.currentTime + i * 0.1 + 0.5)
  })
}

/**
 * 包装器：为任意 onClick 添加强制音效
 * 适用于已有点击处理器，不改变原有逻辑
 */
export function withSound<T extends (...args: unknown[]) => unknown>(
  handler: T,
  sound: SoundType = 'click'
): (...args: Parameters<T>) => void {
  return (...args: Parameters<T>) => {
    playSound(sound)
    handler(...args)
  }
}
