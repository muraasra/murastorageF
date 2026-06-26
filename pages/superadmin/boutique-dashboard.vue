<template>
  <div>
    <!-- En-tête avec informations de l'entrepôt -->
    <div class="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-4">
            <svg class="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
            </svg>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ boutiqueData?.nom || 'Entrepôt' }}</h1>
            <p class="text-gray-600 dark:text-gray-300">{{ boutiqueData?.ville || '' }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Responsable: {{ boutiqueData?.responsable || 'Non assigné' }}</p>
          </div>
        </div>
        <div class="flex space-x-3">
          <button 
            @click="goBackToSuperadmin" 
            class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <svg class="h-4 w-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Retour au dashboard global
          </button>
          <button 
            @click="refreshData" 
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg class="h-4 w-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Actualiser
          </button>
        </div>
      </div>
    </div>

    <!-- Statistiques principales -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="flex items-center">
          <div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <svg class="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Produits en stock</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ produitsEnStock }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="flex items-center">
          <div class="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <svg class="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Valeur du stock</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ totalValeurStock.toLocaleString() }} FCFA</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="flex items-center">
          <div class="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <svg class="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Mouvements récents</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ mouvementsRecents }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="flex items-center">
          <div class="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <svg class="h-6 w-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Factures ce mois</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ facturesCeMois }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions rapides -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <NuxtLink to="/stock-produit" class="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow text-left">
        <div class="flex items-center">
          <div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <svg class="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
            </svg>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Gérer le Stock</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">Voir et gérer les produits</p>
          </div>
        </div>
      </NuxtLink>

      <NuxtLink to="/facturation" class="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow text-left">
        <div class="flex items-center">
          <div class="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <svg class="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Nouvelle Vente</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">Créer une facture</p>
          </div>
        </div>
      </NuxtLink>

      <NuxtLink to="/mouvements-stock" class="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow text-left">
        <div class="flex items-center">
          <div class="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <svg class="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Mouvements</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">Voir les mouvements de stock</p>
          </div>
        </div>
      </NuxtLink>

      <NuxtLink to="/listes-factures" class="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow text-left">
        <div class="flex items-center">
          <div class="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <svg class="h-6 w-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Factures</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">Voir toutes les factures</p>
          </div>
        </div>
      </NuxtLink>
    </div>

    <!-- Graphiques et analyses -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Top 5 produits par quantité -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top 5 Produits par Quantité</h3>
        <div v-if="topProductsByQuantity.length > 0" class="space-y-3">
          <div v-for="(produit, index) in topProductsByQuantity" :key="produit.id" class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600 dark:text-blue-400">
                {{ index + 1 }}
              </div>
              <div class="ml-3">
                <p class="font-medium text-gray-900 dark:text-white">{{ produit.nom }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ produit.categorie?.nom || 'Sans catégorie' }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="font-semibold text-gray-900 dark:text-white">{{ produit.quantiteStock }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">unités</p>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
          Aucun produit en stock
        </div>
      </div>

      <!-- Top 5 produits par valeur -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top 5 Produits par Valeur</h3>
        <div v-if="topProductsByValue.length > 0" class="space-y-3">
          <div v-for="(produit, index) in topProductsByValue" :key="produit.id" class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-sm font-semibold text-green-600 dark:text-green-400">
                {{ index + 1 }}
              </div>
              <div class="ml-3">
                <p class="font-medium text-gray-900 dark:text-white">{{ produit.nom }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ produit.categorie?.nom || 'Sans catégorie' }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="font-semibold text-gray-900 dark:text-white">{{ ((produit.quantiteStock || 0) * (produit.prixUnitaire || 0)).toLocaleString() }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">FCFA</p>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
          Aucun produit en stock
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useApiBase } from '@/composables/useApiBase'
import { useNotification } from '@/types/useNotification'
import type { Produit } from '~/types'

const { getApiUrl, getAuthHeaders } = useApiBase()

definePageMeta({
  layout: "superadmin",
})

const { success, error } = useNotification()

const boutiqueData = ref<any>(null)
const produits = ref<Produit[] | null>(null)
const produitsEnStock = ref(0)
const totalValeurStock = ref(0)
const mouvementsRecents = ref(0)
const facturesCeMois = ref(0)

// Computed properties pour les graphiques
const topProductsByQuantity = computed(() => {
  if (!produits.value) return []
  return (produits.value as any[])
    .filter(p => (p.quantiteStock || 0) > 0)
    .sort((a, b) => (b.quantiteStock || 0) - (a.quantiteStock || 0))
    .slice(0, 5)
})

const topProductsByValue = computed(() => {
  if (!produits.value) return []
  return (produits.value as any[])
    .filter(p => (p.quantiteStock || 0) > 0)
    .sort((a, b) => ((b.quantiteStock || 0) * (b.prixUnitaire || 0)) - ((a.quantiteStock || 0) * (a.prixUnitaire || 0)))
    .slice(0, 5)
})

// Fonctions
const loadBoutiqueData = async () => {
  try {
    const boutique = localStorage.getItem('boutique')
    if (!boutique) {
      error('Aucun entrepôt sélectionné')
      await navigateTo('/superadmin/dashboard')
      return
    }
    
    boutiqueData.value = JSON.parse(boutique)
    
    // Charger les stocks + produits de l'entrepôt
    const h = getAuthHeaders()
    const toArr = (r: any) => Array.isArray(r) ? r : (r?.results ?? [])

    const stocksRaw: any = await $fetch(getApiUrl(`/api/stocks/?entrepot=${boutiqueData.value.id}`), { headers: h })
    const stocksAvecQuantite = toArr(stocksRaw).filter((s: any) => s.quantite > 0)

    if (stocksAvecQuantite.length > 0) {
      // Récupérer les produits via l'entreprise
      const entrepriseId = boutiqueData.value?.entreprise?.id || boutiqueData.value?.entreprise
      let prodsRaw: any = []
      if (entrepriseId) {
        prodsRaw = await $fetch(getApiUrl(`/api/produits/?entreprise=${entrepriseId}`), { headers: h })
      }
      const rawProds: any[] = toArr(prodsRaw)

      produits.value = rawProds.map((p: any) => {
        const stock = stocksAvecQuantite.find((s: any) => s.produit === p.id)
        return { ...p, quantiteStock: stock?.quantite || 0, prixUnitaire: parseFloat(p.prix_vente || p.prix || 0) }
      }).filter((p: any) => p.quantiteStock > 0)

      produitsEnStock.value = stocksAvecQuantite.reduce((acc: number, s: any) => acc + s.quantite, 0)
      totalValeurStock.value = produits.value.reduce((acc: number, p: any) => acc + p.quantiteStock * p.prixUnitaire, 0)
    } else {
      produits.value = []
      produitsEnStock.value = 0
      totalValeurStock.value = 0
    }
    
    // Charger les mouvements récents
    await loadMouvementsRecents()
    
    // Charger les factures du mois
    await loadFacturesCeMois()
    
  } catch (err) {
    console.error('Erreur lors du chargement des données:', err)
    error('Erreur lors du chargement des données')
  }
}

const loadMouvementsRecents = async () => {
  try {
    const raw: any = await $fetch(getApiUrl(`/api/mouvements-stock/?entrepot=${boutiqueData.value.id}&limit=7`), { headers: getAuthHeaders() })
    const arr = Array.isArray(raw) ? raw : (raw?.results ?? [])
    mouvementsRecents.value = arr.length
  } catch (err) {
    console.error('Erreur chargement mouvements:', err)
  }
}

const loadFacturesCeMois = async () => {
  try {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
    const raw: any = await $fetch(
      getApiUrl(`/api/factures/?boutique=${boutiqueData.value.id}&date_facture__gte=${start}&date_facture__lte=${end}`),
      { headers: getAuthHeaders() }
    )
    const arr = Array.isArray(raw) ? raw : (raw?.results ?? [])
    facturesCeMois.value = arr.length
  } catch (err) {
    console.error('Erreur chargement factures:', err)
  }
}

const goBackToSuperadmin = async () => {
  localStorage.removeItem('boutique')
  await navigateTo('/superadmin/dashboard')
}

const refreshData = async () => {
  await loadBoutiqueData()
  success('Données actualisées')
}

onMounted(async () => {
  await loadBoutiqueData()
})
</script>



