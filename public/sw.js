// RevSnap Service Worker - PWA Offline Support
const CACHE_NAME = 'revsnap-v1'
const STATIC_CACHE_URLS = [
  '/',
  '/dashboard',
  '/products',
  '/pricing-optimizer',

  '/offline',
  '/manifest.json',
  // Add your CSS and JS files here
]

const API_CACHE_URLS = [
  '/api/products',
  '/api/analytics',
  '/api/features'
]

// Install service worker and cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('RevSnap: Caching static resources')
        return cache.addAll(STATIC_CACHE_URLS)
      })
      .then(() => {
        console.log('RevSnap: Service worker installed')
        return self.skipWaiting()
      })
  )
})

// Activate service worker and clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('RevSnap: Deleting old cache', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('RevSnap: Service worker activated')
        return self.clients.claim()
      })
  )
})

// Fetch event handler - Network first, then cache
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleAPIRequest(request))
    return
  }

  // Handle static resources
  if (request.method === 'GET') {
    event.respondWith(handleStaticRequest(request))
    return
  }
})

// Handle API requests with network-first strategy
async function handleAPIRequest(request) {
  const url = new URL(request.url)
  
  try {
    // Try network first
    const response = await fetch(request)
    
    // Cache successful API responses for offline use
    if (response.ok && API_CACHE_URLS.some(url_pattern => 
      url.pathname.startsWith(url_pattern)
    )) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }
    
    return response
    
  } catch (error) {
    console.log('RevSnap: Network failed, trying cache for API request')
    
    // If network fails, try cache
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      // Add offline indicator to cached responses
      const offlineResponse = cachedResponse.clone()
      return new Response(
        await addOfflineIndicator(await offlineResponse.text()),
        {
          status: cachedResponse.status,
          statusText: cachedResponse.statusText,
          headers: {
            ...cachedResponse.headers,
            'X-Offline-Response': 'true'
          }
        }
      )
    }
    
    // Return offline fallback for API requests
    return new Response(
      JSON.stringify({
        error: 'No internet connection',
        message: 'This data is not available offline',
        offline: true
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// Handle static requests with cache-first strategy
async function handleStaticRequest(request) {
  const url = new URL(request.url)
  
  // Try cache first for static resources
  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    // If not in cache, fetch from network
    const response = await fetch(request)
    
    // Cache the response for future use
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }
    
    return response
    
  } catch (error) {
    console.log('RevSnap: Network failed for static request')
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match('/offline')
      return offlinePage || new Response(
        createOfflinePage(),
        { headers: { 'Content-Type': 'text/html' } }
      )
    }
    
    // Return empty response for other requests
    return new Response('', { status: 503 })
  }
}

// Add offline indicator to cached API responses
async function addOfflineIndicator(responseText) {
  try {
    const data = JSON.parse(responseText)
    if (typeof data === 'object' && data !== null) {
      data._offline = true
      data._message = 'This data was cached for offline use'
      return JSON.stringify(data)
    }
    return responseText
  } catch {
    return responseText
  }
}

// Create basic offline page
function createOfflinePage() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>RevSnap - Offline</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-align: center;
          padding: 2rem;
          margin: 0;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .container {
          max-width: 400px;
          background: rgba(255, 255, 255, 0.1);
          padding: 2rem;
          border-radius: 1rem;
          backdrop-filter: blur(10px);
        }
        .icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }
        h1 {
          margin-bottom: 1rem;
          font-size: 1.5rem;
        }
        p {
          margin-bottom: 2rem;
          opacity: 0.9;
        }
        button {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 1rem;
        }
        button:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">📡</div>
        <h1>You're Offline</h1>
        <p>Don't worry! You can still view cached data and use basic features of RevSnap while offline.</p>
        <button onclick="window.location.reload()">Try Again</button>
      </div>
    </body>
    </html>
  `
}

// Background sync for when connection is restored
self.addEventListener('sync', (event) => {
  if (event.tag === 'revsnap-sync') {
    event.waitUntil(syncOfflineData())
  }
})

// Sync offline data when connection is restored
async function syncOfflineData() {
  console.log('RevSnap: Syncing offline data')
  
  // Get any offline data that needs to be synced
  const offlineData = await getOfflineData()
  
  for (const item of offlineData) {
    try {
      await fetch(item.url, {
        method: item.method,
        headers: item.headers,
        body: item.body
      })
      
      // Remove from offline storage after successful sync
      await removeOfflineData(item.id)
      
    } catch (error) {
      console.log('RevSnap: Failed to sync item', item.id)
    }
  }
}

// Mock functions for offline data management
async function getOfflineData() {
  // In a real implementation, this would get data from IndexedDB
  return []
}

async function removeOfflineData(id) {
  // In a real implementation, this would remove data from IndexedDB
  console.log('RevSnap: Removing offline data', id)
}

// Push notification handler
self.addEventListener('push', (event) => {
  if (!event.data) return

  const data = event.data.json()
  const options = {
    body: data.body,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: data.tag || 'revsnap-notification',
    requireInteraction: data.important || false,
    actions: [
      {
        action: 'view',
        title: 'View Details',
        icon: '/action-view.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/action-dismiss.png'
      }
    ],
    data: data.data || {}
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'view') {
    // Open the app to relevant page
    const urlToOpen = event.notification.data.url || '/dashboard'
    
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        // If app is already open, focus it
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus()
          }
        }
        
        // Otherwise open new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      })
    )
  }
})

console.log('RevSnap: Service worker loaded') 