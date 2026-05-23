import type { CloudAuthSession, User } from '@/lib/types'
import { isSupabaseConfigured, supabaseFetch } from '@/lib/supabase'

export interface TelegramAuthResult {
  session: CloudAuthSession
  user: Partial<User>
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
