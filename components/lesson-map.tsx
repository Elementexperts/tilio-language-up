'use client'

import { useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { lessonsData, isLessonUnlocked } from '@/lib/data/lessons'
import { useTelegram } from '@/hooks/use-telegram'
import { cn } from '@/lib/utils'
import { BookOpen, Check, Clock, Footprints, Hash, Heart, Home, Lock, MessageCircle, Palette, Play, Star, Sun, Utensils } from 'lucide-react'
import type { Lesson } from '@/lib/types'

const categoryIcons: Record<string, React.ElementType> = {
  basics: BookOpen,
  numbers: Hash,
  family: Heart,
  food: Utensils,
  places: Home,
  colors: Palette,
  time: Clock,
  actions: Footprints,
  phrases: MessageCircle,
  weather: Sun,
}

const categoryColors: Record<string, string> = {
  basics: 'bg-emerald-500',
  numbers: 'bg-sky-500',
  family: 'bg-rose-500',
  food: 'bg-orange-500',
  places: 'bg-teal-600',
  colors: 'bg-amber-400',
  time: 'bg-cyan-500',
  actions: 'bg-lime-600',
  phrases: 'bg-indigo-500',
  weather: 'bg-yellow-400',
}

export function LessonMap() {
  const user = useAppStore((state) => state.user)
  const startLesson = useAppStore((state) => state.startLesson)
  const { hapticFeedback } = useTelegram()

  const completedLessons = user?.completedLessons || []

  const handleLessonClick = useCallback(
    (lesson: Lesson) => {
      const unlocked = isLessonUnlocked(lesson.id, completedLessons)
      if (!unlocked) {
        hapticFeedback('error')
        return
      }

      hapticFeedback('medium')
      startLesson(lesson)
    },
    [completedLessons, hapticFeedback, startLesson],
  )

  const groupedLessons = lessonsData.reduce((acc, lesson) => {
    if (!acc[lesson.category]) acc[lesson.category] = []
    acc[lesson.category].push(lesson)
    return acc
  }, {} as Record<string, Lesson[]>)

  return (
    <div className="space-y-8">
      {Object.entries(groupedLessons).map(([category, lessons]) => {
        const completedInCategory = lessons.filter((lesson) => completedLessons.includes(lesson.id)).length
        const allCompleted = completedInCategory === lessons.length
        const CategoryIcon = categoryIcons[category] || BookOpen

        return (
          <div key={category} className="rounded-[1.75rem] border border-white/70 bg-white/70 p-4 shadow-xl shadow-emerald-950/5">
            <div className="mb-4 flex items-center gap-3">
              <div className={cn('flex size-11 items-center justify-center rounded-2xl text-white shadow-lg shadow-emerald-950/10', categoryColors[category] || 'bg-primary')}>
                <CategoryIcon className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-black capitalize text-foreground">{category}</h3>
                <p className="text-xs font-semibold text-muted-foreground">{completedInCategory}/{lessons.length} completed</p>
              </div>
              {allCompleted && (
                <div className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="size-4" />
                </div>
              )}
            </div>

            <div className="relative pl-5">
              <div className="absolute bottom-2 left-5 top-2 w-1 rounded-full bg-primary/10" />
              <div className="space-y-4">
                {lessons.map((lesson) => {
                  const completed = completedLessons.includes(lesson.id)
                  const unlocked = isLessonUnlocked(lesson.id, completedLessons)
                  const next = !completed && unlocked

                  return (
                    <div key={lesson.id} className="relative flex items-center gap-4">
                      <button
                        onClick={() => handleLessonClick(lesson)}
                        disabled={!unlocked}
                        className={cn(
                          'tilio-pressed relative z-10 flex size-14 items-center justify-center rounded-2xl transition-all duration-200',
                          completed && 'bg-primary text-primary-foreground shadow-lg shadow-primary/30',
                          next && 'animate-pulse-glow bg-primary text-primary-foreground shadow-lg shadow-primary/30',
                          !completed && !next && 'border border-border bg-white text-muted-foreground shadow-sm',
                          !unlocked && 'cursor-not-allowed opacity-70',
                        )}
                      >
                        {completed ? (
                          <div className="flex flex-col items-center">
                            <Check className="size-5" />
                            <div className="mt-0.5 flex items-center gap-0.5">
                              <Star className="size-2.5 fill-current" />
                              <Star className="size-2.5 fill-current" />
                              <Star className="size-2.5 fill-current" />
                            </div>
                          </div>
                        ) : unlocked ? (
                          <Play className="size-6 fill-current" />
                        ) : (
                          <Lock className="size-5" />
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <h4 className={cn('truncate font-black', unlocked ? 'text-foreground' : 'text-muted-foreground')}>
                          {lesson.title}
                        </h4>
                        <p className="text-xs font-semibold text-muted-foreground">{lesson.words.length} words / +{lesson.xpReward} XP</p>
                      </div>

                      {next && <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">Start</span>}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )
      })}

      {completedLessons.length === lessonsData.length && (
        <div className="py-8 text-center">
          <Star className="mx-auto mb-4 size-12 fill-accent text-accent" />
          <h3 className="text-xl font-black text-foreground">Congratulations!</h3>
          <p className="mt-2 text-muted-foreground">You have completed all lessons. More content coming soon.</p>
        </div>
      )}
    </div>
  )
}
