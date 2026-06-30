<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useNotification } from '@/types/useNotification'
import { useApiBase } from '@/composables/useApiBase'
import { API_BASE_URL } from '@/constants'
import CreateBoutiqueModal from '@/components/superadmin/CreateBoutiqueModal.vue'
import CreateUserModal from '@/components/superadmin/CreateUserModal.vue'
import EditBoutiqueModal from '@/components/superadmin/EditBoutiqueModal.vue'
import EditEntrepriseModal from '@/components/superadmin/EditEntrepriseModal.vue'

definePageMeta({ layout: 'superadmin' })

const { error: notifError, success: notifSuccess } = useNotification()

// â”€â”€â”€ State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const entrepriseData = ref<any>(null)
const boutiques = ref<any[]>([])
const users = ref<any[]>([])
const boutiquesStats = ref<Record<number, { stockCount: number; stockValue: number; ruptures: number; salesToday: number }>>({})
const isLoading = ref(true)
const isRefreshing = ref(false)
const lastUpdated = ref<Date | null>(null)
const showCreateBoutique = ref(false)
const showCreateUser = ref(false)
const showEditBoutique = ref(false)
const showSettings = ref(false)
const selectedBoutique = ref<any>(null)
const isAccessingBoutique = ref(false)
let refreshTimer: ReturnType<typeof setInterval> | null = null

// â”€â”€â”€ Computed KPIs globaux â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const totalStock = computed(() =>
  Object.values(boutiquesStats.value).reduce((a, s) => a + s.stockCount, 0)
)
const totalValeur = computed(() =>
  Object.values(boutiquesStats.value).reduce((a, s) => a + s.stockValue, 0)
)
const totalRuptures = computed(() =>
  Object.values(boutiquesStats.value).reduce((a, s) => a + s.ruptures, 0)
)
const totalSalesToday = computed(() =>
  Object.values(boutiquesStats.value).reduce((a, s) => a + s.salesToday, 0)
)
const lastUpdatedLabel = computed(() => {
  if (!lastUpdated.value) return ''
  const diff = Math.floor((Date.now() - lastUpdated.value.getTime()) / 1000)
  if (diff < 5) return 'À l\'instant'
  if (diff < 60) return `Il y a ${diff}s`
  return `Il y a ${Math.floor(diff / 60)}min`
})

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const formatFCFA = (n: number) => new Intl.NumberFormat('fr-FR').format(Math.round(n)) + ' FCFA'
const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'â€”'

// â”€â”€â”€ Data loading â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const loadEntreprise = async () => {
  if (process.client) {
    const e = localStorage.getItem('entreprise')
    if (e) {
      const parsed = JSON.parse(e)
      if (parsed?.logo && !/^https?:\/\//i.test(parsed.logo)) {
        parsed.logo = `${API_BASE_URL}${parsed.logo.startsWith('/') ? '' : '/'}${parsed.logo}`
      }
      entrepriseData.value = parsed
    }
  }
}

const { getApiUrl, getAuthHeaders } = useApiBase()

async function apiFetch(path: string, opts: any = {}) {
  return $fetch(getApiUrl(path), { headers: getAuthHeaders(), ...opts })
}

const loadBoutiques = async () => {
  try {
    const res: any = await apiFetch('/api/boutiques/')
    boutiques.value = res.results ?? (Array.isArray(res) ? res : [])
  } catch {}
}

const loadUsers = async () => {
  try {
    const res: any = await apiFetch('/api/users/')
    users.value = res.results ?? (Array.isArray(res) ? res : [])
  } catch {}
}

const loadBoutiqueStats = async (boutique: any) => {
  const today = new Date().toISOString().slice(0, 10)
  let stockCount = 0, stockValue = 0, ruptures = 0, salesToday = 0

  try {
    const stocks: any = await apiFetch(`/api/stocks/?entrepot=${boutique.id}`)
    const list = stocks?.results ?? (Array.isArray(stocks) ? stocks : [])
    ruptures = list.filter((s: any) => (s.quantite || 0) <= 0).length
    const withQty = list.filter((s: any) => (s.quantite || 0) > 0)
    stockCount = withQty.reduce((a: number, s: any) => a + (s.quantite || 0), 0)
    if (withQty.length > 0) {
      const ids = withQty.map((s: any) => s.produit).filter(Boolean).join(',')
      try {
        const prods: any = await apiFetch(`/api/produits/?id__in=${ids}`)
        const prodList = prods?.results ?? (Array.isArray(prods) ? prods : [])
        stockValue = withQty.reduce((a: number, s: any) => {
          const p = prodList.find((pr: any) => pr.id === s.produit)
          return a + (s.quantite || 0) * (p?.prix_vente || p?.prix || 0)
        }, 0)
      } catch {}
    }
  } catch {}

  try {
    const factures: any = await apiFetch(`/api/factures/?boutique=${boutique.id}`)
    const factList = factures?.results ?? (Array.isArray(factures) ? factures : [])
    salesToday = factList
      .filter((f: any) => (f.created_at || '').slice(0, 10) === today)
      .reduce((a: number, f: any) => a + Number(f.total || 0), 0)
  } catch {}

  boutiquesStats.value = { ...boutiquesStats.value, [boutique.id]: { stockCount, stockValue, ruptures, salesToday } }
}

const loadAllData = async () => {
  isRefreshing.value = true
  try {
    await Promise.all([loadEntreprise(), loadBoutiques(), loadUsers()])
    await Promise.all(boutiques.value.map(b => loadBoutiqueStats(b)))
    lastUpdated.value = new Date()
  } catch (e) {
    console.error('[SuperAdmin Dashboard] Erreur:', e)
  } finally {
    isLoading.value = false
    isRefreshing.value = false
  }
}

const refreshData = async () => {
  await loadAllData()
  notifSuccess('Données rafraîchies')
}

const onEntrepriseUpdated = async () => {
  await loadEntreprise()
  notifSuccess('Entreprise mise Ã  jour')
}

onMounted(async () => {
  await loadAllData()
  refreshTimer = setInterval(loadAllData, 60_000)
})
onUnmounted(() => { if (refreshTimer) clearInterval(refreshTimer) })

// â”€â”€â”€ Accès entrepôt â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const accessBoutique = async (boutique: any) => {
  if (isAccessingBoutique.value) return
  isAccessingBoutique.value = true
  try {
    if (process.client) localStorage.setItem('boutique', JSON.stringify(boutique))
    notifSuccess(`Accès Ã  Â« ${boutique.nom} Â»`)
    window.location.href = '/user'
  } finally {
    setTimeout(() => { isAccessingBoutique.value = false }, 1500)
  }
}

const editBoutique = (b: any) => { selectedBoutique.value = b; showEditBoutique.value = true }

const getBoutiqueResponsible = (boutiqueId: number) => {
  const u = users.value.find((usr: any) => usr.boutique?.id === boutiqueId && ['admin', 'superadmin'].includes(usr.role))
  if (!u) return 'Non assigné'
  return `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.username || 'Non assigné'
}

// â”€â”€â”€ Bar chart comparaison â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const maxStockValue = computed(() =>
  Math.max(1, ...boutiques.value.map(b => boutiquesStats.value[b.id]?.stockValue || 0))
)
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

      <!-- â”€â”€ En-tÃªte â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Global</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-2">
            <span>{{ entrepriseData?.nom || 'Entreprise' }}</span>
            <span v-if="lastUpdatedLabel" class="inline-flex items-center gap-1 text-xs text-gray-400 dark:text-gray-600">
              <UIcon name="i-heroicons-arrow-path" class="w-3 h-3" :class="{ 'animate-spin': isRefreshing }" />
              {{ lastUpdatedLabel }}
            </span>
          </p>
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <button
            @click="refreshData"
            :disabled="isRefreshing"
            class="inline-flex items-center gap-2 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" :class="{ 'animate-spin': isRefreshing }" />
            Rafraîchir
          </button>
          <button
            @click="showCreateUser = true"
            class="inline-flex items-center gap-2 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <UIcon name="i-heroicons-user-plus" class="w-4 h-4 text-emerald-600" />
            Utilisateur
          </button>
          <button
            @click="showCreateBoutique = true"
            class="inline-flex items-center gap-2 px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-sm"
          >
            <UIcon name="i-heroicons-plus" class="w-4 h-4" />
            Entrepôt
          </button>
          <button
            @click="showSettings = true"
            class="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Paramètres entreprise"
          >
            <UIcon name="i-heroicons-cog-6-tooth" class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- â”€â”€ Skeleton â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
      <template v-if="isLoading">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div v-for="i in 4" :key="i" class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse h-28"></div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="i in 3" :key="i" class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse h-56"></div>
        </div>
      </template>

      <template v-else>

        <!-- â”€â”€ KPIs globaux â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCardEnhanced title="Entrepôts actifs" :value="boutiques.length" format="number" icon="i-heroicons-building-storefront" color="blue" :subtitle="`${users.length} utilisateurs`" />
          <KpiCardEnhanced title="Unités en stock" :value="totalStock" format="number" icon="i-heroicons-cube" color="green" subtitle="Tous entrepôts" />
          <KpiCardEnhanced title="Valeur totale stock" :value="totalValeur" format="currency" icon="i-heroicons-banknotes" color="purple" subtitle="Tous entrepôts" />
          <KpiCardEnhanced title="Ventes du jour" :value="totalSalesToday" format="currency" icon="i-heroicons-chart-bar-square" :color="totalSalesToday > 0 ? 'green' : 'gray'" subtitle="Toutes boutiques" />
        </div>

        <!-- â”€â”€ Alerte ruptures â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
        <div
          v-if="totalRuptures > 0"
          class="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3"
        >
          <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-red-500 flex-shrink-0" />
          <p class="text-sm font-medium text-red-700 dark:text-red-400">
            {{ totalRuptures }} rupture{{ totalRuptures > 1 ? 's' : '' }} de stock détectée{{ totalRuptures > 1 ? 's' : '' }} sur l'ensemble des entrepôts
          </p>
        </div>

        <!-- â”€â”€ Carte entreprise â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div
                class="h-14 w-14 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 cursor-pointer flex-shrink-0 flex items-center justify-center"
                @click="entrepriseData?.logo && $event"
              >
                <img v-if="entrepriseData?.logo" :src="entrepriseData.logo" alt="Logo" class="h-full w-full object-contain p-1" />
                <UIcon v-else name="i-heroicons-building-office-2" class="w-7 h-7 text-gray-400" />
              </div>
              <div>
                <p class="text-lg font-bold text-gray-900 dark:text-white">{{ entrepriseData?.nom || 'â€”' }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ entrepriseData?.ville }} <span v-if="entrepriseData?.numero_fiscal">Â· NUI: {{ entrepriseData.numero_fiscal }}</span></p>
              </div>
            </div>
            <button @click="showSettings = true" class="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300">
              <UIcon name="i-heroicons-pencil-square" class="w-4 h-4" />
              Modifier
            </button>
          </div>
        </div>

        <!-- â”€â”€ Comparaison entrepôts (barres) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
        <div v-if="boutiques.length > 0" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 class="text-base font-semibold text-gray-900 dark:text-white mb-5">Valeur du stock par entrepôt</h2>
          <div class="space-y-3">
            <div v-for="b in boutiques" :key="b.id" class="flex items-center gap-3">
              <span class="text-sm text-gray-700 dark:text-gray-300 w-32 truncate flex-shrink-0" :title="b.nom">{{ b.nom }}</span>
              <div class="flex-1 h-6 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                <div
                  class="h-6 bg-emerald-500 rounded-lg transition-all duration-700 flex items-center justify-end pr-2"
                  :style="{ width: `${Math.max(4, ((boutiquesStats[b.id]?.stockValue || 0) / maxStockValue) * 100)}%` }"
                >
                  <span v-if="(boutiquesStats[b.id]?.stockValue || 0) / maxStockValue > 0.2" class="text-xs font-medium text-white">
                    {{ formatFCFA(boutiquesStats[b.id]?.stockValue || 0) }}
                  </span>
                </div>
              </div>
              <span class="text-xs text-gray-500 dark:text-gray-400 w-20 text-right flex-shrink-0">
                {{ (boutiquesStats[b.id]?.stockCount || 0).toLocaleString() }} u.
              </span>
            </div>
          </div>
        </div>

        <!-- â”€â”€ Cards entrepôts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-base font-semibold text-gray-900 dark:text-white">Entrepôts ({{ boutiques.length }})</h2>
          </div>

          <div v-if="boutiques.length === 0" class="bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 p-12 text-center">
            <UIcon name="i-heroicons-building-storefront" class="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p class="text-gray-500 dark:text-gray-400 font-medium">Aucun entrepôt créé</p>
            <button @click="showCreateBoutique = true" class="mt-3 text-sm text-emerald-600 dark:text-emerald-400 hover:underline">Créer le premier entrepôt â†’</button>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div
              v-for="b in boutiques"
              :key="b.id"
              class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow"
            >
              <!-- Header carte -->
              <div class="flex items-start justify-between mb-4">
                <div class="min-w-0 flex-1">
                  <h3 class="font-semibold text-gray-900 dark:text-white truncate">{{ b.nom }}</h3>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ b.ville || 'â€”' }}</p>
                </div>
                <div class="flex items-center gap-1 ml-2 flex-shrink-0">
                  <button
                    @click="editBoutique(b)"
                    class="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <UIcon name="i-heroicons-pencil-square" class="w-4 h-4" />
                  </button>
                  <button
                    @click="accessBoutique(b)"
                    :disabled="isAccessingBoutique"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    <UIcon name="i-heroicons-arrow-right-on-rectangle" class="w-3.5 h-3.5" />
                    Accéder
                  </button>
                </div>
              </div>

              <!-- Métriques -->
              <div class="grid grid-cols-2 gap-2 mb-4">
                <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                  <p class="text-xs text-blue-600 dark:text-blue-400 font-medium">Unités stock</p>
                  <p class="text-lg font-bold text-blue-700 dark:text-blue-300">{{ (boutiquesStats[b.id]?.stockCount || 0).toLocaleString() }}</p>
                </div>
                <div class="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3">
                  <p class="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Valeur</p>
                  <p class="text-sm font-bold text-emerald-700 dark:text-emerald-300 truncate">{{ formatFCFA(boutiquesStats[b.id]?.stockValue || 0) }}</p>
                </div>
                <div class="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
                  <p class="text-xs text-amber-600 dark:text-amber-400 font-medium">Ventes du jour</p>
                  <p class="text-sm font-bold text-amber-700 dark:text-amber-300 truncate">{{ formatFCFA(boutiquesStats[b.id]?.salesToday || 0) }}</p>
                </div>
                <div
                  class="rounded-lg p-3"
                  :class="(boutiquesStats[b.id]?.ruptures || 0) > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-gray-700'"
                >
                  <p class="text-xs font-medium" :class="(boutiquesStats[b.id]?.ruptures || 0) > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'">Ruptures</p>
                  <p class="text-lg font-bold" :class="(boutiquesStats[b.id]?.ruptures || 0) > 0 ? 'text-red-700 dark:text-red-300' : 'text-gray-700 dark:text-gray-300'">
                    {{ boutiquesStats[b.id]?.ruptures || 0 }}
                  </p>
                </div>
              </div>

              <!-- Footer carte -->
              <div class="pt-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <div class="flex justify-between">
                  <span>Responsable</span>
                  <span class="font-medium text-gray-700 dark:text-gray-300 truncate ml-2">{{ getBoutiqueResponsible(b.id) }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Dernière activité</span>
                  <span>{{ formatDate(b.updated_at || b.created_at) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- â”€â”€ Activité récente & Utilisateurs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Derniers utilisateurs -->
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-base font-semibold text-gray-900 dark:text-white">Utilisateurs ({{ users.length }})</h2>
              <NuxtLink to="/superadmin/utilisateurs" class="text-xs text-emerald-600 dark:text-emerald-400 hover:underline">Gérer â†’</NuxtLink>
            </div>
            <div v-if="users.length === 0" class="text-sm text-gray-400 dark:text-gray-600 py-4 text-center">Aucun utilisateur</div>
            <div v-else class="space-y-2">
              <div
                v-for="u in users.slice(0, 6)"
                :key="u.id"
                class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div class="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                  <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {{ (u.first_name || u.username || '?')[0].toUpperCase() }}
                  </span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {{ `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.username }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ u.email || 'â€”' }}</p>
                </div>
                <span
                  class="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium"
                  :class="{
                    'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400': u.role === 'superadmin',
                    'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400': u.role === 'admin',
                    'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400': u.role === 'user',
                  }"
                >{{ u.role }}</span>
              </div>
            </div>
          </div>

          <!-- Actions rapides -->
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 class="text-base font-semibold text-gray-900 dark:text-white mb-4">Actions rapides</h2>
            <div class="space-y-2">
              <button
                @click="showSettings = true"
                class="w-full flex items-center gap-4 p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all group text-left"
              >
                <div class="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <UIcon name="i-heroicons-cog-6-tooth" class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p class="text-sm font-semibold text-gray-900 dark:text-white">Paramètres entreprise</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Logo, nom, coordonnées</p>
                </div>
              </button>
              <NuxtLink
                to="/superadmin/utilisateurs"
                class="flex items-center gap-4 p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all"
              >
                <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <UIcon name="i-heroicons-users" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p class="text-sm font-semibold text-gray-900 dark:text-white">Gérer les utilisateurs</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Créer, modifier, supprimer</p>
                </div>
              </NuxtLink>
              <NuxtLink
                to="/superadmin/entrepots"
                class="flex items-center gap-4 p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all"
              >
                <div class="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <UIcon name="i-heroicons-building-storefront" class="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p class="text-sm font-semibold text-gray-900 dark:text-white">Gérer les entrepôts</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Créer, configurer, assigner</p>
                </div>
              </NuxtLink>
            </div>
          </div>
        </div>

      </template>
    </div>

    <!-- Modales -->
    <CreateBoutiqueModal :isOpen="showCreateBoutique" @close="showCreateBoutique = false" @created="loadBoutiques" />
    <CreateUserModal :isOpen="showCreateUser" @close="showCreateUser = false" @created="loadUsers" />
    <EditBoutiqueModal :isOpen="showEditBoutique" :boutique="selectedBoutique" @close="showEditBoutique = false" @updated="loadBoutiques" />
    <EditEntrepriseModal :isOpen="showSettings" @close="showSettings = false" @updated="onEntrepriseUpdated" />
  </div>
</template>

