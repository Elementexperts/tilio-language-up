import type { PlusSource, User } from '@/lib/types'

export const PLUS_CHAT_DAILY_LIMIT = 3

export const plusBenefits = [
  {
    title: 'Expanded AI Chat',
    description: 'Ask more questions, get guided examples, and practice real replies.',
  },
  {
    title: 'Practice Mode',
    description: 'Train weak words with focused drills after each lesson.',
  },
  {
    title: 'Smart Review Advanced',
    description: 'See harder review cards, due words, and mistake-based repetition.',
  },
  {
    title: 'Weekly Insights',
    description: 'Track XP, streak health, word growth, and your best learning days.',
  },
  {
    title: 'Premium Rewards',
    description: 'Unlock brighter reward moments, cosmetics, and special boosts.',
  },
] as const

export const plusPaymentMethods: Array<{
  id: PlusSource
  title: string
  description: string
  status: 'soon' | 'later'
}> = [
  {
    id: 'telegram_stars',
    title: 'Telegram Stars',
    description: 'Best first fit for Telegram Mini App subscriptions.',
    status: 'soon',
  },
  {
    id: 'click',
    title: 'Click / Payme',
    description: 'Local Uzbek payment options for web checkout.',
    status: 'soon',
  },
  {
    id: 'google_play',
    title: 'Google Play',
    description: 'Reserved for the future Android app.',
    status: 'later',
  },
]

export function isPlusActive(user?: Pick<User, 'plan' | 'plusExpiresAt'> | null) {
  if (!user || user.plan !== 'plus' || !user.plusExpiresAt) return false
  const expiresAt = new Date(user.plusExpiresAt).getTime()
  return Number.isFinite(expiresAt) && expiresAt > Date.now()
}

export function getPlusDaysRemaining(user?: Pick<User, 'plan' | 'plusExpiresAt'> | null) {
  if (!isPlusActive(user)) return 0
  const diff = new Date(user!.plusExpiresAt!).getTime() - Date.now()
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export function getTodayKey() {
  return new Date().toISOString().split('T')[0]
}

export function getPlusChatUsage(user?: User | null) {
  const today = getTodayKey()
  if (!user?.plusChatUsage || user.plusChatUsage.date !== today) {
    return { date: today, count: 0 }
  }
  return user.plusChatUsage
}

export function getPlusChatMessagesLeft(user?: User | null) {
  if (isPlusActive(user)) return Number.POSITIVE_INFINITY
  const usage = getPlusChatUsage(user)
  return Math.max(0, PLUS_CHAT_DAILY_LIMIT - usage.count)
}

export function canUsePlusChat(user?: User | null) {
  return isPlusActive(user) || getPlusChatMessagesLeft(user) > 0
}
