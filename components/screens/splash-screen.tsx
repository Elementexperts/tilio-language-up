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
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_16%,rgba(255,255,220,0.16),transparent_32%),linear-gradient(180deg,rgba(3,36,24,0.08),rgba(3,24,18,0.46))]" />
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-emerald-950/78 via-emerald-950/30 to-transparent" />

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center text-center">
        <div className="mb-7 flex items-center gap-3 rounded-full border border-white/30 bg-emerald-950/18 px-4 py-2 shadow-2xl shadow-emerald-950/25 backdrop-blur-xl">
          <img src="/images/tilio-logo-1.png" alt="Tilio" className="size-12 rounded-2xl object-cover shadow-none" />
          <div className="text-left">
            <p className="text-3xl font-black leading-none tracking-normal">Tilio</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-lime-100/85">O'rgan. Mashq qil. So'zla.</p>
          </div>
        </div>

        <div className="w-full rounded-[2rem] border border-white/24 bg-emerald-950/16 p-5 text-left shadow-2xl shadow-emerald-950/30 backdrop-blur-xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-lime-100/85">Tilio tayyorlanmoqda</p>
          <h1 className="mt-2 text-4xl font-black leading-[0.98] tracking-normal">Til o'rganish safaringiz boshlanmoqda</h1>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/18">
            <div className="h-full w-2/3 animate-[loading-sweep_1.7s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-lime-200 via-white to-emerald-300" />
          </div>
          <div className="mt-4 flex items-center justify-between text-xs font-bold text-white/72">
            <span>Tilio ochilmoqda</span>
            <span>Deyarli tayyor</span>
          </div>
        </div>
      </div>

      {telegramUser && (
        <p className="absolute bottom-8 z-10 rounded-full bg-white/12 px-4 py-2 text-sm font-semibold text-white/78 backdrop-blur-xl">
          Welcome, {telegramUser.first_name}!
        </p>
      )}
    </div>
  )
}
