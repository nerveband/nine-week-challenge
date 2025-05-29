// Service Worker for Nine Week Challenge PWA
const CACHE_VERSION = 'v1'
const CACHE_NAME = `nwc-cache-${CACHE_VERSION}`
const RUNTIME_CACHE = `nwc-runtime-${CACHE_VERSION}`

// Essential URLs to cache for offline functionality
const urlsToCache = [
  '/',
  '/dashboard',
  '/tracking',
  '/measurements',
  '/progress',
  '/profile',
  '/login',
  '/signup',
  '/offline.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
]

// Cache strategies
const cacheStrategies = {
  // Network first, falling back to cache
  networkFirst: [
    '/api/',
    '/dashboard',
    '/tracking',
    '/measurements',
    '/progress',
  ],
  // Cache first, falling back to network
  cacheFirst: [
    '/static/',
    '/_next/static/',
    '/fonts/',
    '/images/',
    '.png',
    '.jpg',
    '.jpeg',
    '.svg',
    '.ico',
    '.woff',
    '.woff2',
  ],
  // Network only
  networkOnly: [
    '/api/auth/',
    '/api/supabase/',
  ]
}

// Helper function to determine cache strategy
function getCacheStrategy(url) {
  for (const [strategy, patterns] of Object.entries(cacheStrategies)) {
    for (const pattern of patterns) {
      if (url.includes(pattern)) {
        return strategy
      }
    }
  }
  return 'networkFirst' // Default strategy
}

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache)
      })
      .then(() => self.skipWaiting())
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => self.clients.claim())
  )
})

// Fetch event - intelligent caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-HTTP(S) requests
  if (!url.protocol.startsWith('http')) {
    return
  }

  const strategy = getCacheStrategy(url.pathname)

  if (strategy === 'networkOnly') {
    event.respondWith(fetch(request))
    return
  }

  if (strategy === 'cacheFirst') {
    event.respondWith(
      caches.match(request)
        .then((cached) => {
          if (cached) {
            // Return cached version and update cache in background
            fetch(request).then((response) => {
              if (response.status === 200) {
                caches.open(RUNTIME_CACHE).then((cache) => {
                  cache.put(request, response.clone())
                })
              }
            })
            return cached
          }
          return fetch(request).then((response) => {
            if (response.status === 200) {
              const responseToCache = response.clone()
              caches.open(RUNTIME_CACHE).then((cache) => {
                cache.put(request, responseToCache)
              })
            }
            return response
          })
        })
    )
    return
  }

  // Network first strategy (default)
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.status === 200) {
          const responseToCache = response.clone()
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseToCache)
          })
        }
        return response
      })
      .catch(() => {
        return caches.match(request).then((cached) => {
          if (cached) {
            return cached
          }
          // If offline and no cache, return offline page for navigation
          if (request.mode === 'navigate') {
            return caches.match('/offline.html')
          }
          return new Response('Offline', { status: 503 })
        })
      })
  )
})

// Background sync for offline form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-tracking') {
    event.waitUntil(syncTracking())
  }
})

// Push notification support
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Time to track your daily habits!',
    icon: '/icon-192.png',
    badge: '/icon-96.png',
    vibrate: [100, 50, 100],
    tag: 'nwc-reminder',
    requireInteraction: true,
    actions: [
      { action: 'track', title: 'Track Now' },
      { action: 'later', title: 'Later' }
    ]
  }

  event.waitUntil(
    self.registration.showNotification('Nine Week Challenge', options)
  )
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'track') {
    event.waitUntil(
      clients.openWindow('/tracking')
    )
  }
})

// Periodic background sync for reminders
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'daily-reminder') {
    event.waitUntil(sendDailyReminder())
  }
})

async function syncTracking() {
  // Sync offline tracking data when back online
  const cache = await caches.open(RUNTIME_CACHE)
  const requests = await cache.keys()
  
  for (const request of requests) {
    if (request.url.includes('/api/tracking')) {
      try {
        const cached = await cache.match(request)
        const response = await fetch(request, {
          method: request.method,
          headers: request.headers,
          body: cached ? await cached.text() : null
        })
        if (response.ok) {
          await cache.delete(request)
        }
      } catch (error) {
        console.error('Sync failed:', error)
      }
    }
  }
}

async function sendDailyReminder() {
  // Check if user should receive a reminder
  const now = new Date()
  const hour = now.getHours()
  
  if (hour === 20) { // 8 PM reminder
    self.registration.showNotification('Nine Week Challenge', {
      body: "Don't forget to track your daily habits!",
      icon: '/icon-192.png',
      badge: '/icon-96.png',
      tag: 'daily-reminder',
      requireInteraction: true,
      actions: [
        { action: 'track', title: 'Track Now' }
      ]
    })
  }
}