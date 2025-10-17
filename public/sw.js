const CACHE_NAME = 'app-static-v1'
const RUNTIME_CACHE = 'app-runtime-v1'

const STATIC_ASSETS = [
  '/',
  '/favicon.ico'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((key) => {
      if (![CACHE_NAME, RUNTIME_CACHE].includes(key)) {
        return caches.delete(key)
      }
    }))).then(() => self.clients.claim())
  )
})

// Cache-first for images, icons, fonts
self.addEventListener('fetch', (event) => {
  const req = event.request
  const url = new URL(req.url)

  // Only same-origin
  if (url.origin !== self.location.origin) return

  const isImage = req.destination === 'image' || /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(url.pathname)
  const isFont = req.destination === 'font' || /\.(woff2?|ttf|otf|eot)$/i.test(url.pathname)
  const isStyle = req.destination === 'style' || /\.(css)$/i.test(url.pathname)
  const isScript = req.destination === 'script' || /\.(js)$/i.test(url.pathname)

  if (isImage || isFont || isStyle || isScript) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached
        return fetch(req).then((resp) => {
          const respClone = resp.clone()
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(req, respClone))
          return resp
        }).catch(() => cached || Promise.reject('offline'))
      })
    )
    return
  }
})














