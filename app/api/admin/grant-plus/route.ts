import { NextResponse } from 'next/server'
import { grantPlusAccess } from '@/lib/server/plus-access'

export const runtime = 'nodejs'

const allowedDays = new Set([7, 30, 90])

export async function POST(request: Request) {
  const adminToken = process.env.TILIO_ADMIN_TOKEN
  if (!adminToken) {
    return NextResponse.json(
      { ok: false, message: 'Manual Plus admin route is disabled. Set TILIO_ADMIN_TOKEN to enable it.' },
      { status: 501 },
    )
  }

  if (request.headers.get('x-admin-token') !== adminToken) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const userId = typeof body?.userId === 'string' ? body.userId : ''
  const days = Number(body?.days)

  if (!userId || !allowedDays.has(days)) {
    return NextResponse.json({ ok: false, message: 'Send userId and days as 7, 30, or 90.' }, { status: 400 })
  }

  const grant = await grantPlusAccess({
    userId,
    days,
    source: 'manual',
    payment: {
      provider: 'manual',
      amount: 0,
      currency: 'TEST',
      status: 'granted',
      plan: 'plus_manual',
      metadata: { grantedBy: 'admin-route' },
    },
  })

  return NextResponse.json({ ok: true, grant })
}
