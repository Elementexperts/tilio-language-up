import { getLessonsForCourse } from '@/lib/data/lessons'
import type { Lesson, User, Word, WordReview } from '@/lib/types'

export type LessonExerciseType =
  | 'vocabulary'
  | 'matching'
  | 'translation'
  | 'listening'
  | 'sentence'
  | 'sentence-builder'
  | 'pronunciation'
  | 'grammar'

export interface LessonExercise {
  type: LessonExerciseType
  word: Word
  options?: string[]
  correctAnswer: string
  prompt?: string
  questionText?: string
  speakText?: string
  grammarRule?: string
  sentenceTiles?: string[]
  sentenceTarget?: string
  xpReward?: number
}

const MAX_LESSON_EXERCISES = 15
const MAX_REVIEW_EXERCISES = 20
const MAX_PRACTICE_SESSION_EXERCISES = 12
const PRACTICE_SECTION_ORDER: LessonExerciseType[] = ['translation', 'listening', 'grammar', 'sentence-builder', 'pronunciation']

function getPracticeSectionOrder(lesson: Lesson): LessonExerciseType[] {
  if (lesson.practiceMode === 'listening') return ['listening', 'listening', 'translation', 'pronunciation']
  if (lesson.practiceMode === 'speaking') return ['pronunciation', 'pronunciation', 'listening', 'translation']
  if (lesson.practiceMode === 'mistake') return ['translation', 'grammar', 'sentence-builder', 'listening', 'pronunciation']
  if (lesson.practiceMode === 'mixed') return ['listening', 'translation', 'grammar', 'sentence-builder', 'pronunciation']
  return PRACTICE_SECTION_ORDER
}

function wordCount(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function uniqueWords(words: Word[]) {
  const seen = new Set<string>()
  return words.filter((word) => {
    if (seen.has(word.id)) return false
    seen.add(word.id)
    return true
  })
}

function scoreFor(seed: string) {
  let hash = 2166136261
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export function seededSort<T>(items: T[], seed: string): T[] {
  return [...items]
    .map((item, index) => ({ item, key: `${seed}-${index}` }))
    .sort((a, b) => scoreFor(a.key) - scoreFor(b.key))
    .map(({ item }) => item)
}

function avoidImmediateDuplicateWords(exercises: LessonExercise[], seed: string) {
  const arranged = [...exercises]

  for (let index = 1; index < arranged.length; index++) {
    if (arranged[index].word.id !== arranged[index - 1].word.id) continue

    let swapIndex = -1
    for (let candidate = index + 1; candidate < arranged.length; candidate++) {
      const candidateWordId = arranged[candidate].word.id
      const previousWordId = arranged[index - 1].word.id
      const nextWordId = arranged[index + 1]?.word.id
      if (candidateWordId !== previousWordId && candidateWordId !== nextWordId) {
        swapIndex = candidate
        break
      }
    }

    if (swapIndex === -1) {
      for (let candidate = index - 2; candidate >= 0; candidate--) {
        const candidateWordId = arranged[candidate].word.id
        const beforeCandidateWordId = arranged[candidate - 1]?.word.id
        const afterCandidateWordId = arranged[candidate + 1]?.word.id
        if (
          candidateWordId !== arranged[index - 1].word.id &&
          arranged[index].word.id !== beforeCandidateWordId &&
          arranged[index].word.id !== afterCandidateWordId
        ) {
          swapIndex = candidate
          break
        }
      }
    }

    if (swapIndex !== -1) {
      const current = arranged[index]
      arranged[index] = arranged[swapIndex]
      arranged[swapIndex] = current
    }
  }

  return seededSort(arranged, `stabilize-${seed}`).sort((a, b) => {
    const aIndex = arranged.indexOf(a)
    const bIndex = arranged.indexOf(b)
    return aIndex - bIndex
  })
}

export function buildChoiceOptions(
  words: Word[],
  word: Word,
  index: number,
  isUzToEn: boolean
) {
  const correctAnswer = isUzToEn ? word.uzbek : word.english
  const optionsForWord = (candidate: Word) => (isUzToEn ? candidate.uzbek : candidate.english)
  const fallbackOptions = isUzToEn
    ? ['Xayr', 'Rahmat', 'Iltimos', 'Ha', "Yo'q", 'Xush kelibsiz', 'Hayrli tong']
    : ['Goodbye', 'Thank you', 'Please', 'Yes', 'No', 'Welcome', 'Good morning']
  const wrongOptions = seededSort(
    words.filter((candidate) => candidate.id !== word.id).map(optionsForWord),
    `wrong-${word.id}-${index}-${isUzToEn ? 'uz-en' : 'en-uz'}`
  )

  const uniqueWrongOptions = [...wrongOptions, ...fallbackOptions].filter(
    (option, optionIndex, allOptions) =>
      option !== correctAnswer && allOptions.indexOf(option) === optionIndex
  )

  return seededSort(
    [correctAnswer, ...uniqueWrongOptions.slice(0, 3)],
    `options-${word.id}-${index}-${isUzToEn ? 'uz-en' : 'en-uz'}`
  )
}

function buildTextOptions(candidates: string[], correctAnswer: string, seed: string) {
  const uniqueCandidates = candidates.filter(
    (candidate, index, allCandidates) =>
      candidate !== correctAnswer && candidate.trim().length > 0 && allCandidates.indexOf(candidate) === index
  )

  return seededSort(
    [correctAnswer, ...seededSort(uniqueCandidates, `wrong-${seed}`).slice(0, 3)],
    `options-${seed}`
  )
}

function getPreviousLessonWords(lesson: Lesson) {
  const courseLessons = getLessonsForCourse(lesson.courseId ?? 'uz-en')
  return uniqueWords(
    courseLessons
      .filter((candidate) => candidate.order < lesson.order)
      .flatMap((candidate) => candidate.words)
  )
}

function getDueReviewWords(lesson: Lesson, wordReviews: Record<string, WordReview>, today: string) {
  const courseWords = uniqueWords(getLessonsForCourse(lesson.courseId ?? 'uz-en').flatMap((candidate) => candidate.words))
  const reviewedWords = courseWords.filter((word) => {
    const review = wordReviews[word.id]
    return review && (review.nextReviewAt <= today || review.incorrectCount > 0)
  })

  return seededSort(reviewedWords, `review-${lesson.id}`).sort((a, b) => {
    const aReview = wordReviews[a.id]
    const bReview = wordReviews[b.id]
    const aDue = aReview.nextReviewAt <= today
    const bDue = bReview.nextReviewAt <= today
    if (aDue !== bDue) return aDue ? -1 : 1
    return bReview.incorrectCount - aReview.incorrectCount
  })
}

function getGrammarPattern(word: Word, sourceText: string, example: string, translatedExample?: string) {
  const blankedExample = example.replace(new RegExp(escapeRegExp(sourceText), 'i'), '_____')
  const hasBlank = blankedExample !== example

  return {
    questionText: hasBlank ? blankedExample : example,
    rule: translatedExample
      ? `Pattern practice: choose the phrase that completes "${example}". Uzbek meaning: "${translatedExample}".`
      : `Pattern practice: choose the phrase that completes "${example}".`,
  }
}

function getKoreanGrammarNote(word: Word, sourceText: string, correctAnswer: string) {
  const romanization = word.romanization ? `Talaffuz: ${word.romanization}. ` : ''
  const explanation = word.uzbekExplanation ? `${word.uzbekExplanation} ` : ''

  if (word.category === 'ko-hangul') {
    return `${romanization}${explanation}Hangul bo‘g‘inlari odatda undosh va unli qo‘shilishidan tuziladi; avval shaklni tanib, keyin tovushni takrorlang.`
  }
  if (word.category === 'ko-grammar') {
    return `${romanization}${explanation}"${sourceText}" iborasining o‘zbekcha ma’nosi "${correctAnswer}". Koreys tilida muloyim shakllar suhbatda juda muhim.`
  }
  if (word.category === 'ko-topik') {
    return `${romanization}${explanation}TOPIK uslubida bu so‘z ko‘rsatma yoki savol matnida keladi; avval buyruqni tushunib, keyin javobni tanlang.`
  }

  return `${romanization}${explanation}"${sourceText}" koreyscha shakl bo‘lib, o‘zbekcha ma’nosi "${correctAnswer}". Avval eshiting, keyin ovoz chiqarib takrorlang.`
}

function getRussianGrammarNote(word: Word, sourceText: string, correctAnswer: string) {
  const romanization = word.romanization ? `Talaffuz: ${word.romanization}. ` : ''
  const explanation = word.uzbekExplanation ? `${word.uzbekExplanation} ` : ''

  if (word.category === 'ru-grammar') {
    return `${romanization}${explanation}"${sourceText}" iborasining o'zbekcha ma'nosi "${correctAnswer}". Rus tilida so'z tartibi va fe'l shakliga e'tibor bering.`
  }

  return `${romanization}${explanation}"${sourceText}" ruscha shakl bo'lib, o'zbekcha ma'nosi "${correctAnswer}". Avval kirill yozuvini tanib, keyin ovoz chiqarib takrorlang.`
}

function getCourseGrammarNote(word: Word, sourceText: string, correctAnswer: string, languageLabel: string, focus: string) {
  const romanization = word.romanization ? `Talaffuz: ${word.romanization}. ` : ''
  const explanation = word.uzbekExplanation ? `${word.uzbekExplanation} ` : ''
  return `${romanization}${explanation}"${sourceText}" ${languageLabel} shakl bo'lib, o'zbekcha ma'nosi "${correctAnswer}". ${focus}`
}

export function buildLessonExercises(
  lesson: Lesson,
  _learningPath: User['learningPath'] | undefined,
  wordReviews: Record<string, WordReview> = {}
): LessonExercise[] {
  const words = uniqueWords(lesson.words)
  const isUzToEn = true
  const maxExercises = lesson.isPracticeSession ? MAX_PRACTICE_SESSION_EXERCISES : lesson.isReview ? MAX_REVIEW_EXERCISES : MAX_LESSON_EXERCISES
  const today = new Date().toISOString().split('T')[0]
  const reviewSortedWords = seededSort(words, `lesson-${lesson.id}-${isUzToEn ? 'uz-en' : 'en-uz'}`).sort((a, b) => {
    const aReview = wordReviews[a.id]
    const bReview = wordReviews[b.id]
    const aDue = !aReview || aReview.nextReviewAt <= today
    const bDue = !bReview || bReview.nextReviewAt <= today
    if (aDue === bDue) return (bReview?.incorrectCount ?? 0) - (aReview?.incorrectCount ?? 0)
    return aDue ? -1 : 1
  })

  const previousWords = getPreviousLessonWords(lesson)
  const dueReviewWords = getDueReviewWords(lesson, wordReviews, today)
  const isFocusedReview = Boolean(lesson.isPracticeSession)
  const newWordIds = new Set(words.map((word) => word.id))
  const mixedPracticeWords = uniqueWords([
    ...reviewSortedWords,
    ...seededSort(dueReviewWords.filter((word) => !newWordIds.has(word.id)), `due-${lesson.id}`),
    ...seededSort(previousWords, `previous-${lesson.id}`),
  ])
  const reviewPracticeWords = isFocusedReview
    ? reviewSortedWords
    : uniqueWords([
        ...dueReviewWords,
        ...reviewSortedWords,
        ...previousWords,
      ])
  const practiceSourceWords = lesson.isReview ? reviewPracticeWords : mixedPracticeWords
  const optionSourceWords = uniqueWords([
    ...practiceSourceWords,
    ...previousWords,
    ...dueReviewWords,
    ...words,
  ])

  const createExercise = (type: LessonExerciseType, word: Word, index: number): LessonExercise | null => {
    const correctAnswer = isUzToEn ? word.uzbek : word.english
    const sourceText = isUzToEn ? word.english : word.uzbek
    const example = isUzToEn ? word.example?.english : word.example?.uzbek
    const translatedExample = isUzToEn ? word.example?.uzbek : word.example?.english
    const hasSentence = Boolean(example && translatedExample && wordCount(example) > 1)
    const sentenceTarget = example ?? sourceText
    const sentenceTiles = seededSort(sentenceTarget.split(' ').filter(Boolean), `tiles-${word.id}-${type}-${isUzToEn ? 'uz-en' : 'en-uz'}`)
    const choicePool = type === 'translation' ? optionSourceWords : words

    if (type === 'sentence-builder' && !hasSentence) return null
    if ((type === 'listening' || type === 'pronunciation' || type === 'grammar') && !example) return null
    if (type === 'grammar' && lesson.courseId !== 'uz-ko' && lesson.courseId !== 'uz-ru' && lesson.courseId !== 'uz-ar' && lesson.courseId !== 'uz-de' && example && !new RegExp(escapeRegExp(sourceText), 'i').test(example)) {
      return null
    }

    if (type === 'listening' && example && translatedExample) {
      return {
        type,
        word,
        options: buildTextOptions(
          optionSourceWords.map((candidate) => candidate.example?.uzbek ?? candidate.uzbek),
          translatedExample,
          `${lesson.id}-${type}-${word.id}-${index}`
        ),
        correctAnswer: translatedExample,
        speakText: example,
        questionText: '',
        xpReward: 6,
        prompt: 'Listen to the full sentence',
      }
    }

    if (type === 'grammar' && example) {
      const grammarPattern = lesson.courseId === 'uz-ko'
        ? { questionText: sourceText, rule: getKoreanGrammarNote(word, sourceText, correctAnswer) }
        : lesson.courseId === 'uz-ru'
          ? { questionText: sourceText, rule: getRussianGrammarNote(word, sourceText, correctAnswer) }
          : lesson.courseId === 'uz-ar'
            ? { questionText: sourceText, rule: getCourseGrammarNote(word, sourceText, correctAnswer, 'arabcha', 'Arab yozuvi o\'ngdan chapga o\'qiladi; avval shaklni tanib, keyin talaffuzni takrorlang.') }
            : lesson.courseId === 'uz-de'
              ? { questionText: sourceText, rule: getCourseGrammarNote(word, sourceText, correctAnswer, 'nemischa', 'Nemis tilida bosh harf, fe\'l joyi va sodda gap qolipiga e\'tibor bering.') }
          : getGrammarPattern(word, sourceText, example, translatedExample)

      return {
        type,
        word,
        options: buildTextOptions(
          optionSourceWords.map((candidate) => candidate.english),
          sourceText,
          `${lesson.id}-${type}-${word.id}-${index}`
        ),
        correctAnswer: sourceText,
        speakText: example,
        questionText: grammarPattern.questionText,
        grammarRule: grammarPattern.rule,
        xpReward: 6,
        prompt: 'Choose the phrase that fits the pattern',
      }
    }

    if (type === 'sentence-builder' && example && translatedExample) {
      return {
        type,
        word,
        correctAnswer: sentenceTarget,
        speakText: sentenceTarget,
        sentenceTarget,
        sentenceTiles,
        xpReward: 8,
        questionText: example.replace(new RegExp(escapeRegExp(sourceText), 'i'), '_____'),
        prompt: `Translate: ${translatedExample}`,
      }
    }

    if (type === 'pronunciation') {
      return {
        type,
        word,
        correctAnswer: sentenceTarget,
        speakText: sentenceTarget,
        xpReward: 8,
        prompt: 'Say the full sentence',
      }
    }

    if (type === 'translation') {
      return {
        type,
        word,
        options: buildChoiceOptions(choicePool, word, index, isUzToEn),
        correctAnswer,
        speakText: sourceText,
        questionText: sourceText,
        xpReward: 5,
        prompt: newWordIds.has(word.id) ? 'Translate the new word' : 'Review from earlier lessons',
      }
    }

    if (type === 'vocabulary') {
      return {
        type,
        word,
        options: buildChoiceOptions(words, word, index, isUzToEn),
        correctAnswer,
        speakText: sourceText,
        questionText: sourceText,
        xpReward: 5,
        prompt: `New word: ${sourceText}`,
      }
    }

    return null
  }

  const vocabularyCards = lesson.isReview
    ? []
    : reviewSortedWords
    .map((word, index) => createExercise('vocabulary', word, index))
    .filter((exercise): exercise is LessonExercise => Boolean(exercise))

  const practiceExercises: LessonExercise[] = []
  const usedPracticeWordIds = new Set<string>()
  const targetPracticeCount = Math.max(0, maxExercises - vocabularyCards.length)
  const practiceSectionOrder = getPracticeSectionOrder(lesson)

  for (let pass = 0; practiceExercises.length < targetPracticeCount && pass < 4; pass += 1) {
    for (const type of practiceSectionOrder) {
      if (practiceExercises.length >= targetPracticeCount) break

      const pool = seededSort(practiceSourceWords, `${lesson.id}-${type}-pool-${pass}`)
      const exercise = pool
        .filter((candidate) => pass > 0 || !usedPracticeWordIds.has(candidate.id))
        .map((candidate) => createExercise(type, candidate, practiceExercises.length + pass))
        .find((candidate): candidate is LessonExercise => Boolean(candidate))
      if (!exercise) continue

      practiceExercises.push(exercise)
      usedPracticeWordIds.add(exercise.word.id)
    }
  }

  if (lesson.isReview && words.length >= 4 && practiceExercises.length < maxExercises) {
    practiceExercises.push({
      type: 'matching',
      word: reviewSortedWords[0],
      correctAnswer: 'matching',
    })
  }

  return [...vocabularyCards, ...avoidImmediateDuplicateWords(practiceExercises, lesson.id)].slice(0, maxExercises)
}
