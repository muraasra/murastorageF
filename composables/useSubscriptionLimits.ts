import { ref, computed } from 'vue'
import { useApi } from '@/stores/useApi'

/**
 * Composable pour gérer les limites et restrictions d'abonnement
 */
export const useSubscriptionLimits = () => {
  const subscription = ref<any>(null)
  const limits = ref<any>(null)
  const usage = ref<any>(null)
  const loading = ref(false)

  /**
   * Charger les données de l'abonnement
   */
  const loadSubscription = async () => {
    loading.value = true
    try {
      const { data, error } = await useApi('/api/entreprise-subscriptions/current/')
      if (!error.value && data.value) {
        subscription.value = data.value
      }
    } catch (err) {
      console.error('Erreur chargement abonnement:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Charger les limites
   */
  const loadLimits = async () => {
    try {
      const { data, error } = await useApi('/api/entreprise-subscriptions/limits/')
      if (!error.value && data.value) {
        limits.value = data.value
      }
    } catch (err) {
      console.error('Erreur chargement limites:', err)
    }
  }

  /**
   * Charger l'utilisation actuelle
   */
  const loadUsage = async () => {
    try {
      const { data, error } = await useApi('/api/entreprise-subscriptions/usage/')
      if (!error.value && data.value) {
        usage.value = data.value
      }
    } catch (err) {
      console.error('Erreur chargement usage:', err)
    }
  }

  /**
   * Vérifier si une limite est atteinte
   */
  const isLimitReached = (resourceType: string): boolean => {
    if (!limits.value || !usage.value) return false

    const limit = limits.value[resourceType]
    const current = usage.value[resourceType]?.current || 0

    if (limit === null || limit === undefined || limit === 'unlimited') {
      return false
    }

    return current >= limit
  }

  /**
   * Vérifier si une fonctionnalité est disponible
   */
  const isFeatureAvailable = (feature: string): boolean => {
    if (!subscription.value?.plan) return false
    return subscription.value.plan[`allow_${feature}`] === true
  }

  /**
   * Obtenir le message d'erreur quand limite atteinte
   */
  const getLimitErrorMessage = (resourceType: string): string => {
    const resourceNames: any = {
      'max_produits': 'produits',
      'max_boutiques': 'boutiques',
      'max_users': 'utilisateurs',
      'max_factures_per_month': 'factures ce mois',
      'max_inventaires_per_month': 'inventaires ce mois',
      'max_transfers_per_month': 'transferts ce mois'
    }

    const resourceName = resourceNames[resourceType] || resourceType
    const limit = limits.value?.[resourceType] || 'non défini'
    
    return `Vous avez atteint la limite de ${limit} ${resourceName} de votre plan. Veuillez passer à un plan supérieur pour continuer.`
  }

  /**
   * Vérifier avant de créer une ressource
   */
  const canCreateResource = (resourceType: string): { can: boolean; message?: string } => {
    // Vérifier si la fonctionnalité est disponible
    if (!isFeatureAvailable(resourceType)) {
      return {
        can: false,
        message: `Cette fonctionnalité n'est pas disponible sur votre plan actuel. Veuillez upgrader pour l'utiliser.`
      }
    }

    // Vérifier si la limite est atteinte
    if (isLimitReached(resourceType)) {
      return {
        can: false,
        message: getLimitErrorMessage(resourceType)
      }
    }

    return { can: true }
  }

  /**
   * Obtenir le plan actuel
   */
  const currentPlan = computed(() => {
    return subscription.value?.plan
  })

  /**
   * Vérifier si le plan est Free
   */
  const isFreePlan = computed(() => {
    return currentPlan.value?.name === 'free'
  })

  /**
   * Obtenir le message suggérant un upgrade
   */
  const getUpgradeSuggestion = (resourceType: string): string => {
    const suggestions: any = {
      'inventaires': 'Passer au plan Premium pour faire des inventaires (29,000 XAF/mois)',
      'transferts': 'Passer au plan Basic pour les transferts (9,900 XAF/mois)',
      'codes-barres': 'Passer au plan Basic pour les codes-barres (9,900 XAF/mois)',
      'partenaires': 'Passer au plan Basic pour la gestion de partenaires (9,900 XAF/mois)'
    }

    return suggestions[resourceType] || 'Pensez à upgrader votre plan pour plus de fonctionnalités.'
  }

  return {
    subscription,
    limits,
    usage,
    loading,
    currentPlan,
    isFreePlan,
    loadSubscription,
    loadLimits,
    loadUsage,
    isLimitReached,
    isFeatureAvailable,
    getLimitErrorMessage,
    canCreateResource,
    getUpgradeSuggestion
  }
}

