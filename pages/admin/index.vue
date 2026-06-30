<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useApiBase } from '@/composables/useApiBase'

const { getApiUrl, getAuthHeaders, parseApiList, getEntrepriseId } = useApiBase()

definePageMeta({ layout: 'default' })

const userData = ref<any>(null)
const boutiqueData = ref<any>(null)
const produits = ref<any[]>([])
const factures = ref<any[]>([])
const mouvementsRecents = ref<any[]>([])
const isLoading = ref(true)
const isRefreshing = ref(false)
const lastUpdated = ref<Date | null>(null)
let refreshTimer: ReturnType<typeof setInterval> | null = null

// â”€â”€â”€ KPIs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const totalUnites = computed(() => produits.value.reduce((a, p) => a + (p.quantiteStock || 0), 0))
const totalValeur = computed(() => produits.value.reduce((a, p) => a + (p.quantiteStock || 0) * (p.prixUnitaire || 0), 0))
const produitsFaibleStock = computed(() => produits.value.filter(p => (p.quantiteStock || 0) > 0 && (p.quantiteStock || 0) < 10).length)
const produitsRupture = computed(() => produits.value.filter(p => (p.quantiteStock || 0) === 0).length)
const today = new Date().toISOString().slice(0, 10)
const ventesJour = computed(() => factures.value.filter(f => (f.created_at || '').slice(0, 10) === today).reduce((a, f) => a + Number(f.total || 0), 0))
const nbVentesJour = computed(() => factures.value.filter(f => (f.created_at || '').slice(0, 10) === today).length)
const alertesProduits = computed(() => produits.value.filter(p => (p.quantiteStock || 0) < 10).sort((a, b) => (a.quantiteStock || 0) - (b.quantiteStock || 0)).slice(0, 6))

const topByQuantity = computed(() => [...produits.value].sort((a, b) => (b.quantiteStock || 0) - (a.quantiteStock || 0)).slice(0, 8))
const maxQty = computed(() => Math.max(1, ...topByQuantity.value.map(p => p.quantiteStock || 0)))

const lastUpdatedLabel = computed(() => {
  if (!lastUpdated.value) return ''
  const diff = Math.floor((Date.now() - lastUpdated.value.getTime()) / 1000)
  if (diff < 5) return 'À l\'instant'
  if (diff < 60) return `Il y a ${diff}s`
  return `Il y a ${Math.floor(diff / 60)}min`
})

const formatCurrency = (n: number) => new Intl.NumberFormat('fr-FR').format(Math.round(n)) + ' FCFA'

const stockStatusClass = (qty: number) => {
  if (qty === 0) return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
  if (qty < 10) return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20'
  return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20'
}
const stockStatusLabel = (qty: number) => qty === 0 ? 'Rupture' : qty < 10 ? 'Critique' : 'Faible'

// â”€â”€â”€ Data loading â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const loadData = async () => {
  if (!boutiqueData.value?.id) return
  isRefreshing.value = true
  try {
    const timeout = (ms: number) => new Promise((_, r) => setTimeout(() => r(new Error('timeout')), ms))

    const h = getAuthHeaders()
    const fetchOpts = { headers: h, cache: 'no-store' as any }
    const [stocksRes, facturesRes] = await Promise.allSettled([
      Promise.race([$fetch(getApiUrl(`/api/stocks/?entrepot=${boutiqueData.value.id}`), fetchOpts), timeout(12000)]),
      Promise.race([$fetch(getApiUrl(`/api/factures/?boutique=${boutiqueData.value.id}`), fetchOpts), timeout(12000)]),
    ])

    const stocks: any[] = parseApiList(stocksRes.status === 'fulfilled' ? stocksRes.value : null)
    factures.value = parseApiList(facturesRes.status === 'fulfilled' ? facturesRes.value : null)

    // Récupérer les produits de l'entreprise pour les croiser avec les stocks
    const entrepriseId = boutiqueData.value?.entreprise?.id || boutiqueData.value?.entreprise || getEntrepriseId()
    if (stocks.length > 0 && entrepriseId) {
      const prodsRaw: any = await Promise.race([
        $fetch(getApiUrl(`/api/produits/?entreprise=${entrepriseId}`), { headers: h }),
        timeout(12000)
      ])
      const rawProds: any[] = parseApiList(prodsRaw)
      // Croiser produits Ã— stocks par boutique
      produits.value = rawProds.map((p: any) => {
        const stock = stocks.find((s: any) => s.produit === p.id)
        return { ...p, quantiteStock: stock?.quantite ?? 0, prixUnitaire: parseFloat(p.prix_vente || p.prix || 0) }
      })
    } else if (stocks.length > 0) {
      // Fallback : afficher avec les données de stock directement
      produits.value = stocks.map((s: any) => ({
        id: s.produit, nom: s.produit_nom || `Produit #${s.produit}`,
        quantiteStock: s.quantite ?? 0, prixUnitaire: 0,
      }))
    } else {
      produits.value = []
    }
    // Mouvements récents (derniers 8)
    try {
      const mvRaw: any = await $fetch(getApiUrl(`/api/mouvements-stock/?entrepot=${boutiqueData.value.id}&ordering=-created_at&limit=8`), fetchOpts)
      const mvArr = parseApiList(mvRaw)
      mouvementsRecents.value = mvArr.slice(0, 8)
    } catch {}

    lastUpdated.value = new Date()
  } catch (e) {
    console.error('[Admin Dashboard]', e)
  } finally {
    isLoading.value = false
    isRefreshing.value = false
  }
}

onMounted(async () => {
  if (!process.client) return
  try {
    const user = localStorage.getItem('user')
    const boutique = localStorage.getItem('boutique')
    if (user) userData.value = JSON.parse(user)
    if (boutique) boutiqueData.value = JSON.parse(boutique)
  } catch {}
  await loadData()
  refreshTimer = setInterval(loadData, 30_000)
})
onUnmounted(() => { if (refreshTimer) clearInterval(refreshTimer) })
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

      <!-- En-tÃªte -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            Bonjour, {{ userData?.first_name || 'Administrateur' }} ðŸ‘‹
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-2">
            Entrepôt <span class="font-semibold text-gray-700 dark:text-gray-300">{{ boutiqueData?.nom || 'â€”' }}</span>
            <span v-if="lastUpdatedLabel" class="inline-flex items-center gap-1 text-xs text-gray-400 dark:text-gray-600">
              <UIcon name="i-heroicons-arrow-path" class="w-3 h-3" :class="{ 'animate-spin': isRefreshing }" />
              {{ lastUpdatedLabel }}
            </span>
          </p>
        </div>
        <div class="flex gap-2">
          <button @click="loadData" :disabled="isRefreshing" class="inline-flex items-center gap-2 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50">
            <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" :class="{ 'animate-spin': isRefreshing }" />
            Rafraîchir
          </button>
          <NuxtLink to="/facturation" class="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
            <UIcon name="i-heroicons-plus" class="w-4 h-4" />
            Nouvelle vente
          </NuxtLink>
        </div>
      </div>

      <!-- Alerte stock critique -->
      <div v-if="!isLoading && alertesProduits.length > 0" class="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
        <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-red-700 dark:text-red-400">{{ alertesProduits.length }} article{{ alertesProduits.length > 1 ? 's' : '' }} en stock faible ou critique</p>
          <p class="text-xs text-red-600 dark:text-red-400 mt-0.5 truncate">{{ alertesProduits.map(p => p.nom).join(', ') }}</p>
        </div>
        <NuxtLink to="/stock_produit" class="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline whitespace-nowrap">Voir â†’</NuxtLink>
      </div>

      <!-- Skeleton -->
      <template v-if="isLoading">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div v-for="i in 4" :key="i" class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse h-28"></div>
        </div>
      </template>

      <template v-else>
        <!-- KPIs -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCardEnhanced title="Unités en stock" :value="totalUnites" format="number" icon="i-heroicons-cube" color="blue" :subtitle="`${produits.length} références`" />
          <KpiCardEnhanced title="Valeur du stock" :value="totalValeur" format="currency" icon="i-heroicons-banknotes" color="green" />
          <KpiCardEnhanced title="Ventes du jour" :value="ventesJour" format="currency" icon="i-heroicons-chart-bar-square" :color="ventesJour > 0 ? 'green' : 'gray'" :subtitle="`${nbVentesJour} facture${nbVentesJour > 1 ? 's' : ''}`" />
          <KpiCardEnhanced title="Ruptures" :value="produitsRupture" format="number" icon="i-heroicons-x-circle" :color="produitsRupture > 0 ? 'red' : 'gray'" :subtitle="produitsFaibleStock > 0 ? `${produitsFaibleStock} en faible stock` : 'Niveaux OK'" />
        </div>

        <!-- Graphiques -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Top produits barres -->
          <div class="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div class="flex items-center justify-between mb-5">
              <h2 class="text-base font-semibold text-gray-900 dark:text-white">Top produits â€” Quantité en stock</h2>
              <NuxtLink to="/stock_produit" class="text-xs text-emerald-600 dark:text-emerald-400 hover:underline">Voir tout â†’</NuxtLink>
            </div>
            <div v-if="topByQuantity.length === 0" class="flex items-center justify-center h-32 text-gray-400 dark:text-gray-600">
              <p class="text-sm">Aucune donnée</p>
            </div>
            <div v-else class="space-y-3">
              <div v-for="(p, i) in topByQuantity" :key="p.id" class="flex items-center gap-3">
                <span class="text-xs text-gray-400 w-4 text-right flex-shrink-0">{{ i + 1 }}</span>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-xs font-medium text-gray-700 dark:text-gray-300 truncate max-w-[160px]" :title="p.nom">{{ p.nom }}</span>
                    <span class="text-xs font-semibold text-gray-900 dark:text-white ml-2 flex-shrink-0">{{ (p.quantiteStock || 0).toLocaleString() }}</span>
                  </div>
                  <div class="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      class="h-2 rounded-full transition-all duration-500"
                      :class="{
                        'bg-red-500': (p.quantiteStock || 0) < 10,
                        'bg-amber-400': (p.quantiteStock || 0) >= 10 && (p.quantiteStock || 0) < 50,
                        'bg-emerald-500': (p.quantiteStock || 0) >= 50,
                      }"
                      :style="{ width: `${Math.max(4, ((p.quantiteStock || 0) / maxQty) * 100)}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Alertes produits -->
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-base font-semibold text-gray-900 dark:text-white">Alertes stock</h2>
              <span v-if="alertesProduits.length > 0" class="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                {{ alertesProduits.length }}
              </span>
            </div>
            <div v-if="alertesProduits.length === 0" class="flex flex-col items-center justify-center h-32 text-emerald-600 dark:text-emerald-400">
              <UIcon name="i-heroicons-check-circle" class="w-10 h-10 mb-2" />
              <p class="text-sm font-medium">Tous les stocks OK</p>
            </div>
            <div v-else class="space-y-2">
              <div v-for="p in alertesProduits" :key="p.id" class="flex items-center justify-between p-2.5 rounded-lg border" :class="(p.quantiteStock||0)===0 ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800' : 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800'">
                <div class="min-w-0 flex-1">
                  <p class="text-xs font-medium text-gray-900 dark:text-white truncate">{{ p.nom }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{{ p.quantiteStock || 0 }} unité{{ (p.quantiteStock||0)!==1?'s':'' }}</p>
                </div>
                <span class="ml-2 px-1.5 py-0.5 rounded text-xs font-semibold flex-shrink-0" :class="stockStatusClass(p.quantiteStock || 0)">
                  {{ stockStatusLabel(p.quantiteStock || 0) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions rapides -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <NuxtLink v-for="action in [
            { to: '/stock_produit', icon: 'i-heroicons-square-2-stack', label: 'Stock', desc: 'Consulter & ajuster', color: 'blue' },
            { to: '/facturation', icon: 'i-heroicons-document-currency-dollar', label: 'Nouvelle vente', desc: 'Créer une facture', color: 'emerald' },
            { to: '/mouvements-stock', icon: 'i-heroicons-arrows-right-left', label: 'Mouvements', desc: 'Historique flux', color: 'purple' },
            { to: '/inventaire', icon: 'i-heroicons-clipboard-document-check', label: 'Inventaire', desc: 'Lancer un inventaire', color: 'amber' },
          ]" :key="action.to" :to="action.to"
            class="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-sm transition-all group"
          >
            <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              :class="{
                'bg-blue-100 dark:bg-blue-900/30': action.color === 'blue',
                'bg-emerald-100 dark:bg-emerald-900/30': action.color === 'emerald',
                'bg-purple-100 dark:bg-purple-900/30': action.color === 'purple',
                'bg-amber-100 dark:bg-amber-900/30': action.color === 'amber',
              }"
            >
              <UIcon :name="action.icon" class="w-5 h-5"
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

        <!-- Mouvements récents -->
        <div v-if="mouvementsRecents.length > 0" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-base font-semibold text-gray-900 dark:text-white">Derniers mouvements de stock</h2>
            <NuxtLink to="/mouvements-stock" class="text-xs text-emerald-600 dark:text-emerald-400 hover:underline">Voir tout â†’</NuxtLink>
          </div>
          <div class="space-y-2">
            <div v-for="m in mouvementsRecents" :key="m.id" class="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
              <div class="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                :class="{
                  'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400': m.type_mouvement === 'entree',
                  'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400': m.type_mouvement === 'sortie',
                  'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400': m.type_mouvement === 'transfert',
                  'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400': !['entree','sortie','transfert'].includes(m.type_mouvement),
                }">
                {{ m.type_mouvement === 'entree' ? 'â†‘' : m.type_mouvement === 'sortie' ? 'â†“' : m.type_mouvement === 'transfert' ? 'â‡„' : '~' }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-medium text-gray-900 dark:text-white truncate">{{ m.produit_nom || 'Produit' }}</p>
                <p class="text-xs text-gray-400 dark:text-gray-500 truncate">{{ m.motif || m.reference_document || 'â€”' }}</p>
              </div>
              <div class="text-right flex-shrink-0">
                <p class="text-xs font-semibold"
                  :class="m.type_mouvement === 'entree' ? 'text-emerald-600 dark:text-emerald-400' : m.type_mouvement === 'sortie' ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'">
                  {{ m.type_mouvement === 'entree' ? '+' : m.type_mouvement === 'sortie' ? '-' : '' }}{{ m.quantite }}
                </p>
                <p class="text-xs text-gray-400 dark:text-gray-500">{{ new Date(m.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }}</p>
              </div>
            </div>
          </div>
        </div>

      </template>
    </div>
  </div>
</template>

