<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useApiBase } from '@/composables/useApiBase'

const { getApiUrl, getAuthHeaders } = useApiBase()

definePageMeta({ alias: ['/stock-produit'] })

// ─── State ────────────────────────────────────────────────────────────────────
const boutiqueData = ref<any>(null)
const produits = ref<any[]>([])
const isLoading = ref(true)
const isRefreshing = ref(false)
const lastUpdated = ref<Date | null>(null)
const q = ref('')
const filtreStatut = ref<'tous' | 'rupture' | 'critique' | 'faible' | 'normal'>('tous')
const page = ref(1)
const pageCount = 20
let refreshTimer: ReturnType<typeof setInterval> | null = null

// ─── KPIs ────────────────────────────────────────────────────────────────────
const totalUnites = computed(() => produits.value.reduce((a, p) => a + (p.quantiteStock || 0), 0))
const totalValeur = computed(() => produits.value.reduce((a, p) => a + (p.quantiteStock || 0) * (p.prix || 0), 0))
const nbRupture   = computed(() => produits.value.filter(p => (p.quantiteStock || 0) === 0).length)
const nbCritique  = computed(() => produits.value.filter(p => {
  const qty = p.quantiteStock || 0; const min = p.stock_minimum || 0
  return qty > 0 && qty <= min
}).length)
const nbFaible    = computed(() => produits.value.filter(p => {
  const qty = p.quantiteStock || 0; const min = p.stock_minimum || 0
  return qty > min && qty < (min * 3 || 50)
}).length)
const nbNormal    = computed(() => produits.value.filter(p => {
  const qty = p.quantiteStock || 0; const min = p.stock_minimum || 0
  return qty >= (min * 3 || 50)
}).length)

const lastUpdatedLabel = computed(() => {
  if (!lastUpdated.value) return ''
  const diff = Math.floor((Date.now() - lastUpdated.value.getTime()) / 1000)
  if (diff < 5) return 'À l\'instant'
  if (diff < 60) return `Il y a ${diff}s`
  return `Il y a ${Math.floor(diff / 60)}min`
})

const formatCurrency = (n: number) => new Intl.NumberFormat('fr-FR').format(Math.round(n)) + ' FCFA'

// ─── Filtrage ─────────────────────────────────────────────────────────────────
const produitsFiltres = computed(() => {
  let list = produits.value

  if (filtreStatut.value === 'rupture')  list = list.filter(p => (p.quantiteStock || 0) === 0)
  else if (filtreStatut.value === 'critique') list = list.filter(p => (p.quantiteStock || 0) > 0 && (p.quantiteStock || 0) < 10)
  else if (filtreStatut.value === 'faible')   list = list.filter(p => (p.quantiteStock || 0) >= 10 && (p.quantiteStock || 0) < 50)
  else if (filtreStatut.value === 'normal')   list = list.filter(p => (p.quantiteStock || 0) >= 50)

  if (q.value.trim()) {
    const kw = q.value.toLowerCase()
    list = list.filter(p =>
      (p.nomProduit || p.nom || '').toLowerCase().includes(kw) ||
      (p.reference || '').toLowerCase().includes(kw) ||
      (p.category || '').toLowerCase().includes(kw)
    )
  }
  return list
})

const totalFiltres = computed(() => produitsFiltres.value.length)
const lignesPage = computed(() =>
  produitsFiltres.value.slice((page.value - 1) * pageCount, page.value * pageCount)
)

const onSearch = () => { page.value = 1 }
const setFiltre = (f: typeof filtreStatut.value) => { filtreStatut.value = f; page.value = 1 }

// ─── Data loading ─────────────────────────────────────────────────────────────
const loadData = async () => {
  if (!boutiqueData.value?.id) return
  isRefreshing.value = true
  try {
    const h = getAuthHeaders()
    const stocksRaw: any = await $fetch(getApiUrl(`/api/stocks/?entrepot=${boutiqueData.value.id}`), { headers: h })
    const stocks: any[] = Array.isArray(stocksRaw) ? stocksRaw : (stocksRaw?.results ?? [])
    if (stocks.length === 0) { produits.value = []; return }

    // Séparer stocks produit-niveau (variante null) et stocks variante
    const stocksProduit = stocks.filter((s: any) => s.variante == null)
    const stocksVariante = stocks.filter((s: any) => s.variante != null)

    const ids = [...new Set(stocks.map((s: any) => s.produit).filter(Boolean))].join(',')
    if (!ids) { produits.value = []; return }

    const prodsRaw: any = await $fetch(getApiUrl(`/api/produits/?id__in=${ids}`), { headers: h })
    const rawProds: any[] = Array.isArray(prodsRaw) ? prodsRaw : (prodsRaw?.results ?? [])

    produits.value = rawProds.map((p: any) => {
      const stockProduit = stocksProduit.find((s: any) => s.produit === p.id)
      const variantesStockDuProduit = stocksVariante.filter((s: any) => s.produit === p.id)

      const variantesStock = variantesStockDuProduit.map((s: any) => ({
        varianteId: s.variante,
        varianteNom: s.variante_nom || `Variante ${s.variante}`,
        quantite: s.quantite || 0,
        prixVente: s.prix_vente || p.prix_vente || p.prix || 0,
      }))

      const nbVariantes = p.nb_variantes ?? variantesStock.length
      // Si variantes : quantiteStock = somme des variantes ; sinon stock produit-niveau
      const quantiteStock = nbVariantes > 0
        ? variantesStock.reduce((acc: number, v: any) => acc + v.quantite, 0)
        : (stockProduit?.quantite || 0)

      return {
        id: p.id,
        reference: p.reference || '—',
        nomProduit: p.nom,
        category: p.category || '—',
        prix: p.prix_vente || p.prix || 0,
        quantiteStock,
        emplacement: stockProduit?.emplacement || '—',
        statut: p.actif ?? true,
        stock_minimum: p.stock_minimum ?? 0,
        stock_maximum: p.stock_maximum ?? 1000,
        nbVariantes,
        variantesStock,
      }
    })
    lastUpdated.value = new Date()
  } catch (e) {
    console.error('[StockProduit]', e)
  } finally {
    isLoading.value = false
    isRefreshing.value = false
  }
}


onMounted(async () => {
  if (!process.client) return
  try {
    const boutique = localStorage.getItem('boutique')
    if (boutique) boutiqueData.value = JSON.parse(boutique)
  } catch {}
  await loadData()
  refreshTimer = setInterval(loadData, 30_000)
})
onUnmounted(() => { if (refreshTimer) clearInterval(refreshTimer) })

// ─── Helpers tableau ──────────────────────────────────────────────────────────
const statusBadge = (qty: number, stock_minimum = 0) => {
  if (qty === 0) return { label: 'Rupture', cls: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' }
  if (stock_minimum > 0 && qty <= stock_minimum) return { label: 'Critique', cls: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' }
  if (stock_minimum > 0 && qty < stock_minimum * 3) return { label: 'Faible', cls: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' }
  // Fallback si pas de seuil configuré
  if (qty < 10) return { label: 'Critique', cls: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' }
  if (qty < 50) return { label: 'Faible',   cls: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' }
  return { label: 'Normal', cls: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' }
}

// ─── Tri colonnes ─────────────────────────────────────────────────────────────
const sortKey = ref<string>('nomProduit')
const sortAsc = ref(true)

const toggleSort = (key: string) => {
  if (sortKey.value === key) sortAsc.value = !sortAsc.value
  else { sortKey.value = key; sortAsc.value = true }
  page.value = 1
}

const produitsFiltresSorted = computed(() => {
  const list = [...produitsFiltres.value]
  list.sort((a, b) => {
    const va = a[sortKey.value as keyof typeof a] ?? ''
    const vb = b[sortKey.value as keyof typeof b] ?? ''
    if (typeof va === 'number' && typeof vb === 'number') return sortAsc.value ? va - vb : vb - va
    return sortAsc.value
      ? String(va).localeCompare(String(vb), 'fr')
      : String(vb).localeCompare(String(va), 'fr')
  })
  return list
})

const lignesPageSorted = computed(() =>
  produitsFiltresSorted.value.slice((page.value - 1) * pageCount, page.value * pageCount)
)

// ─── Ajustement rapide de stock ───────────────────────────────────────────────
const { error: notifError, success: notifSuccess } = useNotification()
import { useNotification } from '@/types/useNotification'

const showAjustModal = ref(false)
const ajustProduit = ref<any>(null)
const ajustType = ref<'entree' | 'sortie' | 'ajustement'>('entree')
const ajustQuantite = ref(1)
const ajustMotif = ref('')
const ajustLoading = ref(false)

const ouvrirAjustement = (p: any) => {
  ajustProduit.value = p
  ajustType.value = 'entree'
  ajustQuantite.value = 1
  ajustMotif.value = ''
  showAjustModal.value = true
}

const confirmerAjustement = async () => {
  if (!ajustProduit.value || !ajustQuantite.value || ajustQuantite.value < 1) return
  ajustLoading.value = true
  try {
    const h = getAuthHeaders()
    await $fetch(getApiUrl('/api/mouvements-stock/'), {
      method: 'POST',
      headers: h,
      body: {
        produit: ajustProduit.value.id,
        entrepot: boutiqueData.value?.id,
        type_mouvement: ajustType.value,
        quantite: ajustQuantite.value,
        motif: ajustMotif.value || `${ajustType.value === 'entree' ? 'Entrée' : ajustType.value === 'sortie' ? 'Sortie' : 'Ajustement'} manuel`
      }
    })
    notifSuccess(`Stock mis à jour : ${ajustProduit.value.nomProduit}`)
    showAjustModal.value = false
    await loadData()
  } catch (e: any) {
    notifError(e?.data?.error || 'Erreur lors de l\'ajustement')
  } finally {
    ajustLoading.value = false
  }
}

// ─── Édition seuil réapprovisionnement ───────────────────────────────────────
const showSeuilModal = ref(false)
const seuilProduit = ref<any>(null)
const seuilMin = ref(0)
const seuilMax = ref(1000)
const seuilLoading = ref(false)

const ouvrirSeuil = (p: any) => {
  seuilProduit.value = p
  seuilMin.value = p.stock_minimum || 0
  seuilMax.value = p.stock_maximum || 1000
  showSeuilModal.value = true
}

const sauvegarderSeuil = async () => {
  if (!seuilProduit.value) return
  seuilLoading.value = true
  try {
    await $fetch(getApiUrl(`/api/produits/${seuilProduit.value.id}/`), {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: { stock_minimum: seuilMin.value, stock_maximum: seuilMax.value }
    })
    notifSuccess(`Seuils mis à jour — ${seuilProduit.value.nomProduit}`)
    showSeuilModal.value = false
    await loadData()
  } catch (e: any) {
    notifError(e?.data?.error || 'Erreur lors de la mise à jour des seuils')
  } finally {
    seuilLoading.value = false
  }
}

// ─── Export CSV ───────────────────────────────────────────────────────────────
const exporterCSV = () => {
  const rows = produitsFiltresSorted.value
  if (rows.length === 0) return
  const header = 'Référence,Produit,Catégorie,Prix unitaire,Stock,Valeur stock,Emplacement,Statut'
  const lines = rows.map(p =>
    [p.reference, `"${p.nomProduit}"`, p.category, p.prix, p.quantiteStock,
     Math.round(p.quantiteStock * p.prix), p.emplacement, statusBadge(p.quantiteStock).label].join(',')
  )
  const csv = [header, ...lines].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `stock_${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a); a.click()
  URL.revokeObjectURL(url); document.body.removeChild(a)
  notifSuccess('Export CSV téléchargé')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">

      <!-- ── En-tête ──────────────────────────────────────────────────────── -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Stock des produits</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-2">
            <span>{{ boutiqueData?.nom || 'Entrepôt' }}</span>
            <span v-if="lastUpdatedLabel" class="inline-flex items-center gap-1 text-xs text-gray-400 dark:text-gray-600">
              <UIcon name="i-heroicons-arrow-path" class="w-3 h-3" :class="{ 'animate-spin': isRefreshing }" />
              {{ lastUpdatedLabel }}
            </span>
          </p>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="loadData"
            :disabled="isRefreshing"
            class="inline-flex items-center gap-2 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" :class="{ 'animate-spin': isRefreshing }" />
            Rafraîchir
          </button>
          <button @click="exporterCSV" class="inline-flex items-center gap-2 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <UIcon name="i-heroicons-arrow-down-tray" class="w-4 h-4 text-gray-500" />
            Export CSV
          </button>
          <NuxtLink to="/produits" class="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
            <UIcon name="i-heroicons-plus" class="w-4 h-4" />
            Ajouter produit
          </NuxtLink>
        </div>
      </div>

      <!-- ── Skeleton ─────────────────────────────────────────────────────── -->
      <template v-if="isLoading">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div v-for="i in 4" :key="i" class="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 animate-pulse h-24"></div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 animate-pulse h-96"></div>
      </template>

      <template v-else>

        <!-- ── KPI chips ──────────────────────────────────────────────────── -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p class="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Unités en stock</p>
            <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ totalUnites.toLocaleString() }}</p>
            <p class="text-xs text-gray-400 dark:text-gray-600 mt-1">{{ produits.length }} références</p>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p class="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Valeur totale</p>
            <p class="text-xl font-bold text-emerald-600 dark:text-emerald-400 truncate">{{ formatCurrency(totalValeur) }}</p>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p class="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Ruptures de stock</p>
            <p class="text-2xl font-bold" :class="nbRupture > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-400 dark:text-gray-600'">{{ nbRupture }}</p>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p class="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Stock critique (< 10)</p>
            <p class="text-2xl font-bold" :class="nbCritique > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400 dark:text-gray-600'">{{ nbCritique }}</p>
          </div>
        </div>

        <!-- ── Filtres + Recherche ────────────────────────────────────────── -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <!-- Tabs filtres statut -->
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="tab in [
                  { key: 'tous',     label: 'Tous',     count: produits.length,  color: 'gray' },
                  { key: 'rupture',  label: 'Rupture',  count: nbRupture,        color: 'red' },
                  { key: 'critique', label: 'Critique', count: nbCritique,       color: 'orange' },
                  { key: 'faible',   label: 'Faible',   count: nbFaible,         color: 'amber' },
                  { key: 'normal',   label: 'Normal',   count: nbNormal,         color: 'emerald' },
                ]"
                :key="tab.key"
                @click="setFiltre(tab.key as any)"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border"
                :class="filtreStatut === tab.key
                  ? {
                      'gray':    'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 border-gray-800 dark:border-gray-200',
                      'red':     'bg-red-600 text-white border-red-600',
                      'orange':  'bg-orange-500 text-white border-orange-500',
                      'amber':   'bg-amber-500 text-white border-amber-500',
                      'emerald': 'bg-emerald-600 text-white border-emerald-600',
                    }[tab.color]
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                "
              >
                {{ tab.label }}
                <span class="px-1.5 py-0.5 rounded-full text-xs font-bold"
                  :class="filtreStatut === tab.key ? 'bg-white/30 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'"
                >{{ tab.count }}</span>
              </button>
            </div>

            <!-- Recherche -->
            <div class="relative w-full sm:w-64">
              <UIcon name="i-heroicons-magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                v-model="q"
                @input="onSearch"
                placeholder="Rechercher (nom, ref, catégorie)…"
                class="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>
          </div>
        </div>

        <!-- ── Tableau ────────────────────────────────────────────────────── -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <!-- Empty state -->
          <div v-if="lignesPage.length === 0" class="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-600">
            <UIcon name="i-heroicons-cube" class="w-12 h-12 mb-3" />
            <p class="text-base font-medium text-gray-500 dark:text-gray-400">Aucun produit trouvé</p>
            <p class="text-sm mt-1">{{ q ? 'Modifiez votre recherche' : 'Aucun produit dans cette catégorie' }}</p>
          </div>

          <div v-else class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                  <th @click="toggleSort('reference')" class="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-800 dark:hover:text-gray-200 select-none">
                    Référence <span v-if="sortKey==='reference'">{{ sortAsc ? '↑' : '↓' }}</span>
                  </th>
                  <th @click="toggleSort('nomProduit')" class="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-800 dark:hover:text-gray-200 select-none">
                    Produit <span v-if="sortKey==='nomProduit'">{{ sortAsc ? '↑' : '↓' }}</span>
                  </th>
                  <th @click="toggleSort('category')" class="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-800 dark:hover:text-gray-200 select-none hidden md:table-cell">
                    Catégorie <span v-if="sortKey==='category'">{{ sortAsc ? '↑' : '↓' }}</span>
                  </th>
                  <th @click="toggleSort('prix')" class="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-800 dark:hover:text-gray-200 select-none">
                    Prix unit. <span v-if="sortKey==='prix'">{{ sortAsc ? '↑' : '↓' }}</span>
                  </th>
                  <th @click="toggleSort('quantiteStock')" class="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-800 dark:hover:text-gray-200 select-none">
                    Stock <span v-if="sortKey==='quantiteStock'">{{ sortAsc ? '↑' : '↓' }}</span>
                  </th>
                  <th class="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">Valeur</th>
                  <th class="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Statut</th>
                  <th class="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                <tr
                  v-for="p in lignesPageSorted"
                  :key="p.id"
                  class="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors group"
                  :class="{ 'bg-red-50/50 dark:bg-red-900/5': (p.quantiteStock || 0) === 0 }"
                >
                  <td class="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">{{ p.reference }}</td>
                  <td class="px-4 py-3 font-medium text-gray-900 dark:text-white max-w-[180px] truncate" :title="p.nomProduit">{{ p.nomProduit }}</td>
                  <td class="px-4 py-3 text-gray-500 dark:text-gray-400 hidden md:table-cell">{{ p.category }}</td>
                  <td class="px-4 py-3 text-right text-gray-700 dark:text-gray-300 whitespace-nowrap">{{ (p.prix || 0).toLocaleString() }} F</td>
                  <td class="px-4 py-3 text-right">
                    <span class="font-bold text-base" :class="{
                      'text-red-600 dark:text-red-400':    (p.quantiteStock || 0) === 0,
                      'text-orange-600 dark:text-orange-400': (p.quantiteStock || 0) > 0 && (p.quantiteStock || 0) < 10,
                      'text-amber-600 dark:text-amber-400':   (p.quantiteStock || 0) >= 10 && (p.quantiteStock || 0) < 50,
                      'text-emerald-600 dark:text-emerald-400': (p.quantiteStock || 0) >= 50,
                    }">{{ (p.quantiteStock || 0).toLocaleString() }}</span>
                  </td>
                  <td class="px-4 py-3 text-right text-gray-700 dark:text-gray-300 whitespace-nowrap hidden lg:table-cell">
                    {{ formatCurrency((p.quantiteStock || 0) * (p.prix || 0)) }}
                  </td>
                  <td class="px-4 py-3 text-center">
                    <div class="flex flex-col items-center gap-0.5">
                      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold" :class="statusBadge(p.quantiteStock || 0, p.stock_minimum).cls">
                        {{ statusBadge(p.quantiteStock || 0, p.stock_minimum).label }}
                      </span>
                      <span v-if="p.stock_minimum > 0" class="text-xs text-gray-400">seuil : {{ p.stock_minimum }}</span>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-center">
                    <div class="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        @click="ouvrirAjustement(p)"
                        class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 transition-colors"
                        title="Ajuster le stock"
                      >
                        <UIcon name="i-heroicons-pencil-square" class="w-3 h-3" /> Ajuster
                      </button>
                      <button
                        @click="ouvrirSeuil(p)"
                        class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 transition-colors"
                        title="Configurer le seuil de réapprovisionnement"
                      >
                        <UIcon name="i-heroicons-bell-alert" class="w-3 h-3" /> Seuil
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
              <!-- Total -->
              <tfoot>
                <tr class="border-t-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/30">
                  <td colspan="4" class="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300">Total ({{ totalFiltres }} produits)</td>
                  <td class="px-4 py-2 text-right font-bold text-gray-900 dark:text-white">{{ produitsFiltresSorted.reduce((a, p) => a + (p.quantiteStock || 0), 0).toLocaleString() }}</td>
                  <td class="px-4 py-2 text-right font-bold text-emerald-600 dark:text-emerald-400 hidden lg:table-cell">{{ formatCurrency(produitsFiltresSorted.reduce((a, p) => a + (p.quantiteStock || 0) * (p.prix || 0), 0)) }}</td>
                  <td colspan="2"></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Pagination -->
          <div v-if="totalFiltres > pageCount" class="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ (page - 1) * pageCount + 1 }}–{{ Math.min(page * pageCount, totalFiltres) }} sur {{ totalFiltres }}
            </p>
            <UPagination
              v-model="page"
              :page-count="pageCount"
              :total="totalFiltres"
              :active-button="{ variant: 'solid', color: 'emerald' }"
              :inactive-button="{ color: 'gray' }"
            />
          </div>
        </div>

      </template>
    </div>
  </div>

  <!-- ── Modal Ajustement Rapide ───────────────────────────────────────── -->
  <Teleport to="body">
    <div v-if="showAjustModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="showAjustModal = false">
      <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Ajustement de stock</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate max-w-xs">{{ ajustProduit?.nomProduit }}</p>
          </div>
          <button @click="showAjustModal = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
          </button>
        </div>
        <div class="px-6 py-5 space-y-4">
          <!-- Stock actuel -->
          <div class="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
            <span class="text-sm text-gray-600 dark:text-gray-400">Stock actuel</span>
            <span class="text-xl font-bold" :class="statusBadge(ajustProduit?.quantiteStock || 0).cls.split(' ').slice(2).join(' ')">
              {{ ajustProduit?.quantiteStock || 0 }} unités
            </span>
          </div>
          <!-- Type de mouvement -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type d'opération</label>
            <div class="grid grid-cols-3 gap-2">
              <button v-for="t in [{ key: 'entree', label: '↑ Entrée', color: 'emerald' }, { key: 'sortie', label: '↓ Sortie', color: 'red' }, { key: 'ajustement', label: '⇄ Ajustement', color: 'blue' }]"
                :key="t.key" @click="ajustType = t.key as any"
                class="px-3 py-2 rounded-lg text-xs font-semibold border-2 transition-all"
                :class="ajustType === t.key
                  ? t.color === 'emerald' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                  : t.color === 'red' ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                  : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-400'"
              >{{ t.label }}</button>
            </div>
          </div>
          <!-- Quantité -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quantité</label>
            <input v-model.number="ajustQuantite" type="number" min="1" class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-lg font-semibold text-center focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <!-- Motif -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Motif <span class="text-gray-400 font-normal">(optionnel)</span></label>
            <input v-model="ajustMotif" type="text" placeholder="Ex: Livraison fournisseur, casse, inventaire..." class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <!-- Aperçu résultat -->
          <div class="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3 flex items-center justify-between">
            <span class="text-sm text-gray-600 dark:text-gray-400">Nouveau stock estimé</span>
            <span class="font-bold text-lg text-emerald-700 dark:text-emerald-400">
              {{
                ajustType === 'entree' ? (ajustProduit?.quantiteStock || 0) + ajustQuantite
                : ajustType === 'sortie' ? Math.max(0, (ajustProduit?.quantiteStock || 0) - ajustQuantite)
                : ajustQuantite
              }} unités
            </span>
          </div>
        </div>
        <div class="flex gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <button @click="showAjustModal = false" class="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Annuler</button>
          <button @click="confirmerAjustement" :disabled="ajustLoading || !ajustQuantite || ajustQuantite < 1" class="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl transition-colors flex items-center justify-center gap-2">
            <UIcon v-if="ajustLoading" name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin" />
            {{ ajustLoading ? 'Enregistrement...' : 'Confirmer' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- ── Modal Seuil Réapprovisionnement ───────────────────────────────────── -->
  <Teleport to="body">
    <div v-if="showSeuilModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" @click.self="showSeuilModal = false">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">Seuil de réapprovisionnement</h3>
            <p class="text-xs text-gray-500 mt-0.5">{{ seuilProduit?.nomProduit }}</p>
          </div>
          <button @click="showSeuilModal = false" class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <UIcon name="i-heroicons-x-mark" class="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div class="p-6 space-y-4">
          <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-xs text-blue-700 dark:text-blue-300">
            <p class="font-semibold mb-0.5">Comment ça marche ?</p>
            <p>Quand le stock tombe sous le <strong>seuil minimum</strong>, le produit passe en statut <strong>Critique</strong> et une alerte s'affiche. Le seuil max est indicatif pour le réapprovisionnement optimal.</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Seuil minimum (alerte critique)
            </label>
            <div class="relative">
              <input v-model.number="seuilMin" type="number" min="0"
                class="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">unités</span>
            </div>
            <p class="text-xs text-gray-400 mt-1">Stock actuel : <strong :class="(seuilProduit?.quantiteStock || 0) <= seuilMin ? 'text-red-600' : 'text-emerald-600'">{{ seuilProduit?.quantiteStock || 0 }}</strong></p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Stock maximum recommandé
            </label>
            <div class="relative">
              <input v-model.number="seuilMax" type="number" min="0"
                class="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">unités</span>
            </div>
          </div>
          <!-- Aperçu visuel du seuil -->
          <div v-if="seuilMax > 0" class="space-y-1.5">
            <p class="text-xs font-medium text-gray-500">Aperçu</p>
            <div class="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div class="absolute h-3 rounded-full bg-red-400" :style="{ width: Math.min(100, (seuilMin / seuilMax) * 100) + '%' }"></div>
              <div class="absolute h-3 rounded-l-none rounded-r-full bg-amber-400" :style="{ left: Math.min(100, (seuilMin / seuilMax) * 100) + '%', width: Math.min(100, ((seuilMin * 3 - seuilMin) / seuilMax) * 100) + '%' }"></div>
              <!-- Curseur stock actuel -->
              <div class="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-gray-600 rounded-full shadow"
                :style="{ left: `calc(${Math.min(100, ((seuilProduit?.quantiteStock || 0) / seuilMax) * 100)}% - 6px)` }">
              </div>
            </div>
            <div class="flex justify-between text-xs text-gray-400">
              <span class="text-red-500">0 → {{ seuilMin }} (Critique)</span>
              <span class="text-emerald-500">≥ {{ seuilMin * 3 || seuilMax }} (Normal)</span>
            </div>
          </div>
        </div>
        <div class="flex gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <button @click="showSeuilModal = false" class="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 transition-colors">Annuler</button>
          <button @click="sauvegarderSeuil" :disabled="seuilLoading" class="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-colors flex items-center justify-center gap-2">
            <UIcon v-if="seuilLoading" name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin" />
            {{ seuilLoading ? 'Enregistrement...' : 'Sauvegarder' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
