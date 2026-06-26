<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useApiBase } from '@/composables/useApiBase'
import { useNotification } from '@/types/useNotification'
import { useFacturePDF } from '@/composables/useFacturePDF'

definePageMeta({ layout: 'default' })

const { getApiUrl, getAuthHeaders, parseApiList } = useApiBase()
const { success, error } = useNotification()
const { genererPDFFacture, genererPDFRecu } = useFacturePDF()

interface Facture {
  id: number
  numero: string
  date: string
  nom: string
  total: number
  verse: number
  reste: number
  status: string
  boutique_nom?: string
  created_by_username?: string
  type: string
}

const factures = ref<Facture[]>([])
const loading = ref(true)
const search = ref('')
const filterStatus = ref('')
const currentBoutique = ref<any>(null)

// Versement
const showVersementModal = ref(false)
const factureVersement = ref<Facture | null>(null)
const montantVersement = ref(0)
const versementLoading = ref(false)
const versementError = ref('')

// Auto-refresh
let timer: ReturnType<typeof setInterval> | null = null
const lastUpdated = ref<Date | null>(null)
const isRefreshing = ref(false)

const lastUpdatedLabel = computed(() => {
  if (!lastUpdated.value) return ''
  const diff = Math.floor((Date.now() - lastUpdated.value.getTime()) / 1000)
  if (diff < 5) return 'À l\'instant'
  if (diff < 60) return `Il y a ${diff}s`
  return `Il y a ${Math.floor(diff / 60)}min`
})

function getBoutique() {
  if (!process.client) return null
  try { return JSON.parse(localStorage.getItem('boutique') || 'null') } catch { return null }
}

async function loadFactures() {
  currentBoutique.value = getBoutique()
  if (!currentBoutique.value?.id) { loading.value = false; return }

  try {
    const params = new URLSearchParams({ type: 'partenaire', boutique: String(currentBoutique.value.id) })
    if (search.value) params.set('search', search.value)
    if (filterStatus.value) params.set('status', filterStatus.value)

    const raw = await $fetch(getApiUrl(`/api/factures/?${params}`), {
      headers: getAuthHeaders(), cache: 'no-store',
    })
    factures.value = parseApiList<Facture>(raw)
  } catch (e: any) {
    error(e?.data?.detail || 'Erreur chargement commandes partenaires')
  } finally {
    loading.value = false
  }
}

async function rafraichir() {
  isRefreshing.value = true
  await loadFactures()
  isRefreshing.value = false
  lastUpdated.value = new Date()
}

// KPIs
const totalCA = computed(() => factures.value.reduce((s, f) => s + f.total, 0))
const totalVerse = computed(() => factures.value.reduce((s, f) => s + f.verse, 0))
const totalReste = computed(() => factures.value.reduce((s, f) => s + f.reste, 0))
const nbImpayees = computed(() => factures.value.filter(f => f.reste > 0).length)

function statusColor(s: string) {
  if (s === 'Payé') return 'text-emerald-700 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400'
  if (s === 'Annulée') return 'text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400'
  return 'text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400'
}

function openVersement(f: Facture) {
  factureVersement.value = f
  montantVersement.value = 0
  versementError.value = ''
  showVersementModal.value = true
}

async function validerVersement() {
  if (!factureVersement.value) return
  if (montantVersement.value <= 0) { versementError.value = 'Montant invalide'; return }
  if (montantVersement.value > factureVersement.value.reste) { versementError.value = 'Dépasse le reste à payer'; return }
  versementLoading.value = true
  try {
    await $fetch(getApiUrl('/api/versements/'), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: { facture: factureVersement.value.id, montant: montantVersement.value, boutique: currentBoutique.value.id },
    })
    success(`Versement de ${montantVersement.value.toLocaleString('fr-FR')} FCFA enregistré`)
    await genererPDFRecu(factureVersement.value, { montant: montantVersement.value })
    showVersementModal.value = false
    await loadFactures()
  } catch (e: any) {
    versementError.value = e?.data?.detail || 'Erreur lors du versement'
  } finally {
    versementLoading.value = false
  }
}

async function telechargerFacture(f: Facture) {
  try {
    const raw = await $fetch(getApiUrl(`/api/commandes-partenaire/?facture=${f.id}`), { headers: getAuthHeaders() })
    const produits = parseApiList<any>(raw).map((c: any) => ({
      nom: c.produit_nom || '',
      reference: c.produit_reference || '',
      quantite: c.quantite,
      prix: c.prix_unitaire_fcfa,
    }))
    await genererPDFFacture(f, produits)
    success(`Facture ${f.numero} téléchargée`)
  } catch { error('Erreur lors du téléchargement') }
}

let searchTimer: ReturnType<typeof setTimeout> | null = null
function onSearch() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => loadFactures(), 350)
}

onMounted(() => {
  loadFactures()
  lastUpdated.value = new Date()
  timer = setInterval(rafraichir, 60_000)
})
onUnmounted(() => { if (timer) clearInterval(timer) })
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
  <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Commandes Partenaires</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Factures émises aux partenaires
          <span v-if="lastUpdatedLabel" class="ml-2 text-xs text-gray-400">· {{ lastUpdatedLabel }}</span>
        </p>
      </div>
      <button @click="rafraichir" :disabled="isRefreshing"
        class="inline-flex items-center gap-2 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50">
        <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" :class="{ 'animate-spin': isRefreshing }" />
        Rafraîchir
      </button>
    </div>

    <!-- KPIs -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <p class="text-xs text-gray-500 font-medium mb-1">CA Total</p>
        <p class="text-xl font-bold text-gray-900 dark:text-white">{{ totalCA.toLocaleString('fr-FR') }} <span class="text-sm font-normal text-gray-500">FCFA</span></p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <p class="text-xs text-gray-500 font-medium mb-1">Total versé</p>
        <p class="text-xl font-bold text-emerald-600">{{ totalVerse.toLocaleString('fr-FR') }} <span class="text-sm font-normal text-gray-500">FCFA</span></p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <p class="text-xs text-gray-500 font-medium mb-1">Reste à percevoir</p>
        <p class="text-xl font-bold" :class="totalReste > 0 ? 'text-red-600' : 'text-emerald-600'">{{ totalReste.toLocaleString('fr-FR') }} <span class="text-sm font-normal text-gray-500">FCFA</span></p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <p class="text-xs text-gray-500 font-medium mb-1">Impayées</p>
        <p class="text-xl font-bold" :class="nbImpayees > 0 ? 'text-amber-600' : 'text-emerald-600'">{{ nbImpayees }}</p>
      </div>
    </div>

    <!-- Filtres -->
    <div class="flex flex-wrap gap-3">
      <input v-model="search" @input="onSearch" type="search" placeholder="Rechercher partenaire, N°..."
        class="px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none w-60" />
      <select v-model="filterStatus" @change="loadFactures"
        class="px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none">
        <option value="">Tous les statuts</option>
        <option value="En attente">En attente</option>
        <option value="Partiellement payé">Partiellement payé</option>
        <option value="Payé">Payé</option>
        <option value="Annulée">Annulée</option>
      </select>
    </div>

    <!-- Table -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div v-if="loading" class="flex justify-center py-12">
        <div class="w-8 h-8 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-100 dark:divide-gray-700 text-sm">
          <thead class="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">N° Facture</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Partenaire</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Versé</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Reste</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50 dark:divide-gray-700/50">
            <tr v-for="f in factures" :key="f.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
              <td class="px-4 py-3 font-mono text-xs text-gray-700 dark:text-gray-300">{{ f.numero }}</td>
              <td class="px-4 py-3 font-medium text-gray-900 dark:text-white">{{ f.nom }}</td>
              <td class="px-4 py-3 text-gray-500 text-xs">{{ new Date(f.date).toLocaleDateString('fr-FR') }}</td>
              <td class="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">{{ f.total.toLocaleString('fr-FR') }}</td>
              <td class="px-4 py-3 text-right text-emerald-600 font-medium">{{ f.verse.toLocaleString('fr-FR') }}</td>
              <td class="px-4 py-3 text-right font-semibold" :class="f.reste > 0 ? 'text-red-600' : 'text-emerald-600'">{{ f.reste.toLocaleString('fr-FR') }}</td>
              <td class="px-4 py-3">
                <span class="text-xs font-semibold px-2 py-0.5 rounded-full" :class="statusColor(f.status)">{{ f.status }}</span>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-1">
                  <button v-if="f.reste > 0" @click="openVersement(f)"
                    class="inline-flex items-center gap-1 px-2 py-1 text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700 rounded hover:bg-emerald-100 transition-colors">
                    <UIcon name="i-heroicons-banknotes" class="w-3.5 h-3.5" /> Versement
                  </button>
                  <button @click="telechargerFacture(f)"
                    class="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-100 transition-colors">
                    <UIcon name="i-heroicons-arrow-down-tray" class="w-3.5 h-3.5" /> PDF
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!loading && factures.length === 0">
              <td colspan="8" class="px-4 py-12 text-center text-gray-400">
                <UIcon name="i-heroicons-truck" class="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>Aucune commande partenaire trouvée</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </section>

  <!-- Modal versement -->
  <div v-if="showVersementModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div class="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
      <div class="bg-emerald-500 px-6 py-4 flex items-center justify-between">
        <h3 class="text-white font-bold">Versement — {{ factureVersement?.numero }}</h3>
        <button @click="showVersementModal = false" class="text-white/70 hover:text-white">
          <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
        </button>
      </div>
      <div class="p-6 space-y-4">
        <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-sm">
          <div class="flex justify-between"><span class="text-gray-500">Partenaire</span><span class="font-semibold">{{ factureVersement?.nom }}</span></div>
          <div class="flex justify-between mt-1"><span class="text-gray-500">Total</span><span class="font-semibold">{{ factureVersement?.total.toLocaleString('fr-FR') }} FCFA</span></div>
          <div class="flex justify-between mt-1"><span class="text-gray-500">Reste à payer</span><span class="font-bold text-red-600">{{ factureVersement?.reste.toLocaleString('fr-FR') }} FCFA</span></div>
        </div>
        <div>
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Montant à verser (FCFA)</label>
          <input v-model.number="montantVersement" type="number" :max="factureVersement?.reste" min="1"
            class="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-400 outline-none" />
        </div>
        <p v-if="versementError" class="text-xs text-red-600">{{ versementError }}</p>
        <button @click="validerVersement" :disabled="versementLoading"
          class="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
          <UIcon v-if="versementLoading" name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin" />
          {{ versementLoading ? 'Enregistrement...' : 'Valider le versement' }}
        </button>
      </div>
    </div>
  </div>

  </div>
</template>
