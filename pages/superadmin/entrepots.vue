<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useApiBase } from '@/composables/useApiBase'
import { useNotification } from '@/types/useNotification'
import CreateBoutiqueModal from '@/components/superadmin/CreateBoutiqueModal.vue'
import EditBoutiqueModal from '@/components/superadmin/EditBoutiqueModal.vue'

definePageMeta({ layout: 'superadmin' })

const { getApiUrl, getAuthHeaders } = useApiBase()
const { error, success } = useNotification()

async function apiFetch(path: string, opts: any = {}) {
  return $fetch(getApiUrl(path), { headers: getAuthHeaders(), ...opts })
}

// ── Data ──────────────────────────────────────────────────────────────────────
const boutiques = ref<any[]>([])
const loading = ref(true)
const searchQuery = ref('')
const villeFilter = ref('')
const totalPages = ref(1)
const currentPage = ref(1)

// ── Modals ────────────────────────────────────────────────────────────────────
const showCreate = ref(false)
const showEdit = ref(false)
const showDeleteConfirm = ref(false)
const selected = ref<any>(null)

// ── Stats ─────────────────────────────────────────────────────────────────────
const villes = computed(() => [...new Set(boutiques.value.map(b => b.ville).filter(Boolean))].sort())
const stats = computed(() => ({
  total: boutiques.value.length,
  villes: villes.value.length,
  avecResponsable: boutiques.value.filter(b => b.responsable).length,
  produits: boutiques.value.reduce((s, b) => s + (b.produits?.length || 0), 0),
}))

const filtered = computed(() => {
  let list = boutiques.value
  if (villeFilter.value) list = list.filter(b => b.ville === villeFilter.value)
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(b =>
      b.nom?.toLowerCase().includes(q) ||
      b.ville?.toLowerCase().includes(q) ||
      b.responsable?.toLowerCase().includes(q)
    )
  }
  return list
})

// ── Load ──────────────────────────────────────────────────────────────────────
async function load(page = 1) {
  loading.value = true
  try {
    const res: any = await apiFetch(`/api/boutiques/?page=${page}`)
    boutiques.value = res.results ?? (Array.isArray(res) ? res : [])
    totalPages.value = res.total_pages ?? 1
    currentPage.value = page
  } catch {
    error('Impossible de charger les entrepôts')
  } finally {
    loading.value = false
  }
}

onMounted(() => load())

// ── Actions ───────────────────────────────────────────────────────────────────
function openEdit(b: any) { selected.value = b; showEdit.value = true }
function openDelete(b: any) { selected.value = b; showDeleteConfirm.value = true }

async function deleteBoutique() {
  try {
    await apiFetch(`/api/boutiques/${selected.value.id}/`, { method: 'DELETE' })
    success('Entrepôt supprimé')
    showDeleteConfirm.value = false
    await load(currentPage.value)
  } catch {
    error('Erreur lors de la suppression')
  }
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
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Entrepôts</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Gérez les entrepôts de votre entreprise</p>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="showCreate = true"
            class="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
            Nouvel entrepôt
          </button>
          <button @click="load(currentPage)" :disabled="loading" class="p-2 text-gray-400 hover:text-emerald-600 transition-colors disabled:opacity-50">
            <svg class="w-5 h-5" :class="loading ? 'animate-spin' : ''" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- KPIs -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Total</p>
          <p class="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">{{ stats.total }}</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Villes</p>
          <p class="text-3xl font-extrabold text-violet-600 mt-1">{{ stats.villes }}</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Avec responsable</p>
          <p class="text-3xl font-extrabold text-blue-600 mt-1">{{ stats.avecResponsable }}</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Produits total</p>
          <p class="text-3xl font-extrabold text-emerald-600 mt-1">{{ stats.produits }}</p>
        </div>
      </div>

      <!-- Tableau -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <!-- Filtres -->
        <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex flex-wrap items-center gap-3">
          <div class="relative flex-1 min-w-[200px]">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input v-model="searchQuery" @input="onSearch" type="search" placeholder="Rechercher par nom, ville, responsable..."
              class="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400" />
          </div>
          <select v-model="villeFilter" @change="load(1)"
            class="px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400">
            <option value="">Toutes les villes</option>
            <option v-for="v in villes" :key="v" :value="v">{{ v }}</option>
          </select>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex justify-center py-16">
          <div class="w-8 h-8 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
        </div>

        <!-- Empty -->
        <div v-else-if="filtered.length === 0" class="flex flex-col items-center justify-center py-16 text-gray-400">
          <svg class="w-12 h-12 mb-3" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
          <p class="font-medium">Aucun entrepôt trouvé</p>
        </div>

        <!-- Cards -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
          <div
            v-for="b in filtered"
            :key="b.id"
            class="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl p-5 hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-md transition-all group"
          >
            <!-- Entête card -->
            <div class="flex items-start justify-between mb-4">
              <div class="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
              </div>
              <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button @click="openEdit(b)" title="Modifier"
                  class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                </button>
                <button @click="openDelete(b)" title="Supprimer"
                  class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
            </div>

            <h3 class="font-bold text-gray-900 dark:text-white text-base mb-1">{{ b.nom }}</h3>
            <div class="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mb-3">
              <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              {{ b.ville || '—' }}
            </div>

            <div class="space-y-1.5 text-sm">
              <div v-if="b.responsable" class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <svg class="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                {{ b.responsable }}
              </div>
              <div v-if="b.telephone" class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <svg class="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                {{ b.telephone }}
              </div>
              <div v-if="b.adresse" class="flex items-center gap-2 text-gray-500 dark:text-gray-500 text-xs">
                <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                {{ b.adresse }}
              </div>
            </div>

            <!-- Bouton accès direct -->
            <div class="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
              <button
                @click="openEdit(b)"
                class="w-full text-sm text-emerald-600 dark:text-emerald-400 font-medium hover:underline text-center"
              >
                Gérer l'entrepôt →
              </button>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-sm text-gray-500">
          <span>Page {{ currentPage }} / {{ totalPages }}</span>
          <div class="flex gap-2">
            <button @click="load(currentPage - 1)" :disabled="currentPage <= 1"
              class="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-40 hover:border-emerald-400 transition-colors">← Précédent</button>
            <button @click="load(currentPage + 1)" :disabled="currentPage >= totalPages"
              class="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-40 hover:border-emerald-400 transition-colors">Suivant →</button>
          </div>
        </div>
      </div>
    </section>

    <!-- Modals existants -->
    <CreateBoutiqueModal :isOpen="showCreate" @close="showCreate = false" @created="load(1)" />
    <EditBoutiqueModal :isOpen="showEdit" :boutique="selected" @close="showEdit = false" @updated="load(currentPage)" />

    <!-- Confirm suppression -->
    <Teleport to="body">
      <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" @click.self="showDeleteConfirm = false">
        <div class="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-2xl p-6">
          <div class="flex items-center gap-4 mb-5">
            <div class="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            </div>
            <div>
              <h3 class="font-bold text-gray-900 dark:text-white">Supprimer l'entrepôt ?</h3>
              <p class="text-sm text-gray-500 mt-1">{{ selected?.nom }} sera définitivement supprimé.</p>
            </div>
          </div>
          <div class="flex gap-3 justify-end">
            <button @click="showDeleteConfirm = false" class="px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 rounded-xl transition-colors">Annuler</button>
            <button @click="deleteBoutique" class="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors">Supprimer</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
