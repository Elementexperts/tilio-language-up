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
import { ArrowLeft, BadgeCheck, Check, Cloud, Feather, Landmark, Leaf, Map, Palette, Shield, ShoppingBag, Sparkles, Wand2 } from 'lucide-react'
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
    name: 'Silk Road Glow',
    description: 'Soft golden path with airy Uzbek patterns.',
    type: 'wallpaper',
    price: 120,
    icon: 'path',
    preview: 'silk-road',
  },
  {
    id: 'wallpaper-orchard',
    name: 'Garden Orchard',
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

export function StoreScreen() {
  const user = useAppStore((state) => state.user)
  const setScreen = useAppStore((state) => state.setScreen)
  const purchaseItem = useAppStore((state) => state.purchaseItem)
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
  const cosmeticItems = storeItemsData.filter((item) => item.type !== 'theme' && item.type !== 'color')

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
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">Premium wallpapers</p>
              <h2 className="text-2xl font-black leading-tight">Keep learning bright, calm, and fresh.</h2>
            </div>
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

        <section>
          <div className="mb-3">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">Cosmetics</p>
            <h2 className="text-lg font-black">Frames and extras</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {cosmeticItems.map((item) => {
              const purchased = user.purchasedItems.includes(item.id)
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
