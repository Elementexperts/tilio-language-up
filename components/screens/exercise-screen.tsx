'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { SparrowMascot } from '@/components/sparrow-mascot'
import { useAppStore } from '@/lib/store'
import { useTelegram } from '@/hooks/use-telegram'
import { cn } from '@/lib/utils'
import { playAnswerSound } from '@/lib/sound'
import { buildLessonExercises, seededSort } from '@/lib/exercise-flow'
import { X, Check, ArrowRight, Sparkles, Zap, Volume2 } from 'lucide-react'
import type { Word } from '@/lib/types'

function getPreferredVoice(lang: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null
  const voices = window.speechSynthesis.getVoices()
  const exact = voices.find((voice) => voice.lang.toLowerCase() === lang.toLowerCase())
  if (exact) return exact
  const languagePrefix = lang.split('-')[0].toLowerCase()
  return voices.find((voice) => voice.lang.toLowerCase().startsWith(languagePrefix)) ?? null
}

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
  const [showCelebration, setShowCelebration] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)

  // Generate exercises from lesson words
  const exercises = useMemo(() => {
    if (!currentLesson) return []
    return buildLessonExercises(currentLesson, user?.learningPath)
  }, [currentLesson, user?.learningPath])

  const currentExercise = exercises[currentExerciseIndex]
  const totalExercises = exercises.length
  const progressPercent = ((currentExerciseIndex) / totalExercises) * 100
  const isUzToEn = user?.learningPath === 'uz-en'

  const speakText = useCallback((text: string, lang = 'uz-UZ') => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text.trim()) return

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    utterance.rate = lang.startsWith('uz') ? 0.86 : 0.92
    utterance.pitch = 1.05
    const voice = getPreferredVoice(lang)
    if (voice) utterance.voice = voice
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }, [])

  const speakUzbekWord = useCallback((word: Word) => {
    speakText(word.uzbek, 'uz-UZ')
  }, [speakText])

  // Setup back button
  useEffect(() => {
    showBackButton(() => {
      hideBackButton()
      setScreen('home')
    })
    return () => hideBackButton()
  }, [showBackButton, hideBackButton, setScreen])

  useEffect(() => {
    if (!currentExercise) return
    if (currentExercise.type !== 'vocabulary' || !showVocabulary) return
    const timer = window.setTimeout(() => speakUzbekWord(currentExercise.word), 350)
    return () => {
      window.clearTimeout(timer)
      if ('speechSynthesis' in window) window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }, [currentExercise, showVocabulary, speakUzbekWord])

  useEffect(() => {
    if (!currentExercise || currentExercise.type !== 'listening' || isAnswered) return
    const timer = window.setTimeout(() => speakText(currentExercise.speakText ?? currentExercise.word.uzbek, isUzToEn ? 'uz-UZ' : 'en-US'), 300)
    return () => window.clearTimeout(timer)
  }, [currentExercise, isAnswered, isUzToEn, speakText])

  const handleAnswer = useCallback((answer: string) => {
    if (isAnswered) return
    
    setSelectedAnswer(answer)
    setIsAnswered(true)
    
    const correct = answer === currentExercise?.correctAnswer
    setIsCorrect(correct)
    
    if (correct) {
      hapticFeedback('success')
      setShowCelebration(true)
      window.setTimeout(() => setShowCelebration(false), 900)
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
    setShowCelebration(false)
    setIsSpeaking(false)
    
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

  return (
    <div className="tilio-shell flex flex-col">
      {showCelebration && (
        <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
          {Array.from({ length: 12 }).map((_, index) => (
            <Sparkles
              key={index}
              className="absolute size-5 animate-confetti text-accent"
              style={{
                left: `${10 + ((index * 17) % 78)}%`,
                top: `${35 + ((index * 11) % 28)}%`,
                animationDelay: `${index * 45}ms`,
              }}
            />
          ))}
          <div className="absolute left-1/2 top-1/3 -translate-x-1/2 animate-float-up rounded-full bg-white px-4 py-2 text-sm font-black text-primary shadow-xl">
            <span className="inline-flex items-center gap-1"><Zap className="size-4" /> +5 XP</span>
          </div>
        </div>
      )}
      {/* Header */}
      <header className="sticky top-0 z-10 safe-area-top">
        <div className="tilio-container px-4 py-3">
        <div className="flex items-center gap-4 rounded-[1.5rem] border border-white/70 bg-white/80 p-2 shadow-lg shadow-emerald-950/5 backdrop-blur-xl">
          <button
            onClick={handleExit}
            className="tilio-pressed flex size-10 items-center justify-center rounded-full bg-emerald-50 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Exit lesson"
          >
            <X className="w-6 h-6" />
          </button>
          <Progress value={progressPercent} className="tilio-progress h-3 flex-1" />
          <span className="pr-2 text-sm font-black text-muted-foreground">
            {currentExerciseIndex + 1}/{totalExercises}
          </span>
        </div>
        </div>
      </header>

      {/* Exercise Content */}
      <main className="tilio-container flex flex-1 flex-col px-5 py-4">
        {/* Vocabulary Introduction */}
        {currentExercise.type === 'vocabulary' && showVocabulary && (
          <VocabularyCard 
            word={currentExercise.word}
            isUzToEn={isUzToEn}
            onContinue={handleVocabContinue}
            isSpeaking={isSpeaking}
            onSpeak={() => speakUzbekWord(currentExercise.word)}
          />
        )}

        {/* Translation Exercise */}
        {(currentExercise.type === 'translation' || 
          currentExercise.type === 'listening' ||
          currentExercise.type === 'sentence' ||
          (currentExercise.type === 'vocabulary' && !showVocabulary)) && (
          <TranslationExercise
            type={currentExercise.type === 'vocabulary' ? 'translation' : currentExercise.type}
            word={currentExercise.word}
            options={currentExercise.options || []}
            correctAnswer={currentExercise.correctAnswer}
            selectedAnswer={selectedAnswer}
            isAnswered={isAnswered}
            isCorrect={isCorrect}
            isUzToEn={isUzToEn}
            prompt={currentExercise.prompt}
            questionText={currentExercise.questionText}
            isSpeaking={isSpeaking}
            onReplay={() => speakText(currentExercise.speakText ?? currentExercise.word.uzbek, isUzToEn ? 'uz-UZ' : 'en-US')}
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
          'relative z-20 safe-area-bottom',
          isCorrect ? 'bg-primary/10' : 'bg-destructive/10'
        )}>
          <div className="tilio-container p-5">
          <div className="mb-4 flex items-center gap-3">
            {isCorrect ? (
              <>
                <div className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
                  <Check className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <span className="text-lg font-black text-primary">Correct!</span>
                  <p className="text-sm font-semibold text-muted-foreground">Nice answer. Keep the rhythm.</p>
                </div>
              </>
            ) : (
              <>
                <div className="flex size-10 items-center justify-center rounded-2xl bg-destructive">
                  <X className="w-5 h-5 text-destructive-foreground" />
                </div>
                <div>
                  <span className="text-lg font-black text-destructive">Almost</span>
                  <p className="text-sm font-semibold text-muted-foreground">
                    Correct: {currentExercise.correctAnswer}
                  </p>
                </div>
              </>
            )}
          </div>
          <Button
            onClick={handleContinue}
            className={cn(
              'tilio-button h-14 w-full rounded-2xl text-lg font-black',
              isCorrect 
                ? 'bg-primary hover:bg-primary/90' 
                : 'bg-destructive hover:bg-destructive/90'
            )}
          >
            Continue
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          </div>
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
  isSpeaking: boolean
  onSpeak: () => void
}

function VocabularyCard({ word, isUzToEn, onContinue, isSpeaking, onSpeak }: VocabularyCardProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center animate-soft-pop">
      <div className="mb-4 flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.16em] text-primary shadow-sm">
        <Sparkles className="size-3.5" />
        New Word
      </div>
      
      <Card className="tilio-card w-full max-w-sm rounded-[2rem] p-7 text-center">
        <SparrowMascot size="sm" mood="thinking" branded className="mx-auto mb-4" />
        <div className="mb-4 flex items-center justify-center gap-3">
          <div className="text-5xl font-black leading-none text-emerald-950">
            {isUzToEn ? word.uzbek : word.english}
          </div>
          <button
            type="button"
            onClick={onSpeak}
            className={cn(
              'tilio-pressed flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20',
              isSpeaking && 'animate-pulse-glow'
            )}
            aria-label="Play pronunciation"
          >
            <Volume2 className="size-5" />
          </button>
        </div>
        
        <div className="mb-4 flex items-center justify-center gap-2 text-xl font-black text-muted-foreground">
          <span>=</span>
          <span className="font-medium text-primary">
            {isUzToEn ? word.english : word.uzbek}
          </span>
        </div>

        {word.example && (
          <div className="mt-6 rounded-2xl bg-emerald-50/80 p-4 text-left">
            <p className="text-sm font-bold text-foreground">
              {isUzToEn ? word.example.uzbek : word.example.english}
            </p>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              {isUzToEn ? word.example.english : word.example.uzbek}
            </p>
          </div>
        )}
      </Card>

      <Button
        onClick={onContinue}
        className="tilio-button mt-8 h-14 rounded-2xl px-12 text-lg font-black"
      >
        Got it!
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  )
}

// Translation Exercise Component
interface TranslationExerciseProps {
  type: 'translation' | 'listening' | 'sentence'
  word: Word
  options: string[]
  correctAnswer: string
  selectedAnswer: string | null
  isAnswered: boolean
  isCorrect: boolean
  isUzToEn: boolean
  prompt?: string
  questionText?: string
  isSpeaking: boolean
  onReplay: () => void
  onAnswer: (answer: string) => void
}

function TranslationExercise({
  type,
  word,
  options,
  correctAnswer,
  selectedAnswer,
  isAnswered,
  isUzToEn,
  prompt,
  questionText,
  isSpeaking,
  onReplay,
  onAnswer,
}: TranslationExerciseProps) {
  const title =
    type === 'listening'
      ? 'What did you hear?'
      : type === 'sentence'
        ? 'Complete the phrase'
        : 'Choose the meaning'
  const eyebrow = type === 'listening' ? 'Listening' : type === 'sentence' ? 'Sentence' : 'Translate'
  const displayText = questionText ?? (isUzToEn ? word.uzbek : word.english)

  return (
    <div key={`${type}-${word.id}`} className="flex flex-1 flex-col animate-soft-pop">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">{eyebrow}</p>
          <h1 className="text-2xl font-black">{title}</h1>
        </div>
        <SparrowMascot size="sm" mood={isAnswered ? 'celebrating' : 'happy'} branded />
      </div>
      
      <Card className="tilio-card mb-8 rounded-[2rem] p-7">
        {type === 'listening' ? (
          <button
            type="button"
            onClick={onReplay}
            className={cn(
              'tilio-pressed mx-auto flex size-24 items-center justify-center rounded-[2rem] bg-primary text-primary-foreground shadow-xl shadow-primary/25',
              isSpeaking && 'animate-pulse-glow'
            )}
            aria-label="Replay audio"
          >
            <Volume2 className="size-10" />
          </button>
        ) : (
          <div className="text-center text-4xl font-black leading-tight text-emerald-950">
            {displayText}
          </div>
        )}
        {prompt && <p className="mt-4 text-center text-sm font-semibold text-muted-foreground">{prompt}</p>}
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
                'tilio-pressed w-full rounded-[1.35rem] border-2 p-4 text-left text-base font-black shadow-sm transition-all duration-200',
                !isAnswered && 'hover:border-primary/50 hover:bg-primary/5',
                !isAnswered && !isSelected && 'border-emerald-100 bg-white/85',
                isAnswered && isCorrectOption && 'border-primary bg-primary/10 text-primary',
                isAnswered && isSelected && !isCorrectOption && 'border-destructive bg-destructive/10 text-destructive',
                isAnswered && !isSelected && !isCorrectOption && 'border-border bg-white/60 opacity-50'
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
    <div className="flex flex-1 flex-col animate-soft-pop">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">Pairs</p>
          <h1 className="text-2xl font-black">Match the words</h1>
        </div>
        <SparrowMascot size="sm" mood="thinking" branded />
      </div>
      
      <div className="flex gap-4">
        {/* Left column */}
        <div className="flex-1 space-y-3">
          {leftItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleLeftClick(item.id)}
              disabled={!!matches[item.id] || isAnswered}
              className={cn(
                'tilio-pressed w-full rounded-[1.2rem] border-2 p-4 text-center font-black transition-all',
                matches[item.id] && 'border-primary bg-primary/10 text-primary',
                selectedLeft === item.id && 'border-primary bg-primary/5',
                !matches[item.id] && selectedLeft !== item.id && 'border-emerald-100 bg-white/85 shadow-sm',
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
                  'tilio-pressed w-full rounded-[1.2rem] border-2 p-4 text-center font-black transition-all',
                  isMatched && 'border-primary bg-primary/10 text-primary opacity-50',
                  wrongMatch === item.id && 'border-destructive bg-destructive/10 animate-shake',
                  !isMatched && wrongMatch !== item.id && 'border-emerald-100 bg-white/85 shadow-sm',
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
