'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SparrowMascot } from '@/components/sparrow-mascot'
import { useAppStore } from '@/lib/store'
import { useTelegram } from '@/hooks/use-telegram'
import type { ChestReward } from '@/lib/types'
import { playChestSound } from '@/lib/sound'
import { ArrowLeft, Feather, Gift, Snowflake, Sparkles, Timer, Zap } from 'lucide-react'

export function DailyChestScreen() {
  const setScreen = useAppStore((state) => state.setScreen)
  const user = useAppStore((state) => state.user)
  const canClaimChest = useAppStore((state) => state.canClaimChest)
  const claimDailyChest = useAppStore((state) => state.claimDailyChest)
  const isSoundEnabled = useAppStore((state) => state.isSoundEnabled)
  const { hapticFeedback, showBackButton, hideBackButton } = useTelegram()
  const [isOpening, setIsOpening] = useState(false)
  const [rewards, setRewards] = useState<ChestReward[]>([])
  const [cooldown, setCooldown] = useState('')

  const ready = canClaimChest()

  useEffect(() => {
    showBackButton(() => {
      hideBackButton()
      setScreen('home')
    })
    return () => hideBackButton()
  }, [showBackButton, hideBackButton, setScreen])

  const rewardSummary = useMemo(() => {
    if (rewards.length === 0) return 'Tap the chest to reveal XP, feathers, streak protection, or a bonus multiplier.'
    return rewards.map((reward) => `${reward.amount}${reward.type === 'bonus_multiplier' ? 'x' : ''} ${reward.type === 'xp' ? 'XP' : reward.type === 'feathers' ? 'Feathers' : reward.type === 'streak_freeze' ? 'Streak Freeze' : 'XP Multiplier'}`).join(' + ')
  }, [rewards])

  useEffect(() => {
    const updateCooldown = () => {
      if (!user?.lastChestClaim || ready) {
        setCooldown('')
        return
      }
      const nextClaim = new Date(user.lastChestClaim)
      nextClaim.setDate(nextClaim.getDate() + 1)
      nextClaim.setHours(0, 0, 0, 0)
      const remaining = Math.max(0, nextClaim.getTime() - Date.now())
      const hours = Math.floor(remaining / (1000 * 60 * 60))
      const minutes = Math.floor((remaining / (1000 * 60)) % 60)
      const seconds = Math.floor((remaining / 1000) % 60)
      setCooldown(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
    }
    updateCooldown()
    const interval = window.setInterval(updateCooldown, 1000)
    return () => window.clearInterval(interval)
  }, [ready, user?.lastChestClaim])

  const openChest = () => {
    if (!ready || isOpening) return
    hapticFeedback('success')
    if (isSoundEnabled) playChestSound()
    setIsOpening(true)
    setTimeout(() => {
      setRewards(claimDailyChest())
      setIsOpening(false)
    }, 900)
  }

  return (
    <div className="tilio-shell flex flex-col">
      <header className="sticky top-0 z-10 safe-area-top">
        <div className="tilio-container px-4 py-3">
          <div className="flex items-center gap-4 rounded-[1.6rem] border border-white/70 bg-white/80 px-3 py-2 shadow-lg shadow-emerald-950/5 backdrop-blur-xl">
            <button onClick={() => setScreen('home')} className="tilio-pressed flex size-10 items-center justify-center rounded-full bg-emerald-50 text-muted-foreground" aria-label="Go back">
              <ArrowLeft className="size-6" />
            </button>
            <h1 className="text-xl font-black">Daily Chest</h1>
          </div>
        </div>
      </header>

      <main className="tilio-container flex flex-1 flex-col items-center justify-center px-4 py-6">
        <Card className="tilio-card w-full max-w-sm overflow-hidden rounded-[2rem] p-6 text-center">
          <div className="relative mx-auto mb-4 h-44">
            <div className="absolute inset-x-8 bottom-3 h-10 rounded-full bg-emerald-950/10 blur-xl" />
            <div className={`absolute left-1/2 top-8 flex size-28 -translate-x-1/2 items-center justify-center rounded-[2rem] bg-gradient-to-br from-amber-200 to-lime-300 text-emerald-800 shadow-2xl shadow-amber-900/15 ${isOpening ? 'animate-chest-open' : ready ? 'animate-chest-shake animate-pulse-glow' : 'animate-float'}`}>
              <Gift className="size-14" />
            </div>
            {(isOpening || rewards.length > 0) && (
              <div className="pointer-events-none absolute inset-0">
                {Array.from({ length: 10 }).map((_, index) => (
                  <Sparkles key={index} className="absolute size-5 animate-confetti text-accent" style={{ left: `${16 + index * 7}%`, top: `${24 + (index % 3) * 11}%`, animationDelay: `${index * 55}ms` }} />
                ))}
              </div>
            )}
          </div>
          <SparrowMascot branded size="sm" mood={rewards.length > 0 ? 'celebrating' : 'happy'} className="mx-auto -mt-8 mb-3" />
          <h2 className="text-3xl font-black">Treasure Time</h2>
          <p className="mt-2 text-sm font-semibold text-muted-foreground">
            {ready ? 'Your daily chest is ready. Open it for a learning boost.' : 'You already claimed today. Come back tomorrow.'}
          </p>
          {!ready && cooldown && (
            <div className="mx-auto mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-800">
              <Timer className="size-4" />
              {cooldown}
            </div>
          )}
          <Button className="tilio-button mt-5 h-14 w-full rounded-2xl text-lg font-black" disabled={!ready || isOpening} onClick={openChest}>
            {isOpening ? 'Opening...' : ready ? 'Open Chest' : 'Claimed Today'}
          </Button>
        </Card>

        <Card className="mt-4 w-full max-w-sm rounded-[1.75rem] border-white/70 bg-white/80 p-4 shadow-xl shadow-emerald-950/5">
          <p className="font-black">Today&apos;s rewards</p>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">{rewardSummary}</p>
          {rewards.length > 0 && (
            <div className="mt-3 space-y-2">
              {rewards.map((reward, index) => (
                <div key={`${reward.type}-${index}`} className="flex items-center justify-between rounded-2xl bg-emerald-50/80 px-3 py-2 text-sm font-bold">
                  <span className="flex items-center gap-2">
                    {reward.type === 'xp' && <Zap className="size-4 text-primary" />}
                    {reward.type === 'feathers' && <Feather className="size-4 text-emerald-600" />}
                    {reward.type === 'streak_freeze' && <Snowflake className="size-4 text-sky-500" />}
                    {reward.type === 'bonus_multiplier' && <Sparkles className="size-4 text-amber-500" />}
                    {reward.label}
                  </span>
                  <span className="font-black">{reward.type === 'bonus_multiplier' ? `${reward.amount}x` : `+${reward.amount}`}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>
    </div>
  )
}
