import { NextResponse } from 'next/server'
import { placeholderNotConfigured, verifyStaticWebhookSecret } from '@/lib/server/payment-webhooks'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const verification = verifyStaticWebhookSecret(request, 'x-click-signature', 'CLICK_WEBHOOK_SECRET')

  if (!verification.configured) {
    return placeholderNotConfigured('click')
  }

  if (!verification.verified) {
    return NextResponse.json({ ok: false, provider: 'click', verified: false }, { status: 401 })
  }

  return NextResponse.json(
    {
      ok: false,
      provider: 'click',
      verified: true,
      message: 'Signature accepted. Click transaction verification and grantPlusAccess call are pending provider credentials.',
    },
    { status: 501 },
  )
}
