/**
 * Gestion de la file hors-ligne avec détection réelle de la connectivité.
 * "En ligne" = le serveur API répond, pas juste un WiFi branché.
 */
import { ref, readonly, onMounted, onUnmounted, watch } from 'vue'
import { getServerReachable, initConnectivity } from '@/composables/useConnectivity'
import { API_BASE_URL } from '@/constants'

export interface OfflineRequest {
  id: string
  url: string
  method: string
  body?: string
  headers?: Record<string, string>
  timestamp: number
  retries: number
  label?: string  // description lisible, ex: "Création facture #12"
}

export interface SyncResult {
  synced: number
  failed: number
  syncedAt: Date
}

const DB_NAME = 'murastorage_offline'
const STORE_NAME = 'pending_requests'
const DB_VERSION = 1
const MAX_RETRIES = 5

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

export async function addToOfflineQueue(
  request: Omit<OfflineRequest, 'id' | 'timestamp' | 'retries'>
): Promise<string> {
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
  return entry.id
}

export async function getPendingRequests(): Promise<OfflineRequest[]> {
  const d = await getDB()
  return new Promise((resolve, reject) => {
    const tx = d.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).getAll()
    req.onsuccess = () => resolve((req.result || []).sort((a, b) => a.timestamp - b.timestamp))
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

async function incrementRetries(req: OfflineRequest): Promise<void> {
  const d = await getDB()
  await new Promise<void>((resolve, reject) => {
    const tx = d.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put({ ...req, retries: req.retries + 1 })
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function syncPendingRequests(): Promise<SyncResult> {
  const pending = await getPendingRequests()
  let synced = 0
  let failed = 0

  for (const req of pending) {
    try {
      const token = localStorage.getItem('access_token')

      // Timeout de 10s par requête pour ne pas bloquer le sync
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const response = await fetch(req.url, {
        method: req.method,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(req.headers || {}),
        },
        body: req.body,
      })
      clearTimeout(timeoutId)

      if (response.ok || response.status === 409) {
        // 409 Conflict = déjà créé côté serveur, on accepte
        await removePendingRequest(req.id)
        synced++
      } else if (response.status >= 400 && response.status < 500) {
        // Erreur métier (400/401/403) = données invalides, on retire de la queue
        // pour ne pas bloquer indéfiniment
        await removePendingRequest(req.id)
        failed++
      } else {
        // Erreur serveur (5xx) ou réseau : on incrémente les retries
        if (req.retries >= MAX_RETRIES) {
          await removePendingRequest(req.id)
        } else {
          await incrementRetries(req)
        }
        failed++
      }
    } catch {
      // Erreur réseau : on incrémente les retries
      if (req.retries >= MAX_RETRIES) {
        await removePendingRequest(req.id)
      } else {
        await incrementRetries(req)
      }
      failed++
    }
  }

  return { synced, failed, syncedAt: new Date() }
}

// ── État global partagé (singleton) ────────────────────────────────────────

const _isOnline = ref(true)          // = serveur joignable (pas juste WiFi)
const _isSyncing = ref(false)
const _pendingCount = ref(0)
const _lastSyncResult = ref<SyncResult | null>(null)
const _showSyncSuccess = ref(false)
let _successTimer: ReturnType<typeof setTimeout> | null = null
let _instanceCount = 0

async function _refreshPendingCount() {
  try {
    const pending = await getPendingRequests()
    _pendingCount.value = pending.length
  } catch {
    // IndexedDB indisponible (SSR)
  }
}

async function _doSync() {
  if (_isSyncing.value) return
  const count = await getPendingRequests().then(r => r.length).catch(() => 0)
  if (count === 0) return

  _isSyncing.value = true
  try {
    const result = await syncPendingRequests()
    _lastSyncResult.value = result
    await _refreshPendingCount()

    if (result.synced > 0) {
      _showSyncSuccess.value = true
      if (_successTimer) clearTimeout(_successTimer)
      _successTimer = setTimeout(() => { _showSyncSuccess.value = false }, 5000)
    }
  } finally {
    _isSyncing.value = false
  }
}

// Surveille l'état de la connexion serveur et déclenche le sync au retour
function _watchServerReachability() {
  const interval = setInterval(async () => {
    const reachable = getServerReachable()
    const wasOffline = !_isOnline.value

    _isOnline.value = reachable

    if (reachable && wasOffline) {
      // Connexion serveur retrouvée → on synchronise
      await _doSync()
    }
  }, 2000)

  return () => clearInterval(interval)
}

let _stopWatcher: (() => void) | null = null

// ── Composable ───────────────────────────────────────────────────────────────

export function useOffline() {
  onMounted(async () => {
    _instanceCount++
    if (_instanceCount === 1 && typeof window !== 'undefined') {
      initConnectivity()
      await _refreshPendingCount()
      _stopWatcher = _watchServerReachability()
    }
  })

  onUnmounted(() => {
    _instanceCount--
    if (_instanceCount === 0 && _stopWatcher) {
      _stopWatcher()
      _stopWatcher = null
    }
  })

  return {
    isOnline: readonly(_isOnline),
    isSyncing: readonly(_isSyncing),
    pendingCount: readonly(_pendingCount),
    lastSyncResult: readonly(_lastSyncResult),
    showSyncSuccess: readonly(_showSyncSuccess),
    sync: _doSync,
    addToOfflineQueue,
    refreshPendingCount: _refreshPendingCount,
  }
}
