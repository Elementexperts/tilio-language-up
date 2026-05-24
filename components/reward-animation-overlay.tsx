'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { SparrowMascot } from '@/components/sparrow-mascot'
import { useTelegram } from '@/hooks/use-telegram'
import { playChestSound, playRewardSound } from '@/lib/sound'
import type { CompletionRewardSummary } from '@/lib/types'
import { cn } from '@/lib/utils'
import { ArrowRight, Feather, Flame, Snowflake, Sparkles, X, Zap } from 'lucide-react'

type RewardOverlayPhase = 'counting' | 'video' | 'done'

export function RewardAnimationOverlay({
  reward,
  onContinue,
  onRetry,
}: {
  reward: CompletionRewardSummary
  onContinue: () => void
  onRetry?: () => void
}) {
  const [phase, setPhase] = useState<RewardOverlayPhase>('counting')
  const [videoFailed, setVideoFailed] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const { hapticFeedback } = useTelegram()

  const isDone = phase === 'done'
  const title = reward.sessionType === 'review'
    ? 'Review yakunlandi!'
    : reward.sessionType === 'practice'
      ? 'Mashq yakunlandi!'
      : 'Dars yakunlandi!'

  const sparkles = useMemo(
    () => Array.from({ length: 16 }).map((_, index) => ({
      id: index,
      left: `${8 + Math.random() * 84}%`,
      top: `${10 + Math.random() * 70}%`,
      delay: `${Math.random() * 0.8}s`,
      size: `${6 + Math.random() * 8}px`,
    })),
    [],
  )

  const xp = useCountUp(reward.xp, phase === 'counting', 2700)
  const feathers = useCountUp(reward.feathers, phase === 'counting', 2700)
  const streak = useCountUp(reward.streak, phase === 'counting', 2700)
  const freezes = useCountUp(reward.streakFreeze, phase === 'counting', 2700)

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    hapticFeedback('success')
    playRewardSound()

    if (reduceMotion) {
      setPhase('done')
      return
    }

    const timer = window.setTimeout(() => {
      setPhase('video')
      playChestSound()
      hapticFeedback('medium')
    }, 3000)

    return () => window.clearTimeout(timer)
  }, [hapticFeedback])

  useEffect(() => {
    if (phase !== 'video') return
    const video = videoRef.current
    if (!video) return
    const doneTimer = window.setTimeout(() => {
      setPhase('done')
    }, 8500)

    video.currentTime = 0
    const playPromise = video.play()
    if (playPromise) {
      playPromise.catch(() => {
        window.clearTimeout(doneTimer)
        setVideoFailed(true)
        setPhase('done')
      })
    }

    return () => window.clearTimeout(doneTimer)
  }, [phase])

  const handleSkip = () => {
    hapticFeedback('light')
    setPhase('done')
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex min-h-screen flex-col overflow-hidden bg-emerald-950/45 text-foreground backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.32),transparent_24rem),radial-gradient(circle_at_80%_8%,rgba(250,204,21,0.26),transparent_20rem),linear-gradient(180deg,rgba(236,253,245,0.86),rgba(210,245,191,0.84))]" />

      {phase !== 'video' && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {sparkles.map((sparkle) => (
            <span
              key={sparkle.id}
              className={cn('absolute rounded-full bg-amber-300/80 shadow-[0_0_18px_rgba(250,204,21,0.55)]', !isDone && 'animate-float')}
              style={{
                left: sparkle.left,
                top: sparkle.top,
                width: sparkle.size,
                height: sparkle.size,
                animationDelay: sparkle.delay,
              }}
            />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={handleSkip}
        className="tilio-pressed fixed right-4 top-4 z-20 flex size-11 items-center justify-center rounded-full bg-white/82 text-emerald-950 shadow-xl shadow-emerald-950/10 backdrop-blur"
        aria-label="Skip reward animation"
      >
        <X className="size-5" />
      </button>

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col px-4 py-5 safe-area-top safe-area-bottom">
        {phase === 'counting' && (
          <section className="flex flex-1 flex-col items-center justify-center">
            <div className="mb-5 rounded-full bg-white/78 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-primary shadow-lg shadow-emerald-950/8">
              Mukofotlar hisoblanmoqda...
            </div>
            <SparrowMascot branded size="lg" mood="celebrating" className="mb-3 animate-float" />
            <h1 className="mb-6 text-center text-3xl font-black leading-tight text-emerald-950">
              Zo&apos;r natija!
            </h1>
            <RewardGrid
              xp={xp}
              feathers={feathers}
              streak={streak}
              freezes={freezes}
              showFreeze={reward.streakFreeze > 0}
            />
          </section>
        )}

        {phase === 'video' && (
          <section className="flex flex-1 flex-col items-center justify-center">
            <div className="relative aspect-[9/16] w-full max-w-[22rem] overflow-hidden rounded-[2rem] border border-white/70 bg-emerald-950 shadow-2xl shadow-emerald-950/25">
              <video
                ref={videoRef}
                src="/animations/reward-complete.mp4"
                className="h-full w-full object-cover"
                autoPlay
                playsInline
                muted
                preload="metadata"
                controls={false}
                onEnded={() => setPhase('done')}
                onError={() => {
                  setVideoFailed(true)
                  setPhase('done')
                }}
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-emerald-950/70 to-transparent p-5">
                <p className="text-center text-sm font-black text-white">Tilio mukofotlari tayyorlanmoqda</p>
              </div>
            </div>
          </section>
        )}

        {phase === 'done' && (
          <section className="flex flex-1 flex-col items-center justify-center">
            <div className="mb-4 flex size-20 items-center justify-center rounded-[1.6rem] bg-primary text-primary-foreground shadow-xl shadow-primary/25">
              <Sparkles className="size-10" />
            </div>
            <h1 className="text-center text-4xl font-black leading-tight text-emerald-950">{title}</h1>
            <p className="mt-2 text-center text-sm font-bold text-emerald-900/68">
              {videoFailed ? 'Animatsiya yuklanmadi, mukofotlaringiz saqlandi.' : "Mukofotlaringiz hisobingizga qo'shildi."}
            </p>
            <div className="mt-6 w-full">
              <RewardGrid
                xp={reward.xp}
                feathers={reward.feathers}
                streak={reward.streak}
                freezes={reward.streakFreeze}
                showFreeze={reward.streakFreeze > 0}
              />
            </div>
            <div className="mt-5 grid w-full grid-cols-3 gap-3 rounded-[1.6rem] border border-white/70 bg-white/78 p-3 shadow-xl shadow-emerald-950/8">
              <MiniStat label="Accuracy" value={`${reward.accuracy}%`} />
              <MiniStat label="Correct" value={reward.correct} />
              <MiniStat label="Words" value={reward.wordsPracticed} />
            </div>
            <div className="mt-6 w-full space-y-3">
              <Button
                type="button"
                onClick={onContinue}
                className="tilio-button h-14 w-full rounded-2xl text-lg font-black"
              >
                Davom etish
                <ArrowRight className="size-5" />
              </Button>
              {onRetry && reward.accuracy < 100 && (
                <Button
                  type="button"
                  onClick={onRetry}
                  variant="outline"
                  className="h-12 w-full rounded-2xl bg-white/82 font-black"
                >
                  Qayta mashq qilish
                </Button>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

function RewardGrid({
  xp,
  feathers,
  streak,
  freezes,
  showFreeze,
}: {
  xp: number
  feathers: number
  streak: number
  freezes: number
  showFreeze: boolean
}) {
  return (
    <div className="grid w-full grid-cols-2 gap-3">
      <RewardCard icon={<Zap className="size-6" />} label="XP" value={`+${xp}`} tone="green" />
      <RewardCard icon={<Feather className="size-6" />} label="Feathers" value={`+${feathers}`} tone="gold" />
      <RewardCard icon={<Flame className="size-6" />} label="Streak" value={streak} tone="orange" />
      <RewardCard
        icon={<Snowflake className="size-6" />}
        label="Freeze"
        value={showFreeze ? `+${freezes}` : 'Safe'}
        tone="sky"
      />
    </div>
  )
}

function RewardCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: ReactNode
  label: string
  value: string | number
  tone: 'green' | 'gold' | 'orange' | 'sky'
}) {
  const toneClass = {
    green: 'bg-emerald-100 text-emerald-700',
    gold: 'bg-amber-100 text-amber-700',
    orange: 'bg-orange-100 text-orange-600',
    sky: 'bg-sky-100 text-sky-600',
  }[tone]

  return (
    <div className="rounded-[1.45rem] border border-white/75 bg-white/86 p-4 shadow-xl shadow-emerald-950/8">
      <div className={cn('mb-3 flex size-12 items-center justify-center rounded-2xl', toneClass)}>
        {icon}
      </div>
      <p className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-black text-emerald-950">{value}</p>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-center">
      <p className="text-lg font-black text-emerald-950">{value}</p>
      <p className="text-[11px] font-bold text-muted-foreground">{label}</p>
    </div>
  )
}

function useCountUp(target: number, active: boolean, duration: number) {
  const [value, setValue] = useState(active ? 0 : target)

  useEffect(() => {
    if (!active) {
      setValue(target)
      return
    }

    const start = performance.now()
    let frame = 0

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(target * eased))
      if (progress < 1) {
        frame = window.requestAnimationFrame(tick)
      }
    }

    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [active, duration, target])

  return value
}
