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
  Sparkles,
  Languages
} from 'lucide-react'

export function ProfileScreen() {
  const user = useAppStore((state) => state.user)
  const isSoundEnabled = useAppStore((state) => state.isSoundEnabled)
  const toggleSound = useAppStore((state) => state.toggleSound)
  const setScreen = useAppStore((state) => state.setScreen)
  const setUser = useAppStore((state) => state.setUser)
  const updateUser = useAppStore((state) => state.updateUser)
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
  const avatarSrc = user.photoUrl ?? (user.avatarStyle === 'girl' ? '/avatars/tilio-girl-avatar.png' : '/avatars/tilio-boy-avatar.png')

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

  const handleLearningPathChange = (learningPath: 'uz-en' | 'en-uz') => {
    hapticFeedback('light')
    updateUser({ learningPath })
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
            <img src={avatarSrc} alt={user.firstName} className="h-full w-full object-cover" />
          </div>
          <h2 className="text-2xl font-black text-foreground">
            {user.firstName} {user.lastName || ''}
          </h2>
          {user.username && (
            <p className="text-muted-foreground">@{user.username}</p>
          )}
          <p className="text-sm font-semibold text-muted-foreground mt-1">
            {joinDate} dan beri o‘rganmoqda
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-white/80 p-2">
              <p className="text-xs font-bold text-muted-foreground">Daraja</p>
              <p className="text-xl font-black text-primary">{user.userLevel}</p>
            </div>
            <div className="rounded-2xl bg-white/80 p-2">
              <p className="text-xs font-bold text-muted-foreground">Patlar</p>
              <p className="inline-flex items-center justify-center gap-1 text-xl font-black text-emerald-700"><Feather className="size-4" />{user.feathers}</p>
            </div>
            <div className="rounded-2xl bg-white/80 p-2">
              <p className="text-xs font-bold text-muted-foreground">Himoya</p>
              <p className="text-xl font-black text-sky-600">{user.streakFreezes}</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="tilio-card rounded-[1.5rem] p-4 text-center">
            <Zap className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-black text-foreground">{user.xp}</p>
            <p className="text-sm text-muted-foreground">Jami XP</p>
          </Card>
          <Card className="tilio-card rounded-[1.5rem] p-4 text-center">
            <Flame className={cn(
              'w-6 h-6 mx-auto mb-2',
              user.streak > 0 ? 'text-orange-500' : 'text-muted-foreground'
            )} />
            <p className="text-2xl font-black text-foreground">{user.streak}</p>
            <p className="text-sm text-muted-foreground">Ketma-ket kun</p>
          </Card>
          <Card className="tilio-card rounded-[1.5rem] p-4 text-center">
            <Book className="w-6 h-6 text-secondary-foreground mx-auto mb-2" />
            <p className="text-2xl font-black text-foreground">{completedLessons}</p>
            <p className="text-sm text-muted-foreground">Darslar</p>
          </Card>
          <Card className="tilio-card rounded-[1.5rem] p-4 text-center">
            <Trophy className="w-6 h-6 text-accent mx-auto mb-2" />
            <p className="text-2xl font-black text-foreground">{unlockedAchievements}</p>
            <p className="text-sm text-muted-foreground">Nishonlar</p>
          </Card>
        </div>

        {/* Progress Card */}
        <Card className="tilio-card rounded-[1.75rem] p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">Kurs progressi</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {completedLessons}/{totalLessons}
            </span>
          </div>
          <Progress value={progressPercent} className="tilio-progress h-3" />
          <p className="text-sm text-muted-foreground mt-2">
            {Math.round(progressPercent)}% yakunlandi. Har bir dars sizni erkinroq gapirishga yaqinlashtiradi.
          </p>
        </Card>

        {/* Badges */}
        <Card className="tilio-card rounded-[1.75rem] p-4 mb-6">
          <h3 className="font-medium text-foreground mb-3">Nishonlar to‘plami</h3>
          {unlockedBadges.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {unlockedBadges.slice(0, 6).map((badge) => (
                <div key={badge.id} className="rounded-xl bg-primary/10 border border-primary/20 px-3 py-2">
                  <Sparkles className="mb-1 size-4 text-accent" />
                  <p className="text-sm font-semibold">{badge.title}</p>
                  <p className="text-xs text-muted-foreground">Ochilgan</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Birinchi nishonni ochish uchun kunlik vazifani bajaring.</p>
          )}
        </Card>

        <Card className="tilio-card rounded-[1.75rem] p-4 mb-6">
          <h3 className="font-black text-foreground mb-2">Bugungi maslahat</h3>
          <p className="text-sm text-muted-foreground">
            Har kuni 5 daqiqa mashq qilsangiz, yangi so‘zlar xotirada mustahkamroq qoladi.
          </p>
          <div className="mt-3 rounded-2xl bg-emerald-50/80 p-3 text-sm font-semibold text-emerald-900">
            Maqsad: {user.dailyGoal} daqiqa / kun. Davom eting, {user.firstName}!
          </div>
        </Card>

        <Card className="tilio-card rounded-[1.75rem] p-4 mb-6">
          <h3 className="font-medium text-foreground mb-3">Interface preference</h3>
          <div className="mb-3 flex items-center gap-2">
            <Languages className="size-5 text-primary" />
            <p className="text-sm text-muted-foreground">
              UZ -&gt; EN shows English words first with English pronunciation. EN -&gt; UZ shows Uzbek words first.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-emerald-50/70 p-1.5">
            <button
              type="button"
              onClick={() => handleLearningPathChange('uz-en')}
              className={cn(
                'tilio-pressed rounded-xl px-3 py-2 text-sm font-black transition-all',
                user.learningPath === 'uz-en'
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'text-emerald-900 hover:bg-white/70'
              )}
            >
              UZ -&gt; EN
            </button>
            <button
              type="button"
              onClick={() => handleLearningPathChange('en-uz')}
              className={cn(
                'tilio-pressed rounded-xl px-3 py-2 text-sm font-black transition-all',
                user.learningPath === 'en-uz'
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'text-emerald-900 hover:bg-white/70'
              )}
            >
              EN -&gt; UZ
            </button>
          </div>
        </Card>

        {/* Learning Path */}
        <Card className="p-4 mb-6">
          <h3 className="font-medium text-foreground mb-3">O‘rganish sozlamalari</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Yo‘nalish</span>
              <span className="text-sm font-medium text-foreground">
                {user.learningPath === 'uz-en' ? 'O‘zbekcha → English' : 'English → O‘zbekcha'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Bosqich</span>
              <span className="text-sm font-medium text-foreground capitalize">
                {user.level}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Kunlik maqsad</span>
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
              <span className="font-medium text-foreground">Ovoz effektlari</span>
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
              <span className="font-medium text-foreground">Nishonlar</span>
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
              <span className="font-medium text-foreground">Kunlik maqsadlar</span>
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
          Chiqish
        </Button>
      </main>
    </div>
  )
}
