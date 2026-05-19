'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { useTelegram } from '@/hooks/use-telegram'
import { playIntroSound } from '@/lib/sound'

export function SplashScreen() {
  const { setScreen } = useAppStore()
  const { isReady, user: telegramUser } = useTelegram()
  const storedUser = useAppStore((state) => state.user)
  const isSoundEnabled = useAppStore((state) => state.isSoundEnabled)

  useEffect(() => {
    if (!isReady) return
    if (isSoundEnabled) playIntroSound()
    const isDesktop = typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches

    const timer = setTimeout(() => {
      if (storedUser) {
        // Existing user, go to home
        setScreen('home')
      } else {
        // New user, show onboarding
        setScreen('onboarding')
      }
    }, isDesktop ? 5200 : 3000)

    return () => clearTimeout(timer)
  }, [isReady, isSoundEnabled, storedUser, setScreen])

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-emerald-950 px-6 text-white">
      <video
        className="absolute inset-0 h-full w-full object-cover opacity-88 lg:hidden"
        src="/videos/tilio-opening-mobile.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      />
      <video
        className="absolute inset-0 hidden h-full w-full object-cover opacity-88 lg:block"
        src="/videos/tilio-opening-desktop.mp4"
        autoPlay
        muted={false}
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_16%,rgba(255,255,220,0.08),transparent_34%),linear-gradient(180deg,rgba(3,36,24,0.02),rgba(3,24,18,0.22))]" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-emerald-950/62 via-emerald-950/18 to-transparent" />

      <div className="absolute inset-x-4 bottom-7 z-10 mx-auto w-[calc(100%-2rem)] max-w-sm lg:bottom-8 lg:max-w-md">
        <div className="rounded-[1.4rem] border border-white/22 bg-emerald-950/18 px-4 py-3 shadow-2xl shadow-emerald-950/28 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <img src="/images/tilio-logo-1.png" alt="Tilio" className="size-10 rounded-2xl object-cover shadow-none" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-lg font-black leading-none tracking-normal">Tilio</p>
                <p className="shrink-0 text-[10px] font-extrabold uppercase tracking-[0.16em] text-lime-100/82">Tayyor</p>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/18">
                <div className="h-full w-2/3 animate-[loading-sweep_1.7s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-lime-200 via-white to-emerald-300" />
              </div>
              <p className="mt-1.5 truncate text-xs font-bold text-white/72">Tilio ochilmoqda</p>
            </div>
          </div>
        </div>
      </div>

      {telegramUser && (
        <p className="absolute bottom-28 z-10 rounded-full bg-white/12 px-4 py-2 text-sm font-semibold text-white/78 backdrop-blur-xl lg:bottom-32">
          Welcome, {telegramUser.first_name}!
        </p>
      )}
    </div>
  )
}
