<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  produit: any
}>()

const emit = defineEmits(['edit', 'delete', 'view'])

// Computed properties
const marge = computed(() => {
  if (props.produit.prix_achat && props.produit.prix_vente) {
    return ((props.produit.prix_vente - props.produit.prix_achat) / props.produit.prix_achat) * 100
  }
  return 0
})

const margeAbsolue = computed(() => {
  if (props.produit.prix_achat && props.produit.prix_vente) {
    return props.produit.prix_vente - props.produit.prix_achat
  }
  return 0
})

const stockStatus = computed(() => {
  if (props.produit.quantite <= props.produit.stock_minimum) {
    return { status: 'low', text: 'Stock faible', color: 'red' }
  } else if (props.produit.quantite >= props.produit.stock_maximum) {
    return { status: 'high', text: 'Stock élevé', color: 'yellow' }
  } else {
    return { status: 'normal', text: 'Stock normal', color: 'green' }
  }
})

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: props.produit.devise || 'XAF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(price)
}

const formatDate = (date: string) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('fr-FR')
}
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow duration-300">
    <!-- Image du produit -->
    <div class="h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
      <img 
        v-if="produit.image" 
        :src="produit.image" 
        :alt="produit.nom"
        class="h-full w-full object-cover"
      />
      <div v-else class="text-gray-400 dark:text-gray-500">
        <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
      </div>
    </div>

    <!-- Contenu de la carte -->
    <div class="p-6">
      <!-- En-tête -->
      <div class="flex justify-between items-start mb-3">
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
            {{ produit.nom }}
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ produit.sku || produit.reference }}
          </p>
        </div>
        <UBadge 
          :color="stockStatus.color" 
          variant="soft"
          size="sm"
        >
          {{ stockStatus.text }}
        </UBadge>
      </div>

      <!-- Informations principales -->
      <div class="space-y-2 mb-4">
        <div class="flex justify-between text-sm">
          <span class="text-gray-500 dark:text-gray-400">Prix d'achat:</span>
          <span class="font-medium">{{ formatPrice(produit.prix_achat) }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-500 dark:text-gray-400">Prix de vente:</span>
          <span class="font-medium text-green-600 dark:text-green-400">{{ formatPrice(produit.prix_vente) }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-500 dark:text-gray-400">Marge:</span>
          <span class="font-medium">{{ marge.toFixed(1) }}% ({{ formatPrice(margeAbsolue) }})</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-500 dark:text-gray-400">Stock:</span>
          <span class="font-medium">{{ produit.quantite }} {{ produit.unite_mesure || 'pièces' }}</span>
        </div>
      </div>

      <!-- Catégorie et fournisseur -->
      <div class="space-y-2 mb-4">
        <div v-if="produit.categorie_nom" class="flex items-center text-sm">
          <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
          </svg>
          <span class="text-gray-600 dark:text-gray-300">{{ produit.categorie_nom }}</span>
        </div>
        <div v-if="produit.fournisseur_nom" class="flex items-center text-sm">
          <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
          </svg>
          <span class="text-gray-600 dark:text-gray-300">{{ produit.fournisseur_nom }}</span>
        </div>
      </div>

      <!-- Informations avancées -->
      <div v-if="produit.date_peremption || produit.numero_lot" class="space-y-1 mb-4 text-xs text-gray-500 dark:text-gray-400">
        <div v-if="produit.numero_lot">
          <span class="font-medium">Lot:</span> {{ produit.numero_lot }}
        </div>
        <div v-if="produit.date_peremption">
          <span class="font-medium">Péremption:</span> {{ formatDate(produit.date_peremption) }}
        </div>
      </div>

      <!-- Tags -->
      <div v-if="produit.tags && produit.tags.length > 0" class="mb-4">
        <div class="flex flex-wrap gap-1">
          <UBadge 
            v-for="tag in produit.tags.slice(0, 3)" 
            :key="tag"
            color="gray" 
            variant="soft"
            size="xs"
          >
            {{ tag }}
          </UBadge>
          <UBadge 
            v-if="produit.tags.length > 3"
            color="gray" 
            variant="soft"
            size="xs"
          >
            +{{ produit.tags.length - 3 }}
          </UBadge>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
        <UButton 
          size="sm" 
          color="blue" 
          variant="outline"
          @click="emit('view', produit)"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
          </svg>
          Voir
        </UButton>
        <UButton 
          size="sm" 
          color="green" 
          variant="outline"
          @click="emit('edit', produit)"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
          </svg>
          Modifier
        </UButton>
        <UButton 
          size="sm" 
          color="red" 
          variant="outline"
          @click="emit('delete', produit)"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
          Supprimer
        </UButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
