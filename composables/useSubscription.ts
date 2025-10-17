import { ref, computed } from 'vue'
import { useApi } from '@/stores/useApi'
import { API_BASE_URL } from '@/constants'

type PlanFeature = { name: string; included: boolean }
type Plan = {
  id: number
  name: string
  display_name?: string
  price: number
  description?: string
  features?: PlanFeature[]
}

type Subscription = {
  id: number
  plan: Plan
}

type UsageItem = {
  name: string
  current: number
  limit: number | 'unlimited'
}

export function useSubscription() {
  const loading = ref(false)
  const currentPlan = ref<Plan | null>(null)
  const currentSubscription = ref<Subscription | null>(null)
  const currentUsage = ref<UsageItem[]>([])
  const currentLimits = ref<Record<string, number | 'unlimited'>>({})
  const availablePlans = ref<Plan[]>([])
  const error = ref<string | null>(null)

  const formatPrice = (amount: number) => new Intl.NumberFormat('fr-FR', { style: 'decimal' }).format(amount)

  const fetchPlans = async () => {
    const { data, error: err } = await useApi(`${API_BASE_URL}/api/subscription-plans/`, { method: 'GET', server: false, cacheTTL: 5 * 60 * 1000 })
    if (err.value) throw new Error(err.value.message)
    const plans = (data.value as any[]) || []

    const planDescriptions: Record<string, string> = {
      free: 'Accès limité aux fonctionnalités de base.',
      basic: 'Accès aux fonctionnalités de base avec quelques options supplémentaires.',
      premium: 'Accès complet à toutes les fonctionnalités standard.',
      organisation: 'Plan entreprise avec toutes les fonctionnalités'
    }

    availablePlans.value = plans.map(p => ({
      id: p.id,
      name: p.display_name || p.name,
      display_name: p.display_name,
      price: p.price_monthly || p.monthly_price || p.price || 0,
      description: p.description || planDescriptions[p.name] || '',
      features: buildPlanFeatures(p)
    }))
  }

  const fetchCurrent = async () => {
    const { data, error: err } = await useApi(`${API_BASE_URL}/api/subscriptions/current/`, { method: 'GET', server: false, cacheTTL: 5 * 60 * 1000 })
    if (err.value) throw new Error(err.value.message)
    const sub = data.value as any
    currentSubscription.value = sub
    if (sub?.plan) {
      currentPlan.value = {
        id: sub.plan.id,
        name: sub.plan.display_name || sub.plan.name,
        display_name: sub.plan.display_name,
        price: sub.plan.price_monthly || sub.plan.monthly_price || sub.plan.price || 0,
        description: sub.plan.description,
        features: buildPlanFeatures(sub.plan)
      }
    } else {
      currentPlan.value = null
    }
  }

  const fetchUsage = async () => {
    const { data, error: err } = await useApi(`${API_BASE_URL}/api/subscriptions/usage/`, { method: 'GET', server: false, cacheTTL: 5 * 60 * 1000 })
    if (err.value) throw new Error(err.value.message)
    const u: any = (data.value as any) || {}
    // Adapter au format backend (counts + limits)
    const items: UsageItem[] = [
      { name: 'Utilisateurs', current: Number(u.users_count) || 0, limit: (u.users_limit ?? u.max_users ?? 'unlimited') },
      { name: 'Boutiques/Entrepôts', current: Number(u.boutiques_count) || 0, limit: (u.boutiques_limit ?? u.max_boutiques ?? 'unlimited') },
      { name: 'Produits', current: Number(u.produits_count) || 0, limit: (u.produits_limit ?? u.max_produits ?? 'unlimited') },
      { name: 'Factures ce mois', current: Number(u.factures_count) || 0, limit: (u.factures_limit ?? u.max_factures_per_month ?? 'unlimited') },
    ]
    currentUsage.value = items
  }

  const fetchLimits = async () => {
    const { data, error: err } = await useApi(`${API_BASE_URL}/api/subscriptions/limits/`, { method: 'GET', server: false, cacheTTL: 5 * 60 * 1000 })
    if (err.value) throw new Error(err.value.message)
    currentLimits.value = (data.value as any) || {}
  }

  const refresh = async () => {
    loading.value = true
    error.value = null
    try {
      await Promise.all([fetchPlans(), fetchCurrent(), fetchUsage(), fetchLimits()])
    } catch (e: any) {
      error.value = e?.message || 'Impossible de charger les données abonnement'
    } finally {
      loading.value = false
    }
  }

  const upgradeSubscription = async (planId: number) => {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await useApi(`${API_BASE_URL}/api/subscriptions/upgrade/`, {
        method: 'POST',
        body: { plan_id: planId },
        server: false
      })
      if (err.value) throw new Error(err.value.message)
      // Après upgrade, recharger l'état courant
      await fetchCurrent()
      return { success: true, data: data.value }
    } catch (e: any) {
      error.value = e?.message || 'Échec de la mise à niveau'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const trialDaysRemaining = computed(() => {
    // Si l'API expose trial_end_date côté currentSubscription
    const sub: any = currentSubscription.value
    const end = sub?.trial_end_date
    if (!end) return 0
    const now = new Date()
    const d = new Date(end)
    return Math.max(0, Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
  })

  // Dates d'abonnement: début (backend) et fin (backend ou 30 jours après début)
  const subscriptionStartDate = computed(() => {
    const sub: any = currentSubscription.value
    return sub?.start_date || null
  })

  const subscriptionEndDate = computed(() => {
    const sub: any = currentSubscription.value
    if (sub?.end_date) return sub.end_date
    if (!sub?.start_date) return null
    try {
      const start = new Date(sub.start_date)
      const end = new Date(start)
      end.setDate(end.getDate() + 30)
      return end.toISOString()
    } catch {
      return null
    }
  })

  function buildPlanFeatures(plan: any): { name: string; included: boolean }[] {
    if (Array.isArray(plan?.features) && plan.features.length) return plan.features
    return [
      { name: '1 entreprise', included: (plan.max_entreprises ?? 1) >= 1 },
      { name: `${plan.max_boutiques ?? 1} boutiques`, included: true },
      { name: `${plan.max_users ?? 2} utilisateurs`, included: true },
      { name: `${plan.max_produits ?? 'Illimité'} produits`, included: true },
      { name: `${plan.max_factures_per_month ?? 'Illimité'} factures/mois`, included: true },
      { name: 'Export CSV', included: !!plan.allow_export_csv },
      { name: 'Export Excel', included: !!plan.allow_export_excel },
      { name: 'Import CSV', included: !!plan.allow_import_csv },
      { name: 'Accès API', included: !!plan.allow_api_access },
      { name: 'Analyses avancées', included: !!plan.allow_advanced_analytics },
      { name: 'Support prioritaire', included: plan.support_level === 'priority' || plan.support_level === 'dedicated' },
      { name: 'Support dédié', included: plan.support_level === 'dedicated' }
    ]
  }

  // Helper: vérifier côté frontend si on peut créer une ressource selon les limites chargées
  const canCreateResource = (resource: 'users' | 'boutiques' | 'produits' | 'factures') => {
    const usageMap: Record<string, { current: number; limit: number | 'unlimited' }> = {}
    for (const item of currentUsage.value) {
      const key = item.name.toLowerCase()
      if (key.includes('utilisateur')) usageMap['users'] = { current: item.current, limit: item.limit }
      else if (key.includes('boutique') || key.includes('entrepôt')) usageMap['boutiques'] = { current: item.current, limit: item.limit }
      else if (key.includes('produit')) usageMap['produits'] = { current: item.current, limit: item.limit }
      else if (key.includes('facture')) usageMap['factures'] = { current: item.current, limit: item.limit }
    }
    const m = usageMap[resource]
    if (!m) return true
    if (m.limit === 'unlimited') return true
    return m.current < (m.limit as number)
  }

  return {
    // state
    loading,
    error,
    currentPlan,
    currentSubscription,
    currentUsage,
    currentLimits,
    availablePlans,
    // helpers
    formatPrice,
    trialDaysRemaining,
    subscriptionStartDate,
    subscriptionEndDate,
    // actions
    refresh,
    upgradeSubscription
    ,canCreateResource
  }
}