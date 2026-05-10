// @ts-nocheck
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

type TelegramUser = {
  id: number
  first_name?: string
  last_name?: string
  username?: string
  photo_url?: string
}

type AuthResponseUser = {
  id: string
  telegram_id: string
  username: string | null
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
}

const textEncoder = new TextEncoder()

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  })
}

function requireEnv(name: string) {
  const value = Deno.env.get(name)
  if (!value) {
    throw new Error(`Missing required secret: ${name}`)
  }
  return value
}

function requireAnyEnv(names: string[]) {
  for (const name of names) {
    const value = Deno.env.get(name)
    if (value) return value
  }

  throw new Error(`Missing required secret: ${names.join(' or ')}`)
}

async function hmacSha256(key: Uint8Array | string, data: string) {
  const rawKey = typeof key === 'string' ? textEncoder.encode(key) : key
  const keyData = new ArrayBuffer(rawKey.byteLength)
  new Uint8Array(keyData).set(rawKey)
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )

  return new Uint8Array(await crypto.subtle.sign('HMAC', cryptoKey, textEncoder.encode(data)))
}

function toHex(bytes: Uint8Array) {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

function base64Url(value: string | Uint8Array) {
  const bytes = typeof value === 'string' ? textEncoder.encode(value) : value
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function safeEqual(left: string, right: string) {
  if (left.length !== right.length) return false

  let mismatch = 0
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index)
  }

  return mismatch === 0
}

async function verifyTelegramInitData(initData: string, botToken: string): Promise<TelegramUser> {
  if (!initData || typeof initData !== 'string') {
    throw new Error('Telegram initData is missing')
  }

  const params = new URLSearchParams(initData)
  const receivedHash = params.get('hash')
  if (!receivedHash) {
    throw new Error('Telegram hash is missing')
  }

  params.delete('hash')

  const authDate = Number(params.get('auth_date') ?? 0)
  if (!authDate) {
    throw new Error('Telegram auth_date is missing')
  }

  const maxAgeSeconds = 60 * 60 * 24
  const ageSeconds = Math.floor(Date.now() / 1000) - authDate
  if (ageSeconds > maxAgeSeconds) {
    throw new Error('Telegram auth data expired')
  }

  const dataCheckString = [...params.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')

  const secretKey = await hmacSha256('WebAppData', botToken)
  const calculatedHash = toHex(await hmacSha256(secretKey, dataCheckString))
  if (!safeEqual(calculatedHash, receivedHash)) {
    throw new Error('Invalid Telegram signature')
  }

  const userRaw = params.get('user')
  if (!userRaw) {
    throw new Error('Telegram user is missing')
  }

  const user = JSON.parse(userRaw) as TelegramUser
  if (!user.id) {
    throw new Error('Telegram user id is missing')
  }

  return user
}

async function createSupabaseAccessToken(userId: string, jwtSecret: string) {
  const now = Math.floor(Date.now() / 1000)
  const expiresAt = now + 60 * 60 * 24 * 30
  const header = base64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = base64Url(JSON.stringify({
    aud: 'authenticated',
    role: 'authenticated',
    sub: userId,
    iat: now,
    exp: expiresAt,
  }))
  const unsignedToken = `${header}.${payload}`
  const signature = await hmacSha256(jwtSecret, unsignedToken)

  return {
    accessToken: `${unsignedToken}.${base64Url(signature)}`,
    expiresAt,
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  try {
    const body = await req.json().catch(() => ({})) as { initData?: string; init_data?: string }
    const initData = body.initData ?? body.init_data

    const telegramUser = await verifyTelegramInitData(
      initData ?? '',
      requireEnv('TELEGRAM_BOT_TOKEN'),
    )

    const supabase = createClient(
      requireAnyEnv(['SUPABASE_URL', 'PROJECT_URL']),
      requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    )

    const { data: profile, error } = await supabase
      .from('users')
      .upsert(
        {
          telegram_id: String(telegramUser.id),
          username: telegramUser.username ?? null,
          first_name: telegramUser.first_name ?? null,
          last_name: telegramUser.last_name ?? null,
          avatar_url: telegramUser.photo_url ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'telegram_id' },
      )
      .select('id, telegram_id, username, first_name, last_name, avatar_url')
      .single<AuthResponseUser>()

    if (error) {
      throw new Error(error.message)
    }

    if (!profile) {
      throw new Error('Telegram profile could not be saved')
    }

    const session = await createSupabaseAccessToken(profile.id, requireAnyEnv(['JWT_SECRET', 'SUPABASE_JWT_SECRET']))

    return jsonResponse({
      access_token: session.accessToken,
      token_type: 'bearer',
      expires_at: session.expiresAt,
      user: profile,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Telegram auth failed'
    const status = message.includes('Missing required secret') ? 500 : 401

    return jsonResponse({ error: message }, status)
  }
})
