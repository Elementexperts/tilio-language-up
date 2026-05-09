'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useAppStore } from '@/lib/store'
import { useTelegram } from '@/hooks/use-telegram'
import { cn } from '@/lib/utils'
import { playAnswerSound } from '@/lib/sound'
import { buildLessonExercises, seededSort } from '@/lib/exercise-flow'
import { X, Check, ArrowRight } from 'lucide-react'
import type { Word } from '@/lib/types'

export function ExerciseScreen() {
  const currentLesson = useAppStore((state) => state.currentLesson)
  const currentExerciseIndex = useAppStore((state) => state.currentExerciseIndex)
  const exerciseAnswers = useAppStore((state) => state.exerciseAnswers)
  const completeExercise = useAppStore((state) => state.completeExercise)
  const completeLesson = useAppStore((state) => state.completeLesson)
  const setScreen = useAppStore((state) => state.setScreen)
  const user = useAppStore((state) => state.user)
  const isSoundEnabled = useAppStore((state) => state.isSoundEnabled)
  const { hapticFeedback, showBackButton, hideBackButton } = useTelegram()

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [showVocabulary, setShowVocabulary] = useState(true)

  // Generate exercises from lesson words
  const exercises = useMemo(() => {
    if (!currentLesson) return []
    return buildLessonExercises(currentLesson, user?.learningPath)
  }, [currentLesson, user?.learningPath])

  const currentExercise = exercises[currentExerciseIndex]
  const totalExercises = exercises.length
  const progressPercent = ((currentExerciseIndex) / totalExercises) * 100

  // Setup back button
  useEffect(() => {
    showBackButton(() => {
      hideBackButton()
      setScreen('home')
    })
    return () => hideBackButton()
  }, [showBackButton, hideBackButton, setScreen])

  const handleAnswer = useCallback((answer: string) => {
    if (isAnswered) return
    
    setSelectedAnswer(answer)
    setIsAnswered(true)
    
    const correct = answer === currentExercise?.correctAnswer
    setIsCorrect(correct)
    
    if (correct) {
      hapticFeedback('success')
    } else {
      hapticFeedback('error')
    }
    if (isSoundEnabled) playAnswerSound(correct)
  }, [isAnswered, currentExercise, hapticFeedback, isSoundEnabled])

  const handleContinue = useCallback(() => {
    hapticFeedback('light')
    
    // Record the answer
    completeExercise(isCorrect)
    
    // Reset state
    setSelectedAnswer(null)
    setIsAnswered(false)
    setIsCorrect(false)
    setShowVocabulary(true)
    
    // Check if lesson is complete
    if (currentExerciseIndex + 1 >= totalExercises) {
      completeLesson()
    }
  }, [hapticFeedback, completeExercise, isCorrect, currentExerciseIndex, totalExercises, completeLesson])

  const handleVocabContinue = useCallback(() => {
    setShowVocabulary(false)
    hapticFeedback('light')
  }, [hapticFeedback])

  const handleExit = useCallback(() => {
    hapticFeedback('light')
    setScreen('home')
  }, [hapticFeedback, setScreen])

  if (!currentLesson || !currentExercise) {
    return null
  }

  const isUzToEn = user?.learningPath === 'uz-en'

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background px-4 py-3 safe-area-top">
        <div className="flex items-center gap-4">
          <button
            onClick={handleExit}
            className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Exit lesson"
          >
            <X className="w-6 h-6" />
          </button>
          <Progress value={progressPercent} className="flex-1 h-3" />
          <span className="text-sm font-medium text-muted-foreground">
            {currentExerciseIndex + 1}/{totalExercises}
          </span>
        </div>
      </header>

      {/* Exercise Content */}
      <main className="flex-1 flex flex-col px-6 py-4">
        {/* Vocabulary Introduction */}
        {currentExercise.type === 'vocabulary' && showVocabulary && (
          <VocabularyCard 
            word={currentExercise.word}
            isUzToEn={isUzToEn}
            onContinue={handleVocabContinue}
          />
        )}

        {/* Translation Exercise */}
        {(currentExercise.type === 'translation' || 
          (currentExercise.type === 'vocabulary' && !showVocabulary)) && (
          <TranslationExercise
            word={currentExercise.word}
            options={currentExercise.options || []}
            correctAnswer={currentExercise.correctAnswer}
            selectedAnswer={selectedAnswer}
            isAnswered={isAnswered}
            isCorrect={isCorrect}
            isUzToEn={isUzToEn}
            onAnswer={handleAnswer}
          />
        )}

        {/* Matching Exercise */}
        {currentExercise.type === 'matching' && (
          <MatchingExercise
            words={currentLesson.words.slice(0, 4)}
            isUzToEn={isUzToEn}
            onComplete={(correct) => {
              setIsAnswered(true)
              setIsCorrect(correct)
              if (correct) {
                hapticFeedback('success')
              } else {
                hapticFeedback('error')
              }
            }}
            isAnswered={isAnswered}
          />
        )}
      </main>

      {/* Bottom Action */}
      {isAnswered && (
        <div className={cn(
          'p-6 safe-area-bottom',
          isCorrect ? 'bg-primary/10' : 'bg-destructive/10'
        )}>
          <div className="flex items-center gap-3 mb-4">
            {isCorrect ? (
              <>
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-semibold text-primary">Correct!</span>
              </>
            ) : (
              <>
                <div className="w-8 h-8 rounded-full bg-destructive flex items-center justify-center">
                  <X className="w-5 h-5 text-destructive-foreground" />
                </div>
                <div>
                  <span className="font-semibold text-destructive">Not quite</span>
                  <p className="text-sm text-muted-foreground">
                    Correct: {currentExercise.correctAnswer}
                  </p>
                </div>
              </>
            )}
          </div>
          <Button
            onClick={handleContinue}
            className={cn(
              'w-full h-14 text-lg font-semibold rounded-2xl',
              isCorrect 
                ? 'bg-primary hover:bg-primary/90' 
                : 'bg-destructive hover:bg-destructive/90'
            )}
          >
            Continue
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      )}
    </div>
  )
}

// Vocabulary Card Component
interface VocabularyCardProps {
  word: Word
  isUzToEn: boolean
  onContinue: () => void
}

function VocabularyCard({ word, isUzToEn, onContinue }: VocabularyCardProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-bounce-in">
      <p className="text-sm text-muted-foreground mb-2">New Word</p>
      
      <Card className="w-full max-w-sm p-8 text-center">
        <div className="text-4xl font-bold text-foreground mb-4">
          {isUzToEn ? word.uzbek : word.english}
        </div>
        
        <div className="flex items-center justify-center gap-2 text-xl text-muted-foreground mb-4">
          <span>=</span>
          <span className="font-medium text-primary">
            {isUzToEn ? word.english : word.uzbek}
          </span>
        </div>

        {word.example && (
          <div className="mt-6 p-4 bg-muted/50 rounded-xl text-left">
            <p className="text-sm text-foreground">
              {isUzToEn ? word.example.uzbek : word.example.english}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {isUzToEn ? word.example.english : word.example.uzbek}
            </p>
          </div>
        )}
      </Card>

      <Button
        onClick={onContinue}
        className="mt-8 h-14 px-12 text-lg font-semibold rounded-2xl"
      >
        Got it!
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  )
}

// Translation Exercise Component
interface TranslationExerciseProps {
  word: Word
  options: string[]
  correctAnswer: string
  selectedAnswer: string | null
  isAnswered: boolean
  isCorrect: boolean
  isUzToEn: boolean
  onAnswer: (answer: string) => void
}

function TranslationExercise({
  word,
  options,
  correctAnswer,
  selectedAnswer,
  isAnswered,
  isUzToEn,
  onAnswer,
}: TranslationExerciseProps) {
  return (
    <div className="flex-1 flex flex-col animate-bounce-in">
      <p className="text-sm text-muted-foreground mb-2">Translate this word</p>
      
      <Card className="p-6 mb-8">
        <div className="text-2xl font-bold text-foreground text-center">
          {isUzToEn ? word.uzbek : word.english}
        </div>
      </Card>

      <div className="space-y-3">
        {options.map((option) => {
          const isSelected = selectedAnswer === option
          const isCorrectOption = option === correctAnswer
          
          return (
            <button
              key={option}
              onClick={() => onAnswer(option)}
              disabled={isAnswered}
              className={cn(
                'w-full p-4 rounded-2xl border-2 text-left font-medium transition-all duration-200',
                !isAnswered && 'hover:border-primary/50 hover:bg-primary/5 active:scale-98',
                !isAnswered && !isSelected && 'border-border bg-card',
                isAnswered && isCorrectOption && 'border-primary bg-primary/10 text-primary',
                isAnswered && isSelected && !isCorrectOption && 'border-destructive bg-destructive/10 text-destructive',
                isAnswered && !isSelected && !isCorrectOption && 'border-border bg-card opacity-50'
              )}
            >
              <div className="flex items-center justify-between">
                <span>{option}</span>
                {isAnswered && isCorrectOption && (
                  <Check className="w-5 h-5 text-primary" />
                )}
                {isAnswered && isSelected && !isCorrectOption && (
                  <X className="w-5 h-5 text-destructive" />
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Matching Exercise Component
interface MatchingExerciseProps {
  words: Word[]
  isUzToEn: boolean
  onComplete: (correct: boolean) => void
  isAnswered: boolean
}

function MatchingExercise({ words, isUzToEn, onComplete, isAnswered }: MatchingExerciseProps) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  const [matches, setMatches] = useState<Record<string, string>>({})
  const [wrongMatch, setWrongMatch] = useState<string | null>(null)

  const leftItems = words.map((w) => ({ id: w.id, text: isUzToEn ? w.uzbek : w.english }))
  const rightItems = useMemo(
    () =>
      seededSort(
        words.map((w) => ({ id: w.id, text: isUzToEn ? w.english : w.uzbek })),
        `matching-${words.map((w) => w.id).join('-')}-${isUzToEn ? 'uz-en' : 'en-uz'}`
      ),
    [words, isUzToEn]
  )

  const handleLeftClick = (id: string) => {
    if (matches[id] || isAnswered) return
    setSelectedLeft(id)
    setWrongMatch(null)
  }

  const handleRightClick = (id: string) => {
    if (!selectedLeft || isAnswered) return
    
    if (selectedLeft === id) {
      // Correct match
      setMatches((prev) => ({ ...prev, [selectedLeft]: id }))
      setSelectedLeft(null)
      
      // Check if all matched
      if (Object.keys(matches).length + 1 === words.length) {
        onComplete(true)
      }
    } else {
      // Wrong match
      setWrongMatch(id)
      setTimeout(() => {
        setWrongMatch(null)
        setSelectedLeft(null)
      }, 500)
    }
  }

  useEffect(() => {
    if (Object.keys(matches).length === words.length && !isAnswered) {
      onComplete(true)
    }
  }, [matches, words.length, isAnswered, onComplete])

  return (
    <div className="flex-1 flex flex-col animate-bounce-in">
      <p className="text-sm text-muted-foreground mb-4">Match the pairs</p>
      
      <div className="flex gap-4">
        {/* Left column */}
        <div className="flex-1 space-y-3">
          {leftItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleLeftClick(item.id)}
              disabled={!!matches[item.id] || isAnswered}
              className={cn(
                'w-full p-4 rounded-xl border-2 text-center font-medium transition-all',
                matches[item.id] && 'border-primary bg-primary/10 text-primary',
                selectedLeft === item.id && 'border-primary bg-primary/5',
                !matches[item.id] && selectedLeft !== item.id && 'border-border bg-card',
                matches[item.id] && 'opacity-50'
              )}
            >
              {item.text}
            </button>
          ))}
        </div>

        {/* Right column */}
        <div className="flex-1 space-y-3">
          {rightItems.map((item) => {
            const isMatched = Object.values(matches).includes(item.id)
            
            return (
              <button
                key={item.id}
                onClick={() => handleRightClick(item.id)}
                disabled={isMatched || isAnswered}
                className={cn(
                  'w-full p-4 rounded-xl border-2 text-center font-medium transition-all',
                  isMatched && 'border-primary bg-primary/10 text-primary opacity-50',
                  wrongMatch === item.id && 'border-destructive bg-destructive/10 animate-shake',
                  !isMatched && wrongMatch !== item.id && 'border-border bg-card',
                  selectedLeft && !isMatched && 'hover:border-primary/50'
                )}
              >
                {item.text}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
