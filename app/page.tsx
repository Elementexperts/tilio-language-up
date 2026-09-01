import Link from 'next/link'
import { ArrowRight, BookOpen, ShieldCheck, Sparkles } from 'lucide-react'
import { SparrowMascot } from '@/components/sparrow-mascot'

export default function MarketingHomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-lime-50 px-5 py-6 text-emerald-950">
      <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-[1.5rem] border border-white/80 bg-white/85 px-5 py-3 shadow-lg shadow-emerald-950/5 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-3 font-black" aria-label="Tilio home">
          <SparrowMascot branded size="sm" mood="happy" />
          <span className="text-xl">Tilio</span>
        </Link>
        <Link href="/app" className="inline-flex h-11 items-center gap-2 rounded-2xl bg-primary px-5 font-black text-primary-foreground shadow-lg shadow-primary/20">
          Open Tilio
          <ArrowRight className="size-4" />
        </Link>
      </nav>

      <section className="mx-auto grid min-h-[calc(100vh-7rem)] max-w-6xl items-center gap-10 py-14 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-800">
            <Sparkles className="size-4" />
            Language learning built for schools
          </p>
          <h1 className="max-w-3xl text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl">
            Confident language practice, one short lesson at a time.
          </h1>
          <p className="mt-6 max-w-2xl text-lg font-semibold leading-8 text-emerald-900/70">
            Tilio helps learners build vocabulary, speaking confidence, streaks, and real progress through friendly daily practice.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/app" className="inline-flex h-14 items-center gap-2 rounded-2xl bg-primary px-7 text-lg font-black text-primary-foreground shadow-xl shadow-primary/20">
              Open Tilio
              <ArrowRight className="size-5" />
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-5 text-sm font-bold text-emerald-900/65">
            <span className="inline-flex items-center gap-2"><BookOpen className="size-4 text-primary" />Lessons and smart review</span>
            <span className="inline-flex items-center gap-2"><ShieldCheck className="size-4 text-primary" />No account required</span>
          </div>
        </div>

        <div className="rounded-[2.5rem] border border-white/80 bg-white/80 p-8 text-center shadow-2xl shadow-emerald-950/10 backdrop-blur-xl">
          <SparrowMascot branded size="xl" mood="celebrating" className="mx-auto" />
          <h2 className="mt-5 text-2xl font-black">Start learning immediately</h2>
          <p className="mt-2 font-semibold text-emerald-900/65">Choose a course and daily goal. Your progress stays on this device unless you choose cloud sync.</p>
        </div>
      </section>
    </main>
  )
}
