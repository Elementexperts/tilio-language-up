import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { achievementsData } from './data/lessons'
import {
  getLevel,
  type AppState,
  type DailyChallenge,
  type ChestReward,
  type User,
  type AchievementPopup,
} from './types'

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

const getYesterday = () => {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return yesterday.toISOString().split('T')[0]
}

const claimableAchievementRewards = (user: User) => {
  const unlocked = achievementsData.filter((achievement) => {
    if (user.achievements.includes(achievement.id)) return false
    switch (achievement.requirement.type) {
      case 'xp':
        return user.xp >= achievement.requirement.value
      case 'streak':
        return user.streak >= achievement.requirement.value
      case 'lessons':
        return user.completedLessons.length >= achievement.requirement.value
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
      currentScreen: 'splash',
      currentLesson: null,
      currentExerciseIndex: 0,
      exerciseAnswers: { correct: 0, incorrect: 0 },
      dailyChallenges: [],
      isLoading: false,
      isSoundEnabled: true,
      xpPopups: [],
      achievementPopups: [],
      showStreakSavedModal: false,
      showLevelUpModal: false,
      newLevel: 1,

      setUser: (user) =>
        set({
          user: user
            ? {
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
              }
            : null,
        }),
      
      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null,
      })),

      setScreen: (screen) => set({ currentScreen: screen }),

      startLesson: (lesson) => set({
        currentLesson: lesson,
        currentExerciseIndex: 0,
        exerciseAnswers: { correct: 0, incorrect: 0 },
        currentScreen: 'exercise',
      }),

      completeExercise: (correct, wordId) => set((state) => {
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
        const multiplier = getActiveXpMultiplier(user)
        const xpEarned = Math.round(state.currentLesson.xpReward * multiplier)
        const featherEarned = state.currentLesson.featherReward ?? 5
        const newCompletedLessons = user.completedLessons.includes(lessonId)
          ? user.completedLessons
          : [...user.completedLessons, lessonId]

        // Update daily challenges
        const today = getToday()
        let challenges = state.dailyChallenges
        if (challenges.length === 0 || challenges[0].date !== today) {
          challenges = generateDailyChallenges()
        }
        
        challenges = challenges.map((challenge) => {
          if (challenge.completed) return challenge
          
          if (challenge.type === 'lessons') {
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
        })
        const finalXp = baseXp + achievementRewards.xp
        const finalFeathers = baseFeathers + achievementRewards.feathers
        const finalLevel = getLevel(finalXp)

        set({
          user: {
            ...user,
            xp: finalXp,
            feathers: finalFeathers,
            userLevel: finalLevel,
            achievements: [...user.achievements, ...achievementRewards.unlockedIds],
            completedLessons: newCompletedLessons,
            lastActiveDate: today,
            xpMultiplier: multiplier,
            xpMultiplierExpiresAt: multiplier > 1 ? user.xpMultiplierExpiresAt : null,
          },
          dailyChallenges: challenges,
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
        const achievementRewards = claimableAchievementRewards({
          ...state.user,
          streak: newStreak,
          maxStreak,
          xp: boostedXp,
          feathers: boostedFeathers,
          userLevel: leveled,
        })
        const finalXp = boostedXp + achievementRewards.xp
        const finalFeathers = boostedFeathers + achievementRewards.feathers
        const finalLevel = getLevel(finalXp)

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
            achievements: [...state.user.achievements, ...achievementRewards.unlockedIds],
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
        const achievementRewards = claimableAchievementRewards({
          ...state.user,
          referralCount: nextReferralCount,
          xp: nextXp,
          feathers: nextFeathers,
          userLevel: nextLevel,
        })
        const finalXp = nextXp + achievementRewards.xp
        const finalLevel = getLevel(finalXp)
        const finalFeathers = nextFeathers + achievementRewards.feathers

        set({
          user: {
            ...state.user,
            referralCount: nextReferralCount,
            xp: finalXp,
            feathers: finalFeathers,
            userLevel: finalLevel,
            achievements: [...state.user.achievements, ...achievementRewards.unlockedIds],
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

      toggleSound: () => set((state) => ({ isSoundEnabled: !state.isSoundEnabled })),

      resetExercise: () => set({
        currentExerciseIndex: 0,
        exerciseAnswers: { correct: 0, incorrect: 0 },
      }),

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
        dailyChallenges: state.dailyChallenges,
        isSoundEnabled: state.isSoundEnabled,
      }),
    }
  )
)
