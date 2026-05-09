'use client'

import { useEffect } from 'react'
import { SparrowMascot } from '@/components/sparrow-mascot'
import { useAppStore } from '@/lib/store'
import { useTelegram } from '@/hooks/use-telegram'

export function SplashScreen() {
  const { setScreen } = useAppStore()
  const { isReady, user: telegramUser } = useTelegram()
  const storedUser = useAppStore((state) => state.user)

  useEffect(() => {
    if (!isReady) return

    const timer = setTimeout(() => {
      if (storedUser) {
        // Existing user, go to home
        setScreen('home')
      } else {
        // New user, show onboarding
        setScreen('onboarding')
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [isReady, storedUser, setScreen])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-primary px-6">
      {/* Logo and Mascot */}
      <div className="flex flex-col items-center gap-6 animate-bounce-in">
        <SparrowMascot size="xl" mood="happy" />
        
        <div className="text-center">
          <h1 className="text-5xl font-bold text-primary-foreground tracking-tight">
            Tilio
          </h1>
          <p className="text-primary-foreground/80 text-lg mt-2">
            Learn Uzbek & English
          </p>
        </div>
      </div>

      {/* Loading indicator */}
      <div className="mt-12 flex items-center gap-2">
        <div className="w-2 h-2 bg-primary-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-primary-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-primary-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>

      {/* Welcome message for Telegram users */}
      {telegramUser && (
        <p className="absolute bottom-8 text-primary-foreground/70 text-sm">
          Welcome, {telegramUser.first_name}!
        </p>
      )}
    </div>
  )
}
