/**
 * Composable pour détecter l'état de connexion et gérer la file hors-ligne.
 * Utilise IndexedDB pour persister les requêtes en attente.
 */
import { ref, readonly, onMounted, onUnmounted } from 'vue'

export interface OfflineRequest {
  id: string
  url: string
  method: string
  body?: string
  headers?: Record<string, string>
  timestamp: number
  retries: number
}

const DB_NAME = 'murastorage_offline'
const STORE_NAME = 'pending_requests'
const DB_VERSION = 1

let db: IDBDatabase | null = null

async function getDB(): Promise<IDBDatabase> {
  if (db) return db
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = (e) => {
      const d = (e.target as IDBOpenDBRequest).result
      if (!d.objectStoreNames.contains(STORE_NAME)) {
        d.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
    req.onsuccess = (e) => {
      db = (e.target as IDBOpenDBRequest).result
      resolve(db)
    }
    req.onerror = () => reject(req.error)
  })
}

export async function addToOfflineQueue(request: Omit<OfflineRequest, 'id' | 'timestamp' | 'retries'>): Promise<void> {
  const d = await getDB()
  const entry: OfflineRequest = {
    ...request,
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    timestamp: Date.now(),
    retries: 0,
  }
  await new Promise<void>((resolve, reject) => {
    const tx = d.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).add(entry)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getPendingRequests(): Promise<OfflineRequest[]> {
  const d = await getDB()
  return new Promise((resolve, reject) => {
    const tx = d.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).getAll()
    req.onsuccess = () => resolve(req.result || [])
    req.onerror = () => reject(req.error)
  })
}

export async function removePendingRequest(id: string): Promise<void> {
  const d = await getDB()
  await new Promise<void>((resolve, reject) => {
    const tx = d.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function syncPendingRequests(): Promise<{ synced: number; failed: number }> {
  const pending = await getPendingRequests()
  let synced = 0
  let failed = 0

  for (const req of pending) {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(req.url, {
        method: req.method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(req.headers || {}),
        },
        body: req.body,
      })
      if (response.ok || response.status === 409) {
        // 409 Conflict = déjà créé, on considère c'est bon
        await removePendingRequest(req.id)
        synced++
      } else {
        failed++
      }
    } catch {
      failed++
    }
  }
  return { synced, failed }
}

// ── Composable ───────────────────────────────────────────────────────────────

export function useOffline() {
  const isOnline = ref(typeof navigator !== 'undefined' ? navigator.onLine : true)
  const isSyncing = ref(false)
  const pendingCount = ref(0)
  const lastSyncAt = ref<Date | null>(null)

  async function refreshPendingCount() {
    try {
      const pending = await getPendingRequests()
      pendingCount.value = pending.length
    } catch {
      // IndexedDB pas disponible (SSR)
    }
  }

  async function sync() {
    if (!isOnline.value || isSyncing.value) return
    const count = await getPendingRequests().then(r => r.length).catch(() => 0)
    if (count === 0) return

    isSyncing.value = true
    try {
      await syncPendingRequests()
      await refreshPendingCount()
      lastSyncAt.value = new Date()
    } finally {
      isSyncing.value = false
    }
  }

  function onOnline() {
    isOnline.value = true
    sync()
  }

  function onOffline() {
    isOnline.value = false
  }

  onMounted(async () => {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', onOnline)
      window.addEventListener('offline', onOffline)
      await refreshPendingCount()
    }
  })

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  })

  return {
    isOnline: readonly(isOnline),
    isSyncing: readonly(isSyncing),
    pendingCount: readonly(pendingCount),
    lastSyncAt: readonly(lastSyncAt),
    sync,
    addToOfflineQueue,
    refreshPendingCount,
  }
}
