<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue"
import { useApiBase } from "@/composables/useApiBase"
import { useNotification } from "@/types/useNotification"

definePageMeta({ layout: 'default' })

const { getApiUrl, getAuthHeaders } = useApiBase()
const notif = useNotification()

interface Partenaire {
  id: number
  nom: string
  prenom: string
  telephone: string
  statut: "encours" | "paye"
  boutique: number | null
  entreprise: number | null
  localisation: string
  dateadhesion: string
  limite_credit: number
  notes: string
  solde_en_cours: number
  depasse_limite: boolean
}

const partenaires = ref<Partenaire[]>([])
const loading = ref(false)
const searchQuery = ref("")
const filterAlerte = ref(false)

async function apiFetch(path: string, options: any = {}) {
  return $fetch(getApiUrl(path), { headers: getAuthHeaders(), cache: 'no-store', ...options })
}

async function chargerPartenaires() {
  loading.value = true
  try {
    const res: any = await apiFetch("/api/partenaires/")
    partenaires.value = Array.isArray(res) ? res : (res.results ?? [])
  } catch (e: any) {
    notif.error("Erreur lors du chargement des partenaires")
  } finally {
    loading.value = false
  }
}

const filteredPartenaires = computed(() => {
  let list = partenaires.value
  if (filterAlerte.value) list = list.filter(p => p.depasse_limite)
  if (!searchQuery.value.trim()) return list
  const q = searchQuery.value.toLowerCase()
  return list.filter(p =>
    p.nom?.toLowerCase().includes(q) ||
    p.prenom?.toLowerCase().includes(q) ||
    p.telephone?.includes(q) ||
    p.localisation?.toLowerCase().includes(q)
  )
})

// ─── Stats ────────────────────────────────────────────────────────────────────
const stats = computed(() => ({
  total: partenaires.value.length,
  encours: partenaires.value.filter(p => p.statut === "encours").length,
  paye: partenaires.value.filter(p => p.statut === "paye").length,
  alertes: partenaires.value.filter(p => p.depasse_limite).length,
  totalSolde: partenaires.value.reduce((s, p) => s + (p.solde_en_cours || 0), 0),
}))

// ─── Ajout ────────────────────────────────────────────────────────────────────
const showAddModal = ref(false)
const addLoading = ref(false)
const addForm = ref({
  nom: "", prenom: "", telephone: "", localisation: "Bafoussam",
  dateadhesion: new Date().toISOString().split("T")[0],
  limite_credit: 0, notes: ""
})

async function ajouterPartenaire() {
  if (!addForm.value.nom || !addForm.value.telephone) {
    notif.error("Nom et téléphone sont requis")
    return
  }
  addLoading.value = true
  try {
    await apiFetch("/api/partenaires/", { method: "POST", body: addForm.value })
    notif.success("Partenaire ajouté avec succès")
    showAddModal.value = false
    addForm.value = { nom: "", prenom: "", telephone: "", localisation: "Bafoussam", dateadhesion: new Date().toISOString().split("T")[0], limite_credit: 0, notes: "" }
    await chargerPartenaires()
  } catch (e: any) {
    notif.error(e?.data?.detail || "Erreur lors de l'ajout")
  } finally {
    addLoading.value = false
  }
}

// ─── Édition ──────────────────────────────────────────────────────────────────
const showEditModal = ref(false)
const editLoading = ref(false)
const editForm = ref<Partial<Partenaire> & { id?: number }>({})

function ouvrirEdit(p: Partenaire) {
  editForm.value = { ...p }
  showEditModal.value = true
}

async function sauvegarderModification() {
  if (!editForm.value.id) return
  editLoading.value = true
  try {
    await apiFetch(`/api/partenaires/${editForm.value.id}/`, {
      method: "PATCH",
      body: {
        nom: editForm.value.nom,
        prenom: editForm.value.prenom,
        telephone: editForm.value.telephone,
        localisation: editForm.value.localisation,
        statut: editForm.value.statut,
        limite_credit: editForm.value.limite_credit ?? 0,
        notes: editForm.value.notes ?? "",
      }
    })
    notif.success("Partenaire modifié avec succès")
    showEditModal.value = false
    await chargerPartenaires()
  } catch (e: any) {
    notif.error(e?.data?.detail || "Erreur lors de la modification")
  } finally {
    editLoading.value = false
  }
}

// ─── Suppression ──────────────────────────────────────────────────────────────
const showDeleteModal = ref(false)
const deleteTarget = ref<Partenaire | null>(null)
const deleteLoading = ref(false)

function confirmerSuppression(p: Partenaire) { deleteTarget.value = p; showDeleteModal.value = true }

async function supprimerPartenaire() {
  if (!deleteTarget.value) return
  deleteLoading.value = true
  try {
    await apiFetch(`/api/partenaires/${deleteTarget.value.id}/`, { method: "DELETE" })
    notif.success("Partenaire supprimé")
    showDeleteModal.value = false
    deleteTarget.value = null
    await chargerPartenaires()
  } catch (e: any) {
    notif.error(e?.data?.detail || "Erreur lors de la suppression")
  } finally {
    deleteLoading.value = false
  }
}

// ─── Crédit helpers ───────────────────────────────────────────────────────────
function creditPct(p: Partenaire) {
  if (!p.limite_credit || p.limite_credit <= 0) return null
  return Math.min(100, Math.round((p.solde_en_cours / p.limite_credit) * 100))
}

function creditBarColor(p: Partenaire) {
  const pct = creditPct(p)
  if (pct === null) return ''
  if (pct >= 100) return 'bg-red-500'
  if (pct >= 80) return 'bg-amber-500'
  return 'bg-emerald-500'
}

let refreshTimer: ReturnType<typeof setInterval> | null = null
onMounted(() => { chargerPartenaires(); refreshTimer = setInterval(chargerPartenaires, 60_000) })
onUnmounted(() => { if (refreshTimer) clearInterval(refreshTimer) })
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Partenaires</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Gestion des partenaires, soldes et limites de crédit</p>
        </div>
        <button @click="showAddModal = true"
          class="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
          <UIcon name="i-heroicons-plus" class="w-4 h-4" /> Ajouter un partenaire
        </button>
      </div>

      <!-- KPIs -->
      <div class="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p class="text-xs text-gray-500 mb-1">Total</p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.total }}</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p class="text-xs text-gray-500 mb-1">En cours</p>
          <p class="text-2xl font-bold text-amber-600">{{ stats.encours }}</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p class="text-xs text-gray-500 mb-1">Soldés</p>
          <p class="text-2xl font-bold text-emerald-600">{{ stats.paye }}</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 cursor-pointer"
          :class="filterAlerte ? 'ring-2 ring-red-400' : ''"
          @click="filterAlerte = !filterAlerte">
          <p class="text-xs text-gray-500 mb-1">Limite dépassée</p>
          <p class="text-2xl font-bold text-red-600">{{ stats.alertes }}</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p class="text-xs text-gray-500 mb-1">Solde total dû</p>
          <p class="text-lg font-bold text-red-600">{{ stats.totalSolde.toLocaleString('fr-FR') }} <span class="text-xs font-normal text-gray-400">FCFA</span></p>
        </div>
      </div>

      <!-- Alerte globale -->
      <div v-if="stats.alertes > 0" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-4 flex items-start gap-3">
        <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div>
          <p class="text-sm font-semibold text-red-800 dark:text-red-300">{{ stats.alertes }} partenaire(s) ont dépassé leur limite de crédit</p>
          <p class="text-xs text-red-600 dark:text-red-400 mt-0.5">Cliquez sur "Limite dépassée" pour les afficher uniquement</p>
        </div>
      </div>

      <!-- Filtres -->
      <div class="flex flex-wrap gap-3">
        <div class="relative flex-1 min-w-[200px]">
          <UIcon name="i-heroicons-magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input v-model="searchQuery" type="text" placeholder="Rechercher par nom, téléphone..."
            class="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        <button @click="filterAlerte = !filterAlerte"
          :class="filterAlerte ? 'bg-red-100 text-red-700 border-red-300' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600'"
          class="px-3 py-2 text-sm border rounded-lg transition-colors flex items-center gap-2">
          <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4" />
          {{ filterAlerte ? 'Tous' : 'Alertes uniquement' }}
        </button>
      </div>

      <!-- Table -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div v-if="loading" class="p-8 text-center text-gray-500">
          <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 animate-spin mx-auto mb-2" /> Chargement...
        </div>
        <div v-else-if="filteredPartenaires.length === 0" class="p-8 text-center text-gray-500">
          <UIcon name="i-heroicons-users" class="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p class="font-medium">Aucun partenaire trouvé</p>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase text-gray-500 dark:text-gray-400">
              <tr>
                <th class="px-4 py-3 text-left">Partenaire</th>
                <th class="px-4 py-3 text-left">Téléphone</th>
                <th class="px-4 py-3 text-left">Localisation</th>
                <th class="px-4 py-3 text-right">Solde dû</th>
                <th class="px-4 py-3 text-left">Limite crédit</th>
                <th class="px-4 py-3 text-left">Statut</th>
                <th class="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
              <tr v-for="p in filteredPartenaires" :key="p.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                :class="p.depasse_limite ? 'bg-red-50/40 dark:bg-red-900/10' : ''">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                      <span class="text-xs font-bold text-emerald-700 dark:text-emerald-400">{{ p.nom.charAt(0).toUpperCase() }}</span>
                    </div>
                    <div>
                      <p class="font-semibold text-gray-900 dark:text-white">{{ p.nom }} {{ p.prenom }}</p>
                      <p v-if="p.notes" class="text-xs text-gray-400 truncate max-w-[160px]">{{ p.notes }}</p>
                    </div>
                    <UIcon v-if="p.depasse_limite" name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-red-500 flex-shrink-0" title="Limite de crédit dépassée" />
                  </div>
                </td>
                <td class="px-4 py-3 text-gray-600 dark:text-gray-300">{{ p.telephone || "—" }}</td>
                <td class="px-4 py-3 text-gray-500 dark:text-gray-400">{{ p.localisation || "—" }}</td>
                <td class="px-4 py-3 text-right font-semibold" :class="(p.solde_en_cours || 0) > 0 ? 'text-red-600' : 'text-emerald-600'">
                  {{ (p.solde_en_cours || 0).toLocaleString('fr-FR') }} <span class="text-xs font-normal text-gray-400">FCFA</span>
                </td>
                <td class="px-4 py-3 min-w-[160px]">
                  <div v-if="p.limite_credit > 0">
                    <div class="flex items-center justify-between text-xs mb-1">
                      <span class="text-gray-500">{{ (p.solde_en_cours || 0).toLocaleString('fr-FR') }} / {{ p.limite_credit.toLocaleString('fr-FR') }}</span>
                      <span :class="p.depasse_limite ? 'text-red-600 font-bold' : 'text-gray-500'">{{ creditPct(p) }}%</span>
                    </div>
                    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div :class="creditBarColor(p)" class="h-1.5 rounded-full transition-all" :style="{ width: Math.min(100, creditPct(p) ?? 0) + '%' }"></div>
                    </div>
                  </div>
                  <span v-else class="text-xs text-gray-400 italic">Illimité</span>
                </td>
                <td class="px-4 py-3">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="p.statut === 'paye' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'">
                    {{ p.statut === "paye" ? "Soldé" : "En cours" }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center justify-end gap-1">
                    <button @click="ouvrirEdit(p)"
                      class="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 transition-colors" title="Modifier">
                      <UIcon name="i-heroicons-pencil-square" class="w-4 h-4" />
                    </button>
                    <button @click="confirmerSuppression(p)"
                      class="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors" title="Supprimer">
                      <UIcon name="i-heroicons-trash" class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Ajout -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="showAddModal = false">
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg">
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 class="text-lg font-bold text-gray-900 dark:text-white">Ajouter un partenaire</h2>
              <button @click="showAddModal = false" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <UIcon name="i-heroicons-x-mark" class="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div class="p-6 grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom *</label>
                <input v-model="addForm.nom" type="text" placeholder="Nom"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prénom</label>
                <input v-model="addForm.prenom" type="text" placeholder="Prénom"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Téléphone *</label>
                <input v-model="addForm.telephone" type="tel" placeholder="+237 6XX XXX XXX"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Localisation</label>
                <input v-model="addForm.localisation" type="text"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Limite de crédit (FCFA)</label>
                <input v-model.number="addForm.limite_credit" type="number" min="0" placeholder="0 = illimité"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                <p class="text-xs text-gray-400 mt-0.5">0 = pas de limite</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date d'adhésion</label>
                <input v-model="addForm.dateadhesion" type="date"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes internes</label>
                <textarea v-model="addForm.notes" rows="2" placeholder="Notes, conditions commerciales..."
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"></textarea>
              </div>
            </div>
            <div class="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <button @click="showAddModal = false" class="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Annuler</button>
              <button @click="ajouterPartenaire" :disabled="addLoading"
                class="px-5 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg disabled:opacity-50">
                {{ addLoading ? "Enregistrement..." : "Ajouter" }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal Édition -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="showEditModal = false">
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg">
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 class="text-lg font-bold text-gray-900 dark:text-white">Modifier — {{ editForm.nom }} {{ editForm.prenom }}</h2>
              <button @click="showEditModal = false" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <UIcon name="i-heroicons-x-mark" class="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div class="p-6 grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom *</label>
                <input v-model="editForm.nom" type="text"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prénom</label>
                <input v-model="editForm.prenom" type="text"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Téléphone</label>
                <input v-model="editForm.telephone" type="tel"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Localisation</label>
                <input v-model="editForm.localisation" type="text"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Limite de crédit (FCFA)</label>
                <input v-model.number="editForm.limite_credit" type="number" min="0"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                <p class="text-xs text-gray-400 mt-0.5">0 = pas de limite</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Statut</label>
                <select v-model="editForm.statut"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="encours">En cours</option>
                  <option value="paye">Soldé</option>
                </select>
              </div>
              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes internes</label>
                <textarea v-model="editForm.notes" rows="2"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"></textarea>
              </div>

              <!-- Résumé crédit en lecture seule -->
              <div v-if="editForm.limite_credit && editForm.limite_credit > 0" class="col-span-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <p class="text-xs font-semibold text-gray-500 mb-2">État du crédit actuel</p>
                <div class="flex justify-between text-sm mb-1.5">
                  <span class="text-gray-600 dark:text-gray-300">Solde en cours</span>
                  <span class="font-semibold" :class="editForm.depasse_limite ? 'text-red-600' : 'text-gray-900 dark:text-white'">
                    {{ (editForm.solde_en_cours || 0).toLocaleString('fr-FR') }} FCFA
                  </span>
                </div>
                <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div :class="editForm.depasse_limite ? 'bg-red-500' : (((editForm.solde_en_cours || 0) / editForm.limite_credit) > 0.8 ? 'bg-amber-500' : 'bg-emerald-500')"
                    class="h-2 rounded-full transition-all"
                    :style="{ width: Math.min(100, Math.round(((editForm.solde_en_cours || 0) / editForm.limite_credit) * 100)) + '%' }">
                  </div>
                </div>
                <p v-if="editForm.depasse_limite" class="text-xs text-red-600 font-medium mt-1">⚠ Limite dépassée</p>
              </div>
            </div>
            <div class="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <button @click="showEditModal = false" class="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Annuler</button>
              <button @click="sauvegarderModification" :disabled="editLoading"
                class="px-5 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg disabled:opacity-50">
                {{ editLoading ? "Enregistrement..." : "Sauvegarder" }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal Suppression -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="showDeleteModal = false">
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div class="flex items-center gap-3 mb-4">
              <div class="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
                <UIcon name="i-heroicons-exclamation-triangle" class="w-6 h-6 text-red-500" />
              </div>
              <h2 class="text-lg font-bold text-gray-900 dark:text-white">Confirmer la suppression</h2>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Voulez-vous supprimer <strong>{{ deleteTarget?.nom }} {{ deleteTarget?.prenom }}</strong> ?
              <span v-if="(deleteTarget?.solde_en_cours || 0) > 0" class="block mt-1 text-red-600 font-medium">
                ⚠ Ce partenaire a un solde de {{ deleteTarget?.solde_en_cours?.toLocaleString('fr-FR') }} FCFA non réglé.
              </span>
            </p>
            <div class="flex justify-end gap-3">
              <button @click="showDeleteModal = false" class="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Annuler</button>
              <button @click="supprimerPartenaire" :disabled="deleteLoading"
                class="px-5 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50">
                {{ deleteLoading ? "Suppression..." : "Supprimer" }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
