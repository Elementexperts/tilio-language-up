'use client'

import { CheckCircle2, Cloud, CloudOff, Loader2 } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

export function CloudSyncIndicator() {
  const syncStatus = useAppStore((state) => state.syncStatus)
  const hasSession = useAppStore((state) => Boolean(state.cloudSession))
  const hasUser = useAppStore((state) => Boolean(state.user))

  if (!hasUser) return null

  const label = !hasSession
    ? 'Local progress'
    : syncStatus === 'loading'
      ? 'Loading progress'
      : syncStatus === 'saving'
        ? 'Saving'
        : syncStatus === 'synced'
          ? 'Cloud synced'
          : syncStatus === 'offline'
            ? 'Offline cache'
            : syncStatus === 'error'
              ? 'Sync issue'
              : 'Cloud ready'

  const Icon = !hasSession
    ? CloudOff
    : syncStatus === 'saving' || syncStatus === 'loading'
    ? Loader2
    : syncStatus === 'offline' || syncStatus === 'error'
      ? CloudOff
      : syncStatus === 'synced'
        ? CheckCircle2
        : Cloud

  return (
    <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 pointer-events-none">
      <div
        className={cn(
          'inline-flex items-center gap-2 rounded-full border bg-white/88 px-3 py-1.5 text-xs font-black shadow-lg backdrop-blur-xl',
          syncStatus === 'error' && 'border-red-100 text-red-700',
          syncStatus === 'offline' && 'border-amber-100 text-amber-700',
          !hasSession && 'border-sky-100 text-sky-700',
          hasSession && syncStatus !== 'error' && syncStatus !== 'offline' && 'border-emerald-100 text-emerald-800'
        )}
      >
        <Icon className={cn('size-3.5', (syncStatus === 'saving' || syncStatus === 'loading') && 'animate-spin')} />
        {label}
      </div>
    </div>
  )
}
