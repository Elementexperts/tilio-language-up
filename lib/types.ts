// User types
export interface User {
  id: string
  username: string
  firstName: string
  lastName?: string
  photoUrl?: string
  avatarStyle?: 'boy' | 'girl'
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
  xpMultiplier?: number
  xpMultiplierExpiresAt?: string | null
  wordReviews?: Record<string, WordReview>
  cloudUserId?: string
  telegramId?: string
  lastSyncedAt?: string | null
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

export interface WordReview {
  wordId: string
  correctCount: number
  incorrectCount: number
  intervalDays: number
  nextReviewAt: string
  lastReviewedAt: string
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
  isReview?: boolean
  skillFocus?: 'reading' | 'writing' | 'listening' | 'speaking' | 'grammar' | 'mixed'
}

// Exercise types
export type ExerciseType = 
  | 'vocabulary'
  | 'matching'
  | 'sentence-building'
  | 'listening'
  | 'translation'
  | 'pronunciation'
  | 'grammar'

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
  type: 'xp' | 'feathers' | 'streak_freeze' | 'bonus_multiplier'
  amount: number
  label: string
}

// Store Item types
export interface StoreItem {
  id: string
  name: string
  description: string
  type: 'theme' | 'wallpaper' | 'frame' | 'outfit' | 'color' | 'lesson_pack'
  price: number
  icon: string
  preview?: string
}

// Navigation types
export type AppScreen = 
  | 'splash'
  | 'onboarding'
  | 'account'
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
  type: 'xp' | 'feathers' | 'freeze' | 'multiplier' | 'streak_saved'
  label?: string
  timestamp: number
}

export interface AchievementPopup {
  id: string
  title: string
  description: string
  icon: string
  timestamp: number
}

export type SyncStatus = 'idle' | 'loading' | 'saving' | 'synced' | 'offline' | 'error'

export interface CloudAuthSession {
  accessToken: string
  refreshToken?: string
  expiresAt?: number
  userId: string
}

export interface CloudProgressSnapshot {
  user: User
  dailyChallenges: DailyChallenge[]
  currentLessonId: string | null
  currentExerciseIndex: number
  exerciseAnswers: { correct: number; incorrect: number; missedWordIds?: string[] }
  updatedAt: string
}

// Store types
export interface AppState {
  user: User | null
  currentScreen: AppScreen
  currentLesson: Lesson | null
  currentExerciseIndex: number
  exerciseAnswers: { correct: number; incorrect: number; missedWordIds: string[] }
  dailyChallenges: DailyChallenge[]
  isLoading: boolean
  isSoundEnabled: boolean
  syncStatus: SyncStatus
  syncError: string | null
  cloudSession: CloudAuthSession | null
  xpPopups: XpPopup[]
  achievementPopups: AchievementPopup[]
  showStreakSavedModal: boolean
  showLevelUpModal: boolean
  newLevel: number
  
  // Actions
  setUser: (user: User | null) => void
  updateUser: (updates: Partial<User>) => void
  hydrateCloudProgress: (snapshot: CloudProgressSnapshot) => void
  setCloudSession: (session: CloudAuthSession | null) => void
  setSyncStatus: (status: SyncStatus, error?: string | null) => void
  setScreen: (screen: AppScreen) => void
  startLesson: (lesson: Lesson) => void
  completeExercise: (correct: boolean, wordId?: string, trackMiss?: boolean) => void
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
  addXpPopup: (amount: number, type: XpPopup['type'], label?: string) => void
  removeXpPopup: (id: string) => void
  removeAchievementPopup: (id: string) => void
  closeStreakSavedModal: () => void
  closeLevelUpModal: () => void
}
