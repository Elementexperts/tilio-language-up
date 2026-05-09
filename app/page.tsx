'use client'

import { useEffect, useRef } from 'react'
import { useAppStore } from '@/lib/store'
import { useTelegram } from '@/hooks/use-telegram'

// Import all screens
import { SplashScreen } from '@/components/screens/splash-screen'
import { OnboardingScreen } from '@/components/screens/onboarding-screen'
import { HomeScreen } from '@/components/screens/home-screen'
import { ExerciseScreen } from '@/components/screens/exercise-screen'
import { ResultScreen } from '@/components/screens/result-screen'
import { AchievementsScreen } from '@/components/screens/achievements-screen'
import { DailyChallengesScreen } from '@/components/screens/daily-challenges-screen'
import { ProfileScreen } from '@/components/screens/profile-screen'
import { ReferralScreen } from '@/components/screens/referral-screen'
import { StoreScreen } from '@/components/screens/store-screen'
import { DailyChestScreen } from '@/components/screens/daily-chest-screen'
import { Feather, PartyPopper, Sparkles, Zap, X } from 'lucide-react'
import { playRewardSound } from '@/lib/sound'

export default function TilioApp() {
  const currentScreen = useAppStore((state) => state.currentScreen)
  const updateStreak = useAppStore((state) => state.updateStreak)
  const hasUser = useAppStore((state) => Boolean(state.user))
  const userLastActiveDate = useAppStore((state) => state.user?.lastActiveDate ?? '')
  const equippedTheme = useAppStore((state) => state.user?.equippedTheme ?? 'classic-green')
  const { isReady } = useTelegram()
  const xpPopups = useAppStore((state) => state.xpPopups)
  const removeXpPopup = useAppStore((state) => state.removeXpPopup)
  const showLevelUpModal = useAppStore((state) => state.showLevelUpModal)
  const newLevel = useAppStore((state) => state.newLevel)
  const closeLevelUpModal = useAppStore((state) => state.closeLevelUpModal)
  const isSoundEnabled = useAppStore((state) => state.isSoundEnabled)
  const previousPopupCountRef = useRef(0)

  // Update streak on app load
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    if (isReady && hasUser && userLastActiveDate !== today) {
      updateStreak()
    }
  }, [isReady, hasUser, userLastActiveDate, updateStreak])

  useEffect(() => {
    if (!isSoundEnabled) {
      previousPopupCountRef.current = xpPopups.length
      return
    }
    if (xpPopups.length > previousPopupCountRef.current) {
      playRewardSound()
    }
    previousPopupCountRef.current = xpPopups.length
  }, [xpPopups.length, isSoundEnabled])

  useEffect(() => {
    document.documentElement.dataset.wallpaper = equippedTheme
  }, [equippedTheme])

  // Render current screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return <SplashScreen />
      case 'onboarding':
        return <OnboardingScreen />
      case 'home':
        return <HomeScreen />
      case 'exercise':
        return <ExerciseScreen />
      case 'result':
        return <ResultScreen />
      case 'achievements':
        return <AchievementsScreen />
      case 'daily-challenges':
        return <DailyChallengesScreen />
      case 'profile':
        return <ProfileScreen />
      case 'referral':
        return <ReferralScreen />
      case 'store':
        return <StoreScreen />
      case 'daily-chest':
        return <DailyChestScreen />
      default:
        return <SplashScreen />
    }
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {renderScreen()}
      <div className="fixed right-4 top-20 z-50 space-y-2 pointer-events-none">
        {xpPopups.map((popup) => (
          <div
            key={popup.id}
            className="animate-float-up bg-white/95 border border-primary/15 shadow-xl rounded-2xl px-4 py-2.5 text-sm font-extrabold"
            onAnimationEnd={() => removeXpPopup(popup.id)}
          >
            <span className="inline-flex items-center gap-1">
              {popup.type === 'xp' ? <Zap className="w-4 h-4 text-primary" /> : <Feather className="w-4 h-4 text-emerald-600" />}
              +{popup.amount} {popup.type === 'xp' ? 'XP' : 'Feathers'}
            </span>
          </div>
        ))}
      </div>
      {showLevelUpModal && (
        <div className="fixed inset-0 z-50 bg-emerald-950/20 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-sm rounded-[2rem] border border-primary/20 bg-gradient-to-br from-white to-emerald-50 p-6 text-center shadow-2xl animate-soft-pop">
            <button className="ml-auto flex size-9 items-center justify-center rounded-full bg-white/80 text-muted-foreground shadow-sm" onClick={closeLevelUpModal}>
              <X className="w-4 h-4" />
            </button>
            <div className="mx-auto -mt-2 mb-3 flex size-20 items-center justify-center rounded-[1.75rem] bg-primary text-primary-foreground shadow-lg shadow-primary/25">
              <PartyPopper className="size-9" />
            </div>
            <p className="text-xs text-primary font-extrabold tracking-[0.18em]">LEVEL UP</p>
            <h3 className="text-3xl font-black mt-1">Level {newLevel}</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Your consistency is paying off. Keep learning daily to unlock more rewards.
            </p>
            <div className="mt-5 flex justify-center gap-2 text-accent">
              <Sparkles className="size-5 animate-bounce" />
              <Sparkles className="size-4 animate-bounce" style={{ animationDelay: '120ms' }} />
              <Sparkles className="size-5 animate-bounce" style={{ animationDelay: '220ms' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
