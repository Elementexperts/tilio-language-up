import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { achievementsData } from './data/lessons'
import {
  getLevel,
  type AppState,
  type DailyChallenge,
  type ChestReward,
  type User,
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

const randomChestRewards = (): ChestReward[] => {
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

  if (Math.random() > 0.6) {
    rewards.push({
      type: 'streak_freeze',
      amount: 1,
      label: 'Streak Freeze',
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
      showLevelUpModal: false,
      newLevel: 1,

      setUser: (user) =>
        set({
          user: user
            ? {
                ...user,
                feathers: user.feathers ?? 0,
                maxStreak: user.maxStreak ?? user.streak ?? 0,
                streakFreezes: user.streakFreezes ?? 0,
                lastChestClaim: user.lastChestClaim ?? null,
                userLevel: user.userLevel ?? getLevel(user.xp ?? 0),
                equippedTheme: user.equippedTheme ?? 'classic-green',
                equippedFrame: user.equippedFrame ?? 'default',
                purchasedItems: user.purchasedItems ?? [],
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

      completeExercise: (correct) => set((state) => ({
        exerciseAnswers: {
          correct: state.exerciseAnswers.correct + (correct ? 1 : 0),
          incorrect: state.exerciseAnswers.incorrect + (correct ? 0 : 1),
        },
        currentExerciseIndex: state.currentExerciseIndex + 1,
      })),

      completeLesson: () => {
        const state = get()
        if (!state.user || !state.currentLesson) return

        const lessonId = state.currentLesson.id
        const xpEarned = state.currentLesson.xpReward
        const featherEarned = state.currentLesson.featherReward ?? 5
        const newCompletedLessons = state.user.completedLessons.includes(lessonId)
          ? state.user.completedLessons
          : [...state.user.completedLessons, lessonId]

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
            const newCurrent = Math.min(state.user.streak, challenge.target)
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
        const baseXp = state.user.xp + xpEarned + challengeBonusXp
        const baseFeathers = state.user.feathers + featherEarned + challengeBonusFeathers
        const leveled = getLevel(baseXp)
        const achievementRewards = claimableAchievementRewards({
          ...state.user,
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
            ...state.user,
            xp: finalXp,
            feathers: finalFeathers,
            userLevel: finalLevel,
            achievements: [...state.user.achievements, ...achievementRewards.unlockedIds],
            completedLessons: newCompletedLessons,
            lastActiveDate: today,
          },
          dailyChallenges: challenges,
          currentScreen: 'result',
          showLevelUpModal: finalLevel > state.user.userLevel,
          newLevel: finalLevel,
        })

        get().addXpPopup(xpEarned + challengeBonusXp + achievementRewards.xp, 'xp')
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
        if (lastActive === yesterdayStr) {
          newStreak += 1
        } else {
          if (currentStreak > 0 && state.user.streakFreezes > 0) {
            remainingFreezes -= 1
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
        })
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
        set({
          user: {
            ...state.user,
            feathers: state.user.feathers - FEATHERS_FOR_STREAK_FREEZE,
            streakFreezes: state.user.streakFreezes + 1,
          },
        })
        return true
      },

      claimDailyChest: () => {
        const state = get()
        if (!state.user) return []
        const today = getToday()
        if (state.user.lastChestClaim === today) return []

        const rewards = randomChestRewards()
        let xpGain = 0
        let featherGain = 0
        let freezeGain = 0

        rewards.forEach((reward) => {
          if (reward.type === 'xp') xpGain += reward.amount
          if (reward.type === 'feathers') featherGain += reward.amount
          if (reward.type === 'streak_freeze') freezeGain += reward.amount
        })

        const nextXp = state.user.xp + xpGain
        const nextLevel = getLevel(nextXp)

        set({
          user: {
            ...state.user,
            xp: nextXp,
            userLevel: nextLevel,
            feathers: state.user.feathers + featherGain,
            streakFreezes: state.user.streakFreezes + freezeGain,
            lastChestClaim: today,
          },
          showLevelUpModal: nextLevel > state.user.userLevel,
          newLevel: nextLevel,
        })
        if (xpGain > 0) get().addXpPopup(xpGain, 'xp')
        if (featherGain > 0) get().addXpPopup(featherGain, 'feathers')
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

      addXpPopup: (amount, type) =>
        set((state) => ({
          xpPopups: [
            ...state.xpPopups,
            {
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              amount,
              type,
              timestamp: Date.now(),
            },
          ],
        })),

      removeXpPopup: (id) =>
        set((state) => ({
          xpPopups: state.xpPopups.filter((popup) => popup.id !== id),
        })),

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
