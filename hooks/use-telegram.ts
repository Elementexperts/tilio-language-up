'use client'

import { useEffect, useState, useCallback } from 'react'

interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  photo_url?: string
}

interface TelegramWebApp {
  initData: string
  initDataUnsafe: {
    user?: TelegramUser
    start_param?: string
  }
  version: string
  platform: string
  colorScheme: 'light' | 'dark'
  themeParams: {
    bg_color?: string
    text_color?: string
    hint_color?: string
    link_color?: string
    button_color?: string
    button_text_color?: string
  }
  isExpanded: boolean
  viewportHeight: number
  viewportStableHeight: number
  MainButton: {
    text: string
    color: string
    textColor: string
    isVisible: boolean
    isProgressVisible: boolean
    isActive: boolean
    show: () => void
    hide: () => void
    enable: () => void
    disable: () => void
    showProgress: (leaveActive?: boolean) => void
    hideProgress: () => void
    setText: (text: string) => void
    onClick: (callback: () => void) => void
    offClick: (callback: () => void) => void
  }
  BackButton: {
    isVisible: boolean
    show: () => void
    hide: () => void
    onClick: (callback: () => void) => void
    offClick: (callback: () => void) => void
  }
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void
    selectionChanged: () => void
  }
  ready: () => void
  expand: () => void
  close: () => void
  sendData: (data: string) => void
  openLink: (url: string, options?: { try_instant_view?: boolean }) => void
  openTelegramLink: (url: string) => void
  switchInlineQuery: (query: string, choose_chat_types?: string[]) => void
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
}

export function useTelegram() {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null)
  const [user, setUser] = useState<TelegramUser | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [isTelegramEnv, setIsTelegramEnv] = useState(false)

  useEffect(() => {
    const tg = window.Telegram?.WebApp

    if (tg?.initData) {
      setWebApp(tg)
      setUser(tg.initDataUnsafe?.user || null)
      setIsTelegramEnv(true)
      try {
        tg.ready?.()
        tg.expand?.()
      } catch (error) {
        console.warn('Telegram WebApp SDK could not initialize fully.', error)
      }
      setIsReady(true)
    } else {
      setIsTelegramEnv(false)
      setIsReady(true)
      setUser({
        id: 12345678,
        first_name: 'Demo',
        last_name: 'User',
        username: 'demo_user',
        language_code: 'en',
      })
    }
  }, [])

  const hapticFeedback = useCallback((type: 'success' | 'error' | 'warning' | 'light' | 'medium' | 'heavy') => {
    if (!webApp?.HapticFeedback) return
    
    if (['success', 'error', 'warning'].includes(type)) {
      webApp.HapticFeedback.notificationOccurred(type as 'success' | 'error' | 'warning')
    } else {
      webApp.HapticFeedback.impactOccurred(type as 'light' | 'medium' | 'heavy')
    }
  }, [webApp])

  const shareReferral = useCallback((referralCode: string) => {
    if (!webApp) return
    
    const shareUrl = `https://t.me/tilio_app_bot?start=${referralCode}`
    const shareText = `Learn Uzbek and English with Tilio! Join me and get bonus XP!`
    
    if (isTelegramEnv) {
      webApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`)
    } else {
      // Fallback for non-Telegram environment
      if (navigator.share) {
        navigator.share({ title: 'Tilio', text: shareText, url: shareUrl })
      } else {
        navigator.clipboard.writeText(`${shareText} ${shareUrl}`)
      }
    }
  }, [webApp, isTelegramEnv])

  const showMainButton = useCallback((text: string, onClick: () => void) => {
    if (!webApp?.MainButton) return
    
    webApp.MainButton.setText(text)
    webApp.MainButton.onClick(onClick)
    webApp.MainButton.show()
  }, [webApp])

  const hideMainButton = useCallback(() => {
    if (!webApp?.MainButton) return
    webApp.MainButton.hide()
  }, [webApp])

  const showBackButton = useCallback((onClick: () => void) => {
    if (!webApp?.BackButton) return
    webApp.BackButton.onClick(onClick)
    webApp.BackButton.show()
  }, [webApp])

  const hideBackButton = useCallback(() => {
    if (!webApp?.BackButton) return
    webApp.BackButton.hide()
  }, [webApp])

  return {
    webApp,
    user,
    initData: webApp?.initData || '',
    isReady,
    isTelegramEnv,
    colorScheme: webApp?.colorScheme || 'light',
    hapticFeedback,
    shareReferral,
    showMainButton,
    hideMainButton,
    showBackButton,
    hideBackButton,
  }
}
