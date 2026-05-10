// @ts-nocheck
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function hmacSha256(key: Uint8Array, data: string) {
  const cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return new Uint8Array(await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(data)))
}

function toHex(bytes: Uint8Array) {
  return Array.from(bytes).map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

function base64Url(value: Uint8Array | string) {
  const bytes = typeof value === 'string' ? new TextEncoder().encode(value) : value
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function createSupabaseJwt(userId: string, jwtSecret: string) {
  const now = Math.floor(Date.now() / 1000)
  const header = base64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = base64Url(JSON.stringify({
    aud: 'authenticated',
    role: 'authenticated',
    sub: userId,
    iat: now,
    exp: now + 60 * 60 * 24 * 30,
  }))
  const data = `${header}.${payload}`
  const signature = await hmacSha256(new TextEncoder().encode(jwtSecret), data)
  return `${data}.${base64Url(signature)}`
}

async function verifyTelegramInitData(initData: string, botToken: string) {
  const params = new URLSearchParams(initData)
  const hash = params.get('hash')
  params.delete('hash')
  const checkString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')

  const secretKey = await hmacSha256(new TextEncoder().encode('WebAppData'), botToken)
  const calculatedHash = toHex(await hmacSha256(secretKey, checkString))
  if (!hash || calculatedHash !== hash) throw new Error('Invalid Telegram signature')

  const authDate = Number(params.get('auth_date') || 0)
  if (Date.now() / 1000 - authDate > 86400) throw new Error('Telegram auth data expired')

  const userRaw = params.get('user')
  if (!userRaw) throw new Error('Telegram user missing')
  return JSON.parse(userRaw)
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { initData } = await req.json()
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const jwtSecret = Deno.env.get('SUPABASE_JWT_SECRET')
    if (!botToken || !supabaseUrl || !serviceRoleKey || !jwtSecret) throw new Error('Missing Supabase function secrets')

    const telegramUser = await verifyTelegramInitData(initData, botToken)
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .upsert({
        telegram_id: String(telegramUser.id),
        username: telegramUser.username,
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name,
        avatar_url: telegramUser.photo_url,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'telegram_id' })
      .select('*')
      .single()

    if (profileError) throw profileError

    const accessToken = await createSupabaseJwt(profile.id, jwtSecret)

    return new Response(JSON.stringify({
      access_token: accessToken,
      expires_at: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
      user: profile,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Telegram auth failed' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
