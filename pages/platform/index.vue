<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useApiBase } from '@/composables/useApiBase'

definePageMeta({ layout: 'superadmin' })

const { getApiUrl, getAuthHeaders } = useApiBase()

const loading = ref(true)
const stats = ref<any>(null)
const entreprises = ref<any[]>([])
const totalPages = ref(1)
const currentPage = ref(1)
const search = ref('')

// Modal modification abonnement
const showModal = ref(false)
const selectedEntreprise = ref<any>(null)
const form = ref({ plan_name: 'starter', status: 'active', days: 30, notes: '' })
const saving = ref(false)
const saveSuccess = ref(false)
const saveError = ref('')

const PLANS = ['free', 'starter', 'business', 'pro', 'organisation']

const apiFetch = async <T = any>(endpoint: string, options: Record<string, unknown> = {}): Promise<T> => {
  return $fetch<T>(getApiUrl(endpoint), {
    headers: getAuthHeaders(),
    cache: 'no-store',
    ...options,
  })
}

async function loadStats() {
  try {
    stats.value = await apiFetch('/api/platform/stats/')
  } catch (e) {
    console.error('Stats plateforme', e)
  }
}

async function loadEntreprises(page = 1) {
  loading.value = true
  try {
    const params = new URLSearchParams({ page: String(page) })
    if (search.value) params.set('search', search.value)
    const res = await apiFetch<any>(`/api/platform/entreprises/?${params}`)
    entreprises.value = res.results || res
    totalPages.value = res.total_pages || 1
    currentPage.value = page
  } catch (e) {
    console.error('Entreprises plateforme', e)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadStats(), loadEntreprises()])
})

function statusColor(s: string) {
  if (s === 'active') return 'bg-emerald-100 text-emerald-700'
  if (s === 'trial') return 'bg-amber-100 text-amber-700'
  if (s === 'expired' || s === 'cancelled') return 'bg-red-100 text-red-600'
  return 'bg-gray-100 text-gray-600'
}

function openModal(e: any) {
  selectedEntreprise.value = e
  form.value = {
    plan_name: e.subscription?.plan_name || 'free',
    status: e.subscription?.status || 'active',
    days: 30,
    notes: '',
  }
  saveSuccess.value = false
  saveError.value = ''
  showModal.value = true
}

async function saveSubscription() {
  saving.value = true
  saveError.value = ''
  try {
    await apiFetch('/api/platform/set_subscription/', {
      method: 'POST',
      body: {
        entreprise_id: selectedEntreprise.value.id,
        ...form.value,
      },
    })
    saveSuccess.value = true
    await loadEntreprises(currentPage.value)
    await loadStats()
  } catch (e: any) {
    saveError.value = e?.data?.error || 'Erreur lors de la sauvegarde'
  } finally {
    saving.value = false
  }
}

async function toggleEntreprise(e: any) {
  try {
    const res = await apiFetch<any>('/api/platform/toggle_entreprise/', {
      method: 'POST',
      body: { entreprise_id: e.id },
    })
    e.is_active = res.is_active
  } catch (err) {
    console.error(err)
  }
}

let searchTimer: ReturnType<typeof setTimeout>
function onSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => loadEntreprises(1), 400)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Administration Plateforme</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Gérez toutes les entreprises et leurs abonnements.</p>
      </div>

      <!-- KPIs -->
      <div v-if="stats" class="grid grid-cols-2 sm:grid-cols-4 gap-5">
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div class="text-3xl font-extrabold text-gray-900 dark:text-white">{{ stats.total_entreprises }}</div>
          <div class="text-sm text-gray-500 mt-1">Entreprises total</div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div class="text-3xl font-extrabold text-emerald-600">{{ stats.active_entreprises }}</div>
          <div class="text-sm text-gray-500 mt-1">Actives</div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div class="text-3xl font-extrabold text-red-500">{{ stats.inactive_entreprises }}</div>
          <div class="text-sm text-gray-500 mt-1">Inactives</div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div class="text-2xl font-extrabold text-gray-900 dark:text-white">{{ (stats.total_revenue_simulated || 0).toLocaleString('fr-FR') }} FCFA</div>
          <div class="text-sm text-gray-500 mt-1">Revenus simulés</div>
        </div>
      </div>

      <!-- Distribution des plans -->
      <div v-if="stats?.plans_distribution" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Distribution des abonnements</h2>
        <div class="flex flex-wrap gap-3">
          <div
            v-for="(count, name) in stats.plans_distribution"
            :key="name"
            class="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2"
          >
            <span class="font-semibold text-gray-900 dark:text-white">{{ name }}</span>
            <span class="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">{{ count }}</span>
          </div>
        </div>
      </div>

      <!-- Liste entreprises -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between gap-4">
          <h2 class="font-semibold text-gray-900 dark:text-white">Entreprises</h2>
          <div class="flex items-center gap-3">
            <input
              v-model="search"
              @input="onSearch"
              type="search"
              placeholder="Rechercher..."
              class="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 w-48"
            />
            <button @click="loadEntreprises(currentPage)" class="p-2 text-gray-400 hover:text-emerald-600 transition-colors">
              <svg class="w-4 h-4" :class="loading ? 'animate-spin' : ''" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            </button>
          </div>
        </div>

        <div v-if="loading" class="flex justify-center py-12">
          <div class="w-8 h-8 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-100 dark:divide-gray-700 text-sm">
            <thead class="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th class="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Entreprise</th>
                <th class="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Email</th>
                <th class="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Abonnement</th>
                <th class="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Statut</th>
                <th class="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Utilisateurs</th>
                <th class="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Fin</th>
                <th class="px-5 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50 dark:divide-gray-700/50">
              <tr v-for="e in entreprises" :key="e.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <td class="px-5 py-3">
                  <div class="font-medium text-gray-900 dark:text-white">{{ e.nom }}</div>
                  <div class="text-xs text-gray-400">{{ e.ville }}</div>
                </td>
                <td class="px-5 py-3 text-gray-600 dark:text-gray-400">{{ e.email }}</td>
                <td class="px-5 py-3">
                  <span class="font-medium text-gray-900 dark:text-white">{{ e.subscription?.plan || 'Aucun' }}</span>
                </td>
                <td class="px-5 py-3">
                  <span class="text-xs font-semibold px-2 py-0.5 rounded-full" :class="statusColor(e.subscription?.status)">
                    {{ e.subscription?.status || 'none' }}
                  </span>
                </td>
                <td class="px-5 py-3 text-gray-600 dark:text-gray-400">{{ e.users_count }}</td>
                <td class="px-5 py-3 text-gray-500 text-xs">
                  {{ e.subscription?.end_date ? new Date(e.subscription.end_date).toLocaleDateString('fr-FR') : '—' }}
                </td>
                <td class="px-5 py-3 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      @click="openModal(e)"
                      class="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg font-medium transition-colors"
                    >
                      Gérer
                    </button>
                    <button
                      @click="toggleEntreprise(e)"
                      class="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
                      :class="e.is_active ? 'bg-red-50 hover:bg-red-100 text-red-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'"
                    >
                      {{ e.is_active ? 'Désactiver' : 'Activer' }}
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="entreprises.length === 0">
                <td colspan="7" class="px-5 py-12 text-center text-gray-400">Aucune entreprise trouvée</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-sm text-gray-500">
          <span>Page {{ currentPage }} sur {{ totalPages }}</span>
          <div class="flex gap-2">
            <button @click="loadEntreprises(currentPage - 1)" :disabled="currentPage <= 1"
              class="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:border-emerald-400 transition-colors">
              ← Précédent
            </button>
            <button @click="loadEntreprises(currentPage + 1)" :disabled="currentPage >= totalPages"
              class="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:border-emerald-400 transition-colors">
              Suivant →
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Modal gestion abonnement -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div class="bg-emerald-500 px-6 py-4 flex items-center justify-between">
          <h3 class="text-white font-bold text-lg">{{ selectedEntreprise?.nom }}</h3>
          <button @click="showModal = false" class="text-white/70 hover:text-white">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div class="p-6 space-y-4">
          <div v-if="saveSuccess" class="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700 font-medium">
            Abonnement mis à jour avec succès.
          </div>
          <div v-if="saveError" class="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {{ saveError }}
          </div>

          <div>
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Plan</label>
            <select v-model="form.plan_name"
              class="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400">
              <option v-for="p in PLANS" :key="p" :value="p">{{ p }}</option>
            </select>
          </div>

          <div>
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Statut</label>
            <select v-model="form.status"
              class="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400">
              <option value="active">Actif</option>
              <option value="trial">Essai</option>
              <option value="expired">Expiré</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>

          <div>
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Durée (jours)</label>
            <input v-model.number="form.days" type="number" min="1" max="3650"
              class="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400" />
          </div>

          <div>
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Notes internes</label>
            <textarea v-model="form.notes" rows="2" placeholder="Raison de la modification..."
              class="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none" />
          </div>

          <button
            @click="saveSubscription"
            :disabled="saving"
            class="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
            {{ saving ? 'Sauvegarde...' : 'Enregistrer' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
