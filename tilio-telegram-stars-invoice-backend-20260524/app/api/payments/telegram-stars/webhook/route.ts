import { NextResponse } from 'next/server'
import { findPaymentByProviderPaymentId, grantPlusAccess } from '@/lib/server/plus-access'
import { answerTelegramPreCheckoutQuery, type SuccessfulTelegramStarsPayment } from '@/lib/server/telegram-stars'

export const runtime = 'nodejs'

interface TelegramStarsUpdate {
  update_id?: number
  pre_checkout_query?: {
    id: string
    currency: string
    total_amount: number
    invoice_payload: string
  }
  message?: {
    successful_payment?: SuccessfulTelegramStarsPayment
  }
}

function verifyTelegramSecret(request: Request) {
  const expected = process.env.TELEGRAM_STARS_WEBHOOK_SECRET
  if (!expected) return false
  return request.headers.get('x-telegram-bot-api-secret-token') === expected
}

function isTilioPlusPayload(payload?: string) {
  return Boolean(payload?.startsWith('tilio_plus_30d:'))
}

async function handlePreCheckout(update: TelegramStarsUpdate) {
  const query = update.pre_checkout_query
  if (!query) return null

  const validPayload = isTilioPlusPayload(query.invoice_payload)
  const validCurrency = query.currency === 'XTR'
  const pendingPayment = validPayload
    ? await findPaymentByProviderPaymentId('telegram_stars', query.invoice_payload)
    : null
  const validAmount = pendingPayment ? Number(pendingPayment.amount) === query.total_amount : false
  const ok = Boolean(validPayload && validCurrency && pendingPayment && validAmount)

  await answerTelegramPreCheckoutQuery(
    query.id,
    ok,
    ok ? undefined : 'Tilio Plus payment could not be verified. Please reopen checkout and try again.',
  )

  return NextResponse.json({
    ok,
    handled: 'pre_checkout_query',
  })
}

async function handleSuccessfulPayment(update: TelegramStarsUpdate) {
  const successfulPayment = update.message?.successful_payment
  if (!successfulPayment) return null

  if (successfulPayment.currency !== 'XTR' || !isTilioPlusPayload(successfulPayment.invoice_payload)) {
    return NextResponse.json({ ok: false, message: 'Unsupported Telegram Stars payment.' }, { status: 400 })
  }

  const pendingPayment = await findPaymentByProviderPaymentId('telegram_stars', successfulPayment.invoice_payload)
  if (!pendingPayment) {
    return NextResponse.json({ ok: false, message: 'Pending payment was not found.' }, { status: 404 })
  }

  if (pendingPayment.status === 'paid') {
    return NextResponse.json({ ok: true, handled: 'successful_payment', alreadyProcessed: true })
  }

  if (Number(pendingPayment.amount) !== successfulPayment.total_amount) {
    return NextResponse.json({ ok: false, message: 'Telegram Stars amount mismatch.' }, { status: 400 })
  }

  const grant = await grantPlusAccess({
    userId: pendingPayment.user_id,
    days: pendingPayment.period_days,
    source: 'telegram_stars',
    payment: {
      provider: 'telegram_stars',
      providerPaymentId: successfulPayment.invoice_payload,
      amount: successfulPayment.total_amount,
      currency: 'XTR',
      status: 'paid',
      plan: pendingPayment.plan,
      periodDays: pendingPayment.period_days,
      metadata: {
        ...(pendingPayment.metadata ?? {}),
        telegramPaymentChargeId: successfulPayment.telegram_payment_charge_id ?? null,
        providerPaymentChargeId: successfulPayment.provider_payment_charge_id ?? null,
        paidVia: 'telegram_stars',
      },
    },
  })

  return NextResponse.json({
    ok: true,
    handled: 'successful_payment',
    grant,
  })
}

export async function POST(request: Request) {
  if (!verifyTelegramSecret(request)) {
    return NextResponse.json({ ok: false, provider: 'telegram_stars', verified: false }, { status: 401 })
  }

  try {
    const update = await request.json() as TelegramStarsUpdate
    const preCheckoutResponse = await handlePreCheckout(update)
    if (preCheckoutResponse) return preCheckoutResponse

    const successfulPaymentResponse = await handleSuccessfulPayment(update)
    if (successfulPaymentResponse) return successfulPaymentResponse

    return NextResponse.json({ ok: true, handled: false })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        provider: 'telegram_stars',
        message: error instanceof Error ? error.message : 'Telegram Stars webhook failed.',
      },
      { status: 500 },
    )
  }
}
