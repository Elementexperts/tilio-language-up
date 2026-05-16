'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SparrowMascot } from '@/components/sparrow-mascot'
import { AchievementBadge } from '@/components/achievement-badge'
import { useAppStore } from '@/lib/store'
import { useTelegram } from '@/hooks/use-telegram'
import { cn } from '@/lib/utils'
import { getUserAchievementProgress } from '@/lib/achievements'
import { playLessonCompleteSound } from '@/lib/sound'
import { Zap, Star, Target, ArrowRight, RotateCcw, Home } from 'lucide-react'

export function ResultScreen() {
  const currentLesson = useAppStore((state) => state.currentLesson)
  const user = useAppStore((state) => state.user)
  const exerciseAnswers = useAppStore((state) => state.exerciseAnswers)
  const lessonAchievementPopups = useAppStore((state) => state.lessonAchievementPopups)
  const setScreen = useAppStore((state) => state.setScreen)
  const resetExercise = useAppStore((state) => state.resetExercise)
  const startLesson = useAppStore((state) => state.startLesson)
  const isSoundEnabled = useAppStore((state) => state.isSoundEnabled)
  const { hapticFeedback } = useTelegram()

  const [showConfetti, setShowConfetti] = useState(false)
  const [xpAnimated, setXpAnimated] = useState(0)
  const [confettiPieces, setConfettiPieces] = useState<
    Array<{
      id: number
      left: string
      delay: string
      duration: string
      emoji: string
    }>
  >([])

  const { correct, incorrect } = exerciseAnswers
  const total = correct + incorrect
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0
  const xpEarned = Math.max(0, (currentLesson?.xpReward || 0) - incorrect)
  const isPracticeSession = Boolean(currentLesson?.isPracticeSession)
  const unlockedLessonAchievements = (() => {
    if (!user || !currentLesson || lessonAchievementPopups.length === 0) return []
    const courseId = currentLesson.courseId ?? user.selectedCourse ?? user.learningPath ?? 'uz-en'
    const achievementIds = new Set(lessonAchievementPopups.map((popup) => popup.achievementId))
    return getUserAchievementProgress(user, courseId).filter((achievement) => achievementIds.has(achievement.id))
  })()

  const isPerfect = accuracy === 100
  const isGood = accuracy >= 80

  useEffect(() => {
    hapticFeedback('success')
    if (isSoundEnabled) playLessonCompleteSound()
    setShowConfetti(true)
    setConfettiPieces(
      Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 2}s`,
        duration: `${2 + Math.random() * 2}s`,
        emoji: ['🎉', '⭐', '✨', '🌟', '💫'][Math.floor(Math.random() * 5)],
      }))
    )

    // Animate XP counter
    const duration = 1000
    const steps = 20
    const increment = xpEarned / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= xpEarned) {
        setXpAnimated(xpEarned)
        clearInterval(timer)
      } else {
        setXpAnimated(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [hapticFeedback, isSoundEnabled, xpEarned])

  const handleContinue = () => {
    hapticFeedback('light')
    setScreen(isPracticeSession ? 'plus' : 'home')
  }

  const handleRetry = () => {
    if (!currentLesson) return
    hapticFeedback('light')
    resetExercise()
    startLesson(currentLesson)
  }

  if (!currentLesson) return null

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      {/* Confetti */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {confettiPieces.map((piece) => (
            <div
              key={piece.id}
              className="absolute animate-confetti"
              style={{
                left: piece.left,
                top: '-20px',
                animationDelay: piece.delay,
                animationDuration: piece.duration,
              }}
            >
              {piece.emoji}
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* Mascot */}
        <SparrowMascot
          size="lg"
          mood={isPerfect ? 'celebrating' : isGood ? 'happy' : 'thinking'}
          branded
          className="mb-6"
        />

        {/* Title */}
        <h1 className="text-3xl font-bold text-foreground text-center mb-2 animate-bounce-in">
          {isPracticeSession ? 'Review Complete!' : isPerfect ? 'Perfect!' : isGood ? 'Great job!' : 'Lesson Complete!'}
        </h1>
        <p className="text-muted-foreground text-center mb-8">
          {isPracticeSession
            ? 'Your review queue is getting stronger.'
            : isPerfect
              ? 'You nailed every question!'
              : isGood
                ? 'Keep up the great work!'
                : 'Practice makes perfect!'
          }
        </p>

        {/* Stats Cards */}
        <div className="w-full max-w-sm space-y-4">
          {/* XP Earned */}
          <Card className="p-5 bg-primary/5 border-primary/20">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
                <Zap className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">XP Earned</p>
                <p className="text-3xl font-bold text-primary">+{xpAnimated}</p>
              </div>
              <div className="flex">
                {[1, 2, 3].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      'w-6 h-6 transition-all duration-300',
                      star <= (isPerfect ? 3 : isGood ? 2 : 1)
                        ? 'text-accent fill-accent'
                        : 'text-muted-foreground/30'
                    )}
                    style={{ animationDelay: `${star * 0.2}s` }}
                  />
                ))}
              </div>
            </div>
          </Card>

          {/* Accuracy */}
          <Card className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
                <Target className="w-7 h-7 text-secondary-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Accuracy</p>
                <p className="text-2xl font-bold text-foreground">{accuracy}%</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-primary font-medium">{correct} correct</p>
                {incorrect > 0 && (
                  <p className="text-sm text-muted-foreground">{incorrect} wrong</p>
                )}
              </div>
            </div>
          </Card>

          {/* Words Learned */}
          <Card className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center text-2xl">
                📚
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Words Practiced</p>
                <p className="text-2xl font-bold text-foreground">
                  {currentLesson.words.length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {unlockedLessonAchievements.length > 0 && (
          <Card className="mt-4 w-full max-w-sm overflow-hidden rounded-[1.75rem] border-amber-200/80 bg-gradient-to-br from-white via-amber-50 to-lime-50 p-5 shadow-2xl shadow-amber-900/10 animate-soft-pop">
            <div className="relative">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">Nishon ochildi</p>
              <h2 className="mt-1 text-2xl font-black text-foreground">New achievement unlocked!</h2>
              <p className="mt-1 text-sm font-semibold text-muted-foreground">Great work. This badge is now visible in your profile.</p>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {unlockedLessonAchievements.slice(0, 3).map((achievement) => (
                  <AchievementBadge key={achievement.id} achievement={achievement} compact />
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Motivational message */}
        {accuracy < 80 && (
          <p className="text-sm text-muted-foreground text-center mt-6 max-w-xs">
            {isPracticeSession ? 'These words will come back at the right time.' : "Don't worry! Try the lesson again to improve your score and earn more XP."}
          </p>
        )}
      </main>

      {/* Actions */}
      <div className="p-6 space-y-3 safe-area-bottom">
        <Button
          onClick={handleContinue}
          className="w-full h-14 text-lg font-semibold rounded-2xl"
          size="lg"
        >
          Continue
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>

        {accuracy < 100 && (
          <Button
            onClick={handleRetry}
            variant="outline"
            className="w-full h-12 font-medium rounded-2xl"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {isPracticeSession ? 'Review Again' : 'Practice Again'}
          </Button>
        )}
      </div>
    </div>
  )
}
