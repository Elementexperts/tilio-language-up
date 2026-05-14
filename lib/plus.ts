import { getLessonsForCourse } from '@/lib/data/lessons'
import type { CourseId, Lesson, User, Word, WordReview } from '@/lib/types'

export interface ReviewWordInsight {
  word: Word
  review: WordReview
  accuracy: number
  weakness: number
  priority: number
  state: 'due' | 'weak' | 'almost-mastered' | 'mastered' | 'learning'
  reason: string
  lessonTitle?: string
}

export interface SmartReviewSummary {
  allInsights: ReviewWordInsight[]
  dueWords: ReviewWordInsight[]
  weakWords: ReviewWordInsight[]
  recentlyMissed: ReviewWordInsight[]
  almostMastered: ReviewWordInsight[]
  reviewQueue: ReviewWordInsight[]
  estimatedMinutes: number
  recommendation: string
  nextReviewLabel: string
  readiness: 'ready' | 'building' | 'empty'
  learnedWordCount: number
  trackedWordCount: number
}

const DAY_MS = 24 * 60 * 60 * 1000

export function hasTilioPlus(user: User | null | undefined) {
  return Boolean(user?.purchasedItems?.includes('tilio-plus-preview'))
}

export function buildSmartReviewSummary(user: User | null | undefined): SmartReviewSummary {
  const today = getToday()
  const empty: SmartReviewSummary = {
    allInsights: [],
    dueWords: [],
    weakWords: [],
    recentlyMissed: [],
    almostMastered: [],
    reviewQueue: [],
    estimatedMinutes: 2,
    recommendation: 'Bugun bitta darsni tugating, keyin Tilio Plus siz uchun aqlli takrorlash navbatini tayyorlaydi.',
    nextReviewLabel: 'Complete first lesson',
    readiness: 'empty',
    learnedWordCount: 0,
    trackedWordCount: 0,
  }

  if (!user) return empty

  const courseId = user.selectedCourse ?? user.learningPath
  const courseLessons = getLessonsForCourse(courseId)
  const wordMeta = getCourseWordMeta(courseId)
  const completedLessons = new Set(user.courseProgress?.[courseId]?.completedLessons ?? user.completedLessons ?? [])
  const learnedWords = uniqueWords(
    courseLessons
      .filter((lesson) => completedLessons.has(lesson.id))
      .flatMap((lesson) => lesson.words)
  )
  const learnedWordIds = new Set(learnedWords.map((word) => word.id))
  const reviewEntries = Object.values(user.wordReviews ?? {}).filter((review) => wordMeta.has(review.wordId))

  const trackedInsights = reviewEntries
    .map((review) => {
      const meta = wordMeta.get(review.wordId)
      if (!meta) return null
      return createInsight(meta.word, review, meta.lessonTitle)
    })
    .filter((item): item is ReviewWordInsight => Boolean(item))

  const trackedWordIds = new Set(trackedInsights.map((item) => item.word.id))
  const learnedFallbackInsights = learnedWords
    .filter((word) => !trackedWordIds.has(word.id))
    .map((word) => {
      const meta = wordMeta.get(word.id)
      return createInsight(word, createStarterReview(word.id, today), meta?.lessonTitle)
    })

  const allInsights = uniqueInsights([...trackedInsights, ...learnedFallbackInsights]).sort((a, b) => b.priority - a.priority)

  const dueWords = allInsights
    .filter((item) => item.review.nextReviewAt <= today)
    .sort((a, b) => b.priority - a.priority || a.review.nextReviewAt.localeCompare(b.review.nextReviewAt))

  const weakWords = trackedInsights
    .filter((item) => item.review.incorrectCount > 0)
    .sort((a, b) => b.weakness - a.weakness || b.review.incorrectCount - a.review.incorrectCount || b.priority - a.priority)

  const recentlyMissed = trackedInsights
    .filter((item) => item.review.incorrectCount > 0)
    .sort((a, b) => b.review.lastReviewedAt.localeCompare(a.review.lastReviewedAt))

  const almostMastered = allInsights
    .filter((item) => item.state === 'almost-mastered')
    .sort((a, b) => b.review.correctCount - a.review.correctCount || b.priority - a.priority)

  const reviewQueue = uniqueInsights([...dueWords, ...weakWords, ...recentlyMissed, ...allInsights]).slice(0, 10)
  const estimatedMinutes = Math.max(2, Math.ceil(reviewQueue.length * 0.75))
  const readiness: SmartReviewSummary['readiness'] = reviewQueue.length > 0
    ? 'ready'
    : learnedWordIds.size > 0 || trackedInsights.length > 0
      ? 'building'
      : 'empty'

  return {
    allInsights,
    dueWords,
    weakWords,
    recentlyMissed,
    almostMastered,
    reviewQueue,
    estimatedMinutes,
    recommendation: getRecommendation({ dueWords, weakWords, recentlyMissed, reviewQueue, readiness }),
    nextReviewLabel: getNextReviewLabel(allInsights, today),
    readiness,
    learnedWordCount: learnedWordIds.size,
    trackedWordCount: trackedInsights.length,
  }
}

export function createSmartReviewLesson(user: User, summary: SmartReviewSummary): Lesson | null {
  const courseId = user.selectedCourse ?? user.learningPath
  const queueWords = uniqueWords(summary.reviewQueue.map((item) => item.word))
  if (queueWords.length === 0) return null

  return {
    id: `plus-smart-review-${courseId}-${getToday()}`,
    courseId,
    title: 'Smart Review',
    titleUz: 'Aqlli takrorlash',
    description: 'Personalized review from weak and due words.',
    descriptionUz: 'Xatolar va takrorlash vaqti kelgan sozlardan tuzilgan mashq.',
    category: 'plus-review',
    level: user.level,
    words: queueWords,
    xpReward: Math.min(36, Math.max(16, queueWords.length * 4)),
    featherReward: Math.min(12, Math.max(5, Math.ceil(queueWords.length / 2))),
    order: 999,
    isLocked: false,
    isReview: true,
    isPracticeSession: true,
    skillFocus: 'mixed',
  }
}

export function getWeeklyInsightStats(user: User | null | undefined, summary: SmartReviewSummary) {
  const selectedCourse = user?.selectedCourse ?? user?.learningPath ?? 'uz-en'
  const completedLessons = user?.courseProgress?.[selectedCourse]?.completedLessons ?? user?.completedLessons ?? []

  return [
    { label: 'Lessons', value: completedLessons.length, helper: 'completed' },
    { label: 'XP', value: user?.xp ?? 0, helper: 'total earned' },
    { label: 'Streak', value: user?.streak ?? 0, helper: 'active days' },
    { label: 'Review', value: summary.reviewQueue.length, helper: 'ready words' },
  ]
}

function createInsight(word: Word, review: WordReview, lessonTitle?: string): ReviewWordInsight {
  const total = review.correctCount + review.incorrectCount
  const accuracy = total > 0 ? review.correctCount / total : 0
  const weakness = total > 0 ? review.incorrectCount / total : 0
  const today = getToday()
  const daysOverdue = Math.max(0, Math.floor((dateValue(today) - dateValue(review.nextReviewAt)) / DAY_MS))
  const isDue = review.nextReviewAt <= today
  const state: ReviewWordInsight['state'] = isDue
    ? 'due'
    : review.incorrectCount >= 2 || weakness >= 0.4
      ? 'weak'
      : review.correctCount >= 4 && review.intervalDays >= 14
        ? 'mastered'
        : review.correctCount >= 3 && review.intervalDays >= 7
          ? 'almost-mastered'
          : 'learning'
  const priority = getPriority(review, state, daysOverdue, weakness)

  return {
    word,
    review,
    accuracy,
    weakness,
    priority,
    state,
    reason: getReason(state, review, daysOverdue),
    lessonTitle,
  }
}

function createStarterReview(wordId: string, today: string): WordReview {
  return {
    wordId,
    correctCount: 1,
    incorrectCount: 0,
    intervalDays: 0,
    nextReviewAt: today,
    lastReviewedAt: today,
  }
}

function getPriority(review: WordReview, state: ReviewWordInsight['state'], daysOverdue: number, weakness: number) {
  if (state === 'due') return 80 + daysOverdue * 4 + review.incorrectCount * 8 + Math.round(weakness * 20)
  if (state === 'weak') return 65 + review.incorrectCount * 8 + Math.round(weakness * 20)
  if (state === 'almost-mastered') return 45 + review.correctCount
  if (state === 'mastered') return 25
  return 35 + review.correctCount
}

function getReason(state: ReviewWordInsight['state'], review: WordReview, daysOverdue: number) {
  if (state === 'due' && daysOverdue > 0) return `${daysOverdue} day overdue`
  if (state === 'due') return 'Due today'
  if (state === 'weak') return `${review.incorrectCount} missed`
  if (state === 'almost-mastered') return 'Almost mastered'
  if (state === 'mastered') return 'Mastered'
  return 'Learning'
}

function getNextReviewLabel(items: ReviewWordInsight[], today: string) {
  if (items.some((item) => item.review.nextReviewAt <= today)) return 'Ready now'
  const next = items
    .map((item) => item.review.nextReviewAt)
    .sort()[0]
  if (!next) return 'Complete first lesson'

  const diffDays = Math.ceil((dateValue(next) - dateValue(today)) / DAY_MS)
  if (diffDays <= 1) return 'Best reviewed tomorrow'
  return `Review again in ${diffDays} days`
}

function getCourseWordMeta(courseId: CourseId) {
  const map = new Map<string, { word: Word; lessonTitle: string }>()
  for (const lesson of getLessonsForCourse(courseId)) {
    for (const word of lesson.words) {
      if (!map.has(word.id)) map.set(word.id, { word, lessonTitle: lesson.title })
    }
  }
  return map
}

function uniqueWords(words: Word[]) {
  const seen = new Set<string>()
  return words.filter((word) => {
    if (seen.has(word.id)) return false
    seen.add(word.id)
    return true
  })
}

function uniqueInsights(items: ReviewWordInsight[]) {
  const seen = new Set<string>()
  return items.filter((item) => {
    if (seen.has(item.word.id)) return false
    seen.add(item.word.id)
    return true
  })
}

function dateValue(value: string) {
  return new Date(`${value}T00:00:00`).getTime()
}

function getToday() {
  return new Date().toISOString().split('T')[0]
}

function getRecommendation(summary: Pick<SmartReviewSummary, 'dueWords' | 'weakWords' | 'recentlyMissed' | 'reviewQueue' | 'readiness'>) {
  if (summary.readiness === 'empty') {
    return 'Birinchi darsni tugating. Shundan keyin Tilio Plus siz uchun shaxsiy takrorlash rejasini ochadi.'
  }
  if (summary.reviewQueue.length === 0) {
    return 'Yaxshi ritm. Yangi darsdan keyin review navbati avtomatik boyiydi.'
  }
  if (summary.dueWords.length >= 5) {
    return 'Bugun aqlli takrorlashni boshlang. Xotira uchun eng muhim sozlar navbatda turibdi.'
  }
  if (summary.weakWords.length >= 3) {
    return 'Mistake Practice sizga eng kop adashgan sozlarni tezroq mustahkamlashga yordam beradi.'
  }
  if (summary.recentlyMissed.length > 0) {
    return 'Yaqinda xato qilingan sozlarni qisqa mashq bilan qaytaring. Bu streakdan ham kuchli odat.'
  }
  return 'Ajoyib ritm. Bugun Mixed Practice orqali tezlik, tinglash va tarjimani birga mashq qiling.'
}
