const TELEGRAM_API_BASE = 'https://api.telegram.org'

export interface TelegramInvoiceLinkParams {
  title: string
  description: string
  payload: string
  stars: number
  label: string
}

export interface SuccessfulTelegramStarsPayment {
  currency: string
  total_amount: number
  invoice_payload: string
  telegram_payment_charge_id?: string
  provider_payment_charge_id?: string
}

function getBotToken() {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN is missing')
  return token
}

export async function callTelegramBotApi<T>(method: string, body: Record<string, unknown>) {
  const response = await fetch(`${TELEGRAM_API_BASE}/bot${getBotToken()}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  })

  const payload = await response.json().catch(() => null) as { ok?: boolean; result?: T; description?: string } | null

  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.description || `Telegram ${method} failed with ${response.status}`)
  }

  return payload.result as T
}

export async function createTelegramStarsInvoiceLink({
  title,
  description,
  payload,
  stars,
  label,
}: TelegramInvoiceLinkParams) {
  return callTelegramBotApi<string>('createInvoiceLink', {
    title,
    description,
    payload,
    provider_token: '',
    currency: 'XTR',
    prices: [
      {
        label,
        amount: stars,
      },
    ],
  })
}

export async function answerTelegramPreCheckoutQuery(preCheckoutQueryId: string, ok: boolean, errorMessage?: string) {
  return callTelegramBotApi<boolean>('answerPreCheckoutQuery', {
    pre_checkout_query_id: preCheckoutQueryId,
    ok,
    ...(ok ? {} : { error_message: errorMessage ?? 'Payment could not be verified. Please try again.' }),
  })
}
