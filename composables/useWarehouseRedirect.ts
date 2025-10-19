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
    
    isRedirecting.value = true
    
    try {
      console.log('[WarehouseRedirect] Début de la redirection vers:', boutique.nom)
      
      // 1. Sauvegarder l'entrepôt dans localStorage
      localStorage.setItem('boutique', JSON.stringify(boutique))
      
      // 2. Précharger les données spécifiques à l'entrepôt en arrière-plan
      const preloadPromise = preloadBoutiqueData(boutique.id)
      
      // 3. Afficher une notification de confirmation
      success(`Accès au dashboard de l'entrepôt "${boutique.nom}"`)
      
      // 4. Rediriger immédiatement (sans attendre le préchargement)
      await navigateTo('/user')
      
      // 5. Continuer le préchargement en arrière-plan
      preloadPromise.then((data) => {
        console.log('[WarehouseRedirect] Données entrepôt préchargées:', data)
        // Optionnel: stocker les données dans un store global ou localStorage
        localStorage.setItem(`boutique_${boutique.id}_data`, JSON.stringify(data))
      }).catch((err) => {
        console.warn('[WarehouseRedirect] Erreur préchargement:', err)
      })
      
    } catch (err) {
      console.error('[WarehouseRedirect] Erreur redirection:', err)
      error('Erreur lors de l\'accès au dashboard de l\'entrepôt')
    } finally {
      isRedirecting.value = false
    }
  }

  // Redirection rapide avec préchargement intelligent
  const quickRedirectToWarehouse = async (boutique: any) => {
    if (isRedirecting.value) return
    
    isRedirecting.value = true
    
    try {
      // Sauvegarder immédiatement
      localStorage.setItem('boutique', JSON.stringify(boutique))
      
      // Notification instantanée
      success(`Accès rapide à "${boutique.nom}"`)
      
      // Redirection immédiate
      await navigateTo('/user')
      
    } catch (err) {
      console.error('[WarehouseRedirect] Erreur redirection rapide:', err)
      error('Erreur lors de l\'accès rapide')
    } finally {
      isRedirecting.value = false
    }
  }

  // Vérifier et restaurer la sélection d'entrepôt
  const restoreWarehouseSelection = () => {
    try {
      const boutique = localStorage.getItem('boutique')
      if (boutique) {
        const boutiqueData = JSON.parse(boutique)
        console.log('[WarehouseRedirect] Entrepôt restauré:', boutiqueData.nom)
        return boutiqueData
      }
    } catch (e) {
      console.warn('[WarehouseRedirect] Erreur restauration:', e)
      localStorage.removeItem('boutique')
    }
    return null
  }

  // Effacer la sélection d'entrepôt
  const clearWarehouseSelection = () => {
    localStorage.removeItem('boutique')
    // Nettoyer aussi les données préchargées
    const keys = Object.keys(localStorage).filter(key => key.startsWith('boutique_'))
    keys.forEach(key => localStorage.removeItem(key))
    
    success('Retour au dashboard global')
    console.log('[WarehouseRedirect] Sélection d\'entrepôt effacée')
  }

  // Obtenir les données préchargées d'un entrepôt
  const getWarehouseData = (boutiqueId: number) => {
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
