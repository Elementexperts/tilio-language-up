'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useAppStore } from '@/lib/store'
import { useTelegram } from '@/hooks/use-telegram'
import { cacheCloudSession, getCachedCloudSession, isCloudSessionFresh, signInWithTelegram } from '@/lib/auth'
import { buildProgressSnapshot, chooseNewestProgress, fetchCloudProgress, saveCloudProgress } from '@/lib/progress-sync'
import { isSupabaseConfigured } from '@/lib/supabase'

function isAuthError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)

  return (
    message.includes('401') ||
    message.includes('403') ||
    message.toLowerCase().includes('jwt') ||
    message.toLowerCase().includes('expired') ||
    message.toLowerCase().includes('unauthorized')
  )
}

export function useProgressSync() {
  const { initData, isReady } = useTelegram()
  const user = useAppStore((state) => state.user)
  const dailyChallenges = useAppStore((state) => state.dailyChallenges)
  const currentLesson = useAppStore((state) => state.currentLesson)
  const currentExerciseIndex = useAppStore((state) => state.currentExerciseIndex)
  const exerciseAnswers = useAppStore((state) => state.exerciseAnswers)
  const cloudSession = useAppStore((state) => state.cloudSession)
  const setCloudSession = useAppStore((state) => state.setCloudSession)
  const updateUser = useAppStore((state) => state.updateUser)
  const hydrateCloudProgress = useAppStore((state) => state.hydrateCloudProgress)
  const setSyncStatus = useAppStore((state) => state.setSyncStatus)
  const syncTimerRef = useRef<number | null>(null)
  const hasFetchedCloudRef = useRef(false)
  const lastSavedKeyRef = useRef('')

  const progressKey = useMemo(() => {
    if (!user) return null
    return JSON.stringify({
      user: {
        id: user.id,
        cloudUserId: user.cloudUserId,
        telegramId: user.telegramId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        photoUrl: user.photoUrl,
        avatarStyle: user.avatarStyle,
        learningPath: user.learningPath,
        selectedCourse: user.selectedCourse,
        level: user.level,
        dailyGoal: user.dailyGoal,
        xp: user.xp,
        feathers: user.feathers,
        streak: user.streak,
        maxStreak: user.maxStreak,
        streakFreezes: user.streakFreezes,
        lastActiveDate: user.lastActiveDate,
        completedLessons: user.completedLessons,
        achievements: user.achievements,
        courseProgress: user.courseProgress,
        referralCount: user.referralCount,
        claimedReferralMilestones: user.claimedReferralMilestones ?? [],
        joinedAt: user.joinedAt,
        lastChestClaim: user.lastChestClaim,
        userLevel: user.userLevel,
        equippedTheme: user.equippedTheme,
        equippedFrame: user.equippedFrame,
        purchasedItems: user.purchasedItems,
        xpMultiplier: user.xpMultiplier,
        xpMultiplierExpiresAt: user.xpMultiplierExpiresAt,
        wordReviews: user.wordReviews,
      },
      dailyChallenges,
      currentLessonId: currentLesson?.id ?? null,
      currentExerciseIndex,
      exerciseAnswers,
    })
  }, [user, dailyChallenges, currentLesson?.id, currentExerciseIndex, exerciseAnswers])

  const createSnapshot = () => {
    if (!user) return null
    return buildProgressSnapshot({
      user,
      dailyChallenges,
      currentLessonId: currentLesson?.id ?? null,
      currentExerciseIndex,
      exerciseAnswers,
    })
  }

  const resetCloudSession = () => {
    cacheCloudSession(null)
    setCloudSession(null)
    hasFetchedCloudRef.current = false
  }

  useEffect(() => {
    if (!isReady || !isSupabaseConfigured) return

    if (cloudSession && !isCloudSessionFresh(cloudSession)) {
      resetCloudSession()
      setSyncStatus('loading')
      return
    }

    const cachedSession = getCachedCloudSession()
    if (cachedSession && !cloudSession) {
      setCloudSession(cachedSession)
    }

    if (!initData || cloudSession) return

    let cancelled = false
    setSyncStatus('loading')
    signInWithTelegram(initData)
      .then((result) => {
        if (cancelled || !result) {
          if (!result) setSyncStatus('offline')
          return
        }
        setCloudSession(result.session)
        if (user) {
          updateUser(result.user)
        }
      })
      .catch((error) => {
        resetCloudSession()
        setSyncStatus('error', error instanceof Error ? error.message : 'Telegram sign-in failed')
      })

    return () => {
      cancelled = true
    }
  }, [cloudSession, initData, isReady, setCloudSession, setSyncStatus, updateUser, user])

  useEffect(() => {
    if (!cloudSession || hasFetchedCloudRef.current) return
    hasFetchedCloudRef.current = true
    let cancelled = false
    setSyncStatus('loading')
    fetchCloudProgress(cloudSession)
      .then((cloudProgress) => {
        if (cancelled) return
        const newerCloudProgress = chooseNewestProgress(user, cloudProgress)
        if (newerCloudProgress) {
          hydrateCloudProgress(newerCloudProgress)
        } else {
          setSyncStatus('synced')
        }
      })
      .catch((error) => {
        if (cancelled) return
        if (isAuthError(error)) {
          resetCloudSession()
          setSyncStatus('loading')
          return
        }
        setSyncStatus(typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'error', error instanceof Error ? error.message : 'Cloud progress fetch failed')
      })
    return () => {
      cancelled = true
    }
  }, [cloudSession?.userId, user, hydrateCloudProgress, setSyncStatus])

  useEffect(() => {
    if (!cloudSession || !progressKey) return
    if (typeof window === 'undefined') return
    if (lastSavedKeyRef.current === progressKey) return

    if (syncTimerRef.current) window.clearTimeout(syncTimerRef.current)
    syncTimerRef.current = window.setTimeout(() => {
      const snapshot = createSnapshot()
      if (!snapshot) return
      if (!navigator.onLine) {
        setSyncStatus('offline')
        return
      }
      setSyncStatus('saving')
      saveCloudProgress(cloudSession, {
        ...snapshot,
        user: {
          ...snapshot.user,
          cloudUserId: cloudSession.userId,
          lastSyncedAt: snapshot.updatedAt,
        },
      })
        .then(() => {
          lastSavedKeyRef.current = progressKey
          updateUser({ cloudUserId: cloudSession.userId, lastSyncedAt: snapshot.updatedAt })
          setSyncStatus('synced')
        })
        .catch((error) => {
          if (isAuthError(error)) {
            resetCloudSession()
            setSyncStatus('loading')
            return
          }
          setSyncStatus('error', error instanceof Error ? error.message : 'Cloud progress save failed')
        })
    }, 700)

    return () => {
      if (syncTimerRef.current) window.clearTimeout(syncTimerRef.current)
    }
  }, [cloudSession, progressKey, setSyncStatus, updateUser])

  useEffect(() => {
    if (!cloudSession || !progressKey || typeof window === 'undefined') return

    const handleOnline = () => {
      const snapshot = createSnapshot()
      if (!snapshot) return
      setSyncStatus('saving')
      saveCloudProgress(cloudSession, {
        ...snapshot,
        user: {
          ...snapshot.user,
          cloudUserId: cloudSession.userId,
          lastSyncedAt: snapshot.updatedAt,
        },
      })
        .then(() => {
          lastSavedKeyRef.current = progressKey
          updateUser({ cloudUserId: cloudSession.userId, lastSyncedAt: snapshot.updatedAt })
          setSyncStatus('synced')
        })
        .catch((error) => {
          if (isAuthError(error)) {
            resetCloudSession()
            setSyncStatus('loading')
            return
          }
          setSyncStatus('error', error instanceof Error ? error.message : 'Cloud reconnect save failed')
        })
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [cloudSession, progressKey, setSyncStatus, updateUser])
}
