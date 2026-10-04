import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { achievementsData, getAchievementsForCourse, getLessonById } from './data/lessons'
import {
  getLevel,
  type AppState,
  type DailyChallenge,
  type ChestReward,
  type User,
  type AchievementPopup,
  type CloudProgressSnapshot,
  type CloudAuthSession,
  type CourseId,
  type CourseProgress,
  type SkillFocus,
  type SyncStatus,
  type UserActivityDay,
} from './types'
import { getPlusChatUsage, isPlusActive } from './plus'

const getToday = () => new Date().toISOString().split('T')[0]

const generateDailyChallenges = (): DailyChallenge[] => {
  const today = getToday()
  return [
    {
      id: `dc-lessons-${today}`,
      date: today,
      type: 'lessons',
      target: 2,
      current: 0,
      xpReward: 20,
      featherReward: 8,
      completed: false,
    },
    {
      id: `dc-xp-${today}`,
      date: today,
      type: 'xp',
      target: 50,
      current: 0,
      xpReward: 25,
      featherReward: 10,
      completed: false,
    },
    {
      id: `dc-streak-${today}`,
      date: today,
      type: 'streak',
      target: 1,
      current: 0,
      xpReward: 15,
      featherReward: 15,
      completed: false,
    },
  ]
}

const FEATHERS_FOR_STREAK_FREEZE = 50
const MAX_STREAK_FREEZES = 2
const REFERRAL_XP_REWARD = 35
const REFERRAL_FEATHER_REWARD = 20
const TESTER_PLUS_DAYS = [7, 30, 90] as const

const getYesterday = () => {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return yesterday.toISOString().split('T')[0]
}

const normalizeCourseId = (courseId?: string): CourseId => {
  if (courseId === 'uz-ko') return 'uz-ko'
  if (courseId === 'uz-ru') return 'uz-ru'
  if (courseId === 'uz-ar') return 'uz-ar'
  if (courseId === 'uz-de') return 'uz-de'
  return 'uz-en'
}

const getProgressForCourse = (user: User, courseId: CourseId): CourseProgress => {
  const selected = user.courseProgress?.[courseId]
  if (selected) {
    return {
      completedLessons: selected.completedLessons ?? [],
      achievements: selected.achievements ?? [],
    }
  }
  if (courseId === 'uz-en') {
    return {
      completedLessons: user.completedLessons ?? [],
      achievements: user.achievements ?? [],
    }
  }
  return { completedLessons: [], achievements: [] }
}

const withNormalizedCourseProgress = (user: User): User => {
  const selectedCourse = normalizeCourseId(user.selectedCourse ?? user.learningPath)
  const courseProgress: Partial<Record<CourseId, CourseProgress>> = {
    'uz-en': getProgressForCourse(user, 'uz-en'),
    'uz-ko': getProgressForCourse(user, 'uz-ko'),
    'uz-ru': getProgressForCourse(user, 'uz-ru'),
    'uz-ar': getProgressForCourse(user, 'uz-ar'),
    'uz-de': getProgressForCourse(user, 'uz-de'),
  }
  const selectedProgress = courseProgress[selectedCourse] ?? { completedLessons: [], achievements: [] }

  return {
    ...user,
    selectedCourse,
    completedLessons: selectedProgress.completedLessons,
    achievements: selectedProgress.achievements,
    courseProgress,
  }
}

const claimableAchievementRewards = (user: User, courseId: CourseId) => {
  const courseProgress = getProgressForCourse(user, courseId)
  const globalAchievementIds = new Set([
    ...(user.achievements ?? []),
    ...Object.values(user.courseProgress ?? {}).flatMap((progress) => progress?.achievements ?? []),
  ])
  const unlocked = getAchievementsForCourse(courseId).filter((achievement) => {
    const unlockedIds = achievement.courseId ? courseProgress.achievements : Array.from(globalAchievementIds)
    if (unlockedIds.includes(achievement.id)) return false
    switch (achievement.requirement.type) {
      case 'xp':
        return user.xp >= achievement.requirement.value
      case 'streak':
        return Math.max(user.streak, user.maxStreak ?? 0) >= achievement.requirement.value
      case 'lessons':
        return courseProgress.completedLessons.length >= achievement.requirement.value
      case 'referrals':
        return user.referralCount >= achievement.requirement.value
      case 'feathers':
        return user.feathers >= achievement.requirement.value
      case 'level':
        return user.userLevel >= achievement.requirement.value
      default:
        return false
    }
  })

  return {
    unlockedIds: unlocked.map((a) => a.id),
    xp: unlocked.reduce((sum, a) => sum + a.xpReward, 0),
    feathers: unlocked.reduce((sum, a) => sum + (a.featherReward ?? 0), 0),
  }
}

type ActivityUpdate = Pick<UserActivityDay, 'xpEarned' | 'feathersEarned' | 'lessonsCompleted' | 'practiceSessions' | 'studySessions' | 'newWordsLearned' | 'wordsReviewed' | 'correctAnswers' | 'incorrectAnswers' | 'missedWords'> & {
  date: string
  courseId: CourseId
  skillFocus: SkillFocus
}

const updateActivityLog = (user: User, activity: ActivityUpdate): Record<string, UserActivityDay> => {
  const existing = user.activityLog?.[activity.date]
  const courseSessions: Partial<Record<CourseId, number>> = { ...(existing?.courseSessions ?? {}) }
  const skillSessions: Partial<Record<SkillFocus, number>> = { ...(existing?.skillSessions ?? {}) }

  courseSessions[activity.courseId] = (courseSessions[activity.courseId] ?? 0) + 1
  skillSessions[activity.skillFocus] = (skillSessions[activity.skillFocus] ?? 0) + 1

  return {
    ...(user.activityLog ?? {}),
    [activity.date]: {
      date: activity.date,
      xpEarned: (existing?.xpEarned ?? 0) + activity.xpEarned,
      feathersEarned: (existing?.feathersEarned ?? 0) + activity.feathersEarned,
      lessonsCompleted: (existing?.lessonsCompleted ?? 0) + activity.lessonsCompleted,
      practiceSessions: (existing?.practiceSessions ?? 0) + activity.practiceSessions,
      studySessions: (existing?.studySessions ?? 0) + activity.studySessions,
      newWordsLearned: (existing?.newWordsLearned ?? 0) + activity.newWordsLearned,
      wordsReviewed: (existing?.wordsReviewed ?? 0) + activity.wordsReviewed,
      correctAnswers: (existing?.correctAnswers ?? 0) + activity.correctAnswers,
      incorrectAnswers: (existing?.incorrectAnswers ?? 0) + activity.incorrectAnswers,
      missedWords: (existing?.missedWords ?? 0) + activity.missedWords,
      courseSessions,
      skillSessions,
    },
  }
}

const randomFromRange = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min

const getActiveXpMultiplier = (user: User) => {
  if (!user.xpMultiplierExpiresAt) return 1
  return new Date(user.xpMultiplierExpiresAt).getTime() > Date.now() ? user.xpMultiplier ?? 1 : 1
}

const buildAchievementPopups = (ids: string[]): AchievementPopup[] =>
  ids
    .map((id) => achievementsData.find((achievement) => achievement.id === id))
    .filter((achievement): achievement is NonNullable<typeof achievement> => Boolean(achievement))
    .map((achievement) => ({
      id: `${achievement.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      achievementId: achievement.id,
      title: achievement.titleUz || achievement.title,
      description: achievement.descriptionUz || achievement.description,
      icon: achievement.icon,
      timestamp: Date.now(),
    }))

const randomChestRewards = (user: User): ChestReward[] => {
  const rewards: ChestReward[] = [
    {
      type: 'xp',
      amount: randomFromRange(20, 50),
      label: 'Learning XP Boost',
    },
    {
      type: 'feathers',
      amount: randomFromRange(12, 30),
      label: 'Feather Bundle',
    },
  ]

  if (user.streakFreezes < MAX_STREAK_FREEZES && Math.random() > 0.58) {
    rewards.push({
      type: 'streak_freeze',
      amount: 1,
      label: 'Streak Freeze',
    })
  }

  if (Math.random() > 0.72) {
    rewards.push({
      type: 'bonus_multiplier',
      amount: 2,
      label: '24h XP Multiplier',
    })
  }

  return rewards
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      authProfile: null,
      currentScreen: 'splash',
      currentLesson: null,
      currentExerciseIndex: 0,
      exerciseAnswers: { correct: 0, incorrect: 0, missedWordIds: [] },
      dailyChallenges: [],
      isLoading: false,
      isSoundEnabled: true,
      syncStatus: 'idle',
      syncError: null,
      cloudSession: null,
      xpPopups: [],
      achievementPopups: [],
      lastCompletionReward: null,
      showStreakSavedModal: false,
      showLevelUpModal: false,
      newLevel: 1,
      tutorLaunchPrompt: null,

      setUser: (user) =>
        set({
          user: user
            ? withNormalizedCourseProgress({
                ...user,
                feathers: user.feathers ?? 0,
                avatarStyle: user.avatarStyle ?? 'boy',
                maxStreak: user.maxStreak ?? user.streak ?? 0,
                streakFreezes: user.streakFreezes ?? 0,
                lastChestClaim: user.lastChestClaim ?? null,
                userLevel: user.userLevel ?? getLevel(user.xp ?? 0),
                equippedTheme: user.equippedTheme ?? 'classic-green',
                equippedFrame: user.equippedFrame ?? 'default',
                purchasedItems: user.purchasedItems ?? [],
                xpMultiplier: user.xpMultiplier ?? 1,
                xpMultiplierExpiresAt: user.xpMultiplierExpiresAt ?? null,
                wordReviews: user.wordReviews ?? {},
                activityLog: user.activityLog ?? {},
                plan: user.plan ?? 'free',
                plusExpiresAt: user.plusExpiresAt ?? null,
                plusSource: user.plusSource ?? null,
                plusUpdatedAt: user.plusUpdatedAt ?? null,
                plusChatUsage: user.plusChatUsage ?? { date: getToday(), count: 0 },
                cloudUserId: user.cloudUserId,
                telegramId: user.telegramId,
                selectedCourse: normalizeCourseId(user.selectedCourse ?? user.learningPath),
                claimedReferralMilestones: user.claimedReferralMilestones ?? [],
                lastSyncedAt: user.lastSyncedAt ?? null,
              })
            : null,
        }),

      setAuthProfile: (profile) => set({ authProfile: profile }),
      
      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null,
      })),

      setSelectedCourse: (courseId) => set((state) => {
        if (!state.user) return { user: null }
        const selectedCourse = normalizeCourseId(courseId)
        const currentCourse = normalizeCourseId(state.user.selectedCourse ?? state.user.learningPath)
        const currentProgress: CourseProgress = {
          completedLessons: state.user.completedLessons ?? [],
          achievements: state.user.achievements ?? [],
        }
        const nextCourseProgress = {
          ...state.user.courseProgress,
          [currentCourse]: currentProgress,
        }
        const selectedProgress = getProgressForCourse(
          {
            ...state.user,
            courseProgress: nextCourseProgress,
          },
          selectedCourse,
        )

        return {
          user: {
            ...state.user,
            selectedCourse,
            completedLessons: selectedProgress.completedLessons,
            achievements: selectedProgress.achievements,
            courseProgress: {
              ...nextCourseProgress,
              [selectedCourse]: selectedProgress,
            },
          },
        }
      }),

      hydrateCloudProgress: (snapshot: CloudProgressSnapshot) =>
        set((state) => ({
          user: withNormalizedCourseProgress({
            ...snapshot.user,
            wordReviews: snapshot.user.wordReviews ?? {},
            activityLog: snapshot.user.activityLog ?? {},
            plan: state.user?.plan ?? snapshot.user.plan ?? 'free',
            plusExpiresAt: state.user?.plusExpiresAt ?? snapshot.user.plusExpiresAt ?? null,
            plusSource: state.user?.plusSource ?? snapshot.user.plusSource ?? null,
            plusUpdatedAt: state.user?.plusUpdatedAt ?? snapshot.user.plusUpdatedAt ?? null,
            plusChatUsage: snapshot.user.plusChatUsage ?? { date: getToday(), count: 0 },
            lastSyncedAt: snapshot.updatedAt,
          }),
          dailyChallenges: snapshot.dailyChallenges ?? state.dailyChallenges,
          currentLesson: snapshot.currentLessonId ? getLessonById(snapshot.currentLessonId) ?? state.currentLesson : state.currentLesson,
          currentExerciseIndex: snapshot.currentExerciseIndex ?? state.currentExerciseIndex,
          exerciseAnswers: {
            correct: snapshot.exerciseAnswers?.correct ?? state.exerciseAnswers.correct,
            incorrect: snapshot.exerciseAnswers?.incorrect ?? state.exerciseAnswers.incorrect,
            missedWordIds: snapshot.exerciseAnswers?.missedWordIds ?? state.exerciseAnswers.missedWordIds ?? [],
          },
          syncStatus: 'synced',
          syncError: null,
        })),

      setCloudSession: (session: CloudAuthSession | null) => set({ cloudSession: session }),

      setSyncStatus: (status: SyncStatus, error = null) => set({ syncStatus: status, syncError: error }),

      setScreen: (screen) => set({ currentScreen: screen }),
      launchTutor: (prompt = '') => set({ currentScreen: 'plus', tutorLaunchPrompt: prompt.trim() }),
      clearTutorLaunchPrompt: () => set({ tutorLaunchPrompt: null }),

      startLesson: (lesson) => set({
        currentLesson: lesson,
        currentExerciseIndex: 0,
        exerciseAnswers: { correct: 0, incorrect: 0, missedWordIds: [] },
        currentScreen: 'exercise',
      }),

      completeExercise: (correct, wordId, trackMiss = true) => set((state) => {
        const user = state.user
        const today = getToday()
        const wordReviews = user?.wordReviews ?? {}
        const existingReview = user && wordId ? wordReviews[wordId] : null
        const currentInterval = existingReview?.intervalDays ?? 0
        const nextInterval = correct
          ? currentInterval === 0
            ? 1
            : currentInterval === 1
              ? 3
              : currentInterval === 3
                ? 7
                : Math.min(currentInterval * 2, 30)
          : 1
        const nextReviewDate = new Date()
        nextReviewDate.setDate(nextReviewDate.getDate() + nextInterval)

        return {
          exerciseAnswers: {
            correct: state.exerciseAnswers.correct + (correct ? 1 : 0),
            incorrect: state.exerciseAnswers.incorrect + (correct ? 0 : 1),
            missedWordIds: !correct && wordId && trackMiss && !state.exerciseAnswers.missedWordIds?.includes(wordId)
              ? [...(state.exerciseAnswers.missedWordIds ?? []), wordId]
              : state.exerciseAnswers.missedWordIds ?? [],
          },
          currentExerciseIndex: state.currentExerciseIndex + 1,
          user: user && wordId
            ? {
                ...user,
                wordReviews: {
                  ...wordReviews,
                  [wordId]: {
                    wordId,
                    correctCount: (existingReview?.correctCount ?? 0) + (correct ? 1 : 0),
                    incorrectCount: (existingReview?.incorrectCount ?? 0) + (correct ? 0 : 1),
                    intervalDays: nextInterval,
                    nextReviewAt: nextReviewDate.toISOString().split('T')[0],
                    lastReviewedAt: today,
                  },
                },
              }
            : user,
        }
      }),

      completeLesson: () => {
        const state = get()
        if (!state.user || !state.currentLesson) return

        const user = state.user
        const lessonId = state.currentLesson.id
        const courseId = normalizeCourseId(state.currentLesson.courseId ?? user.selectedCourse ?? user.learningPath)
        const activeProgress = getProgressForCourse(user, courseId)
        const multiplier = getActiveXpMultiplier(user)
        const xpEarned = Math.round(state.currentLesson.xpReward * multiplier)
        const featherEarned = state.currentLesson.featherReward ?? 5
        const isPracticeSession = Boolean(state.currentLesson.isPracticeSession)
        const alreadyCompleted = activeProgress.completedLessons.includes(lessonId)
        const lessonCompletedNow = !isPracticeSession && !alreadyCompleted
        const newCompletedLessons = lessonCompletedNow
          ? [...activeProgress.completedLessons, lessonId]
          : activeProgress.completedLessons

        // Update daily challenges
        const today = getToday()
        let challenges = state.dailyChallenges
        if (challenges.length === 0 || challenges[0].date !== today) {
          challenges = generateDailyChallenges()
        }
        
        challenges = challenges.map((challenge) => {
          if (challenge.completed) return challenge
          
          if (challenge.type === 'lessons') {
            if (!lessonCompletedNow) return challenge
            const newCurrent = challenge.current + 1
            return {
              ...challenge,
              current: newCurrent,
              completed: newCurrent >= challenge.target,
            }
          }
          if (challenge.type === 'xp') {
            const newCurrent = challenge.current + xpEarned
            return {
              ...challenge,
              current: newCurrent,
              completed: newCurrent >= challenge.target,
            }
          }
          if (challenge.type === 'streak') {
            const newCurrent = Math.min(user.streak, challenge.target)
            return {
              ...challenge,
              current: newCurrent,
              completed: newCurrent >= challenge.target,
            }
          }
          return challenge
        })

        // Calculate bonus rewards from newly completed challenges
        const completedNow = challenges
          .filter((c) => c.completed && !state.dailyChallenges.find((dc) => dc.id === c.id && dc.completed))
        const challengeBonusXp = completedNow.reduce((sum, c) => sum + c.xpReward, 0)
        const challengeBonusFeathers = completedNow.reduce((sum, c) => sum + c.featherReward, 0)
        const baseXp = user.xp + xpEarned + challengeBonusXp
        const baseFeathers = user.feathers + featherEarned + challengeBonusFeathers
        const leveled = getLevel(baseXp)
        const achievementRewards = claimableAchievementRewards({
          ...user,
          xp: baseXp,
          feathers: baseFeathers,
          completedLessons: newCompletedLessons,
          userLevel: leveled,
          courseProgress: {
            ...user.courseProgress,
            [courseId]: {
              completedLessons: newCompletedLessons,
              achievements: activeProgress.achievements,
            },
          },
        }, courseId)
        const finalXp = baseXp + achievementRewards.xp
        const finalFeathers = baseFeathers + achievementRewards.feathers
        const finalLevel = getLevel(finalXp)
        const totalAnswered = state.exerciseAnswers.correct + state.exerciseAnswers.incorrect
        const accuracy = totalAnswered > 0 ? Math.round((state.exerciseAnswers.correct / totalAnswered) * 100) : 0
        const nextCourseProgress = {
          ...user.courseProgress,
          [courseId]: {
            completedLessons: newCompletedLessons,
            achievements: [...activeProgress.achievements, ...achievementRewards.unlockedIds],
          },
        }

        set({
          user: {
            ...user,
            selectedCourse: courseId,
            xp: finalXp,
            feathers: finalFeathers,
            userLevel: finalLevel,
            achievements: nextCourseProgress[courseId]?.achievements ?? user.achievements,
            completedLessons: newCompletedLessons,
            courseProgress: nextCourseProgress,
            lastActiveDate: today,
            activityLog: updateActivityLog(user, {
              date: today,
              courseId,
              skillFocus: state.currentLesson.skillFocus ?? 'mixed',
              xpEarned: xpEarned + challengeBonusXp + achievementRewards.xp,
              feathersEarned: featherEarned + challengeBonusFeathers + achievementRewards.feathers,
              lessonsCompleted: lessonCompletedNow ? 1 : 0,
              practiceSessions: isPracticeSession ? 1 : 0,
              studySessions: 1,
              newWordsLearned: lessonCompletedNow ? state.currentLesson.words.length : 0,
              wordsReviewed: isPracticeSession || state.currentLesson.isReview ? state.currentLesson.words.length : 0,
              correctAnswers: state.exerciseAnswers.correct,
              incorrectAnswers: state.exerciseAnswers.incorrect,
              missedWords: state.exerciseAnswers.missedWordIds?.length ?? 0,
            }),
            xpMultiplier: multiplier,
            xpMultiplierExpiresAt: multiplier > 1 ? user.xpMultiplierExpiresAt : null,
          },
          dailyChallenges: challenges,
          lastCompletionReward: {
            sessionType: isPracticeSession || state.currentLesson.isReview ? 'review' : 'lesson',
            title: state.currentLesson.title,
            xp: xpEarned + challengeBonusXp + achievementRewards.xp,
            feathers: featherEarned + challengeBonusFeathers + achievementRewards.feathers,
            streak: user.streak,
            streakFreeze: 0,
            accuracy,
            correct: state.exerciseAnswers.correct,
            incorrect: state.exerciseAnswers.incorrect,
            wordsPracticed: state.currentLesson.words.length,
            timestamp: Date.now(),
          },
          currentScreen: 'result',
          showLevelUpModal: finalLevel > user.userLevel,
          newLevel: finalLevel,
          achievementPopups: [
            ...state.achievementPopups,
            ...buildAchievementPopups(achievementRewards.unlockedIds),
          ],
        })

        get().addXpPopup(xpEarned + challengeBonusXp + achievementRewards.xp, 'xp', multiplier > 1 ? `${multiplier}x XP active` : undefined)
        get().addXpPopup(featherEarned + challengeBonusFeathers + achievementRewards.feathers, 'feathers')
      },

      addXp: (amount) => {
        const state = get()
        if (!state.user) return
        const nextXp = state.user.xp + amount
        const nextLevel = getLevel(nextXp)
        set({
          user: { ...state.user, xp: nextXp, userLevel: nextLevel },
          showLevelUpModal: nextLevel > state.user.userLevel,
          newLevel: nextLevel,
        })
        if (amount > 0) get().addXpPopup(amount, 'xp')
      },

      addFeathers: (amount) => {
        const state = get()
        if (!state.user || amount === 0) return
        set({
          user: { ...state.user, feathers: Math.max(0, state.user.feathers + amount) },
        })
        if (amount > 0) get().addXpPopup(amount, 'feathers')
      },

      updateStreak: () => {
        const state = get()
        if (!state.user) return

        const today = getToday()
        const { streak: currentStreak, lastActiveDate: lastActive } = state.user

        // Idempotent guard: if already updated for today, do nothing.
        if (lastActive === today) return

        const yesterdayStr = getYesterday()

        let newStreak = currentStreak
        let remainingFreezes = state.user.streakFreezes
        let streakWasSaved = false
        if (lastActive === yesterdayStr) {
          newStreak += 1
        } else {
          if (currentStreak > 0 && state.user.streakFreezes > 0) {
            remainingFreezes = Math.max(0, remainingFreezes - 1)
            streakWasSaved = true
          } else {
            newStreak = 1
          }
        }

        const streakXpBonus = newStreak > currentStreak ? Math.min(10 + newStreak * 2, 60) : 0
        const streakFeatherBonus = newStreak > currentStreak ? Math.min(5 + newStreak, 30) : 0
        const maxStreak = Math.max(state.user.maxStreak, newStreak)
        const boostedXp = state.user.xp + streakXpBonus
        const boostedFeathers = state.user.feathers + streakFeatherBonus
        const leveled = getLevel(boostedXp)
        const courseId = normalizeCourseId(state.user.selectedCourse ?? state.user.learningPath)
        const activeProgress = getProgressForCourse(state.user, courseId)
        const achievementRewards = claimableAchievementRewards({
          ...state.user,
          streak: newStreak,
          maxStreak,
          xp: boostedXp,
          feathers: boostedFeathers,
          userLevel: leveled,
        }, courseId)
        const finalXp = boostedXp + achievementRewards.xp
        const finalFeathers = boostedFeathers + achievementRewards.feathers
        const finalLevel = getLevel(finalXp)
        const nextCourseProgress = {
          ...state.user.courseProgress,
          [courseId]: {
            ...activeProgress,
            achievements: [...activeProgress.achievements, ...achievementRewards.unlockedIds],
          },
        }

        set({
          user: {
            ...state.user,
            streak: newStreak,
            maxStreak,
            streakFreezes: remainingFreezes,
            lastActiveDate: today,
            xp: finalXp,
            feathers: finalFeathers,
            userLevel: finalLevel,
            achievements: nextCourseProgress[courseId]?.achievements ?? state.user.achievements,
            courseProgress: nextCourseProgress,
          },
          showLevelUpModal: finalLevel > state.user.userLevel,
          newLevel: finalLevel,
          showStreakSavedModal: streakWasSaved,
          achievementPopups: [
            ...state.achievementPopups,
            ...buildAchievementPopups(achievementRewards.unlockedIds),
          ],
        })
        if (streakWasSaved) {
          get().addXpPopup(1, 'streak_saved', 'Streak saved')
        }
        if (streakXpBonus + achievementRewards.xp > 0) {
          get().addXpPopup(streakXpBonus + achievementRewards.xp, 'xp')
        }
        if (streakFeatherBonus + achievementRewards.feathers > 0) {
          get().addXpPopup(streakFeatherBonus + achievementRewards.feathers, 'feathers')
        }
      },

      useStreakFreeze: () => {
        const state = get()
        if (!state.user || state.user.feathers < FEATHERS_FOR_STREAK_FREEZE) return false
        if (state.user.streakFreezes >= MAX_STREAK_FREEZES) return false
        set({
          user: {
            ...state.user,
            feathers: state.user.feathers - FEATHERS_FOR_STREAK_FREEZE,
            streakFreezes: Math.min(MAX_STREAK_FREEZES, state.user.streakFreezes + 1),
          },
        })
        get().addXpPopup(1, 'freeze', 'Streak Freeze')
        return true
      },

      claimDailyChest: () => {
        const state = get()
        if (!state.user) return []
        const today = getToday()
        if (state.user.lastChestClaim === today) return []

        const rewards = randomChestRewards(state.user)
        let xpGain = 0
        let featherGain = 0
        let freezeGain = 0
        let multiplierReward = 1

        rewards.forEach((reward) => {
          if (reward.type === 'xp') xpGain += reward.amount
          if (reward.type === 'feathers') featherGain += reward.amount
          if (reward.type === 'streak_freeze') freezeGain += reward.amount
          if (reward.type === 'bonus_multiplier') multiplierReward = Math.max(multiplierReward, reward.amount)
        })

        const nextXp = state.user.xp + xpGain
        const nextLevel = getLevel(nextXp)
        const nextFreezeCount = Math.min(MAX_STREAK_FREEZES, state.user.streakFreezes + freezeGain)
        const multiplierExpiresAt = multiplierReward > 1
          ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          : state.user.xpMultiplierExpiresAt

        set({
          user: {
            ...state.user,
            xp: nextXp,
            userLevel: nextLevel,
            feathers: state.user.feathers + featherGain,
            streakFreezes: nextFreezeCount,
            xpMultiplier: multiplierReward > 1 ? multiplierReward : getActiveXpMultiplier(state.user),
            xpMultiplierExpiresAt: multiplierExpiresAt,
            lastChestClaim: today,
          },
          showLevelUpModal: nextLevel > state.user.userLevel,
          newLevel: nextLevel,
        })
        if (xpGain > 0) get().addXpPopup(xpGain, 'xp')
        if (featherGain > 0) get().addXpPopup(featherGain, 'feathers')
        if (nextFreezeCount > state.user.streakFreezes) get().addXpPopup(nextFreezeCount - state.user.streakFreezes, 'freeze', 'Streak Freeze')
        if (multiplierReward > 1) get().addXpPopup(multiplierReward, 'multiplier', '24h XP Multiplier')
        return rewards
      },

      canClaimChest: () => {
        const state = get()
        if (!state.user) return false
        return state.user.lastChestClaim !== getToday()
      },

      purchaseItem: (itemId, price) => {
        const state = get()
        if (!state.user) return false
        if (state.user.purchasedItems.includes(itemId)) return true
        if (state.user.feathers < price) return false

        set({
          user: {
            ...state.user,
            feathers: state.user.feathers - price,
            purchasedItems: [...state.user.purchasedItems, itemId],
          },
        })
        return true
      },

      claimReferralReward: (count = 1) => {
        const state = get()
        if (!state.user || count <= 0) return null
        const xpGain = REFERRAL_XP_REWARD * count
        const featherGain = REFERRAL_FEATHER_REWARD * count
        const nextReferralCount = state.user.referralCount + count
        const nextXp = state.user.xp + xpGain
        const nextLevel = getLevel(nextXp)
        const nextFeathers = state.user.feathers + featherGain
        const courseId = normalizeCourseId(state.user.selectedCourse ?? state.user.learningPath)
        const activeProgress = getProgressForCourse(state.user, courseId)
        const achievementRewards = claimableAchievementRewards({
          ...state.user,
          referralCount: nextReferralCount,
          xp: nextXp,
          feathers: nextFeathers,
          userLevel: nextLevel,
        }, courseId)
        const finalXp = nextXp + achievementRewards.xp
        const finalLevel = getLevel(finalXp)
        const finalFeathers = nextFeathers + achievementRewards.feathers
        const nextCourseProgress = {
          ...state.user.courseProgress,
          [courseId]: {
            ...activeProgress,
            achievements: [...activeProgress.achievements, ...achievementRewards.unlockedIds],
          },
        }

        set({
          user: {
            ...state.user,
            referralCount: nextReferralCount,
            xp: finalXp,
            feathers: finalFeathers,
            userLevel: finalLevel,
            achievements: nextCourseProgress[courseId]?.achievements ?? state.user.achievements,
            courseProgress: nextCourseProgress,
          },
          showLevelUpModal: finalLevel > state.user.userLevel,
          newLevel: finalLevel,
          achievementPopups: [
            ...state.achievementPopups,
            ...buildAchievementPopups(achievementRewards.unlockedIds),
          ],
        })
        get().addXpPopup(xpGain + achievementRewards.xp, 'xp')
        get().addXpPopup(featherGain + achievementRewards.feathers, 'feathers')
        return {
          xp: xpGain + achievementRewards.xp,
          feathers: featherGain + achievementRewards.feathers,
        }
      },

      claimReferralMilestone: (friends, xp, feathers) => {
        const state = get()
        if (!state.user) return false
        const claimed = state.user.claimedReferralMilestones ?? []
        if (state.user.referralCount < friends || claimed.includes(friends)) return false

        const nextXp = state.user.xp + xp
        const nextLevel = getLevel(nextXp)
        set({
          user: {
            ...state.user,
            xp: nextXp,
            feathers: state.user.feathers + feathers,
            userLevel: nextLevel,
            claimedReferralMilestones: [...claimed, friends],
          },
          showLevelUpModal: nextLevel > state.user.userLevel,
          newLevel: nextLevel,
        })
        get().addXpPopup(xp, 'xp')
        get().addXpPopup(feathers, 'feathers')
        return true
      },

      grantManualPlus: (days) => {
        const state = get()
        if (!state.user || !TESTER_PLUS_DAYS.includes(days)) return
        const baseTime = isPlusActive(state.user)
          ? new Date(state.user.plusExpiresAt!).getTime()
          : Date.now()
        const plusExpiresAt = new Date(baseTime + days * 24 * 60 * 60 * 1000).toISOString()
        set({
          user: {
            ...state.user,
            plan: 'plus',
            plusExpiresAt,
            plusSource: 'manual',
            plusUpdatedAt: new Date().toISOString(),
          },
        })
        get().addXpPopup(1, 'streak_saved', `Plus unlocked for ${days} days`)
      },

      incrementPlusChatUsage: () => {
        const state = get()
        if (!state.user) return false
        if (isPlusActive(state.user)) return true

        const usage = getPlusChatUsage(state.user)
        if (usage.count >= 3) return false

        set({
          user: {
            ...state.user,
            plusChatUsage: {
              date: usage.date,
              count: usage.count + 1,
            },
          },
        })
        return true
      },

      toggleSound: () => set((state) => ({ isSoundEnabled: !state.isSoundEnabled })),

      resetExercise: () => set({
        currentExerciseIndex: 0,
        exerciseAnswers: { correct: 0, incorrect: 0, missedWordIds: [] },
      }),

      clearCompletionReward: () => set({ lastCompletionReward: null }),

      addXpPopup: (amount, type, label) =>
        set((state) => ({
          xpPopups: [
            ...state.xpPopups,
            {
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              amount,
              type,
              label,
              timestamp: Date.now(),
            },
          ],
        })),

      removeXpPopup: (id) =>
        set((state) => ({
          xpPopups: state.xpPopups.filter((popup) => popup.id !== id),
        })),

      removeAchievementPopup: (id) =>
        set((state) => ({
          achievementPopups: state.achievementPopups.filter((popup) => popup.id !== id),
        })),

      closeStreakSavedModal: () => set({ showStreakSavedModal: false }),

      closeLevelUpModal: () => set({ showLevelUpModal: false }),
    }),
    {
      name: 'tilio-storage',
      partialize: (state) => ({
        user: state.user,
        authProfile: state.authProfile,
        dailyChallenges: state.dailyChallenges,
        isSoundEnabled: state.isSoundEnabled,
        cloudSession: state.cloudSession,
        syncStatus: state.syncStatus,
        syncError: state.syncError,
      }),
    }
  )
)
