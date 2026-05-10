type Wave = OscillatorType

function getAudioContext() {
  if (typeof window === 'undefined') return
  const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioCtx) return
  return new AudioCtx()
}

function playTone(frequency: number, endFrequency: number, duration: number, type: Wave = 'sine', volume = 0.06) {
  const ctx = getAudioContext()
  if (!ctx) return
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()
  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)
  oscillator.frequency.linearRampToValueAtTime(endFrequency, ctx.currentTime + duration * 0.72)
  gain.gain.setValueAtTime(volume, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
  oscillator.connect(gain)
  gain.connect(ctx.destination)
  oscillator.start()
  oscillator.stop(ctx.currentTime + duration)
}

export function playRewardSound() {
  playTone(660, 880, 0.16, 'triangle', 0.08)
}

export function playAnswerSound(correct: boolean) {
  playTone(correct ? 740 : 220, correct ? 920 : 180, 0.12, 'sine', 0.06)
}

export function playChestSound() {
  if (typeof window === 'undefined') return
  playTone(440, 720, 0.14, 'triangle', 0.07)
  window.setTimeout(() => playTone(720, 980, 0.18, 'triangle', 0.06), 90)
}

export function playAchievementSound() {
  if (typeof window === 'undefined') return
  playTone(784, 1046, 0.15, 'triangle', 0.07)
  window.setTimeout(() => playTone(1046, 1318, 0.2, 'triangle', 0.055), 110)
}

export function playTapSound() {
  playTone(320, 420, 0.06, 'sine', 0.025)
}
