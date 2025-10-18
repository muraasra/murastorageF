// Composable useApi pour compatibilité avec les pages existantes
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { API_BASE_URL } from '@/constants'

export async function useApi<T = unknown>(url: string, options: any = {}) {
  // Éviter les appels API côté serveur pendant le pré-rendu
  if (process.server) {
    return { 
      data: ref(null), 
      error: ref(new Error('API calls disabled during SSR')) 
    }
  }

  const auth = useAuthStore()
  
  // Construire l'URL complète si nécessaire
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`
  
  try {
    // Utiliser $fetch directement pour éviter les problèmes SSR
    const response = await $fetch<T>(fullUrl, {
      headers: {
        'Content-Type': 'application/json',
        ...(auth.token ? { Authorization: `Bearer ${auth.token}` } : {})
      },
      ...options
    })

    return { 
      data: ref(response), 
      error: ref(null) 
    }
  } catch (e: any) {
    console.error('API Error:', e)
    return { 
      data: ref(null),
      error: ref(e instanceof Error ? e : new Error('Une erreur est survenue'))
    }
  }
}
