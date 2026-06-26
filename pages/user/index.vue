<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useApiBase } from '@/composables/useApiBase'

const { getApiUrl, getAuthHeaders, parseApiList, getEntrepriseId } = useApiBase()

definePageMeta({ layout: "default" })

const parseList = parseApiList

// ─── State ────────────────────────────────────────────────────────────────────
const userData = ref<any>(null)
const entrepriseData = ref<any>(null)
const boutiqueData = ref<any>(null)
const produits = ref<any[]>([])
const factures = ref<any[]>([])
const isLoading = ref(true)
const isRefreshing = ref(false)
const lastUpdated = ref<Date | null>(null)
let refreshTimer: ReturnType<typeof setInterval> | null = null

// ─── KPIs dérivés ─────────────────────────────────────────────────────────────
const totalUnites = computed(() =>
  produits.value.reduce((acc, p) => acc + (p.quantiteStock || 0), 0)
)

const totalValeur = computed(() =>
  produits.value.reduce((acc, p) => acc + (p.quantiteStock || 0) * (p.prixUnitaire || 0), 0)
)

const produitsEnRupture = computed(() =>
  produits.value.filter(p => (p.quantiteStock || 0) === 0).length
)

const produitsFaibleStock = computed(() =>
  produits.value.filter(p => (p.quantiteStock || 0) > 0 && (p.quantiteStock || 0) < 10).length
)

const nbReferences = computed(() => produits.value.length)

const today = new Date().toISOString().slice(0, 10)
const ventesJour = computed(() =>
  factures.value
    .filter(f => (f.created_at || '').slice(0, 10) === today)
    .reduce((a, f) => a + Number(f.total || 0), 0)
)
const nbVentesJour = computed(() =>
  factures.value.filter(f => (f.created_at || '').slice(0, 10) === today).length
)

const lastUpdatedLabel = computed(() => {
  if (!lastUpdated.value) return ''
  const diff = Math.floor((Date.now() - lastUpdated.value.getTime()) / 1000)
  if (diff < 5) return "À l'instant"
  if (diff < 60) return `Il y a ${diff}s`
  return `Il y a ${Math.floor(diff / 60)}min`
})

const stockDistribution = computed(() => {
  const total = produits.value.length || 1
  const low = produits.value.filter(p => (p.quantiteStock || 0) < 10).length
  const medium = produits.value.filter(p => { const q = p.quantiteStock || 0; return q >= 10 && q < 50 }).length
  const high = produits.value.filter(p => (p.quantiteStock || 0) >= 50).length
  return {
    low, medium, high, total,
    lowPct: Math.round((low / total) * 100),
    mediumPct: Math.round((medium / total) * 100),
    highPct: Math.round((high / total) * 100),
  }
})

// ─── Top produits ─────────────────────────────────────────────────────────────
const topByQuantity = computed(() =>
  [...produits.value].sort((a, b) => (b.quantiteStock || 0) - (a.quantiteStock || 0)).slice(0, 8)
)

const topByValue = computed(() =>
  [...produits.value]
    .sort((a, b) => ((b.quantiteStock || 0) * (b.prixUnitaire || 0)) - ((a.quantiteStock || 0) * (a.prixUnitaire || 0)))
    .slice(0, 5)
)

const alertesProduits = computed(() =>
  produits.value
    .filter(p => (p.quantiteStock || 0) < 10)
    .sort((a, b) => (a.quantiteStock || 0) - (b.quantiteStock || 0))
    .slice(0, 5)
)

// ─── Chart data ───────────────────────────────────────────────────────────────
const barChartCategories = computed(() => topByQuantity.value.map(p => p.nom || '?'))
const barChartQuantities = computed(() => topByQuantity.value.map(p => p.quantiteStock || 0))

const maxBarQty = computed(() => Math.max(...barChartQuantities.value, 1))

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatCurrency = (n: number) =>
  new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(Math.round(n)) + ' FCFA'

const stockStatusClass = (qty: number) => {
  if (qty === 0) return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
  if (qty < 10) return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20'
  if (qty < 50) return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20'
  return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
}

const stockStatusLabel = (qty: number) => {
  if (qty === 0) return 'Rupture'
  if (qty < 10) return 'Critique'
  if (qty < 50) return 'Faible'
  return 'OK'
}

// ─── Data loading ─────────────────────────────────────────────────────────────
const loadData = async () => {
  if (!boutiqueData.value?.id) return
  isRefreshing.value = true
  try {
    const timeout = (ms: number) => new Promise((_, r) => setTimeout(() => r(new Error('timeout')), ms))
    const h = getAuthHeaders()
    const fetchOpts = { headers: h, cache: 'no-store' as const }

    const [stocksRes, facturesRes] = await Promise.allSettled([
      Promise.race([$fetch(getApiUrl(`/api/stocks/?entrepot=${boutiqueData.value.id}`), fetchOpts), timeout(12000)]),
      Promise.race([$fetch(getApiUrl(`/api/factures/?boutique=${boutiqueData.value.id}`), fetchOpts), timeout(12000)]),
    ])

    const stocks = parseList(stocksRes.status === 'fulfilled' ? stocksRes.value : null)
    factures.value = parseList(facturesRes.status === 'fulfilled' ? facturesRes.value : null)

    const entrepriseId = boutiqueData.value?.entreprise?.id || boutiqueData.value?.entreprise || entrepriseData.value?.id || getEntrepriseId()
    if (stocks.length > 0 && entrepriseId) {
      const prodsRaw = await Promise.race([
        $fetch(getApiUrl(`/api/produits/?entreprise=${entrepriseId}`), fetchOpts),
        timeout(12000),
      ])
      const rawProds = parseList(prodsRaw)
      produits.value = rawProds.map((p: any) => {
        const stock = stocks.find((s: any) => s.produit === p.id)
        return {
          ...p,
          quantiteStock: stock?.quantite ?? 0,
          prixUnitaire: parseFloat(p.prix_vente || p.prix || 0),
        }
      })
    } else if (stocks.length > 0) {
      produits.value = stocks.map((s: any) => ({
        id: s.produit,
        nom: s.produit_nom || `Produit #${s.produit}`,
        quantiteStock: s.quantite ?? 0,
        prixUnitaire: 0,
      }))
    } else {
      produits.value = []
    }

    lastUpdated.value = new Date()
  } catch (err) {
    console.error('[Dashboard] Erreur chargement:', err)
    produits.value = []
  } finally {
    isLoading.value = false
    isRefreshing.value = false
  }
}

onMounted(async () => {
  if (!process.client) return

  try {
    const user = localStorage.getItem('user')
    const entreprise = localStorage.getItem('entreprise')
    const boutique = localStorage.getItem('boutique')
    if (user) userData.value = JSON.parse(user)
    if (entreprise) entrepriseData.value = JSON.parse(entreprise)
    if (boutique) boutiqueData.value = JSON.parse(boutique)
  } catch {}

  if (!boutiqueData.value?.id) {
    isLoading.value = false
    return
  }

  await loadData()
  refreshTimer = setInterval(loadData, 30_000)
})

onUnmounted(() => { if (refreshTimer) clearInterval(refreshTimer) })
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

      <!-- ── Bannière alerte stock critique ─────────────────────────────── -->
      <div
        v-if="!isLoading && alertesProduits.length > 0"
        class="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3"
      >
        <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-red-700 dark:text-red-400">
            {{ alertesProduits.length }} article{{ alertesProduits.length > 1 ? 's' : '' }} en stock faible ou critique
          </p>
          <p class="text-xs text-red-600 dark:text-red-400 mt-0.5 truncate">
            {{ alertesProduits.map(p => p.nom).join(', ') }}
          </p>
        </div>
        <NuxtLink to="/stock_produit" class="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline whitespace-nowrap">
          Voir le stock →
        </NuxtLink>
      </div>

      <!-- ── En-tête contextuel ──────────────────────────────────────────── -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            Bonjour, {{ userData?.first_name || 'Utilisateur' }} 👋
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Entrepôt <span class="font-semibold text-gray-700 dark:text-gray-300">{{ boutiqueData?.nom || '—' }}</span>
            <span v-if="boutiqueData?.ville"> · {{ boutiqueData.ville }}</span>
            <span v-if="lastUpdatedLabel" class="inline-flex items-center gap-1 text-xs text-gray-400 dark:text-gray-600 ml-2">
              <UIcon name="i-heroicons-arrow-path" class="w-3 h-3" :class="{ 'animate-spin': isRefreshing }" />
              {{ lastUpdatedLabel }}
            </span>
          </p>
        </div>
        <div class="flex items-center gap-2">
          <button @click="loadData" :disabled="isRefreshing" class="inline-flex items-center gap-2 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50">
            <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" :class="{ 'animate-spin': isRefreshing }" />
            Rafraîchir
          </button>
          <NuxtLink
            to="/facturation"
            class="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            <UIcon name="i-heroicons-plus" class="w-4 h-4" />
            Nouvelle vente
          </NuxtLink>
          <NuxtLink
            to="/stock_produit"
            class="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <UIcon name="i-heroicons-square-2-stack" class="w-4 h-4" />
            Gérer le stock
          </NuxtLink>
        </div>
      </div>

      <!-- ── Skeleton loading ────────────────────────────────────────────── -->
      <template v-if="isLoading">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div v-for="i in 4" :key="i" class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
            <div class="flex justify-between items-start">
              <div class="space-y-3 flex-1">
                <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                <div class="h-7 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              </div>
              <div class="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          </div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div v-for="i in 2" :key="i" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 h-64 animate-pulse">
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
            <div class="space-y-3">
              <div v-for="j in 5" :key="j" class="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </template>

      <!-- ── Contenu chargé ──────────────────────────────────────────────── -->
      <template v-else>

        <!-- ── KPIs Row 1 : chiffres clés ────────────────────────────────── -->
        <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">

          <!-- Total unités -->
          <KpiCardEnhanced
            title="Unités en stock"
            :value="totalUnites"
            format="number"
            icon="i-heroicons-cube"
            color="blue"
            :subtitle="`${nbReferences} références`"
          />

          <!-- Valeur du stock -->
          <KpiCardEnhanced
            title="Valeur du stock"
            :value="totalValeur"
            format="currency"
            icon="i-heroicons-banknotes"
            color="green"
          />

          <!-- Ventes du jour -->
          <KpiCardEnhanced
            title="Ventes du jour"
            :value="ventesJour"
            format="currency"
            icon="i-heroicons-chart-bar-square"
            :color="ventesJour > 0 ? 'green' : 'gray'"
            :subtitle="`${nbVentesJour} facture${nbVentesJour > 1 ? 's' : ''}`"
          />

          <!-- Ruptures -->
          <KpiCardEnhanced
            title="Ruptures de stock"
            :value="produitsEnRupture"
            format="number"
            icon="i-heroicons-x-circle"
            :color="produitsEnRupture > 0 ? 'red' : 'gray'"
            :subtitle="produitsEnRupture > 0 ? 'Action requise' : 'Tout est OK'"
          />

          <!-- Stock faible -->
          <KpiCardEnhanced
            title="Stock faible (< 10)"
            :value="produitsFaibleStock"
            format="number"
            icon="i-heroicons-exclamation-triangle"
            :color="produitsFaibleStock > 0 ? 'orange' : 'gray'"
            :subtitle="produitsFaibleStock > 0 ? 'À réapprovisionner' : 'Niveaux OK'"
          />
        </div>

        <!-- ── Graphiques ──────────────────────────────────────────────────── -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <!-- Barres Top 8 produits par quantité -->
          <div class="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div class="flex items-center justify-between mb-5">
              <h2 class="text-base font-semibold text-gray-900 dark:text-white">Top produits — Quantité en stock</h2>
              <NuxtLink to="/stock_produit" class="text-xs text-emerald-600 dark:text-emerald-400 hover:underline">Voir tout →</NuxtLink>
            </div>

            <!-- Empty state -->
            <div v-if="barChartQuantities.length === 0" class="flex flex-col items-center justify-center h-40 text-gray-400 dark:text-gray-600">
              <UIcon name="i-heroicons-chart-bar" class="w-10 h-10 mb-2" />
              <p class="text-sm">Aucune donnée disponible</p>
            </div>

            <!-- Chart -->
            <div v-else class="space-y-3">
              <div
                v-for="(produit, i) in topByQuantity"
                :key="produit.id"
                class="flex items-center gap-3 group"
              >
                <span class="text-xs text-gray-400 dark:text-gray-600 w-4 text-right flex-shrink-0">{{ i + 1 }}</span>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-xs font-medium text-gray-700 dark:text-gray-300 truncate max-w-[160px]" :title="produit.nom">{{ produit.nom }}</span>
                    <span class="text-xs font-semibold text-gray-900 dark:text-white ml-2 flex-shrink-0">{{ (produit.quantiteStock || 0).toLocaleString() }}</span>
                  </div>
                  <div class="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      class="h-2 rounded-full transition-all duration-500"
                      :class="{
                        'bg-red-500': (produit.quantiteStock || 0) < 10,
                        'bg-amber-400': (produit.quantiteStock || 0) >= 10 && (produit.quantiteStock || 0) < 50,
                        'bg-emerald-500': (produit.quantiteStock || 0) >= 50,
                      }"
                      :style="{ width: `${Math.max(4, ((produit.quantiteStock || 0) / maxBarQty) * 100)}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Distribution du stock (camembert textuel enrichi) -->
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 class="text-base font-semibold text-gray-900 dark:text-white mb-5">Distribution du stock</h2>

            <div v-if="nbReferences === 0" class="flex flex-col items-center justify-center h-40 text-gray-400 dark:text-gray-600">
              <UIcon name="i-heroicons-chart-pie" class="w-10 h-10 mb-2" />
              <p class="text-sm">Aucune donnée</p>
            </div>

            <div v-else class="space-y-4">
              <!-- Barre empilée -->
              <div class="flex rounded-full overflow-hidden h-3 bg-gray-100 dark:bg-gray-700">
                <div :style="{ width: stockDistribution.highPct + '%' }" class="bg-emerald-500 transition-all duration-700"></div>
                <div :style="{ width: stockDistribution.mediumPct + '%' }" class="bg-amber-400 transition-all duration-700"></div>
                <div :style="{ width: stockDistribution.lowPct + '%' }" class="bg-red-500 transition-all duration-700"></div>
              </div>

              <!-- Légende -->
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0"></div>
                    <span class="text-sm text-gray-600 dark:text-gray-400">Stock élevé (≥ 50)</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ stockDistribution.high }}</span>
                    <span class="text-xs text-gray-400 dark:text-gray-600 w-8 text-right">{{ stockDistribution.highPct }}%</span>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-amber-400 flex-shrink-0"></div>
                    <span class="text-sm text-gray-600 dark:text-gray-400">Stock moyen (10–49)</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ stockDistribution.medium }}</span>
                    <span class="text-xs text-gray-400 dark:text-gray-600 w-8 text-right">{{ stockDistribution.mediumPct }}%</span>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-red-500 flex-shrink-0"></div>
                    <span class="text-sm text-gray-600 dark:text-gray-400">Stock faible (< 10)</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ stockDistribution.low }}</span>
                    <span class="text-xs text-gray-400 dark:text-gray-600 w-8 text-right">{{ stockDistribution.lowPct }}%</span>
                  </div>
                </div>
              </div>

              <!-- Total -->
              <div class="pt-2 border-t border-gray-100 dark:border-gray-700 flex justify-between">
                <span class="text-sm text-gray-500 dark:text-gray-400">Total références</span>
                <span class="text-sm font-bold text-gray-900 dark:text-white">{{ stockDistribution.total }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Alertes & Top valeur ────────────────────────────────────────── -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <!-- Top 5 par valeur -->
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-base font-semibold text-gray-900 dark:text-white">Top 5 — Valeur en stock</h2>
            </div>
            <div v-if="topByValue.length === 0" class="flex flex-col items-center justify-center h-32 text-gray-400 dark:text-gray-600">
              <p class="text-sm">Aucune donnée disponible</p>
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="(produit, i) in topByValue"
                :key="produit.id"
                class="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                @click="navigateTo('/stock_produit')"
              >
                <div class="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-xs font-bold text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                  {{ i + 1 }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ produit.nom }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{{ (produit.quantiteStock || 0) }} unités × {{ formatCurrency(produit.prixUnitaire || 0) }}</p>
                </div>
                <p class="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                  {{ formatCurrency((produit.quantiteStock || 0) * (produit.prixUnitaire || 0)) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Alertes produits à réapprovisionner -->
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-base font-semibold text-gray-900 dark:text-white">Alertes stock</h2>
              <span
                v-if="alertesProduits.length > 0"
                class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
              >
                {{ alertesProduits.length }} alerte{{ alertesProduits.length > 1 ? 's' : '' }}
              </span>
            </div>
            <div v-if="alertesProduits.length === 0" class="flex flex-col items-center justify-center h-32 text-emerald-600 dark:text-emerald-400">
              <UIcon name="i-heroicons-check-circle" class="w-10 h-10 mb-2" />
              <p class="text-sm font-medium">Tous les stocks sont OK !</p>
            </div>
            <div v-else class="space-y-2">
              <div
                v-for="produit in alertesProduits"
                :key="produit.id"
                class="flex items-center justify-between p-3 rounded-lg border"
                :class="(produit.quantiteStock || 0) === 0
                  ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
                  : 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800'"
              >
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ produit.nom }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{{ produit.quantiteStock || 0 }} unité{{ (produit.quantiteStock || 0) !== 1 ? 's' : '' }} restante{{ (produit.quantiteStock || 0) !== 1 ? 's' : '' }}</p>
                </div>
                <span
                  class="ml-3 px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0"
                  :class="stockStatusClass(produit.quantiteStock || 0)"
                >
                  {{ stockStatusLabel(produit.quantiteStock || 0) }}
                </span>
              </div>
              <NuxtLink
                to="/stock_produit"
                class="block text-center text-xs text-emerald-600 dark:text-emerald-400 hover:underline pt-1"
              >
                Gérer tous les stocks →
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- ── Informations entrepôt ───────────────────────────────────────── -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 class="text-base font-semibold text-gray-900 dark:text-white mb-4">Informations de l'entrepôt</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Nom</p>
              <p class="text-sm font-medium text-gray-900 dark:text-white">{{ boutiqueData?.nom || '—' }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Ville</p>
              <p class="text-sm font-medium text-gray-900 dark:text-white">{{ boutiqueData?.ville || '—' }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Adresse</p>
              <p class="text-sm font-medium text-gray-900 dark:text-white">{{ boutiqueData?.adresse || '—' }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Responsable</p>
              <p class="text-sm font-medium text-gray-900 dark:text-white">{{ boutiqueData?.responsable || '—' }}</p>
            </div>
          </div>
        </div>

        <!-- ── Guides interactifs ────────────────────────────────────────── -->

        <!-- ── Actions rapides (desktop) ─────────────────────────────────── -->
        <div class="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4">
          <NuxtLink
            v-for="action in [
              { to: '/stock_produit', icon: 'i-heroicons-square-2-stack', label: 'Stock produits', desc: 'Consulter & ajuster', color: 'blue' },
              { to: '/facturation', icon: 'i-heroicons-document-currency-dollar', label: 'Nouvelle vente', desc: 'Créer une facture', color: 'emerald' },
              { to: '/mouvements-stock', icon: 'i-heroicons-arrows-right-left', label: 'Mouvements', desc: 'Historique des flux', color: 'purple' },
              { to: '/inventaire', icon: 'i-heroicons-clipboard-document-check', label: 'Inventaire', desc: 'Lancer un inventaire', color: 'amber' },
            ]"
            :key="action.to"
            :to="action.to"
            class="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-sm transition-all group"
          >
            <div
              class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
              :class="{
                'bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50': action.color === 'blue',
                'bg-emerald-100 dark:bg-emerald-900/30 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50': action.color === 'emerald',
                'bg-purple-100 dark:bg-purple-900/30 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50': action.color === 'purple',
                'bg-amber-100 dark:bg-amber-900/30 group-hover:bg-amber-200 dark:group-hover:bg-amber-900/50': action.color === 'amber',
              }"
            >
              <UIcon
                :name="action.icon"
                class="w-5 h-5"
                :class="{
                  'text-blue-600 dark:text-blue-400': action.color === 'blue',
                  'text-emerald-600 dark:text-emerald-400': action.color === 'emerald',
                  'text-purple-600 dark:text-purple-400': action.color === 'purple',
                  'text-amber-600 dark:text-amber-400': action.color === 'amber',
                }"
              />
            </div>
            <div class="min-w-0">
              <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ action.label }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ action.desc }}</p>
            </div>
          </NuxtLink>
        </div>

      </template>
    </div>
  </div>
</template>
