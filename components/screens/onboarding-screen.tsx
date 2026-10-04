'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SparrowMascot } from '@/components/sparrow-mascot'
import { useAppStore } from '@/lib/store'
import { useTelegram } from '@/hooks/use-telegram'
import { cn } from '@/lib/utils'
import { ArrowRight, Check, Cloud, ShieldCheck, Target, Zap } from 'lucide-react'
import { getLevel, type CourseId, type User } from '@/lib/types'
import { courseOptions } from '@/lib/data/lessons'

type OnboardingStep = 'welcome' | 'account' | 'avatar' | 'path' | 'level' | 'goal'

interface AvatarOption {
  id: 'boy' | 'girl'
  title: string
  description: string
  image: string
}

interface LevelOption {
  id: 'beginner' | 'intermediate'
  title: string
  description: string
}

interface GoalOption {
  id: 5 | 10 | 15 | 20
  title: string
  description: string
  xpEstimate: string
}

const avatarOptions: AvatarOption[] = [
  {
    id: 'boy',
    title: 'Azizbek',
    description: 'Faol, qiziquvchan o‘quvchi',
    image: '/avatars/tilio-boy-avatar.png',
  },
  {
    id: 'girl',
    title: 'Aziza',
    description: 'Ishonchli, muloyim o‘quvchi',
    image: '/avatars/tilio-girl-avatar.png',
  },
]

const languageNames: Record<CourseId, string> = {
  'uz-en': 'Ingliz tili',
  'uz-ko': 'Koreys tili',
  'uz-ru': 'Rus tili',
  'uz-ar': 'Arab tili',
  'uz-de': 'Nemis tili',
}

const levelOptions: LevelOption[] = [
  {
    id: 'beginner',
    title: 'Boshlang‘ich',
    description: 'Men endi boshlayapman',
  },
  {
    id: 'intermediate',
    title: 'O‘rtacha',
    description: 'Ba’zi so‘z va iboralarni bilaman',
  },
]

const goalOptions: GoalOption[] = [
  { id: 5, title: 'Yengil', description: '5 daqiqa/kun', xpEstimate: '~10 XP' },
  { id: 10, title: 'Doimiy', description: '10 daqiqa/kun', xpEstimate: '~25 XP' },
  { id: 15, title: 'Jiddiy', description: '15 daqiqa/kun', xpEstimate: '~50 XP' },
  { id: 20, title: 'Kuchli', description: '20 daqiqa/kun', xpEstimate: '~100 XP' },
]

export function OnboardingScreen() {
  const [step, setStep] = useState<OnboardingStep>('welcome')
  const [selectedAvatar, setSelectedAvatar] = useState<'boy' | 'girl'>('boy')
  const [selectedCourse, setSelectedCourse] = useState<CourseId | null>(null)
  const [selectedLevel, setSelectedLevel] = useState<'beginner' | 'intermediate' | null>(null)
  const [selectedGoal, setSelectedGoal] = useState<5 | 10 | 15 | 20 | null>(null)

  const { setUser, setScreen, updateStreak, cloudSession, authProfile } = useAppStore()
  const { user: telegramUser, hapticFeedback } = useTelegram()

  const handleNext = () => {
    hapticFeedback('light')

    if (step === 'welcome') {
      setStep('account')
    } else if (step === 'account') {
      setStep('avatar')
    } else if (step === 'avatar') {
      setStep('path')
    } else if (step === 'path' && selectedCourse) {
      setStep('level')
    } else if (step === 'level' && selectedLevel) {
      setStep('goal')
    } else if (step === 'goal' && selectedGoal) {
      completeOnboarding()
    }
  }

  const completeOnboarding = () => {
    hapticFeedback('success')
    const localUserId = `guest-${Date.now()}`
    const today = new Date().toISOString().split('T')[0]

    const newUser: User = {
      id: cloudSession?.userId ?? localUserId,
      cloudUserId: cloudSession?.userId,
      username: authProfile?.username || telegramUser?.username || 'learner',
      firstName: authProfile?.firstName || telegramUser?.first_name || (selectedAvatar === 'girl' ? 'Aziza' : 'Azizbek'),
      lastName: authProfile?.lastName || telegramUser?.last_name,
      photoUrl: authProfile?.photoUrl || telegramUser?.photo_url,
      telegramId: authProfile?.telegramId || telegramUser?.id?.toString(),
      avatarStyle: selectedAvatar,
      learningPath: 'uz-en',
      selectedCourse: selectedCourse!,
      level: selectedLevel!,
      dailyGoal: selectedGoal!,
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
      activityLog: {},
      plan: authProfile?.plan ?? 'free',
      plusExpiresAt: authProfile?.plusExpiresAt ?? null,
      plusSource: authProfile?.plusSource ?? null,
      plusUpdatedAt: authProfile?.plusUpdatedAt ?? null,
      plusChatUsage: { date: today, count: 0 },
      lastSyncedAt: null,
    }

    setUser(newUser)
    updateStreak()
    setScreen('home')
  }

  const canProceed = () => {
    switch (step) {
      case 'welcome':
      case 'avatar':
        return true
      case 'account':
        return true
      case 'path':
        return selectedCourse !== null
      case 'level':
        return selectedLevel !== null
      case 'goal':
        return selectedGoal !== null
    }
  }

  const getProgressWidth = () => {
    switch (step) {
      case 'welcome':
        return '16%'
      case 'account':
        return '32%'
      case 'avatar':
        return '48%'
      case 'path':
        return '64%'
      case 'level':
        return '82%'
      case 'goal':
        return '100%'
    }
  }

  return (
    <div className="tilio-shell flex min-h-screen flex-col">
      <div className="h-1 bg-muted">
        <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: getProgressWidth() }} />
      </div>

      <div className="tilio-container flex flex-1 flex-col overflow-y-auto px-6 py-8">
        {step === 'welcome' && (
          <div className="flex flex-1 flex-col items-center justify-center text-center animate-bounce-in">
            <SparrowMascot size="lg" mood="waving" branded />
            <h1 className="mt-6 text-3xl font-black text-foreground">{telegramUser ? `Salom, ${telegramUser.first_name}!` : 'Tilio bilan til o‘rganish yanada qiziqarli'}</h1>
            <p className="mt-3 max-w-xs text-lg text-muted-foreground">
              Qisqa darslar, AI Tutor, aqlli takrorlash va mukofotlar bilan har kuni yangi qadam tashlang.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="h-4 w-4 text-accent" />
                <span>XP yig‘ing</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Target className="h-4 w-4 text-primary" />
                <span>Ketma-ketlikni saqlang</span>
              </div>
            </div>
          </div>
        )}

        {step === 'account' && (
          <div className="flex flex-1 flex-col items-center justify-center text-center animate-bounce-in">
            <div className="mb-5 flex size-24 items-center justify-center rounded-[2rem] bg-gradient-to-br from-emerald-100 to-lime-100 text-primary shadow-xl shadow-emerald-950/10">
              <Cloud className="size-11" />
            </div>
            <SparrowMascot size="md" mood="celebrating" branded />
            <h2 className="mt-5 text-2xl font-black text-foreground">{cloudSession ? 'Hisob tayyor' : 'Mehmon profili tayyor'}</h2>
            <p className="mt-3 max-w-xs text-muted-foreground">
              {cloudSession
                ? 'XP, streak, patlar, darslar va nishonlar bulutda saqlanadi.'
                : 'Progress shu qurilmada saqlanadi. Keyinroq cloud sync uchun hisobga kirishingiz mumkin.'}
            </p>
            <div className="mt-6 grid w-full gap-3">
              <Card className="rounded-[1.35rem] border-emerald-100 bg-white/85 p-4 text-left shadow-sm">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="size-5 text-primary" />
                  <div>
                    <p className="font-black">{cloudSession ? 'Secure account sign-in' : 'Local guest progress'}</p>
                    <p className="text-xs font-semibold text-muted-foreground">
                      {cloudSession ? 'Telegram, Google, and email accounts are supported.' : 'Lessons, XP, and streaks stay available on this device.'}
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="rounded-[1.35rem] border-emerald-100 bg-white/85 p-4 text-left shadow-sm">
                <div className="flex items-center gap-3">
                  <Cloud className="size-5 text-primary" />
                  <div>
                    <p className="font-black">{cloudSession ? 'Continue anywhere' : 'Cloud sync later'}</p>
                    <p className="text-xs font-semibold text-muted-foreground">
                      {cloudSession ? 'Ready for future Android and iOS apps.' : 'Sign in from the account screen when you want online backup.'}
                    </p>
                  </div>
                </div>
              </Card>
              {!cloudSession && (
                <Button variant="outline" onClick={() => setScreen('auth')} className="h-12 rounded-2xl border-emerald-100 bg-white font-black text-primary">
                  Hisobga kirish
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        {step === 'avatar' && (
          <div className="flex flex-1 flex-col animate-bounce-in">
            <div className="mb-8 text-center">
              <SparrowMascot size="md" mood="happy" branded className="mx-auto" />
              <h2 className="mt-4 text-2xl font-black text-foreground">Profil qahramoningizni tanlang</h2>
              <p className="mt-2 text-muted-foreground">Telegram rasmi bo‘lmasa, shu ikonka profilingizda ko‘rinadi.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {avatarOptions.map((option) => (
                <Card
                  key={option.id}
                  className={cn(
                    'tilio-pressed cursor-pointer rounded-[1.75rem] border-2 p-4 text-center transition-all duration-200',
                    selectedAvatar === option.id ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' : 'border-border hover:border-primary/50',
                  )}
                  onClick={() => {
                    setSelectedAvatar(option.id)
                    hapticFeedback('light')
                  }}
                >
                  <div className="mx-auto mb-3 size-28 overflow-hidden rounded-[2rem] bg-emerald-50 ring-4 ring-white">
                    <img src={option.image} alt={option.title} className="h-full w-full object-cover" />
                  </div>
                  <h3 className="font-black text-foreground">{option.title}</h3>
                  <p className="mt-1 text-xs font-semibold text-muted-foreground">{option.description}</p>
                  {selectedAvatar === option.id && (
                    <div className="mx-auto mt-3 flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="size-4" />
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === 'path' && (
          <div className="flex flex-1 flex-col animate-bounce-in">
            <div className="mb-8 text-center">
              <SparrowMascot size="md" mood="thinking" branded className="mx-auto" />
              <h2 className="mt-4 text-2xl font-black text-foreground">Qaysi tilni o‘rganmoqchisiz?</h2>
              <p className="mt-2 text-muted-foreground">Istalgan payt Profil orqali tilni almashtirishingiz mumkin.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {courseOptions.map((option) => (
                <Card
                  key={option.id}
                  className={cn(
                    'cursor-pointer rounded-[1.5rem] border-2 p-4 text-center transition-all duration-200',
                    selectedCourse === option.id ? 'border-primary bg-primary/5 shadow-lg' : 'border-border hover:border-primary/50',
                  )}
                  onClick={() => {
                    setSelectedCourse(option.id)
                    hapticFeedback('light')
                  }}
                >
                  <span className="text-3xl" aria-hidden="true">{option.toFlag}</span>
                  <h3 className="mt-2 font-black text-foreground">{languageNames[option.id]}</h3>
                  <p className="mt-1 text-xs font-semibold text-muted-foreground">O‘zbek tilida o‘rganing</p>
                  {selectedCourse === option.id ? <div className="mx-auto mt-3 flex size-7 items-center justify-center rounded-full bg-primary"><Check className="size-4 text-primary-foreground" /></div> : null}
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === 'level' && (
          <div className="flex flex-1 flex-col animate-bounce-in">
            <div className="mb-8 text-center">
              <SparrowMascot size="md" mood="happy" branded className="mx-auto" />
              <h2 className="mt-4 text-2xl font-black text-foreground">Darajangiz qanday?</h2>
              <p className="mt-2 text-muted-foreground">Darslar sizga mos ravishda tavsiya qilinadi.</p>
            </div>
            <div className="flex flex-col gap-4">
              {levelOptions.map((option) => (
                <Card
                  key={option.id}
                  className={cn(
                    'cursor-pointer rounded-[1.5rem] border-2 p-5 transition-all duration-200',
                    selectedLevel === option.id ? 'border-primary bg-primary/5 shadow-lg' : 'border-border hover:border-primary/50',
                  )}
                  onClick={() => {
                    setSelectedLevel(option.id)
                    hapticFeedback('light')
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl text-sm font-black', option.id === 'beginner' ? 'bg-secondary text-primary' : 'bg-accent/20 text-accent-foreground')}>
                      {option.id === 'beginner' ? 'A1' : 'A2'}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-black text-foreground">{option.title}</h3>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                    {selectedLevel === option.id && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                        <Check className="size-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === 'goal' && (
          <div className="flex flex-1 flex-col animate-bounce-in">
            <div className="mb-8 text-center">
              <SparrowMascot size="md" mood="celebrating" branded className="mx-auto" />
              <h2 className="mt-4 text-2xl font-black text-foreground">Kunlik maqsadni belgilang</h2>
              <p className="mt-2 text-muted-foreground">Har kuni necha daqiqa mashq qilasiz?</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {goalOptions.map((option) => (
                <Card
                  key={option.id}
                  className={cn(
                    'cursor-pointer rounded-[1.5rem] border-2 p-4 text-center transition-all duration-200',
                    selectedGoal === option.id ? 'border-primary bg-primary/5 shadow-lg' : 'border-border hover:border-primary/50',
                  )}
                  onClick={() => {
                    setSelectedGoal(option.id)
                    hapticFeedback('light')
                  }}
                >
                  <div className="mx-auto mb-2 flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-sm font-black text-primary">{option.id}m</div>
                  <h3 className="font-black text-foreground">{option.title}</h3>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                  <p className="mt-1 text-xs text-primary">{option.xpEstimate}</p>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="tilio-container p-6 safe-area-bottom">
        <Button onClick={handleNext} disabled={!canProceed()} className="tilio-button h-14 w-full rounded-2xl text-lg font-black touch-target" size="lg">
          {step === 'welcome' ? 'Boshlash' : step === 'goal' ? 'Boshlaymiz!' : 'Davom etish'}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
