'use client'

import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SparrowMascot } from '@/components/sparrow-mascot'
import { PlusBadge } from '@/components/plus-locked-card'
import { useAppStore } from '@/lib/store'
import { useTelegram } from '@/hooks/use-telegram'
import { getPlusChatMessagesLeft, getPlusDaysRemaining, isPlusActive, plusBenefits, plusPaymentMethods } from '@/lib/plus'
import { cn } from '@/lib/utils'
import { getBackendApiUrl } from '@/lib/backend-api'
import { isCapacitorAndroid } from '@/lib/platform'
import { ArrowLeft, BadgeCheck, CalendarClock, Check, ChevronRight, Crown, CreditCard, Lock, MessageCircle, ShieldCheck, Sparkles, Star, Zap } from 'lucide-react'

export function UpgradeScreen() {
  const user = useAppStore((state) => state.user)
  const cloudSession = useAppStore((state) => state.cloudSession)
  const setScreen = useAppStore((state) => state.setScreen)
  const grantManualPlus = useAppStore((state) => state.grantManualPlus)
  const { hapticFeedback, showBackButton, hideBackButton } = useTelegram()
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null)
  const plusActive = isPlusActive(user)
  const daysRemaining = getPlusDaysRemaining(user)
  const freeChatLeft = getPlusChatMessagesLeft(user)
  const androidBuild = isCapacitorAndroid()

  useEffect(() => {
    showBackButton(() => {
      hideBackButton()
      setScreen('profile')
    })
    return () => hideBackButton()
  }, [showBackButton, hideBackButton, setScreen])

  if (!user) return null

  const handleManualGrant = (days: 7 | 30 | 90) => {
    hapticFeedback('success')
    grantManualPlus(days)
    setCheckoutMessage(`Manual tester Plus granted for ${days} days.`)
  }

  const handleTelegramStarsCheckout = async () => {
    hapticFeedback('light')
    if (!cloudSession?.accessToken) {
      setCheckoutMessage('Cloud account is required before Telegram Stars checkout. Open the app from Telegram and wait for cloud sync.')
      return
    }

    setCheckoutMessage('Preparing Telegram Stars invoice...')
    try {
      const response = await fetch(getBackendApiUrl('/api/payments/telegram-stars/create'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cloudSession.accessToken}`,
        },
        body: JSON.stringify({ plan: 'monthly_plus', periodDays: 30 }),
      })

      const rawPayload = await response.text()
      let payload: { invoiceLink?: string; message?: string } = {}
      try {
        payload = rawPayload ? JSON.parse(rawPayload) : {}
      } catch {
        setCheckoutMessage(
          rawPayload
            ? `Checkout returned HTTP ${response.status}: ${rawPayload.slice(0, 140)}`
            : `Checkout returned HTTP ${response.status} with an empty response. Check Vercel function logs.`,
        )
        return
      }

      if (!response.ok || !payload.invoiceLink) {
        setCheckoutMessage(payload.message ?? `Could not create Telegram Stars invoice. HTTP ${response.status}`)
        return
      }

      const telegramWebApp = typeof window !== 'undefined'
        ? (window as unknown as { Telegram?: { WebApp?: { openInvoice?: (url: string, callback?: (status: string) => void) => void } } }).Telegram?.WebApp
        : undefined

      if (telegramWebApp?.openInvoice) {
        telegramWebApp.openInvoice(payload.invoiceLink, (status) => {
          if (status === 'paid') {
            setCheckoutMessage('Payment received. Plus will unlock after Telegram confirms it.')
            return
          }
          if (status === 'cancelled') {
            setCheckoutMessage('Payment was cancelled.')
            return
          }
          setCheckoutMessage(`Telegram invoice status: ${status}`)
        })
        return
      }

      window.open(payload.invoiceLink, '_blank', 'noopener,noreferrer')
      setCheckoutMessage('Invoice opened. Plus unlocks after Telegram confirms the payment.')
    } catch (error) {
      setCheckoutMessage(error instanceof Error ? error.message : 'Telegram Stars checkout is unavailable right now. Manual tester access still works.')
    }
  }

  return (
    <div className="tilio-shell flex flex-col">
      <header className="sticky top-0 z-10 safe-area-top">
        <div className="tilio-container px-4 py-3">
          <div className="flex items-center gap-4 rounded-[1.6rem] border border-white/70 bg-white/80 px-3 py-2 shadow-lg shadow-emerald-950/5 backdrop-blur-xl">
            <button
              onClick={() => {
                hapticFeedback('light')
                setScreen('profile')
              }}
              className="tilio-pressed flex size-10 items-center justify-center rounded-full bg-emerald-50 text-muted-foreground"
              aria-label="Go back"
            >
              <ArrowLeft className="size-6" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-black">Tilio Plus</h1>
              <p className="text-xs font-semibold text-muted-foreground">Premium learning access</p>
            </div>
            <PlusBadge />
          </div>
        </div>
      </header>

      <main className="tilio-container flex-1 overflow-y-auto px-4 py-4 pb-24">
        <section className="mb-4 overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-700 via-emerald-500 to-lime-400 p-5 text-white shadow-2xl shadow-emerald-900/18">
          <div className="absolute left-6 top-24 size-24 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex items-center gap-4">
            <div className="min-w-0 flex-1">
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/18 px-3 py-1 text-xs font-black">
                <Crown className="size-3.5 text-amber-200" />
                {plusActive ? `${daysRemaining} days left` : 'Unlock smarter practice'}
              </div>
              <h2 className="text-3xl font-black leading-tight">
                More practice, better memory, faster progress.
              </h2>
              <p className="mt-3 text-sm font-semibold text-white/82">
                Plus opens advanced review, expanded AI chat, premium rewards, and weekly learning insights.
              </p>
            </div>
            <SparrowMascot branded size="lg" mood="celebrating" className="shrink-0" />
          </div>
        </section>

        <Card className={cn('tilio-card mb-4 rounded-[1.75rem] p-4', plusActive ? 'border-primary/30' : 'border-amber-200/80')}>
          <div className="flex items-start gap-3">
            <div className={cn('flex size-12 shrink-0 items-center justify-center rounded-2xl', plusActive ? 'bg-primary text-primary-foreground' : 'bg-amber-100 text-amber-800')}>
              {plusActive ? <ShieldCheck className="size-6" /> : <Lock className="size-6" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-black">{plusActive ? 'Plus is active' : 'Free plan preview'}</p>
              <p className="mt-1 text-sm font-semibold text-muted-foreground">
                {plusActive
                  ? `Your access expires on ${new Date(user.plusExpiresAt!).toLocaleDateString()}.`
                  : `AI Chat preview has ${Number.isFinite(freeChatLeft) ? freeChatLeft : 0} free messages left today.`}
              </p>
              <p className="mt-2 text-xs font-bold text-emerald-700">
                Source: {user.plusSource ?? 'free'}
              </p>
            </div>
          </div>
        </Card>

        <section className="mb-4 grid grid-cols-2 gap-3">
          <PlanCard
            title="Monthly Plus"
            price="$4.99"
            note="30 days access"
            active
            icon={<Star className="size-6" />}
          />
          <PlanCard
            title="Yearly Plus"
            price="Soon"
            note="Future annual plan"
            icon={<CalendarClock className="size-6" />}
          />
        </section>

        {!androidBuild && <Card className="tilio-card mb-4 rounded-[1.75rem] p-4">
          <h3 className="mb-3 font-black">Free vs Plus</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-muted/45 p-3">
              <p className="mb-2 text-sm font-black">Free</p>
              <ul className="space-y-2 text-xs font-semibold text-muted-foreground">
                <li>3 AI chat messages/day</li>
                <li>Core lessons and streaks</li>
                <li>Basic rewards</li>
              </ul>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-3">
              <p className="mb-2 text-sm font-black text-primary">Plus</p>
              <ul className="space-y-2 text-xs font-semibold text-emerald-900/75">
                <li>Expanded AI chat usage</li>
                <li>Practice and advanced review</li>
                <li>Insights and premium rewards</li>
              </ul>
            </div>
          </div>
        </Card>}

        <Card className="tilio-card mb-4 rounded-[1.75rem] p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-black">Plus benefits</h3>
            <Sparkles className="size-5 text-accent" />
          </div>
          <div className="space-y-3">
            {plusBenefits.map((benefit) => (
              <div key={benefit.title} className="flex gap-3 rounded-2xl bg-white/70 p-3">
                <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Check className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-black">{benefit.title}</p>
                  <p className="text-xs font-semibold leading-4 text-muted-foreground">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="tilio-card mb-4 rounded-[1.75rem] p-4">
          <div className="mb-3">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">Payment methods</p>
            <h3 className="font-black">Ready for checkout providers</h3>
          </div>
          <div className="space-y-3">
            {plusPaymentMethods.map((method) => (
              <button
                key={method.id}
                type="button"
                disabled={method.id !== 'telegram_stars'}
                onClick={method.id === 'telegram_stars' ? handleTelegramStarsCheckout : undefined}
                className={cn(
                  'tilio-pressed flex w-full items-center gap-3 rounded-2xl border p-3 text-left',
                  method.id === 'telegram_stars'
                    ? 'border-primary/20 bg-white/90'
                    : 'border-border bg-muted/35 opacity-85',
                )}
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-primary">
                  <CreditCard className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-black">{method.title}</p>
                  <p className="text-xs font-semibold leading-4 text-muted-foreground">{method.description}</p>
                </div>
                <span className="rounded-full bg-white px-2 py-1 text-[11px] font-black text-muted-foreground">
                  {method.status === 'soon' ? 'Soon' : 'Later'}
                </span>
                <ChevronRight className="size-4 text-muted-foreground" />
              </button>
            ))}
          </div>
          {checkoutMessage && (
            <div className="mt-3 rounded-2xl bg-emerald-50 p-3 text-sm font-bold text-emerald-900">
              {checkoutMessage}
            </div>
          )}
        </Card>

        {!androidBuild && <Card className="tilio-card rounded-[1.75rem] border-dashed border-sky-200 p-4">
          <div className="mb-3 flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
              <BadgeCheck className="size-5" />
            </div>
            <div>
              <h3 className="font-black">Tester access</h3>
              <p className="text-sm font-semibold text-muted-foreground">
                Use this for early community testers while real payments are being connected.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[7, 30, 90].map((days) => (
              <Button
                key={days}
                type="button"
                variant="outline"
                className="h-12 rounded-2xl bg-white font-black"
                onClick={() => handleManualGrant(days as 7 | 30 | 90)}
              >
                <Zap className="size-4 text-primary" />
                {days}d
              </Button>
            ))}
          </div>
        </Card>}
      </main>
    </div>
  )
}

function PlanCard({
  title,
  price,
  note,
  icon,
  active = false,
}: {
  title: string
  price: string
  note: string
  icon: ReactNode
  active?: boolean
}) {
  return (
    <Card className={cn('gap-0 rounded-[1.55rem] p-4 shadow-xl shadow-emerald-950/5', active ? 'border-primary/25 bg-white/92' : 'border-white/70 bg-white/62')}>
      <div className={cn('mb-3 flex size-12 items-center justify-center rounded-2xl', active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>
        {icon}
      </div>
      <p className="font-black leading-tight">{title}</p>
      <p className="mt-2 text-2xl font-black text-foreground">{price}</p>
      <p className="text-xs font-semibold text-muted-foreground">{note}</p>
    </Card>
  )
}
