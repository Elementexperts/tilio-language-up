// User types
export interface User {
  id: string
  username: string
  firstName: string
  lastName?: string
  photoUrl?: string
  learningPath: 'uz-en' | 'en-uz'
  level: 'beginner' | 'intermediate'
  dailyGoal: 5 | 10 | 15 | 20
  xp: number
  feathers: number
  streak: number
  maxStreak: number
  streakFreezes: number
  lastActiveDate: string
  completedLessons: string[]
  achievements: string[]
  referralCount: number
  joinedAt: string
  lastChestClaim: string | null
  userLevel: number
  equippedTheme: string
  equippedFrame: string
  purchasedItems: string[]
}

// XP Level calculation
export const XP_PER_LEVEL = 100
export const getLevel = (xp: number) => Math.floor(xp / XP_PER_LEVEL) + 1
export const getXpProgress = (xp: number) => xp % XP_PER_LEVEL
export const getXpToNextLevel = (xp: number) => XP_PER_LEVEL - (xp % XP_PER_LEVEL)

// Lesson types
export interface Word {
  id: string
  uzbek: string
  english: string
  pronunciation?: string
  audioUrl?: string
  example?: {
    uzbek: string
    english: string
  }
  category: string
}

export interface Lesson {
  id: string
  title: string
  titleUz: string
  description: string
  descriptionUz: string
  category: string
  level: 'beginner' | 'intermediate'
  words: Word[]
  xpReward: number
  featherReward?: number
  order: number
  isLocked: boolean
  requiredLessonId?: string
}

// Exercise types
export type ExerciseType = 
  | 'vocabulary'
  | 'matching'
  | 'sentence-building'
  | 'listening'
  | 'translation'

export interface Exercise {
  id: string
  type: ExerciseType
  question: string
  questionUz?: string
  options?: string[]
  correctAnswer: string | string[]
  hint?: string
  audioUrl?: string
  xpReward: number
}

// Progress types
export interface LessonProgress {
  lessonId: string
  completed: boolean
  xpEarned: number
  completedAt?: string
  mistakes: number
}

export interface DailyChallenge {
  id: string
  date: string
  type: 'lessons' | 'xp' | 'streak'
  target: number
  current: number
  xpReward: number
  featherReward: number
  completed: boolean
}

// Achievement types
export interface Achievement {
  id: string
  title: string
  titleUz: string
  description: string
  descriptionUz: string
  icon: string
  requirement: {
    type: 'xp' | 'streak' | 'lessons' | 'referrals' | 'feathers' | 'level'
    value: number
  }
  xpReward: number
  featherReward?: number
}

// Daily Chest types
export interface ChestReward {
  type: 'xp' | 'feathers' | 'streak_freeze'
  amount: number
  label: string
}

// Store Item types
export interface StoreItem {
  id: string
  name: string
  description: string
  type: 'theme' | 'frame' | 'outfit' | 'color' | 'lesson_pack'
  price: number
  icon: string
  preview?: string
}

// Navigation types
export type AppScreen = 
  | 'splash'
  | 'onboarding'
  | 'home'
  | 'lesson'
  | 'exercise'
  | 'result'
  | 'profile'
  | 'achievements'
  | 'daily-challenges'
  | 'referral'
  | 'store'
  | 'daily-chest'

// XP Popup type
export interface XpPopup {
  id: string
  amount: number
  type: 'xp' | 'feathers'
  timestamp: number
}

// Store types
export interface AppState {
  user: User | null
  currentScreen: AppScreen
  currentLesson: Lesson | null
  currentExerciseIndex: number
  exerciseAnswers: { correct: number; incorrect: number }
  dailyChallenges: DailyChallenge[]
  isLoading: boolean
  isSoundEnabled: boolean
  xpPopups: XpPopup[]
  showLevelUpModal: boolean
  newLevel: number
  
  // Actions
  setUser: (user: User | null) => void
  updateUser: (updates: Partial<User>) => void
  setScreen: (screen: AppScreen) => void
  startLesson: (lesson: Lesson) => void
  completeExercise: (correct: boolean) => void
  completeLesson: () => void
  addXp: (amount: number) => void
  addFeathers: (amount: number) => void
  updateStreak: () => void
  useStreakFreeze: () => boolean
  claimDailyChest: () => ChestReward[]
  canClaimChest: () => boolean
  purchaseItem: (itemId: string, price: number) => boolean
  claimReferralReward: (count?: number) => { xp: number; feathers: number } | null
  toggleSound: () => void
  resetExercise: () => void
  addXpPopup: (amount: number, type: 'xp' | 'feathers') => void
  removeXpPopup: (id: string) => void
  closeLevelUpModal: () => void
}
