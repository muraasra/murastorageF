<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useNotification } from '@/types/useNotification'
import { useApiBase } from '@/composables/useApiBase'

definePageMeta({ layout: 'default' })

const { success, error } = useNotification()
const { getApiUrl, getAuthHeaders, parseApiList } = useApiBase()

// --- État ---
const loading = ref(false)
const submitting = ref(false)
const showModal = ref(false)
const showDetailsModal = ref(false)
const selectedTransfert = ref<any>(null)

const entrepots = ref<any[]>([])
const produits = ref<any[]>([])
const transferts = ref<any[]>([])
const rechercheModal = ref('')

const form = ref({
  produitId: null as number | null,
  entrepotSourceId: null as number | null,
  entrepotDestinationId: null as number | null,
  quantite: 1,
  motif: ''
})

// --- Helpers ---
const boutiqueCourante = computed(() => {
  if (!process.client) return null
  try { return JSON.parse(localStorage.getItem('boutique') || 'null') } catch { return null }
})

const getEntrepriseId = (): number | null => {
  if (!process.client) return null
  try {
    const b = JSON.parse(localStorage.getItem('boutique') || 'null')
    if (b?.entreprise) return b.entreprise
    const u = JSON.parse(localStorage.getItem('user') || 'null')
    return u?.entreprise || null
  } catch { return null }
}

const produitSelectionne = computed(() => produits.value.find(p => p.id === form.value.produitId))
const stockDisponible = computed(() => {
  if (!produitSelectionne.value || !form.value.entrepotSourceId) return 0
  const s = produitSelectionne.value.stocks?.find((s: any) => s.entrepot === form.value.entrepotSourceId)
  return s?.quantite ?? 0
})

const entrepotsSansSource = computed(() =>
  entrepots.value.filter(e => e.id !== form.value.entrepotSourceId)
)

const produitsFiltres = computed(() => {
  const q = rechercheModal.value.toLowerCase()
  return q
    ? produits.value.filter(p => p.nom?.toLowerCase().includes(q) || p.reference?.toLowerCase().includes(q))
    : produits.value
})

// --- Chargement ---
async function chargerDonnees() {
  loading.value = true
  const h = getAuthHeaders()
  const entrepriseId = getEntrepriseId()
  try {
    const [bRaw, pRaw, mRaw] = await Promise.all([
      $fetch(getApiUrl('/api/boutiques/'), { headers: h }),
      $fetch(getApiUrl(`/api/produits/${entrepriseId ? `?entreprise=${entrepriseId}` : ''}`), { headers: h }),
      $fetch(getApiUrl('/api/mouvements-stock/?type_mouvement=transfert'), { headers: h }),
    ])
    entrepots.value = parseApiList(bRaw)
    const produitsRaw = parseApiList(pRaw)
    // Charger les stocks par produit
    const stocksRaw = await $fetch(getApiUrl(`/api/stocks/${entrepriseId ? `?entreprise=${entrepriseId}` : ''}`), { headers: h })
    const stocks = parseApiList(stocksRaw)
    produits.value = produitsRaw.map((p: any) => ({
      ...p,
      stocks: stocks.filter((s: any) => s.produit === p.id)
    }))
    // Regrouper les mouvements de transfert par référence
    const mouvements = parseApiList(mRaw)
    const groupes = new Map<string, any>()
    for (const m of mouvements) {
      const cle = m.reference_document || `${m.produit}-${m.created_at}`
      if (!groupes.has(cle)) {
        groupes.set(cle, { ...m, mouvements: [] })
      }
      groupes.get(cle).mouvements.push(m)
    }
    transferts.value = Array.from(groupes.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  } catch {
    error('Erreur lors du chargement des données')
  } finally {
    loading.value = false
  }
}

// --- Soumission transfert ---
async function soumettre() {
  if (!form.value.produitId || !form.value.entrepotSourceId || !form.value.entrepotDestinationId) {
    error('Remplissez tous les champs obligatoires')
    return
  }
  if (form.value.entrepotSourceId === form.value.entrepotDestinationId) {
    error('Source et destination doivent Ãªtre différentes')
    return
  }
  if (form.value.quantite <= 0 || form.value.quantite > stockDisponible.value) {
    error(`Quantité invalide (max: ${stockDisponible.value})`)
    return
  }
  submitting.value = true
  try {
    const h = getAuthHeaders()
    await $fetch(getApiUrl('/api/mouvements-stock/transfert/'), {
      method: 'POST',
      headers: h,
      body: {
        produit: form.value.produitId,
        entrepot_source: form.value.entrepotSourceId,
        entrepot_destination: form.value.entrepotDestinationId,
        quantite: form.value.quantite,
        motif: form.value.motif
      }
    })
    success('Transfert effectué avec succès')
    showModal.value = false
    resetForm()
    await chargerDonnees()
  } catch (e: any) {
    error(e?.data?.error || 'Erreur lors du transfert')
  } finally {
    submitting.value = false
  }
}

function resetForm() {
  form.value = { produitId: null, entrepotSourceId: null, entrepotDestinationId: null, quantite: 1, motif: '' }
  rechercheModal.value = ''
}

function ouvrirModal() {
  resetForm()
  // Verrouiller la source sur la boutique courante
  if (boutiqueCourante.value?.id) {
    form.value.entrepotSourceId = boutiqueCourante.value.id
  }
  showModal.value = true
}

function voirDetails(t: any) {
  selectedTransfert.value = t
  showDetailsModal.value = true
}

// --- Utils ---
function nomEntrepot(id: number) {
  return entrepots.value.find(e => e.id === id)?.nom || `Entrepôt ${id}`
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// --- Stats ---
const stats = computed(() => ({
  total: transferts.value.length,
  aujourdhui: transferts.value.filter(t => t.created_at?.slice(0, 10) === new Date().toISOString().slice(0, 10)).length,
  produits: new Set(transferts.value.map(t => t.produit)).size,
}))

onMounted(chargerDonnees)
</script>

<template>
  <section class="mt-5 px-4 md:px-6 pb-10">

    <!-- En-tÃªte -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Transferts de stock</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Déplacer des produits entre entrepôts</p>
      </div>
      <button
        @click="ouvrirModal"
        class="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-xl transition-colors"
      >
        <UIcon name="i-heroicons-arrows-right-left" class="w-4 h-4" />
        Nouveau transfert
      </button>
    </div>

    <!-- KPIs -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
        <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Total</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.total }}</p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
        <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Aujourd'hui</p>
        <p class="text-2xl font-bold text-purple-600 dark:text-purple-400">{{ stats.aujourdhui }}</p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
        <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Produits déplacés</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.produits }}</p>
      </div>
    </div>

    <!-- Liste des transferts -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
      <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
        <h2 class="font-semibold text-gray-900 dark:text-white">Historique des transferts</h2>
      </div>

      <div v-if="loading" class="flex items-center justify-center py-16">
        <div class="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <div v-else-if="transferts.length === 0" class="flex flex-col items-center justify-center py-16 text-gray-400">
        <UIcon name="i-heroicons-arrows-right-left" class="w-10 h-10 mb-3 opacity-40" />
        <p class="text-sm">Aucun transfert enregistré</p>
      </div>

      <div v-else class="divide-y divide-gray-100 dark:divide-gray-700">
        <div
          v-for="t in transferts"
          :key="t.id"
          @click="voirDetails(t)"
          class="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/40 cursor-pointer transition-colors"
        >
          <div class="flex-shrink-0 w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <UIcon name="i-heroicons-arrows-right-left" class="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ t.produit_nom || 'Produit' }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {{ nomEntrepot(t.entrepot) }}
              <UIcon name="i-heroicons-arrow-right" class="w-3 h-3 inline mx-1" />
              {{ nomEntrepot(t.entrepot_destination || 0) }}
            </p>
          </div>
          <div class="text-right flex-shrink-0">
            <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ t.quantite }} unités</p>
            <p class="text-xs text-gray-400 mt-0.5">{{ formatDate(t.created_at) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal nouveau transfert -->
    <UModal v-model="showModal" :ui="{ width: 'sm:max-w-lg' }">
      <div class="p-6">
        <div class="flex items-center justify-between mb-5">
          <h3 class="text-base font-semibold text-gray-900 dark:text-white">Nouveau transfert</h3>
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-4">
          <!-- Recherche produit -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Produit</label>
            <UInput v-model="rechercheModal" placeholder="Rechercher un produit..." icon="i-heroicons-magnifying-glass" />
            <div v-if="rechercheModal" class="mt-1 max-h-36 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm">
              <div v-if="produitsFiltres.length === 0" class="px-3 py-2 text-xs text-gray-400">Aucun résultat</div>
              <button
                v-for="p in produitsFiltres"
                :key="p.id"
                @click="form.produitId = p.id; rechercheModal = p.nom; form.entrepotSourceId = null"
                class="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0"
              >
                <span class="text-sm font-medium text-gray-800 dark:text-gray-200">{{ p.nom }}</span>
                <span class="text-xs text-gray-400 ml-2">{{ p.reference }}</span>
              </button>
            </div>
            <div v-if="form.produitId && !rechercheModal.length" class="mt-1 px-3 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-sm text-purple-700 dark:text-purple-300 font-medium">
              {{ produitSelectionne?.nom }}
            </div>
          </div>

          <!-- Entrepôt source (verrouillé sur la boutique courante) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Entrepôt source</label>
            <div class="flex items-center gap-2 px-3 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300">
              <UIcon name="i-heroicons-lock-closed" class="w-4 h-4 text-gray-400 flex-shrink-0" />
              {{ boutiqueCourante?.nom || 'Boutique courante' }}
              <span v-if="boutiqueCourante?.ville" class="text-gray-400">â€” {{ boutiqueCourante.ville }}</span>
            </div>
          </div>

          <!-- Stock dispo -->
          <div v-if="form.entrepotSourceId && form.produitId" class="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-xs text-gray-600 dark:text-gray-400">
            <UIcon name="i-heroicons-cube" class="w-4 h-4" />
            Stock disponible dans cet entrepôt : <strong class="ml-1">{{ stockDisponible }}</strong>
          </div>

          <!-- Entrepôt destination -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Entrepôt destination</label>
            <USelect
              v-model.number="form.entrepotDestinationId"
              :options="entrepotsSansSource.map(e => ({ label: e.nom + (e.ville ? ` â€” ${e.ville}` : ''), value: e.id }))"
              placeholder="Sélectionner la destination"
            />
          </div>

          <!-- Quantité -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Quantité</label>
            <UInput
              v-model.number="form.quantite"
              type="number"
              min="1"
              :max="stockDisponible || undefined"
              placeholder="1"
            />
          </div>

          <!-- Motif -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Motif <span class="text-gray-400 font-normal">(optionnel)</span></label>
            <UTextarea v-model.trim="form.motif" placeholder="Raison du transfert..." :rows="2" />
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <UButton variant="outline" color="gray" @click="showModal = false">Annuler</UButton>
          <UButton
            color="purple"
            :loading="submitting"
            :disabled="!form.produitId || !form.entrepotSourceId || !form.entrepotDestinationId || form.quantite < 1"
            @click="soumettre"
          >
            Transférer
          </UButton>
        </div>
      </div>
    </UModal>

    <!-- Modal détails -->
    <UModal v-model="showDetailsModal" :ui="{ width: 'sm:max-w-md' }">
      <div v-if="selectedTransfert" class="p-6">
        <div class="flex items-center justify-between mb-5">
          <h3 class="text-base font-semibold text-gray-900 dark:text-white">Détails du transfert</h3>
          <button @click="showDetailsModal = false" class="text-gray-400 hover:text-gray-600">
            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
          </button>
        </div>
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between">
            <dt class="text-gray-500 dark:text-gray-400">Produit</dt>
            <dd class="font-medium text-gray-900 dark:text-white">{{ selectedTransfert.produit_nom }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-gray-500 dark:text-gray-400">De</dt>
            <dd class="font-medium text-gray-900 dark:text-white">{{ nomEntrepot(selectedTransfert.entrepot) }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-gray-500 dark:text-gray-400">Vers</dt>
            <dd class="font-medium text-gray-900 dark:text-white">{{ nomEntrepot(selectedTransfert.entrepot_destination || 0) }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-gray-500 dark:text-gray-400">Quantité</dt>
            <dd class="font-semibold text-purple-600 dark:text-purple-400">{{ selectedTransfert.quantite }}</dd>
          </div>
          <div v-if="selectedTransfert.notes" class="flex justify-between">
            <dt class="text-gray-500 dark:text-gray-400">Motif</dt>
            <dd class="font-medium text-gray-900 dark:text-white text-right max-w-[60%]">{{ selectedTransfert.notes }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-gray-500 dark:text-gray-400">Date</dt>
            <dd class="font-medium text-gray-900 dark:text-white">{{ formatDate(selectedTransfert.created_at) }}</dd>
          </div>
          <div v-if="selectedTransfert.reference_document" class="flex justify-between">
            <dt class="text-gray-500 dark:text-gray-400">Référence</dt>
            <dd class="font-medium text-gray-500 font-mono text-xs">{{ selectedTransfert.reference_document }}</dd>
          </div>
        </dl>
        <div class="mt-6 flex justify-end">
          <UButton variant="outline" color="gray" @click="showDetailsModal = false">Fermer</UButton>
        </div>
      </div>
    </UModal>

  </section>
</template>

