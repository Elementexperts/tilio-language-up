import { getLessonsForCourse } from '@/lib/data/lessons'
import type { CourseId, Lesson, User, Word, WordReview } from '@/lib/types'

export interface ReviewWordInsight {
  word: Word
  review: WordReview
  accuracy: number
  weakness: number
  state: 'due' | 'weak' | 'almost-mastered' | 'mastered' | 'learning'
}

export interface SmartReviewSummary {
  dueWords: ReviewWordInsight[]
  weakWords: ReviewWordInsight[]
  recentlyMissed: ReviewWordInsight[]
  almostMastered: ReviewWordInsight[]
  reviewQueue: ReviewWordInsight[]
  estimatedMinutes: number
  recommendation: string
}

export function hasTilioPlus(user: User | null | undefined) {
  return Boolean(user?.purchasedItems?.includes('tilio-plus-preview'))
}

export function buildSmartReviewSummary(user: User | null | undefined): SmartReviewSummary {
  const empty: SmartReviewSummary = {
    dueWords: [],
    weakWords: [],
    recentlyMissed: [],
    almostMastered: [],
    reviewQueue: [],
    estimatedMinutes: 2,
    recommendation: 'Bugun bitta darsni tugating, keyin Tilio Plus siz uchun aqlli takrorlash navbatini tayyorlaydi.',
  }

  if (!user) return empty

  const courseId = user.selectedCourse ?? user.learningPath
  const wordMap = getCourseWordMap(courseId)
  const now = Date.now()
  const insights = Object.values(user.wordReviews ?? {})
    .map((review) => {
      const word = wordMap.get(review.wordId)
      if (!word) return null
      const total = review.correctCount + review.incorrectCount
      const accuracy = total > 0 ? review.correctCount / total : 0
      const weakness = total > 0 ? review.incorrectCount / total : 0
      const due = new Date(review.nextReviewAt).getTime() <= now
      const state: ReviewWordInsight['state'] = due
        ? 'due'
        : review.incorrectCount >= 2 || weakness >= 0.4
          ? 'weak'
          : review.correctCount >= 4 && review.intervalDays >= 14
            ? 'mastered'
            : review.correctCount >= 3 && review.intervalDays >= 7
              ? 'almost-mastered'
              : 'learning'

      return { word, review, accuracy, weakness, state }
    })
    .filter(Boolean) as ReviewWordInsight[]

  const dueWords = insights
    .filter((item) => item.state === 'due')
    .sort((a, b) => new Date(a.review.nextReviewAt).getTime() - new Date(b.review.nextReviewAt).getTime())

  const weakWords = insights
    .filter((item) => item.review.incorrectCount > 0)
    .sort((a, b) => b.weakness - a.weakness || b.review.incorrectCount - a.review.incorrectCount)

  const recentlyMissed = insights
    .filter((item) => item.review.incorrectCount > 0)
    .sort((a, b) => new Date(b.review.lastReviewedAt).getTime() - new Date(a.review.lastReviewedAt).getTime())

  const almostMastered = insights
    .filter((item) => item.state === 'almost-mastered')
    .sort((a, b) => b.review.correctCount - a.review.correctCount)

  const reviewQueue = uniqueByWord([...dueWords, ...weakWords, ...recentlyMissed]).slice(0, 10)
  const estimatedMinutes = Math.max(2, Math.ceil(reviewQueue.length * 0.7))

  return {
    dueWords,
    weakWords,
    recentlyMissed,
    almostMastered,
    reviewQueue,
    estimatedMinutes,
    recommendation: getRecommendation({ dueWords, weakWords, recentlyMissed, reviewQueue }),
  }
}

export function createSmartReviewLesson(user: User, summary: SmartReviewSummary): Lesson | null {
  const courseId = user.selectedCourse ?? user.learningPath
  const queueWords = summary.reviewQueue.map((item) => item.word).slice(0, 10)
  if (queueWords.length === 0) return null

  return {
    id: `plus-smart-review-${courseId}`,
    courseId,
    title: 'Smart Review',
    titleUz: 'Aqlli takrorlash',
    description: 'Personalized review from weak and due words.',
    descriptionUz: 'Xatolar va takrorlash vaqti kelgan sozlardan tuzilgan mashq.',
    category: 'plus-review',
    level: user.level,
    words: queueWords,
    xpReward: 24,
    featherReward: 8,
    order: 999,
    isLocked: false,
    isReview: true,
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

function getCourseWordMap(courseId: CourseId) {
  const map = new Map<string, Word>()
  for (const lesson of getLessonsForCourse(courseId)) {
    for (const word of lesson.words) {
      if (!map.has(word.id)) map.set(word.id, word)
    }
  }
  return map
}

function uniqueByWord(items: ReviewWordInsight[]) {
  const seen = new Set<string>()
  return items.filter((item) => {
    if (seen.has(item.word.id)) return false
    seen.add(item.word.id)
    return true
  })
}

function getRecommendation(summary: Pick<SmartReviewSummary, 'dueWords' | 'weakWords' | 'recentlyMissed' | 'reviewQueue'>) {
  if (summary.reviewQueue.length === 0) {
    return 'Bugun yangi dars boshlang. Bir necha javobdan keyin Tilio Plus sizga shaxsiy mashq yonalishini beradi.'
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
