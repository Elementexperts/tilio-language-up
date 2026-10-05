import type { Metadata, Viewport } from 'next'
import '../../app/globals.css'

export const metadata: Metadata = {
  title: 'Tilio',
  description: 'O‘zbekistonlik o‘rganuvchilar uchun til o‘rganish ilovasi.',
  applicationName: 'Tilio',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#4ADE80',
}

export default function AndroidRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html suppressHydrationWarning lang="uz">
      <body className="font-sans antialiased bg-background overflow-x-hidden">
        <div className="min-h-screen max-w-lg mx-auto">{children}</div>
      </body>
    </html>
  )
}
