<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useApiBase } from '@/composables/useApiBase'
import { useNotification } from '@/types/useNotification'

definePageMeta({ layout: 'superadmin' })

const { getApiUrl, getAuthHeaders } = useApiBase()
const { success, error } = useNotification()

async function apiFetch(path: string, opts: any = {}) {
  return $fetch(getApiUrl(path), { headers: getAuthHeaders(), ...opts })
}

// ── Données ──────────────────────────────────────────────────────────────────
const factures = ref<any[]>([])
const clients = ref<any[]>([])
const boutiques = ref<any[]>([])
const loading = ref(true)
const totalPages = ref(1)
const currentPage = ref(1)
const searchQuery = ref('')
const statusFilter = ref('')

// ── Modals ───────────────────────────────────────────────────────────────────
const showViewModal = ref(false)
const showDeleteConfirm = ref(false)
const selectedFacture = ref<any>(null)

// ── Stats ─────────────────────────────────────────────────────────────────────
const stats = computed(() => {
  const total = factures.value.length
  const ca = factures.value.reduce((s, f) => s + (parseFloat(f.total) || 0), 0)
  const payees = factures.value.filter(f => f.status === 'Payé').length
  const enAttente = factures.value.filter(f => f.status === 'En attente').length
  const reste = factures.value.reduce((s, f) => s + (parseFloat(f.reste) || 0), 0)
  return { total, ca, payees, enAttente, reste }
})

// ── Filtres ───────────────────────────────────────────────────────────────────
const filteredFactures = computed(() => {
  let list = factures.value
  if (statusFilter.value) list = list.filter(f => f.status === statusFilter.value)
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(f =>
      f.nom_facture?.toLowerCase().includes(q) ||
      f.client?.nom?.toLowerCase().includes(q) ||
      f.boutique?.nom?.toLowerCase().includes(q)
    )
  }
  return list
})

// ── Chargement ────────────────────────────────────────────────────────────────
async function load(page = 1) {
  loading.value = true
  try {
    const qs = new URLSearchParams({ page: String(page) })
    if (statusFilter.value) qs.set('status', statusFilter.value)
    if (searchQuery.value) qs.set('search', searchQuery.value)
    const res: any = await apiFetch(`/api/factures/?${qs}`)
    factures.value = res.results ?? res ?? []
    totalPages.value = res.total_pages ?? 1
    currentPage.value = page
  } catch {
    error('Erreur lors du chargement des factures')
  } finally {
    loading.value = false
  }
}

onMounted(() => load())

// ── Actions ───────────────────────────────────────────────────────────────────
function viewFacture(f: any) {
  selectedFacture.value = f
  showViewModal.value = true
}

function confirmDelete(f: any) {
  selectedFacture.value = f
  showDeleteConfirm.value = true
}

async function deleteFacture() {
  try {
    await apiFetch(`/api/factures/${selectedFacture.value.id}/`, { method: 'DELETE' })
    success('Facture supprimée')
    showDeleteConfirm.value = false
    await load(currentPage.value)
  } catch {
    error('Erreur lors de la suppression')
  }
}

// ── Utilitaires ───────────────────────────────────────────────────────────────
function fmt(n: any) { return Number(n || 0).toLocaleString('fr-FR') }
function fmtDate(d: string) { return d ? new Date(d).toLocaleDateString('fr-FR') : '—' }

function statusClass(s: string) {
  if (s === 'Payé') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
  if (s === 'Partiellement payé') return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
  if (s === 'En attente') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
  return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
}

let searchTimer: any
function onSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => load(1), 400)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

      <!-- Header -->
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Factures</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Suivi des factures de l'entreprise</p>
        </div>
        <div class="flex items-center gap-2">
          <NuxtLink
            to="/listes-factures"
            class="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
            Nouvelle facture
          </NuxtLink>
          <button @click="load(currentPage)" :disabled="loading"
            class="p-2 text-gray-400 hover:text-emerald-600 transition-colors disabled:opacity-50">
            <svg class="w-5 h-5" :class="loading ? 'animate-spin' : ''" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- KPIs -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total</p>
          <p class="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">{{ stats.total }}</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Chiffre d'affaires</p>
          <p class="text-2xl font-extrabold text-emerald-600 mt-1">{{ fmt(stats.ca) }} <span class="text-sm font-medium text-gray-500">FCFA</span></p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Payées</p>
          <p class="text-3xl font-extrabold text-emerald-600 mt-1">{{ stats.payees }}</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Reste à encaisser</p>
          <p class="text-2xl font-extrabold text-amber-600 mt-1">{{ fmt(stats.reste) }} <span class="text-sm font-medium text-gray-500">FCFA</span></p>
        </div>
      </div>

      <!-- Filtres + tableau -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <!-- Barre de filtres -->
        <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex flex-wrap items-center gap-3">
          <div class="relative flex-1 min-w-[200px]">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              v-model="searchQuery"
              @input="onSearch"
              type="search"
              placeholder="Rechercher par nom, client, entrepôt..."
              class="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
          <select
            v-model="statusFilter"
            @change="load(1)"
            class="px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            <option value="">Tous les statuts</option>
            <option value="Payé">Payé</option>
            <option value="Partiellement payé">Partiellement payé</option>
            <option value="En attente">En attente</option>
          </select>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex justify-center py-16">
          <div class="w-8 h-8 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
        </div>

        <!-- Empty -->
        <div v-else-if="filteredFactures.length === 0" class="flex flex-col items-center justify-center py-16 text-gray-400">
          <svg class="w-12 h-12 mb-3" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          <p class="font-medium">Aucune facture trouvée</p>
          <p class="text-sm mt-1">Modifiez les filtres ou créez une nouvelle facture</p>
        </div>

        <!-- Tableau -->
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-100 dark:divide-gray-700 text-sm">
            <thead class="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th class="px-5 py-3 text-left font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide text-xs">Facture</th>
                <th class="px-5 py-3 text-left font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide text-xs">Client</th>
                <th class="px-5 py-3 text-left font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide text-xs">Entrepôt</th>
                <th class="px-5 py-3 text-left font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide text-xs">Date</th>
                <th class="px-5 py-3 text-right font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide text-xs">Total</th>
                <th class="px-5 py-3 text-right font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide text-xs">Reste</th>
                <th class="px-5 py-3 text-left font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide text-xs">Statut</th>
                <th class="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50 dark:divide-gray-700/50">
              <tr
                v-for="f in filteredFactures"
                :key="f.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
              >
                <td class="px-5 py-3">
                  <div class="font-semibold text-gray-900 dark:text-white">{{ f.nom_facture || `#${f.id}` }}</div>
                  <div class="text-xs text-gray-400">{{ f.items?.length || 0 }} article(s)</div>
                </td>
                <td class="px-5 py-3 text-gray-600 dark:text-gray-400">{{ f.client?.nom || '—' }}</td>
                <td class="px-5 py-3 text-gray-600 dark:text-gray-400">{{ f.boutique?.nom || '—' }}</td>
                <td class="px-5 py-3 text-gray-500 dark:text-gray-400">{{ fmtDate(f.date_facture) }}</td>
                <td class="px-5 py-3 text-right font-semibold text-gray-900 dark:text-white">{{ fmt(f.total) }} FCFA</td>
                <td class="px-5 py-3 text-right">
                  <span :class="parseFloat(f.reste) > 0 ? 'text-amber-600 font-semibold' : 'text-emerald-600'">
                    {{ fmt(f.reste) }} FCFA
                  </span>
                </td>
                <td class="px-5 py-3">
                  <span class="text-xs font-semibold px-2.5 py-1 rounded-full" :class="statusClass(f.status)">
                    {{ f.status || 'En attente' }}
                  </span>
                </td>
                <td class="px-5 py-3">
                  <div class="flex items-center justify-end gap-1">
                    <button
                      @click="viewFacture(f)"
                      class="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                      title="Voir détails"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    </button>
                    <NuxtLink
                      :to="`/listes-factures?id=${f.id}`"
                      class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    </NuxtLink>
                    <button
                      @click="confirmDelete(f)"
                      class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Supprimer"
                    >
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
          <span>Page {{ currentPage }} sur {{ totalPages }}</span>
          <div class="flex gap-2">
            <button @click="load(currentPage - 1)" :disabled="currentPage <= 1"
              class="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-40 hover:border-emerald-400 transition-colors">
              ← Précédent
            </button>
            <button @click="load(currentPage + 1)" :disabled="currentPage >= totalPages"
              class="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-40 hover:border-emerald-400 transition-colors">
              Suivant →
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Modal Voir facture ─────────────────────────────────────────────── -->
    <Teleport to="body">
      <div v-if="showViewModal && selectedFacture" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" @click.self="showViewModal = false">
        <div class="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
          <!-- Header -->
          <div class="bg-emerald-500 px-6 py-4 flex items-center justify-between flex-shrink-0">
            <div>
              <h3 class="text-white font-bold text-lg">{{ selectedFacture.nom_facture || `Facture #${selectedFacture.id}` }}</h3>
              <p class="text-emerald-100 text-sm">{{ fmtDate(selectedFacture.date_facture) }}</p>
            </div>
            <button @click="showViewModal = false" class="text-white/70 hover:text-white p-1">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 overflow-y-auto space-y-5">
            <!-- Infos principales -->
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div class="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <p class="text-gray-400 text-xs uppercase tracking-wide mb-1">Client</p>
                <p class="font-semibold text-gray-900 dark:text-white">{{ selectedFacture.client?.nom || '—' }}</p>
              </div>
              <div class="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <p class="text-gray-400 text-xs uppercase tracking-wide mb-1">Entrepôt</p>
                <p class="font-semibold text-gray-900 dark:text-white">{{ selectedFacture.boutique?.nom || '—' }}</p>
              </div>
              <div class="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <p class="text-gray-400 text-xs uppercase tracking-wide mb-1">Total</p>
                <p class="font-bold text-xl text-emerald-600">{{ fmt(selectedFacture.total) }} FCFA</p>
              </div>
              <div class="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <p class="text-gray-400 text-xs uppercase tracking-wide mb-1">Reste à payer</p>
                <p class="font-bold text-xl" :class="parseFloat(selectedFacture.reste) > 0 ? 'text-amber-600' : 'text-emerald-600'">
                  {{ fmt(selectedFacture.reste) }} FCFA
                </p>
              </div>
            </div>

            <!-- Statut -->
            <div class="flex items-center gap-3">
              <span class="text-sm font-medium text-gray-500">Statut :</span>
              <span class="text-sm font-bold px-3 py-1 rounded-full" :class="statusClass(selectedFacture.status)">
                {{ selectedFacture.status || 'En attente' }}
              </span>
            </div>

            <!-- Articles -->
            <div v-if="selectedFacture.items?.length">
              <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Articles ({{ selectedFacture.items.length }})</h4>
              <div class="space-y-2">
                <div
                  v-for="item in selectedFacture.items"
                  :key="item.id"
                  class="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg px-4 py-3 text-sm"
                >
                  <span class="font-medium text-gray-900 dark:text-white">{{ item.produit?.nom || item.nom_produit || '—' }}</span>
                  <div class="flex items-center gap-4 text-gray-500">
                    <span>x{{ item.quantite }}</span>
                    <span class="font-semibold text-gray-900 dark:text-white">{{ fmt((item.prix_unitaire || 0) * (item.quantite || 0)) }} FCFA</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Versements -->
            <div v-if="selectedFacture.versements?.length">
              <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Versements reçus</h4>
              <div class="space-y-2">
                <div
                  v-for="v in selectedFacture.versements"
                  :key="v.id"
                  class="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 rounded-lg px-4 py-3 text-sm"
                >
                  <span class="text-gray-600 dark:text-gray-400">{{ fmtDate(v.date_versement) }}</span>
                  <span class="font-semibold text-emerald-600">+{{ fmt(v.montant) }} FCFA</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 flex-shrink-0">
            <button @click="showViewModal = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors">
              Fermer
            </button>
            <NuxtLink
              :to="`/listes-factures?id=${selectedFacture.id}`"
              class="px-4 py-2 text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors"
              @click="showViewModal = false"
            >
              Modifier la facture →
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- ── Confirm suppression ────────────────────────────────────────── -->
      <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" @click.self="showDeleteConfirm = false">
        <div class="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-2xl p-6">
          <div class="flex items-center gap-4 mb-4">
            <div class="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            </div>
            <div>
              <h3 class="font-bold text-gray-900 dark:text-white">Supprimer la facture ?</h3>
              <p class="text-sm text-gray-500 mt-1">{{ selectedFacture?.nom_facture }} — Cette action est irréversible.</p>
            </div>
          </div>
          <div class="flex gap-3 justify-end">
            <button @click="showDeleteConfirm = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 rounded-xl transition-colors">
              Annuler
            </button>
            <button @click="deleteFacture"
              class="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors">
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
