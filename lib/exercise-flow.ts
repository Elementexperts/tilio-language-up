import type { Lesson, User, Word } from '@/lib/types'

export type LessonExerciseType = 'vocabulary' | 'matching' | 'translation' | 'listening' | 'sentence'

export interface LessonExercise {
  type: LessonExerciseType
  word: Word
  options?: string[]
  correctAnswer: string
  prompt?: string
  questionText?: string
  speakText?: string
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
  const words = lesson.words
  const isUzToEn = learningPath === 'uz-en'
  const shuffledWords = seededSort(words, `lesson-${lesson.id}-${isUzToEn ? 'uz-en' : 'en-uz'}`)
  const exerciseTypes: LessonExerciseType[] = ['vocabulary', 'translation', 'listening', 'sentence']
  const exerciseList: LessonExercise[] = []

  exerciseTypes.forEach((type, roundIndex) => {
    const roundWords = seededSort(
      shuffledWords,
      `lesson-${lesson.id}-${type}-${roundIndex}-${isUzToEn ? 'uz-en' : 'en-uz'}`
    )

    roundWords.forEach((word, wordIndex) => {
      const correctAnswer = isUzToEn ? word.english : word.uzbek
      const options = buildChoiceOptions(words, word, roundIndex * words.length + wordIndex, isUzToEn)
      const sourceText = isUzToEn ? word.uzbek : word.english
      const targetText = isUzToEn ? word.english : word.uzbek
      const example = isUzToEn ? word.example?.uzbek : word.example?.english
      const translatedExample = isUzToEn ? word.example?.english : word.example?.uzbek

      exerciseList.push({
        type,
        word,
        options,
        correctAnswer,
        speakText: sourceText,
        questionText:
          type === 'sentence' && example
            ? example.replace(sourceText, '_____')
            : sourceText,
        prompt:
          type === 'vocabulary'
            ? `New word: ${sourceText}`
            : type === 'listening'
              ? 'Listen and choose the meaning'
              : type === 'sentence'
                ? translatedExample ?? 'Complete the phrase'
                : 'Choose the meaning',
      })
    })
  })

  if (words.length >= 4) {
    exerciseList.push({
      type: 'matching',
      word: shuffledWords[0],
      correctAnswer: 'matching',
    })
  }

  const uniqueExercises = new Map<string, LessonExercise>()
  exerciseList.forEach((exercise) => {
    uniqueExercises.set(`${exercise.type}-${exercise.word.id}`, exercise)
  })

  return avoidImmediateDuplicateWords(
    seededSort([...uniqueExercises.values()], `session-${lesson.id}-${isUzToEn ? 'uz-en' : 'en-uz'}`),
    lesson.id
  )
}
