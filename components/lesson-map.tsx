'use client'

import { useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { lessonsData, isLessonUnlocked, getLessonById } from '@/lib/data/lessons'
import { useTelegram } from '@/hooks/use-telegram'
import { cn } from '@/lib/utils'
import { Lock, Check, Star, Play } from 'lucide-react'
import type { Lesson } from '@/lib/types'

const categoryIcons: Record<string, string> = {
  basics: '👋',
  numbers: '🔢',
  family: '👨‍👩‍👧‍👦',
  food: '🍽️',
  places: '🏠',
  colors: '🎨',
  time: '⏰',
  actions: '🏃',
  phrases: '💬',
  weather: '☀️',
}

const categoryColors: Record<string, string> = {
  basics: 'bg-emerald-500',
  numbers: 'bg-blue-500',
  family: 'bg-pink-500',
  food: 'bg-orange-500',
  places: 'bg-purple-500',
  colors: 'bg-yellow-500',
  time: 'bg-cyan-500',
  actions: 'bg-red-500',
  phrases: 'bg-indigo-500',
  weather: 'bg-sky-500',
}

export function LessonMap() {
  const user = useAppStore((state) => state.user)
  const startLesson = useAppStore((state) => state.startLesson)
  const { hapticFeedback } = useTelegram()

  const completedLessons = user?.completedLessons || []

  const handleLessonClick = useCallback((lesson: Lesson) => {
    const isUnlocked = isLessonUnlocked(lesson.id, completedLessons)
    if (!isUnlocked) {
      hapticFeedback('error')
      return
    }
    
    hapticFeedback('medium')
    startLesson(lesson)
  }, [completedLessons, hapticFeedback, startLesson])

  // Group lessons by category
  const groupedLessons = lessonsData.reduce((acc, lesson) => {
    if (!acc[lesson.category]) {
      acc[lesson.category] = []
    }
    acc[lesson.category].push(lesson)
    return acc
  }, {} as Record<string, Lesson[]>)

  return (
    <div className="space-y-8">
      {Object.entries(groupedLessons).map(([category, lessons]) => {
        const completedInCategory = lessons.filter((l) => 
          completedLessons.includes(l.id)
        ).length
        const allCompleted = completedInCategory === lessons.length

        return (
          <div key={category} className="relative">
            {/* Category Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center text-xl',
                categoryColors[category] || 'bg-primary'
              )}>
                {categoryIcons[category] || '📚'}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground capitalize">{category}</h3>
                <p className="text-xs text-muted-foreground">
                  {completedInCategory}/{lessons.length} completed
                </p>
              </div>
              {allCompleted && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
            </div>

            {/* Lesson Nodes */}
            <div className="relative pl-5">
              {/* Connecting Line */}
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />

              <div className="space-y-4">
                {lessons.map((lesson, index) => {
                  const isCompleted = completedLessons.includes(lesson.id)
                  const isUnlocked = isLessonUnlocked(lesson.id, completedLessons)
                  const isNext = !isCompleted && isUnlocked

                  return (
                    <div key={lesson.id} className="relative flex items-center gap-4">
                      {/* Node */}
                      <button
                        onClick={() => handleLessonClick(lesson)}
                        disabled={!isUnlocked}
                        className={cn(
                          'relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200',
                          isCompleted && 'bg-primary text-primary-foreground shadow-lg shadow-primary/30',
                          isNext && 'bg-primary text-primary-foreground shadow-lg shadow-primary/30 animate-pulse-glow',
                          !isCompleted && !isNext && 'bg-muted text-muted-foreground',
                          isUnlocked && 'hover:scale-105 active:scale-95',
                          !isUnlocked && 'cursor-not-allowed opacity-70'
                        )}
                      >
                        {isCompleted ? (
                          <div className="flex flex-col items-center">
                            <Check className="w-5 h-5" />
                            <div className="flex items-center gap-0.5 mt-0.5">
                              <Star className="w-2.5 h-2.5 fill-current" />
                              <Star className="w-2.5 h-2.5 fill-current" />
                              <Star className="w-2.5 h-2.5 fill-current" />
                            </div>
                          </div>
                        ) : isUnlocked ? (
                          <Play className="w-6 h-6" />
                        ) : (
                          <Lock className="w-5 h-5" />
                        )}
                      </button>

                      {/* Lesson Info */}
                      <div className="flex-1">
                        <h4 className={cn(
                          'font-medium',
                          isUnlocked ? 'text-foreground' : 'text-muted-foreground'
                        )}>
                          {user?.learningPath === 'uz-en' ? lesson.title : lesson.titleUz}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {lesson.words.length} words
                          <span className="mx-1">·</span>
                          +{lesson.xpReward} XP
                        </p>
                      </div>

                      {/* Status Badge */}
                      {isNext && (
                        <div className="px-2 py-1 bg-primary/10 rounded-full">
                          <span className="text-xs font-medium text-primary">Start</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )
      })}

      {/* Completion Message */}
      {completedLessons.length === lessonsData.length && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🎉</div>
          <h3 className="text-xl font-bold text-foreground">Congratulations!</h3>
          <p className="text-muted-foreground mt-2">
            You&apos;ve completed all lessons. More content coming soon!
          </p>
        </div>
      )}
    </div>
  )
}
