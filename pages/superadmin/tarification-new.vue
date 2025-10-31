<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Tarification</h1>
      <p class="text-gray-600 dark:text-gray-400 mt-2">Choisissez le plan adapté à votre entreprise</p>
    </div>

    <!-- Plans -->
    <div v-if="loading" class="text-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin h-12 w-12 mx-auto text-blue-600" />
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Plan FREE -->
      <div v-for="plan in plans" :key="plan.id" 
           class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
           :class="{ 'ring-2 ring-blue-500': plan.name === 'premium' }">
        
        <div class="p-6">
          <!-- Badge -->
          <div v-if="plan.name === 'premium'" class="mb-4">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
              Populaire
            </span>
          </div>

          <!-- Nom et prix -->
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">{{ plan.display_name }}</h3>
          <div class="mb-4">
            <span class="text-4xl font-bold text-gray-900 dark:text-white">{{ formatPrice(plan.price_monthly) }}</span>
            <span class="text-gray-600 dark:text-gray-400"> XAF/mois</span>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">{{ plan.description }}</p>

          <!-- Liste des fonctionnalités -->
          <ul class="space-y-3 mb-6">
            <li class="flex items-start">
              <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span class="text-sm text-gray-700 dark:text-gray-300">{{ plan.max_boutiques }} boutiques</span>
            </li>
            <li class="flex items-start">
              <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span class="text-sm text-gray-700 dark:text-gray-300">{{ plan.max_users }} utilisateurs</span>
            </li>
            <li class="flex items-start">
              <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span class="text-sm text-gray-700 dark:text-gray-300">
                {{ plan.max_produits ? `${plan.max_produits} produits` : 'Produits illimités' }}
              </span>
            </li>
            <li class="flex items-start" v-if="plan.max_factures_per_month">
              <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span class="text-sm text-gray-700 dark:text-gray-300">{{ plan.max_factures_per_month }} factures/mois</span>
            </li>
            
            <li class="flex items-start" v-if="plan.allow_inventory">
              <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span class="text-sm text-gray-700 dark:text-gray-300">Inventaires</span>
            </li>
            <li class="flex items-start" v-if="plan.allow_barcode_generation">
              <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span class="text-sm text-gray-700 dark:text-gray-300">Codes-barres</span>
            </li>
            <li class="flex items-start" v-if="plan.allow_partners">
              <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span class="text-sm text-gray-700 dark:text-gray-300">Partenaires</span>
            </li>
            <li class="flex items-start" v-if="plan.allow_import_csv">
              <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span class="text-sm text-gray-700 dark:text-gray-300">Import/Export</span>
            </li>
          </ul>

          <!-- Bouton d'action -->
          <UButton
            :color="plan.name === 'premium' ? 'blue' : 'gray'"
            :variant="plan.name === currentPlanName ? 'solid' : 'outline'"
            class="w-full"
            :disabled="plan.name === currentPlanName"
            @click="handlePlanChange(plan)"
          >
            {{ plan.name === currentPlanName ? 'Plan actuel' : 'Choisir ce plan' }}
          </UButton>
        </div>
      </div>
    </div>

    <!-- Section renouvellement -->
    <div v-if="currentSubscription" class="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Renouveler votre abonnement</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UCard>
          <div class="text-center p-4">
            <h3 class="font-semibold mb-2">Prolonger de 30 jours</h3>
            <p class="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Ajoutez 30 jours à votre date d'expiration actuelle
            </p>
            <UButton color="green" @click="extendSubscription(30)" :loading="extending">
              Renouveler (+30 jours)
            </UButton>
          </div>
        </UCard>
        
        <UCard>
          <div class="text-center p-4">
            <h3 class="font-semibold mb-2">Changer la période</h3>
            <p class="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Passer en mensuel ou annuel (10% de réduction)
            </p>
            <UButton color="blue" variant="outline" @click="showBillingModal = true">
              Gérer la facturation
            </UButton>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "default"
})

const { success, error } = useNotification()

const loading = ref(false)
const extending = ref(false)
const plans = ref<any[]>([])
const currentSubscription = ref<any>(null)
const currentPlanName = ref('')
const showBillingModal = ref(false)

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-FR').format(price)
}

const loadPlans = async () => {
  loading.value = true
  try {
    const { data, error: err } = await useApi('/api/subscription-plans/')
    if (err.value) throw err.value
    plans.value = data.value || []
  } catch (e) {
    error('Erreur lors du chargement des plans')
  } finally {
    loading.value = false
  }
}

const loadCurrentSubscription = async () => {
  try {
    const { data, error: err } = await useApi('/api/entreprise-subscriptions/current/')
    if (err.value) throw err.value
    currentSubscription.value = data.value
    currentPlanName.value = data.value?.plan?.name || 'free'
  } catch (e) {
    console.error('Erreur chargement abonnement:', e)
  }
}

const handlePlanChange = async (plan: any) => {
  if (!confirm(`Changer pour le plan ${plan.display_name} ?`)) return
  
  loading.value = true
  try {
    const { error: err } = await useApi('/api/entreprise-subscriptions/upgrade/', {
      method: 'POST',
      body: { plan_id: plan.id }
    })
    if (err.value) throw err.value
    success('Plan changé avec succès!')
    await loadCurrentSubscription()
  } catch (e) {
    error('Erreur lors du changement de plan')
  } finally {
    loading.value = false
  }
}

const extendSubscription = async (days: number) => {
  extending.value = true
  try {
    const { error: err } = await useApi('/api/entreprise-subscriptions/extend/', {
      method: 'POST',
      body: { days }
    })
    if (err.value) throw err.value
    success(`Abonnement prolongé de ${days} jours!`)
    await loadCurrentSubscription()
  } catch (e) {
    error('Erreur lors du renouvellement')
  } finally {
    extending.value = false
  }
}

onMounted(() => {
  loadPlans()
  loadCurrentSubscription()
})
</script>

