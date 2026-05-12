import type { CloudAuthSession } from '@/lib/types'
import { supabaseFetch } from '@/lib/supabase'

export interface TesterStats {
  totalTesters: number
  activeToday: number
  activeThisWeek: number
  newSignupsThisWeek: number
  averageStreak: number
  averageCompletedLessons: number
  courses: Array<{
    courseId: string
    testers: number
  }>
  recentTesters: Array<{
    id: string
    name: string
    username: string | null
    joinedAt: string
    lastActiveAt: string | null
    courseId: string
    xp: number
    streak: number
  }>
}

export async function fetchTesterStats(session: CloudAuthSession) {
  return supabaseFetch<TesterStats>('/functions/v1/tester-stats', {
    method: 'GET',
    accessToken: session.accessToken,
  })
}
