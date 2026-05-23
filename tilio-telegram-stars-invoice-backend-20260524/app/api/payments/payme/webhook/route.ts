import { NextResponse } from 'next/server'
import { placeholderNotConfigured, verifyStaticWebhookSecret } from '@/lib/server/payment-webhooks'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const verification = verifyStaticWebhookSecret(request, 'x-payme-signature', 'PAYME_WEBHOOK_SECRET')

  if (!verification.configured) {
    return placeholderNotConfigured('payme')
  }

  if (!verification.verified) {
    return NextResponse.json({ ok: false, provider: 'payme', verified: false }, { status: 401 })
  }

  return NextResponse.json(
    {
      ok: false,
      provider: 'payme',
      verified: true,
      message: 'Signature accepted. Payme transaction verification and grantPlusAccess call are pending provider credentials.',
    },
    { status: 501 },
  )
}
