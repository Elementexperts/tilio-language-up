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
const PRACTICE_ROUND_TYPES: LessonExerciseType[] = ['translation', 'listening', 'grammar', 'sentence-builder', 'pronunciation']

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

function buildPracticeRounds(
  allExercises: LessonExercise[],
  words: Word[],
  seed: string,
) {
  return PRACTICE_ROUND_TYPES.flatMap((_, roundIndex) => {
    const shuffledWords = seededSort(words, `${seed}-words-${roundIndex}`)
    const roundExercises = shuffledWords
      .map((word, wordIndex) => {
        const type = PRACTICE_ROUND_TYPES[(roundIndex + wordIndex) % PRACTICE_ROUND_TYPES.length]
        return allExercises.find((exercise) => exercise.type === type && exercise.word.id === word.id)
      })
      .filter((exercise): exercise is LessonExercise => Boolean(exercise))

    return seededSort(roundExercises, `${seed}-round-${roundIndex}`)
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

export function buildLessonExercises(
  lesson: Lesson,
  _learningPath: User['learningPath'] | undefined,
  wordReviews: Record<string, WordReview> = {}
): LessonExercise[] {
  const words = lesson.words
  const isUzToEn = true
  const maxExercises = lesson.isReview ? MAX_REVIEW_EXERCISES : MAX_LESSON_EXERCISES
  const today = new Date().toISOString().split('T')[0]
  const reviewSortedWords = seededSort(words, `lesson-${lesson.id}-${isUzToEn ? 'uz-en' : 'en-uz'}`).sort((a, b) => {
    const aReview = wordReviews[a.id]
    const bReview = wordReviews[b.id]
    const aDue = !aReview || aReview.nextReviewAt <= today
    const bDue = !bReview || bReview.nextReviewAt <= today
    if (aDue === bDue) return (bReview?.incorrectCount ?? 0) - (aReview?.incorrectCount ?? 0)
    return aDue ? -1 : 1
  })
  const exerciseTypes: LessonExerciseType[] = ['vocabulary', 'grammar', 'translation', 'listening', 'sentence-builder', 'pronunciation']
  const exerciseList: LessonExercise[] = []

  exerciseTypes.forEach((type, roundIndex) => {
    const roundWords = seededSort(
      reviewSortedWords,
      `lesson-${lesson.id}-${type}-${roundIndex}-${isUzToEn ? 'uz-en' : 'en-uz'}`
    )

    roundWords.forEach((word, wordIndex) => {
      const correctAnswer = isUzToEn ? word.uzbek : word.english
      const options = buildChoiceOptions(words, word, roundIndex * words.length + wordIndex, isUzToEn)
      const sourceText = isUzToEn ? word.english : word.uzbek
      const example = isUzToEn ? word.example?.english : word.example?.uzbek
      const translatedExample = isUzToEn ? word.example?.uzbek : word.example?.english
      const sentenceTarget = example ?? sourceText
      const sentenceTiles = seededSort(sentenceTarget.split(' ').filter(Boolean), `tiles-${word.id}-${isUzToEn ? 'uz-en' : 'en-uz'}`)
      const grammarRule = lesson.courseId === 'uz-ko'
        ? getKoreanGrammarNote(word, sourceText, correctAnswer)
        : isUzToEn
        ? `In English, place the key word where it naturally completes the sentence. "${sourceText}" means "${correctAnswer}".`
        : `O'zbek tilida ma'no ko'pincha qo'shimchalar va so'z tartibi orqali aniqlanadi. "${sourceText}" = "${correctAnswer}".`

      exerciseList.push({
        type,
        word,
        options: type === 'pronunciation' || type === 'sentence-builder' ? undefined : options,
        correctAnswer: type === 'sentence-builder' || type === 'pronunciation' ? sentenceTarget : correctAnswer,
        speakText: sourceText,
        xpReward: type === 'pronunciation' || type === 'sentence-builder' ? 8 : 5,
        sentenceTarget,
        sentenceTiles,
        grammarRule,
        questionText:
          type === 'sentence-builder' && example
            ? example.replace(sourceText, '_____')
            : sourceText,
        prompt:
          type === 'vocabulary'
            ? `New word: ${sourceText}`
            : type === 'grammar'
              ? 'Mini grammar'
            : type === 'listening'
              ? 'Listen and choose the meaning'
              : type === 'sentence-builder'
                ? translatedExample ?? 'Build the phrase'
                : type === 'pronunciation'
                  ? 'Say it out loud'
                  : 'Choose the meaning',
      })
    })
  })

  if (words.length >= 4) {
    exerciseList.push({
      type: 'matching',
      word: reviewSortedWords[0],
      correctAnswer: 'matching',
    })
  }

  const uniqueExercises = new Map<string, LessonExercise>()
  exerciseList.forEach((exercise) => {
    uniqueExercises.set(`${exercise.type}-${exercise.word.id}`, exercise)
  })

  const allExercises = [...uniqueExercises.values()]
  const vocabularyCards = lesson.isReview
    ? []
    : reviewSortedWords
    .map((word) => allExercises.find((exercise) => exercise.type === 'vocabulary' && exercise.word.id === word.id))
    .filter((exercise): exercise is LessonExercise => Boolean(exercise))
  const practiceExercises = avoidImmediateDuplicateWords(
    buildPracticeRounds(
      allExercises,
      reviewSortedWords,
      `session-${lesson.id}-${isUzToEn ? 'uz-en' : 'en-uz'}`
    ),
    lesson.id
  )

  const lastIntroWordId = vocabularyCards[vocabularyCards.length - 1]?.word.id
  if (lastIntroWordId && practiceExercises[0]?.word.id === lastIntroWordId) {
    const swapIndex = practiceExercises.findIndex((exercise) => exercise.word.id !== lastIntroWordId)
    if (swapIndex > 0) {
      const firstPractice = practiceExercises[0]
      practiceExercises[0] = practiceExercises[swapIndex]
      practiceExercises[swapIndex] = firstPractice
    }
  }

  return [...vocabularyCards, ...practiceExercises].slice(0, maxExercises)
}
