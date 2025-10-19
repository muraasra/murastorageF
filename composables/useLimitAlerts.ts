/**
 * Composable pour gérer les alertes de limitation automatiques
 */
import { ref, computed, watch } from 'vue'
import { useSubscription } from './useSubscription'

export function useLimitAlerts() {
  const subscriptionStore = useSubscription()
  
  // State
  const alerts = ref<Array<{
    id: string
    type: 'warning' | 'error'
    title: string
    message: string
    current: number
    limit: number
    resourceType: string
  }>>([])
  
  const dismissedAlerts = ref<Set<string>>(new Set())
  
  // Computed
  const activeAlerts = computed(() => {
    return alerts.value.filter(alert => !dismissedAlerts.value.has(alert.id))
  })
  
  const hasActiveAlerts = computed(() => activeAlerts.value.length > 0)
  
  // Watch for usage changes
  watch(
    () => subscriptionStore.currentUsage.value,
    (usage) => {
      if (!usage || !subscriptionStore.currentLimits.value) return
      
      checkLimits(usage, subscriptionStore.currentLimits.value)
    },
    { immediate: true }
  )
  
  function checkLimits(usage: any, limits: any) {
    const newAlerts: typeof alerts.value = []
    
    // Vérifier chaque type de limite
    const limitsToCheck = [
      {
        resourceType: 'users',
        current: usage.users_count,
        limit: limits.max_users,
        name: 'utilisateurs'
      },
      {
        resourceType: 'boutiques',
        current: usage.boutiques_count,
        limit: limits.max_boutiques,
        name: 'boutiques'
      },
      {
        resourceType: 'produits',
        current: usage.produits_count,
        limit: limits.max_produits,
        name: 'produits'
      },
      {
        resourceType: 'factures',
        current: usage.factures_count,
        limit: limits.max_factures_per_month,
        name: 'factures'
      }
    ]
    
    limitsToCheck.forEach(({ resourceType, current, limit, name }) => {
      if (!limit || limit >= 999999) return // Illimité
      
      const percentage = (current / limit) * 100
      const alertId = `${resourceType}_${Math.floor(percentage / 10) * 10}`
      
      // Ne pas créer d'alerte si déjà dismissée
      if (dismissedAlerts.value.has(alertId)) return
      
      // Alerte critique à 95%
      if (percentage >= 95) {
        newAlerts.push({
          id: alertId,
          type: 'error',
          title: '🚨 Limite critique atteinte',
          message: `Vous avez atteint ${percentage.toFixed(1)}% de votre limite de ${name}. Vous ne pourrez plus en créer de nouveaux.`,
          current,
          limit,
          resourceType
        })
      }
      // Alerte d'avertissement à 80%
      else if (percentage >= 80) {
        newAlerts.push({
          id: alertId,
          type: 'warning',
          title: '⚠️ Limite presque atteinte',
          message: `Vous avez utilisé ${percentage.toFixed(1)}% de votre limite de ${name}. Pensez à mettre à niveau votre plan.`,
          current,
          limit,
          resourceType
        })
      }
    })
    
    // Mettre à jour les alertes
    alerts.value = newAlerts
  }
  
  function dismissAlert(alertId: string) {
    dismissedAlerts.value.add(alertId)
  }
  
  function dismissAllAlerts() {
    alerts.value.forEach(alert => {
      dismissedAlerts.value.add(alert.id)
    })
  }
  
  function clearDismissedAlerts() {
    dismissedAlerts.value.clear()
  }
  
  return {
    // State
    alerts: activeAlerts,
    hasActiveAlerts,
    
    // Methods
    dismissAlert,
    dismissAllAlerts,
    clearDismissedAlerts
  }
}

/**
 * Plugin global pour afficher les alertes automatiquement
 */
export function useGlobalLimitAlerts() {
  const { alerts, hasActiveAlerts, dismissAlert } = useLimitAlerts()
  
  // Auto-dismiss après 10 secondes pour les avertissements
  watch(alerts, (newAlerts) => {
    newAlerts.forEach(alert => {
      if (alert.type === 'warning') {
        setTimeout(() => {
          dismissAlert(alert.id)
        }, 10000)
      }
    })
  })
  
  return {
    alerts,
    hasActiveAlerts,
    dismissAlert
  }
}















