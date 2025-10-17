<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Tarification & Abonnement</h1>
            <p class="mt-2 text-gray-600">
              Gérez votre plan d'abonnement et surveillez votre utilisation
            </p>
          </div>
          <div class="flex items-center gap-4">
            <button 
              @click="refreshData"
              :disabled="loading"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <svg v-if="loading" class="animate-spin h-4 w-4 mr-2 inline" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Actualiser
            </button>
          </div>
        </div>
      </div>
      
      <!-- Loading state -->
      <div v-if="loading" class="flex items-center justify-center py-24">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
        <div class="flex items-start">
          <svg class="w-5 h-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM9 7a1 1 0 012 0v4a1 1 0 11-2 0V7zm1 8a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" clip-rule="evenodd" />
          </svg>
          <div>
            <p class="font-medium">Erreur lors du chargement des données</p>
            <p class="text-sm">{{ error }}</p>
            <button @click="refreshData" class="mt-3 px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700">Réessayer</button>
          </div>
        </div>
      </div>

      <div v-else class="space-y-8">
        
        <!-- Plan actuel et utilisation -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <!-- Carte du plan actuel -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-bold text-gray-900">Plan actuel</h2>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {{ currentPlan ? (currentPlan.display_name || currentPlan.name) : '—' }}
              </span>
            </div>
            
            <div class="space-y-4">
              <div class="flex justify-between items-baseline">
                <span class="text-3xl font-bold text-gray-900">
                  {{ !currentPlan ? '—' : (currentPlan.price === 0 ? 'Gratuit' : `${formatPrice(currentPlan.price)} XAF`) }}
                </span>
                <span v-if="currentPlan && currentPlan.price > 0" class="text-gray-600">/mois</span>
              </div>
              
              <!-- Informations d'abonnement -->
              <div class="bg-gray-50 rounded-lg p-4">
                <h3 class="text-sm font-medium text-gray-700 mb-2">Informations d'abonnement</h3>
                <div class="space-y-2 text-sm text-gray-600">
                  <div class="flex justify-between">
                    <span>Statut:</span>
                    <span class="font-medium text-green-600">Actif</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Début:</span>
                    <span class="font-medium">{{ formatDate(subscriptionStartDate) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Fin (estimée):</span>
                    <span class="font-medium">{{ formatDate(subscriptionEndDate) }}</span>
                  </div>
                </div>
              </div>
              
              <!-- Fonctionnalités -->
              <div class="pt-4 border-t border-gray-200">
                <h3 class="text-sm font-medium text-gray-700 mb-3">Fonctionnalités incluses</h3>
                <div v-if="(currentPlan?.features || []).length" class="space-y-2 text-sm text-gray-600">
                  <div v-for="feature in (currentPlan?.features || [])" :key="feature.name" class="flex items-center">
                    <svg 
                      class="w-4 h-4 mr-2" 
                      :class="feature.included ? 'text-green-500' : 'text-red-500'" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path 
                        v-if="feature.included" 
                        fill-rule="evenodd" 
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                        clip-rule="evenodd"
                      />
                      <path 
                        v-else 
                        fill-rule="evenodd" 
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                        clip-rule="evenodd"
                      />
                    </svg>
                    <span :class="feature.included ? 'text-gray-700' : 'text-red-500 line-through'">
                      {{ feature.name }}
                    </span>
                  </div>
                </div>
                <div v-else class="text-sm text-gray-500">Aucune fonctionnalité détaillée.</div>
              </div>
            </div>
          </div>
          
          <!-- Utilisation -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4">Utilisation actuelle</h2>
            
            <div v-if="usageData.length" class="space-y-6">
              <div v-for="usage in usageData" :key="usage.name" class="mb-4">
                <div class="flex justify-between items-center mb-1">
                  <span class="text-sm font-medium text-gray-700">{{ usage.name }}</span>
                  <span class="text-sm text-gray-500">
                    {{ usage.current }} / {{ usage.limit === 'unlimited' ? 'Illimité' : usage.limit }}
                    <span v-if="usage.isLimitReached" class="text-red-500 ml-1">(Limite atteinte)</span>
                  </span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    class="h-2.5 rounded-full"
                    :class="usage.progressBarClass"
                    :style="{ width: usage.progressBarWidth }"
                  ></div>
                </div>
              </div>
            </div>
            <div v-else class="text-sm text-gray-500">Aucune donnée d'utilisation disponible.</div>
          </div>
        </div>
        
        <!-- Plans disponibles -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Plans disponibles</h2>
            <div class="flex items-center">
              <label class="flex items-center">
                <input 
                  v-model="showUpgradeOnly" 
                  type="checkbox" 
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                >
                <span class="ml-2 text-sm text-gray-600">Afficher seulement les upgrades</span>
              </label>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div 
              v-for="plan in filteredPlans" 
              :key="plan.id"
              class="bg-white rounded-lg shadow-md p-6 flex flex-col border-2"
              :class="{ 'border-blue-500': plan.isCurrent }"
            >
              <h3 class="text-2xl font-bold mb-4" :class="isCurrent(plan) ? 'text-blue-600' : 'text-gray-900'">
                {{ plan.display_name || plan.name }}
              </h3>
              <p class="text-gray-600 mb-4">{{ plan.description }}</p>

              <div class="mb-6">
                <span class="text-4xl font-extrabold" :class="isCurrent(plan) ? 'text-blue-600' : 'text-gray-900'">
                  {{ plan.price === 0 ? 'Gratuit' : `${formatPrice(plan.price)} XAF` }}
                </span>
                <span v-if="plan.price > 0" class="text-gray-500">/ mois</span>
              </div>

              <ul class="space-y-2 text-gray-700 flex-grow mb-6">
                <li v-for="feature in plan.features" :key="feature.name">
                  <svg 
                    class="w-5 h-5 inline-block mr-2" 
                    :class="feature.included ? 'text-green-500' : 'text-red-500'" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path 
                      v-if="feature.included" 
                      fill-rule="evenodd" 
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                      clip-rule="evenodd"
                    />
                    <path 
                      v-else 
                      fill-rule="evenodd" 
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                      clip-rule="evenodd"
                    />
                  </svg>
                  <span :class="feature.included ? 'text-gray-700' : 'text-red-500 line-through'">
                    {{ feature.name }}
                  </span>
                </li>
              </ul>

              <button
                v-if="!isCurrent(plan)"
                @click="handleUpgrade(plan.id)"
                :disabled="loading"
                class="mt-auto w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {{ loading ? 'Mise à niveau...' : 'Choisir ce plan' }}
              </button>
              <button
                v-else
                disabled
                class="mt-auto w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-400 cursor-not-allowed"
              >
                Plan actuel
              </button>
            </div>
          </div>
        </div>
        
        <!-- FAQ ou aide -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div class="flex items-start">
            <svg class="w-6 h-6 text-blue-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
            </svg>
            <div>
              <h3 class="text-lg font-medium text-blue-900 mb-2">
                Besoin d'aide pour choisir un plan ?
              </h3>
              <p class="text-blue-700 mb-3">
                Notre équipe est là pour vous aider à trouver le plan qui correspond le mieux à vos besoins.
              </p>
              <a 
                href="mailto:support@storage.com" 
                class="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                Contactez-nous
                <svg class="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSubscription } from '@/composables/useSubscription'

definePageMeta({
  layout: 'superadmin'
})

const showUpgradeOnly = ref(false)

const {
  loading,
  error,
  currentPlan,
  currentUsage,
  availablePlans,
  formatPrice,
  subscriptionStartDate,
  subscriptionEndDate,
  refresh,
  upgradeSubscription
} = useSubscription()

// Normaliser les données d'utilisation pour l'affichage
const usageData = computed(() => {
  const raw = currentUsage.value as any
  const arr: any[] = Array.isArray(raw)
    ? raw
    : raw && typeof raw === 'object'
      ? Object.keys(raw).map(k => ({ name: k, ...(raw as any)[k] }))
      : []

  return arr.map((u: any) => {
    const name = u.name || u.label || 'Ressource'
    const current = Number(u.current ?? u.value ?? 0) || 0
    const limitRaw = u.limit ?? u.max
    const isUnlimited = limitRaw === undefined || limitRaw === null || limitRaw === 'unlimited'
    const limit = isUnlimited ? 'unlimited' as const : Number(limitRaw) || 0
    const pct = isUnlimited || limit === 0 ? 0 : Math.min(100, Math.round((current / (limit as number)) * 100))
    return {
      name,
      current,
      limit,
      isLimitReached: !isUnlimited && current >= (limit as number),
      progressBarClass: pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-yellow-500' : 'bg-green-500',
      progressBarWidth: `${pct}%`
    }
  })
})

const filteredPlans = computed(() => {
  const plans = availablePlans.value || []
  if (!showUpgradeOnly.value || !currentPlan.value) return plans
  return plans.filter(p => (p.price || 0) > (currentPlan.value?.price || 0))
})

// Methods
function isCurrent(plan: any) {
  if (!currentPlan.value) return false
  return plan?.id === currentPlan.value.id
}

async function handleUpgrade(planId: number) {
  if (!confirm('Êtes-vous sûr de vouloir changer de plan ?')) return
  const res = await upgradeSubscription(planId)
  if (res.success) {
    alert('Plan mis à jour avec succès !')
    await refresh()
  } else {
    alert(`Erreur: ${res.error || 'Impossible de mettre à jour le plan'}`)
  }
}

async function refreshData() {
  await refresh()
}

onMounted(() => {
  refresh()
})

function formatDate(d: any) {
  if (!d) return '—'
  try {
    const date = new Date(d)
    return date.toLocaleDateString('fr-FR')
  } catch { return '—' }
}
</script>