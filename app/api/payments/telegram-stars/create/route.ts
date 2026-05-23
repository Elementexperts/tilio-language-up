import { NextResponse } from 'next/server'
import { requireCloudUser } from '@/lib/server/cloud-auth'
import { createPendingPlusPayment } from '@/lib/server/plus-access'
import { createTelegramStarsInvoiceLink } from '@/lib/server/telegram-stars'

export const runtime = 'nodejs'

const PLUS_PERIOD_DAYS = 30
const DEFAULT_PLUS_STARS = 199

function getPlusStarsPrice() {
  const configured = Number(process.env.TILIO_PLUS_STARS ?? DEFAULT_PLUS_STARS)
  return Number.isFinite(configured) && configured > 0 ? Math.round(configured) : DEFAULT_PLUS_STARS
}

function createInvoicePayload(userId: string) {
  return `tilio_plus_30d:${userId}:${Date.now()}:${crypto.randomUUID()}`
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    provider: 'telegram_stars',
    route: 'create',
    configured: {
      telegramBotToken: Boolean(process.env.TELEGRAM_BOT_TOKEN),
      supabaseUrl: Boolean(process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL),
      supabaseAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      supabaseServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    },
    message: 'Telegram Stars invoice route is deployed. Use POST from the Mini App to create an invoice.',
  })
}

export async function POST(request: Request) {
  try {
    const { userId } = await requireCloudUser(request)
    const stars = getPlusStarsPrice()
    const invoicePayload = createInvoicePayload(userId)

    await createPendingPlusPayment({
      userId,
      days: PLUS_PERIOD_DAYS,
      source: 'telegram_stars',
      payment: {
        provider: 'telegram_stars',
        providerPaymentId: invoicePayload,
        amount: stars,
        currency: 'XTR',
        status: 'pending',
        plan: 'plus_monthly',
        periodDays: PLUS_PERIOD_DAYS,
        metadata: {
          invoicePayload,
          product: 'tilio_plus',
          checkout: 'telegram_stars',
        },
      },
    })

    const invoiceLink = await createTelegramStarsInvoiceLink({
      title: 'Tilio Plus',
      description: '30 days of premium practice, review, AI chat, weekly insights, and rewards.',
      payload: invoicePayload,
      stars,
      label: 'Tilio Plus - 30 days',
    })

    return NextResponse.json({
      ok: true,
      provider: 'telegram_stars',
      checkoutReady: true,
      invoiceLink,
      invoicePayload,
      stars,
      periodDays: PLUS_PERIOD_DAYS,
      message: 'Telegram Stars invoice is ready.',
    })
  } catch (error) {
    console.error('Telegram Stars invoice creation failed', error)
    return NextResponse.json(
      {
        ok: false,
        provider: 'telegram_stars',
        checkoutReady: false,
        message: error instanceof Error ? error.message : 'Could not create Telegram Stars invoice.',
      },
      { status: 400 },
    )
  }
}
