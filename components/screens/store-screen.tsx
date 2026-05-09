'use client'

import { useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SparrowMascot } from '@/components/sparrow-mascot'
import { useAppStore } from '@/lib/store'
import { useTelegram } from '@/hooks/use-telegram'
import { storeItemsData } from '@/lib/data/lessons'
import { cn } from '@/lib/utils'
import { ArrowLeft, BadgeCheck, Check, Feather, Palette, Shield, ShoppingBag, Sparkles, Wand2 } from 'lucide-react'

const itemIcons = {
  theme: Palette,
  frame: BadgeCheck,
  outfit: Wand2,
  color: Sparkles,
  lesson_pack: Shield,
}

export function StoreScreen() {
  const user = useAppStore((state) => state.user)
  const setScreen = useAppStore((state) => state.setScreen)
  const purchaseItem = useAppStore((state) => state.purchaseItem)
  const { hapticFeedback, showBackButton, hideBackButton } = useTelegram()

  useEffect(() => {
    showBackButton(() => {
      hideBackButton()
      setScreen('home')
    })
    return () => hideBackButton()
  }, [showBackButton, hideBackButton, setScreen])

  if (!user) return null

  return (
    <div className="tilio-shell flex flex-col">
      <header className="sticky top-0 z-10 safe-area-top">
        <div className="tilio-container px-4 py-3">
          <div className="flex items-center gap-4 rounded-[1.6rem] border border-white/70 bg-white/80 px-3 py-2 shadow-lg shadow-emerald-950/5 backdrop-blur-xl">
            <button onClick={() => setScreen('home')} className="tilio-pressed flex size-10 items-center justify-center rounded-full bg-emerald-50 text-muted-foreground" aria-label="Go back">
              <ArrowLeft className="size-6" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-black">Rewards Store</h1>
              <p className="text-xs font-semibold text-muted-foreground">Cosmetics and streak helpers</p>
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
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">Feather shop</p>
              <h2 className="text-2xl font-black leading-tight">Dress your mascot. Protect your streak.</h2>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3">
          {storeItemsData.map((item) => {
            const purchased = user.purchasedItems.includes(item.id)
            const Icon = itemIcons[item.type] || ShoppingBag
            const canBuy = user.feathers >= item.price

            return (
              <Card key={item.id} className="tilio-pressed gap-0 rounded-[1.55rem] border-white/70 bg-white/82 p-4 shadow-xl shadow-emerald-950/5">
                <div className={cn('mb-3 flex aspect-square items-center justify-center rounded-[1.35rem]', item.type === 'theme' ? 'bg-gradient-to-br from-emerald-200 to-lime-100' : item.type === 'frame' ? 'bg-gradient-to-br from-amber-200 to-yellow-100' : 'bg-gradient-to-br from-white to-emerald-100')}>
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
      </main>
    </div>
  )
}
