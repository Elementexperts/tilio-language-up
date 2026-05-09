'use client'

import { useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { useTelegram } from '@/hooks/use-telegram'
import { storeItemsData } from '@/lib/data/lessons'
import { ArrowLeft, Sparkles, ShoppingBag, Check } from 'lucide-react'

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
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border safe-area-top">
        <div className="flex items-center gap-4 px-4 py-3">
          <button
            onClick={() => setScreen('home')}
            className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">Rewards Store</h1>
            <p className="text-xs text-muted-foreground">Cosmetic and motivation upgrades</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 rounded-full">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <span className="text-sm font-bold text-foreground">{user.feathers}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6 pb-24">
        <Card className="p-4 mb-4 bg-primary/5 border-primary/20">
          <p className="font-medium">Startup-ready reward economy</p>
          <p className="text-sm text-muted-foreground mt-1">
            Items are cosmetics/placeholders only. No gambling, no financial mechanics.
          </p>
        </Card>

        <div className="space-y-3">
          {storeItemsData.map((item) => {
            const purchased = user.purchasedItems.includes(item.id)
            return (
              <Card key={item.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl">{item.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{item.name}</p>
                      <span className="text-sm text-emerald-700 font-medium">{item.price} 🪶</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    <Button
                      size="sm"
                      className="mt-3 rounded-xl"
                      variant={purchased ? 'outline' : 'default'}
                      disabled={purchased || user.feathers < item.price}
                      onClick={() => {
                        hapticFeedback('light')
                        purchaseItem(item.id, item.price)
                      }}
                    >
                      {purchased ? (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          Purchased
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4 mr-1" />
                          Buy
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </main>
    </div>
  )
}
