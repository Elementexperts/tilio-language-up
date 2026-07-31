import type { CloudAuthSession, User } from '@/lib/types'
import { getSupabaseConfig, isSupabaseConfigured, supabaseFetch } from '@/lib/supabase'

export interface TelegramAuthResult {
  session: CloudAuthSession
  user: Partial<User>
}

interface SupabaseAuthUser {
  id: string
  email?: string
  user_metadata?: {
    full_name?: string
    name?: string
    avatar_url?: string
    picture?: string
  }
}

interface SupabaseAuthSessionResponse {
  access_token?: string
  refresh_token?: string
  expires_in?: number
  expires_at?: number
  user?: SupabaseAuthUser
}

const SESSION_CACHE_KEY = 'tilio-cloud-session'

export function getCachedCloudSession(): CloudAuthSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(SESSION_CACHE_KEY)
    return raw ? JSON.parse(raw) as CloudAuthSession : null
  } catch {
    return null
  }
}

export function cacheCloudSession(session: CloudAuthSession | null) {
  if (typeof window === 'undefined') return
  if (!session) {
    window.localStorage.removeItem(SESSION_CACHE_KEY)
    return
  }
  window.localStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(session))
}

function authUserToProfile(user: SupabaseAuthUser): Partial<User> {
  const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Learner'
  const [firstName, ...restName] = displayName.trim().split(/\s+/)

  return {
    cloudUserId: user.id,
    id: user.id,
    username: user.email?.split('@')[0] || firstName || 'learner',
    firstName: firstName || 'Learner',
    lastName: restName.join(' ') || undefined,
    photoUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture,
  }
}

function createSessionFromAuthResponse(result: SupabaseAuthSessionResponse): CloudAuthSession {
  if (!result.access_token || !result.user?.id) {
    throw new Error('Sign in did not return an active session. Check your email to confirm your account, then sign in.')
  }

  return {
    accessToken: result.access_token,
    refreshToken: result.refresh_token,
    expiresAt: result.expires_at ?? (result.expires_in ? Math.floor(Date.now() / 1000) + result.expires_in : undefined),
    userId: result.user.id,
  }
}

async function upsertPublicUser(accessToken: string, authUser: SupabaseAuthUser) {
  const profile = authUserToProfile(authUser)
  await supabaseFetch('/rest/v1/users?on_conflict=id', {
    method: 'POST',
    accessToken,
    headers: {
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify({
      id: authUser.id,
      username: profile.username,
      first_name: profile.firstName,
      last_name: profile.lastName,
      avatar_url: profile.photoUrl,
      updated_at: new Date().toISOString(),
    }),
  })

  return profile
}

async function getCloudProfile(accessToken: string, authUser: SupabaseAuthUser) {
  try {
    return await upsertPublicUser(accessToken, authUser)
  } catch (error) {
    console.warn('Cloud profile sync failed after sign-in. Continuing with auth profile only.', error)
    return authUserToProfile(authUser)
  }
}

async function supabaseAuthRequest<T>(path: string, body: Record<string, unknown>) {
  const { url, anonKey } = getSupabaseConfig()
  const response = await fetch(`${url}${path}`, {
    method: 'POST',
    headers: {
      apikey: anonKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const payload = await response.json().catch(() => null) as T & { error_description?: string; msg?: string; message?: string } | null
  if (!response.ok) {
    throw new Error(payload?.error_description || payload?.msg || payload?.message || `Authentication failed with ${response.status}`)
  }

  return payload as T
}

export async function signInWithEmail(email: string, password: string): Promise<TelegramAuthResult> {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.')
  const result = await supabaseAuthRequest<SupabaseAuthSessionResponse>('/auth/v1/token?grant_type=password', { email, password })
  const session = createSessionFromAuthResponse(result)
  const user = await getCloudProfile(session.accessToken, result.user!)
  cacheCloudSession(session)
  return { session, user }
}

export async function signUpWithEmail(email: string, password: string, firstName: string): Promise<TelegramAuthResult> {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.')
  const result = await supabaseAuthRequest<SupabaseAuthSessionResponse>('/auth/v1/signup', {
    email,
    password,
    data: {
      full_name: firstName || email.split('@')[0],
    },
  })
  const session = createSessionFromAuthResponse(result)
  const user = await getCloudProfile(session.accessToken, result.user!)
  cacheCloudSession(session)
  return { session, user }
}

export function startGoogleSignIn() {
  if (typeof window === 'undefined') return
  const { url, anonKey } = getSupabaseConfig()
  const redirectTo = `${window.location.origin}${window.location.pathname}`
  const authorizeUrl = new URL(`${url}/auth/v1/authorize`)
  authorizeUrl.searchParams.set('provider', 'google')
  authorizeUrl.searchParams.set('redirect_to', redirectTo)
  authorizeUrl.searchParams.set('apikey', anonKey)
  window.location.href = authorizeUrl.toString()
}

export async function consumeOAuthSessionFromUrl(): Promise<TelegramAuthResult | null> {
  if (typeof window === 'undefined') return null
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  const accessToken = hash.get('access_token')
  if (!accessToken) return null

  const refreshToken = hash.get('refresh_token') ?? undefined
  const expiresIn = Number(hash.get('expires_in') ?? 0)
  const { url, anonKey } = getSupabaseConfig()
  const response = await fetch(`${url}/auth/v1/user`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) throw new Error('Could not load Google account profile.')
  const authUser = await response.json() as SupabaseAuthUser
  const session: CloudAuthSession = {
    accessToken,
    refreshToken,
    expiresAt: expiresIn ? Math.floor(Date.now() / 1000) + expiresIn : undefined,
    userId: authUser.id,
  }
  const user = await getCloudProfile(accessToken, authUser)
  cacheCloudSession(session)
  window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
  return { session, user }
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
      plan?: 'free' | 'plus'
      plus_expires_at?: string | null
      plus_source?: string | null
      plus_updated_at?: string | null
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
      plan: result.user.plan ?? 'free',
      plusExpiresAt: result.user.plus_expires_at ?? null,
      plusSource: result.user.plus_source as Partial<User>['plusSource'],
      plusUpdatedAt: result.user.plus_updated_at ?? null,
    },
  }
}

export function logoutCloudAccount() {
  cacheCloudSession(null)
}
