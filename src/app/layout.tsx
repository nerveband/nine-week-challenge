import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Toaster } from '@/components/ui/toaster'
import { ServiceWorkerRegistration } from '@/components/service-worker-registration'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'Nine Week Challenge - Transform Your Habits in 9 Weeks',
  description: 'Track body measurements, daily habits, meals, and progress over your 9-week wellness journey.',
  applicationName: 'Nine Week Challenge',
  authors: [{ name: 'Nine Week Challenge Team' }],
  generator: 'Next.js',
  keywords: ['wellness', 'health', 'tracking', 'habits', 'fitness', '9 week challenge'],
  referrer: 'origin-when-cross-origin',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#E5B5D3' },
    { media: '(prefers-color-scheme: dark)', color: '#E5B5D3' }
  ],
  colorScheme: 'light',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: 'cover'
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: [
      { url: '/icon-apple-touch.png', sizes: '180x180' }
    ],
    other: [
      { rel: 'mask-icon', url: '/icon-mask.svg', color: '#E5B5D3' }
    ]
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '9WC',
    startupImage: [
      {
        url: '/splash-2048x2732.png',
        media: '(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)'
      },
      {
        url: '/splash-1170x2532.png',
        media: '(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)'
      },
      {
        url: '/splash-1125x2436.png',
        media: '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)'
      }
    ]
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://nineweekchallenge.com',
    siteName: 'Nine Week Challenge',
    title: 'Nine Week Challenge - Transform Your Habits',
    description: 'Track your wellness journey with daily habits, measurements, and progress visualization.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Nine Week Challenge'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nine Week Challenge',
    description: 'Transform your habits in 9 weeks',
    images: ['/og-image.png']
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': '9WC',
    'format-detection': 'telephone=no',
    'msapplication-TileColor': '#E5B5D3',
    'msapplication-tap-highlight': 'no'
  }
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