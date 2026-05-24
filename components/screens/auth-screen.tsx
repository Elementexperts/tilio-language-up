'use client'

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { AlertCircle, ArrowRight, Chrome, Cloud, Loader2, LockKeyhole, Mail, MessageCircle, ShieldCheck, Sparkles, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SparrowMascot } from '@/components/sparrow-mascot'
import { useTelegram } from '@/hooks/use-telegram'
import { useAppStore } from '@/lib/store'
import { consumeOAuthSessionFromUrl, signInWithEmail, signInWithTelegram, signUpWithEmail, startGoogleSignIn, type TelegramAuthResult } from '@/lib/auth'
import { isSupabaseConfigured } from '@/lib/supabase'
import { cn } from '@/lib/utils'

type AuthMode = 'signin' | 'signup'
type LoadingProvider = 'telegram' | 'google' | 'email' | null

export function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('signin')
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loadingProvider, setLoadingProvider] = useState<LoadingProvider>(null)

  const existingUser = useAppStore((state) => state.user)
  const setCloudSession = useAppStore((state) => state.setCloudSession)
  const setAuthProfile = useAppStore((state) => state.setAuthProfile)
  const updateUser = useAppStore((state) => state.updateUser)
  const setScreen = useAppStore((state) => state.setScreen)
  const { initData, isTelegramEnv, hapticFeedback } = useTelegram()

  const telegramAvailable = Boolean(initData && isTelegramEnv)
  const isBusy = loadingProvider !== null

  const applyAuthResult = useCallback((result: TelegramAuthResult) => {
    setCloudSession(result.session)
    setAuthProfile(result.user)

    if (existingUser) {
      updateUser({
        ...result.user,
        id: existingUser.id || result.session.userId,
        cloudUserId: result.session.userId,
      })
      setScreen('home')
      return
    }

    setScreen('onboarding')
  }, [existingUser, setAuthProfile, setCloudSession, setScreen, updateUser])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!window.location.hash.includes('access_token')) return

    let cancelled = false
    setLoadingProvider('google')
    setMessage('')

    consumeOAuthSessionFromUrl()
      .then((result) => {
        if (cancelled || !result) return
        hapticFeedback('success')
        applyAuthResult(result)
      })
      .catch((error) => {
        if (cancelled) return
        setMessage(error instanceof Error ? error.message : 'Google sign-in failed. Please try again.')
        hapticFeedback('warning')
      })
      .finally(() => {
        if (!cancelled) setLoadingProvider(null)
      })

    return () => {
      cancelled = true
    }
  }, [applyAuthResult, hapticFeedback])

  const subtitle = useMemo(() => (
    mode === 'signin'
      ? 'Hisobingizga kiring va progressni davom ettiring.'
      : 'Yangi hisob oching. Mehmon rejimi hozircha yopiq.'
  ), [mode])

  const handleTelegram = async () => {
    if (!telegramAvailable) {
      setMessage('Telegram orqali kirish Mini App ichida ishlaydi. Web brauzerda Google yoki emaildan foydalaning.')
      hapticFeedback('warning')
      return
    }

    setLoadingProvider('telegram')
    setMessage('')

    try {
      const result = await signInWithTelegram(initData)
      if (!result) throw new Error('Telegram sign-in could not start. Please reopen the Mini App from Telegram.')
      hapticFeedback('success')
      applyAuthResult(result)
    } catch (error) {
      hapticFeedback('warning')
      setMessage(error instanceof Error ? error.message : 'Telegram sign-in failed. Please try again.')
    } finally {
      setLoadingProvider(null)
    }
  }

  const handleGoogle = () => {
    if (!isSupabaseConfigured) {
      setMessage('Supabase is not configured yet.')
      hapticFeedback('warning')
      return
    }

    setLoadingProvider('google')
    setMessage('')
    hapticFeedback('light')
    startGoogleSignIn()
  }

  const handleEmailSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail || password.length < 6) {
      setMessage('Email va kamida 6 ta belgidan iborat parol kiriting.')
      hapticFeedback('warning')
      return
    }

    setLoadingProvider('email')
    setMessage('')

    try {
      const result = mode === 'signin'
        ? await signInWithEmail(normalizedEmail, password)
        : await signUpWithEmail(normalizedEmail, password, firstName.trim())
      hapticFeedback('success')
      applyAuthResult(result)
    } catch (error) {
      hapticFeedback('warning')
      setMessage(error instanceof Error ? error.message : 'Email sign-in failed. Please try again.')
    } finally {
      setLoadingProvider(null)
    }
  }

  return (
    <div className="tilio-shell min-h-screen overflow-y-auto px-4 py-6">
      <div className="tilio-container flex min-h-full flex-col justify-center">
        <div className="mb-5 text-center">
          <div className="mx-auto mb-3 flex size-24 items-center justify-center rounded-[2rem] bg-gradient-to-br from-emerald-100 to-lime-100 shadow-xl shadow-emerald-950/10">
            <SparrowMascot branded size="md" mood="waving" />
          </div>
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-primary">Tilio Account</p>
          <h1 className="mt-2 text-3xl font-black leading-tight text-foreground">Progressingiz xavfsiz saqlansin</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm font-semibold text-muted-foreground">{subtitle}</p>
        </div>

        <Card className="rounded-[2rem] border-white/70 bg-white/90 p-4 shadow-2xl shadow-emerald-950/10 backdrop-blur-xl">
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-emerald-50/80 p-1">
            {(['signin', 'signup'] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setMode(item)
                  setMessage('')
                  hapticFeedback('light')
                }}
                className={cn(
                  'tilio-pressed rounded-xl px-3 py-2.5 text-sm font-black transition-all',
                  mode === item ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground',
                )}
              >
                {item === 'signin' ? 'Log in' : 'Sign up'}
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-3">
            <Button
              type="button"
              onClick={handleTelegram}
              disabled={isBusy}
              className="h-14 rounded-2xl bg-[#2AABEE] text-base font-black text-white shadow-lg shadow-sky-500/20 hover:bg-[#229ed9]"
            >
              {loadingProvider === 'telegram' ? <Loader2 className="mr-2 size-5 animate-spin" /> : <MessageCircle className="mr-2 size-5" />}
              Telegram bilan davom etish
            </Button>

            <Button
              type="button"
              onClick={handleGoogle}
              disabled={isBusy}
              variant="outline"
              className="h-14 rounded-2xl border-emerald-100 bg-white text-base font-black shadow-sm"
            >
              {loadingProvider === 'google' ? <Loader2 className="mr-2 size-5 animate-spin" /> : <Chrome className="mr-2 size-5 text-primary" />}
              Google bilan davom etish
            </Button>
          </div>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-emerald-100" />
            <span className="text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">yoki email</span>
            <div className="h-px flex-1 bg-emerald-100" />
          </div>

          <form onSubmit={handleEmailSubmit} className="grid gap-3">
            {mode === 'signup' && (
              <label className="grid gap-1.5">
                <span className="text-xs font-black text-muted-foreground">Ism</span>
                <span className="flex h-12 items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/50 px-3">
                  <UserRound className="size-4 text-primary" />
                  <input
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    placeholder="Aziza"
                    className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-muted-foreground/55"
                    autoComplete="given-name"
                  />
                </span>
              </label>
            )}

            <label className="grid gap-1.5">
              <span className="text-xs font-black text-muted-foreground">Email</span>
              <span className="flex h-12 items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/50 px-3">
                <Mail className="size-4 text-primary" />
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-muted-foreground/55"
                  inputMode="email"
                  autoComplete={mode === 'signin' ? 'email' : 'username'}
                />
              </span>
            </label>

            <label className="grid gap-1.5">
              <span className="text-xs font-black text-muted-foreground">Parol</span>
              <span className="flex h-12 items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/50 px-3">
                <LockKeyhole className="size-4 text-primary" />
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Minimum 6 belgi"
                  className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-muted-foreground/55"
                  type="password"
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                />
              </span>
            </label>

            <Button type="submit" disabled={isBusy} className="tilio-button mt-1 h-14 rounded-2xl text-base font-black">
              {loadingProvider === 'email' ? <Loader2 className="mr-2 size-5 animate-spin" /> : <ArrowRight className="mr-2 size-5" />}
              {mode === 'signin' ? 'Email bilan kirish' : 'Email bilan hisob ochish'}
            </Button>
          </form>

          {message && (
            <div className="mt-4 flex items-start gap-2 rounded-2xl bg-amber-50 p-3 text-xs font-bold text-amber-800">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <p>{message}</p>
            </div>
          )}
        </Card>

        <div className="mt-4 grid gap-3">
          <Card className="rounded-[1.5rem] border-emerald-100 bg-white/75 p-3 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-primary">
                <Cloud className="size-5" />
              </div>
              <div>
                <p className="text-sm font-black">Mehmon rejimi to'xtatilgan</p>
                <p className="text-xs font-semibold text-muted-foreground">XP, streak, feathers va Plus xaridlar akkauntga bog'lanadi.</p>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[1.35rem] border border-white/70 bg-white/65 p-3 text-center shadow-sm">
              <ShieldCheck className="mx-auto mb-1 size-5 text-primary" />
              <p className="text-xs font-black">Cloud sync</p>
            </div>
            <div className="rounded-[1.35rem] border border-white/70 bg-white/65 p-3 text-center shadow-sm">
              <Sparkles className="mx-auto mb-1 size-5 text-amber-500" />
              <p className="text-xs font-black">Plus ready</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
