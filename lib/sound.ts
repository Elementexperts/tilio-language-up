type Wave = OscillatorType

let sharedAudioContext: AudioContext | null = null
let audioUnlocked = false

function getAudioContext() {
  if (typeof window === 'undefined') return
  const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioCtx) return
  if (!sharedAudioContext || sharedAudioContext.state === 'closed') {
    sharedAudioContext = new AudioCtx()
  }
  return sharedAudioContext
}

export function unlockAudio() {
  const ctx = getAudioContext()
  if (!ctx || audioUnlocked) return

  const unlock = () => {
    const buffer = ctx.createBuffer(1, 1, 22050)
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.connect(ctx.destination)
    source.start(0)
    audioUnlocked = true
  }

  if (ctx.state === 'suspended') {
    ctx.resume().then(unlock).catch(() => undefined)
    return
  }

  unlock()
}

function playTone(frequency: number, endFrequency: number, duration: number, type: Wave = 'sine', volume = 0.06, delay = 0) {
  const ctx = getAudioContext()
  if (!ctx) return
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => undefined)
  }

  const startAt = ctx.currentTime + delay
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()
  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, startAt)
  oscillator.frequency.linearRampToValueAtTime(endFrequency, startAt + duration * 0.72)
  gain.gain.setValueAtTime(volume, startAt)
  gain.gain.exponentialRampToValueAtTime(0.001, startAt + duration)
  oscillator.connect(gain)
  gain.connect(ctx.destination)
  oscillator.start(startAt)
  oscillator.stop(startAt + duration)
}

export function playRewardSound() {
  playTone(660, 880, 0.14, 'triangle', 0.07)
  playTone(880, 1174, 0.16, 'triangle', 0.055, 0.09)
}

export function playAnswerSound(correct: boolean) {
  playTone(correct ? 740 : 220, correct ? 920 : 180, 0.12, 'sine', 0.06)
}

export function playChestSound() {
  if (typeof window === 'undefined') return
  playTone(440, 720, 0.14, 'triangle', 0.07)
  playTone(720, 980, 0.18, 'triangle', 0.06, 0.09)
  playTone(980, 1320, 0.18, 'sine', 0.035, 0.2)
}

export function playAchievementSound() {
  if (typeof window === 'undefined') return
  playTone(784, 1046, 0.15, 'triangle', 0.07)
  playTone(1046, 1318, 0.2, 'triangle', 0.055, 0.11)
  playTone(1318, 1568, 0.18, 'sine', 0.035, 0.24)
}

export function playTapSound() {
  playTone(360, 460, 0.045, 'sine', 0.018)
}

export function playNavigationSound() {
  playTone(420, 560, 0.07, 'triangle', 0.026)
}

export function playSuccessSound() {
  playTone(523, 784, 0.1, 'triangle', 0.045)
  playTone(784, 1046, 0.14, 'triangle', 0.036, 0.08)
}

export function playIntroSound() {
  playTone(196, 392, 0.28, 'sine', 0.035)
  playTone(523, 784, 0.22, 'triangle', 0.03, 0.18)
}
