<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useApiBase } from '@/composables/useApiBase'
import { useNotification } from '@/types/useNotification'
import ProduitFormSimple from '@/components/produits/ProduitFormSimple.vue'
import ImportExportSimple from '@/components/produits/ImportExportSimple.vue'

definePageMeta({ layout: 'superadmin' })

const { getApiUrl, getAuthHeaders } = useApiBase()
const { error, success } = useNotification()

async function apiFetch(path: string, opts: any = {}) {
  return $fetch(getApiUrl(path), { headers: getAuthHeaders(), ...opts })
}

// â”€â”€ Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const produits = ref<any[]>([])
const loading = ref(true)
const searchQuery = ref('')
const categoryFilter = ref('')
const totalPages = ref(1)
const currentPage = ref(1)

// â”€â”€ Modals â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const showCreate = ref(false)
const showEdit = ref(false)
const showDetail = ref(false)
const showDeleteConfirm = ref(false)
const selected = ref<any>(null)

// â”€â”€ Stats â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const categories = computed(() => [...new Set(produits.value.map(p => p.category).filter(Boolean))].sort())
const stats = computed(() => ({
  total: produits.value.length,
  categories: categories.value.length,
  stockTotal: produits.value.reduce((s, p) => s + (p.quantite || 0), 0),
  valeur: produits.value.reduce((s, p) => s + ((p.prix_vente || p.prix || 0) * (p.quantite || 0)), 0),
}))

const filtered = computed(() => {
  let list = produits.value
  if (categoryFilter.value) list = list.filter(p => p.category === categoryFilter.value)
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(p =>
      p.nom?.toLowerCase().includes(q) ||
      p.reference?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    )
  }
  return list
})

// â”€â”€ Load â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function load(page = 1) {
  loading.value = true
  try {
    const res: any = await apiFetch(`/api/produits/?page=${page}`)
    produits.value = res.results ?? (Array.isArray(res) ? res : [])
    totalPages.value = res.total_pages ?? 1
    currentPage.value = page
  } catch {
    error('Impossible de charger les produits')
  } finally {
    loading.value = false
  }
}

onMounted(() => load())

// â”€â”€ Actions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function openDetail(p: any) { selected.value = p; showDetail.value = true }
function openEdit(p: any) { selected.value = p; showEdit.value = true }
function openDelete(p: any) { selected.value = p; showDeleteConfirm.value = true }

async function deleteProduit() {
  try {
    await apiFetch(`/api/produits/${selected.value.id}/`, { method: 'DELETE' })
    success('Produit supprimé')
    showDeleteConfirm.value = false
    await load(currentPage.value)
  } catch {
    error('Erreur lors de la suppression')
  }
}

function fmt(n: any) { return Number(n || 0).toLocaleString('fr-FR') }

function stockClass(q: number) {
  if (q === 0) return 'text-red-600 dark:text-red-400'
  if (q < 5) return 'text-amber-600 dark:text-amber-400'
  return 'text-emerald-600 dark:text-emerald-400'
}

function marge(p: any) {
  const achat = p.prix_achat || 0
  const vente = p.prix_vente || p.prix || 0
  if (!achat) return null
  return Math.round(((vente - achat) / achat) * 100)
}

let searchTimer: any
function onSearch() { clearTimeout(searchTimer); searchTimer = setTimeout(() => load(1), 400) }
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

      <!-- Header -->
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Produits</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Catalogue produits de votre entreprise</p>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="showCreate = true"
            class="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
            Nouveau produit
          </button>
          <button @click="load(currentPage)" :disabled="loading" class="p-2 text-gray-400 hover:text-emerald-600 transition-colors disabled:opacity-50">
            <svg class="w-5 h-5" :class="loading ? 'animate-spin' : ''" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- KPIs -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Total produits</p>
          <p class="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">{{ stats.total }}</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Catégories</p>
          <p class="text-3xl font-extrabold text-blue-600 mt-1">{{ stats.categories }}</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Stock total</p>
          <p class="text-3xl font-extrabold text-emerald-600 mt-1">{{ fmt(stats.stockTotal) }}</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Valeur stock</p>
          <p class="text-xl font-extrabold text-violet-600 mt-1">{{ fmt(stats.valeur) }} <span class="text-xs text-gray-400 font-medium">FCFA</span></p>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <!-- Filtres -->
        <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex flex-wrap items-center gap-3">
          <div class="relative flex-1 min-w-0 sm:min-w-[160px]">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input v-model="searchQuery" @input="onSearch" type="search" placeholder="Rechercher par nom, référence..."
              class="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400" />
          </div>
          <select v-model="categoryFilter" @change="load(1)"
            class="px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400">
            <option value="">Toutes les catégories</option>
            <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
          </select>
          <!-- Import/Export -->
          <ImportExportSimple @imported="load(1)" />
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex justify-center py-16">
          <div class="w-8 h-8 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
        </div>

        <!-- Empty -->
        <div v-else-if="filtered.length === 0" class="flex flex-col items-center justify-center py-16 text-gray-400">
          <svg class="w-12 h-12 mb-3" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
          <p class="font-medium">Aucun produit trouvé</p>
          <button @click="showCreate = true" class="mt-3 px-4 py-2 bg-emerald-500 text-white text-sm rounded-xl hover:bg-emerald-600 transition-colors">
            Ajouter un produit
          </button>
        </div>

        <!-- Tableau -->
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-100 dark:divide-gray-700 text-sm">
            <thead class="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th class="px-5 py-3 text-left font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide text-xs">Produit</th>
                <th class="px-5 py-3 text-left font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide text-xs">Catégorie</th>
                <th class="px-5 py-3 text-right font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide text-xs">Prix achat</th>
                <th class="px-5 py-3 text-right font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide text-xs">Prix vente</th>
                <th class="px-5 py-3 text-right font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide text-xs">Stock</th>
                <th class="px-5 py-3 text-right font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide text-xs">Marge</th>
                <th class="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50 dark:divide-gray-700/50">
              <tr
                v-for="p in filtered"
                :key="p.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
              >
                <td class="px-5 py-3">
                  <div class="font-semibold text-gray-900 dark:text-white">{{ p.nom }}</div>
                  <div class="text-xs text-gray-400">{{ p.reference || `#${p.id}` }}</div>
                </td>
                <td class="px-5 py-3">
                  <span v-if="p.category" class="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full font-medium">
                    {{ p.category }}
                  </span>
                  <span v-else class="text-gray-400">â€”</span>
                </td>
                <td class="px-5 py-3 text-right text-gray-600 dark:text-gray-400">
                  {{ p.prix_achat ? fmt(p.prix_achat) + ' FCFA' : 'â€”' }}
                </td>
                <td class="px-5 py-3 text-right font-semibold text-gray-900 dark:text-white">
                  {{ fmt(p.prix_vente || p.prix) }} FCFA
                </td>
                <td class="px-5 py-3 text-right">
                  <span class="font-bold" :class="stockClass(p.quantite || 0)">{{ p.quantite || 0 }}</span>
                </td>
                <td class="px-5 py-3 text-right">
                  <span v-if="marge(p) !== null" class="text-xs font-semibold" :class="(marge(p) || 0) > 0 ? 'text-emerald-600' : 'text-red-500'">
                    {{ marge(p) }}%
                  </span>
                  <span v-else class="text-gray-400">â€”</span>
                </td>
                <td class="px-5 py-3">
                  <div class="flex items-center justify-end gap-1">
                    <button @click="openDetail(p)" title="Détails"
                      class="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    </button>
                    <button @click="openEdit(p)" title="Modifier"
                      class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    </button>
                    <button @click="openDelete(p)" title="Supprimer"
                      class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-sm text-gray-500">
          <span>Page {{ currentPage }} / {{ totalPages }}</span>
          <div class="flex gap-2">
            <button @click="load(currentPage - 1)" :disabled="currentPage <= 1"
              class="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-40 hover:border-emerald-400 transition-colors">â† Précédent</button>
            <button @click="load(currentPage + 1)" :disabled="currentPage >= totalPages"
              class="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-40 hover:border-emerald-400 transition-colors">Suivant â†’</button>
          </div>
        </div>
      </div>
    </section>

    <!-- Modal Créer -->
    <Teleport to="body">
      <div v-if="showCreate" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" @click.self="showCreate = false">
        <div class="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
          <div class="bg-emerald-500 px-6 py-4 flex items-center justify-between flex-shrink-0">
            <h3 class="text-white font-bold text-lg">Nouveau produit</h3>
            <button @click="showCreate = false" class="text-white/70 hover:text-white">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          <div class="overflow-y-auto p-6">
            <ProduitFormSimple @saved="showCreate = false; load(1)" @cancel="showCreate = false" />
          </div>
        </div>
      </div>

      <!-- Modal Éditer -->
      <div v-if="showEdit && selected" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" @click.self="showEdit = false">
        <div class="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
          <div class="bg-blue-500 px-6 py-4 flex items-center justify-between flex-shrink-0">
            <h3 class="text-white font-bold text-lg">Modifier â€” {{ selected.nom }}</h3>
            <button @click="showEdit = false" class="text-white/70 hover:text-white">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          <div class="overflow-y-auto p-6">
            <ProduitFormSimple :produit="selected" @saved="showEdit = false; load(currentPage)" @cancel="showEdit = false" />
          </div>
        </div>
      </div>

      <!-- Modal Détail -->
      <div v-if="showDetail && selected" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" @click.self="showDetail = false">
        <div class="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
          <div class="bg-emerald-500 px-6 py-4 flex items-center justify-between flex-shrink-0">
            <h3 class="text-white font-bold text-lg">{{ selected.nom }}</h3>
            <button @click="showDetail = false" class="text-white/70 hover:text-white">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          <div class="p-6 overflow-y-auto space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <p class="text-xs text-gray-400 uppercase mb-1">Référence</p>
                <p class="font-semibold text-gray-900 dark:text-white">{{ selected.reference || `#${selected.id}` }}</p>
              </div>
              <div class="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <p class="text-xs text-gray-400 uppercase mb-1">Catégorie</p>
                <p class="font-semibold text-gray-900 dark:text-white">{{ selected.category || 'â€”' }}</p>
              </div>
              <div class="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <p class="text-xs text-gray-400 uppercase mb-1">Prix achat</p>
                <p class="font-bold text-lg text-gray-900 dark:text-white">{{ selected.prix_achat ? fmt(selected.prix_achat) + ' FCFA' : 'â€”' }}</p>
              </div>
              <div class="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <p class="text-xs text-gray-400 uppercase mb-1">Prix vente</p>
                <p class="font-bold text-lg text-emerald-600">{{ fmt(selected.prix_vente || selected.prix) }} FCFA</p>
              </div>
              <div class="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <p class="text-xs text-gray-400 uppercase mb-1">Stock actuel</p>
                <p class="font-bold text-2xl" :class="stockClass(selected.quantite || 0)">{{ selected.quantite || 0 }}</p>
              </div>
              <div v-if="marge(selected) !== null" class="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <p class="text-xs text-gray-400 uppercase mb-1">Marge</p>
                <p class="font-bold text-2xl" :class="(marge(selected) || 0) > 0 ? 'text-emerald-600' : 'text-red-500'">{{ marge(selected) }}%</p>
              </div>
            </div>
            <div v-if="selected.description" class="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <p class="text-xs text-gray-400 uppercase mb-1">Description</p>
              <p class="text-sm text-gray-700 dark:text-gray-300">{{ selected.description }}</p>
            </div>
          </div>
          <div class="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 flex-shrink-0">
            <button @click="showDetail = false" class="px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 transition-colors">Fermer</button>
            <button @click="showDetail = false; openEdit(selected)" class="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-xl transition-colors">Modifier â†’</button>
          </div>
        </div>
      </div>

      <!-- Confirm suppression -->
      <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" @click.self="showDeleteConfirm = false">
        <div class="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-2xl p-6">
          <div class="flex items-center gap-4 mb-5">
            <div class="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            </div>
            <div>
              <h3 class="font-bold text-gray-900 dark:text-white">Supprimer le produit ?</h3>
              <p class="text-sm text-gray-500 mt-1">{{ selected?.nom }} sera définitivement supprimé.</p>
            </div>
          </div>
          <div class="flex gap-3 justify-end">
            <button @click="showDeleteConfirm = false" class="px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 rounded-xl transition-colors">Annuler</button>
            <button @click="deleteProduit" class="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors">Supprimer</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

