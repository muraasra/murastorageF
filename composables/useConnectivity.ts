/**
 * Détecte si le SERVEUR est joignable, pas seulement si le WiFi est connecté.
 * Un WiFi sans data ou un proxy cassé rend navigator.onLine inutile.
 * On fait un HEAD sur l'API avec timeout court, ce qui est la seule vérité.
 */
import { ref, readonly, onMounted, onUnmounted } from 'vue'
import { API_BASE_URL } from '@/constants'

const PING_URL = `${API_BASE_URL}/api/`
const PING_TIMEOUT_MS = 5000
const POLL_INTERVAL_OFFLINE_MS = 20000  // vérifie toutes les 20s quand hors ligne
const POLL_INTERVAL_ONLINE_MS = 60000   // vérifie toutes les 60s quand en ligne

// État global partagé entre toutes les instances du composable
const _isServerReachable = ref<boolean>(true)
const _isChecking = ref(false)
let _pollTimer: ReturnType<typeof setTimeout> | null = null
let _listenerCount = 0

async function checkServerReachability(): Promise<boolean> {
  if (_isChecking.value) return _isServerReachable.value
  _isChecking.value = true

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), PING_TIMEOUT_MS)

    const res = await fetch(PING_URL, {
      method: 'HEAD',
      signal: controller.signal,
      cache: 'no-store',
    })
    clearTimeout(timeoutId)

    // Toute réponse HTTP (même 401/403/404) = serveur joignable
    _isServerReachable.value = true
    return true
  } catch {
    // Erreur réseau ou timeout = serveur non joignable
    _isServerReachable.value = false
    return false
  } finally {
    _isChecking.value = false
    schedulePoll()
  }
}

function schedulePoll() {
  if (_pollTimer) clearTimeout(_pollTimer)
  if (_listenerCount === 0) return

  const interval = _isServerReachable.value
    ? POLL_INTERVAL_ONLINE_MS
    : POLL_INTERVAL_OFFLINE_MS

  _pollTimer = setTimeout(() => checkServerReachability(), interval)
}

function onBrowserOnline() {
  // Le navigateur pense être en ligne — on vérifie vraiment
  checkServerReachability()
}

function onBrowserOffline() {
  // Le navigateur sait qu'il n'y a pas de réseau du tout
  _isServerReachable.value = false
  schedulePoll()
}

export function useConnectivity() {
  onMounted(() => {
    if (typeof window === 'undefined') return
    _listenerCount++

    if (_listenerCount === 1) {
      window.addEventListener('online', onBrowserOnline)
      window.addEventListener('offline', onBrowserOffline)
      // Vérification initiale
      checkServerReachability()
    }
  })

  onUnmounted(() => {
    _listenerCount--
    if (_listenerCount === 0) {
      window.removeEventListener('online', onBrowserOnline)
      window.removeEventListener('offline', onBrowserOffline)
      if (_pollTimer) {
        clearTimeout(_pollTimer)
        _pollTimer = null
      }
    }
  })

  return {
    isServerReachable: readonly(_isServerReachable),
    isChecking: readonly(_isChecking),
    checkNow: checkServerReachability,
  }
}

// Accès direct à l'état (pour useOffline sans avoir besoin d'un composant)
export function getServerReachable() {
  return _isServerReachable.value
}

export function initConnectivity() {
  if (typeof window === 'undefined') return
  window.addEventListener('online', onBrowserOnline)
  window.addEventListener('offline', onBrowserOffline)
  checkServerReachability()
}
