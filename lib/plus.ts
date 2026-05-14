import { getCourseOption, getLessonsForCourse } from '@/lib/data/lessons'
import type { CourseId, Lesson, PracticeMode, SkillFocus, User, UserActivityDay, Word, WordReview } from '@/lib/types'

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

export interface WeeklyInsightStat {
  label: string
  value: number
  helper: string
  suffix?: string
  tone: 'green' | 'gold' | 'blue' | 'orange'
}

export interface WeeklyTrendDay {
  date: string
  label: string
  active: boolean
  xp: number
  sessions: number
}

export interface WeeklySkillBalance {
  skill: SkillFocus
  label: string
  value: number
  percentage: number
  helper: string
}

export interface WeeklyInsightSummary {
  stats: WeeklyInsightStat[]
  trend: WeeklyTrendDay[]
  skillBalance: WeeklySkillBalance[]
  courseLabel: string
  progressPercent: number
  activeDays: number
  lessonsCompleted: number
  xpEarned: number
  wordsLearned: number
  wordsReviewed: number
  missedWords: number
  practiceSessions: number
  accuracy: number
  strongestSkill: string
  weakestSkill: string
  nextWeekTarget: string
  recommendation: string
  shareText: string
  hasTrackedWeek: boolean
}

export type PlusPracticeMode = PracticeMode

interface PracticeModeConfig {
  title: string
  titleUz: string
  description: string
  descriptionUz: string
  category: string
  skillFocus: Lesson['skillFocus']
  baseXp: number
  xpPerWord: number
  featherBase: number
  maxWords: number
}

const PRACTICE_MODE_CONFIG: Record<PlusPracticeMode, PracticeModeConfig> = {
  'smart-review': {
    title: 'Smart Review',
    titleUz: 'Aqlli takrorlash',
    description: 'Personalized review from weak and due words.',
    descriptionUz: 'Xatolar va takrorlash vaqti kelgan sozlardan tuzilgan mashq.',
    category: 'plus-review',
    skillFocus: 'mixed',
    baseXp: 12,
    xpPerWord: 4,
    featherBase: 5,
    maxWords: 10,
  },
  mistake: {
    title: 'Mistake Practice',
    titleUz: 'Xatolar mashqi',
    description: 'Focused repair session for missed and weak words.',
    descriptionUz: 'Xato qilingan va sust sozlarni mustahkamlash mashqi.',
    category: 'plus-mistakes',
    skillFocus: 'mixed',
    baseXp: 14,
    xpPerWord: 4,
    featherBase: 6,
    maxWords: 10,
  },
  listening: {
    title: 'Listening Practice',
    titleUz: 'Tinglash mashqi',
    description: 'Audio-first sentence recognition workout.',
    descriptionUz: 'Gaplarni eshitib tanish uchun audio mashq.',
    category: 'plus-listening',
    skillFocus: 'listening',
    baseXp: 16,
    xpPerWord: 5,
    featherBase: 6,
    maxWords: 8,
  },
  speaking: {
    title: 'Speaking Practice',
    titleUz: 'Talaffuz mashqi',
    description: 'Microphone practice with simple pronunciation scoring.',
    descriptionUz: 'Mikrofon orqali talaffuzni tekshirish mashqi.',
    category: 'plus-speaking',
    skillFocus: 'speaking',
    baseXp: 16,
    xpPerWord: 5,
    featherBase: 6,
    maxWords: 8,
  },
  mixed: {
    title: 'Mixed Practice',
    titleUz: 'Aralash mashq',
    description: 'A balanced focus workout across listening, translation, grammar, and speaking.',
    descriptionUz: 'Tinglash, tarjima, grammatika va talaffuzni birlashtirgan mashq.',
    category: 'plus-mixed',
    skillFocus: 'mixed',
    baseXp: 18,
    xpPerWord: 4,
    featherBase: 7,
    maxWords: 12,
  },
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
  return createPlusPracticeLesson(user, summary, 'smart-review')
}

export function createPlusPracticeLesson(user: User, summary: SmartReviewSummary, practiceMode: PlusPracticeMode): Lesson | null {
  const courseId = user.selectedCourse ?? user.learningPath
  const config = PRACTICE_MODE_CONFIG[practiceMode]
  const queueWords = uniqueWords(getPlusPracticeQueue(summary, practiceMode).map((item) => item.word)).slice(0, config.maxWords)
  if (queueWords.length === 0) return null

  return {
    id: `plus-${practiceMode}-${courseId}-${getToday()}`,
    courseId,
    title: config.title,
    titleUz: config.titleUz,
    description: config.description,
    descriptionUz: config.descriptionUz,
    category: config.category,
    level: user.level,
    words: queueWords,
    xpReward: Math.min(48, Math.max(config.baseXp, queueWords.length * config.xpPerWord)),
    featherReward: Math.min(14, Math.max(config.featherBase, Math.ceil(queueWords.length / 2))),
    order: 999,
    isLocked: false,
    isReview: true,
    isPracticeSession: true,
    practiceMode,
    skillFocus: config.skillFocus,
  }
}

export function getPlusPracticeQueue(summary: SmartReviewSummary, practiceMode: PlusPracticeMode): ReviewWordInsight[] {
  const sentenceReady = (item: ReviewWordInsight) => hasPracticeSentence(item.word)

  if (practiceMode === 'mistake') {
    return uniqueInsights([
      ...summary.weakWords,
      ...summary.recentlyMissed,
      ...summary.dueWords,
      ...summary.reviewQueue,
      ...summary.allInsights,
    ])
  }

  if (practiceMode === 'listening') {
    const listeningQueue = uniqueInsights([
      ...summary.reviewQueue,
      ...summary.dueWords,
      ...summary.weakWords,
      ...summary.allInsights,
    ]).filter(sentenceReady)
    return listeningQueue.length > 0 ? listeningQueue : summary.reviewQueue
  }

  if (practiceMode === 'speaking') {
    const speakingQueue = uniqueInsights([
      ...summary.weakWords,
      ...summary.reviewQueue,
      ...summary.allInsights,
    ]).filter(sentenceReady)
    return speakingQueue.length > 0 ? speakingQueue : summary.reviewQueue
  }

  if (practiceMode === 'mixed') {
    return uniqueInsights([
      ...summary.dueWords,
      ...summary.weakWords,
      ...summary.almostMastered,
      ...summary.recentlyMissed,
      ...summary.reviewQueue,
      ...summary.allInsights,
    ])
  }

  return summary.reviewQueue
}

export function getPlusPracticeWordCount(summary: SmartReviewSummary, practiceMode: PlusPracticeMode) {
  return Math.min(PRACTICE_MODE_CONFIG[practiceMode].maxWords, getPlusPracticeQueue(summary, practiceMode).length)
}

export function getPlusPracticeTitle(practiceMode: PlusPracticeMode) {
  return PRACTICE_MODE_CONFIG[practiceMode].title
}

export function getPlusPracticeReward(summary: SmartReviewSummary, practiceMode: PlusPracticeMode) {
  const config = PRACTICE_MODE_CONFIG[practiceMode]
  const wordCount = getPlusPracticeWordCount(summary, practiceMode)
  return {
    xp: Math.min(48, Math.max(config.baseXp, wordCount * config.xpPerWord)),
    feathers: Math.min(14, Math.max(config.featherBase, Math.ceil(wordCount / 2))),
  }
}

export function getWeeklyInsightStats(user: User | null | undefined, summary: SmartReviewSummary): WeeklyInsightSummary {
  const selectedCourse = user?.selectedCourse ?? user?.learningPath ?? 'uz-en'
  const course = getCourseOption(selectedCourse)
  const courseLessons = getLessonsForCourse(selectedCourse)
  const completedLessonIds = user?.courseProgress?.[selectedCourse]?.completedLessons ?? user?.completedLessons ?? []
  const completedLessons = courseLessons.filter((lesson) => completedLessonIds.includes(lesson.id))
  const dates = getRecentDates(7)
  const weekDays = dates.map((date) => normalizeActivityDay(date, user?.activityLog?.[date]))
  const hasTrackedWeek = weekDays.some((day) => day.studySessions > 0 || day.xpEarned > 0)
  const totals = sumActivityDays(weekDays)
  const fallbackActiveDays = Math.min(user?.streak ?? 0, 7)
  const activeDays = hasTrackedWeek
    ? weekDays.filter((day) => day.studySessions > 0 || day.xpEarned > 0).length
    : fallbackActiveDays
  const skillSessions = hasTrackedWeek ? totals.skillSessions : getCompletedLessonSkillCounts(completedLessons)
  const progressPercent = courseLessons.length > 0 ? Math.round((completedLessonIds.length / courseLessons.length) * 100) : 0
  const lessonsCompleted = hasTrackedWeek ? totals.lessonsCompleted : completedLessonIds.length
  const xpEarned = hasTrackedWeek ? totals.xpEarned : user?.xp ?? 0
  const wordsLearned = hasTrackedWeek ? totals.newWordsLearned : summary.learnedWordCount
  const wordsReviewed = hasTrackedWeek ? totals.wordsReviewed : summary.reviewQueue.length
  const missedWords = hasTrackedWeek ? totals.missedWords : summary.recentlyMissed.length
  const practiceSessions = totals.practiceSessions
  const accuracy = getWeeklyAccuracy(totals.correctAnswers, totals.incorrectAnswers, summary)
  const strongestSkill = getStrongestSkill(skillSessions)
  const weakestSkill = getWeakestSkill(skillSessions, summary)
  const recommendation = getWeeklyRecommendation({
    activeDays,
    hasTrackedWeek,
    lessonsCompleted,
    missedWords,
    practiceSessions,
    skillSessions,
    summary,
  })
  const nextWeekTarget = getNextWeekTarget({ activeDays, lessonsCompleted, xpEarned, summary })
  const trend = buildWeeklyTrend(weekDays, hasTrackedWeek ? activeDays : fallbackActiveDays)

  return {
    stats: [
      { label: 'XP', value: xpEarned, helper: hasTrackedWeek ? 'this week' : 'total earned', tone: 'gold' },
      { label: 'Lessons', value: lessonsCompleted, helper: hasTrackedWeek ? 'this week' : 'completed total', tone: 'green' },
      { label: 'Active', value: activeDays, helper: 'days this week', tone: 'blue' },
      { label: 'Accuracy', value: accuracy, suffix: '%', helper: accuracy > 0 ? 'answer rate' : 'starts after practice', tone: 'orange' },
    ],
    trend,
    skillBalance: buildSkillBalance(skillSessions),
    courseLabel: course.title,
    progressPercent,
    activeDays,
    lessonsCompleted,
    xpEarned,
    wordsLearned,
    wordsReviewed,
    missedWords,
    practiceSessions,
    accuracy,
    strongestSkill,
    weakestSkill,
    nextWeekTarget,
    recommendation,
    shareText: 'Tilio weekly progress: ' + xpEarned + ' XP, ' + lessonsCompleted + ' lessons, ' + activeDays + '/7 active days, ' + wordsLearned + ' new words. Next: ' + nextWeekTarget,
    hasTrackedWeek,
  }
}

const WEEKLY_SKILLS: SkillFocus[] = ['listening', 'speaking', 'reading', 'grammar', 'writing', 'mixed']

const SKILL_LABELS: Record<SkillFocus, string> = {
  reading: 'Reading',
  writing: 'Writing',
  listening: 'Listening',
  speaking: 'Speaking',
  grammar: 'Grammar',
  mixed: 'Mixed',
}

function getRecentDates(days: number) {
  const dates: string[] = []
  const today = new Date()
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(today)
    date.setDate(today.getDate() - offset)
    dates.push(date.toISOString().split('T')[0])
  }
  return dates
}

function normalizeActivityDay(date: string, day?: UserActivityDay): UserActivityDay {
  return {
    date,
    xpEarned: day?.xpEarned ?? 0,
    feathersEarned: day?.feathersEarned ?? 0,
    lessonsCompleted: day?.lessonsCompleted ?? 0,
    practiceSessions: day?.practiceSessions ?? 0,
    studySessions: day?.studySessions ?? 0,
    newWordsLearned: day?.newWordsLearned ?? 0,
    wordsReviewed: day?.wordsReviewed ?? 0,
    correctAnswers: day?.correctAnswers ?? 0,
    incorrectAnswers: day?.incorrectAnswers ?? 0,
    missedWords: day?.missedWords ?? 0,
    courseSessions: day?.courseSessions ?? {},
    skillSessions: day?.skillSessions ?? {},
  }
}

function sumActivityDays(days: UserActivityDay[]) {
  const skillSessions: Partial<Record<SkillFocus, number>> = {}
  const totals = days.reduce(
    (sum, day) => {
      for (const skill of WEEKLY_SKILLS) {
        const value = day.skillSessions[skill] ?? 0
        if (value > 0) skillSessions[skill] = (skillSessions[skill] ?? 0) + value
      }
      return {
        xpEarned: sum.xpEarned + day.xpEarned,
        feathersEarned: sum.feathersEarned + day.feathersEarned,
        lessonsCompleted: sum.lessonsCompleted + day.lessonsCompleted,
        practiceSessions: sum.practiceSessions + day.practiceSessions,
        studySessions: sum.studySessions + day.studySessions,
        newWordsLearned: sum.newWordsLearned + day.newWordsLearned,
        wordsReviewed: sum.wordsReviewed + day.wordsReviewed,
        correctAnswers: sum.correctAnswers + day.correctAnswers,
        incorrectAnswers: sum.incorrectAnswers + day.incorrectAnswers,
        missedWords: sum.missedWords + day.missedWords,
      }
    },
    {
      xpEarned: 0,
      feathersEarned: 0,
      lessonsCompleted: 0,
      practiceSessions: 0,
      studySessions: 0,
      newWordsLearned: 0,
      wordsReviewed: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      missedWords: 0,
    },
  )

  return { ...totals, skillSessions }
}

function getCompletedLessonSkillCounts(lessons: Lesson[]) {
  const counts: Partial<Record<SkillFocus, number>> = {}
  for (const lesson of lessons) {
    const skill = lesson.skillFocus ?? 'mixed'
    counts[skill] = (counts[skill] ?? 0) + 1
  }
  return counts
}

function getWeeklyAccuracy(correctAnswers: number, incorrectAnswers: number, summary: SmartReviewSummary) {
  const total = correctAnswers + incorrectAnswers
  if (total > 0) return Math.round((correctAnswers / total) * 100)

  const reviewTotals = summary.allInsights.reduce(
    (sum, item) => ({
      correct: sum.correct + item.review.correctCount,
      incorrect: sum.incorrect + item.review.incorrectCount,
    }),
    { correct: 0, incorrect: 0 },
  )
  const reviewTotal = reviewTotals.correct + reviewTotals.incorrect
  return reviewTotal > 0 ? Math.round((reviewTotals.correct / reviewTotal) * 100) : 0
}

function buildWeeklyTrend(days: UserActivityDay[], fallbackActiveDays: number): WeeklyTrendDay[] {
  const maxXp = Math.max(1, ...days.map((day) => day.xpEarned))
  const fallbackStart = Math.max(0, days.length - fallbackActiveDays)

  return days.map((day, index) => ({
    date: day.date,
    label: getWeekdayLabel(day.date),
    active: day.studySessions > 0 || day.xpEarned > 0 || (fallbackActiveDays > 0 && index >= fallbackStart),
    xp: maxXp > 1 ? Math.round((day.xpEarned / maxXp) * 100) : 0,
    sessions: day.studySessions,
  }))
}

function buildSkillBalance(skillSessions: Partial<Record<SkillFocus, number>>): WeeklySkillBalance[] {
  const maxValue = Math.max(1, ...WEEKLY_SKILLS.map((skill) => skillSessions[skill] ?? 0))
  return WEEKLY_SKILLS.map((skill) => {
    const value = skillSessions[skill] ?? 0
    return {
      skill,
      label: SKILL_LABELS[skill],
      value,
      percentage: Math.round((value / maxValue) * 100),
      helper: getSkillHelper(skill, value),
    }
  })
}

function getSkillHelper(skill: SkillFocus, value: number) {
  if (value === 0) return 'Needs a session'
  if (skill === 'mixed') return 'Balanced workout'
  return value === 1 ? '1 session' : String(value) + ' sessions'
}

function getStrongestSkill(skillSessions: Partial<Record<SkillFocus, number>>) {
  const strongest = WEEKLY_SKILLS.reduce<SkillFocus>((best, skill) => (
    (skillSessions[skill] ?? 0) > (skillSessions[best] ?? 0) ? skill : best
  ), 'mixed')
  return (skillSessions[strongest] ?? 0) > 0 ? SKILL_LABELS[strongest] : 'Momentum'
}

function getWeakestSkill(skillSessions: Partial<Record<SkillFocus, number>>, summary: SmartReviewSummary) {
  if (summary.weakWords.length >= 3) return 'Review'
  const focusSkills: SkillFocus[] = ['listening', 'speaking', 'grammar', 'writing', 'reading']
  const weakest = focusSkills.reduce<SkillFocus>((lowest, skill) => (
    (skillSessions[skill] ?? 0) < (skillSessions[lowest] ?? 0) ? skill : lowest
  ), focusSkills[0])
  return SKILL_LABELS[weakest]
}

function getWeeklyRecommendation({
  activeDays,
  hasTrackedWeek,
  lessonsCompleted,
  missedWords,
  practiceSessions,
  skillSessions,
  summary,
}: {
  activeDays: number
  hasTrackedWeek: boolean
  lessonsCompleted: number
  missedWords: number
  practiceSessions: number
  skillSessions: Partial<Record<SkillFocus, number>>
  summary: SmartReviewSummary
}) {
  if (!hasTrackedWeek && lessonsCompleted === 0) {
    return 'Bugun bitta darsni tugating. Keyin haftalik hisobot real progress bilan toldiriladi.'
  }
  if (summary.dueWords.length >= 5) {
    return 'Smart Review bugun eng kuchli tanlov. Xotira uchun navbatdagi sozlarni hozir mustahkamlang.'
  }
  if (missedWords >= 3 || summary.weakWords.length >= 3) {
    return 'Keyingi mashqni Mistake Practice qiling. Sust sozlar tezroq tiklanadi.'
  }
  if ((skillSessions.listening ?? 0) === 0) {
    return 'Bu hafta Listening Practice qoshing. Quloq organishi gapirishni ham tezlashtiradi.'
  }
  if ((skillSessions.speaking ?? 0) === 0) {
    return 'Speaking Practice bilan 3-5 qisqa iborani ovoz chiqarib qaytaring.'
  }
  if (activeDays < 3) {
    return 'Haftani yutish uchun 3 kunlik ritm yetarli. Ertaga qisqa review bilan qayting.'
  }
  if (practiceSessions === 0) {
    return 'Mixed Practice premium ritmni ochadi: tinglash, tarjima va grammatika bir sessiyada.'
  }
  return 'Ajoyib hafta. Endi maqsad: review navbatini toza saqlash va 1 ta speaking sessiya qoshish.'
}

function getNextWeekTarget({ activeDays, lessonsCompleted, xpEarned, summary }: { activeDays: number; lessonsCompleted: number; xpEarned: number; summary: SmartReviewSummary }) {
  if (summary.weakWords.length >= 3) return 'Repair 5 weak words'
  if (activeDays < 4) return 'Study on 4 active days'
  if (lessonsCompleted < 3) return 'Complete 3 lessons'
  return 'Reach ' + Math.max(150, Math.ceil((xpEarned + 50) / 25) * 25) + ' weekly XP'
}

function getWeekdayLabel(date: string) {
  const labels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  return labels[new Date(date + 'T00:00:00').getDay()]
}

function hasPracticeSentence(word: Word) {
  return Boolean(word.example?.english && word.example?.uzbek)
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
