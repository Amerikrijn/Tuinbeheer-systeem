// Service Worker for Tuinbeheer Systeem
// Provides offline caching and performance optimization

const CACHE_NAME = 'tuinbeheer-v1'
const STATIC_CACHE = 'tuinbeheer-static-v1'
const API_CACHE = 'tuinbeheer-api-v1'

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/offline',
  '/_next/static/',
  '/favicon.ico',
  '/manifest.json'
]

// API routes to cache
const API_ROUTES = [
  '/api/gardens',
  '/api/plants',
  '/api/plant-beds',
  '/api/tasks'
]

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('🚀 Service Worker installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('📦 Caching static files')
        return cache.addAll(STATIC_FILES)
      })
      .then(() => {
        console.log('✅ Static files cached successfully')
        return self.skipWaiting()
      })
      .catch(error => {
        console.error('❌ Failed to cache static files:', error)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker activating...')
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== API_CACHE) {
              console.log('🗑️ Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('✅ Service Worker activated successfully')
        return self.clients.claim()
      })
  )
})

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }
  
  // Handle static assets
  if (isStaticAsset(url.pathname)) {
    event.respondWith(handleStaticAsset(request))
    return
  }
  
  // Handle API requests
  if (isApiRequest(url.pathname)) {
    event.respondWith(handleApiRequest(request))
    return
  }
  
  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request))
    return
  }
})

// Check if request is for static asset
function isStaticAsset(pathname) {
  return pathname.startsWith('/_next/static') ||
         pathname.startsWith('/favicon') ||
         pathname.match(/\.(png|jpg|jpeg|svg|ico|css|js|woff|woff2|ttf|eot)$/)
}

// Check if request is for API
function isApiRequest(pathname) {
  return pathname.startsWith('/api/') && !pathname.includes('/auth/')
}

// Handle static asset requests
async function handleStaticAsset(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Fetch from network
    const networkResponse = await fetch(request)
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.error('❌ Static asset fetch failed:', error)
    throw error
  }
}

// Handle API requests
async function handleApiRequest(request) {
  try {
    // Try cache first for GET requests
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      // Return cached response but update in background
      updateCacheInBackground(request)
      return cachedResponse
    }
    
    // Fetch from network
    const networkResponse = await fetch(request)
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.error('❌ API request failed:', error)
    
    // Return cached response if available
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    throw error
  }
}

// Handle navigation requests
async function handleNavigation(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request)
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.error('❌ Navigation request failed:', error)
    
    // Return offline page
    const offlineResponse = await caches.match('/offline')
    if (offlineResponse) {
      return offlineResponse
    }
    
    // Fallback to basic offline response
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Offline - Tuinbeheer Systeem</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body>
          <div style="text-align: center; padding: 2rem; font-family: Arial, sans-serif;">
            <h1>🌿 Offline</h1>
            <p>Je bent momenteel offline. Controleer je internetverbinding en probeer opnieuw.</p>
            <button onclick="window.location.reload()">Opnieuw proberen</button>
          </div>
        </body>
      </html>
      `,
      {
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'text/html',
          'Cache-Control': 'no-cache'
        }
      }
    )
  }
}

// Update cache in background
async function updateCacheInBackground(request) {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE)
      cache.put(request, networkResponse.clone())
    }
  } catch (error) {
    console.warn('⚠️ Background cache update failed:', error)
  }
}

// Message event - handle communication with main thread
self.addEventListener('message', (event) => {
  const { type, data } = event.data
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting()
      break
      
    case 'CLEAR_CACHE':
      clearAllCaches()
      break
      
    case 'GET_CACHE_INFO':
      getCacheInfo().then(info => {
        event.ports[0].postMessage(info)
      })
      break
      
    default:
      console.log('📨 Unknown message type:', type)
  }
})

// Clear all caches
async function clearAllCaches() {
  try {
    const cacheNames = await caches.keys()
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    )
    console.log('🗑️ All caches cleared')
  } catch (error) {
    console.error('❌ Failed to clear caches:', error)
  }
}

// Get cache information
async function getCacheInfo() {
  try {
    const cacheNames = await caches.keys()
    const cacheInfo = {}
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName)
      const keys = await cache.keys()
      cacheInfo[cacheName] = keys.length
    }
    
    return {
      type: 'CACHE_INFO',
      data: cacheInfo
    }
  } catch (error) {
    console.error('❌ Failed to get cache info:', error)
    return {
      type: 'CACHE_INFO',
      error: error.message
    }
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

// Perform background sync
async function doBackgroundSync() {
  try {
    console.log('🔄 Performing background sync...')
    
    // Get all clients
    const clients = await self.clients.matchAll()
    
    // Notify clients about sync
    clients.forEach(client => {
      client.postMessage({
        type: 'BACKGROUND_SYNC',
        data: { status: 'completed' }
      })
    })
    
    console.log('✅ Background sync completed')
  } catch (error) {
    console.error('❌ Background sync failed:', error)
  }
}

console.log('🚀 Service Worker loaded successfully')