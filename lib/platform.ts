import { Capacitor } from '@capacitor/core'

export type TilioPlatform = 'web' | 'telegram' | 'android'

export function isCapacitorAndroid() {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android'
}

export function isTelegramMiniApp() {
  if (typeof window === 'undefined' || isCapacitorAndroid()) return false
  return Boolean(window.Telegram?.WebApp?.initData)
}

export function getTilioPlatform(): TilioPlatform {
  if (isCapacitorAndroid()) return 'android'
  if (isTelegramMiniApp()) return 'telegram'
  return 'web'
}

let telegramSdkPromise: Promise<void> | null = null

export function ensureTelegramSdk() {
  if (typeof window === 'undefined' || isCapacitorAndroid() || window.Telegram?.WebApp) {
    return Promise.resolve()
  }
  if (telegramSdkPromise) return telegramSdkPromise

  telegramSdkPromise = new Promise<void>((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-tilio-telegram-sdk]')
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => resolve(), { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-web-app.js'
    script.async = true
    script.dataset.tilioTelegramSdk = 'true'
    script.onload = () => resolve()
    script.onerror = () => resolve()
    document.head.appendChild(script)
  })

  return telegramSdkPromise
}
