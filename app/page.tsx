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
import { Sparkles, Zap, X } from 'lucide-react'
import { playRewardSound } from '@/lib/sound'

export default function TilioApp() {
  const currentScreen = useAppStore((state) => state.currentScreen)
  const updateStreak = useAppStore((state) => state.updateStreak)
  const hasUser = useAppStore((state) => Boolean(state.user))
  const userLastActiveDate = useAppStore((state) => state.user?.lastActiveDate ?? '')
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
            className="animate-bounce-in bg-card border border-border shadow-lg rounded-xl px-3 py-2 text-sm font-semibold"
            onAnimationEnd={() => removeXpPopup(popup.id)}
          >
            <span className="inline-flex items-center gap-1">
              {popup.type === 'xp' ? <Zap className="w-4 h-4 text-primary" /> : <Sparkles className="w-4 h-4 text-emerald-600" />}
              +{popup.amount} {popup.type === 'xp' ? 'XP' : 'Feathers'}
            </span>
          </div>
        ))}
      </div>
      {showLevelUpModal && (
        <div className="fixed inset-0 z-50 bg-background/70 backdrop-blur-[2px] flex items-center justify-center px-4">
          <div className="w-full max-w-sm rounded-2xl border border-primary/20 bg-card p-6 text-center">
            <button className="ml-auto block text-muted-foreground" onClick={closeLevelUpModal}>
              <X className="w-4 h-4" />
            </button>
            <p className="text-xs text-primary font-semibold">LEVEL UP</p>
            <h3 className="text-2xl font-bold mt-1">Level {newLevel}</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Your consistency is paying off. Keep learning daily to unlock more rewards.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
