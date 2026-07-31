'use client'

import { useEffect } from 'react'
import { ArrowLeft, CheckCircle2, Cloud, CloudOff, LogOut, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SparrowMascot } from '@/components/sparrow-mascot'
import { useAppStore } from '@/lib/store'
import { useTelegram } from '@/hooks/use-telegram'
import { logoutCloudAccount } from '@/lib/auth'

export function AccountScreen() {
  const user = useAppStore((state) => state.user)
  const syncStatus = useAppStore((state) => state.syncStatus)
  const syncError = useAppStore((state) => state.syncError)
  const cloudSession = useAppStore((state) => state.cloudSession)
  const setCloudSession = useAppStore((state) => state.setCloudSession)
  const setAuthProfile = useAppStore((state) => state.setAuthProfile)
  const setScreen = useAppStore((state) => state.setScreen)
  const setUser = useAppStore((state) => state.setUser)
  const { hapticFeedback, showBackButton, hideBackButton } = useTelegram()

  useEffect(() => {
    showBackButton(() => {
      hideBackButton()
      setScreen('profile')
    })
    return () => hideBackButton()
  }, [hideBackButton, setScreen, showBackButton])

  const handleLogout = () => {
    hapticFeedback('warning')
    logoutCloudAccount()
    setCloudSession(null)
    setAuthProfile(null)
    setUser(null)
    setScreen('auth')
  }

  return (
    <div className="tilio-shell flex flex-col">
      <header className="sticky top-0 z-10 safe-area-top">
        <div className="tilio-container px-4 py-3">
          <div className="flex items-center gap-4 rounded-[1.6rem] border border-white/70 bg-white/80 px-3 py-2 shadow-lg shadow-emerald-950/5 backdrop-blur-xl">
            <button onClick={() => setScreen('profile')} className="tilio-pressed flex size-10 items-center justify-center rounded-full bg-emerald-50 text-muted-foreground" aria-label="Go back">
              <ArrowLeft className="size-6" />
            </button>
            <div>
              <h1 className="text-xl font-black">Account</h1>
              <p className="text-xs font-semibold text-muted-foreground">Cloud progress and recovery</p>
            </div>
          </div>
        </div>
      </header>

      <main className="tilio-container flex-1 overflow-y-auto px-4 py-5 pb-24">
        <Card className="tilio-card rounded-[2rem] p-5 text-center">
          <SparrowMascot branded size="md" mood={cloudSession ? 'celebrating' : 'thinking'} className="mx-auto" />
          <h2 className="mt-3 text-2xl font-black">{cloudSession ? 'Cloud account active' : 'Guest mode active'}</h2>
          <p className="mt-2 text-sm font-semibold text-muted-foreground">
            {cloudSession
              ? 'Your XP, streaks, feathers, lessons, achievements, and settings are saved to the cloud.'
              : 'Your progress is saved on this device. Sign in with Telegram, Google, or email when you want cloud backup.'}
          </p>
          <div className="mt-4 rounded-2xl bg-emerald-50/80 p-3 text-left">
            <p className="text-sm font-black">{user?.firstName ?? 'Learner'}</p>
            <p className="text-xs font-semibold text-muted-foreground">@{user?.username ?? 'tilio_user'}</p>
          </div>
        </Card>

        <Card className="mt-4 rounded-[1.75rem] border-white/70 bg-white/85 p-4 shadow-xl shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-primary">
              {syncStatus === 'synced' ? <CheckCircle2 className="size-6" /> : syncStatus === 'offline' || syncStatus === 'error' ? <CloudOff className="size-6" /> : <Cloud className="size-6" />}
            </div>
            <div>
              <p className="font-black">Sync status</p>
              <p className="text-sm font-semibold text-muted-foreground">
                {syncStatus === 'synced' ? 'Saved across devices' : syncStatus === 'saving' ? 'Saving progress...' : syncStatus === 'loading' ? 'Loading cloud progress...' : syncStatus === 'offline' ? 'Using offline cache' : syncStatus === 'error' ? 'Needs attention' : 'Ready'}
              </p>
            </div>
          </div>
          {syncError && <p className="mt-3 rounded-2xl bg-red-50 p-3 text-xs font-semibold text-red-700">{syncError}</p>}
        </Card>

        <Card className="mt-4 rounded-[1.75rem] border-white/70 bg-white/85 p-4 shadow-xl shadow-emerald-950/5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-1 size-5 text-primary" />
            <div>
              <p className="font-black">Recovery</p>
              <p className="mt-1 text-sm font-semibold text-muted-foreground">
                Telegram, Google, and email sign-in restore your cloud progress. The same profile is ready for future Android and iOS apps.
              </p>
            </div>
          </div>
        </Card>

        {!cloudSession && (
          <Button onClick={() => setScreen('auth')} className="mt-6 h-12 w-full rounded-2xl font-black">
            Sign in to continue
          </Button>
        )}

        <Button onClick={handleLogout} variant="outline" className="mt-6 h-12 w-full rounded-2xl border-red-200 text-red-600">
          <LogOut className="mr-2 size-4" />
          Log out on this device
        </Button>
      </main>
    </div>
  )
}
