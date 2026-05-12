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
import { AccountScreen } from '@/components/screens/account-screen'
import { Feather, Flame, PartyPopper, ShieldCheck, Snowflake, Sparkles, Zap, X } from 'lucide-react'
import { SparrowMascot } from '@/components/sparrow-mascot'
import { playAchievementSound, playNavigationSound, playRewardSound, playTapSound, unlockAudio } from '@/lib/sound'
import { useProgressSync } from '@/hooks/use-progress-sync'
import { CloudSyncIndicator } from '@/components/cloud-sync-indicator'

export default function TilioApp() {
  useProgressSync()
  const currentScreen = useAppStore((state) => state.currentScreen)
  const updateStreak = useAppStore((state) => state.updateStreak)
  const hasUser = useAppStore((state) => Boolean(state.user))
  const userLastActiveDate = useAppStore((state) => state.user?.lastActiveDate ?? '')
  const equippedTheme = useAppStore((state) => state.user?.equippedTheme ?? 'classic-green')
  const { isReady } = useTelegram()
  const xpPopups = useAppStore((state) => state.xpPopups)
  const removeXpPopup = useAppStore((state) => state.removeXpPopup)
  const achievementPopups = useAppStore((state) => state.achievementPopups)
  const removeAchievementPopup = useAppStore((state) => state.removeAchievementPopup)
  const showStreakSavedModal = useAppStore((state) => state.showStreakSavedModal)
  const closeStreakSavedModal = useAppStore((state) => state.closeStreakSavedModal)
  const showLevelUpModal = useAppStore((state) => state.showLevelUpModal)
  const newLevel = useAppStore((state) => state.newLevel)
  const closeLevelUpModal = useAppStore((state) => state.closeLevelUpModal)
  const isSoundEnabled = useAppStore((state) => state.isSoundEnabled)
  const previousPopupCountRef = useRef(0)
  const previousAchievementCountRef = useRef(0)

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
    if (!isSoundEnabled) {
      previousAchievementCountRef.current = achievementPopups.length
      return
    }
    if (achievementPopups.length > previousAchievementCountRef.current) {
      playAchievementSound()
    }
    previousAchievementCountRef.current = achievementPopups.length
  }, [achievementPopups.length, isSoundEnabled])

  useEffect(() => {
    document.documentElement.dataset.wallpaper = equippedTheme
  }, [equippedTheme])

  useEffect(() => {
    if (!isSoundEnabled) return
    const handleTap = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.closest('button, a, [role="button"]')) {
        unlockAudio()
        if (target.closest('nav')) playNavigationSound()
        else playTapSound()
      }
    }
    window.addEventListener('pointerdown', handleTap, { passive: true })
    return () => window.removeEventListener('pointerdown', handleTap)
  }, [isSoundEnabled])

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
      case 'account':
        return <AccountScreen />
      default:
        return <SplashScreen />
    }
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <CloudSyncIndicator />
      {renderScreen()}
      <div className="fixed right-4 top-20 z-50 space-y-2 pointer-events-none">
        {xpPopups.map((popup) => (
          <div
            key={popup.id}
            className="animate-float-up animate-reward-glow bg-white/95 border border-primary/15 shadow-xl rounded-2xl px-4 py-2.5 text-sm font-extrabold"
            onAnimationEnd={() => removeXpPopup(popup.id)}
          >
            <span className="inline-flex items-center gap-1">
              {popup.type === 'xp' && <Zap className="w-4 h-4 text-primary" />}
              {popup.type === 'feathers' && <Feather className="w-4 h-4 text-emerald-600" />}
              {popup.type === 'freeze' && <Snowflake className="w-4 h-4 text-sky-500" />}
              {popup.type === 'multiplier' && <Sparkles className="w-4 h-4 text-amber-500" />}
              {popup.type === 'streak_saved' && <ShieldCheck className="w-4 h-4 text-sky-600" />}
              {popup.type === 'streak_saved'
                ? popup.label
                : popup.type === 'multiplier'
                  ? `${popup.amount}x ${popup.label ?? 'Multiplier'}`
                  : `+${popup.amount} ${popup.label ?? (popup.type === 'xp' ? 'XP' : popup.type === 'feathers' ? 'Feathers' : 'Freeze')}`}
            </span>
          </div>
        ))}
      </div>
      {achievementPopups.length > 0 && (
        <div className="fixed inset-x-4 top-28 z-50 mx-auto max-w-sm pointer-events-none">
          {achievementPopups.slice(0, 1).map((popup) => (
            <div
              key={popup.id}
              className="animate-soft-pop rounded-[1.75rem] border border-amber-200/80 bg-white/95 p-4 shadow-2xl shadow-emerald-950/12"
              onAnimationEnd={() => window.setTimeout(() => removeAchievementPopup(popup.id), 1800)}
            >
              <div className="flex items-center gap-3">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-200 to-lime-200 text-2xl shadow-lg">
                  {popup.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">Nishon ochildi</p>
                  <h3 className="text-lg font-black leading-tight">{popup.title}</h3>
                  <p className="line-clamp-2 text-xs font-semibold text-muted-foreground">{popup.description}</p>
                </div>
                <SparrowMascot branded size="sm" mood="celebrating" />
              </div>
            </div>
          ))}
        </div>
      )}
      {showStreakSavedModal && (
        <div className="fixed inset-0 z-50 bg-emerald-950/20 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-sm rounded-[2rem] border border-sky-200 bg-gradient-to-br from-white to-sky-50 p-6 text-center shadow-2xl animate-soft-pop">
            <button className="ml-auto flex size-9 items-center justify-center rounded-full bg-white/80 text-muted-foreground shadow-sm" onClick={closeStreakSavedModal}>
              <X className="w-4 h-4" />
            </button>
            <div className="mx-auto -mt-2 mb-3 flex size-20 items-center justify-center rounded-[1.75rem] bg-sky-100 text-sky-700 shadow-lg shadow-sky-900/10">
              <ShieldCheck className="size-9" />
            </div>
            <SparrowMascot branded size="sm" mood="celebrating" className="mx-auto -mb-1" />
            <p className="text-xs text-sky-700 font-extrabold tracking-[0.18em]">STREAK SAVED</p>
            <h3 className="text-3xl font-black mt-1">Your freeze worked</h3>
            <p className="text-sm text-muted-foreground mt-2">
              One Streak Freeze was used automatically, so your learning streak stayed alive.
            </p>
          </div>
        </div>
      )}
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
              Izchilligingiz natija bermoqda. Koproq mukofotlarni ochish uchun har kuni organishda davom eting.
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
