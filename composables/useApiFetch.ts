/**
 * Wrapper autour de $fetch pour les mutations (POST/PUT/PATCH/DELETE).
 * Si le serveur n'est pas joignable, la requête est mise en file dans IndexedDB
 * et sera rejouée automatiquement au retour de la connexion.
 *
 * Usage:
 *   const { apiFetch } = useApiFetch()
 *   const result = await apiFetch('/api/factures/', { method: 'POST', body: data, label: 'Création facture' })
 *   if (result.queued) { // afficher "Sauvegardé hors ligne" }
 */
import { API_BASE_URL } from '@/constants'
import { getServerReachable } from '@/composables/useConnectivity'
import { addToOfflineQueue } from '@/composables/useOffline'

type FetchMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface ApiFetchOptions {
  method?: FetchMethod
  body?: Record<string, any> | FormData | string | null
  headers?: Record<string, string>
  label?: string       // ex: "Création produit" — affiché dans la bannière
  skipOffline?: boolean // forcer l'appel même si hors ligne (ex: login)
}

interface ApiFetchResult<T = any> {
  data: T | null
  queued: boolean      // true si la requête a été mise en file hors ligne
  error: string | null
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('access_token')
}

function buildUrl(endpoint: string): string {
  if (endpoint.startsWith('http')) return endpoint
  return `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`
}

export function useApiFetch() {
  async function apiFetch<T = any>(
    endpoint: string,
    options: ApiFetchOptions = {}
  ): Promise<ApiFetchResult<T>> {
    const { method = 'GET', body, headers = {}, label, skipOffline = false } = options
    const isMutation = method !== 'GET'
    const url = buildUrl(endpoint)
    const token = getToken()

    const finalHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    }

    // Si mutation et serveur non joignable → on queue hors ligne
    if (isMutation && !skipOffline && !getServerReachable()) {
      try {
        await addToOfflineQueue({
          url,
          method,
          body: body ? JSON.stringify(body) : undefined,
          headers: finalHeaders,
          label,
        })
        return { data: null, queued: true, error: null }
      } catch {
        return { data: null, queued: false, error: 'Impossible de sauvegarder hors ligne.' }
      }
    }

    // Requête normale
    try {
      const data = await $fetch<T>(url, {
        method,
        headers: finalHeaders,
        body: body ?? undefined,
      })
      return { data, queued: false, error: null }
    } catch (err: any) {
      // Si erreur réseau (pas HTTP), on queue la mutation
      const isNetworkError = !err.response
      if (isMutation && !skipOffline && isNetworkError) {
        try {
          await addToOfflineQueue({
            url,
            method,
            body: body ? JSON.stringify(body) : undefined,
            headers: finalHeaders,
            label,
          })
          return { data: null, queued: true, error: null }
        } catch {
          // La queue a échoué, on remonte l'erreur originale
        }
      }

      const message =
        err?.data?.detail ||
        err?.data?.message ||
        err?.message ||
        'Une erreur est survenue.'
      return { data: null, queued: false, error: message }
    }
  }

  return { apiFetch }
}
