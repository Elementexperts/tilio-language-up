'use client'

import { RewardAnimationOverlay } from '@/components/reward-animation-overlay'
import { useAppStore } from '@/lib/store'
import type { CompletionRewardSummary } from '@/lib/types'

export function ResultScreen() {
  const user = useAppStore((state) => state.user)
  const currentLesson = useAppStore((state) => state.currentLesson)
  const exerciseAnswers = useAppStore((state) => state.exerciseAnswers)
  const lastCompletionReward = useAppStore((state) => state.lastCompletionReward)
  const setScreen = useAppStore((state) => state.setScreen)
  const resetExercise = useAppStore((state) => state.resetExercise)
  const clearCompletionReward = useAppStore((state) => state.clearCompletionReward)
  const startLesson = useAppStore((state) => state.startLesson)

  if (!currentLesson) return null

  const total = exerciseAnswers.correct + exerciseAnswers.incorrect
  const fallbackReward: CompletionRewardSummary = {
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

  const reward = lastCompletionReward ?? fallbackReward

  const handleContinue = () => {
    clearCompletionReward()
    setScreen('home')
  }

  const handleRetry = () => {
    clearCompletionReward()
    resetExercise()
    startLesson(currentLesson)
  }

  return (
    <RewardAnimationOverlay
      reward={reward}
      onContinue={handleContinue}
      onRetry={reward.accuracy < 100 ? handleRetry : undefined}
    />
  )
}
