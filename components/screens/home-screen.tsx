'use client'

import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { SparrowMascot } from '@/components/sparrow-mascot'
import { LessonMap } from '@/components/lesson-map'
import { useAppStore } from '@/lib/store'
import { useTelegram } from '@/hooks/use-telegram'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { getCourseOption, getLessonsForCourse, getNextLesson } from '@/lib/data/lessons'
import { buildSmartReviewSummary, createSmartReviewLesson, hasTilioPlus } from '@/lib/plus'
import { getXpProgress, getXpToNextLevel } from '@/lib/types'
import { cn } from '@/lib/utils'
import { ArrowRight, BookOpen, CheckCircle2, ChevronRight, Clock3, Flame, Feather, Gift, Headphones, Home, Medal, Mic, Play, ShoppingBag, Sparkles, Target, Trophy, UserRound, Users, Zap } from 'lucide-react'

export function HomeScreen() {
  const user = useAppStore((state) => state.user)
  const dailyChallenges = useAppStore((state) => state.dailyChallenges)
  const setScreen = useAppStore((state) => state.setScreen)
  const startLesson = useAppStore((state) => state.startLesson)
  const canClaimChest = useAppStore((state) => state.canClaimChest)
  const { hapticFeedback } = useTelegram()
  const hasMounted = useHasMounted()

  const selectedCourse = user?.selectedCourse ?? user?.learningPath ?? 'uz-en'
  const activeCourse = getCourseOption(selectedCourse)
  const courseLessons = getLessonsForCourse(selectedCourse)
  const courseCompletedLessons = user?.courseProgress?.[selectedCourse]?.completedLessons ?? user?.completedLessons ?? []
  const completedCount = courseCompletedLessons.length
  const totalLessons = courseLessons.length
  const progressPercent = (completedCount / totalLessons) * 100

  const activeChallenge = useMemo(() => {
    if (!hasMounted) return undefined
    const today = new Date().toISOString().split('T')[0]
    return dailyChallenges.find((c) => c.date === today && !c.completed)
  }, [dailyChallenges, hasMounted])

  const nextLesson = useMemo(() => {
    if (!user) return null
    return getNextLesson(courseCompletedLessons, selectedCourse) ?? courseLessons[0]
  }, [courseCompletedLessons, courseLessons, selectedCourse, user])

  const motivationalMessage = useMemo(() => {
    if (!user) return ''
    if (user.streak >= 30) return 'Afsona darajasidasiz. Keep the flame alive.'
    if (user.streak >= 7) return 'A full week of momentum. Beautiful work.'
    if (user.streak >= 3) return 'You are building a real habit now.'
    return 'One tiny lesson today. A bigger voice tomorrow.'
  }, [user])

  const getGreeting = () => {
    if (!hasMounted) return 'Welcome back'
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  if (!user) return null

  const xpProgress = getXpProgress(user.xp)
  const xpToNext = getXpToNextLevel(user.xp)
  const chestReady = hasMounted ? canClaimChest() : false
  const todayKey = hasMounted ? new Date().toISOString().split('T')[0] : ''
  const todayXpEarned = todayKey ? user.activityLog?.[todayKey]?.xpEarned ?? 0 : 0
  const dailyXpGoal = Math.max(20, user.dailyGoal * 2)
  const dailyGoalProgress = Math.min((todayXpEarned / dailyXpGoal) * 100, 100)
  const dailyGoalComplete = todayXpEarned >= dailyXpGoal
  const avatarSrc = user.photoUrl ?? (user.avatarStyle === 'girl' ? '/avatars/tilio-girl-avatar.png' : '/avatars/tilio-boy-avatar.png')
  const plusActive = hasTilioPlus(user)
  const smartReview = buildSmartReviewSummary(user)
  const skillDashboard = useMemo(() => {
    const completedSet = new Set(courseCompletedLessons)
    const completedLessons = courseLessons.filter((lesson) => completedSet.has(lesson.id))
    const countBySkill = (skill: string) => completedLessons.filter((lesson) => lesson.skillFocus === skill).length
    const totalBySkill = (skill: string) => Math.max(1, courseLessons.filter((lesson) => lesson.skillFocus === skill).length)

    return {
      wordsPercent: Math.round(progressPercent),
      listeningPercent: Math.round((countBySkill('listening') / totalBySkill('listening')) * 100),
      speakingPercent: Math.round((countBySkill('speaking') / totalBySkill('speaking')) * 100),
    }
  }, [courseCompletedLessons, courseLessons, progressPercent])

  const dashboardRecommendation = smartReview.reviewQueue.length > 0
    ? `${smartReview.reviewQueue.length} ta so'z takrorlashga tayyor. ${smartReview.estimatedMinutes} daqiqalik Smart Review qiling.`
    : nextLesson
      ? `Keyingi dars: ${nextLesson.title}. +${nextLesson.xpReward} XP va +${nextLesson.featherReward ?? 5} pat.`
      : 'Kurs yakunlandi. Endi Plus Review orqali bilimni mustahkamlang.'
  const handleSmartReview = () => {
    if (plusActive && smartReview.reviewQueue.length > 0) {
      const lesson = createSmartReviewLesson(user, smartReview)
      if (lesson) {
        hapticFeedback('medium')
        startLesson(lesson)
        return
      }
    }

    hapticFeedback('light')
    setScreen('plus')
  }

  return (
    <div className="tilio-shell flex flex-col">
      <header className="sticky top-0 z-20 safe-area-top">
        <div className="tilio-container px-4 pt-3">
          <div className="flex items-center justify-between rounded-[1.6rem] border border-white/70 bg-white/75 px-3 py-2 shadow-lg shadow-emerald-950/5 backdrop-blur-xl">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 ring-2 ring-white">
                <img src={avatarSrc} alt={user.firstName} className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{getGreeting()}</p>
                <p className="truncate text-base font-black text-foreground">{user.firstName}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <StatPill icon={<Flame className={cn('size-4', user.streak > 0 && 'animate-streak-flame text-orange-500')} />} value={user.streak} onClick={() => setScreen('daily-challenges')} />
              <StatPill icon={<Feather className="size-4 text-emerald-700" />} value={user.feathers} />
            </div>
          </div>
        </div>
      </header>

      <main className="tilio-container flex-1 overflow-y-auto px-4 pb-28 pt-4">
        <section className="premium-hero relative overflow-hidden rounded-[2rem] p-5 shadow-2xl shadow-emerald-900/12">
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/70 to-transparent" />
          <div className="absolute -right-10 top-8 h-44 w-44 rounded-full bg-lime-200/30 blur-3xl" />
          <div className="relative z-10 mb-5 flex items-center justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-4 py-2 shadow-lg shadow-emerald-950/5 backdrop-blur-xl">
              <img src="/images/tilio-logo-1.png" alt="Tilio" className="size-10 rounded-xl object-cover shadow-sm" />
              <div>
                <p className="text-3xl font-black leading-none text-emerald-900">Tilio</p>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-emerald-700/75">Har kuni o's</p>
              </div>
            </div>
          </div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="min-w-0 flex-1">
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/75 px-3 py-1 text-xs font-extrabold text-emerald-800 shadow-sm">
                <Sparkles className="size-3.5 text-accent" />
                {activeCourse.fromFlag} → {activeCourse.toFlag} {activeCourse.badge}
              </div>
              <h1 className="text-3xl font-black leading-[1.02] tracking-normal text-emerald-950">
                {selectedCourse === 'uz-ko' ? 'Koreyscha tingla. O‘qi. So‘zla.' : selectedCourse === 'uz-ru' ? 'Ruscha o‘qi. Tingla. Gapir.' : selectedCourse === 'uz-ar' ? 'Arabcha o‘qi. Eshit. Ayta ol.' : selectedCourse === 'uz-de' ? 'Nemischa tingla. O‘qi. Gapir.' : 'O‘rgan. Mashq qil. So‘zla.'}
              </h1>
              <p className="mt-3 text-sm font-medium leading-5 text-emerald-900/75">{motivationalMessage}</p>
            </div>
            <img src="/images/tilio-logo-1.png" alt="Tilio mascot logo" className="size-28 shrink-0 rounded-[1.6rem] object-cover shadow-2xl shadow-emerald-950/12" />
          </div>
          {nextLesson && (
            <Button
              className="tilio-button relative z-10 mt-5 h-14 w-full rounded-2xl bg-primary text-base font-black hover:bg-primary/95"
              onClick={() => {
                hapticFeedback('medium')
                useAppStore.getState().startLesson(nextLesson)
              }}
            >
              <Play className="size-5 fill-current" />
              Continue Learning
            </Button>
          )}
        </section>

        <section className="mt-4 grid grid-cols-3 gap-3">
          <MetricCard label="Level" value={user.userLevel} icon={<Zap className="size-5" />} />
          <MetricCard label="Streak" value={user.streak} icon={<Flame className="size-5" />} tone="orange" />
          <MetricCard label="Feathers" value={user.feathers} icon={<Feather className="size-5" />} />
        </section>

        <section className="tilio-card mt-4 rounded-[1.75rem] p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">Level {user.userLevel}</p>
              <h2 className="mt-1 text-xl font-black">Your Uzbek voice is growing</h2>
            </div>
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <BookOpen className="size-7" />
            </div>
          </div>
          <div className="mt-4">
            <Progress value={xpProgress} className="tilio-progress h-4 rounded-full bg-emerald-100" />
            <div className="mt-2 flex justify-between text-xs font-bold text-muted-foreground">
              <span>{xpProgress}/100 XP</span>
              <span>{xpToNext} XP to next level</span>
            </div>
          </div>
        </section>

        <section className={cn('premium-card mt-4 rounded-[1.75rem] p-4', dailyGoalComplete && 'animate-reward-glow')}>
          <div className="flex items-start gap-3">
            <div className={cn('flex size-14 shrink-0 items-center justify-center rounded-2xl shadow-lg', dailyGoalComplete ? 'bg-gradient-to-br from-amber-200 to-lime-300 text-emerald-950 shadow-lime-300/20' : 'bg-primary/10 text-primary')}>
              {dailyGoalComplete ? <CheckCircle2 className="size-7" /> : <Target className="size-7" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">Daily goal</p>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-black text-primary">{todayXpEarned}/{dailyXpGoal} XP</span>
              </div>
              <h2 className="mt-1 text-lg font-black">Bugungi maqsad: {dailyXpGoal} XP</h2>
              <p className="mt-1 text-sm font-semibold text-muted-foreground">
                {dailyGoalComplete ? "Maqsad bajarildi. Mukofot ritmi zo'r!" : "Yana ozgina qoldi - streak'ingizni saqlang!"}
              </p>
              <Progress value={dailyGoalProgress} className="tilio-progress mt-3 h-3" />
              <div className="mt-3 flex items-center justify-between gap-3 text-xs font-black">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-amber-700"><Sparkles className="size-3.5" /> +10 XP bonus</span>
                <span className="inline-flex items-center gap-1 text-orange-600"><Flame className="size-3.5" /> Streak reminder</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-4 grid grid-cols-2 gap-3">
          <button
            className={cn('tilio-pressed rounded-[1.5rem] border p-4 text-left shadow-lg shadow-emerald-950/5', chestReady ? 'border-accent/50 bg-amber-50' : 'border-border bg-white/75')}
            onClick={() => {
              hapticFeedback('medium')
              setScreen('daily-chest')
            }}
          >
            <div className="flex size-12 items-center justify-center rounded-2xl bg-white text-accent shadow-sm">
              <Gift className="size-6" />
            </div>
            <p className="mt-3 font-black">Daily Chest</p>
            <p className="text-xs font-semibold text-muted-foreground">{chestReady ? 'Ready to open' : 'Claimed today'}</p>
          </button>
          <button
            className="tilio-pressed rounded-[1.5rem] border border-primary/20 bg-white/75 p-4 text-left shadow-lg shadow-emerald-950/5"
            onClick={() => {
              hapticFeedback('light')
              setScreen('store')
            }}
          >
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
              <ShoppingBag className="size-6" />
            </div>
            <p className="mt-3 font-black">Cosmetics</p>
            <p className="text-xs font-semibold text-muted-foreground">Mascot looks and boosts</p>
          </button>
        </section>

        <button
          className="tilio-pressed mt-4 w-full overflow-hidden rounded-[1.75rem] border border-lime-200/80 bg-gradient-to-br from-emerald-950 via-emerald-800 to-lime-600 p-4 text-left text-white shadow-2xl shadow-emerald-950/16"
          onClick={handleSmartReview}
        >
          <div className="flex items-center gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/14 text-lime-100 shadow-lg shadow-lime-300/10">
              <Sparkles className="size-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-white/12 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-lime-100">
                {plusActive ? 'Plus active' : 'Premium preview'}
              </div>
              <h2 className="text-lg font-black">{smartReview.reviewQueue.length > 0 ? 'Smart Review Ready' : 'Tilio Plus Coach'}</h2>
              <p className="text-sm font-semibold text-white/75">
                {smartReview.reviewQueue.length > 0
                  ? `${smartReview.reviewQueue.length} words, about ${smartReview.estimatedMinutes} min`
                  : smartReview.learnedWordCount > 0
                    ? smartReview.nextReviewLabel
                    : 'Practice, Review, Chat and Insights'}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-lime-50/90">
                <span className="rounded-full bg-white/12 px-2 py-1">{smartReview.dueWords.length} due</span>
                <span className="rounded-full bg-white/12 px-2 py-1">{smartReview.weakWords.length} weak</span>
                <span className="rounded-full bg-white/12 px-2 py-1">{plusActive && smartReview.reviewQueue.length > 0 ? 'Start now' : 'Open Plus'}</span>
              </div>
            </div>
            <ChevronRight className="size-5 text-white/72" />
          </div>
        </button>
        {activeChallenge && (
          <button
            className="premium-card tilio-pressed mt-4 w-full rounded-[1.75rem] p-4 text-left"
            onClick={() => {
              hapticFeedback('light')
              setScreen('daily-challenges')
            }}
          >
            <div className="flex items-center gap-4">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
                <Target className="size-7" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-black">Daily Challenge</p>
                  <p className="shrink-0 text-sm font-black text-primary">+{activeChallenge.xpReward} XP</p>
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  {activeChallenge.type === 'lessons' ? `Complete ${activeChallenge.target} lessons` : `Earn ${activeChallenge.target} XP`}
                </p>
                <Progress value={(activeChallenge.current / activeChallenge.target) * 100} className="tilio-progress mt-3 h-3" />
              </div>
              <ChevronRight className="size-5 text-muted-foreground" />
            </div>
          </button>
        )}

        {nextLesson && (
          <section className="premium-card mt-4 rounded-[1.75rem] p-4">
            <div className="flex items-center gap-3">
              <SparrowMascot size="sm" mood="happy" branded />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted-foreground">Next lesson</p>
                <h2 className="truncate text-lg font-black">{nextLesson.title}</h2>
                <p className="text-sm font-medium text-muted-foreground">{nextLesson.description}</p>
              </div>
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/25">
                <ArrowRight className="size-6" />
              </div>
            </div>
          </section>
        )}

        <section className="premium-card mt-4 overflow-hidden rounded-[1.75rem] p-4">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">Learning dashboard</p>
              <h2 className="mt-1 text-xl font-black leading-tight text-foreground">Bugungi eng yaxshi qadam</h2>
            </div>
            <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">{completedCount}/{totalLessons}</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <LearningShortcut
              icon={<BookOpen className="size-5" />}
              label="So'zlar"
              detail={smartReview.reviewQueue.length > 0 ? `${smartReview.reviewQueue.length} ready` : `${nextLesson?.words.length ?? 0} new`}
              progress={skillDashboard.wordsPercent}
              onClick={handleSmartReview}
            />
            <LearningShortcut
              icon={<Headphones className="size-5" />}
              label="Tingla"
              detail={`${skillDashboard.listeningPercent}% skill`}
              progress={skillDashboard.listeningPercent}
              tone="blue"
              onClick={() => {
                hapticFeedback('light')
                setScreen('plus')
              }}
            />
            <LearningShortcut
              icon={<Mic className="size-5" />}
              label="So'zla"
              detail={`${skillDashboard.speakingPercent}% skill`}
              progress={skillDashboard.speakingPercent}
              tone="gold"
              onClick={() => {
                hapticFeedback('light')
                setScreen('plus')
              }}
            />
          </div>

          <div className="mt-4 rounded-[1.35rem] border border-emerald-100 bg-white/74 p-3 shadow-inner shadow-emerald-950/4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <h3 className="font-black text-foreground">Course Progress</h3>
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-black text-primary">{Math.round(progressPercent)}%</span>
            </div>
            <Progress value={progressPercent} className="tilio-progress h-4" />
            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-foreground">{nextLesson ? nextLesson.title : 'Course complete'}</p>
                <p className="text-xs font-semibold text-muted-foreground">{totalLessons - completedCount} lessons to go</p>
              </div>
              {nextLesson && (
                <Button
                  className="h-10 shrink-0 rounded-2xl px-4 font-black"
                  onClick={() => {
                    hapticFeedback('medium')
                    startLesson(nextLesson)
                  }}
                >
                  Continue
                </Button>
              )}
            </div>
          </div>

          <button
            className="tilio-pressed mt-3 flex w-full items-center gap-3 rounded-[1.35rem] border border-lime-200/80 bg-lime-50/80 p-3 text-left"
            onClick={smartReview.reviewQueue.length > 0 ? handleSmartReview : () => {
              hapticFeedback('medium')
              if (nextLesson) startLesson(nextLesson)
              else setScreen('plus')
            }}
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              {smartReview.reviewQueue.length > 0 ? <Sparkles className="size-5" /> : <Clock3 className="size-5" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-black text-foreground">Smart recommendation</span>
              <span className="block text-xs font-semibold leading-4 text-muted-foreground">{dashboardRecommendation}</span>
            </span>
            <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
          </button>
        </section>

        <section className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">Path</p>
              <h2 className="text-xl font-black">{activeCourse.titleUz}</h2>
            </div>
            <Medal className="size-6 text-accent" />
          </div>
          <LessonMap />
        </section>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 safe-area-bottom">
        <div className="tilio-container px-4 pb-3">
          <div className="grid grid-cols-6 gap-1 rounded-[1.7rem] border border-white/20 bg-emerald-950/92 p-2 text-white shadow-2xl shadow-emerald-950/25 backdrop-blur-xl">
            <NavButton icon={<Home className="size-5" />} label="Learn" active onClick={() => hapticFeedback('light')} />
            <NavButton icon={<Sparkles className="size-5" />} label="Plus" onClick={() => setScreen('plus')} />
            <NavButton icon={<Trophy className="size-5" />} label="Badges" onClick={() => setScreen('achievements')} />
            <NavButton icon={<Users className="size-5" />} label="Invite" onClick={() => setScreen('referral')} />
            <NavButton icon={<ShoppingBag className="size-5" />} label="Store" onClick={() => setScreen('store')} />
            <NavButton icon={<UserRound className="size-5" />} label="Profile" onClick={() => setScreen('profile')} />
          </div>
        </div>
      </nav>
    </div>
  )
}

function StatPill({ icon, value, onClick }: { icon: React.ReactNode; value: number; onClick?: () => void }) {
  const content = (
    <>
      {icon}
      <span className="text-sm font-black">{value}</span>
    </>
  )

  if (!onClick) return <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-2 text-emerald-950">{content}</div>

  return (
    <button className="tilio-pressed flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-2 text-emerald-950" onClick={onClick}>
      {content}
    </button>
  )
}

function MetricCard({ label, value, icon, tone = 'green' }: { label: string; value: number; icon: React.ReactNode; tone?: 'green' | 'orange' }) {
  return (
    <div className={cn('rounded-[1.35rem] border bg-white/78 p-3 text-center shadow-lg shadow-emerald-950/5', tone === 'orange' ? 'border-orange-200 text-orange-600' : 'border-primary/15 text-primary')}>
      <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-2xl bg-current/10">{icon}</div>
      <p className="text-xl font-black text-foreground">{value}</p>
      <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
    </div>
  )
}

function LearningShortcut({ icon, label, detail, progress, tone = 'green', onClick }: { icon: React.ReactNode; label: string; detail: string; progress: number; tone?: 'green' | 'blue' | 'gold'; onClick: () => void }) {
  const toneClass = tone === 'blue'
    ? 'from-sky-300 to-cyan-500 text-sky-950 shadow-sky-400/15'
    : tone === 'gold'
      ? 'from-amber-200 to-yellow-500 text-amber-950 shadow-amber-400/15'
      : 'from-lime-300 to-emerald-500 text-emerald-950 shadow-lime-400/15'

  return (
    <button onClick={onClick} className="tilio-pressed min-w-0 rounded-[1.25rem] border border-white/70 bg-white/70 p-2.5 text-center shadow-lg shadow-emerald-950/5">
      <span className={cn('mx-auto flex size-12 items-center justify-center rounded-full bg-gradient-to-br shadow-lg', toneClass)}>
        {icon}
      </span>
      <span className="mt-2 block truncate text-xs font-black text-foreground">{label}</span>
      <span className="mt-0.5 block truncate text-[10px] font-extrabold text-muted-foreground">{detail}</span>
      <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-emerald-950/10">
        <span className="block h-full rounded-full bg-primary" style={{ width: `${Math.min(progress, 100)}%` }} />
      </span>
    </button>
  )
}

function NavButton({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'tilio-pressed flex min-w-0 flex-col items-center gap-1 rounded-[1.2rem] px-1.5 py-2 text-[11px] font-black transition-colors',
        active ? 'bg-primary text-primary-foreground shadow-lg shadow-lime-300/20' : 'text-white/72 hover:bg-white/8 hover:text-white',
      )}
    >
      {icon}
      <span className="truncate">{label}</span>
    </button>
  )
}
