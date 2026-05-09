'use client'

import { cn } from '@/lib/utils'

interface SparrowMascotProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  mood?: 'happy' | 'thinking' | 'celebrating' | 'sad' | 'waving'
  className?: string
  animate?: boolean
}

export function SparrowMascot({ 
  size = 'md', 
  mood = 'happy', 
  className,
  animate = true 
}: SparrowMascotProps) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48',
  }

  const getMoodEmoji = () => {
    switch (mood) {
      case 'happy': return '😊'
      case 'thinking': return '🤔'
      case 'celebrating': return '🎉'
      case 'sad': return '😢'
      case 'waving': return '👋'
      default: return '😊'
    }
  }

  return (
    <div 
      className={cn(
        'relative flex items-center justify-center',
        sizeClasses[size],
        animate && mood === 'celebrating' && 'animate-bounce-in',
        animate && mood === 'happy' && 'animate-float',
        className
      )}
    >
      {/* Sparrow Body */}
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full"
        aria-label={`Tilio sparrow mascot - ${mood} mood`}
      >
        {/* Shadow */}
        <ellipse 
          cx="50" cy="90" rx="25" ry="6" 
          fill="rgba(0,0,0,0.1)"
        />
        
        {/* Body */}
        <ellipse 
          cx="50" cy="55" rx="28" ry="30" 
          fill="#4ADE80"
          className="drop-shadow-md"
        />
        
        {/* Belly */}
        <ellipse 
          cx="50" cy="62" rx="20" ry="22" 
          fill="#F0FDF4"
        />
        
        {/* Head */}
        <circle 
          cx="50" cy="28" r="22" 
          fill="#4ADE80"
          className="drop-shadow-md"
        />
        
        {/* Face */}
        <circle 
          cx="50" cy="30" r="17" 
          fill="#F0FDF4"
        />
        
        {/* Left Eye */}
        <ellipse 
          cx="43" cy="26" rx="4" ry="5" 
          fill="#1F2937"
        />
        <circle 
          cx="44" cy="24" r="1.5" 
          fill="white"
        />
        
        {/* Right Eye */}
        <ellipse 
          cx="57" cy="26" rx="4" ry="5" 
          fill="#1F2937"
        />
        <circle 
          cx="58" cy="24" r="1.5" 
          fill="white"
        />
        
        {/* Beak */}
        <path 
          d="M 45 33 Q 50 40 55 33 L 50 37 Z" 
          fill="#F97316"
          stroke="#EA580C"
          strokeWidth="0.5"
        />
        
        {/* Blush - Left */}
        <ellipse 
          cx="37" cy="32" rx="4" ry="2.5" 
          fill="#FDA4AF"
          opacity="0.6"
        />
        
        {/* Blush - Right */}
        <ellipse 
          cx="63" cy="32" rx="4" ry="2.5" 
          fill="#FDA4AF"
          opacity="0.6"
        />
        
        {/* Left Wing */}
        <ellipse 
          cx="22" cy="50" rx="12" ry="18" 
          fill="#22C55E"
          transform="rotate(-15 22 50)"
          className={cn(
            animate && mood === 'waving' && 'animate-[wave_0.5s_ease-in-out_infinite]',
            animate && mood === 'celebrating' && 'animate-[wave_0.3s_ease-in-out_infinite]'
          )}
          style={{ transformOrigin: '22px 50px' }}
        />
        
        {/* Right Wing */}
        <ellipse 
          cx="78" cy="50" rx="12" ry="18" 
          fill="#22C55E"
          transform="rotate(15 78 50)"
        />
        
        {/* Tuft */}
        <path 
          d="M 45 8 Q 50 2 50 10 Q 50 2 55 8" 
          stroke="#22C55E"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Feet */}
        <path 
          d="M 40 82 L 35 90 M 40 82 L 40 90 M 40 82 L 45 90" 
          stroke="#F97316"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path 
          d="M 60 82 L 55 90 M 60 82 L 60 90 M 60 82 L 65 90" 
          stroke="#F97316"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        
        {/* Mood indicators */}
        {mood === 'happy' && (
          <>
            {/* Smile */}
            <path 
              d="M 44 35 Q 50 39 56 35" 
              stroke="#1F2937"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
          </>
        )}
        
        {mood === 'thinking' && (
          <>
            {/* Thinking bubbles */}
            <circle cx="75" cy="15" r="2" fill="#9CA3AF" />
            <circle cx="80" cy="10" r="3" fill="#9CA3AF" />
            <circle cx="87" cy="5" r="4" fill="#9CA3AF" />
          </>
        )}
        
        {mood === 'celebrating' && (
          <>
            {/* Confetti stars */}
            <text x="15" y="15" fontSize="8" className="animate-confetti">✨</text>
            <text x="80" y="20" fontSize="8" className="animate-confetti" style={{ animationDelay: '0.2s' }}>⭐</text>
            <text x="25" y="25" fontSize="6" className="animate-confetti" style={{ animationDelay: '0.4s' }}>🎊</text>
          </>
        )}
        
        {mood === 'sad' && (
          <>
            {/* Sad eyes */}
            <path 
              d="M 44 37 Q 50 34 56 37" 
              stroke="#1F2937"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
          </>
        )}
      </svg>
      
      {/* Mood indicator for accessibility */}
      <span className="sr-only">{getMoodEmoji()} {mood}</span>
    </div>
  )
}
