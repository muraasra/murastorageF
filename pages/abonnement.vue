<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Gestion de l'abonnement</h1>
        <p class="mt-2 text-gray-600">
          Consultez votre plan actuel et gérez vos limitations
        </p>
      </div>
      
      <!-- Loading state -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
      
      <div v-else class="space-y-8">
        
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
            <button 
              @click="refresh"
              class="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Actualiser
            </button>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SubscriptionCard
              v-for="plan in availablePlans"
              :key="plan.id"
              :plan="plan"
              :is-current-plan="currentLimits?.plan_name === plan.name"
              :show-upgrade-button="true"
              :loading="upgradingPlanId === plan.id"
              @upgrade="handleUpgrade"
            />
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
import { ref } from 'vue'
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

function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price)
}
</script>











