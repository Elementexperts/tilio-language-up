'use client'

import { FormEvent, useMemo, useState } from 'react'
import { BookOpen, Brain, ChevronRight, Crown, Feather, Flame, Gift, Home, MessageCircle, Play, RotateCcw, Send, Target, UserRound, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { LessonMap } from '@/components/lesson-map'
import { SparrowMascot } from '@/components/sparrow-mascot'
import { useAppStore } from '@/lib/store'
import { useTelegram } from '@/hooks/use-telegram'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { courseOptions, getCourseOption, getLessonsForCourse, getNextLesson } from '@/lib/data/lessons'
import { buildSmartReviewSummary, createPlusPracticeLesson, getPlusChatMessagesLeft, isPlusActive } from '@/lib/plus'
import { cn } from '@/lib/utils'

const tutorTopics = ['Gapirish', 'Yangi so‘zlar', 'Maktab', 'Sayohat', 'Kafe'] as const

const languageNames = {
  'uz-en': 'Ingliz tili',
  'uz-ko': 'Koreys tili',
  'uz-ru': 'Rus tili',
  'uz-ar': 'Arab tili',
  'uz-de': 'Nemis tili',
} as const

const courseMessages = {
  'uz-en': 'Inglizcha o‘rgan. Mashq qil. Ishonch bilan gapir.',
  'uz-ko': 'Koreyscha tingla. O‘qi. Gapir.',
  'uz-ru': 'Ruscha o‘qi. Tingla. Gapir.',
  'uz-ar': 'Arabcha o‘qi. Tingla. Gapir.',
  'uz-de': 'Nemischa tingla. O‘qi. Gapir.',
} as const

export function HomeScreen() {
  const user = useAppStore((state) => state.user)
  const dailyChallenges = useAppStore((state) => state.dailyChallenges)
  const setScreen = useAppStore((state) => state.setScreen)
  const setSelectedCourse = useAppStore((state) => state.setSelectedCourse)
  const launchTutor = useAppStore((state) => state.launchTutor)
  const startLesson = useAppStore((state) => state.startLesson)
  const canClaimChest = useAppStore((state) => state.canClaimChest)
  const [tutorPrompt, setTutorPrompt] = useState('')
  const { hapticFeedback } = useTelegram()
  const hasMounted = useHasMounted()

  const selectedCourse = user?.selectedCourse ?? 'uz-en'
  const activeCourse = getCourseOption(selectedCourse)
  const lessons = getLessonsForCourse(selectedCourse)
  const completedLessons = user?.courseProgress?.[selectedCourse]?.completedLessons ?? user?.completedLessons ?? []
  const nextLesson = useMemo(() => user ? getNextLesson(completedLessons, selectedCourse) ?? lessons[0] : null, [completedLessons, lessons, selectedCourse, user])
  const reviewSummary = useMemo(() => buildSmartReviewSummary(user), [user])
  const activeChallenge = useMemo(() => {
    if (!hasMounted) return undefined
    const today = new Date().toISOString().split('T')[0]
    return dailyChallenges.find((challenge) => challenge.date === today && !challenge.completed)
  }, [dailyChallenges, hasMounted])

  if (!user) return null

  const progressPercent = lessons.length ? (completedLessons.length / lessons.length) * 100 : 0
  const avatarSrc = user.photoUrl ?? (user.avatarStyle === 'girl' ? '/avatars/tilio-girl-avatar.png' : '/avatars/tilio-boy-avatar.png')
  const plusActive = isPlusActive(user)
  const messagesLeft = getPlusChatMessagesLeft(user)
  const chestReady = hasMounted ? canClaimChest() : false

  const greeting = (() => {
    if (!hasMounted) return 'Xush kelibsiz'
    const hour = new Date().getHours()
    if (hour < 12) return 'Xayrli tong'
    if (hour < 18) return 'Xayrli kun'
    return 'Xayrli kech'
  })()

  const openTutor = (prompt: string) => {
    hapticFeedback('light')
    launchTutor(prompt)
  }

  const submitTutor = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (tutorPrompt.trim()) openTutor(tutorPrompt)
  }

  const startReview = () => {
    const lesson = createPlusPracticeLesson(user, reviewSummary, 'smart-review')
    if (lesson) {
      hapticFeedback('medium')
      startLesson(lesson)
    }
  }

  return (
    <div className="tilio-shell flex flex-col">
      <header className="sticky top-0 z-20 safe-area-top">
        <div className="tilio-container px-4 pt-3">
          <div className="flex items-center justify-between rounded-[1.6rem] border border-white/70 bg-white/80 px-3 py-2 shadow-lg shadow-emerald-950/5 backdrop-blur-xl">
            <div className="flex min-w-0 items-center gap-3">
              <img src={avatarSrc} alt="" className="size-11 shrink-0 rounded-2xl bg-primary/10 object-cover ring-2 ring-white" />
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{greeting}</p>
                <p className="truncate text-base font-black">{user.firstName}</p>
              </div>
            </div>
            <button onClick={() => setScreen('profile')} className="tilio-pressed flex size-11 items-center justify-center rounded-2xl bg-emerald-50 text-primary" aria-label="Profilni ochish">
              <UserRound className="size-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="tilio-container flex-1 overflow-y-auto px-4 pb-28 pt-4">
        <section className="relative overflow-hidden rounded-[2rem] border border-emerald-200/70 bg-gradient-to-br from-emerald-950 via-emerald-800 to-primary p-5 text-white shadow-2xl shadow-emerald-950/15">
          <div className="absolute -right-10 -top-10 size-40 rounded-full bg-lime-300/15 blur-xl" />
          <div className="relative flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-lime-200">Tilio Tutor</p>
              <h1 className="mt-1 text-2xl font-black leading-tight">Bugun nimani o‘rganmoqchisiz?</h1>
              <p className="mt-2 text-sm font-semibold leading-5 text-white/75">Tilio Tutor bilan savol bering yoki bir mavzuni mashq qiling.</p>
            </div>
            <SparrowMascot branded size="sm" mood="encouraging" className="shrink-0 ring-2 ring-white/20" />
          </div>
          <form onSubmit={submitTutor} className="relative mt-4 flex items-center gap-2 rounded-2xl bg-white p-2 shadow-xl">
            <label htmlFor="home-tutor-prompt" className="sr-only">Tilio Tutor mavzusi</label>
            <input id="home-tutor-prompt" value={tutorPrompt} onChange={(event) => setTutorPrompt(event.target.value)} placeholder="Masalan: ingliz tilida o‘zimni tanishtirish..." className="h-12 min-w-0 flex-1 rounded-xl px-3 text-sm font-semibold text-emerald-950 outline-none focus-visible:ring-2 focus-visible:ring-primary" />
            <Button type="submit" disabled={!tutorPrompt.trim()} className="size-12 shrink-0 rounded-xl px-0" aria-label="Tutor’ga yuborish"><Send className="size-5" /></Button>
          </form>
          <div className="relative mt-3 flex gap-2 overflow-x-auto pb-1">
            {tutorTopics.map((topic) => <button key={topic} type="button" onClick={() => openTutor(topic)} className="tilio-pressed min-h-11 shrink-0 rounded-full border border-white/20 bg-white/12 px-4 text-sm font-black text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-200">{topic}</button>)}
          </div>
          <p className="relative mt-3 text-xs font-bold text-lime-100">{plusActive ? 'Plus: kengaytirilgan Tutor mashqlari' : `Bugun ${messagesLeft} ta bepul xabar qoldi`}</p>
        </section>

        {nextLesson ? (
          <section className="tilio-card mt-4 rounded-[1.75rem] p-4">
            <div className="flex items-center gap-3"><div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><BookOpen className="size-6" /></div><div className="min-w-0 flex-1"><p className="text-xs font-black uppercase tracking-[0.14em] text-primary">Darsni davom ettirish</p><h2 className="truncate text-lg font-black">{nextLesson.titleUz || nextLesson.title}</h2><p className="truncate text-sm text-muted-foreground">{courseMessages[selectedCourse]}</p></div></div>
            <Button className="tilio-button mt-4 h-12 w-full rounded-2xl font-black" onClick={() => startLesson(nextLesson)}><Play className="size-5 fill-current" />Davom ettirish</Button>
          </section>
        ) : null}

        <section className="mt-4 grid grid-cols-4 gap-2" aria-label="Bugungi natijalar">
          <CompactMetric icon={<Zap className="size-4" />} label="XP" value={user.xp} />
          <CompactMetric icon={<Flame className="size-4" />} label="Kun" value={user.streak} />
          <CompactMetric icon={<Feather className="size-4" />} label="Pat" value={user.feathers} />
          <CompactMetric icon={<Target className="size-4" />} label="Maqsad" value={`${user.dailyGoal}m`} />
        </section>

        <button type="button" disabled={reviewSummary.reviewQueue.length === 0} onClick={startReview} className="tilio-pressed mt-4 flex min-h-24 w-full items-center gap-4 rounded-[1.75rem] border border-sky-200 bg-gradient-to-br from-white to-sky-50 p-4 text-left shadow-xl shadow-emerald-950/5 disabled:opacity-75">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-700"><RotateCcw className="size-7" /></div>
          <div className="min-w-0 flex-1"><p className="text-xs font-black uppercase tracking-[0.14em] text-sky-700">Aqlli takrorlash</p><h2 className="font-black">{reviewSummary.reviewQueue.length ? 'Bugungi takrorlash tayyor' : 'Hozircha hammasi joyida'}</h2><p className="text-sm font-semibold text-muted-foreground">{reviewSummary.reviewQueue.length ? `${reviewSummary.reviewQueue.length} ta so‘z sizni kutmoqda.` : 'Yangi so‘zlar uchun darslarni davom ettiring.'}</p></div>
          <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
        </button>

        <section className="tilio-card mt-4 rounded-[1.75rem] p-4">
          <div className="mb-3"><p className="text-xs font-black uppercase tracking-[0.14em] text-primary">Tilni tanlang</p><h2 className="text-lg font-black">{languageNames[selectedCourse]}</h2></div>
          <div className="grid grid-cols-5 gap-2">
            {courseOptions.map((course) => <button key={course.id} type="button" onClick={() => setSelectedCourse(course.id)} aria-label={languageNames[course.id]} aria-pressed={course.id === selectedCourse} className={cn('tilio-pressed min-h-16 rounded-2xl border px-1 py-2 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary', course.id === selectedCourse ? 'border-primary bg-primary text-white' : 'border-emerald-100 bg-white')}><span className="block text-xl">{course.toFlag}</span><span className="mt-1 block text-[10px] font-black">{course.badge}</span></button>)}
          </div>
          <p className="mt-3 text-sm font-semibold text-muted-foreground">{activeCourse.descriptionUz}</p>
        </section>

        <section className="mt-4 grid grid-cols-2 gap-3">
          <button onClick={() => setScreen('daily-challenges')} className="tilio-pressed rounded-[1.5rem] border border-primary/15 bg-white/80 p-4 text-left"><Target className="size-6 text-primary" /><p className="mt-3 font-black">Bugungi vazifa</p><p className="text-xs font-semibold text-muted-foreground">{activeChallenge ? `${activeChallenge.current}/${activeChallenge.target} · +${activeChallenge.xpReward} XP` : 'Bugungi vazifalar bajarildi'}</p>{activeChallenge ? <Progress value={(activeChallenge.current / activeChallenge.target) * 100} className="mt-2 h-2" /> : null}</button>
          <button onClick={() => setScreen('daily-chest')} className="tilio-pressed rounded-[1.5rem] border border-amber-200 bg-amber-50/80 p-4 text-left"><Gift className="size-6 text-amber-600" /><p className="mt-3 font-black">Kunlik sovg‘a</p><p className="text-xs font-semibold text-muted-foreground">{chestReady ? 'Ochishga tayyor' : 'Bugun olindi'}</p></button>
        </section>

        <section className="tilio-card mt-4 rounded-[1.75rem] p-4"><div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-[0.14em] text-primary">Kursdagi natija</p><h2 className="font-black">{completedLessons.length}/{lessons.length} ta dars</h2></div><span className="text-sm font-black text-primary">{Math.round(progressPercent)}%</span></div><Progress value={progressPercent} className="mt-3 h-3" /></section>

        <section className="mt-6"><div className="mb-4"><p className="text-xs font-black uppercase tracking-[0.14em] text-primary">Darslar</p><h2 className="text-xl font-black">O‘rganish yo‘lingiz</h2></div><LessonMap /></section>

        <button onClick={() => setScreen(plusActive ? 'plus' : 'upgrade')} className="tilio-pressed mt-5 flex w-full items-center gap-4 rounded-[1.75rem] border border-amber-200 bg-gradient-to-br from-white to-amber-50 p-4 text-left"><Crown className="size-8 shrink-0 text-amber-600" /><div className="min-w-0 flex-1"><p className="font-black">Tilio Plus</p><p className="text-sm font-semibold text-muted-foreground">Ko‘proq AI Tutor, ilg‘or mashqlar, kuchli Smart Review va Insights.</p></div><ChevronRight className="size-5" /></button>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 safe-area-bottom"><div className="tilio-container px-4 pb-3"><div className="grid grid-cols-4 gap-1 rounded-[1.7rem] border border-white/70 bg-white/90 p-2 shadow-2xl backdrop-blur-xl"><NavButton icon={<Home className="size-5" />} label="O‘rganish" active onClick={() => undefined} /><NavButton icon={<MessageCircle className="size-5" />} label="Tutor" onClick={() => launchTutor()} /><NavButton icon={<Brain className="size-5" />} label="Takrorlash" onClick={reviewSummary.reviewQueue.length ? startReview : () => setScreen('plus')} /><NavButton icon={<UserRound className="size-5" />} label="Profil" onClick={() => setScreen('profile')} /></div></div></nav>
    </div>
  )
}

function CompactMetric({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return <div className="rounded-2xl border border-emerald-100 bg-white/80 p-2 text-center shadow-sm"><div className="mx-auto flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">{icon}</div><p className="mt-1 text-sm font-black">{value}</p><p className="text-[9px] font-black uppercase tracking-wide text-muted-foreground">{label}</p></div>
}

function NavButton({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick: () => void }) {
  return <button onClick={onClick} className={cn('tilio-pressed flex min-h-14 flex-col items-center justify-center gap-1 rounded-[1.2rem] text-[11px] font-black', active ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-primary/5')}>{icon}<span>{label}</span></button>
}
