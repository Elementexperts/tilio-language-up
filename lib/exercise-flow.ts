import type { Lesson, User, Word } from '@/lib/types'

export type LessonExerciseType = 'vocabulary' | 'matching' | 'translation' | 'sentence'

export interface LessonExercise {
  type: LessonExerciseType
  word: Word
  options?: string[]
  correctAnswer: string
}

export function seededSort<T>(items: T[], seed: string): T[] {
  return [...items]
    .map((item, index) => ({ item, key: `${seed}-${index}` }))
    .sort((a, b) => {
      let aScore = 0
      let bScore = 0
      for (let i = 0; i < a.key.length; i++) aScore += a.key.charCodeAt(i) * (i + 1)
      for (let i = 0; i < b.key.length; i++) bScore += b.key.charCodeAt(i) * (i + 1)
      return aScore - bScore
    })
    .map(({ item }) => item)
}

export function buildChoiceOptions(
  words: Word[],
  word: Word,
  index: number,
  isUzToEn: boolean
) {
  const correctAnswer = isUzToEn ? word.english : word.uzbek
  const optionsForWord = (candidate: Word) => (isUzToEn ? candidate.english : candidate.uzbek)
  const fallbackOptions = isUzToEn
    ? ['Goodbye', 'Thank you', 'Please', 'Yes', 'No', 'Welcome', 'Good morning']
    : ['Xayr', 'Rahmat', 'Iltimos', 'Ha', "Yo'q", 'Xush kelibsiz', 'Hayrli tong']
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

export function buildLessonExercises(
  lesson: Lesson,
  learningPath: User['learningPath'] | undefined
): LessonExercise[] {
  const exerciseList: LessonExercise[] = []
  const words = lesson.words
  const isUzToEn = learningPath === 'uz-en'

  words.forEach((word, index) => {
    const correctAnswer = isUzToEn ? word.english : word.uzbek
    const options = buildChoiceOptions(words, word, index, isUzToEn)

    exerciseList.push({
      type: 'vocabulary',
      word,
      options,
      correctAnswer,
    })

    exerciseList.push({
      type: 'translation',
      word,
      options,
      correctAnswer,
    })
  })

  if (words.length >= 4) {
    exerciseList.push({
      type: 'matching',
      word: words[0],
      correctAnswer: 'matching',
    })
  }

  return exerciseList
}

