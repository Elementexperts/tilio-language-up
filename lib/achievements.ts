import { BookOpen, Crown, Feather, Flame, GraduationCap, Mic, Star, Trophy, Users, Zap, type LucideIcon } from 'lucide-react'
import type { Achievement, CourseId, User } from '@/lib/types'
import { getAchievementsForCourse } from '@/lib/data/lessons'

export type AchievementProgress = Achievement & {
  current: number
  progress: number
  isUnlocked: boolean
}

export type BadgeTone = 'blue' | 'teal' | 'purple' | 'gold' | 'orange' | 'pink' | 'navy' | 'emerald' | 'amber'

export const achievementBadgeTone: Record<string, BadgeTone> = {
  'early-bird': 'blue',
  'word-collector': 'teal',
  '7-day-hero': 'purple',
  'speaking-master': 'gold',
  'referral-champion': 'orange',
  'streak-legend': 'pink',
  'xp-champion': 'navy',
  'feather-keeper': 'emerald',
  'course-hero': 'amber',
  'ko-first-hello': 'blue',
  'ko-word-collector': 'teal',
  'ko-grammar-starter': 'gold',
  'ko-hangul-reader': 'teal',
  'ko-travel-ready': 'navy',
  'ko-topik-starter': 'purple',
  'ko-course-complete': 'amber',
  'ru-first-hello': 'blue',
  'ru-word-collector': 'teal',
  'ru-grammar-starter': 'gold',
  'ru-travel-ready': 'navy',
  'ru-course-complete': 'amber',
  'ar-first-hello': 'blue',
  'ar-word-collector': 'teal',
  'ar-course-complete': 'amber',
  'de-first-hello': 'blue',
  'de-word-collector': 'teal',
  'de-course-complete': 'amber',
}

export const achievementBadgeIcon: Record<string, LucideIcon> = {
  'early-bird': Star,
  'word-collector': BookOpen,
  '7-day-hero': Trophy,
  'speaking-master': Mic,
  'referral-champion': Users,
  'streak-legend': Trophy,
  'xp-champion': Zap,
  'feather-keeper': Feather,
  'course-hero': GraduationCap,
  'ko-first-hello': Star,
  'ko-word-collector': BookOpen,
  'ko-grammar-starter': GraduationCap,
  'ko-hangul-reader': BookOpen,
  'ko-travel-ready': Trophy,
  'ko-topik-starter': GraduationCap,
  'ko-course-complete': Crown,
  'ru-first-hello': Star,
  'ru-word-collector': BookOpen,
  'ru-grammar-starter': GraduationCap,
  'ru-travel-ready': Trophy,
  'ru-course-complete': Crown,
  'ar-first-hello': Star,
  'ar-word-collector': BookOpen,
  'ar-course-complete': Crown,
  'de-first-hello': Star,
  'de-word-collector': BookOpen,
  'de-course-complete': Crown,
}

export function getAchievementCurrent(user: User, achievement: Achievement, courseId: CourseId) {
  const completedLessons = user.courseProgress?.[courseId]?.completedLessons ?? user.completedLessons

  switch (achievement.requirement.type) {
    case 'xp':
      return user.xp
    case 'streak':
      return Math.max(user.streak, user.maxStreak ?? 0)
    case 'lessons':
      return completedLessons.length
    case 'referrals':
      return user.referralCount
    case 'feathers':
      return user.feathers
    case 'level':
      return user.userLevel
    default:
      return 0
  }
}

export function getUserAchievementProgress(user: User, courseId: CourseId): AchievementProgress[] {
  const courseAchievementIds = user.courseProgress?.[courseId]?.achievements ?? user.achievements
  const globalAchievementIds = user.achievements ?? []

  return getAchievementsForCourse(courseId).map((achievement) => {
    const current = getAchievementCurrent(user, achievement, courseId)
    const unlockedIds = achievement.courseId ? courseAchievementIds : globalAchievementIds

    return {
      ...achievement,
      current,
      progress: Math.min((current / achievement.requirement.value) * 100, 100),
      isUnlocked: unlockedIds.includes(achievement.id) || current >= achievement.requirement.value,
    }
  })
}
