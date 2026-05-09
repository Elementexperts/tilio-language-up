'use client'

import { useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useAppStore } from '@/lib/store'
import { useTelegram } from '@/hooks/use-telegram'
import { lessonsData, achievementsData } from '@/lib/data/lessons'
import { cn } from '@/lib/utils'
import { 
  ArrowLeft, 
  Zap, 
  Flame, 
  Book, 
  Trophy,
  Calendar,
  Target,
  Volume2,
  VolumeX,
  ChevronRight,
  LogOut,
  Feather,
  Sparkles
} from 'lucide-react'

export function ProfileScreen() {
  const user = useAppStore((state) => state.user)
  const isSoundEnabled = useAppStore((state) => state.isSoundEnabled)
  const toggleSound = useAppStore((state) => state.toggleSound)
  const setScreen = useAppStore((state) => state.setScreen)
  const setUser = useAppStore((state) => state.setUser)
  const { hapticFeedback, showBackButton, hideBackButton } = useTelegram()

  useEffect(() => {
    showBackButton(() => {
      hideBackButton()
      setScreen('home')
    })
    return () => hideBackButton()
  }, [showBackButton, hideBackButton, setScreen])

  if (!user) return null

  const completedLessons = user.completedLessons.length
  const totalLessons = lessonsData.length
  const progressPercent = (completedLessons / totalLessons) * 100

  const unlockedAchievements = achievementsData.filter((a) => {
    switch (a.requirement.type) {
      case 'xp': return user.xp >= a.requirement.value
      case 'streak': return user.streak >= a.requirement.value
      case 'lessons': return user.completedLessons.length >= a.requirement.value
      case 'referrals': return user.referralCount >= a.requirement.value
      default: return false
    }
  }).length
  const unlockedBadges = achievementsData.filter((a) => user.achievements.includes(a.id))

  const joinDate = (() => {
    const parsed = new Date(user.joinedAt)
    if (Number.isNaN(parsed.getTime())) return 'Unknown date'
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ]
    return `${months[parsed.getUTCMonth()]} ${parsed.getUTCFullYear()}`
  })()

  const handleBack = () => {
    hapticFeedback('light')
    setScreen('home')
  }

  const handleToggleSound = () => {
    hapticFeedback('light')
    toggleSound()
  }

  const handleLogout = () => {
    hapticFeedback('medium')
    setUser(null)
    setScreen('splash')
  }

  return (
    <div className="tilio-shell flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 safe-area-top">
        <div className="tilio-container px-4 py-3">
        <div className="flex items-center gap-4 rounded-[1.6rem] border border-white/70 bg-white/80 px-3 py-2 shadow-lg shadow-emerald-950/5 backdrop-blur-xl">
          <button
            onClick={handleBack}
            className="tilio-pressed flex size-10 items-center justify-center rounded-full bg-emerald-50 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-black text-foreground">Profile</h1>
        </div>
        </div>
      </header>

      {/* Content */}
      <main className="tilio-container flex-1 overflow-y-auto px-4 py-4 pb-24">
        {/* Profile Header */}
        <div className="mb-5 overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-50 to-lime-100 p-6 text-center shadow-xl shadow-emerald-950/8">
          <div className="mx-auto mb-4 flex size-24 items-center justify-center overflow-hidden rounded-[2rem] bg-primary/10 ring-4 ring-white">
            {user.photoUrl ? (
              <img 
                src={user.photoUrl} 
                alt={user.firstName}
                className="w-full h-full object-cover"
              />
            ) : (
                <span className="text-primary font-black text-4xl">
                {user.firstName.charAt(0)}
              </span>
            )}
          </div>
          <h2 className="text-2xl font-black text-foreground">
            {user.firstName} {user.lastName || ''}
          </h2>
          {user.username && (
            <p className="text-muted-foreground">@{user.username}</p>
          )}
          <p className="text-sm font-semibold text-muted-foreground mt-1">
            Learning since {joinDate}
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-white/80 p-2">
              <p className="text-xs font-bold text-muted-foreground">Level</p>
              <p className="text-xl font-black text-primary">{user.userLevel}</p>
            </div>
            <div className="rounded-2xl bg-white/80 p-2">
              <p className="text-xs font-bold text-muted-foreground">Feathers</p>
              <p className="inline-flex items-center justify-center gap-1 text-xl font-black text-emerald-700"><Feather className="size-4" />{user.feathers}</p>
            </div>
            <div className="rounded-2xl bg-white/80 p-2">
              <p className="text-xs font-bold text-muted-foreground">Freeze</p>
              <p className="text-xl font-black text-sky-600">{user.streakFreezes}</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="tilio-card rounded-[1.5rem] p-4 text-center">
            <Zap className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-black text-foreground">{user.xp}</p>
            <p className="text-sm text-muted-foreground">Total XP</p>
          </Card>
          <Card className="tilio-card rounded-[1.5rem] p-4 text-center">
            <Flame className={cn(
              'w-6 h-6 mx-auto mb-2',
              user.streak > 0 ? 'text-orange-500' : 'text-muted-foreground'
            )} />
            <p className="text-2xl font-black text-foreground">{user.streak}</p>
            <p className="text-sm text-muted-foreground">Day Streak</p>
          </Card>
          <Card className="tilio-card rounded-[1.5rem] p-4 text-center">
            <Book className="w-6 h-6 text-secondary-foreground mx-auto mb-2" />
            <p className="text-2xl font-black text-foreground">{completedLessons}</p>
            <p className="text-sm text-muted-foreground">Lessons Done</p>
          </Card>
          <Card className="tilio-card rounded-[1.5rem] p-4 text-center">
            <Trophy className="w-6 h-6 text-accent mx-auto mb-2" />
            <p className="text-2xl font-black text-foreground">{unlockedAchievements}</p>
            <p className="text-sm text-muted-foreground">Achievements</p>
          </Card>
        </div>

        {/* Progress Card */}
        <Card className="tilio-card rounded-[1.75rem] p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">Course Progress</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {completedLessons}/{totalLessons}
            </span>
          </div>
          <Progress value={progressPercent} className="tilio-progress h-3" />
          <p className="text-sm text-muted-foreground mt-2">
            {Math.round(progressPercent)}% complete
          </p>
        </Card>

        {/* Badges */}
        <Card className="tilio-card rounded-[1.75rem] p-4 mb-6">
          <h3 className="font-medium text-foreground mb-3">Badge Collection</h3>
          {unlockedBadges.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {unlockedBadges.slice(0, 6).map((badge) => (
                <div key={badge.id} className="rounded-xl bg-primary/10 border border-primary/20 px-3 py-2">
                  <Sparkles className="mb-1 size-4 text-accent" />
                  <p className="text-sm font-semibold">{badge.title}</p>
                  <p className="text-xs text-muted-foreground">Unlocked</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Complete challenges to unlock your first badge.</p>
          )}
        </Card>

        {/* Learning Path */}
        <Card className="p-4 mb-6">
          <h3 className="font-medium text-foreground mb-3">Learning Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Learning Path</span>
              <span className="text-sm font-medium text-foreground">
                {user.learningPath === 'uz-en' ? 'Uzbek to English' : 'English to Uzbek'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Level</span>
              <span className="text-sm font-medium text-foreground capitalize">
                {user.level}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Daily Goal</span>
              <span className="text-sm font-medium text-foreground">
                {user.dailyGoal} min/day
              </span>
            </div>
          </div>
        </Card>

        {/* Settings */}
        <Card className="mb-6 overflow-hidden">
          <button
            onClick={handleToggleSound}
            className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              {isSoundEnabled ? (
                <Volume2 className="w-5 h-5 text-muted-foreground" />
              ) : (
                <VolumeX className="w-5 h-5 text-muted-foreground" />
              )}
              <span className="font-medium text-foreground">Sound Effects</span>
            </div>
            <div className={cn(
              'w-12 h-7 rounded-full transition-colors relative',
              isSoundEnabled ? 'bg-primary' : 'bg-muted'
            )}>
              <div className={cn(
                'absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform',
                isSoundEnabled ? 'translate-x-6' : 'translate-x-1'
              )} />
            </div>
          </button>

          <div className="border-t border-border" />

          <button
            onClick={() => {
              hapticFeedback('light')
              setScreen('achievements')
            }}
            className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Trophy className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium text-foreground">Achievements</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>

          <div className="border-t border-border" />

          <button
            onClick={() => {
              hapticFeedback('light')
              setScreen('daily-challenges')
            }}
            className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium text-foreground">Daily Goals</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </Card>

        {/* Logout */}
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full h-12 text-destructive border-destructive/30 hover:bg-destructive/10"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Log Out
        </Button>
      </main>
    </div>
  )
}
