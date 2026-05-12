'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, BarChart3, CalendarDays, Flame, Users, Zap } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { useTelegram } from '@/hooks/use-telegram'
import { fetchTesterStats, type TesterStats } from '@/lib/tester-stats'

export function TesterStatsScreen() {
  const cloudSession = useAppStore((state) => state.cloudSession)
  const setScreen = useAppStore((state) => state.setScreen)
  const { hapticFeedback, showBackButton, hideBackButton } = useTelegram()
  const [stats, setStats] = useState<TesterStats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    showBackButton(() => {
      hideBackButton()
      setScreen('account')
    })
    return () => hideBackButton()
  }, [hideBackButton, setScreen, showBackButton])

  useEffect(() => {
    if (!cloudSession) {
      setError('Log in with an admin tester account to view stats.')
      setIsLoading(false)
      return
    }

    let cancelled = false
    setIsLoading(true)
    fetchTesterStats(cloudSession)
      .then((result) => {
        if (cancelled) return
        setStats(result)
        setError(null)
      })
      .catch((statsError) => {
        if (cancelled) return
        setError(statsError instanceof Error ? statsError.message : 'Tester stats unavailable')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [cloudSession])

  return (
    <div className="tilio-shell flex flex-col">
      <header className="sticky top-0 z-10 safe-area-top">
        <div className="tilio-container px-4 py-3">
          <div className="flex items-center gap-4 rounded-[1.6rem] border border-white/70 bg-white/80 px-3 py-2 shadow-lg shadow-emerald-950/5 backdrop-blur-xl">
            <button
              onClick={() => {
                hapticFeedback('light')
                setScreen('account')
              }}
              className="tilio-pressed flex size-10 items-center justify-center rounded-full bg-emerald-50 text-muted-foreground"
              aria-label="Go back"
            >
              <ArrowLeft className="size-6" />
            </button>
            <div>
              <h1 className="text-xl font-black">Tester Stats</h1>
              <p className="text-xs font-semibold text-muted-foreground">Private testing activity</p>
            </div>
          </div>
        </div>
      </header>

      <main className="tilio-container flex-1 overflow-y-auto px-4 py-5 pb-24">
        {isLoading && (
          <Card className="premium-card rounded-[2rem] p-6 text-center">
            <BarChart3 className="mx-auto size-10 animate-pulse text-primary" />
            <p className="mt-3 font-black">Loading tester activity...</p>
          </Card>
        )}

        {!isLoading && error && (
          <Card className="rounded-[2rem] border-red-100 bg-red-50 p-5 text-center">
            <p className="font-black text-red-700">Stats locked</p>
            <p className="mt-2 text-sm font-semibold text-red-600">{error}</p>
            <Button className="mt-4 rounded-2xl" onClick={() => setScreen('auth')}>
              Log in
            </Button>
          </Card>
        )}

        {!isLoading && stats && (
          <>
            <section className="grid grid-cols-2 gap-3">
              <Metric icon={<Users className="size-6" />} label="Total testers" value={stats.totalTesters} />
              <Metric icon={<Zap className="size-6" />} label="Active today" value={stats.activeToday} />
              <Metric icon={<CalendarDays className="size-6" />} label="Active week" value={stats.activeThisWeek} />
              <Metric icon={<Flame className="size-6" />} label="Avg streak" value={stats.averageStreak} />
            </section>

            <Card className="premium-card mt-4 rounded-[1.75rem] p-4">
              <h2 className="font-black">Course split</h2>
              <div className="mt-3 space-y-2">
                {stats.courses.map((course) => (
                  <div key={course.courseId} className="flex items-center justify-between rounded-2xl bg-white/70 px-3 py-2 text-sm font-bold">
                    <span>{course.courseId}</span>
                    <span className="text-primary">{course.testers}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="mt-4 rounded-[1.75rem] border-white/70 bg-white/88 p-4 shadow-xl shadow-emerald-950/5">
              <h2 className="font-black">Recent testers</h2>
              <div className="mt-3 space-y-2">
                {stats.recentTesters.map((tester) => (
                  <div key={tester.id} className="rounded-2xl bg-emerald-50/70 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-black">{tester.name}</p>
                        <p className="text-xs font-semibold text-muted-foreground">@{tester.username ?? 'tester'} · {tester.courseId}</p>
                      </div>
                      <p className="shrink-0 text-sm font-black text-primary">{tester.xp} XP</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
      </main>
    </div>
  )
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card className="premium-card rounded-[1.5rem] p-4 text-center">
      <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">{icon}</div>
      <p className="text-3xl font-black">{value}</p>
      <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
    </Card>
  )
}
