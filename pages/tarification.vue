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
              @click="refreshAll"
              :disabled="loading"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <svg v-if="loading" class="animate-spin h-4 w-4 mr-2 inline" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Actualiser
            </button>
            <button 
              @click="sendNotifications"
              :disabled="loading"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              📧 Vérifier notifications
            </button>
          </div>
        </div>
      </div>
      
      <!-- Loading state -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
      
      <div v-else class="space-y-8">
        
        <!-- Alertes importantes -->
        <div v-if="hasAlerts" class="space-y-4">
          <!-- Alerte période d'essai -->
          <div v-if="trialDaysRemaining > 0 && trialDaysRemaining <= 7" 
               class="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div class="flex items-center">
              <svg class="w-6 h-6 text-orange-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              <div>
                <h3 class="text-lg font-medium text-orange-800">
                  Période d'essai se termine dans {{ trialDaysRemaining }} jour{{ trialDaysRemaining > 1 ? 's' : '' }}
                </h3>
                <p class="text-orange-700">
                  Choisissez votre plan maintenant pour continuer à utiliser toutes les fonctionnalités.
                </p>
              </div>
            </div>
          </div>
          
          <!-- Alerte expiration abonnement -->
          <div v-if="subscriptionDaysRemaining > 0 && subscriptionDaysRemaining <= 30" 
               class="bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex items-center">
              <svg class="w-6 h-6 text-red-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              <div>
                <h3 class="text-lg font-medium text-red-800">
                  Abonnement expire dans {{ subscriptionDaysRemaining }} jour{{ subscriptionDaysRemaining > 1 ? 's' : '' }}
                </h3>
                <p class="text-red-700">
                  Renouvelez votre abonnement pour éviter l'interruption de service.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Plan actuel et utilisation -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <!-- Carte du plan actuel -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-bold text-gray-900">Plan actuel</h2>
              <SubscriptionBadge 
                v-if="currentLimits"
                :plan-name="currentLimits.plan_name"
                :plan-display-name="currentLimits.display_name"
                :show-icon="true"
              />
            </div>
            
            <div v-if="currentLimits" class="space-y-4">
              <div class="flex justify-between items-baseline">
                <span class="text-3xl font-bold text-gray-900">
                  {{ formatPrice(currentLimits.price_monthly) }} XAF
                </span>
                <span class="text-gray-600">/mois</span>
              </div>
              
              <!-- Informations d'abonnement -->
              <div class="bg-gray-50 rounded-lg p-4">
                <h3 class="text-sm font-medium text-gray-700 mb-2">Informations d'abonnement</h3>
                <div class="space-y-2 text-sm text-gray-600">
                  <div class="flex justify-between">
                    <span>Statut:</span>
                    <span class="font-medium text-green-600">Actif</span>
                  </div>
                  <div v-if="currentPlan?.trial_end_date" class="flex justify-between">
                    <span>Période d'essai:</span>
                    <span class="font-medium">{{ trialDaysRemaining }} jour{{ trialDaysRemaining > 1 ? 's' : '' }}</span>
                  </div>
                  <div v-if="currentPlan?.end_date" class="flex justify-between">
                    <span>Expire le:</span>
                    <span class="font-medium">{{ formatDate(currentPlan.end_date) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Dernière mise à jour:</span>
                    <span class="font-medium">{{ formatDate(currentPlan?.updated_at) }}</span>
                  </div>
                </div>
              </div>
              
              <!-- Fonctionnalités -->
              <div class="pt-4 border-t border-gray-200">
                <h3 class="text-sm font-medium text-gray-700 mb-3">Fonctionnalités incluses</h3>
                <div class="space-y-2 text-sm text-gray-600">
                  <div class="flex items-center">
                    <svg class="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                    Export CSV: {{ currentLimits.allow_export_csv ? 'Oui' : 'Non' }}
                  </div>
                  <div class="flex items-center">
                    <svg class="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                    Export Excel: {{ currentLimits.allow_export_excel ? 'Oui' : 'Non' }}
                  </div>
                  <div class="flex items-center">
                    <svg class="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                    Import CSV: {{ currentLimits.allow_import_csv ? 'Oui' : 'Non' }}
                  </div>
                  <div class="flex items-center">
                    <svg class="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                    Analyses avancées: {{ currentLimits.allow_advanced_analytics ? 'Oui' : 'Non' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Utilisation -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4">Utilisation actuelle</h2>
            
            <div v-if="currentUsage && currentLimits" class="space-y-6">
              <UsageIndicator 
                label="Utilisateurs"
                :current="currentUsage.users_count"
                :limit="currentLimits.max_users"
              />
              
              <UsageIndicator 
                label="Boutiques/Entrepôts"
                :current="currentUsage.boutiques_count"
                :limit="currentLimits.max_boutiques"
              />
              
              <UsageIndicator 
                label="Produits"
                :current="currentUsage.produits_count"
                :limit="currentLimits.max_produits"
              />
              
              <UsageIndicator 
                label="Factures ce mois"
                :current="currentUsage.factures_count"
                :limit="currentLimits.max_factures_per_month"
              />
            </div>
          </div>
        </div>
        
        <!-- Plans disponibles -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Plans disponibles</h2>
            <div class="flex items-center gap-4">
              <label class="flex items-center">
                <input 
                  v-model="showUpgradeOnly" 
                  type="checkbox" 
                  class="mr-2"
                >
                Afficher seulement les upgrades
              </label>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SubscriptionCard
              v-for="plan in filteredPlans"
              :key="plan.id"
              :plan="plan"
              :is-current-plan="currentLimits?.plan_name === plan.name"
              :show-upgrade-button="true"
              :loading="upgradingPlanId === plan.id"
              @upgrade="handleUpgrade"
            />
          </div>
        </div>
        
        <!-- Historique des changements -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Historique des changements</h2>
          <div class="text-gray-500 text-center py-8">
            <svg class="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p>L'historique des changements d'abonnement sera disponible prochainement.</p>
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
import { useSubscription, formatLimit } from '~/composables/useSubscription'

definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

const {
  currentPlan,
  currentUsage,
  currentLimits,
  availablePlans,
  loading,
  refresh,
  upgradeSubscription
} = useSubscription()

const upgradingPlanId = ref<number | null>(null)
const showUpgradeOnly = ref(false)

// Computed properties
const trialDaysRemaining = computed(() => {
  if (!currentPlan?.trial_end_date) return 0
  const now = new Date()
  const trialEnd = new Date(currentPlan.trial_end_date)
  const diffTime = trialEnd.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

const subscriptionDaysRemaining = computed(() => {
  if (!currentPlan?.end_date) return 0
  const now = new Date()
  const endDate = new Date(currentPlan.end_date)
  const diffTime = endDate.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

const hasAlerts = computed(() => {
  return (trialDaysRemaining.value > 0 && trialDaysRemaining.value <= 7) ||
         (subscriptionDaysRemaining.value > 0 && subscriptionDaysRemaining.value <= 30)
})

const filteredPlans = computed(() => {
  if (!showUpgradeOnly.value || !currentLimits.value) {
    return availablePlans.value
  }
  
  const currentPrice = currentLimits.value.price_monthly
  return availablePlans.value.filter(plan => plan.price_monthly > currentPrice)
})

// Methods
async function handleUpgrade(planId: number) {
  if (!confirm('Êtes-vous sûr de vouloir changer de plan ?')) {
    return
  }
  
  upgradingPlanId.value = planId
  try {
    await upgradeSubscription(planId)
    alert('Plan mis à jour avec succès !')
  } catch (error: any) {
    alert(`Erreur: ${error.message || 'Impossible de mettre à jour le plan'}`)
  } finally {
    upgradingPlanId.value = null
  }
}

async function refreshAll() {
  await refresh()
}

async function sendNotifications() {
  try {
    const response = await $fetch('/api/subscriptions/send_notifications/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${useAuthStore().token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.success) {
      alert(`Notifications envoyées: ${response.notifications_sent.join(', ')}`)
    }
  } catch (error: any) {
    alert(`Erreur: ${error.message || 'Impossible d\'envoyer les notifications'}`)
  }
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price)
}

function formatDate(dateString: string): string {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('fr-FR')
}

// Load data on mount
onMounted(async () => {
  await refreshAll()
})
</script>










