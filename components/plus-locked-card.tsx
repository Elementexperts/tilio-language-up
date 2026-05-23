'use client'

import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { isPlusActive } from '@/lib/plus'
import { cn } from '@/lib/utils'
import { Crown, Lock, Sparkles } from 'lucide-react'

export function PlusBadge({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-black text-amber-800', className)}>
      <Crown className="size-3.5" />
      Plus
    </span>
  )
}

export function PlusLockedCard({
  title,
  description,
  icon,
  unlockedLabel = 'Included',
  compact = false,
}: {
  title: string
  description: string
  icon: ReactNode
  unlockedLabel?: string
  compact?: boolean
}) {
  const user = useAppStore((state) => state.user)
  const setScreen = useAppStore((state) => state.setScreen)
  const active = isPlusActive(user)

  return (
    <button
      type="button"
      onClick={() => {
        if (!active) setScreen('upgrade')
      }}
      className={cn(
        'tilio-pressed w-full rounded-[1.45rem] border p-3 text-left shadow-lg shadow-emerald-950/5 transition-all',
        active ? 'border-emerald-200 bg-white/90' : 'border-amber-200/80 bg-gradient-to-br from-white/90 to-amber-50/70',
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn('flex shrink-0 items-center justify-center rounded-2xl', compact ? 'size-11' : 'size-12', active ? 'bg-primary/10 text-primary' : 'bg-amber-100 text-amber-700')}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="font-black leading-tight">{title}</p>
            {active ? (
              <span className="shrink-0 rounded-full bg-primary/10 px-2 py-1 text-[11px] font-black text-primary">{unlockedLabel}</span>
            ) : (
              <Lock className="size-4 shrink-0 text-amber-700" />
            )}
          </div>
          <p className="mt-1 text-xs font-semibold leading-4 text-muted-foreground">{description}</p>
          {!active && !compact && (
            <Button
              type="button"
              size="sm"
              className="mt-3 h-9 rounded-xl px-3 font-black"
              onClick={(event) => {
                event.stopPropagation()
                setScreen('upgrade')
              }}
            >
              <Sparkles className="size-4" />
              Unlock Plus
            </Button>
          )}
        </div>
      </div>
    </button>
  )
}
