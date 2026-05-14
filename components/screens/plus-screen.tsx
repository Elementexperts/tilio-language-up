'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { SparrowMascot } from '@/components/sparrow-mascot'
import { useAppStore } from '@/lib/store'
import { buildSmartReviewSummary, createSmartReviewLesson, getWeeklyInsightStats, hasTilioPlus, type ReviewWordInsight } from '@/lib/plus'
import { cn } from '@/lib/utils'
import {
  ArrowLeft,
  BarChart3,
  Brain,
  CheckCircle2,
  ChevronRight,
  Crown,
  Dumbbell,
  Flame,
  Headphones,
  Lock,
  MessageCircle,
  Mic,
  RefreshCcw,
  Share2,
  Shuffle,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
} from 'lucide-react'

type PlusTab = 'practice' | 'review' | 'chat' | 'insights'

const tabs: Array<{ id: PlusTab; label: string; icon: React.ReactNode }> = [
  { id: 'practice', label: 'Practice', icon: <Dumbbell className="size-4" /> },
  { id: 'review', label: 'Review', icon: <Brain className="size-4" /> },
  { id: 'chat', label: 'Chat', icon: <MessageCircle className="size-4" /> },
  { id: 'insights', label: 'Insights', icon: <BarChart3 className="size-4" /> },
]

export function PlusScreen() {
  const [activeTab, setActiveTab] = useState<PlusTab>('practice')
  const user = useAppStore((state) => state.user)
  const setScreen = useAppStore((state) => state.setScreen)
  const startLesson = useAppStore((state) => state.startLesson)
  const plusActive = hasTilioPlus(user)
  const summary = useMemo(() => buildSmartReviewSummary(user), [user])
  const weeklyStats = useMemo(() => getWeeklyInsightStats(user, summary), [summary, user])

  const startSmartReview = () => {
    if (!user || !plusActive) return
    const lesson = createSmartReviewLesson(user, summary)
    if (lesson) startLesson(lesson)
  }

  if (!user) return null

  return (
    <div className="tilio-shell flex flex-col">
      <header className="sticky top-0 z-20 safe-area-top">
        <div className="tilio-container px-4 pt-3">
          <div className="flex items-center gap-3 rounded-[1.6rem] border border-white/70 bg-white/78 p-2 shadow-lg shadow-emerald-950/5 backdrop-blur-xl">
            <button className="tilio-pressed flex size-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-950" onClick={() => setScreen('home')}>
              <ArrowLeft className="size-5" />
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-primary">Tilio Plus</p>
              <h1 className="truncate text-xl font-black">Personal language coach</h1>
            </div>
            <div className={cn('flex size-11 items-center justify-center rounded-2xl shadow-lg', plusActive ? 'bg-gradient-to-br from-amber-200 to-lime-300 text-emerald-950 shadow-lime-300/20' : 'bg-emerald-950 text-lime-200')}>
              <Crown className="size-5" />
            </div>
          </div>
        </div>
      </header>

      <main className="tilio-container flex-1 overflow-y-auto px-4 pb-8 pt-4">
        <section className="relative overflow-hidden rounded-[2rem] border border-lime-200/70 bg-gradient-to-br from-emerald-950 via-emerald-800 to-lime-600 p-5 text-white shadow-2xl shadow-emerald-950/20">
          <div className="absolute -right-8 -top-8 size-36 rounded-full bg-lime-200/25 blur-2xl" />
          <div className="absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-white/12 to-transparent" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="min-w-0 flex-1">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/12 px-3 py-1.5 text-xs font-black text-lime-50 backdrop-blur">
                <Sparkles className="size-4 text-lime-200" />
                {plusActive ? 'Plus active' : 'Premium preview'}
              </div>
              <h2 className="text-3xl font-black leading-tight">Mashqlar aqlliroq. Natija tezroq.</h2>
              <p className="mt-2 text-sm font-semibold leading-5 text-white/78">{summary.recommendation}</p>
            </div>
            <SparrowMascot branded mood="celebrating" size="lg" className="shrink-0 rounded-[1.6rem]" />
          </div>
          {!plusActive && (
            <Button className="relative z-10 mt-5 h-12 w-full rounded-2xl bg-white text-emerald-950 hover:bg-lime-50" onClick={() => setScreen('store')}>
              <Crown className="size-5" />
              Unlock Tilio Plus
            </Button>
          )}
        </section>

        <section className="sticky top-[5.2rem] z-10 -mx-1 mt-4 rounded-[1.4rem] border border-white/60 bg-white/78 p-1 shadow-lg shadow-emerald-950/5 backdrop-blur-xl">
          <div className="grid grid-cols-4 gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'tilio-pressed flex min-w-0 flex-col items-center gap-1 rounded-[1.1rem] px-1.5 py-2 text-[11px] font-black transition-colors',
                  activeTab === tab.id ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-emerald-950/62 hover:bg-emerald-50',
                )}
              >
                {tab.icon}
                <span className="truncate">{tab.label}</span>
              </button>
            ))}
          </div>
        </section>

        {activeTab === 'practice' && <PracticeTab plusActive={plusActive} dueCount={summary.dueWords.length} weakCount={summary.weakWords.length} onStartReview={startSmartReview} />}
        {activeTab === 'review' && <ReviewTab plusActive={plusActive} summary={summary} onStartReview={startSmartReview} />}
        {activeTab === 'chat' && <ChatTab plusActive={plusActive} />}
        {activeTab === 'insights' && <InsightsTab plusActive={plusActive} stats={weeklyStats} recommendation={summary.recommendation} />}
      </main>
    </div>
  )
}

function PracticeTab({ plusActive, dueCount, weakCount, onStartReview }: { plusActive: boolean; dueCount: number; weakCount: number; onStartReview: () => void }) {
  return (
    <section className="mt-4 space-y-3">
      <PracticeCard icon={<Target className="size-6" />} title="Mistake Practice" detail={`${weakCount} weak words ready`} tone="orange" locked={!plusActive} onClick={onStartReview} />
      <PracticeCard icon={<Headphones className="size-6" />} title="Listening Practice" detail="Audio-first drills with repeat mode" locked={!plusActive} />
      <PracticeCard icon={<Mic className="size-6" />} title="Speaking Practice" detail="Pronunciation attempts and score ring" locked={!plusActive} />
      <PracticeCard icon={<Shuffle className="size-6" />} title="Mixed Practice" detail={`${dueCount} due words can join a focus workout`} locked={!plusActive} onClick={onStartReview} />
      <PracticeCard icon={<Timer className="size-6" />} title="Timed Challenge" detail="Speed rounds, combos, XP multipliers" locked tone="gold" />
    </section>
  )
}

function ReviewTab({ plusActive, summary, onStartReview }: { plusActive: boolean; summary: ReturnType<typeof buildSmartReviewSummary>; onStartReview: () => void }) {
  return (
    <section className="mt-4 space-y-4">
      <div className="premium-card rounded-[1.75rem] p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
            <Brain className="size-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">Smart Review Ready</p>
            <h2 className="text-xl font-black">{summary.reviewQueue.length} words in queue</h2>
            <p className="text-sm font-semibold text-muted-foreground">Estimated {summary.estimatedMinutes} minutes</p>
          </div>
        </div>
        <Button disabled={!plusActive || summary.reviewQueue.length === 0} onClick={onStartReview} className="tilio-button mt-4 h-12 w-full rounded-2xl">
          <RefreshCcw className="size-5" />
          Start Smart Review
        </Button>
        {!plusActive && <LockedHint />}
      </div>

      <InsightList title="Weak Words" icon={<Flame className="size-5 text-orange-500" />} items={summary.weakWords.slice(0, 5)} empty="No weak words yet. Complete a lesson to unlock this." />
      <InsightList title="Recently Missed" icon={<Target className="size-5 text-red-500" />} items={summary.recentlyMissed.slice(0, 5)} empty="Recent mistakes will appear here." />
      <InsightList title="Almost Mastered" icon={<CheckCircle2 className="size-5 text-primary" />} items={summary.almostMastered.slice(0, 5)} empty="Keep practicing to move words into mastery." />
    </section>
  )
}

function ChatTab({ plusActive }: { plusActive: boolean }) {
  const scenarios = ['Greetings', 'Cafe', 'Travel', 'Shopping', 'School']

  return (
    <section className="mt-4 space-y-3">
      <div className="premium-card rounded-[1.75rem] p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-950 text-lime-200">
            <MessageCircle className="size-6" />
          </div>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">AI Conversation</p>
            <h2 className="text-xl font-black">Guided roleplay tutor</h2>
          </div>
        </div>
        <p className="mt-3 text-sm font-semibold text-muted-foreground">Beginner-safe conversations with short replies, corrections, and better phrase suggestions.</p>
        {!plusActive && <LockedHint />}
      </div>
      {scenarios.map((scenario) => (
        <button key={scenario} className="tilio-pressed flex w-full items-center gap-3 rounded-[1.4rem] border border-white/70 bg-white/78 p-4 text-left shadow-lg shadow-emerald-950/5">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            {plusActive ? <MessageCircle className="size-5" /> : <Lock className="size-5" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-black">{scenario}</p>
            <p className="text-xs font-semibold text-muted-foreground">Correction after every answer</p>
          </div>
          <ChevronRight className="size-5 text-muted-foreground" />
        </button>
      ))}
    </section>
  )
}

function InsightsTab({ plusActive, stats, recommendation }: { plusActive: boolean; stats: Array<{ label: string; value: number; helper: string }>; recommendation: string }) {
  const shareText = `Tilio weekly progress: ${stats.map((stat) => `${stat.value} ${stat.label}`).join(', ')}. ${recommendation}`

  const shareProgress = async () => {
    if (typeof window === 'undefined') return
    const nav = window.navigator as Navigator & { share?: (data: ShareData) => Promise<void> }
    if (nav.share) {
      await nav.share({ title: 'Tilio progress', text: shareText })
      return
    }
    await nav.clipboard?.writeText(shareText)
  }

  return (
    <section className="mt-4 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-[1.45rem] border border-white/70 bg-white/78 p-4 shadow-lg shadow-emerald-950/5">
            <p className="text-2xl font-black text-emerald-950">{stat.value}</p>
            <p className="font-black">{stat.label}</p>
            <p className="text-xs font-semibold text-muted-foreground">{stat.helper}</p>
          </div>
        ))}
      </div>
      <div className="relative overflow-hidden rounded-[1.75rem] border border-lime-200 bg-gradient-to-br from-lime-50 via-white to-emerald-50 p-4 shadow-xl shadow-emerald-950/8">
        <div className="absolute -right-5 -top-5 size-24 rounded-full bg-lime-200/40 blur-2xl" />
        <div className="relative z-10 flex items-start gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-white">
            <TrendingUp className="size-6" />
          </div>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">Next week target</p>
            <h2 className="text-lg font-black">Personal recommendation</h2>
            <p className="mt-1 text-sm font-semibold text-muted-foreground">{recommendation}</p>
          </div>
        </div>
      </div>
      <Button disabled={!plusActive} onClick={shareProgress} className="tilio-button h-12 w-full rounded-2xl">
        <Share2 className="size-5" />
        Share weekly progress
      </Button>
      {!plusActive && <LockedHint />}
    </section>
  )
}

function PracticeCard({ icon, title, detail, locked, tone = 'green', onClick }: { icon: React.ReactNode; title: string; detail: string; locked?: boolean; tone?: 'green' | 'orange' | 'gold'; onClick?: () => void }) {
  return (
    <button
      disabled={locked && !onClick}
      onClick={locked ? undefined : onClick}
      className={cn(
        'tilio-pressed relative flex w-full items-center gap-4 overflow-hidden rounded-[1.6rem] border bg-white/80 p-4 text-left shadow-lg shadow-emerald-950/5',
        tone === 'orange' ? 'border-orange-200' : tone === 'gold' ? 'border-amber-200' : 'border-primary/15',
      )}
    >
      <div className={cn('flex size-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg', tone === 'orange' ? 'bg-gradient-to-br from-orange-400 to-red-500 shadow-orange-300/20' : tone === 'gold' ? 'bg-gradient-to-br from-amber-300 to-lime-400 text-emerald-950 shadow-lime-300/20' : 'bg-gradient-to-br from-primary to-emerald-700 shadow-primary/20')}>
        {icon}
      </div>
      <div className={cn('min-w-0 flex-1', locked && 'blur-[1.5px]')}>
        <p className="font-black">{title}</p>
        <p className="text-sm font-semibold text-muted-foreground">{detail}</p>
      </div>
      {locked ? <Lock className="size-5 text-muted-foreground" /> : <ChevronRight className="size-5 text-muted-foreground" />}
    </button>
  )
}

function InsightList({ title, icon, items, empty }: { title: string; icon: React.ReactNode; items: ReviewWordInsight[]; empty: string }) {
  return (
    <div className="rounded-[1.75rem] border border-white/70 bg-white/78 p-4 shadow-lg shadow-emerald-950/5">
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <h3 className="font-black">{title}</h3>
      </div>
      {items.length === 0 ? (
        <p className="text-sm font-semibold text-muted-foreground">{empty}</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.word.id} className="flex items-center gap-3 rounded-2xl bg-emerald-50/70 p-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-black">{item.word.english}</p>
                <p className="truncate text-xs font-semibold text-muted-foreground">{item.word.uzbek}</p>
              </div>
              <div className="w-24">
                <Progress value={Math.round(item.accuracy * 100)} className="h-2" />
                <p className="mt-1 text-right text-[10px] font-black text-muted-foreground">{Math.round(item.accuracy * 100)}%</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function LockedHint() {
  return (
    <div className="mt-3 flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800">
      <Lock className="size-4" />
      Free users can preview this. Tilio Plus unlocks the full coach.
    </div>
  )
}
