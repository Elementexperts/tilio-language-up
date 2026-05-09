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
  LogOut
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
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border safe-area-top">
        <div className="flex items-center gap-4 px-4 py-3">
          <button
            onClick={handleBack}
            className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Profile</h1>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-4 py-6 pb-24">
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden mb-4">
            {user.photoUrl ? (
              <img 
                src={user.photoUrl} 
                alt={user.firstName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-primary font-bold text-4xl">
                {user.firstName.charAt(0)}
              </span>
            )}
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            {user.firstName} {user.lastName || ''}
          </h2>
          {user.username && (
            <p className="text-muted-foreground">@{user.username}</p>
          )}
          <p className="text-sm text-muted-foreground mt-1">
            Learning since {joinDate}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="p-4 text-center">
            <Zap className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{user.xp}</p>
            <p className="text-sm text-muted-foreground">Total XP</p>
          </Card>
          <Card className="p-4 text-center">
            <Flame className={cn(
              'w-6 h-6 mx-auto mb-2',
              user.streak > 0 ? 'text-orange-500' : 'text-muted-foreground'
            )} />
            <p className="text-2xl font-bold text-foreground">{user.streak}</p>
            <p className="text-sm text-muted-foreground">Day Streak</p>
          </Card>
          <Card className="p-4 text-center">
            <Book className="w-6 h-6 text-secondary-foreground mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{completedLessons}</p>
            <p className="text-sm text-muted-foreground">Lessons Done</p>
          </Card>
          <Card className="p-4 text-center">
            <Trophy className="w-6 h-6 text-accent mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{unlockedAchievements}</p>
            <p className="text-sm text-muted-foreground">Achievements</p>
          </Card>
        </div>

        {/* Progress Card */}
        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">Course Progress</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {completedLessons}/{totalLessons}
            </span>
          </div>
          <Progress value={progressPercent} className="h-3" />
          <p className="text-sm text-muted-foreground mt-2">
            {Math.round(progressPercent)}% complete
          </p>
        </Card>

        {/* Badges */}
        <Card className="p-4 mb-6">
          <h3 className="font-medium text-foreground mb-3">Badge Collection</h3>
          {unlockedBadges.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {unlockedBadges.slice(0, 6).map((badge) => (
                <div key={badge.id} className="rounded-xl bg-primary/10 border border-primary/20 px-3 py-2">
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
