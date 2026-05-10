'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SparrowMascot } from '@/components/sparrow-mascot'
import { useAppStore } from '@/lib/store'
import { useTelegram } from '@/hooks/use-telegram'
import { cn } from '@/lib/utils'
import { ArrowRight, Check, Cloud, ShieldCheck, Target, Zap } from 'lucide-react'
import { getLevel, type User } from '@/lib/types'

type OnboardingStep = 'welcome' | 'account' | 'avatar' | 'path' | 'level' | 'goal'

interface AvatarOption {
  id: 'boy' | 'girl'
  title: string
  description: string
  image: string
}

interface PathOption {
  id: 'uz-en' | 'en-uz'
  title: string
  description: string
  flag1: string
  flag2: string
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

const pathOptions: PathOption[] = [
  {
    id: 'uz-en',
    title: 'O‘zbekchadan inglizchaga',
    description: 'Men o‘zbek tilida gaplashaman va ingliz tilini o‘rganmoqchiman',
    flag1: 'UZ',
    flag2: 'EN',
  },
  {
    id: 'en-uz',
    title: 'Inglizchadan o‘zbekchaga',
    description: 'I speak English and want to learn Uzbek',
    flag1: 'EN',
    flag2: 'UZ',
  },
]

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
  const [selectedPath, setSelectedPath] = useState<'uz-en' | 'en-uz' | null>(null)
  const [selectedLevel, setSelectedLevel] = useState<'beginner' | 'intermediate' | null>(null)
  const [selectedGoal, setSelectedGoal] = useState<5 | 10 | 15 | 20 | null>(null)

  const { setUser, setScreen, updateStreak } = useAppStore()
  const { user: telegramUser, hapticFeedback } = useTelegram()

  const handleNext = () => {
    hapticFeedback('light')

    if (step === 'welcome') {
      setStep('account')
    } else if (step === 'account') {
      setStep('avatar')
    } else if (step === 'avatar') {
      setStep('path')
    } else if (step === 'path' && selectedPath) {
      setStep('level')
    } else if (step === 'level' && selectedLevel) {
      setStep('goal')
    } else if (step === 'goal' && selectedGoal) {
      completeOnboarding()
    }
  }

  const completeOnboarding = () => {
    hapticFeedback('success')

    const newUser: User = {
      id: telegramUser?.id?.toString() || `user_${Date.now()}`,
      username: telegramUser?.username || 'learner',
      firstName: telegramUser?.first_name || (selectedAvatar === 'girl' ? 'Aziza' : 'Azizbek'),
      lastName: telegramUser?.last_name,
      photoUrl: telegramUser?.photo_url,
      telegramId: telegramUser?.id?.toString(),
      avatarStyle: selectedAvatar,
      learningPath: selectedPath!,
      level: selectedLevel!,
      dailyGoal: selectedGoal!,
      xp: 0,
      feathers: 50,
      streak: 0,
      maxStreak: 0,
      streakFreezes: 0,
      lastActiveDate: new Date().toISOString().split('T')[0],
      completedLessons: [],
      achievements: [],
      referralCount: 0,
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

    setUser(newUser)
    updateStreak()
    setScreen('home')
  }

  const canProceed = () => {
    switch (step) {
      case 'welcome':
      case 'account':
      case 'avatar':
        return true
      case 'path':
        return selectedPath !== null
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
            <h1 className="mt-6 text-3xl font-black text-foreground">
              {telegramUser ? `Salom, ${telegramUser.first_name}!` : 'Xush kelibsiz!'}
            </h1>
            <p className="mt-3 max-w-xs text-lg text-muted-foreground">
              O‘zbekcha va inglizchani o‘yinli darslar orqali o‘rganamiz. Avval profilingizni sozlaymiz.
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
            <h2 className="mt-5 text-2xl font-black text-foreground">Progressingiz saqlanadi</h2>
            <p className="mt-3 max-w-xs text-muted-foreground">
              Telegram akkauntingiz orqali XP, streak, patlar, darslar va nishonlar bulutda saqlanadi.
            </p>
            <div className="mt-6 grid w-full gap-3">
              <Card className="rounded-[1.35rem] border-emerald-100 bg-white/85 p-4 text-left shadow-sm">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="size-5 text-primary" />
                  <div>
                    <p className="font-black">Secure Telegram sign-in</p>
                    <p className="text-xs font-semibold text-muted-foreground">No password needed inside the Mini App.</p>
                  </div>
                </div>
              </Card>
              <Card className="rounded-[1.35rem] border-emerald-100 bg-white/85 p-4 text-left shadow-sm">
                <div className="flex items-center gap-3">
                  <Cloud className="size-5 text-primary" />
                  <div>
                    <p className="font-black">Continue anywhere</p>
                    <p className="text-xs font-semibold text-muted-foreground">Ready for future Android and iOS apps.</p>
                  </div>
                </div>
              </Card>
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
              <h2 className="mt-4 text-2xl font-black text-foreground">Yo‘nalishni tanlang</h2>
              <p className="mt-2 text-muted-foreground">Qaysi tilda mashq qilmoqchisiz?</p>
            </div>
            <div className="flex flex-col gap-4">
              {pathOptions.map((option) => (
                <Card
                  key={option.id}
                  className={cn(
                    'cursor-pointer rounded-[1.5rem] border-2 p-5 transition-all duration-200',
                    selectedPath === option.id ? 'border-primary bg-primary/5 shadow-lg' : 'border-border hover:border-primary/50',
                  )}
                  onClick={() => {
                    setSelectedPath(option.id)
                    hapticFeedback('light')
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-base font-black text-primary">
                      <span className="rounded-full bg-primary/10 px-2 py-1">{option.flag1}</span>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                      <span className="rounded-full bg-primary/10 px-2 py-1">{option.flag2}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-black text-foreground">{option.title}</h3>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                    {selectedPath === option.id && (
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
          {step === 'goal' ? 'Boshlaymiz!' : 'Davom etish'}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
