'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SparrowMascot } from '@/components/sparrow-mascot'
import { useAppStore } from '@/lib/store'
import { useTelegram } from '@/hooks/use-telegram'
import { cn } from '@/lib/utils'
import { ArrowLeft, Check, Copy, Feather, Gift, Share2, Star, Users, Zap } from 'lucide-react'

const referralRewards = [
  { friends: 1, xp: 50, feathers: 35, title: 'First friend', note: 'A warm start for your learning circle.' },
  { friends: 3, xp: 140, feathers: 90, title: 'Study group', note: 'Three learners practicing together.' },
  { friends: 5, xp: 260, feathers: 160, title: 'Community spark', note: 'Unlock a bigger feather boost.' },
  { friends: 10, xp: 600, feathers: 360, title: 'Tilio circle', note: 'A serious growth milestone.' },
  { friends: 20, xp: 1400, feathers: 850, title: 'Language leader', note: 'A large reward for real community building.' },
]

export function ReferralScreen() {
  const user = useAppStore((state) => state.user)
  const setScreen = useAppStore((state) => state.setScreen)
  const claimReferralReward = useAppStore((state) => state.claimReferralReward)
  const claimReferralMilestone = useAppStore((state) => state.claimReferralMilestone)
  const { hapticFeedback, showBackButton, hideBackButton, shareReferral, isTelegramEnv } = useTelegram()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    showBackButton(() => {
      hideBackButton()
      setScreen('home')
    })
    return () => hideBackButton()
  }, [showBackButton, hideBackButton, setScreen])

  if (!user) return null

  const referralCode = `tilio_${user.id}`
  const referralLink = `https://t.me/tilio_app_bot?start=${referralCode}`
  const claimedMilestones = new Set(user.claimedReferralMilestones ?? [])
  const availableRewards = referralRewards.filter((reward) => user.referralCount >= reward.friends && !claimedMilestones.has(reward.friends))
  const nextReward = referralRewards.find((reward) => user.referralCount < reward.friends)

  const handleCopy = async () => {
    hapticFeedback('light')
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  const handleShare = () => {
    hapticFeedback('medium')
    shareReferral(referralCode)
  }

  return (
    <div className="tilio-shell flex flex-col">
      <header className="sticky top-0 z-10 safe-area-top">
        <div className="tilio-container px-4 py-3">
          <div className="flex items-center gap-4 rounded-[1.6rem] border border-white/70 bg-white/80 px-3 py-2 shadow-lg shadow-emerald-950/5 backdrop-blur-xl">
            <button
              onClick={() => {
                hapticFeedback('light')
                setScreen('home')
              }}
              className="tilio-pressed flex size-10 items-center justify-center rounded-full bg-emerald-50 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Go back"
            >
              <ArrowLeft className="size-6" />
            </button>
            <h1 className="text-xl font-black text-foreground">Invite Friends</h1>
          </div>
        </div>
      </header>

      <main className="tilio-container flex-1 overflow-y-auto px-4 py-4 pb-24">
        <div className="mb-8 text-center">
          <SparrowMascot size="xl" mood="celebrating" branded className="mx-auto mb-4" />
          <h2 className="mb-2 text-3xl font-black text-foreground">Grow Your Study Circle</h2>
          <p className="mx-auto max-w-xs text-muted-foreground">
            Invite friends, unlock milestone rewards, and turn feathers into useful study boosts.
          </p>
        </div>

        <Card className="tilio-card mb-6 rounded-[1.75rem] border-primary/20 bg-primary/5 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/20">
                <Users className="size-7 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Friends Invited</p>
                <p className="text-3xl font-black text-foreground">{user.referralCount}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Ready to claim</p>
              <p className="text-2xl font-black text-primary">{availableRewards.length}</p>
            </div>
          </div>
        </Card>

        {nextReward && (
          <Card className="tilio-card mb-6 rounded-[1.75rem] border-accent/30 bg-accent/10 p-4">
            <div className="flex items-center gap-3">
              <Star className="size-6 text-accent" />
              <div className="min-w-0 flex-1">
                <p className="font-black text-foreground">Next: {nextReward.title}</p>
                <p className="text-sm text-muted-foreground">
                  {nextReward.friends - user.referralCount} more friend{nextReward.friends - user.referralCount === 1 ? '' : 's'} unlocks +{nextReward.xp} XP and +{nextReward.feathers} feathers.
                </p>
              </div>
            </div>
          </Card>
        )}

        <Card className="tilio-card mb-6 rounded-[1.75rem] p-4">
          <p className="mb-3 text-sm font-medium text-foreground">Your Referral Link</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 overflow-hidden rounded-xl bg-muted p-3">
              <p className="truncate text-sm text-muted-foreground">{referralLink}</p>
            </div>
            <Button onClick={handleCopy} variant="outline" size="icon" className="h-12 w-12 shrink-0 rounded-xl">
              {copied ? <Check className="size-5 text-primary" /> : <Copy className="size-5" />}
            </Button>
          </div>
        </Card>

        <div className="mb-6">
          <div className="mb-4 flex items-center gap-2">
            <Gift className="size-5 text-accent" />
            <h3 className="font-semibold text-foreground">Milestone Rewards</h3>
          </div>

          <div className="space-y-3">
            {referralRewards.map((reward) => {
              const unlocked = user.referralCount >= reward.friends
              const claimed = claimedMilestones.has(reward.friends)
              const current = !unlocked && reward === nextReward

              return (
                <Card
                  key={reward.friends}
                  className={cn(
                    'tilio-pressed rounded-[1.55rem] p-4 transition-all',
                    unlocked && 'border-primary/20 bg-primary/5',
                    current && 'border-primary/50 shadow-md'
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn('flex size-12 items-center justify-center rounded-xl', unlocked ? 'bg-primary/20' : 'bg-muted')}>
                      <Gift className={cn('size-6', unlocked ? 'text-primary' : 'text-muted-foreground')} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={cn('font-black', unlocked ? 'text-foreground' : 'text-muted-foreground')}>{reward.title}</p>
                      <p className="text-xs text-muted-foreground">Invite {reward.friends} friend{reward.friends > 1 ? 's' : ''}. {reward.note}</p>
                      <div className="mt-1 flex items-center gap-1 text-sm">
                        <Zap className={cn('size-4', unlocked ? 'text-primary' : 'text-muted-foreground')} />
                        <span className={cn(unlocked ? 'font-medium text-primary' : 'text-muted-foreground')}>+{reward.xp} XP</span>
                        <Feather className={cn('ml-2 size-4', unlocked ? 'text-emerald-700' : 'text-muted-foreground')} />
                        <span className={cn(unlocked ? 'font-medium text-emerald-700' : 'text-muted-foreground')}>+{reward.feathers}</span>
                      </div>
                    </div>
                    {claimed ? (
                      <div className="flex size-8 items-center justify-center rounded-full bg-primary">
                        <Check className="size-5 text-primary-foreground" />
                      </div>
                    ) : unlocked ? (
                      <Button
                        size="sm"
                        className="rounded-xl font-black"
                        onClick={() => {
                          hapticFeedback('success')
                          claimReferralMilestone(reward.friends, reward.xp, reward.feathers)
                        }}
                      >
                        Claim
                      </Button>
                    ) : (
                      <p className="text-right text-xs text-muted-foreground">{reward.friends - user.referralCount} more</p>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        <Card className="tilio-card mb-6 rounded-[1.75rem] border-dashed border-primary/40 bg-primary/5 p-4">
          <p className="font-semibold text-foreground">Referral progress tracker</p>
          <p className="mt-1 text-sm text-muted-foreground">
            This button is for testing until the verified referral webhook is connected.
          </p>
          <Button
            variant="outline"
            className="mt-3 rounded-xl"
            onClick={() => {
              hapticFeedback('success')
              claimReferralReward(1)
            }}
          >
            Test Successful Invite
          </Button>
        </Card>
      </main>

      <div className="p-6 safe-area-bottom">
        <Button onClick={handleShare} className="tilio-button h-14 w-full rounded-2xl text-lg font-black" size="lg">
          <Share2 className="mr-2 size-5" />
          {isTelegramEnv ? 'Share on Telegram' : 'Share Link'}
        </Button>
      </div>
    </div>
  )
}
