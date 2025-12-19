<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useApi } from '@/stores/useApi'
import { API_BASE_URL } from '@/constants'
import type { Produit } from '~/types'

definePageMeta({
  layout: "default",
})

const userData = ref<any>(null)
const entrepriseData = ref<any>(null)
const boutiqueData = ref<any>(null)
const produits = ref<Produit[] | null>(null)
const produitsEnStock = ref(0)
const totalValeurStock = ref(0)

// Données pour les graphiques
const chartData = ref({
  categories: [] as string[],
  quantities: [] as number[],
  values: [] as number[]
})

// Computed properties pour les graphiques (protégées contre les erreurs)
const topProductsByQuantity = computed(() => {
  try {
    if (!produits.value || !Array.isArray(produits.value)) return []
  return (produits.value as any[])
      .filter(p => p != null)
    .sort((a, b) => (b.quantiteStock || 0) - (a.quantiteStock || 0))
    .slice(0, 5)
  } catch (err) {
    console.error('[User Page] Erreur topProductsByQuantity:', err)
    return []
  }
})

const topProductsByValue = computed(() => {
  try {
    if (!produits.value || !Array.isArray(produits.value)) return []
  return (produits.value as any[])
      .filter(p => p != null)
      .sort((a, b) => {
        const valueA = (a.quantiteStock || 0) * (a.prixUnitaire || 0)
        const valueB = (b.quantiteStock || 0) * (b.prixUnitaire || 0)
        return valueB - valueA
      })
    .slice(0, 5)
  } catch (err) {
    console.error('[User Page] Erreur topProductsByValue:', err)
    return []
  }
})

const stockDistribution = computed(() => {
  try {
    if (!produits.value || !Array.isArray(produits.value)) {
      return { low: 0, medium: 0, high: 0, total: 0 }
    }
  
  const total = produits.value.length
    const low = (produits.value as any[]).filter(p => (p?.quantiteStock || 0) < 10).length
    const medium = (produits.value as any[]).filter(p => {
      const qty = p?.quantiteStock || 0
      return qty >= 10 && qty < 50
    }).length
    const high = (produits.value as any[]).filter(p => (p?.quantiteStock || 0) >= 50).length
  
  return { low, medium, high, total }
  } catch (err) {
    console.error('[User Page] Erreur stockDistribution:', err)
    return { low: 0, medium: 0, high: 0, total: 0 }
  }
})

onMounted(async () => {
  if (!process.client) return
  
    console.log('[User Page] Début du chargement')
    
  // Charger les données utilisateur (opérations synchrones, rapides)
  try {
    const user = localStorage.getItem('user')
    const entreprise = localStorage.getItem('entreprise')
    const boutique = localStorage.getItem('boutique')
    
    console.log('[User Page] Données localStorage:', { user: !!user, entreprise: !!entreprise, boutique: !!boutique })
    
    if (user) {
      try {
        userData.value = JSON.parse(user)
      } catch (e) {
        console.warn('[User Page] Erreur parsing user:', e)
      }
    }
    
    if (entreprise) {
      try {
        entrepriseData.value = JSON.parse(entreprise)
      } catch (e) {
        console.warn('[User Page] Erreur parsing entreprise:', e)
      }
    }
    
    if (boutique) {
      try {
        boutiqueData.value = JSON.parse(boutique)
      } catch (e) {
        console.warn('[User Page] Erreur parsing boutique:', e)
      }
    }
    
    console.log('[User Page] Données parsées:', { 
      userData: userData.value?.role, 
      entrepriseData: entrepriseData.value?.nom, 
      boutiqueData: boutiqueData.value?.nom 
    })
  } catch (err) {
    console.error('[User Page] Erreur chargement données localStorage:', err)
    // Continuer même en cas d'erreur pour ne pas bloquer la page
  }
    
  // Charger les stocks de l'entrepôt connecté (avec timeout pour éviter les blocages)
    if (boutiqueData.value?.id) {
    // Utiliser un timeout pour éviter que la page reste bloquée
    const loadStocksWithTimeout = async () => {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout chargement stocks')), 10000) // 10 secondes max
      })
      
      try {
        // Récupérer les stocks de l'entrepôt
        const stocksPromise = useApi(`${API_BASE_URL}/api/stocks/?entrepot=${boutiqueData.value.id}`)
        const { data: stocksData, error: stocksError } = await Promise.race([stocksPromise, timeoutPromise]) as any
        
        if (stocksError?.value) {
          console.warn('[User Page] Erreur chargement stocks:', stocksError.value)
          // Initialiser avec des valeurs par défaut
          produits.value = []
          produitsEnStock.value = 0
          totalValeurStock.value = 0
          return
        }
        
        if (!stocksData?.value || !Array.isArray(stocksData.value)) {
          console.warn('[User Page] Données stocks invalides')
          produits.value = []
          produitsEnStock.value = 0
          totalValeurStock.value = 0
          return
        }
        
          // Filtrer seulement les stocks avec quantité > 0
        const stocksAvecQuantite = stocksData.value.filter((stock: any) => (stock.quantite || 0) > 0)
        
        // Si aucun stock, initialiser avec des valeurs par défaut
        if (stocksAvecQuantite.length === 0) {
          produits.value = []
          produitsEnStock.value = 0
          totalValeurStock.value = 0
          return
        }
        
        // Récupérer les détails des produits (avec timeout aussi)
        try {
          const productIds = stocksAvecQuantite.map((stock: any) => stock.produit).filter(Boolean).join(',')
          
          if (!productIds) {
            produits.value = []
            produitsEnStock.value = 0
            totalValeurStock.value = 0
            return
          }
          
          const productsTimeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Timeout chargement produits')), 10000)
          })
          
          const productsPromise = useApi(`${API_BASE_URL}/api/produits/?id__in=${productIds}`)
          const { data: productsData, error: productsError } = await Promise.race([productsPromise, productsTimeoutPromise]) as any
          
          if (productsError?.value) {
            console.warn('[User Page] Erreur chargement produits:', productsError.value)
            produits.value = []
            produitsEnStock.value = 0
            totalValeurStock.value = 0
            return
          }
          
          if (!productsData?.value || !Array.isArray(productsData.value)) {
            console.warn('[User Page] Données produits invalides')
            produits.value = []
            produitsEnStock.value = 0
            totalValeurStock.value = 0
            return
          }
          
              // Combiner les données de stock et de produits
              const produitsAvecStock = productsData.value.map((produit: any) => {
                const stock = stocksAvecQuantite.find((s: any) => s.produit === produit.id)
                return {
                  ...produit,
                  quantiteStock: stock?.quantite || 0,
                  prixUnitaire: produit.prix_vente || produit.prix || 0
                }
              })
              
              produits.value = produitsAvecStock
          produitsEnStock.value = stocksAvecQuantite.reduce((acc: number, stock: any) => acc + (stock.quantite || 0), 0)
              
              // Calculer la valeur totale de manière optimisée
              totalValeurStock.value = stocksAvecQuantite.reduce((acc: number, stock: any) => {
                const produit = (productsData.value as any[]).find((p: any) => p.id === stock.produit)
                const prix = produit?.prix_vente || produit?.prix || 0
                const quantite = stock.quantite || 0
                return acc + (quantite * prix)
              }, 0)
              
              // Préparer les données pour les graphiques
              prepareChartData()
        } catch (productsErr: any) {
          console.error('[User Page] Erreur chargement produits:', productsErr)
          // Initialiser avec des valeurs par défaut
            produits.value = []
            produitsEnStock.value = 0
            totalValeurStock.value = 0
          }
      } catch (err: any) {
        console.error('[User Page] Erreur chargement stocks:', err)
        // Initialiser avec des valeurs par défaut pour ne pas bloquer la page
        produits.value = []
        produitsEnStock.value = 0
        totalValeurStock.value = 0
      }
    }
    
    // Lancer le chargement en arrière-plan (non-bloquant)
    loadStocksWithTimeout().catch((err) => {
      console.error('[User Page] Erreur fatale chargement:', err)
      // Même en cas d'erreur fatale, initialiser avec des valeurs par défaut
      produits.value = []
      produitsEnStock.value = 0
      totalValeurStock.value = 0
    })
  } else {
    // Pas de boutique sélectionnée, initialiser avec des valeurs par défaut
    produits.value = []
    produitsEnStock.value = 0
    totalValeurStock.value = 0
  }
})

// Fonction pour préparer les données des graphiques
const prepareChartData = () => {
  try {
    if (!produits.value || !Array.isArray(produits.value) || produits.value.length === 0) {
      chartData.value = {
        categories: [],
        quantities: [],
        values: []
      }
      return
    }
  
  const categories = (produits.value as any[]).map(p => p.nom || 'Produit sans nom')
  const quantities = (produits.value as any[]).map(p => p.quantiteStock || 0)
  const values = (produits.value as any[]).map(p => (p.quantiteStock || 0) * (p.prixUnitaire || 0))
  
  chartData.value = {
    categories: categories.slice(0, 10), // Limiter à 10 pour la lisibilité
    quantities: quantities.slice(0, 10),
    values: values.slice(0, 10)
    }
  } catch (err) {
    console.error('[User Page] Erreur préparation données graphiques:', err)
    chartData.value = {
      categories: [],
      quantities: [],
      values: []
    }
  }
}

const logout = () => {
  if (process.client) {
    localStorage.removeItem('user')
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('entreprise')
    localStorage.removeItem('boutique')
    localStorage.removeItem('permissions')
  }
  navigateTo('/connexion')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-0">
    <!-- Header -->
    <!-- <div class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div class="flex items-center">
            <div class="h-12 w-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center mr-4 overflow-hidden shadow-sm">
              <img v-if="entrepriseData?.logo" :src="entrepriseData.logo" alt="Logo entreprise" class="h-full w-full object-contain p-1">
              <svg v-else class="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
              </svg>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ boutiqueData?.nom || 'Entrepôt' }}</h1>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ entrepriseData?.nom || 'Entreprise' }}</p>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <button v-if="userData?.role === 'superadmin'" @click="navigateTo('/superadmin/dashboard')" class="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors mr-2">
              Retour au dashboard superadmin
            </button>
            <div class="text-right">
              <p class="text-sm font-medium text-gray-900 dark:text-white">{{ userData?.first_name || 'Utilisateur' }} {{ userData?.last_name || '' }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ userData?.role === 'admin' ? 'Administrateur' : 'Utilisateur' }}</p>
            </div>
            <button @click="logout" class="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    </div> -->

    <!-- Contenu principal -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      <!-- Titre de bienvenue -->
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Bienvenue, {{ userData?.first_name || 'Utilisateur' }} !
        </h2>
        <p class="text-gray-600 dark:text-gray-400">
          Voici un aperçu de votre entrepôt <strong>{{ boutiqueData?.nom || 'Entrepôt' }}</strong>
        </p>
      </div>

      <!-- Statistiques -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div class="flex items-center">
            <div class="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <svg class="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Produits en stock</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ produitsEnStock }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div class="flex items-center">
            <div class="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <svg class="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Valeur du stock</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ totalValeurStock.toLocaleString() }} FCFA</p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div class="flex items-center">
            <div class="h-12 w-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <svg class="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Entrepôt</p>
              <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ boutiqueData?.ville || 'Ville' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Graphiques et Analyses -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Graphique des Top Produits par Quantité -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top 5 - Produits par Quantité</h3>
          <div class="space-y-3">
            <div v-for="(produit, index) in topProductsByQuantity" :key="produit.id" class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-sm font-medium text-blue-600 dark:text-blue-400">
                  {{ index + 1 }}
                </div>
                <div class="ml-3">
                  <p class="text-sm font-medium text-gray-900 dark:text-white">{{ produit.nom }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{{ produit.quantiteStock }} unités</p>
                </div>
              </div>
              <div class="text-right">
                <div class="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    class="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    :style="{ width: `${(() => {
                      const quantities = topProductsByQuantity.map(p => p.quantiteStock || 0)
                      const maxQty = quantities.length > 0 ? Math.max(...quantities) : 1
                      return Math.min(100, maxQty > 0 ? (produit.quantiteStock / maxQty) * 100 : 0)
                    })()}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Graphique des Top Produits par Valeur -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top 5 - Produits par Valeur</h3>
          <div class="space-y-3">
            <div v-for="(produit, index) in topProductsByValue" :key="produit.id" class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-sm font-medium text-green-600 dark:text-green-400">
                  {{ index + 1 }}
                </div>
                <div class="ml-3">
                  <p class="text-sm font-medium text-gray-900 dark:text-white">{{ produit.nom }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{{ ((produit.quantiteStock || 0) * (produit.prixUnitaire || 0)).toLocaleString() }} FCFA</p>
                </div>
              </div>
              <div class="text-right">
                <div class="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    class="bg-green-600 h-2 rounded-full transition-all duration-300" 
                    :style="{ width: `${(() => {
                      const values = topProductsByValue.map(p => (p.quantiteStock || 0) * (p.prixUnitaire || 0))
                      const maxValue = values.length > 0 ? Math.max(...values) : 1
                      const produitValue = (produit.quantiteStock || 0) * (produit.prixUnitaire || 0)
                      return Math.min(100, maxValue > 0 ? (produitValue / maxValue) * 100 : 0)
                    })()}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Distribution du Stock -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Distribution du Stock</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                <span class="text-sm text-gray-600 dark:text-gray-400">Stock Faible (&lt; 10)</span>
              </div>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ stockDistribution.low }}</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="w-4 h-4 bg-yellow-500 rounded-full mr-3"></div>
                <span class="text-sm text-gray-600 dark:text-gray-400">Stock Moyen (10-49)</span>
              </div>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ stockDistribution.medium }}</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                <span class="text-sm text-gray-600 dark:text-gray-400">Stock Élevé (≥ 50)</span>
              </div>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ stockDistribution.high }}</span>
            </div>
          </div>
        </div>

        <!-- Graphique en Barres Simple -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 lg:col-span-2">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quantités en Stock (Top 10)</h3>
          <div class="flex items-end justify-between h-48 space-x-1">
            <div v-for="(quantity, index) in chartData.quantities" :key="index" class="flex flex-col items-center flex-1">
              <div 
                class="bg-blue-500 rounded-t transition-all duration-500 hover:bg-blue-600 cursor-pointer"
                :style="{ height: `${(() => {
                  const maxQty = chartData.quantities.length > 0 ? Math.max(...chartData.quantities) : 1
                  return Math.max(10, maxQty > 0 ? (quantity / maxQty) * 180 : 10)
                })()}px` }"
                :title="`${chartData.categories[index]}: ${quantity} unités`"
              ></div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center truncate w-full" :title="chartData.categories[index]">
                {{ (chartData.categories[index] || '').substring(0, 8) }}{{ (chartData.categories[index] || '').length > 8 ? '...' : '' }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Informations de l'entrepôt -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6 mb-8">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informations de l'entrepôt</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Nom</p>
            <p class="font-medium text-gray-900 dark:text-white">{{ boutiqueData?.nom || 'N/A' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Ville</p>
            <p class="font-medium text-gray-900 dark:text-white">{{ boutiqueData?.ville || 'N/A' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Adresse</p>
            <p class="font-medium text-gray-900 dark:text-white">{{ boutiqueData?.adresse || 'N/A' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Responsable</p>
            <p class="font-medium text-gray-900 dark:text-white">{{ boutiqueData?.responsable || 'N/A' }}</p>
          </div>
        </div>
      </div>

      <!-- Actions rapides - Desktop -->
      <div class="hidden md:block">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actions rapides</h3>
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <NuxtLink to="/stock-produit" class="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center">
              <svg class="h-7 w-7 text-blue-600 dark:text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
              </svg>
              <div>
                <p class="font-medium text-gray-900 dark:text-white text-sm">Produits</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">Gérer le stock</p>
              </div>
            </NuxtLink>
            
            <NuxtLink to="/facturation" class="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center">
              <svg class="h-7 w-7 text-green-600 dark:text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              <div>
                <p class="font-medium text-gray-900 dark:text-white text-sm">Nouvelle vente</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">Créer une facture</p>
              </div>
            </NuxtLink>
            
            <NuxtLink to="/mouvements-stock" class="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center">
              <svg class="h-7 w-7 text-purple-600 dark:text-purple-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              <div>
                <p class="font-medium text-gray-900 dark:text-white text-sm">Mouvements</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">Historique des stocks</p>
              </div>
            </NuxtLink>
            
            <NuxtLink to="/listes-factures" class="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center">
              <svg class="h-7 w-7 text-orange-600 dark:text-orange-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              <div>
                <p class="font-medium text-gray-900 dark:text-white text-sm">Mes factures</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">Consulter l'historique</p>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation rapide mobile (fixée en bas) -->
    <nav class="md:hidden fixed inset-x-0 bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-40">
      <div class="grid grid-cols-4 text-xs text-center">
        <NuxtLink to="/stock-produit" class="flex flex-col items-center py-2 text-gray-500 hover:text-blue-600">
          <svg class="h-6 w-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
          </svg>
          <span>Produits</span>
        </NuxtLink>
        <NuxtLink to="/facturation" class="flex flex-col items-center py-2 text-gray-500 hover:text-green-600">
          <svg class="h-6 w-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          <span>Ventes</span>
        </NuxtLink>
        <NuxtLink to="/mouvements-stock" class="flex flex-col items-center py-2 text-gray-500 hover:text-purple-600">
          <svg class="h-6 w-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
          <span>Mouvements</span>
        </NuxtLink>
        <NuxtLink to="/listes-factures" class="flex flex-col items-center py-2 text-gray-500 hover:text-orange-600">
          <svg class="h-6 w-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
          </svg>
          <span>Factures</span>
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>