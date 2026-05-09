import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tilio - Learn Uzbek & English',
  description: 'Master Uzbek and English with fun, gamified lessons. Built for Telegram.',
  applicationName: 'Tilio',
  keywords: ['Uzbek', 'English', 'language learning', 'Telegram', 'education'],
  authors: [{ name: 'Tilio Team' }],
  creator: 'Tilio',
  publisher: 'Tilio',
  formatDetection: {
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Tilio',
  },
  openGraph: {
    type: 'website',
    title: 'Tilio - Learn Uzbek & English',
    description: 'Master Uzbek and English with fun, gamified lessons.',
    siteName: 'Tilio',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#4ADE80',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head>
        <Script 
          src="https://telegram.org/js/telegram-web-app.js" 
          strategy="beforeInteractive"
        />
      </head>
      <body className="font-sans antialiased bg-background overflow-x-hidden">
        <div className="min-h-screen max-w-lg mx-auto">
          {children}
        </div>
      </body>
    </html>
  )
}
