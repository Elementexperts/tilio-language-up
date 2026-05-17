'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, AtSign, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { SparrowMascot } from '@/components/sparrow-mascot'
import { useAppStore } from '@/lib/store'
import { useTelegram } from '@/hooks/use-telegram'
import { cn } from '@/lib/utils'
import { getGoogleSignInUrl, signInWithEmail, signUpWithEmail } from '@/lib/auth'
import { getLevel, type User } from '@/lib/types'

type AuthMode = 'signup' | 'login'

export function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('signup')
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const user = useAppStore((state) => state.user)
  const setUser = useAppStore((state) => state.setUser)
  const updateUser = useAppStore((state) => state.updateUser)
  const setCloudSession = useAppStore((state) => state.setCloudSession)
  const setSyncStatus = useAppStore((state) => state.setSyncStatus)
  const setScreen = useAppStore((state) => state.setScreen)
  const { hapticFeedback, showBackButton, hideBackButton } = useTelegram()

  useEffect(() => {
    showBackButton(() => {
      hideBackButton()
      setScreen('account')
    })
    return () => hideBackButton()
  }, [hideBackButton, setScreen, showBackButton])

  const isSignup = mode === 'signup'
  const canSubmit = email.includes('@') && password.length >= 8 && (!isSignup || name.trim().length >= 2)

  const createLocalUser = (updates: Partial<User>): User => {
    const displayName = updates.firstName ?? name.trim() ?? 'Tester'
    const today = new Date().toISOString().split('T')[0]

    return {
      id: updates.cloudUserId ?? `user_${Date.now()}`,
      username: updates.username ?? email.split('@')[0] ?? 'tester',
      firstName: displayName,
      lastName: updates.lastName,
      photoUrl: updates.photoUrl,
      telegramId: updates.telegramId,
      cloudUserId: updates.cloudUserId,
      avatarStyle: 'boy',
      learningPath: 'uz-en',
      selectedCourse: 'uz-en',
      level: 'beginner',
      dailyGoal: 10,
      xp: 0,
      feathers: 50,
      streak: 0,
      maxStreak: 0,
      streakFreezes: 0,
      lastActiveDate: today,
      completedLessons: [],
      achievements: [],
      courseProgress: {
        'uz-en': { completedLessons: [], achievements: [] },
        'uz-ko': { completedLessons: [], achievements: [] },
        'uz-ru': { completedLessons: [], achievements: [] },
        'uz-ar': { completedLessons: [], achievements: [] },
        'uz-de': { completedLessons: [], achievements: [] },
      },
      referralCount: 0,
      claimedReferralMilestones: [],
      joinedAt: new Date().toISOString(),
      lastChestClaim: null,
      userLevel: getLevel(0),
      equippedTheme: 'classic-green',
      equippedFrame: 'default',
      purchasedItems: [],
      xpMultiplier: 1,
      xpMultiplierExpiresAt: null,
      wordReviews: {},
      lastSyncedAt: null,
    }
  }

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return
    hapticFeedback('medium')
    setIsSubmitting(true)
    setError(null)
    setMessage(null)

    try {
      const result = isSignup
        ? await signUpWithEmail({ email: email.trim(), password, name: name.trim() })
        : await signInWithEmail({ email: email.trim(), password })

      setCloudSession(result.session)
      if (user) {
        updateUser({ ...result.user, id: result.user.cloudUserId ?? user.id })
      } else {
        setUser(createLocalUser(result.user))
      }
      setSyncStatus('saving')
      setMessage(isSignup ? 'Tester account created. Your progress will now sync.' : 'Logged in. Restoring your progress now.')
      window.setTimeout(() => setScreen(user ? 'account' : 'home'), 700)
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Authentication failed')
      hapticFeedback('warning')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignIn = () => {
    hapticFeedback('medium')
    setError(null)
    window.location.href = getGoogleSignInUrl(window.location.origin)
  }

  return (
    <div className="tilio-shell flex flex-col">
      <header className="sticky top-0 z-10 safe-area-top">
        <div className="tilio-container px-4 py-3">
          <div className="flex items-center gap-4 rounded-[1.6rem] border border-white/70 bg-white/80 px-3 py-2 shadow-lg shadow-emerald-950/5 backdrop-blur-xl">
            <button
              onClick={() => {
                hapticFeedback('light')
                setScreen('account')
              }}
              className="tilio-pressed flex size-10 items-center justify-center rounded-full bg-emerald-50 text-muted-foreground"
              aria-label="Go back"
            >
              <ArrowLeft className="size-6" />
            </button>
            <div>
              <h1 className="text-xl font-black">{isSignup ? 'Create account' : 'Log in'}</h1>
              <p className="text-xs font-semibold text-muted-foreground">Save tester progress and activity</p>
            </div>
          </div>
        </div>
      </header>

      <main className="tilio-container flex-1 overflow-y-auto px-4 py-5 pb-24">
        <Card className="premium-card relative overflow-hidden rounded-[2rem] p-5">
          <div className="absolute -right-7 -top-8 h-28 w-28 rounded-full bg-lime-200/45 blur-2xl" />
          <div className="relative flex items-center gap-4">
            <SparrowMascot branded size="md" mood={isSignup ? 'celebrating' : 'happy'} className="shrink-0 rounded-[1.5rem]" />
            <div className="min-w-0">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary">
                {isSignup ? 'Join Tilio testing' : 'Welcome back'}
              </p>
              <h2 className="mt-1 text-3xl font-black leading-[1] text-emerald-950">
                {isSignup ? 'Track every tester' : 'Continue your journey'}
              </h2>
              <p className="mt-2 text-sm font-semibold text-muted-foreground">
                {isSignup ? 'Create a profile so we can count real testers and protect their progress.' : 'Log in to restore XP, streaks, lessons, and rewards.'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="mt-4 rounded-[1.75rem] border-white/70 bg-white/88 p-2 shadow-xl shadow-emerald-950/5">
          <div className="grid grid-cols-2 gap-2">
            <button
              className={cn('rounded-[1.25rem] px-3 py-3 text-sm font-black transition-colors', isSignup ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground')}
              onClick={() => {
                hapticFeedback('light')
                setMode('signup')
              }}
            >
              Sign up
            </button>
            <button
              className={cn('rounded-[1.25rem] px-3 py-3 text-sm font-black transition-colors', !isSignup ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground')}
              onClick={() => {
                hapticFeedback('light')
                setMode('login')
              }}
            >
              Log in
            </button>
          </div>
        </Card>

        <Card className="mt-4 rounded-[1.75rem] border-white/70 bg-white/90 p-4 shadow-xl shadow-emerald-950/5">
          <Button
            variant="outline"
            className="mb-4 h-13 w-full rounded-2xl border-emerald-100 bg-white text-base font-black shadow-sm"
            onClick={handleGoogleSignIn}
          >
            <span className="mr-2 flex size-6 items-center justify-center rounded-full bg-white text-base">G</span>
            Continue with Google
          </Button>

          <div className="mb-4 flex items-center gap-3 text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            Email
            <span className="h-px flex-1 bg-border" />
          </div>

          <div className="space-y-3">
            {isSignup && (
              <label className="block">
                <span className="mb-1.5 block text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">Name</span>
                <div className="flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/60 px-3">
                  <AtSign className="size-4 text-primary" />
                  <Input className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0" placeholder="Your name" value={name} onChange={(event) => setName(event.target.value)} />
                </div>
              </label>
            )}

            <label className="block">
              <span className="mb-1.5 block text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">Email</span>
              <div className="flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/60 px-3">
                <Mail className="size-4 text-primary" />
                <Input className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0" placeholder="you@example.com" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
              </div>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">Password</span>
              <div className="flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/60 px-3">
                <LockKeyhole className="size-4 text-primary" />
                <Input className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0" placeholder="Minimum 8 characters" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} />
                <button
                  type="button"
                  className="tilio-pressed flex size-9 items-center justify-center rounded-full text-muted-foreground"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </label>
          </div>

          <Button
            className="tilio-button mt-5 h-14 w-full rounded-2xl text-base font-black"
            disabled={!canSubmit || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? 'Connecting...' : isSignup ? 'Create tester account' : 'Log in'}
          </Button>
          {message && <p className="mt-3 rounded-2xl bg-emerald-50 p-3 text-center text-xs font-bold text-emerald-700">{message}</p>}
          {error && <p className="mt-3 rounded-2xl bg-red-50 p-3 text-center text-xs font-bold text-red-700">{error}</p>}
          <p className="mt-4 text-center text-xs font-semibold leading-5 text-muted-foreground">
            By continuing, you agree to Tilio&apos;s{' '}
            <a className="font-black text-primary" href="/terms" target="_blank" rel="noreferrer">Terms</a>
            {' '}and{' '}
            <a className="font-black text-primary" href="/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>.
          </p>
        </Card>

        <Card className="mt-4 rounded-[1.75rem] border-emerald-100 bg-emerald-50/70 p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 size-5 text-primary" />
            <div>
              <p className="font-black">Tester metrics this unlocks</p>
              <p className="mt-1 text-sm font-semibold text-muted-foreground">
                Registered testers, active users, sign-up dates, selected courses, and retention can be counted once auth is connected.
              </p>
            </div>
          </div>
        </Card>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs font-bold text-primary">
          <Sparkles className="size-4" />
          <span>Premium account flow prepared</span>
        </div>
      </main>
    </div>
  )
}
