// Composable simplifié pour éviter les redirections automatiques
import { ref } from 'vue'

export const useSafeNavigation = () => {
  const isNavigating = ref(false)
  const lastNavigation = ref<string | null>(null)

  // Navigation sécurisée sans préchargement automatique
  const safeNavigate = async (route: string) => {
    if (isNavigating.value || lastNavigation.value === route) {
      console.log('[SafeNavigation] Navigation ignorée (déjà en cours ou même route)')
      return
    }

    isNavigating.value = true
    lastNavigation.value = route

    try {
      console.log('[SafeNavigation] Navigation vers:', route)
      await navigateTo(route)
    } catch (error) {
      console.error('[SafeNavigation] Erreur navigation:', error)
    } finally {
      isNavigating.value = false
    }
  }

  // Réinitialiser l'état de navigation
  const resetNavigation = () => {
    isNavigating.value = false
    lastNavigation.value = null
  }

  return {
    isNavigating,
    lastNavigation,
    safeNavigate,
    resetNavigation
  }
}

