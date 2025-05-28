import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Toaster } from '@/components/ui/toaster'
import { ServiceWorkerRegistration } from '@/components/service-worker-registration'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'Nine Week Challenge - Transform Your Habits in 9 Weeks',
  description: 'Track body measurements, daily habits, meals, and progress over a 9-week wellness journey.',
  icons: {
    icon: '/favicon.ico',
  },
  other: {
    'cache-control': 'no-cache, no-store, must-revalidate',
    'pragma': 'no-cache',
    'expires': '0',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
        <Toaster />
        <ServiceWorkerRegistration />
      </body>
    </html>
  )
}