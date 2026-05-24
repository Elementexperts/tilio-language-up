'use client'

import { Button } from '@/components/ui/button'
import { RewardAnimationOverlay } from '@/components/reward-animation-overlay'
import { useAppStore } from '@/lib/store'
import type { CompletionRewardSummary } from '@/lib/types'
import { ArrowRight } from 'lucide-react'

export function ResultScreen() {
  const user = useAppStore((state) => state.user)
  const currentLesson = useAppStore((state) => state.currentLesson)
  const exerciseAnswers = useAppStore((state) => state.exerciseAnswers)
  const lastCompletionReward = useAppStore((state) => state.lastCompletionReward)
  const setScreen = useAppStore((state) => state.setScreen)
  const resetExercise = useAppStore((state) => state.resetExercise)
  const clearCompletionReward = useAppStore((state) => state.clearCompletionReward)
  const startLesson = useAppStore((state) => state.startLesson)

  const total = exerciseAnswers.correct + exerciseAnswers.incorrect
  const fallbackReward: CompletionRewardSummary | null = currentLesson
    ? {
        sessionType: 'lesson',
        title: currentLesson.title,
        xp: currentLesson.xpReward,
        feathers: currentLesson.featherReward ?? 5,
        streak: user?.streak ?? 0,
        streakFreeze: 0,
        accuracy: total > 0 ? Math.round((exerciseAnswers.correct / total) * 100) : 0,
        correct: exerciseAnswers.correct,
        incorrect: exerciseAnswers.incorrect,
        wordsPracticed: currentLesson.words.length,
        timestamp: Date.now(),
      }
    : null

  const reward = lastCompletionReward ?? fallbackReward

  const handleContinue = () => {
    clearCompletionReward()
    setScreen('home')
  }

  const handleRetry = () => {
    if (!currentLesson) {
      handleContinue()
      return
    }
    clearCompletionReward()
    resetExercise()
    startLesson(currentLesson)
  }

  if (!reward) {
    return (
      <div className="tilio-shell flex min-h-screen items-center justify-center px-5">
        <div className="tilio-card w-full max-w-sm rounded-[1.75rem] p-5 text-center">
          <h1 className="text-2xl font-black text-emerald-950">Dars yakunlandi</h1>
          <p className="mt-2 text-sm font-semibold text-muted-foreground">
            Natijalar saqlandi. Bosh sahifaga qaytib davom eting.
          </p>
          <Button
            type="button"
            onClick={handleContinue}
            className="tilio-button mt-5 h-12 w-full rounded-2xl font-black"
          >
            Bosh sahifaga qaytish
            <ArrowRight className="size-5" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <RewardAnimationOverlay
      reward={reward}
      onContinue={handleContinue}
      onRetry={reward.accuracy < 100 && currentLesson ? handleRetry : undefined}
    />
  )
}
