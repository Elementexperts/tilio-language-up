'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { SparrowMascot } from '@/components/sparrow-mascot'
import { Progress } from '@/components/ui/progress'
import { useAppStore } from '@/lib/store'
import { buildSmartReviewSummary, createPlusPracticeLesson, getPlusPracticeReward, getPlusPracticeWordCount, getWeeklyInsightStats, hasTilioPlus, type PlusPracticeMode, type ReviewWordInsight, type SmartReviewSummary, type WeeklyInsightSummary } from '@/lib/plus'
import { cn } from '@/lib/utils'
import {
  ArrowLeft,
  Award,
  BarChart3,
  BookOpen,
  Brain,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Crown,
  Dumbbell,
  Flame,
  Gauge,
  Headphones,
  Lock,
  MessageCircle,
  Mic,
  RefreshCcw,
  Send,
  Share2,
  ShieldCheck,
  Shuffle,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
  Trophy,
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

  const startPractice = (practiceMode: PlusPracticeMode) => {
    if (!user || !plusActive) return
    const lesson = createPlusPracticeLesson(user, summary, practiceMode)
    if (lesson) {
      startLesson(lesson)
      return
    }
    setActiveTab('review')
  }
  if (!user) return null

  return (
    <div className="tilio-shell tilio-shell-premium flex flex-col">
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
        <section className="plus-hero-card relative overflow-hidden rounded-[2rem] p-5 text-white">
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
              <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-black uppercase tracking-[0.12em] text-lime-50/90">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/12 px-2.5 py-1"><Clock3 className="size-3.5" /> {summary.nextReviewLabel}</span>
                <span className="rounded-full bg-white/12 px-2.5 py-1">{summary.learnedWordCount} learned</span>
                <span className="rounded-full bg-white/12 px-2.5 py-1">{summary.reviewQueue.length} ready</span>
              </div>
            </div>
            <img src="/images/tilio-logo-1.png" alt="Tilio Plus logo" className="size-28 shrink-0 rounded-[1.6rem] object-cover shadow-2xl shadow-lime-300/20 ring-1 ring-white/25" />
          </div>
          {!plusActive && (
            <Button className="relative z-10 mt-5 h-12 w-full rounded-2xl bg-white text-emerald-950 hover:bg-lime-50" onClick={() => setScreen('upgrade')}>
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

        {activeTab === 'practice' && <PracticeTab plusActive={plusActive} summary={summary} onStartPractice={startPractice} />}
        {activeTab === 'review' && <ReviewTab plusActive={plusActive} summary={summary} onStartReview={() => startPractice('smart-review')} />}
        {activeTab === 'chat' && <ChatTab plusActive={plusActive} />}
        {activeTab === 'insights' && <InsightsTab plusActive={plusActive} insights={weeklyStats} />}
      </main>
    </div>
  )
}

function PracticeTab({ plusActive, summary, onStartPractice }: { plusActive: boolean; summary: SmartReviewSummary; onStartPractice: (practiceMode: PlusPracticeMode) => void }) {
  const mistakeCount = getPlusPracticeWordCount(summary, 'mistake')
  const listeningCount = getPlusPracticeWordCount(summary, 'listening')
  const speakingCount = getPlusPracticeWordCount(summary, 'speaking')
  const mixedCount = getPlusPracticeWordCount(summary, 'mixed')
  const mistakeReward = getPlusPracticeReward(summary, 'mistake')
  const listeningReward = getPlusPracticeReward(summary, 'listening')
  const speakingReward = getPlusPracticeReward(summary, 'speaking')
  const mixedReward = getPlusPracticeReward(summary, 'mixed')

  return (
    <section className="mt-4 space-y-3">
      <PracticeCard
        icon={<Target className="size-6" />}
        title="Mistake Practice"
        detail={mistakeCount > 0 ? 'Repair missed and weak words first' : 'Uses mistakes as soon as they appear'}
        badge={mistakeCount > 0 ? String(mistakeCount) + ' words' : 'No misses yet'}
        reward={'+' + mistakeReward.xp + ' XP'}
        tone="orange"
        locked={!plusActive}
        disabled={plusActive && mistakeCount === 0}
        onClick={() => onStartPractice('mistake')}
      />
      <PracticeCard
        icon={<Headphones className="size-6" />}
        title="Listening Practice"
        detail={listeningCount > 0 ? 'Sentence audio, repeat, and recognition' : 'Needs example sentences from completed lessons'}
        badge={listeningCount > 0 ? String(listeningCount) + ' audio drills' : 'Building'}
        reward={'+' + listeningReward.xp + ' XP'}
        locked={!plusActive}
        disabled={plusActive && listeningCount === 0}
        onClick={() => onStartPractice('listening')}
      />
      <PracticeCard
        icon={<Mic className="size-6" />}
        title="Speaking Practice"
        detail={speakingCount > 0 ? 'Microphone attempts with score rings' : 'Needs speakable phrases'}
        badge={speakingCount > 0 ? String(speakingCount) + ' phrases' : 'Building'}
        reward={'+' + speakingReward.xp + ' XP'}
        locked={!plusActive}
        disabled={plusActive && speakingCount === 0}
        onClick={() => onStartPractice('speaking')}
      />
      <PracticeCard
        icon={<Shuffle className="size-6" />}
        title="Mixed Practice"
        detail={mixedCount > 0 ? 'Listening, grammar, speaking, and translation' : 'Learns from completed lessons'}
        badge={mixedCount > 0 ? String(mixedCount) + ' focus words' : 'Building'}
        reward={'+' + mixedReward.xp + ' XP'}
        locked={!plusActive}
        disabled={plusActive && mixedCount === 0}
        onClick={() => onStartPractice('mixed')}
      />
      <PracticeCard icon={<Timer className="size-6" />} title="Timed Challenge" detail="Speed rounds, combos, XP multipliers" badge="Coming next" locked tone="gold" />
    </section>
  )
}

function ReviewTab({ plusActive, summary, onStartReview }: { plusActive: boolean; summary: SmartReviewSummary; onStartReview: () => void }) {
  const canStart = plusActive && summary.reviewQueue.length > 0

  return (
    <section className="mt-4 space-y-4">
      <div className="premium-card rounded-[1.75rem] p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
            <Brain className="size-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">Bugungi review tayyor</p>
            <h2 className="text-xl font-black">{summary.reviewQueue.length} so'z review navbatida</h2>
            <p className="text-sm font-semibold text-muted-foreground">{summary.nextReviewLabel} · Estimated {summary.estimatedMinutes} min</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <MiniStat label="Due" value={summary.dueWords.length} />
          <MiniStat label="Weak" value={summary.weakWords.length} tone="orange" />
          <MiniStat label="Tracked" value={summary.trackedWordCount} />
        </div>
        <Button disabled={!canStart} onClick={onStartReview} className="tilio-button mt-4 h-12 w-full rounded-2xl">
          <RefreshCcw className="size-5" />
          {plusActive ? summary.reviewQueue.length > 0 ? 'Start Smart Review' : 'Bir nechta darsni yakunlang' : 'Unlock to start'}
        </Button>
        {!plusActive && <LockedHint />}
      </div>

      {summary.reviewQueue.length > 0 ? (
        <ReviewQueueList items={summary.reviewQueue} />
      ) : (
        <ReviewEmptyState readiness={summary.readiness} />
      )}

      <InsightList title="Weak words" icon={<Flame className="size-5 text-orange-500" />} items={summary.weakWords.slice(0, 5)} empty="No weak words yet. Mistakes will appear here automatically." />
      <InsightList title="Recently missed" icon={<Target className="size-5 text-red-500" />} items={summary.recentlyMissed.slice(0, 5)} empty="Recent mistakes will appear here." />
      <InsightList title="Almost mastered" icon={<CheckCircle2 className="size-5 text-primary" />} items={summary.almostMastered.slice(0, 5)} empty="Keep practicing to move words into mastery." />
    </section>
  )
}

function ChatTab({ plusActive }: { plusActive: boolean }) {
  const user = useAppStore((state) => state.user)
  const [messages, setMessages] = useState<Array<{ id: string; role: 'user' | 'assistant'; text: string }>>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [retryMessage, setRetryMessage] = useState('')

  const courseId = user?.selectedCourse ?? user?.learningPath ?? 'uz-en'
  const tutorLabel = courseId === 'uz-ko' ? 'Korean tutor' : courseId === 'uz-ru' ? 'Russian tutor' : courseId === 'uz-ar' ? 'Arabic tutor' : courseId === 'uz-de' ? 'German tutor' : 'English tutor'
  const targetLanguage = courseId === 'uz-ko' ? 'koreyscha' : courseId === 'uz-ru' ? 'ruscha' : courseId === 'uz-ar' ? 'arabcha' : courseId === 'uz-de' ? 'nemischa' : 'inglizcha'

  const scenarios = [
    { label: 'Salomlashish', prompt: 'Salomlashishni ' + targetLanguage + ' mashq qilamiz.' },
    { label: 'Kafe', prompt: 'Kafeda buyurtma berishni ' + targetLanguage + ' mashq qilamiz.' },
    { label: 'Sayohat', prompt: 'Sayohat uchun oddiy dialogni ' + targetLanguage + ' mashq qilamiz.' },
    { label: 'Maktab', prompt: 'Maktab haqida oddiy suhbatni ' + targetLanguage + ' mashq qilamiz.' },
    { label: 'Do\u2018kon', prompt: 'Do\u2018konda xarid qilishni ' + targetLanguage + ' mashq qilamiz.' },
  ]

  const createId = () => String(Date.now()) + '-' + Math.random().toString(36).slice(2)

  const sendMessage = async (message: string) => {
    const trimmed = message.trim()
    if (!trimmed || loading) return

    setError('')
    setRetryMessage('')
    setInput('')
    setMessages((prev) => [...prev, { id: createId(), role: 'user', text: trimmed }])
    setLoading(true)

    try {
      const response = await fetch('/api/ai-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed + '\n\nKeep response beginner-friendly and short.',
          courseId,
        }),
      })
      const data = (await response.json().catch(() => ({}))) as { text?: string; error?: string }

      if (!response.ok) {
        throw new Error(data.error || 'AI tutor failed')
      }

      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          role: 'assistant',
          text: data.text?.trim() || 'Hozircha javob yo\u2018q. Yana bir bor urinib ko\u2018ring.',
        },
      ])
    } catch (err) {
      console.error(err)
      setError('Xatolik yuz berdi. Internetni tekshirib qayta urinib ko\u2018ring.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mt-4 space-y-4">
      <div className="premium-card rounded-[1.75rem] p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-950 text-lime-200">
            <MessageCircle className="size-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">AI Conversation</p>
            <h2 className="text-xl font-black">Guided roleplay tutor</h2>
            <p className="mt-0.5 text-[11px] font-black uppercase tracking-[0.14em] text-muted-foreground">{tutorLabel}</p>
          </div>
        </div>
        <p className="mt-3 text-sm font-semibold text-muted-foreground">Tilio Tutor qisqa javob beradi, xatolarni muloyim tuzatadi va tabiiyroq iborani taklif qiladi.</p>
        <div className="mt-4 rounded-2xl border border-lime-200 bg-lime-50 px-4 py-3 text-sm font-semibold text-emerald-950">
          Free: 3 AI xabar / kun. Plus: ko'proq AI mashqlar.
        </div>
        {!plusActive && <LockedHint />}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {scenarios.map((scenario) => (
          <button
            key={scenario.label}
            onClick={() => sendMessage(scenario.prompt)}
            disabled={loading}
            className="tilio-pressed shrink-0 rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm font-black shadow-lg shadow-emerald-950/5 disabled:opacity-50"
          >
            {scenario.label}
          </button>
        ))}
      </div>

      <div className="max-h-[46vh] space-y-3 overflow-y-auto rounded-[1.75rem] border border-white/70 bg-white/80 p-4 shadow-lg shadow-emerald-950/5">
        {messages.length === 0 && (
          <div className="rounded-[1.5rem] bg-gradient-to-br from-emerald-50 to-lime-50 p-4 text-center text-sm font-semibold text-emerald-950">
            <SparrowMascot size="sm" mood="encouraging" branded className="mx-auto mb-3" />
            <h3 className="text-lg font-black">AI tutor bilan mashq qiling</h3>
            <p className="mt-1 text-muted-foreground">Scenario tanlang yoki o'zingiz xabar yozing. Tilio qisqa, sodda va boshlovchilar uchun qulay javob beradi.</p>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div className={cn('max-w-[85%] rounded-[1.4rem] px-4 py-3 text-sm font-semibold leading-6', message.role === 'user' ? 'bg-primary text-white' : 'bg-emerald-50 text-emerald-950')}>
              {message.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-[1.4rem] bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-950">
              Tilio Tutor yozmoqda...
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            <div className="flex items-center justify-between gap-3">
              <span>{error}</span>
              <button type="button" onClick={() => sendMessage(retryMessage)} disabled={!retryMessage || loading} className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-black text-red-600 shadow-sm disabled:opacity-50">Retry</button>
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          sendMessage(input)
        }}
        className="flex items-center gap-2 rounded-[1.6rem] border border-white/70 bg-white/80 p-2 shadow-lg shadow-emerald-950/5"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          placeholder="Xabar yozing..."
          className="h-12 min-w-0 flex-1 rounded-2xl bg-emerald-50 px-4 text-sm font-semibold outline-none"
        />
        <Button type="submit" disabled={!input.trim() || loading} className="h-12 shrink-0 rounded-2xl px-4" aria-label="Send AI message">
          <Send className="size-4" />
          Send
        </Button>
      </form>
    </section>
  )
}

function InsightsTab({ plusActive, insights }: { plusActive: boolean; insights: WeeklyInsightSummary }) {
  const [copied, setCopied] = useState(false)

  const shareProgress = async () => {
    if (typeof window === 'undefined' || !plusActive) return
    const nav = window.navigator as Navigator & { share?: (data: ShareData) => Promise<void> }
    if (nav.share) {
      await nav.share({ title: 'Tilio weekly progress', text: insights.shareText })
      return
    }
    await nav.clipboard?.writeText(insights.shareText)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <section className="mt-4 space-y-4">
      <div className="relative overflow-hidden rounded-[1.9rem] border border-emerald-900/20 bg-gradient-to-br from-emerald-950 via-emerald-800 to-lime-600 p-5 text-white shadow-2xl shadow-emerald-950/18">
        <div className="relative z-10">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-lime-200">Weekly Insights</p>
              <h2 className="mt-1 text-2xl font-black leading-tight">Your progress report</h2>
              <p className="mt-2 text-sm font-semibold text-white/75">
                {insights.hasTrackedWeek ? 'Live learning rhythm from the last 7 days.' : 'Using current progress until new weekly sessions are tracked.'}
              </p>
            </div>
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/12 text-lime-200">
              <BarChart3 className="size-6" />
            </div>
          </div>

          <div className="rounded-[1.35rem] border border-white/15 bg-white/10 p-3">
            <div className="mb-2 flex items-center justify-between gap-3 text-xs font-black uppercase tracking-[0.12em] text-lime-100">
              <span>{insights.courseLabel}</span>
              <span>{insights.progressPercent}% course</span>
            </div>
            <Progress value={insights.progressPercent} className="h-2 bg-white/18" />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <PremiumMiniMetric label="New words" value={insights.wordsLearned} />
            <PremiumMiniMetric label="Reviewed" value={insights.wordsReviewed} />
            <PremiumMiniMetric label="Missed" value={insights.missedWords} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {insights.stats.map((stat) => <WeeklyStatCard key={stat.label} stat={stat} />)}
      </div>

      <div className={cn('rounded-[1.75rem] border border-white/70 bg-white/82 p-4 shadow-lg shadow-emerald-950/5', !plusActive && 'relative overflow-hidden')}>
        <div className={cn(!plusActive && 'blur-[1.5px]')}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-5 text-primary" />
              <h3 className="font-black">7-day rhythm</h3>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-primary">
              {insights.activeDays}/7 active
            </span>
          </div>
          <WeeklyTrendStrip trend={insights.trend} />
        </div>
        {!plusActive && <LockedOverlay />}
      </div>

      <div className="rounded-[1.75rem] border border-white/70 bg-white/82 p-4 shadow-lg shadow-emerald-950/5">
        <div className="mb-4 flex items-center gap-2">
          <Gauge className="size-5 text-primary" />
          <h3 className="font-black">Skill balance</h3>
        </div>
        <WeeklySkillBalanceList skills={insights.skillBalance} locked={!plusActive} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <InsightFocusCard icon={<Trophy className="size-5" />} label="Strongest" value={insights.strongestSkill} tone="gold" />
        <InsightFocusCard icon={<Target className="size-5" />} label="Focus next" value={insights.weakestSkill} tone="green" />
      </div>

      <div className="rounded-[1.75rem] border border-lime-200 bg-gradient-to-br from-lime-50 via-white to-emerald-50 p-4 shadow-xl shadow-emerald-950/8">
        <div className="flex items-start gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-white">
            <TrendingUp className="size-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">Next week target</p>
            <h2 className="text-lg font-black">{insights.nextWeekTarget}</h2>
            <p className="mt-1 text-sm font-semibold text-muted-foreground">{insights.recommendation}</p>
          </div>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-emerald-900/10 bg-white/82 p-4 shadow-lg shadow-emerald-950/5">
        <div className="mb-3 flex items-center gap-2">
          <Award className="size-5 text-amber-500" />
          <h3 className="font-black">Shareable progress</h3>
        </div>
        <div className={cn('rounded-[1.35rem] border border-lime-200 bg-gradient-to-br from-emerald-50 to-lime-50 p-4', !plusActive && 'blur-[1.5px]')}>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">Tilio Weekly</p>
          <p className="mt-2 text-xl font-black text-emerald-950">{insights.xpEarned} XP - {insights.activeDays}/7 active days</p>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">{insights.wordsLearned} new words learned. {insights.nextWeekTarget}.</p>
        </div>
        <Button disabled={!plusActive} onClick={shareProgress} className="tilio-button mt-3 h-12 w-full rounded-2xl">
          <Share2 className="size-5" />
          {copied ? 'Copied progress' : 'Share weekly progress'}
        </Button>
        {!plusActive && <LockedHint />}
      </div>
    </section>
  )
}

function PremiumMiniMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-3 text-center">
      <p className="text-xl font-black">{value}</p>
      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/70">{label}</p>
    </div>
  )
}

function WeeklyStatCard({ stat }: { stat: WeeklyInsightSummary['stats'][number] }) {
  return (
    <div className={cn('rounded-[1.45rem] border p-4 shadow-lg shadow-emerald-950/5', getWeeklyStatTone(stat.tone))}>
      <p className="text-2xl font-black text-emerald-950">{stat.value}{stat.suffix ?? ''}</p>
      <p className="font-black">{stat.label}</p>
      <p className="text-xs font-semibold text-muted-foreground">{stat.helper}</p>
    </div>
  )
}

function WeeklyTrendStrip({ trend }: { trend: WeeklyInsightSummary['trend'] }) {
  return (
    <div className="grid grid-cols-7 gap-2">
      {trend.map((day) => {
        const height = String(day.active ? Math.max(28, day.xp || 44) : 16) + '%'
        return (
          <div key={day.date} className="flex h-28 flex-col items-center justify-end gap-2 rounded-2xl bg-emerald-50/70 px-1.5 py-2">
            <div className="flex h-16 w-full items-end justify-center">
              <div
                className={cn('w-5 rounded-full transition-all', day.active ? 'bg-gradient-to-t from-primary to-lime-300 shadow-lg shadow-lime-300/20' : 'bg-emerald-100')}
                style={{ height }}
              />
            </div>
            <p className={cn('text-[10px] font-black', day.active ? 'text-primary' : 'text-muted-foreground')}>{day.label}</p>
          </div>
        )
      })}
    </div>
  )
}

function WeeklySkillBalanceList({ skills, locked }: { skills: WeeklyInsightSummary['skillBalance']; locked: boolean }) {
  return (
    <div className={cn('space-y-3', locked && 'blur-[1.5px]')}>
      {skills.map((skill) => (
        <div key={skill.skill}>
          <div className="mb-1.5 flex items-center justify-between gap-3 text-xs font-black">
            <span>{skill.label}</span>
            <span className="text-muted-foreground">{skill.helper}</span>
          </div>
          <Progress value={skill.percentage} className="h-2.5" />
        </div>
      ))}
    </div>
  )
}

function InsightFocusCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: 'green' | 'gold' }) {
  return (
    <div className={cn('rounded-[1.45rem] border bg-white/82 p-4 shadow-lg shadow-emerald-950/5', tone === 'gold' ? 'border-amber-200' : 'border-primary/15')}>
      <div className={cn('mb-3 flex size-10 items-center justify-center rounded-2xl', tone === 'gold' ? 'bg-amber-100 text-amber-700' : 'bg-primary/10 text-primary')}>
        {icon}
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className="mt-1 truncate font-black">{value}</p>
    </div>
  )
}

function LockedOverlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-white/35 backdrop-blur-[1px]">
      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-950 px-3 py-2 text-xs font-black text-lime-100 shadow-lg">
        <Lock className="size-4" />
        Plus insight
      </span>
    </div>
  )
}

function getWeeklyStatTone(tone: WeeklyInsightSummary['stats'][number]['tone']) {
  if (tone === 'gold') return 'border-amber-200 bg-amber-50/80'
  if (tone === 'blue') return 'border-sky-200 bg-sky-50/80'
  if (tone === 'orange') return 'border-orange-200 bg-orange-50/80'
  return 'border-primary/15 bg-white/82'
}

function PracticeCard({ icon, title, detail, badge, reward, locked, disabled, tone = 'green', onClick }: { icon: React.ReactNode; title: string; detail: string; badge?: string; reward?: string; locked?: boolean; disabled?: boolean; tone?: 'green' | 'orange' | 'gold'; onClick?: () => void }) {
  const unavailable = Boolean(disabled || locked || !onClick)

  return (
    <button
      disabled={unavailable}
      onClick={unavailable ? undefined : onClick}
      className={cn(
        'tilio-pressed relative flex w-full items-center gap-4 overflow-hidden rounded-[1.6rem] border bg-white/80 p-4 text-left shadow-lg shadow-emerald-950/5',
        tone === 'orange' ? 'border-orange-200' : tone === 'gold' ? 'border-amber-200' : 'border-primary/15',
        disabled && 'opacity-72',
        locked && 'opacity-90',
      )}
    >
      <div className={cn('flex size-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg', tone === 'orange' ? 'bg-gradient-to-br from-orange-400 to-red-500 shadow-orange-300/20' : tone === 'gold' ? 'bg-gradient-to-br from-amber-300 to-lime-400 text-emerald-950 shadow-lime-300/20' : 'bg-gradient-to-br from-primary to-emerald-700 shadow-primary/20')}>
        {icon}
      </div>
      <div className={cn('min-w-0 flex-1', locked && 'blur-[1.5px]')}>
        <p className="font-black">{title}</p>
        <p className="text-sm font-semibold text-muted-foreground">{detail}</p>
        {(badge || reward) && (
          <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] font-black uppercase tracking-[0.12em]">
            {badge && <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">{badge}</span>}
            {reward && <span className="rounded-full bg-amber-50 px-2 py-1 text-amber-700">{reward}</span>}
          </div>
        )}
      </div>
      {locked ? <Lock className="size-5 text-muted-foreground" /> : <ChevronRight className="size-5 text-muted-foreground" />}
    </button>
  )
}

function MiniStat({ label, value, tone = 'green' }: { label: string; value: number; tone?: 'green' | 'orange' }) {
  return (
    <div className={cn('rounded-2xl border bg-white/70 p-3 text-center', tone === 'orange' ? 'border-orange-200 text-orange-600' : 'border-primary/15 text-primary')}>
      <p className="text-xl font-black text-foreground">{value}</p>
      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
    </div>
  )
}

function ReviewQueueList({ items }: { items: ReviewWordInsight[] }) {
  return (
    <div className="rounded-[1.75rem] border border-white/70 bg-white/78 p-4 shadow-lg shadow-emerald-950/5">
      <div className="mb-3 flex items-center gap-2">
        <ShieldCheck className="size-5 text-primary" />
        <h3 className="font-black">Today&apos;s Queue</h3>
      </div>
      <div className="space-y-2">
        {items.slice(0, 6).map((item, index) => (
          <div key={item.word.id} className="flex items-center gap-3 rounded-2xl bg-emerald-50/70 p-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-black text-primary shadow-sm">{index + 1}</div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-black">{item.word.english}</p>
              <p className="truncate text-xs font-semibold text-muted-foreground">{item.reason} · {item.lessonTitle ?? item.word.category}</p>
            </div>
            <span className="rounded-full bg-white px-2 py-1 text-[10px] font-black text-emerald-700">{Math.round(item.accuracy * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ReviewEmptyState({ readiness }: { readiness: SmartReviewSummary['readiness'] }) {
  return (
    <div className="rounded-[1.75rem] border border-white/70 bg-white/78 p-5 text-center shadow-lg shadow-emerald-950/5">
      <SparrowMascot size="md" mood={readiness === 'empty' ? 'thinking' : 'encouraging'} branded className="mx-auto mb-3" />
      <h3 className="text-lg font-black">Hozircha review uchun so'zlar yo'q</h3>
      <p className="mx-auto mt-2 max-w-xs text-sm font-semibold text-muted-foreground">Bir nechta darsni yakunlang. Keyin Tilio xatolar, sust so'zlar va esdan chiqayotgan iboralar uchun review navbatini tayyorlaydi.</p>
    </div>
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
                <p className="truncate text-xs font-semibold text-muted-foreground">{item.word.uzbek} · {item.reason}</p>
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
