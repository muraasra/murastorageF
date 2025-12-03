// Composable pour optimiser les redirections vers les entrepôts
import { ref } from 'vue'
import { navigateTo } from '#app'
import { useNotification } from '@/types/useNotification'
import { useSuperAdminPreloader } from './useSuperAdminPreloader'

export const useWarehouseRedirect = () => {
  const { success, error } = useNotification()
  const { preloadBoutiqueData } = useSuperAdminPreloader()
  
  const isRedirecting = ref(false)

  // Redirection optimisée vers un entrepôt
  const redirectToWarehouse = async (boutique: any) => {
    if (isRedirecting.value) return
    
    // Vérifier que boutique est valide
    if (!boutique || !boutique.id) {
      console.error('[WarehouseRedirect] Boutique invalide:', boutique)
      error('Entrepôt invalide')
      return
    }
    
    isRedirecting.value = true
    
    try {
      const boutiqueNom = boutique.nom || 'Entrepôt'
      console.log('[WarehouseRedirect] Début de la redirection vers:', boutiqueNom)
      
      // 1. Sauvegarder l'entrepôt dans localStorage (uniquement côté client)
      if (process.client && typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem('boutique', JSON.stringify(boutique))
        } catch (e) {
          console.warn('[WarehouseRedirect] Erreur sauvegarde localStorage:', e)
        }
      }
      
      // 2. Précharger les données spécifiques à l'entrepôt en arrière-plan (uniquement côté client)
      let preloadPromise: Promise<any> | null = null
      if (process.client && boutique.id) {
        try {
          preloadPromise = preloadBoutiqueData(boutique.id)
        } catch (e) {
          console.warn('[WarehouseRedirect] Erreur démarrage préchargement:', e)
        }
      }
      
      // 3. Afficher une notification de confirmation
      if (process.client) {
        success(`Accès au dashboard de l'entrepôt "${boutiqueNom}"`)
      }
      
      // 4. Rediriger immédiatement (sans attendre le préchargement)
      try {
        await navigateTo('/user')
      } catch (navError: any) {
        // Si la navigation échoue, essayer une redirection alternative
        console.error('[WarehouseRedirect] Erreur navigation:', navError)
        if (process.client && window.location) {
          window.location.href = '/user'
        } else {
          throw navError
        }
      }
      
      // 5. Continuer le préchargement en arrière-plan (uniquement côté client)
      if (preloadPromise && process.client) {
        preloadPromise.then((data) => {
          console.log('[WarehouseRedirect] Données entrepôt préchargées:', data)
          // Optionnel: stocker les données dans un store global ou localStorage
          if (typeof localStorage !== 'undefined') {
            try {
              localStorage.setItem(`boutique_${boutique.id}_data`, JSON.stringify(data))
            } catch (e) {
              console.warn('[WarehouseRedirect] Erreur sauvegarde données:', e)
            }
          }
        }).catch((err) => {
          console.warn('[WarehouseRedirect] Erreur préchargement:', err)
          // Ne pas bloquer l'utilisateur si le préchargement échoue
        })
      }
      
    } catch (err: any) {
      console.error('[WarehouseRedirect] Erreur redirection:', err)
      if (process.client) {
        error('Erreur lors de l\'accès au dashboard de l\'entrepôt')
      }
      // En cas d'erreur critique, essayer une redirection de secours
      if (process.client && window.location) {
        try {
          window.location.href = '/user'
        } catch (e) {
          console.error('[WarehouseRedirect] Erreur redirection de secours:', e)
        }
      }
    } finally {
      isRedirecting.value = false
    }
  }

  // Redirection rapide avec préchargement intelligent
  const quickRedirectToWarehouse = async (boutique: any) => {
    if (isRedirecting.value) return
    
    // Vérifier que boutique est valide
    if (!boutique || !boutique.id) {
      console.error('[WarehouseRedirect] Boutique invalide:', boutique)
      if (process.client) {
        error('Entrepôt invalide')
      }
      return
    }
    
    isRedirecting.value = true
    
    try {
      const boutiqueNom = boutique.nom || 'Entrepôt'
      
      // Sauvegarder immédiatement (uniquement côté client)
      if (process.client && typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem('boutique', JSON.stringify(boutique))
        } catch (e) {
          console.warn('[WarehouseRedirect] Erreur sauvegarde localStorage:', e)
        }
      }
      
      // Notification instantanée (uniquement côté client)
      if (process.client) {
        success(`Accès rapide à "${boutiqueNom}"`)
      }
      
      // Redirection immédiate
      try {
        await navigateTo('/user')
      } catch (navError: any) {
        console.error('[WarehouseRedirect] Erreur navigation rapide:', navError)
        // Redirection de secours
        if (process.client && window.location) {
          window.location.href = '/user'
        } else {
          throw navError
        }
      }
      
    } catch (err: any) {
      console.error('[WarehouseRedirect] Erreur redirection rapide:', err)
      if (process.client) {
        error('Erreur lors de l\'accès rapide')
      }
      // Redirection de secours
      if (process.client && window.location) {
        try {
          window.location.href = '/user'
        } catch (e) {
          console.error('[WarehouseRedirect] Erreur redirection de secours:', e)
        }
      }
    } finally {
      isRedirecting.value = false
    }
  }

  // Vérifier et restaurer la sélection d'entrepôt
  const restoreWarehouseSelection = () => {
    if (!process.client || typeof localStorage === 'undefined') {
      return null
    }
    
    try {
      const boutique = localStorage.getItem('boutique')
      if (boutique) {
        const boutiqueData = JSON.parse(boutique)
        const boutiqueNom = boutiqueData?.nom || 'Entrepôt'
        console.log('[WarehouseRedirect] Entrepôt restauré:', boutiqueNom)
        return boutiqueData
      }
    } catch (e) {
      console.warn('[WarehouseRedirect] Erreur restauration:', e)
      try {
        localStorage.removeItem('boutique')
      } catch (removeError) {
        console.warn('[WarehouseRedirect] Erreur suppression localStorage:', removeError)
      }
    }
    return null
  }

  // Effacer la sélection d'entrepôt
  const clearWarehouseSelection = () => {
    if (!process.client || typeof localStorage === 'undefined') {
      return
    }
    
    try {
      localStorage.removeItem('boutique')
      // Nettoyer aussi les données préchargées
      const keys = Object.keys(localStorage).filter(key => key.startsWith('boutique_'))
      keys.forEach(key => {
        try {
          localStorage.removeItem(key)
        } catch (e) {
          console.warn('[WarehouseRedirect] Erreur suppression clé:', key, e)
        }
      })
      
      if (process.client) {
        success('Retour au dashboard global')
      }
      console.log('[WarehouseRedirect] Sélection d\'entrepôt effacée')
    } catch (e) {
      console.warn('[WarehouseRedirect] Erreur effacement sélection:', e)
    }
  }

  // Obtenir les données préchargées d'un entrepôt
  const getWarehouseData = (boutiqueId: number) => {
    if (!process.client || typeof localStorage === 'undefined' || !boutiqueId) {
      return null
    }
    
    try {
      const data = localStorage.getItem(`boutique_${boutiqueId}_data`)
      return data ? JSON.parse(data) : null
    } catch (e) {
      console.warn('[WarehouseRedirect] Erreur lecture données:', e)
      return null
    }
  }

  return {
    isRedirecting,
    redirectToWarehouse,
    quickRedirectToWarehouse,
    restoreWarehouseSelection,
    clearWarehouseSelection,
    getWarehouseData
  }
}
