'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SparrowMascot } from '@/components/sparrow-mascot'
import { useAppStore } from '@/lib/store'
import { useTelegram } from '@/hooks/use-telegram'
import { cn } from '@/lib/utils'
import { 
  ArrowLeft, 
  Users, 
  Gift, 
  Copy, 
  Share2,
  Check,
  Zap,
  Star
} from 'lucide-react'

export function ReferralScreen() {
  const user = useAppStore((state) => state.user)
  const setScreen = useAppStore((state) => state.setScreen)
  const claimReferralReward = useAppStore((state) => state.claimReferralReward)
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
  const referralLink = `https://t.me/TilioBot?start=${referralCode}`

  const handleCopy = async () => {
    hapticFeedback('light')
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
    }
  }

  const handleShare = () => {
    hapticFeedback('medium')
    shareReferral(referralCode)
  }

  const handleBack = () => {
    hapticFeedback('light')
    setScreen('home')
  }

  const rewards = [
    { friends: 1, xp: 35, feathers: 20, icon: '🎁' },
    { friends: 3, xp: 120, feathers: 70, icon: '🎉' },
    { friends: 5, xp: 220, feathers: 130, icon: '🏆' },
    { friends: 10, xp: 550, feathers: 300, icon: '👑' },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border safe-area-top">
        <div className="flex items-center gap-4 px-4 py-3">
          <button
            onClick={handleBack}
            className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Invite Friends</h1>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-4 py-6 pb-24">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <SparrowMascot size="lg" mood="celebrating" className="mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Earn XP by Inviting Friends
          </h2>
          <p className="text-muted-foreground max-w-xs mx-auto">
            Share Tilio with friends and earn bonus XP when they join and start learning!
          </p>
        </div>

        {/* Current Stats */}
        <Card className="p-5 bg-primary/5 border-primary/20 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
                <Users className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Friends Invited</p>
                <p className="text-3xl font-bold text-foreground">{user.referralCount}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">XP Earned</p>
              <p className="text-xl font-bold text-primary">
                +{user.referralCount * 35}
              </p>
              <p className="text-sm font-semibold text-emerald-700">+{user.referralCount * 20} 🪶</p>
            </div>
          </div>
        </Card>

        {/* Referral Link */}
        <Card className="p-4 mb-6">
          <p className="text-sm font-medium text-foreground mb-3">Your Referral Link</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 p-3 bg-muted rounded-xl overflow-hidden">
              <p className="text-sm text-muted-foreground truncate">
                {referralLink}
              </p>
            </div>
            <Button
              onClick={handleCopy}
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-xl shrink-0"
            >
              {copied ? (
                <Check className="w-5 h-5 text-primary" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </Button>
          </div>
        </Card>

        {/* Rewards Milestones */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Gift className="w-5 h-5 text-accent" />
            <h3 className="font-semibold text-foreground">Rewards</h3>
          </div>

          <div className="space-y-3">
            {rewards.map((reward) => {
              const isUnlocked = user.referralCount >= reward.friends
              const isCurrent = user.referralCount < reward.friends && 
                (rewards.indexOf(reward) === 0 || 
                 user.referralCount >= rewards[rewards.indexOf(reward) - 1].friends)

              return (
                <Card
                  key={reward.friends}
                  className={cn(
                    'p-4 transition-all',
                    isUnlocked && 'bg-primary/5 border-primary/20',
                    isCurrent && 'border-primary/50 shadow-md'
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center text-2xl',
                      isUnlocked ? 'bg-primary/20' : 'bg-muted'
                    )}>
                      {reward.icon}
                    </div>
                    <div className="flex-1">
                      <p className={cn(
                        'font-medium',
                        isUnlocked ? 'text-foreground' : 'text-muted-foreground'
                      )}>
                        Invite {reward.friends} friend{reward.friends > 1 ? 's' : ''}
                      </p>
                      <div className="flex items-center gap-1 text-sm">
                        <Zap className={cn(
                          'w-4 h-4',
                          isUnlocked ? 'text-primary' : 'text-muted-foreground'
                        )} />
                        <span className={cn(
                          isUnlocked ? 'text-primary font-medium' : 'text-muted-foreground'
                        )}>
                          +{reward.xp} XP
                        </span>
                        <span className={cn(
                          'ml-2',
                          isUnlocked ? 'text-emerald-700 font-medium' : 'text-muted-foreground'
                        )}>
                          +{reward.feathers} 🪶
                        </span>
                      </div>
                    </div>
                    {isUnlocked && (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-5 h-5 text-primary-foreground" />
                      </div>
                    )}
                    {isCurrent && !isUnlocked && (
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {reward.friends - user.referralCount} more
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        {/* How it works */}
        <Card className="p-4 bg-secondary/50 border-secondary">
          <h3 className="font-semibold text-foreground mb-3">How It Works</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">1</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Share your unique link with friends
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">2</span>
              </div>
              <p className="text-sm text-muted-foreground">
                They join Tilio through your link
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">3</span>
              </div>
              <p className="text-sm text-muted-foreground">
                You both earn bonus XP!
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 mb-6 border-dashed border-primary/40 bg-primary/5">
          <p className="font-semibold text-foreground">Referral progress tracker</p>
          <p className="text-sm text-muted-foreground mt-1">
            Rewards trigger when your friend joins from your invite.
          </p>
          <Button
            variant="outline"
            className="mt-3 rounded-xl"
            onClick={() => {
              hapticFeedback('success')
              claimReferralReward(1)
            }}
          >
            Simulate Successful Invite
          </Button>
        </Card>
      </main>

      {/* Share Button */}
      <div className="p-6 safe-area-bottom">
        <Button
          onClick={handleShare}
          className="w-full h-14 text-lg font-semibold rounded-2xl"
          size="lg"
        >
          <Share2 className="w-5 h-5 mr-2" />
          {isTelegramEnv ? 'Share on Telegram' : 'Share Link'}
        </Button>
      </div>
    </div>
  )
}
