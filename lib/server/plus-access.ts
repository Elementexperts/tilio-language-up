import type { PlusSource } from '@/lib/types'

export type PaymentProvider = PlusSource

export interface GrantPlusPaymentRecord {
  provider?: PaymentProvider
  providerPaymentId?: string | null
  amount?: number
  currency?: string
  status?: string
  plan?: string
  periodDays?: number
  metadata?: Record<string, unknown>
}

export interface PaymentRow {
  id: string
  user_id: string
  provider: string
  provider_payment_id: string | null
  amount: number
  currency: string
  status: string
  plan: string
  period_days: number
  created_at: string
  paid_at: string | null
  metadata: Record<string, unknown>
}

export interface GrantPlusAccessParams {
  userId: string
  days: number
  source: PlusSource
  payment?: GrantPlusPaymentRecord
}

export interface GrantPlusAccessResult {
  userId: string
  plan: 'plus'
  plusExpiresAt: string
  plusSource: PlusSource
  plusUpdatedAt: string
}

function getServerSupabaseConfig() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error('Server Supabase credentials are missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.')
  }

  return { url, serviceRoleKey }
}

export async function supabaseAdminFetch<T>(path: string, options: RequestInit = {}) {
  const { url, serviceRoleKey } = getServerSupabaseConfig()
  const headers = new Headers(options.headers)
  headers.set('apikey', serviceRoleKey)
  headers.set('Authorization', `Bearer ${serviceRoleKey}`)
  headers.set('Content-Type', 'application/json')

  const response = await fetch(`${url}${path}`, {
    ...options,
    headers,
    cache: 'no-store',
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Supabase admin request failed with ${response.status}`)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

function paymentRecordPayload(userId: string, days: number, source: PlusSource, paidAt: string | null, payment?: GrantPlusPaymentRecord) {
  return {
    user_id: userId,
    provider: payment?.provider ?? source,
    provider_payment_id: payment?.providerPaymentId ?? null,
    amount: payment?.amount ?? 0,
    currency: payment?.currency ?? 'TEST',
    status: payment?.status ?? (source === 'manual' ? 'granted' : 'paid'),
    plan: payment?.plan ?? 'plus_monthly',
    period_days: payment?.periodDays ?? days,
    paid_at: paidAt,
    metadata: payment?.metadata ?? {},
  }
}

export async function createPendingPlusPayment({
  userId,
  days,
  source,
  payment,
}: GrantPlusAccessParams) {
  if (!payment?.providerPaymentId) throw new Error('Pending payment requires providerPaymentId')

  await supabaseAdminFetch('/rest/v1/payments', {
    method: 'POST',
    headers: {
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(paymentRecordPayload(userId, days, source, null, {
      ...payment,
      status: payment.status ?? 'pending',
      periodDays: payment.periodDays ?? days,
    })),
  })
}

export async function findPaymentByProviderPaymentId(provider: PaymentProvider, providerPaymentId: string) {
  const rows = await supabaseAdminFetch<PaymentRow[]>(
    `/rest/v1/payments?provider=eq.${encodeURIComponent(provider)}&provider_payment_id=eq.${encodeURIComponent(providerPaymentId)}&select=*&limit=1`,
  )

  return rows[0] ?? null
}

async function upsertPaymentRecord(userId: string, days: number, source: PlusSource, paidAt: string, payment?: GrantPlusPaymentRecord) {
  const payload = paymentRecordPayload(userId, days, source, paidAt, payment)
  const existingPayment = payment?.provider && payment.providerPaymentId
    ? await findPaymentByProviderPaymentId(payment.provider, payment.providerPaymentId)
    : null

  if (existingPayment) {
    await supabaseAdminFetch(`/rest/v1/payments?id=eq.${encodeURIComponent(existingPayment.id)}`, {
      method: 'PATCH',
      headers: {
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(payload),
    })
    return
  }

  await supabaseAdminFetch('/rest/v1/payments', {
    method: 'POST',
    headers: {
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(payload),
  })
}

export async function grantPlusAccess({
  userId,
  days,
  source,
  payment,
}: GrantPlusAccessParams): Promise<GrantPlusAccessResult> {
  if (!userId) throw new Error('Missing userId')
  if (!Number.isFinite(days) || days <= 0) throw new Error('Plus period must be a positive number of days')

  const plusUpdatedAt = new Date().toISOString()
  const plusExpiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()

  await supabaseAdminFetch(`/rest/v1/users?id=eq.${encodeURIComponent(userId)}`, {
    method: 'PATCH',
    headers: {
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      plan: 'plus',
      plus_expires_at: plusExpiresAt,
      plus_source: source,
      plus_updated_at: plusUpdatedAt,
      updated_at: plusUpdatedAt,
    }),
  })

  if (payment || source === 'manual') {
    await upsertPaymentRecord(userId, days, source, plusUpdatedAt, payment)
  }

  return {
    userId,
    plan: 'plus',
    plusExpiresAt,
    plusSource: source,
    plusUpdatedAt,
  }
}
