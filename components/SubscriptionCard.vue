<template>
  <div
    class="bg-white rounded-lg shadow-md p-6 flex flex-col border-2"
    :class="{ 'border-blue-500': isCurrentPlan }"
  >
    <h3 class="text-2xl font-bold mb-4" :class="titleClass">{{ plan.display_name }}</h3>
    <p class="text-gray-600 mb-4">{{ plan.description }}</p>

    <div class="mb-6">
      <span class="text-4xl font-extrabold" :class="priceClass">
        {{ plan.price_monthly === 0 ? 'Gratuit' : `${formatPrice(plan.price_monthly)} XAF` }}
      </span>
      <span v-if="plan.price_monthly > 0" class="text-gray-500">/ mois</span>
    </div>

    <ul class="space-y-2 text-gray-700 flex-grow mb-6">
      <li v-if="plan.max_entreprises !== null">
        <svg class="w-5 h-5 inline-block mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clip-rule="evenodd"/>
        </svg>
        {{ plan.max_entreprises === 999999 ? 'Entreprises illimitées' : `${plan.max_entreprises} entreprise(s)` }}
      </li>
      <li v-if="plan.max_boutiques !== null">
        <svg class="w-5 h-5 inline-block mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clip-rule="evenodd"/>
        </svg>
        {{ plan.max_boutiques === 999999 ? 'Boutiques illimitées' : `${plan.max_boutiques} boutique(s)` }}
      </li>
      <li v-if="plan.max_users !== null">
        <svg class="w-5 h-5 inline-block mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
        </svg>
        {{ plan.max_users === 999999 ? 'Utilisateurs illimités' : `${plan.max_users} utilisateur(s)` }}
      </li>
      <li v-if="plan.max_produits !== null">
        <svg class="w-5 h-5 inline-block mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/>
        </svg>
        {{ plan.max_produits === null ? 'Produits illimités' : `${plan.max_produits} produit(s)` }}
      </li>
      <li v-if="plan.max_factures_per_month !== null">
        <svg class="w-5 h-5 inline-block mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"/>
        </svg>
        {{ plan.max_factures_per_month === null ? 'Factures illimitées' : `${plan.max_factures_per_month} factures/mois` }}
      </li>
      <li :class="{ 'text-green-600': plan.allow_export_csv, 'text-red-500 line-through': !plan.allow_export_csv }">
        <svg class="w-5 h-5 inline-block mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path v-if="plan.allow_export_csv" fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
          <path v-else fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
        </svg>
        Export CSV
      </li>
      <li :class="{ 'text-green-600': plan.allow_export_excel, 'text-red-500 line-through': !plan.allow_export_excel }">
        <svg class="w-5 h-5 inline-block mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path v-if="plan.allow_export_excel" fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
          <path v-else fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
        </svg>
        Export Excel
      </li>
      <li :class="{ 'text-green-600': plan.allow_import_csv, 'text-red-500 line-through': !plan.allow_import_csv }">
        <svg class="w-5 h-5 inline-block mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path v-if="plan.allow_import_csv" fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
          <path v-else fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
        </svg>
        Import CSV
      </li>
      <li :class="{ 'text-green-600': plan.allow_api_access, 'text-red-500 line-through': !plan.allow_api_access }">
        <svg class="w-5 h-5 inline-block mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path v-if="plan.allow_api_access" fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
          <path v-else fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
        </svg>
        Accès API
      </li>
      <li :class="{ 'text-green-600': plan.allow_multiple_entreprises, 'text-red-500 line-through': !plan.allow_multiple_entreprises }">
        <svg class="w-5 h-5 inline-block mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path v-if="plan.allow_multiple_entreprises" fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
          <path v-else fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
        </svg>
        Multi-entreprises
      </li>
      <li :class="{ 'text-green-600': plan.allow_advanced_analytics, 'text-red-500 line-through': !plan.allow_advanced_analytics }">
        <svg class="w-5 h-5 inline-block mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path v-if="plan.allow_advanced_analytics" fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
          <path v-else fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
        </svg>
        Analyses avancées
      </li>
      <li :class="{ 'text-green-600': plan.allow_custom_branding, 'text-red-500 line-through': !plan.allow_custom_branding }">
        <svg class="w-5 h-5 inline-block mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path v-if="plan.allow_custom_branding" fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
          <path v-else fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
        </svg>
        Marque personnalisée
      </li>
      <li>
        <svg class="w-5 h-5 inline-block mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
        </svg>
        Support {{ supportLevelDisplay }}
      </li>
    </ul>

    <button
      v-if="!isCurrentPlan && showUpgradeButton"
      @click="emit('upgrade', plan.id)"
      :disabled="loading"
      class="mt-auto w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
    >
      {{ loading ? 'Mise à niveau...' : 'Choisir ce plan' }}
    </button>
    <button
      v-else-if="isCurrentPlan"
      disabled
      class="mt-auto w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-400 cursor-not-allowed"
    >
      Plan actuel
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  plan: any
  isCurrentPlan?: boolean
  showUpgradeButton?: boolean
  loading?: boolean
}>()

const emit = defineEmits(['upgrade'])

const titleClass = computed(() => {
  if (props.isCurrentPlan) return 'text-blue-600'
  return 'text-gray-900'
})

const priceClass = computed(() => {
  if (props.isCurrentPlan) return 'text-blue-600'
  return 'text-gray-900'
})

const supportLevelDisplay = computed(() => {
  switch (props.plan.support_level) {
    case 'email': return 'Email'
    case 'priority': return 'Prioritaire'
    case 'dedicated': return 'Dédié'
    default: return props.plan.support_level
  }
})

function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price)
}
</script>