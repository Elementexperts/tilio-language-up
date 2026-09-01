'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useAppStore } from '@/lib/store'
import { useTelegram } from '@/hooks/use-telegram'
import { getCachedCloudSession } from '@/lib/auth'
import { buildProgressSnapshot, chooseNewestProgress, fetchCloudProgress, saveCloudProgress } from '@/lib/progress-sync'
import { isSupabaseConfigured } from '@/lib/supabase'

export function useProgressSync() {
  const { isReady } = useTelegram()
  const user = useAppStore((state) => state.user)
  const dailyChallenges = useAppStore((state) => state.dailyChallenges)
  const currentLesson = useAppStore((state) => state.currentLesson)
  const currentExerciseIndex = useAppStore((state) => state.currentExerciseIndex)
  const exerciseAnswers = useAppStore((state) => state.exerciseAnswers)
  const cloudSession = useAppStore((state) => state.cloudSession)
  const currentScreen = useAppStore((state) => state.currentScreen)
  const setCloudSession = useAppStore((state) => state.setCloudSession)
  const setScreen = useAppStore((state) => state.setScreen)
  const updateUser = useAppStore((state) => state.updateUser)
  const hydrateCloudProgress = useAppStore((state) => state.hydrateCloudProgress)
  const setSyncStatus = useAppStore((state) => state.setSyncStatus)
  const syncTimerRef = useRef<number | null>(null)
  const fetchedCloudUserRef = useRef<string | null>(null)
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
        claimedReferralMilestones: user.claimedReferralMilestones,
        joinedAt: user.joinedAt,
        lastChestClaim: user.lastChestClaim,
        userLevel: user.userLevel,
        equippedTheme: user.equippedTheme,
        equippedFrame: user.equippedFrame,
        purchasedItems: user.purchasedItems,
        xpMultiplier: user.xpMultiplier,
        xpMultiplierExpiresAt: user.xpMultiplierExpiresAt,
        wordReviews: user.wordReviews,
        activityLog: user.activityLog,
        plan: user.plan,
        plusExpiresAt: user.plusExpiresAt,
        plusSource: user.plusSource,
        plusUpdatedAt: user.plusUpdatedAt,
        plusChatUsage: user.plusChatUsage,
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

  useEffect(() => {
    if (!isReady || !isSupabaseConfigured) return

    const cachedSession = getCachedCloudSession()
    if (cachedSession && !cloudSession) {
      setCloudSession(cachedSession)
    }

  }, [cloudSession, isReady, setCloudSession])

  useEffect(() => {
    if (!cloudSession) {
      fetchedCloudUserRef.current = null
      setSyncStatus('idle')
      return
    }
    if (fetchedCloudUserRef.current === cloudSession.userId) return
    fetchedCloudUserRef.current = cloudSession.userId
    let cancelled = false
    setSyncStatus('loading')
    fetchCloudProgress(cloudSession)
      .then((cloudProgress) => {
        if (cancelled) return
        const newerCloudProgress = chooseNewestProgress(user, cloudProgress)
        if (newerCloudProgress) {
          hydrateCloudProgress(newerCloudProgress)
          if (currentScreen === 'auth' || currentScreen === 'onboarding' || currentScreen === 'splash') {
            setScreen('home')
          }
        } else {
          setSyncStatus('synced')
        }
      })
      .catch((error) => setSyncStatus(typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'error', error instanceof Error ? error.message : 'Cloud progress fetch failed'))
    return () => {
      cancelled = true
    }
  }, [cloudSession?.userId, currentScreen, user, hydrateCloudProgress, setScreen, setSyncStatus])

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
        .catch((error) => setSyncStatus('error', error instanceof Error ? error.message : 'Cloud progress save failed'))
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
        .catch((error) => setSyncStatus('error', error instanceof Error ? error.message : 'Cloud reconnect save failed'))
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [cloudSession, progressKey, setSyncStatus, updateUser])
}
