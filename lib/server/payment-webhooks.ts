import { NextResponse } from 'next/server'

export function placeholderNotConfigured(provider: string) {
  return NextResponse.json(
    {
      ok: false,
      provider,
      verified: false,
      message: `${provider} webhook placeholder is present. Add provider credentials and real signature verification before granting Plus.`,
    },
    { status: 501 },
  )
}

export function verifyStaticWebhookSecret(request: Request, headerName: string, envName: string) {
  const expected = process.env[envName]
  if (!expected) return { configured: false, verified: false }
  const received = request.headers.get(headerName)
  return {
    configured: true,
    verified: Boolean(received && received === expected),
  }
}
