'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { useTelegram } from '@/hooks/use-telegram'
import type { ChestReward } from '@/lib/types'
import { ArrowLeft, Gift, Sparkles, Flame, Zap } from 'lucide-react'

export function DailyChestScreen() {
  const setScreen = useAppStore((state) => state.setScreen)
  const canClaimChest = useAppStore((state) => state.canClaimChest)
  const claimDailyChest = useAppStore((state) => state.claimDailyChest)
  const { hapticFeedback, showBackButton, hideBackButton } = useTelegram()
  const [isOpening, setIsOpening] = useState(false)
  const [rewards, setRewards] = useState<ChestReward[]>([])

  const ready = canClaimChest()

  useEffect(() => {
    showBackButton(() => {
      hideBackButton()
      setScreen('home')
    })
    return () => hideBackButton()
  }, [showBackButton, hideBackButton, setScreen])

  const rewardSummary = useMemo(() => {
    if (rewards.length === 0) return 'Open your chest to reveal today’s motivation boosts.'
    return rewards.map((reward) => `${reward.amount} ${reward.type === 'xp' ? 'XP' : reward.type === 'feathers' ? 'Feathers' : 'Streak Freeze'}`).join(' + ')
  }, [rewards])

  const openChest = () => {
    if (!ready || isOpening) return
    hapticFeedback('success')
    setIsOpening(true)
    setTimeout(() => {
      const claimed = claimDailyChest()
      setRewards(claimed)
      setIsOpening(false)
    }, 900)
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border safe-area-top">
        <div className="flex items-center gap-4 px-4 py-3">
          <button
            onClick={() => setScreen('home')}
            className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Daily Reward Chest</h1>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 flex flex-col items-center justify-center">
        <Card className="w-full max-w-sm p-6 text-center border-primary/20 bg-primary/5">
          <div className={`mx-auto w-24 h-24 rounded-3xl bg-primary/15 flex items-center justify-center ${isOpening ? 'animate-bounce' : ''}`}>
            <Gift className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mt-4">Treasure Time</h2>
          <p className="text-sm text-muted-foreground mt-2">
            {ready ? 'Your daily chest is ready. Open it for wholesome rewards.' : 'You already claimed today. Come back tomorrow for another chest.'}
          </p>

          <Button
            className="w-full mt-5 h-12 rounded-2xl"
            disabled={!ready || isOpening}
            onClick={openChest}
          >
            {isOpening ? 'Opening...' : ready ? 'Open Chest' : 'Claimed Today'}
          </Button>
        </Card>

        <Card className="w-full max-w-sm mt-4 p-4">
          <p className="text-sm font-medium">Today’s rewards</p>
          <p className="text-sm text-muted-foreground mt-1">{rewardSummary}</p>
          {rewards.length > 0 && (
            <div className="mt-3 space-y-2">
              {rewards.map((reward, index) => (
                <div key={`${reward.type}-${index}`} className="flex items-center justify-between text-sm bg-muted/40 rounded-xl px-3 py-2">
                  <span className="flex items-center gap-2">
                    {reward.type === 'xp' && <Zap className="w-4 h-4 text-primary" />}
                    {reward.type === 'feathers' && <Sparkles className="w-4 h-4 text-emerald-600" />}
                    {reward.type === 'streak_freeze' && <Flame className="w-4 h-4 text-orange-500" />}
                    {reward.label}
                  </span>
                  <span className="font-semibold">+{reward.amount}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>
    </div>
  )
}
