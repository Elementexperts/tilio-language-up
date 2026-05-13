'use client'

import { useEffect } from 'react'
import type { ElementType } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SparrowMascot } from '@/components/sparrow-mascot'
import { useAppStore } from '@/lib/store'
import { useTelegram } from '@/hooks/use-telegram'
import { storeItemsData } from '@/lib/data/lessons'
import { cn } from '@/lib/utils'
import { ArrowLeft, BadgeCheck, BarChart3, BookOpenCheck, Brain, Check, Cloud, Feather, Landmark, Leaf, Map, MessageCircle, Palette, Shield, ShoppingBag, Snowflake, Sparkles, Wand2, Zap } from 'lucide-react'
import type { StoreItem } from '@/lib/types'

const wallpaperItems: StoreItem[] = [
  {
    id: 'classic-green',
    name: 'Classic Green',
    description: 'Original bright Tilio wallpaper.',
    type: 'wallpaper',
    price: 0,
    icon: 'leaf',
    preview: 'classic',
  },
  {
    id: 'wallpaper-samarqand-morning',
    name: 'Samarqand Morning',
    description: 'Light domes, mint sky, and calm study energy.',
    type: 'wallpaper',
    price: 90,
    icon: 'dome',
    preview: 'samarqand',
  },
  {
    id: 'wallpaper-silk-road',
    name: 'Silk Road Path',
    description: 'Soft golden path with airy Uzbek patterns.',
    type: 'wallpaper',
    price: 120,
    icon: 'path',
    preview: 'silk-road',
  },
  {
    id: 'wallpaper-orchard',
    name: 'Orchard Garden',
    description: 'Fresh green garden with gentle premium depth.',
    type: 'wallpaper',
    price: 140,
    icon: 'garden',
    preview: 'orchard',
  },
  {
    id: 'wallpaper-cotton-sky',
    name: 'Cotton Sky',
    description: 'Clean sky-blue wallpaper for focused lessons.',
    type: 'wallpaper',
    price: 160,
    icon: 'cloud',
    preview: 'cotton',
  },
]

const itemIcons = {
  theme: Palette,
  wallpaper: Palette,
  frame: BadgeCheck,
  outfit: Wand2,
  color: Sparkles,
  lesson_pack: Shield,
}

const wallpaperPreviewClass: Record<string, string> = {
  'classic-green': 'from-emerald-100 via-lime-50 to-green-200',
  'wallpaper-samarqand-morning': 'from-sky-100 via-emerald-50 to-lime-100',
  'wallpaper-silk-road': 'from-amber-100 via-lime-50 to-emerald-100',
  'wallpaper-orchard': 'from-green-100 via-emerald-50 to-lime-200',
  'wallpaper-cotton-sky': 'from-sky-100 via-white to-emerald-100',
}

const wallpaperImage: Record<string, string> = {
  'classic-green': '/wallpapers/classic-green.png',
  'wallpaper-samarqand-morning': '/wallpapers/samarqand-morning.png',
  'wallpaper-silk-road': '/wallpapers/silk-road-path.png',
  'wallpaper-orchard': '/wallpapers/orchard-garden.png',
  'wallpaper-cotton-sky': '/wallpapers/cotton-sky.png',
}

const wallpaperIcon: Record<string, ElementType> = {
  leaf: Leaf,
  dome: Landmark,
  path: Map,
  garden: Leaf,
  cloud: Cloud,
}

const plusFeatureCards = [
  {
    title: 'Premium Practice Mode',
    description: 'Extra speaking, listening, and mixed review sessions after daily lessons.',
    icon: BookOpenCheck,
    status: 'Planned',
  },
  {
    title: 'Smart Review',
    description: 'A focused weak-word queue based on mistakes, misses, and old lesson history.',
    icon: Brain,
    status: 'Planned',
  },
  {
    title: 'AI Conversation Practice',
    description: 'Guided Uzbek, English, and Korean conversations with a Tilio tutor.',
    icon: MessageCircle,
    status: 'Next',
  },
  {
    title: 'Weekly Insights',
    description: 'Progress reports with active days, skill balance, strongest words, and next goals.',
    icon: BarChart3,
    status: 'Planned',
  },
]

const plusRewards = [
  'Unlimited smart reviews',
  'Extra Streak Freezes',
  'Premium themes and frames',
  'Weekly progress insights',
]

export function StoreScreen() {
  const user = useAppStore((state) => state.user)
  const setScreen = useAppStore((state) => state.setScreen)
  const purchaseItem = useAppStore((state) => state.purchaseItem)
  const useStreakFreeze = useAppStore((state) => state.useStreakFreeze)
  const buyXpBoost = useAppStore((state) => state.buyXpBoost)
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

  const ownedItemIds = new Set([...user.purchasedItems, 'classic-green'])
  const frameItems = storeItemsData.filter((item) => item.type === 'frame')
  const styleItems = storeItemsData.filter((item) => item.type !== 'frame')
  const plusActive = user.purchasedItems.includes('tilio-plus-preview')

  const handleBuy = (item: StoreItem) => {
    hapticFeedback('light')
    if (item.price === 0) {
      updateUser({ equippedTheme: item.id })
      return
    }
    purchaseItem(item.id, item.price)
  }

  const handleApplyWallpaper = (itemId: string) => {
    hapticFeedback('success')
    updateUser({ equippedTheme: itemId })
  }

  const handleBuyFreeze = () => {
    hapticFeedback('medium')
    useStreakFreeze()
  }

  const handlePreviewPlus = () => {
    hapticFeedback('success')
    purchaseItem('tilio-plus-preview', 250)
  }

  const boostActive = user.xpMultiplierExpiresAt && new Date(user.xpMultiplierExpiresAt).getTime() > Date.now()

  return (
    <div className="tilio-shell flex flex-col">
      <header className="sticky top-0 z-10 safe-area-top">
        <div className="tilio-container px-4 py-3">
          <div className="flex items-center gap-4 rounded-[1.6rem] border border-white/70 bg-white/80 px-3 py-2 shadow-lg shadow-emerald-950/5 backdrop-blur-xl">
            <button onClick={() => setScreen('home')} className="tilio-pressed flex size-10 items-center justify-center rounded-full bg-emerald-50 text-muted-foreground" aria-label="Go back">
              <ArrowLeft className="size-6" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-black">Feather Shop</h1>
              <p className="text-xs font-semibold text-muted-foreground">Light wallpapers and cosmetics</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5">
              <Feather className="size-4 text-emerald-700" />
              <span className="text-sm font-black">{user.feathers}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="tilio-container flex-1 overflow-y-auto px-4 py-4 pb-24">
        <section className="mb-4 overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-50 to-lime-100 p-5 shadow-xl shadow-emerald-950/8">
          <div className="flex items-center gap-4">
            <SparrowMascot branded size="lg" mood="waving" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">Tilio Plus</p>
              <h2 className="text-2xl font-black leading-tight">Practice deeper. Keep streaks safer.</h2>
            </div>
          </div>
        </section>

        <section className="mb-5 overflow-hidden rounded-[2rem] border border-emerald-900/20 bg-gradient-to-br from-emerald-950 via-emerald-900 to-lime-800 p-5 text-white shadow-2xl shadow-emerald-950/20">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-lime-200">Premium bundle</p>
              <h2 className="mt-2 text-3xl font-black leading-[1]">Tilio Plus Preview</h2>
              <p className="mt-3 text-sm font-semibold leading-5 text-white/78">
                A first premium bundle for testers: smarter practice, stronger streak support, richer personalization, and progress insights.
              </p>
            </div>
            <div className="flex size-16 shrink-0 items-center justify-center rounded-[1.35rem] bg-white/12 text-lime-200">
              <Sparkles className="size-8" />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {plusRewards.map((reward) => (
              <div key={reward} className="rounded-2xl bg-white/10 px-3 py-2 text-xs font-black text-lime-50">
                <Check className="mr-1 inline size-3.5 text-lime-200" />
                {reward}
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl bg-white/10 p-3">
            <div>
              <p className="text-sm font-black">{plusActive ? 'Preview unlocked' : 'Unlock tester preview'}</p>
              <p className="text-xs font-semibold text-white/68">Uses feathers for testing until payments are connected.</p>
            </div>
            <Button
              className="h-11 rounded-2xl bg-lime-300 px-4 font-black text-emerald-950 hover:bg-lime-200"
              disabled={plusActive || user.feathers < 250}
              onClick={handlePreviewPlus}
            >
              <Feather className="size-4" />
              {plusActive ? 'Unlocked' : '250'}
            </Button>
          </div>
        </section>

        <section className="mb-5">
          <div className="mb-3">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">Premium features</p>
            <h2 className="text-lg font-black">What Tilio Plus will include</h2>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {plusFeatureCards.map((feature) => {
              const Icon = feature.icon
              return (
                <Card key={feature.title} className="premium-card rounded-[1.75rem] p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="size-7" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-black leading-tight">{feature.title}</p>
                        <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-primary">
                          {feature.status}
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-semibold leading-4 text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </section>

        <section className="mb-5">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">Wallpapers</p>
              <h2 className="text-lg font-black">Apply after claiming</h2>
            </div>
            <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-black text-muted-foreground">
              Active: {user.equippedTheme === 'classic-green' ? 'Classic' : 'Premium'}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {wallpaperItems.map((item) => {
              const owned = ownedItemIds.has(item.id)
              const applied = user.equippedTheme === item.id
              const canBuy = item.price === 0 || user.feathers >= item.price
              const Icon = wallpaperIcon[item.icon] || Palette

              return (
                <Card key={item.id} className="tilio-pressed gap-0 rounded-[1.75rem] border-white/70 bg-white/85 p-3 shadow-xl shadow-emerald-950/5">
                  <div className="flex gap-3">
                    <div className={cn('relative h-28 w-24 shrink-0 overflow-hidden rounded-[1.35rem] bg-gradient-to-br shadow-inner', wallpaperPreviewClass[item.id])}>
                      <img
                        src={wallpaperImage[item.id]}
                        alt={`${item.name} wallpaper preview`}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-white/10" />
                      <Icon className="absolute right-2 top-2 size-5 text-emerald-900/65 drop-shadow-sm" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-black leading-tight">{item.name}</p>
                          <p className="mt-1 text-xs font-semibold leading-4 text-muted-foreground">{item.description}</p>
                        </div>
                        {applied && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-black text-primary">
                            <Check className="size-3" />
                            Active
                          </span>
                        )}
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1 text-sm font-black text-emerald-700">
                          <Feather className="size-3.5" />
                          {item.price === 0 ? 'Free' : item.price}
                        </span>
                        {owned ? (
                          <Button
                            size="sm"
                            className="h-9 rounded-xl px-3 font-black"
                            variant={applied ? 'outline' : 'default'}
                            disabled={applied}
                            onClick={() => handleApplyWallpaper(item.id)}
                          >
                            {applied ? 'Applied' : 'Apply'}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="h-9 rounded-xl px-3 font-black"
                            disabled={!canBuy}
                            onClick={() => handleBuy(item)}
                          >
                            <ShoppingBag className="size-4" />
                            Claim
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </section>

        <section className="mb-5">
          <div className="mb-3">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">Study boosts</p>
            <h2 className="text-lg font-black">Spend feathers on momentum</h2>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <Card className="tilio-card rounded-[1.75rem] border-amber-100 p-4">
              <div className="flex items-center gap-4">
                <div className="flex size-16 shrink-0 items-center justify-center rounded-[1.35rem] bg-gradient-to-br from-amber-100 to-lime-100 text-amber-700 shadow-inner">
                  <Sparkles className="size-8" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-black">2x XP Boost</p>
                  <p className="mt-1 text-xs font-semibold text-muted-foreground">Double lesson XP for the next 24 hours.</p>
                  {boostActive && <p className="mt-2 text-xs font-black text-amber-700">Boost active</p>}
                </div>
                <Button
                  size="sm"
                  className="h-10 rounded-xl px-3 font-black"
                  disabled={user.feathers < 120}
                  onClick={() => {
                    hapticFeedback('success')
                    buyXpBoost(120, 2, 24)
                  }}
                >
                  <Feather className="size-4" />
                  120
                </Button>
              </div>
            </Card>

            <Card className="tilio-card rounded-[1.75rem] border-emerald-100 p-4">
              <div className="flex items-center gap-4">
                <div className="flex size-16 shrink-0 items-center justify-center rounded-[1.35rem] bg-gradient-to-br from-emerald-100 to-white text-emerald-700 shadow-inner">
                  <Zap className="size-8" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-black">Focus Sprint</p>
                  <p className="mt-1 text-xs font-semibold text-muted-foreground">A smaller 1.5x XP boost for the next 8 hours.</p>
                </div>
                <Button
                  size="sm"
                  className="h-10 rounded-xl px-3 font-black"
                  disabled={user.feathers < 60}
                  onClick={() => {
                    hapticFeedback('success')
                    buyXpBoost(60, 1.5, 8)
                  }}
                >
                  <Feather className="size-4" />
                  60
                </Button>
              </div>
            </Card>
          </div>
        </section>

        <section className="mb-5">
          <div className="mb-3">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">Streak protection</p>
            <h2 className="text-lg font-black">Keep your streak safe</h2>
          </div>
          <Card className="tilio-card rounded-[1.75rem] border-sky-100 p-4">
            <div className="flex items-center gap-4">
              <div className="flex size-16 shrink-0 items-center justify-center rounded-[1.35rem] bg-gradient-to-br from-sky-100 to-emerald-100 text-sky-700 shadow-inner">
                <Snowflake className="size-8" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-black">Streak Freeze</p>
                <p className="mt-1 text-xs font-semibold text-muted-foreground">Automatically protects your streak if you miss one day.</p>
                <p className="mt-2 text-xs font-black text-sky-700">Owned: {user.streakFreezes}/2</p>
              </div>
              <Button
                size="sm"
                className="h-10 rounded-xl px-3 font-black"
                disabled={user.streakFreezes >= 2 || user.feathers < 50}
                onClick={handleBuyFreeze}
              >
                <Feather className="size-4" />
                {user.streakFreezes >= 2 ? 'Max' : '50'}
              </Button>
            </div>
          </Card>
        </section>

        <section>
          <div className="mb-3">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">Cosmetics</p>
            <h2 className="text-lg font-black">Frames and extras</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {frameItems.map((item) => {
              const purchased = user.purchasedItems.includes(item.id)
              const equipped = user.equippedFrame === item.id
              const Icon = itemIcons[item.type] || ShoppingBag
              const canBuy = user.feathers >= item.price

              return (
                <Card key={item.id} className="tilio-pressed gap-0 rounded-[1.55rem] border-white/70 bg-white/82 p-4 shadow-xl shadow-emerald-950/5">
                  <div className={cn('mb-3 flex aspect-square items-center justify-center rounded-[1.35rem]', item.type === 'frame' ? 'bg-gradient-to-br from-amber-200 to-yellow-100' : 'bg-gradient-to-br from-white to-emerald-100')}>
                    <Icon className="size-9 text-emerald-800" />
                  </div>
                  <p className="font-black leading-tight">{item.name}</p>
                  <p className="mt-1 min-h-10 text-xs font-semibold leading-4 text-muted-foreground">{item.description}</p>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 text-sm font-black text-emerald-700">
                      <Feather className="size-3.5" />
                      {item.price}
                    </span>
                    <Button
                      size="sm"
                      className="h-9 rounded-xl px-3 font-black"
                      variant={purchased ? 'outline' : 'default'}
                      disabled={equipped || (!purchased && !canBuy)}
                      onClick={() => {
                        hapticFeedback('light')
                        if (purchased) {
                          updateUser({ equippedFrame: item.id })
                        } else if (purchaseItem(item.id, item.price)) {
                          updateUser({ equippedFrame: item.id })
                        }
                      }}
                    >
                      {equipped ? <Check className="size-4" /> : <ShoppingBag className="size-4" />}
                      {equipped ? 'On' : purchased ? 'Use' : 'Buy'}
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        </section>

        <section className="mt-5">
          <div className="mb-3">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">Style extras</p>
            <h2 className="text-lg font-black">Outfits, accents, and badges</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {styleItems.map((item) => {
              const purchased = user.purchasedItems.includes(item.id)
              const Icon = itemIcons[item.type] || Sparkles
              const canBuy = user.feathers >= item.price

              return (
                <Card key={item.id} className="tilio-pressed gap-0 rounded-[1.55rem] border-white/70 bg-white/82 p-4 shadow-xl shadow-emerald-950/5">
                  <div className="mb-3 flex aspect-square items-center justify-center rounded-[1.35rem] bg-gradient-to-br from-white to-emerald-100">
                    <Icon className="size-9 text-emerald-800" />
                  </div>
                  <p className="font-black leading-tight">{item.name}</p>
                  <p className="mt-1 min-h-10 text-xs font-semibold leading-4 text-muted-foreground">{item.description}</p>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 text-sm font-black text-emerald-700">
                      <Feather className="size-3.5" />
                      {item.price}
                    </span>
                    <Button
                      size="sm"
                      className="h-9 rounded-xl px-3 font-black"
                      variant={purchased ? 'outline' : 'default'}
                      disabled={purchased || !canBuy}
                      onClick={() => {
                        hapticFeedback('light')
                        purchaseItem(item.id, item.price)
                      }}
                    >
                      {purchased ? <Check className="size-4" /> : <ShoppingBag className="size-4" />}
                      {purchased ? 'Owned' : 'Buy'}
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        </section>
      </main>
    </div>
  )
}
