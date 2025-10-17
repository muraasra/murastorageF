import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { API_BASE_URL } from '@/constants'
import { useAuthStore } from './auth'

export interface SubscriptionPlan {
  id: number
  name: string
  display_name: string
  description: string
  price_monthly: number
  price_yearly: number
  max_entreprises: number
  max_boutiques: number
  max_users: number
  max_produits: number | null
  max_factures_per_month: number | null
  allow_export_csv: boolean
  allow_export_excel: boolean
  allow_import_csv: boolean
  allow_api_access: boolean
  allow_multiple_entreprises: boolean
  allow_advanced_analytics: boolean
  allow_custom_branding: boolean
  support_level: string
}

export interface CurrentUsage {
  factures_count: number
  produits_count: number
  users_count: number
  boutiques_count: number
  factures_limit: number | null
  produits_limit: number | null
  users_limit: number
  boutiques_limit: number
  is_factures_limit_reached: boolean
  is_produits_limit_reached: boolean
  is_users_limit_reached: boolean
  is_boutiques_limit_reached: boolean
}

export interface SubscriptionLimits {
  plan_name: string
  display_name: string
  max_entreprises: number
  max_boutiques: number
  max_users: number
  max_produits: number | null
  max_factures_per_month: number | null
  allow_export_csv: boolean
  allow_export_excel: boolean
  allow_import_csv: boolean
  allow_api_access: boolean
  allow_multiple_entreprises: boolean
  allow_advanced_analytics: boolean
  allow_custom_branding: boolean
  support_level: string
  price_monthly: number
  price_yearly: number
}

export const useSubscriptionStore = defineStore('subscription', () => {
  const authStore = useAuthStore()
  
  // State
  const currentPlan = ref<SubscriptionPlan | null>(null)
  const currentUsage = ref<CurrentUsage | null>(null)
  const currentLimits = ref<SubscriptionLimits | null>(null)
  const availablePlans = ref<SubscriptionPlan[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const isFreePlan = computed(() => currentLimits.value?.plan_name === 'free')
  const isBasicPlan = computed(() => currentLimits.value?.plan_name === 'basic')
  const isPremiumPlan = computed(() => currentLimits.value?.plan_name === 'premium')
  const isOrganisationPlan = computed(() => currentLimits.value?.plan_name === 'organisation')
  
  const canExportCSV = computed(() => currentLimits.value?.allow_export_csv || false)
  const canExportExcel = computed(() => currentLimits.value?.allow_export_excel || false)
  const canImportCSV = computed(() => currentLimits.value?.allow_import_csv || false)
  const canAccessAPI = computed(() => currentLimits.value?.allow_api_access || false)
  const canUseAdvancedAnalytics = computed(() => currentLimits.value?.allow_advanced_analytics || false)
  
  const usagePercentage = computed(() => {
    if (!currentUsage.value || !currentLimits.value) return {}
    
    const calculate = (current: number, limit: number | null) => {
      if (limit === null) return 0
      return Math.min((current / limit) * 100, 100)
    }
    
    return {
      users: calculate(currentUsage.value.users_count, currentLimits.value.max_users),
      boutiques: calculate(currentUsage.value.boutiques_count, currentLimits.value.max_boutiques),
      produits: calculate(currentUsage.value.produits_count, currentLimits.value.max_produits),
      factures: calculate(currentUsage.value.factures_count, currentLimits.value.max_factures_per_month)
    }
  })

  // Actions
  async function fetchCurrentSubscription() {
    loading.value = true
    error.value = null
    try {
      const response = await $fetch(`${API_BASE_URL}/api/subscriptions/current/`, {
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Content-Type': 'application/json'
        }
      })
      currentPlan.value = response as SubscriptionPlan
      return response
    } catch (e: any) {
      error.value = e.message || 'Erreur lors de la récupération de l\'abonnement'
      console.error('Erreur récupération abonnement:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchCurrentLimits() {
    loading.value = true
    error.value = null
    try {
      const response = await $fetch(`${API_BASE_URL}/api/subscriptions/limits/`, {
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Content-Type': 'application/json'
        }
      })
      currentLimits.value = response as SubscriptionLimits
      return response
    } catch (e: any) {
      error.value = e.message || 'Erreur lors de la récupération des limites'
      console.error('Erreur récupération limites:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchCurrentUsage() {
    loading.value = true
    error.value = null
    try {
      const response = await $fetch(`${API_BASE_URL}/api/subscriptions/usage/`, {
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Content-Type': 'application/json'
        }
      })
      currentUsage.value = response as CurrentUsage
      return response
    } catch (e: any) {
      error.value = e.message || 'Erreur lors de la récupération de l\'utilisation'
      console.error('Erreur récupération utilisation:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchAvailablePlans() {
    loading.value = true
    error.value = null
    try {
      const response = await $fetch(`${API_BASE_URL}/api/subscription-plans/`, {
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Content-Type': 'application/json'
        }
      })
      availablePlans.value = response as SubscriptionPlan[]
      return response
    } catch (e: any) {
      error.value = e.message || 'Erreur lors de la récupération des plans'
      console.error('Erreur récupération plans:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function checkLimit(resourceType: string): Promise<{ can_create: boolean, message: string }> {
    try {
      const response = await $fetch(`${API_BASE_URL}/api/subscriptions/check_limit/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Content-Type': 'application/json'
        },
        body: {
          resource_type: resourceType
        }
      })
      return response as { can_create: boolean, message: string }
    } catch (e: any) {
      console.error('Erreur vérification limite:', e)
      return {
        can_create: false,
        message: e.message || 'Erreur lors de la vérification de la limite'
      }
    }
  }

  async function checkFeature(featureName: string): Promise<{ is_available: boolean, message: string }> {
    try {
      const response = await $fetch(`${API_BASE_URL}/api/subscriptions/check_feature/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Content-Type': 'application/json'
        },
        body: {
          feature_name: featureName
        }
      })
      return response as { is_available: boolean, message: string }
    } catch (e: any) {
      console.error('Erreur vérification fonctionnalité:', e)
      return {
        is_available: false,
        message: e.message || 'Erreur lors de la vérification de la fonctionnalité'
      }
    }
  }

  async function upgradeSubscription(planId: number) {
    loading.value = true
    error.value = null
    try {
      const response = await $fetch(`${API_BASE_URL}/api/subscriptions/upgrade/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Content-Type': 'application/json'
        },
        body: {
          plan_id: planId
        }
      })
      
      // Recharger les données après l'upgrade
      await Promise.all([
        fetchCurrentSubscription(),
        fetchCurrentLimits(),
        fetchCurrentUsage()
      ])
      
      return response
    } catch (e: any) {
      error.value = e.message || 'Erreur lors de la mise à niveau'
      console.error('Erreur upgrade:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function downgradeSubscription(planId: number) {
    loading.value = true
    error.value = null
    try {
      const response = await $fetch(`${API_BASE_URL}/api/subscriptions/downgrade/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Content-Type': 'application/json'
        },
        body: {
          plan_id: planId
        }
      })
      
      // Recharger les données après le downgrade
      await Promise.all([
        fetchCurrentSubscription(),
        fetchCurrentLimits(),
        fetchCurrentUsage()
      ])
      
      return response
    } catch (e: any) {
      error.value = e.message || 'Erreur lors de la rétrogradation'
      console.error('Erreur downgrade:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function sendNotifications() {
    try {
      const response = await $fetch(`${API_BASE_URL}/api/subscriptions/send_notifications/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Content-Type': 'application/json'
        }
      })
      return response
    } catch (e: any) {
      console.error('Erreur envoi notifications:', e)
      throw e
    }
  }

  async function refreshAll() {
    await Promise.all([
      fetchCurrentSubscription(),
      fetchCurrentLimits(),
      fetchCurrentUsage(),
      fetchAvailablePlans()
    ])
  }

  function canCreateResource(resourceType: string): boolean {
    if (!currentUsage.value || !currentLimits.value) return false
    
    switch (resourceType) {
      case 'users':
        return !currentUsage.value.is_users_limit_reached
      case 'boutiques':
        return !currentUsage.value.is_boutiques_limit_reached
      case 'produits':
        return !currentUsage.value.is_produits_limit_reached
      case 'factures':
        return !currentUsage.value.is_factures_limit_reached
      default:
        return false
    }
  }

  return {
    // State
    currentPlan,
    currentUsage,
    currentLimits,
    availablePlans,
    loading,
    error,
    
    // Computed
    isFreePlan,
    isBasicPlan,
    isPremiumPlan,
    isOrganisationPlan,
    canExportCSV,
    canExportExcel,
    canImportCSV,
    canAccessAPI,
    canUseAdvancedAnalytics,
    usagePercentage,
    
    // Actions
    fetchCurrentSubscription,
    fetchCurrentLimits,
    fetchCurrentUsage,
    fetchAvailablePlans,
    checkLimit,
    checkFeature,
    upgradeSubscription,
    downgradeSubscription,
    sendNotifications,
    refreshAll,
    canCreateResource
  }
})

