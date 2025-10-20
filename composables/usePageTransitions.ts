// Composable pour optimiser les transitions entre pages
import { ref, nextTick } from 'vue'

export const usePageTransitions = () => {
  const isTransitioning = ref(false)
  const transitionDuration = ref(300) // ms

  // Transition fluide entre pages
  const transitionTo = async (route: string, options: any = {}) => {
    if (isTransitioning.value) return

    isTransitioning.value = true

    try {
      // Ajouter une classe de transition
      if (process.client) {
        document.body.classList.add('page-transitioning')
      }

      // Attendre un tick pour que la classe soit appliquée
      await nextTick()

      // Naviguer vers la nouvelle route
      await navigateTo(route, {
        replace: false,
        external: false,
        ...options
      })

      // Attendre la fin de la transition
      await new Promise(resolve => setTimeout(resolve, transitionDuration.value))

    } catch (error) {
      console.error('[Transition] Erreur lors de la transition:', error)
    } finally {
      // Retirer la classe de transition
      if (process.client) {
        document.body.classList.remove('page-transitioning')
      }
      
      isTransitioning.value = false
    }
  }

  // Transition rapide (sans animation)
  const quickTransition = async (route: string, options: any = {}) => {
    const originalDuration = transitionDuration.value
    transitionDuration.value = 0
    
    try {
      await transitionTo(route, options)
    } finally {
      transitionDuration.value = originalDuration
    }
  }

  // Précharger une route pendant la transition
  const transitionWithPreload = async (route: string, preloadFn: () => Promise<any>, options: any = {}) => {
    if (isTransitioning.value) return

    isTransitioning.value = true

    try {
      // Commencer le préchargement en arrière-plan
      const preloadPromise = preloadFn()

      // Commencer la transition
      await transitionTo(route, options)

      // Attendre que le préchargement soit terminé
      await preloadPromise

    } catch (error) {
      console.error('[Transition] Erreur transition avec préchargement:', error)
    } finally {
      isTransitioning.value = false
    }
  }

  // Transition avec indicateur de chargement
  const transitionWithLoading = async (route: string, loadingFn: () => Promise<any>, options: any = {}) => {
    if (isTransitioning.value) return

    isTransitioning.value = true

    try {
      // Afficher l'indicateur de chargement
      if (process.client) {
        const loader = document.createElement('div')
        loader.id = 'page-transition-loader'
        loader.className = 'fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50'
        loader.innerHTML = `
          <div class="flex flex-col items-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p class="mt-2 text-sm text-gray-600">Chargement...</p>
          </div>
        `
        document.body.appendChild(loader)
      }

      // Exécuter la fonction de chargement
      await loadingFn()

      // Naviguer
      await navigateTo(route, options)

    } catch (error) {
      console.error('[Transition] Erreur transition avec chargement:', error)
    } finally {
      // Retirer l'indicateur de chargement
      if (process.client) {
        const loader = document.getElementById('page-transition-loader')
        if (loader) {
          loader.remove()
        }
      }
      
      isTransitioning.value = false
    }
  }

  return {
    isTransitioning,
    transitionDuration,
    transitionTo,
    quickTransition,
    transitionWithPreload,
    transitionWithLoading
  }
}

