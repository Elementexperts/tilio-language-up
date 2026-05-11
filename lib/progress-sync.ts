import type { CloudAuthSession, CloudProgressSnapshot, DailyChallenge, User } from '@/lib/types'
import { supabaseFetch } from '@/lib/supabase'

const normalizeCourseId = (courseId?: string) => (courseId === 'uz-ko' ? 'uz-ko' : 'uz-en')

export function buildProgressSnapshot(params: {
  user: User
  dailyChallenges: DailyChallenge[]
  currentLessonId: string | null
  currentExerciseIndex: number
  exerciseAnswers: { correct: number; incorrect: number; missedWordIds?: string[] }
}): CloudProgressSnapshot {
  return {
    ...params,
    user: {
      ...params.user,
      learningPath: normalizeCourseId(params.user.selectedCourse ?? params.user.learningPath),
      selectedCourse: normalizeCourseId(params.user.selectedCourse ?? params.user.learningPath),
      courseProgress: params.user.courseProgress ?? {
        'uz-en': {
          completedLessons: params.user.completedLessons ?? [],
          achievements: params.user.achievements ?? [],
        },
        'uz-ko': {
          completedLessons: [],
          achievements: [],
        },
      },
    },
    exerciseAnswers: {
      ...params.exerciseAnswers,
      missedWordIds: params.exerciseAnswers.missedWordIds ?? [],
    },
    updatedAt: new Date().toISOString(),
  }
}

export async function fetchCloudProgress(session: CloudAuthSession): Promise<CloudProgressSnapshot | null> {
  const rows = await supabaseFetch<Array<{
    progress: CloudProgressSnapshot
  }>>(`/rest/v1/user_progress?user_id=eq.${session.userId}&select=progress&limit=1`, {
    method: 'GET',
    accessToken: session.accessToken,
  })

  return rows[0]?.progress ?? null
}

export async function saveCloudProgress(session: CloudAuthSession, snapshot: CloudProgressSnapshot) {
  await supabaseFetch('/rest/v1/user_progress', {
    method: 'POST',
    accessToken: session.accessToken,
    headers: {
      Prefer: 'resolution=merge-duplicates',
    },
    body: JSON.stringify({
      user_id: session.userId,
      progress: snapshot,
      xp: snapshot.user.xp,
      streak: snapshot.user.streak,
      feathers: snapshot.user.feathers,
      completed_lessons: snapshot.user.completedLessons,
      achievements: snapshot.user.achievements,
      last_chest_claim: snapshot.user.lastChestClaim,
      settings: {
        learningPath: normalizeCourseId(snapshot.user.selectedCourse ?? snapshot.user.learningPath),
        selectedCourse: normalizeCourseId(snapshot.user.selectedCourse ?? snapshot.user.learningPath),
        courseProgress: snapshot.user.courseProgress ?? {},
        level: snapshot.user.level,
        dailyGoal: snapshot.user.dailyGoal,
        claimedReferralMilestones: snapshot.user.claimedReferralMilestones ?? [],
        avatarStyle: snapshot.user.avatarStyle,
        equippedTheme: snapshot.user.equippedTheme,
        equippedFrame: snapshot.user.equippedFrame,
        soundEnabled: true,
      },
      updated_at: snapshot.updatedAt,
    }),
  })
}

export function chooseNewestProgress(localUser: User | null, cloud: CloudProgressSnapshot | null) {
  if (!cloud) return null
  if (!localUser?.lastSyncedAt) {
    const localCourseProgressScore = Object.values(localUser?.courseProgress ?? {}).reduce(
      (sum, progress) => sum + (progress?.completedLessons.length ?? 0) + (progress?.achievements.length ?? 0),
      0,
    )
    const cloudCourseProgressScore = Object.values(cloud.user.courseProgress ?? {}).reduce(
      (sum, progress) => sum + (progress?.completedLessons.length ?? 0) + (progress?.achievements.length ?? 0),
      0,
    )
    const localProgressScore =
      (localUser?.completedLessons.length ?? 0) + (localUser?.xp ?? 0) + (localUser?.achievements.length ?? 0) + localCourseProgressScore
    const cloudProgressScore =
      cloud.user.completedLessons.length + cloud.user.xp + cloud.user.achievements.length + cloudCourseProgressScore

    return cloudProgressScore > localProgressScore ? cloud : null
  }
  return new Date(cloud.updatedAt).getTime() >= new Date(localUser.lastSyncedAt).getTime() ? cloud : null
}
