import type { CloudAuthSession, User } from '@/lib/types'
import { isSupabaseConfigured, supabaseFetch } from '@/lib/supabase'

export interface TelegramAuthResult {
  session: CloudAuthSession
  user: Partial<User>
}

export interface EmailAuthResult {
  session: CloudAuthSession
  user: Partial<User>
}

const SESSION_CACHE_KEY = 'tilio-cloud-session'
const SESSION_REFRESH_BUFFER_SECONDS = 60

export function getCachedCloudSession(): CloudAuthSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(SESSION_CACHE_KEY)
    const session = raw ? JSON.parse(raw) as CloudAuthSession : null
    if (session && !isCloudSessionFresh(session)) {
      cacheCloudSession(null)
      return null
    }
    return session
  } catch {
    return null
  }
}

export function isCloudSessionFresh(session: CloudAuthSession | null) {
  if (!session?.accessToken || !session.userId) return false
  if (!session.expiresAt) return true

  return session.expiresAt - SESSION_REFRESH_BUFFER_SECONDS > Math.floor(Date.now() / 1000)
}

export function cacheCloudSession(session: CloudAuthSession | null) {
  if (typeof window === 'undefined') return
  if (!session) {
    window.localStorage.removeItem(SESSION_CACHE_KEY)
    return
  }
  window.localStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(session))
}

export async function signInWithTelegram(initData: string): Promise<TelegramAuthResult | null> {
  if (!isSupabaseConfigured || !initData) return null

  const result = await supabaseFetch<{
    access_token: string
    refresh_token?: string
    expires_at?: number
    user: {
      id: string
      telegram_id: string
      username?: string
      first_name?: string
      last_name?: string
      avatar_url?: string
    }
  }>('/functions/v1/telegram-auth', {
    method: 'POST',
    body: JSON.stringify({ initData }),
  })

  const session: CloudAuthSession = {
    accessToken: result.access_token,
    refreshToken: result.refresh_token,
    expiresAt: result.expires_at,
    userId: result.user.id,
  }

  cacheCloudSession(session)

  return {
    session,
    user: {
      cloudUserId: result.user.id,
      telegramId: result.user.telegram_id,
      username: result.user.username || 'learner',
      firstName: result.user.first_name || 'Learner',
      lastName: result.user.last_name,
      photoUrl: result.user.avatar_url,
    },
  }
}

type SupabaseEmailAuthResponse = {
  access_token?: string
  refresh_token?: string
  expires_at?: number
  expires_in?: number
  user?: {
    id: string
    email?: string
    user_metadata?: {
      name?: string
      first_name?: string
      full_name?: string
    }
  }
  session?: {
    access_token: string
    refresh_token?: string
    expires_at?: number
    expires_in?: number
  } | null
}

function buildEmailSession(result: SupabaseEmailAuthResponse) {
  const token = result.access_token ?? result.session?.access_token
  const refreshToken = result.refresh_token ?? result.session?.refresh_token
  const expiresAt =
    result.expires_at ??
    result.session?.expires_at ??
    (result.expires_in ?? result.session?.expires_in
      ? Math.floor(Date.now() / 1000) + (result.expires_in ?? result.session?.expires_in ?? 0)
      : undefined)
  const userId = result.user?.id

  if (!token || !userId) {
    throw new Error('Email confirmation may be required before login.')
  }

  const session: CloudAuthSession = {
    accessToken: token,
    refreshToken,
    expiresAt,
    userId,
    email: result.user?.email,
  }

  cacheCloudSession(session)
  return session
}

async function upsertEmailProfile(session: CloudAuthSession, params: { email: string; name?: string }) {
  const emailName = params.email.split('@')[0] || 'tester'
  const displayName = params.name?.trim() || emailName

  await supabaseFetch('/rest/v1/users', {
    method: 'POST',
    accessToken: session.accessToken,
    headers: {
      Prefer: 'resolution=merge-duplicates',
    },
    body: JSON.stringify({
      id: session.userId,
      username: emailName,
      first_name: displayName,
      updated_at: new Date().toISOString(),
    }),
  })

  return {
    cloudUserId: session.userId,
    username: emailName,
    firstName: displayName,
  } satisfies Partial<User>
}

export async function signUpWithEmail(params: { email: string; password: string; name: string }): Promise<EmailAuthResult> {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.')

  const result = await supabaseFetch<SupabaseEmailAuthResponse>('/auth/v1/signup', {
    method: 'POST',
    body: JSON.stringify({
      email: params.email,
      password: params.password,
      data: {
        name: params.name,
        first_name: params.name,
      },
    }),
  })

  const session = buildEmailSession(result)
  const user = await upsertEmailProfile(session, { email: params.email, name: params.name })

  return { session, user }
}

export async function signInWithEmail(params: { email: string; password: string }): Promise<EmailAuthResult> {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.')

  const result = await supabaseFetch<SupabaseEmailAuthResponse>('/auth/v1/token?grant_type=password', {
    method: 'POST',
    body: JSON.stringify({
      email: params.email,
      password: params.password,
    }),
  })

  const session = buildEmailSession(result)
  const user = await upsertEmailProfile(session, { email: params.email, name: result.user?.user_metadata?.name ?? result.user?.user_metadata?.first_name })

  return { session, user }
}

export function logoutCloudAccount() {
  cacheCloudSession(null)
}
