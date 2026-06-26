<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useApiBase } from '@/composables/useApiBase'
import { useNotification } from '@/types/useNotification'

definePageMeta({ layout: 'default' })

const { getApiUrl, getAuthHeaders } = useApiBase()
const { error } = useNotification()

async function apiFetch(path: string, opts: any = {}) {
  return $fetch(getApiUrl(path), { headers: getAuthHeaders(), ...opts })
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface JournalEntry {
  id: number
  utilisateur_nom: string
  boutique_nom: string
  type_operation: string
  description: string
  details?: any
  date_operation: string
  ip_address?: string
}

// ── State ─────────────────────────────────────────────────────────────────────
const entries = ref<JournalEntry[]>([])
const boutiques = ref<any[]>([])
const utilisateurs = ref<any[]>([])
const loading = ref(true)
const isRefreshing = ref(false)
const totalItems = ref(0)
const totalPages = ref(1)
const currentPage = ref(1)
const lastUpdated = ref<Date | null>(null)
let refreshTimer: ReturnType<typeof setInterval> | null = null

// ── Filtres ───────────────────────────────────────────────────────────────────
const filterBoutique = ref('')
const filterType = ref('')
const filterUser = ref('')
const filterDateDebut = ref('')
const filterDateFin = ref('')
const filterSearch = ref('')

const typesOperation = [
  { value: 'creation', label: 'Création', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  { value: 'modification', label: 'Modification', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  { value: 'suppression', label: 'Suppression', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  { value: 'connexion', label: 'Connexion', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' },
  { value: 'deconnexion', label: 'Déconnexion', color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' },
  { value: 'vente', label: 'Vente', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  { value: 'achat', label: 'Achat', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  { value: 'retour', label: 'Retour', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  { value: 'inventaire', label: 'Inventaire', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' },
  { value: 'transfert', label: 'Transfert', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
]
const typeMap = computed(() => Object.fromEntries(typesOperation.map(t => [t.value, t])))

const lastUpdatedLabel = computed(() => {
  if (!lastUpdated.value) return ''
  const diff = Math.floor((Date.now() - lastUpdated.value.getTime()) / 1000)
  if (diff < 5) return 'À l\'instant'
  if (diff < 60) return `Il y a ${diff}s`
  return `Il y a ${Math.floor(diff / 60)}min`
})

// ── Load ──────────────────────────────────────────────────────────────────────
async function load(page = 1) {
  if (page === currentPage.value) loading.value = true
  else isRefreshing.value = true
  try {
    const qs = new URLSearchParams({ page: String(page), page_size: '15' })
    if (filterBoutique.value) qs.set('boutique', filterBoutique.value)
    if (filterType.value) qs.set('type_operation', filterType.value)
    if (filterUser.value) qs.set('utilisateur', filterUser.value)
    if (filterDateDebut.value) qs.set('date_debut', filterDateDebut.value)
    if (filterDateFin.value) qs.set('date_fin', filterDateFin.value)
    if (filterSearch.value) qs.set('search', filterSearch.value)

    const res: any = await apiFetch(`/api/journaux/?${qs}`)
    entries.value = res.results ?? (Array.isArray(res) ? res : [])
    totalItems.value = res.count ?? entries.value.length
    totalPages.value = res.total_pages ?? (Math.ceil(totalItems.value / 15) || 1)
    currentPage.value = page
    lastUpdated.value = new Date()
  } catch {
    error('Erreur lors du chargement du journal')
  } finally {
    loading.value = false
    isRefreshing.value = false
  }
}

async function loadMeta() {
  try {
    const [bRes, uRes]: any[] = await Promise.all([
      apiFetch('/api/boutiques/'),
      apiFetch('/api/users/'),
    ])
    boutiques.value = bRes.results ?? (Array.isArray(bRes) ? bRes : [])
    utilisateurs.value = uRes.results ?? (Array.isArray(uRes) ? uRes : [])
  } catch {}
}

onMounted(async () => {
  await Promise.all([load(), loadMeta()])
  refreshTimer = setInterval(() => load(currentPage.value), 60_000)
})
onUnmounted(() => { if (refreshTimer) clearInterval(refreshTimer) })

watch([filterBoutique, filterType, filterUser, filterDateDebut, filterDateFin], () => {
  currentPage.value = 1
  load(1)
})

function resetFilters() {
  filterBoutique.value = ''
  filterType.value = ''
  filterUser.value = ''
  filterDateDebut.value = ''
  filterDateFin.value = ''
  filterSearch.value = ''
  load(1)
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtDate(d: string) {
  if (!d) return '—'
  const dt = new Date(d)
  return dt.toLocaleDateString('fr-FR') + ' ' + dt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function typeInfo(type: string) {
  return typeMap.value[type] ?? { label: type, color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' }
}

function avatarColor(name: string) {
  const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-violet-500', 'bg-rose-500', 'bg-amber-500', 'bg-cyan-500']
  return colors[(name?.charCodeAt(0) || 0) % colors.length]
}

let searchTimer: any
function onSearch() { clearTimeout(searchTimer); searchTimer = setTimeout(() => load(1), 400) }

// ── Modal ─────────────────────────────────────────────────────────────────────
const showDetail = ref(false)
const selectedEntry = ref<JournalEntry | null>(null)
function openDetail(e: JournalEntry) { selectedEntry.value = e; showDetail.value = true }

// ── Export ────────────────────────────────────────────────────────────────────
function exportCSV() {
  const rows = [
    ['Date', 'Utilisateur', 'Entrepôt', 'Type', 'Description'],
    ...entries.value.map(e => [fmtDate(e.date_operation), e.utilisateur_nom || '—', e.boutique_nom || '—', typeInfo(e.type_operation).label, e.description || '—'])
  ]
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = `journal_${new Date().toISOString().slice(0, 10)}.csv`; a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Journal des opérations</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-2">
            Traçabilité complète de toutes les actions
            <span v-if="lastUpdatedLabel" class="inline-flex items-center gap-1 text-xs text-gray-400">
              <svg class="w-3 h-3" :class="isRefreshing ? 'animate-spin' : ''" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
              {{ lastUpdatedLabel }}
            </span>
          </p>
        </div>
        <div class="flex items-center gap-2">
          <button @click="exportCSV"
            class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:border-emerald-400 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            Exporter
          </button>
          <button @click="load(currentPage)" :disabled="isRefreshing"
            class="p-2 text-gray-400 hover:text-emerald-600 transition-colors disabled:opacity-50">
            <svg class="w-5 h-5" :class="isRefreshing ? 'animate-spin' : ''" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          </button>
        </div>
      </div>

      <!-- Filtres rapides (chips de type) -->
      <div class="flex flex-wrap gap-2">
        <button
          @click="filterType = ''; load(1)"
          class="px-3 py-1.5 text-xs font-semibold rounded-full transition-colors"
          :class="!filterType ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-emerald-400'"
        >
          Tous
        </button>
        <button
          v-for="t in typesOperation"
          :key="t.value"
          @click="filterType = filterType === t.value ? '' : t.value; load(1)"
          class="px-3 py-1.5 text-xs font-semibold rounded-full transition-colors"
          :class="filterType === t.value ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-emerald-400'"
        >
          {{ t.label }}
        </button>
      </div>

      <!-- Journal principal -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">

        <!-- Barre de filtres avancés -->
        <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex flex-wrap items-center gap-3">
          <div class="relative flex-1 min-w-[200px]">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input v-model="filterSearch" @input="onSearch" type="search" placeholder="Rechercher..."
              class="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400" />
          </div>
          <select v-model="filterBoutique"
            class="px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400">
            <option value="">Tous les entrepôts</option>
            <option v-for="b in boutiques" :key="b.id" :value="b.id">{{ b.nom }}</option>
          </select>
          <div class="flex items-center gap-2">
            <input v-model="filterDateDebut" type="date"
              class="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400" />
            <span class="text-xs text-gray-400">—</span>
            <input v-model="filterDateFin" type="date"
              class="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400" />
          </div>
          <button
            v-if="filterBoutique || filterDateDebut || filterDateFin || filterSearch"
            @click="resetFilters"
            class="text-xs text-red-500 hover:text-red-700 font-medium px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            Effacer
          </button>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex justify-center py-16">
          <div class="w-8 h-8 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
        </div>

        <!-- Vide -->
        <div v-else-if="entries.length === 0" class="flex flex-col items-center justify-center py-16 text-gray-400">
          <svg class="w-12 h-12 mb-3" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
          <p class="font-medium">Aucune entrée dans le journal</p>
        </div>

        <!-- Feed timeline -->
        <div v-else class="divide-y divide-gray-50 dark:divide-gray-700/50">
          <div
            v-for="entry in entries"
            :key="entry.id"
            class="flex items-start gap-4 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer group"
            @click="openDetail(entry)"
          >
            <!-- Avatar -->
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5"
              :class="avatarColor(entry.utilisateur_nom)">
              {{ entry.utilisateur_nom?.charAt(0)?.toUpperCase() || '?' }}
            </div>

            <!-- Contenu -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-semibold text-sm text-gray-900 dark:text-white">{{ entry.utilisateur_nom || 'Système' }}</span>
                <span class="text-xs px-2 py-0.5 rounded-full font-semibold" :class="typeInfo(entry.type_operation).color">
                  {{ typeInfo(entry.type_operation).label }}
                </span>
                <span v-if="entry.boutique_nom" class="text-xs text-gray-400">· {{ entry.boutique_nom }}</span>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{{ entry.description || '—' }}</p>
            </div>

            <!-- Heure -->
            <div class="flex items-center gap-1 flex-shrink-0">
              <span class="text-xs text-gray-400 whitespace-nowrap">{{ fmtDate(entry.date_operation) }}</span>
              <svg class="w-3.5 h-3.5 text-gray-300 group-hover:text-emerald-500 transition-colors" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-sm text-gray-500">
          <span>{{ totalItems.toLocaleString() }} entrées · Page {{ currentPage }} / {{ totalPages }}</span>
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
    </div>
  </div>

  <!-- ── Modal détail ────────────────────────────────────────────────────── -->
  <Teleport to="body">
    <div v-if="showDetail && selectedEntry" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" @click.self="showDetail = false">
      <div class="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        <div class="px-6 py-4 bg-emerald-500 flex items-center justify-between flex-shrink-0">
          <div>
            <span class="text-white font-bold">{{ typeInfo(selectedEntry.type_operation).label }}</span>
            <p class="text-emerald-100 text-sm">{{ fmtDate(selectedEntry.date_operation) }}</p>
          </div>
          <button @click="showDetail = false" class="text-white/70 hover:text-white">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="p-6 overflow-y-auto space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
              <p class="text-xs text-gray-400 uppercase mb-1">Utilisateur</p>
              <p class="font-semibold text-sm text-gray-900 dark:text-white">{{ selectedEntry.utilisateur_nom || '—' }}</p>
            </div>
            <div class="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
              <p class="text-xs text-gray-400 uppercase mb-1">Entrepôt</p>
              <p class="font-semibold text-sm text-gray-900 dark:text-white">{{ selectedEntry.boutique_nom || '—' }}</p>
            </div>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
            <p class="text-xs text-gray-400 uppercase mb-2">Description</p>
            <p class="text-sm text-gray-700 dark:text-gray-300">{{ selectedEntry.description || '—' }}</p>
          </div>
          <div v-if="selectedEntry.details && Object.keys(selectedEntry.details || {}).length" class="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
            <p class="text-xs text-gray-400 uppercase mb-2">Détails</p>
            <div class="space-y-1">
              <div v-for="(val, key) in selectedEntry.details" :key="key" class="flex items-start gap-2 text-xs">
                <span class="text-gray-400 font-mono min-w-[80px]">{{ key }}</span>
                <span class="text-gray-700 dark:text-gray-300 break-all">{{ val }}</span>
              </div>
            </div>
          </div>
          <div v-if="selectedEntry.ip_address" class="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
            <p class="text-xs text-gray-400 uppercase mb-1">IP</p>
            <p class="text-sm font-mono text-gray-600 dark:text-gray-400">{{ selectedEntry.ip_address }}</p>
          </div>
        </div>
        <div class="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-end flex-shrink-0">
          <button @click="showDetail = false" class="px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 rounded-xl transition-colors">Fermer</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
