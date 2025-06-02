'use client'

import { useEffect, useState } from 'react'
import { useToast } from '@/components/ui/use-toast'

export function ServiceWorkerRegistration() {
  const { toast } = useToast()
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('SW registered: ', reg)
          setRegistration(reg)
          
          // Check for updates periodically
          setInterval(() => {
            reg.update()
          }, 60000) // Check every minute
          
          // Handle updates
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New version available
                  toast({
                    title: 'Update available!',
                    description: 'A new version is ready. Tap to refresh.',
                    onClick: () => window.location.reload()
                  })
                }
              })
            }
          })
        })
        .catch((error) => {
          console.error('SW registration failed: ', error)
        })
    }

    // Monitor online/offline status
    const handleOnline = () => {
      setIsOnline(true)
      toast({
        title: 'Back online!',
        description: 'Your data will now sync.',
        className: 'bg-brand-mint'
      })
    }

    const handleOffline = () => {
      setIsOnline(false)
      toast({
        title: 'You\'re offline',
        description: 'Don\'t worry, your data is saved locally.',
        className: 'bg-brand-yellow'
      })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Request notification permission for reminders
    if ('Notification' in window && Notification.permission === 'default') {
      setTimeout(() => {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            toast({
              title: 'Notifications enabled!',
              description: 'You\'ll receive daily reminders to track your habits.'
            })
          }
        })
      }, 5000) // Ask after 5 seconds
    }

    // Setup periodic background sync for reminders
    if ('periodicSync' in ServiceWorkerRegistration.prototype && registration) {
      (registration as any).periodicSync.register('daily-reminder', {
        minInterval: 24 * 60 * 60 * 1000 // 24 hours
      }).catch(console.error)
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast])


  return null
}