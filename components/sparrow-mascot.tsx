'use client'

import { cn } from '@/lib/utils'

interface SparrowMascotProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  mood?: 'happy' | 'thinking' | 'celebrating' | 'sad' | 'waving'
  className?: string
  animate?: boolean
  branded?: boolean
}

export function SparrowMascot({
  size = 'md',
  mood = 'happy',
  className,
  animate = true,
  branded = true,
}: SparrowMascotProps) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48',
  }

  if (branded) {
    return (
      <div
        className={cn(
          'relative flex items-center justify-center overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-50 to-lime-100 shadow-xl shadow-emerald-900/10',
          sizeClasses[size],
          animate && 'animate-float',
          className,
        )}
      >
        <img
          src="/tilio-mascot-brand.png"
          alt={`Tilio sparrow mascot - ${mood}`}
          className="h-full w-full scale-[1.72] object-cover object-[82%_47%]"
          draggable={false}
        />
        <div className="absolute inset-x-3 bottom-2 h-4 rounded-full bg-emerald-950/10 blur-md" />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'relative flex items-center justify-center',
        sizeClasses[size],
        animate && mood === 'celebrating' && 'animate-bounce-in',
        animate && mood === 'happy' && 'animate-float',
        className,
      )}
    >
      <svg
        viewBox="0 0 100 100"
        className="h-full w-full drop-shadow-lg"
        aria-label={`Tilio sparrow mascot - ${mood} mood`}
      >
        <ellipse cx="50" cy="90" rx="25" ry="6" fill="rgba(0,0,0,0.1)" />
        <ellipse cx="50" cy="55" rx="28" ry="30" fill="#8B5E34" />
        <ellipse cx="50" cy="62" rx="20" ry="22" fill="#FFF7E6" />
        <circle cx="50" cy="28" r="22" fill="#A06A3A" />
        <circle cx="50" cy="30" r="17" fill="#FFF7E6" />
        <path d="M35 17 C41 6 59 6 65 17 C59 12 41 12 35 17Z" fill="#6B3F1F" />
        <ellipse cx="43" cy="26" rx="4.5" ry="5.5" fill="#1F2937" />
        <circle cx="44.5" cy="24" r="1.7" fill="white" />
        <ellipse cx="57" cy="26" rx="4.5" ry="5.5" fill="#1F2937" />
        <circle cx="58.5" cy="24" r="1.7" fill="white" />
        <path d="M45 33 Q50 41 55 33 L50 37Z" fill="#F59E0B" stroke="#D97706" strokeWidth="0.7" />
        <ellipse cx="37" cy="33" rx="4" ry="2.5" fill="#FDA4AF" opacity="0.65" />
        <ellipse cx="63" cy="33" rx="4" ry="2.5" fill="#FDA4AF" opacity="0.65" />
        <ellipse
          cx="24"
          cy="50"
          rx="12"
          ry="19"
          fill="#7C4A25"
          transform="rotate(-18 24 50)"
          className={cn(
            animate && mood === 'waving' && 'animate-[wave_0.5s_ease-in-out_infinite]',
            animate && mood === 'celebrating' && 'animate-[wave_0.3s_ease-in-out_infinite]',
          )}
          style={{ transformOrigin: '24px 50px' }}
        />
        <ellipse cx="76" cy="50" rx="12" ry="19" fill="#7C4A25" transform="rotate(18 76 50)" />
        <path d="M39 82 L35 90 M39 82 L40 90 M39 82 L45 90" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M61 82 L55 90 M61 82 L60 90 M61 82 L65 90" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />

        {mood === 'happy' && <path d="M44 35 Q50 39 56 35" stroke="#1F2937" strokeWidth="1.5" fill="none" strokeLinecap="round" />}
        {mood === 'thinking' && (
          <>
            <circle cx="75" cy="15" r="2" fill="#A3A3A3" />
            <circle cx="80" cy="10" r="3" fill="#A3A3A3" />
            <circle cx="87" cy="5" r="4" fill="#A3A3A3" />
          </>
        )}
        {mood === 'celebrating' && (
          <>
            <circle cx="16" cy="14" r="2.5" fill="#FACC15" className="animate-confetti" />
            <circle cx="80" cy="20" r="2.5" fill="#22C55E" className="animate-confetti" style={{ animationDelay: '0.2s' }} />
            <rect x="24" y="22" width="4" height="4" rx="1" fill="#F97316" className="animate-confetti" style={{ animationDelay: '0.4s' }} />
          </>
        )}
        {mood === 'sad' && <path d="M44 37 Q50 34 56 37" stroke="#1F2937" strokeWidth="1.5" fill="none" strokeLinecap="round" />}
      </svg>
      <span className="sr-only">{mood} mascot</span>
    </div>
  )
}
