'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SparrowMascot } from '@/components/sparrow-mascot'
import { useAppStore } from '@/lib/store'
import { useTelegram } from '@/hooks/use-telegram'
import { cn } from '@/lib/utils'
import { ArrowRight, Target, Zap } from 'lucide-react'
import { getLevel, type User } from '@/lib/types'

type OnboardingStep = 'welcome' | 'path' | 'level' | 'goal'

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

const pathOptions: PathOption[] = [
  {
    id: 'uz-en',
    title: 'Uzbek to English',
    description: 'I speak Uzbek and want to learn English',
    flag1: '🇺🇿',
    flag2: '🇬🇧',
  },
  {
    id: 'en-uz',
    title: 'English to Uzbek',
    description: 'I speak English and want to learn Uzbek',
    flag1: '🇬🇧',
    flag2: '🇺🇿',
  },
]

const levelOptions: LevelOption[] = [
  {
    id: 'beginner',
    title: 'Beginner',
    description: 'I am just starting to learn',
  },
  {
    id: 'intermediate',
    title: 'Intermediate',
    description: 'I know some words and phrases',
  },
]

const goalOptions: GoalOption[] = [
  { id: 5, title: 'Casual', description: '5 min/day', xpEstimate: '~10 XP' },
  { id: 10, title: 'Regular', description: '10 min/day', xpEstimate: '~25 XP' },
  { id: 15, title: 'Serious', description: '15 min/day', xpEstimate: '~50 XP' },
  { id: 20, title: 'Intense', description: '20 min/day', xpEstimate: '~100 XP' },
]

export function OnboardingScreen() {
  const [step, setStep] = useState<OnboardingStep>('welcome')
  const [selectedPath, setSelectedPath] = useState<'uz-en' | 'en-uz' | null>(null)
  const [selectedLevel, setSelectedLevel] = useState<'beginner' | 'intermediate' | null>(null)
  const [selectedGoal, setSelectedGoal] = useState<5 | 10 | 15 | 20 | null>(null)
  
  const { setUser, setScreen, updateStreak } = useAppStore()
  const { user: telegramUser, hapticFeedback } = useTelegram()

  const handleNext = () => {
    hapticFeedback('light')
    
    if (step === 'welcome') {
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
      firstName: telegramUser?.first_name || 'Learner',
      lastName: telegramUser?.last_name,
      photoUrl: telegramUser?.photo_url,
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
    }
    
    setUser(newUser)
    updateStreak()
    setScreen('home')
  }

  const canProceed = () => {
    switch (step) {
      case 'welcome': return true
      case 'path': return selectedPath !== null
      case 'level': return selectedLevel !== null
      case 'goal': return selectedGoal !== null
      default: return false
    }
  }

  const getProgressWidth = () => {
    switch (step) {
      case 'welcome': return '25%'
      case 'path': return '50%'
      case 'level': return '75%'
      case 'goal': return '100%'
      default: return '0%'
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Progress bar */}
      <div className="h-1 bg-muted">
        <div 
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: getProgressWidth() }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-6 py-8 overflow-y-auto">
        {/* Welcome Step */}
        {step === 'welcome' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-bounce-in">
            <SparrowMascot size="lg" mood="waving" branded />
            
            <h1 className="text-3xl font-bold text-foreground mt-6">
              {telegramUser ? `Hey, ${telegramUser.first_name}!` : 'Welcome!'}
            </h1>
            
            <p className="text-muted-foreground mt-3 text-lg max-w-xs">
              Ready to master a new language? Let&apos;s set up your learning journey!
            </p>

            <div className="flex items-center gap-4 mt-8">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="w-4 h-4 text-accent" />
                <span>Earn XP</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Target className="w-4 h-4 text-primary" />
                <span>Build streaks</span>
              </div>
            </div>
          </div>
        )}

        {/* Path Selection Step */}
        {step === 'path' && (
          <div className="flex-1 flex flex-col animate-bounce-in">
            <div className="text-center mb-8">
              <SparrowMascot size="md" mood="thinking" branded className="mx-auto" />
              <h2 className="text-2xl font-bold text-foreground mt-4">
                Choose your path
              </h2>
              <p className="text-muted-foreground mt-2">
                What language do you want to learn?
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {pathOptions.map((option) => (
                <Card
                  key={option.id}
                  className={cn(
                    'p-5 cursor-pointer transition-all duration-200 border-2',
                    selectedPath === option.id
                      ? 'border-primary bg-primary/5 shadow-lg'
                      : 'border-border hover:border-primary/50'
                  )}
                  onClick={() => {
                    setSelectedPath(option.id)
                    hapticFeedback('light')
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-3xl">
                      <span>{option.flag1}</span>
                      <ArrowRight className="w-5 h-5 text-muted-foreground" />
                      <span>{option.flag2}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{option.title}</h3>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                    {selectedPath === option.id && (
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Level Selection Step */}
        {step === 'level' && (
          <div className="flex-1 flex flex-col animate-bounce-in">
            <div className="text-center mb-8">
              <SparrowMascot size="md" mood="happy" branded className="mx-auto" />
              <h2 className="text-2xl font-bold text-foreground mt-4">
                What&apos;s your level?
              </h2>
              <p className="text-muted-foreground mt-2">
                We&apos;ll personalize your experience
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {levelOptions.map((option) => (
                <Card
                  key={option.id}
                  className={cn(
                    'p-5 cursor-pointer transition-all duration-200 border-2',
                    selectedLevel === option.id
                      ? 'border-primary bg-primary/5 shadow-lg'
                      : 'border-border hover:border-primary/50'
                  )}
                  onClick={() => {
                    setSelectedLevel(option.id)
                    hapticFeedback('light')
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center text-2xl',
                      option.id === 'beginner' ? 'bg-secondary' : 'bg-accent/20'
                    )}>
                      {option.id === 'beginner' ? '🌱' : '🌳'}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{option.title}</h3>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                    {selectedLevel === option.id && (
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Daily Goal Step */}
        {step === 'goal' && (
          <div className="flex-1 flex flex-col animate-bounce-in">
            <div className="text-center mb-8">
              <SparrowMascot size="md" mood="celebrating" branded className="mx-auto" />
              <h2 className="text-2xl font-bold text-foreground mt-4">
                Set your daily goal
              </h2>
              <p className="text-muted-foreground mt-2">
                How much time can you dedicate?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {goalOptions.map((option) => (
                <Card
                  key={option.id}
                  className={cn(
                    'p-4 cursor-pointer transition-all duration-200 border-2 text-center',
                    selectedGoal === option.id
                      ? 'border-primary bg-primary/5 shadow-lg'
                      : 'border-border hover:border-primary/50'
                  )}
                  onClick={() => {
                    setSelectedGoal(option.id)
                    hapticFeedback('light')
                  }}
                >
                  <div className="text-2xl mb-2">
                    {option.id === 5 && '☕'}
                    {option.id === 10 && '📚'}
                    {option.id === 15 && '🎯'}
                    {option.id === 20 && '🚀'}
                  </div>
                  <h3 className="font-semibold text-foreground">{option.title}</h3>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                  <p className="text-xs text-primary mt-1">{option.xpEstimate}</p>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Continue Button */}
      <div className="p-6 safe-area-bottom">
        <Button
          onClick={handleNext}
          disabled={!canProceed()}
          className="w-full h-14 text-lg font-semibold rounded-2xl touch-target"
          size="lg"
        >
          {step === 'goal' ? "Let's start!" : 'Continue'}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  )
}
