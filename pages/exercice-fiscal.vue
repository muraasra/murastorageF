<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
    <!-- Header -->
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span class="text-2xl">📅</span> Exercice Fiscal
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Gestion des années comptables — clôture, rapports, historique
        </p>
      </div>
      <div class="flex items-center gap-3">
        <!-- Sélecteur d'année -->
        <div class="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 shadow-sm">
          <button @click="anneeSelectionnee--; chargerExercices()" class="w-6 h-6 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-gray-500">‹</button>
          <span class="font-bold text-gray-900 dark:text-white w-12 text-center">{{ anneeSelectionnee }}</span>
          <button @click="anneeSelectionnee++; chargerExercices()" class="w-6 h-6 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-gray-500">›</button>
        </div>
        <!-- Ouvrir nouvel exercice -->
        <button
          v-if="!exerciceCourant && !chargement"
          @click="ouvrirNouvelExercice"
          :disabled="actionEnCours"
          class="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <span>+</span> Ouvrir l'exercice {{ anneeSelectionnee }}
        </button>
      </div>
    </div>

    <!-- Chargement -->
    <div v-if="chargement" class="flex items-center justify-center py-16">
      <div class="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Aucun exercice -->
    <div v-else-if="!exerciceCourant" class="text-center py-16">
      <div class="text-5xl mb-3">📊</div>
      <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">Aucun exercice pour {{ anneeSelectionnee }}</h3>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Ouvrez un exercice fiscal pour commencer à suivre l'activité comptable.</p>
      <button @click="ouvrirNouvelExercice" class="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors">
        Ouvrir l'exercice {{ anneeSelectionnee }}
      </button>
    </div>

    <template v-else>
      <!-- Statut badge -->
      <div class="mb-5 flex items-center gap-3">
        <span
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold"
          :class="exerciceCourant.statut === 'ouvert'
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'"
        >
          <span class="w-2 h-2 rounded-full" :class="exerciceCourant.statut === 'ouvert' ? 'bg-emerald-500' : 'bg-gray-400'"></span>
          {{ exerciceCourant.statut === 'ouvert' ? 'Exercice ouvert' : 'Exercice clôturé' }}
        </span>
        <span class="text-sm text-gray-500 dark:text-gray-400">
          {{ formatDate(exerciceCourant.date_debut) }} → {{ formatDate(exerciceCourant.date_fin) }}
        </span>
        <span v-if="exerciceCourant.statut === 'cloture' && exerciceCourant.date_cloture" class="text-xs text-gray-400">
          Clôturé le {{ formatDate(exerciceCourant.date_cloture) }}
          <span v-if="exerciceCourant.cloture_par_nom"> par {{ exerciceCourant.cloture_par_nom }}</span>
        </span>
      </div>

      <!-- KPIs -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div v-for="kpi in kpis" :key="kpi.label"
          class="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div class="text-xl mb-1">{{ kpi.icon }}</div>
          <div class="text-lg font-bold text-gray-900 dark:text-white">{{ kpi.valeur }}</div>
          <div class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ kpi.label }}</div>
        </div>
      </div>

      <!-- Graphique mensuel + Actions -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <!-- Graphique mensuel -->
        <div class="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Chiffre d'affaires mensuel</h3>
          <div v-if="chargementRapport" class="flex items-center justify-center h-40">
            <div class="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div v-else-if="donneesMensuelles.length === 0" class="flex items-center justify-center h-40 text-gray-400 text-sm">
            Aucune donnée disponible
          </div>
          <div v-else class="flex items-end gap-1.5 h-40">
            <div
              v-for="m in donneesMensuelles" :key="m.mois"
              class="flex-1 flex flex-col items-center gap-1"
            >
              <div
                class="w-full rounded-t-lg transition-all duration-500 min-h-[4px]"
                :class="m.ca > 0 ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'"
                :style="{ height: `${maxCA > 0 ? Math.max(4, (m.ca / maxCA) * 120) : 4}px` }"
                :title="`${m.nomMois}: ${formatCurrency(m.ca)}`"
              ></div>
              <span class="text-[10px] text-gray-400">{{ m.nomMois.substring(0, 3) }}</span>
            </div>
          </div>
        </div>

        <!-- Actions de clôture -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Actions</h3>

          <div class="space-y-3">
            <!-- Télécharger rapport -->
            <button
              @click="telechargerRapport"
              :disabled="chargementRapport"
              class="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-50"
            >
              <span class="text-lg">📄</span>
              <div class="text-left">
                <div class="font-medium">Rapport de l'exercice</div>
                <div class="text-xs text-gray-400">Synthèse CA, achats, stock</div>
              </div>
            </button>

            <!-- Clôturer -->
            <button
              v-if="exerciceCourant.statut === 'ouvert'"
              @click="showClotureModal = true"
              class="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-orange-200 dark:border-orange-800/30 bg-orange-50 dark:bg-orange-900/10 hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-colors text-sm font-medium text-orange-700 dark:text-orange-400"
            >
              <span class="text-lg">🔒</span>
              <div class="text-left">
                <div class="font-medium">Clôturer l'exercice</div>
                <div class="text-xs text-orange-400">Verrouiller définitivement {{ anneeSelectionnee }}</div>
              </div>
            </button>

            <!-- Nouvel exercice -->
            <button
              v-if="exerciceCourant.statut === 'cloture'"
              @click="ouvrirNouvelExercice"
              :disabled="actionEnCours"
              class="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-emerald-200 dark:border-emerald-800/30 bg-emerald-50 dark:bg-emerald-900/10 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 transition-colors text-sm font-medium text-emerald-700 dark:text-emerald-400 disabled:opacity-50"
            >
              <span class="text-lg">🆕</span>
              <div class="text-left">
                <div class="font-medium">Ouvrir {{ anneeSelectionnee + 1 }}</div>
                <div class="text-xs text-emerald-500">Démarrer le prochain exercice</div>
              </div>
            </button>
          </div>

          <!-- Notes exercice -->
          <div v-if="exerciceCourant.notes" class="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-xs text-gray-500 dark:text-gray-400">
            <span class="font-medium">Notes :</span> {{ exerciceCourant.notes }}
          </div>
        </div>
      </div>

      <!-- Historique des exercices -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Historique des exercices</h3>
        <div v-if="tousLesExercices.length === 0" class="text-center py-6 text-sm text-gray-400">
          Aucun exercice enregistré
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-100 dark:border-gray-700 text-left">
                <th class="pb-2 font-semibold text-gray-600 dark:text-gray-400">Année</th>
                <th class="pb-2 font-semibold text-gray-600 dark:text-gray-400">Période</th>
                <th class="pb-2 font-semibold text-gray-600 dark:text-gray-400 text-right">CA</th>
                <th class="pb-2 font-semibold text-gray-600 dark:text-gray-400 text-right">Achats</th>
                <th class="pb-2 font-semibold text-gray-600 dark:text-gray-400 text-right">Bénéfice</th>
                <th class="pb-2 font-semibold text-gray-600 dark:text-gray-400 text-right">Factures</th>
                <th class="pb-2 font-semibold text-gray-600 dark:text-gray-400">Statut</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="ex in tousLesExercices" :key="ex.id"
                class="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer transition-colors"
                @click="anneeSelectionnee = ex.annee; chargerExercices()"
              >
                <td class="py-3 font-bold text-gray-900 dark:text-white">{{ ex.annee }}</td>
                <td class="py-3 text-gray-500 dark:text-gray-400 text-xs">{{ formatDate(ex.date_debut) }} – {{ formatDate(ex.date_fin) }}</td>
                <td class="py-3 text-right font-medium text-gray-900 dark:text-white">{{ ex.statut === 'ouvert' ? '—' : formatCurrency(ex.chiffre_affaires) }}</td>
                <td class="py-3 text-right text-gray-600 dark:text-gray-400">{{ ex.statut === 'ouvert' ? '—' : formatCurrency(ex.total_achats) }}</td>
                <td class="py-3 text-right font-semibold"
                  :class="(ex.benefice_net || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'">
                  {{ ex.statut === 'ouvert' ? '—' : formatCurrency(ex.benefice_net) }}
                </td>
                <td class="py-3 text-right text-gray-600 dark:text-gray-400">{{ ex.nb_factures || '—' }}</td>
                <td class="py-3">
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                    :class="ex.statut === 'ouvert'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'">
                    {{ ex.statut === 'ouvert' ? '✓ Ouvert' : '🔒 Clôturé' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- Modal clôture -->
    <Teleport to="body">
      <div v-if="showClotureModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
          <div class="text-center mb-5">
            <div class="w-14 h-14 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-2xl mx-auto mb-3">🔒</div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">Clôturer l'exercice {{ anneeSelectionnee }}</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Cette action est <strong>irréversible</strong>. L'exercice sera verrouillé et un snapshot de toutes les données sera enregistré.
            </p>
          </div>

          <div class="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800/30 rounded-xl p-3 mb-4">
            <p class="text-xs text-orange-700 dark:text-orange-400 font-medium mb-1">Ce qui sera capturé :</p>
            <ul class="text-xs text-orange-600 dark:text-orange-400 space-y-0.5">
              <li>• Chiffre d'affaires total de la période</li>
              <li>• Total des achats (entrées stock)</li>
              <li>• Valeur du stock au moment de la clôture</li>
              <li>• Nombre de factures émises</li>
              <li>• Bénéfice net calculé</li>
            </ul>
          </div>

          <div class="mb-4">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Notes de clôture (optionnel)</label>
            <textarea
              v-model="notesClotureModal"
              placeholder="Observations, remarques particulières..."
              class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
              rows="3"
            ></textarea>
          </div>

          <div class="flex gap-3">
            <button @click="showClotureModal = false" class="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Annuler
            </button>
            <button @click="cloturerExercice" :disabled="actionEnCours"
              class="flex-1 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              <div v-if="actionEnCours" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>{{ actionEnCours ? 'Clôture...' : 'Confirmer la clôture' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useApiBase } from '@/composables/useApiBase'
import { useNotification } from '@/types/useNotification'

definePageMeta({ layout: 'default' })

const { getApiUrl, getAuthHeaders, parseApiList, getEntrepriseId } = useApiBase()
const { success, error } = useNotification()

const anneeSelectionnee = ref(new Date().getFullYear())
const chargement = ref(true)
const chargementRapport = ref(false)
const actionEnCours = ref(false)
const showClotureModal = ref(false)
const notesClotureModal = ref('')

const exerciceCourant = ref<any>(null)
const tousLesExercices = ref<any[]>([])
const rapport = ref<any>(null)

// KPIs calculés
const kpis = computed(() => {
  const r = rapport.value
  const ex = exerciceCourant.value
  if (!r && !ex) return []
  const src = r || ex
  return [
    { icon: '💰', label: 'Chiffre d\'affaires', valeur: formatCurrency(src.chiffre_affaires || 0) },
    { icon: '🛒', label: 'Total achats', valeur: formatCurrency(src.total_achats || 0) },
    { icon: '📈', label: 'Bénéfice net', valeur: formatCurrency(src.benefice_net || 0) },
    { icon: '🧾', label: 'Factures', valeur: String(src.nb_factures || 0) },
    { icon: '📦', label: 'Valeur stock', valeur: formatCurrency(src.valeur_stock || src.valeur_stock_cloture || 0) },
    { icon: '🏷️', label: 'Produits actifs', valeur: String(src.nb_produits || 0) },
  ]
})

// Données mensuelles pour graphique
const donneesMensuelles = ref<{ mois: number; nomMois: string; ca: number }[]>([])
const maxCA = computed(() => Math.max(...donneesMensuelles.value.map(m => m.ca), 1))

// Helpers
function formatCurrency(val: any) {
  const num = parseFloat(val || 0)
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M XAF`
  if (num >= 1_000) return `${(num / 1_000).toFixed(0)}K XAF`
  return `${num.toLocaleString('fr-FR')} XAF`
}

function formatDate(d: string) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Récupérer l'entreprise depuis localStorage
function resolveEntrepriseId(): number | null {
  return getEntrepriseId()
}

async function chargerExercices() {
  const entrepriseId = resolveEntrepriseId()
  if (!entrepriseId) {
    error('Impossible de déterminer l\'entreprise. Reconnectez-vous ou sélectionnez un entrepôt.')
    chargement.value = false
    return
  }

  chargement.value = true
  try {
    const h = getAuthHeaders()
    // Charger tous les exercices
    const allRaw: any = await $fetch(getApiUrl(`/api/exercices-fiscaux/?entreprise=${entrepriseId}`), { headers: h, cache: 'no-store' })
    tousLesExercices.value = parseApiList(allRaw)

    // Exercice de l'année sélectionnée
    const trouve = tousLesExercices.value.find(e => e.annee === anneeSelectionnee.value)
    if (trouve) {
      exerciceCourant.value = trouve
      await chargerRapport()
    } else {
      exerciceCourant.value = null
      rapport.value = null
      donneesMensuelles.value = []
    }
  } catch (e: any) {
    error('Erreur de chargement des exercices')
  } finally {
    chargement.value = false
  }
}

async function chargerRapport() {
  if (!exerciceCourant.value?.id) return
  chargementRapport.value = true
  try {
    const h = getAuthHeaders()
    const data: any = await $fetch(getApiUrl(`/api/exercices-fiscaux/${exerciceCourant.value.id}/rapport/`), { headers: h, cache: 'no-store' })
    // Pour les exercices clôturés (source: 'snapshot'), les chiffres sont dans data.exercice
    const src = data.source === 'snapshot' ? data.exercice : data
    rapport.value = {
      chiffre_affaires: src.chiffre_affaires ?? 0,
      total_achats: src.total_achats ?? 0,
      benefice_net: src.benefice_net ?? 0,
      nb_factures: src.nb_factures ?? 0,
      valeur_stock: src.valeur_stock ?? src.valeur_stock_cloture ?? 0,
      nb_produits: src.nb_produits ?? 0,
      exercice: data.exercice,
      par_entrepot: data.par_entrepot ?? [],
      par_produit: data.par_produit ?? [],
    }
    await chargerDonneesMensuelles()
  } catch {
    rapport.value = null
  } finally {
    chargementRapport.value = false
  }
}

async function chargerDonneesMensuelles() {
  const entrepriseId = resolveEntrepriseId()
  if (!entrepriseId) return
  const moisNoms = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
  const h = getAuthHeaders()
  const annee = anneeSelectionnee.value

  donneesMensuelles.value = await Promise.all(
    moisNoms.map(async (nomMois, i) => {
      const mois = i + 1
      const dateDebut = `${annee}-${String(mois).padStart(2, '0')}-01`
      const dateFin = new Date(annee, mois, 0).toISOString().slice(0, 10)
      try {
        const raw: any = await $fetch(
          getApiUrl(`/api/factures/?entreprise=${entrepriseId}&date_debut=${dateDebut}&date_fin=${dateFin}`),
          { headers: h }
        )
        const factures = parseApiList(raw)
        const ca = factures.reduce((sum: number, f: any) => sum + parseFloat(f.total || 0), 0)
        return { mois, nomMois, ca }
      } catch {
        return { mois, nomMois, ca: 0 }
      }
    })
  )
}

async function ouvrirNouvelExercice() {
  const entrepriseId = resolveEntrepriseId()
  if (!entrepriseId) return
  actionEnCours.value = true
  try {
    const h = getAuthHeaders()
    const annee = exerciceCourant.value?.statut === 'cloture'
      ? anneeSelectionnee.value + 1
      : anneeSelectionnee.value
    await $fetch(getApiUrl('/api/exercices-fiscaux/ouvrir/'), {
      method: 'POST',
      headers: h,
      body: { entreprise: entrepriseId, annee }
    })
    success(`Exercice ${annee} ouvert avec succès`)
    if (annee !== anneeSelectionnee.value) anneeSelectionnee.value = annee
    await chargerExercices()
  } catch (e: any) {
    const msg = e?.data?.message || e?.data?.error || 'Erreur lors de l\'ouverture'
    error(msg)
  } finally {
    actionEnCours.value = false
  }
}

async function cloturerExercice() {
  if (!exerciceCourant.value?.id) return
  actionEnCours.value = true
  try {
    const h = getAuthHeaders()
    await $fetch(getApiUrl(`/api/exercices-fiscaux/${exerciceCourant.value.id}/cloture/`), {
      method: 'POST',
      headers: h,
      body: { notes: notesClotureModal.value }
    })
    success(`Exercice ${anneeSelectionnee.value} clôturé avec succès`)
    showClotureModal.value = false
    notesClotureModal.value = ''
    await chargerExercices()
  } catch (e: any) {
    error(e?.data?.error || 'Erreur lors de la clôture')
  } finally {
    actionEnCours.value = false
  }
}

function telechargerRapport() {
  const ex = exerciceCourant.value
  const r = rapport.value
  if (!ex) return

  const src = r || ex
  const ca = parseFloat(src.chiffre_affaires || 0)
  const achats = parseFloat(src.total_achats || 0)
  const benefice = parseFloat(src.benefice_net || ca - achats)
  const stock = parseFloat(src.valeur_stock || src.valeur_stock_cloture || 0)
  const margeRate = ca > 0 ? ((ca - achats) / ca * 100).toFixed(1) : '0.0'
  const rentaRate = ca > 0 ? (benefice / ca * 100).toFixed(1) : '0.0'

  const fmt = (v: number) => v.toLocaleString('fr-FR', { minimumFractionDigits: 0 }) + ' XAF'
  const now = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })

  const entrepriseData = process.client ? (() => { try { return JSON.parse(localStorage.getItem('boutique') || 'null') } catch { return null } })() : null
  const entrepriseName = entrepriseData?.nom || entrepriseData?.name || 'Entreprise'

  const parEntrepot: any[] = src.par_entrepot ?? rapport.value?.par_entrepot ?? []
  const parProduit: any[] = src.par_produit ?? rapport.value?.par_produit ?? []

  const td = (val: string, right = false, bold = false, color = '') =>
    `<td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;${right ? 'text-align:right;' : ''}${bold ? 'font-weight:600;' : ''}${color ? 'color:' + color + ';' : ''}">${val}</td>`

  const lignesMensuelles = donneesMensuelles.value.length > 0
    ? donneesMensuelles.value.map(m => `<tr>
        ${td(m.nomMois)}
        ${td(fmt(m.ca), true)}
        ${td(ca > 0 ? (m.ca / ca * 100).toFixed(1) + '%' : '—', true, false, m.ca > 0 ? '#059669' : '#9ca3af')}
      </tr>`).join('')
    : `<tr><td colspan="3" style="padding:12px;text-align:center;color:#9ca3af;">Aucune donnée mensuelle</td></tr>`

  const lignesEntrepot = parEntrepot.length > 0
    ? parEntrepot.map(e => `<tr>
        ${td(`${e.nom}${e.ville ? ' — ' + e.ville : ''}`)}
        ${td(String(e.nb_factures), true)}
        ${td(fmt(e.ca), true, true)}
        ${td(fmt(e.total_achats), true)}
        ${td(fmt(e.benefice), true, false, e.benefice >= 0 ? '#059669' : '#dc2626')}
        ${td(fmt(e.valeur_stock), true)}
      </tr>`).join('')
    : `<tr><td colspan="6" style="padding:12px;text-align:center;color:#9ca3af;">Aucun entrepôt</td></tr>`

  const lignesProduit = parProduit.length > 0
    ? parProduit.map((p, i) => `<tr style="${i % 2 === 1 ? 'background:#f9fafb;' : ''}">
        ${td(p.nom)}
        ${td(p.reference || '—', false, false, '#9ca3af')}
        ${td(String(p.qte), true)}
        ${td(fmt(p.ca), true, true)}
        ${td(ca > 0 ? (p.ca / ca * 100).toFixed(1) + '%' : '—', true, false, '#6b7280')}
        ${td(String(p.stock), true)}
      </tr>`).join('')
    : `<tr><td colspan="6" style="padding:12px;text-align:center;color:#9ca3af;">Aucune vente enregistrée</td></tr>`

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Rapport d'exercice fiscal ${ex.annee}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Segoe UI',Arial,sans-serif; color:#111827; background:#fff; padding:32px 40px; max-width:900px; margin:auto; font-size:13px; }
    h1 { font-size:20px; font-weight:700; }
    h2 { font-size:11px; font-weight:700; color:#6b7280; text-transform:uppercase; letter-spacing:.07em;
         margin:28px 0 8px; border-bottom:2px solid #e5e7eb; padding-bottom:5px; }
    .header { display:flex; justify-content:space-between; align-items:flex-start;
              border-bottom:3px solid #111827; padding-bottom:18px; margin-bottom:22px; }
    .badge { display:inline-block; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; }
    .badge-ouvert { background:#d1fae5; color:#065f46; }
    .badge-cloture { background:#fee2e2; color:#991b1b; }
    .kpi-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin:12px 0; }
    .kpi { background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px; padding:12px 14px; }
    .kpi-label { font-size:10px; color:#6b7280; text-transform:uppercase; letter-spacing:.05em; margin-bottom:3px; }
    .kpi-value { font-size:17px; font-weight:700; color:#111827; }
    .kpi-sub { font-size:10px; color:#9ca3af; margin-top:2px; }
    .kpi.green .kpi-value { color:#059669; }
    .kpi.red .kpi-value { color:#dc2626; }
    table { width:100%; border-collapse:collapse; font-size:12px; }
    th { background:#f3f4f6; padding:7px 10px; text-align:left; font-weight:600; color:#374151;
         border-bottom:2px solid #e5e7eb; }
    th.r { text-align:right; }
    .cr-row { display:flex; justify-content:space-between; padding:9px 14px;
              border-bottom:1px solid #f3f4f6; }
    .cr-row.sub { padding-left:28px; color:#6b7280; }
    .cr-row.total { font-weight:700; border-top:2px solid #111827; border-bottom:none;
                    font-size:14px; margin-top:2px; padding:10px 14px; }
    .cr-box { border:1px solid #e5e7eb; border-radius:8px; overflow:hidden; }
    .footer { margin-top:40px; border-top:1px solid #e5e7eb; padding-top:16px;
              display:flex; justify-content:space-between; font-size:11px; color:#9ca3af; }
    .sig-line { width:180px; border-top:1px solid #374151; margin-top:44px;
                font-size:11px; color:#6b7280; padding-top:5px; }
    @media print {
      body { padding:16px 20px; }
      h2 { margin-top:20px; }
      .no-break { page-break-inside:avoid; }
    }
  </style>
</head>
<body>

  <!-- En-tête -->
  <div class="header">
    <div>
      <h1>Rapport d'exercice fiscal</h1>
      <p style="margin-top:5px;font-size:15px;font-weight:600;">${entrepriseName}</p>
      <p style="margin-top:3px;color:#6b7280;">Exercice ${ex.annee} &nbsp;·&nbsp; ${formatDate(ex.date_debut)} au ${formatDate(ex.date_fin)}</p>
    </div>
    <div style="text-align:right;">
      <span class="badge badge-${ex.statut}">${ex.statut === 'ouvert' ? 'En cours' : 'Clôturé'}</span>
      <p style="font-size:11px;color:#9ca3af;margin-top:6px;">Généré le ${now}</p>
    </div>
  </div>

  <!-- KPIs -->
  <h2>Indicateurs clés</h2>
  <div class="kpi-grid">
    <div class="kpi">
      <div class="kpi-label">Chiffre d'affaires</div>
      <div class="kpi-value">${fmt(ca)}</div>
      <div class="kpi-sub">${src.nb_factures || 0} facture(s)</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Total achats</div>
      <div class="kpi-value">${fmt(achats)}</div>
      <div class="kpi-sub">Entrées de stock</div>
    </div>
    <div class="kpi ${benefice >= 0 ? 'green' : 'red'}">
      <div class="kpi-label">Bénéfice net</div>
      <div class="kpi-value">${fmt(benefice)}</div>
      <div class="kpi-sub">Marge ${margeRate}%</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Valeur du stock</div>
      <div class="kpi-value">${fmt(stock)}</div>
      <div class="kpi-sub">${src.nb_produits || 0} produit(s) actif(s)</div>
    </div>
  </div>

  <!-- Compte de résultat -->
  <h2>Compte de résultat simplifié</h2>
  <div class="cr-box no-break">
    <div class="cr-row"><span>Chiffre d'affaires (CA)</span><strong>${fmt(ca)}</strong></div>
    <div class="cr-row sub"><span>— Coût des achats (marchandises)</span><span style="color:#dc2626;">− ${fmt(achats)}</span></div>
    <div class="cr-row"><span>Marge brute</span><strong>${fmt(ca - achats)}</strong></div>
    <div class="cr-row total">
      <span>Résultat net estimé</span>
      <span style="color:${benefice >= 0 ? '#059669' : '#dc2626'};">${fmt(benefice)}</span>
    </div>
  </div>

  <!-- Ratios -->
  <h2>Ratios de performance</h2>
  <table class="no-break">
    <tr><th>Indicateur</th><th class="r">Valeur</th></tr>
    <tr>${td('Taux de marge brute')}${td(margeRate + '%', true)}</tr>
    <tr>${td('Taux de rentabilité nette')}${td(rentaRate + '%', true)}</tr>
    <tr>${td('Panier moyen / facture')}${td(src.nb_factures ? fmt(ca / (src.nb_factures || 1)) : '—', true)}</tr>
    <tr>${td('Valeur du stock actuel')}${td(fmt(stock), true)}</tr>
  </table>

  <!-- Par entrepôt -->
  <h2>Détail par entrepôt</h2>
  <table class="no-break">
    <tr>
      <th>Entrepôt</th>
      <th class="r">Factures</th>
      <th class="r">CA</th>
      <th class="r">Achats</th>
      <th class="r">Bénéfice</th>
      <th class="r">Stock (valeur)</th>
    </tr>
    ${lignesEntrepot}
    <tr style="background:#f3f4f6;font-weight:700;">
      ${td('TOTAL')}
      ${td(String(src.nb_factures || 0), true, true)}
      ${td(fmt(ca), true, true)}
      ${td(fmt(achats), true, true)}
      ${td(fmt(benefice), true, true, benefice >= 0 ? '#059669' : '#dc2626')}
      ${td(fmt(stock), true, true)}
    </tr>
  </table>

  <!-- Par produit -->
  <h2>Détail par produit (ventes de la période)</h2>
  <table>
    <tr>
      <th>Produit</th>
      <th>Référence</th>
      <th class="r">Qté vendue</th>
      <th class="r">CA généré</th>
      <th class="r">Part CA</th>
      <th class="r">Stock actuel</th>
    </tr>
    ${lignesProduit}
    <tr style="background:#f3f4f6;font-weight:700;">
      ${td('TOTAL')}
      ${td('')}
      ${td(String(parProduit.reduce((s: number, p: any) => s + p.qte, 0)), true, true)}
      ${td(fmt(ca), true, true)}
      ${td('100%', true)}
      ${td('')}
    </tr>
  </table>

  <!-- Mensuel -->
  <h2>Répartition mensuelle du CA</h2>
  <table class="no-break">
    <tr><th>Mois</th><th class="r">CA</th><th class="r">Part</th></tr>
    ${lignesMensuelles}
  </table>

  ${ex.notes ? `<h2>Notes</h2><p style="line-height:1.6;color:#374151;">${ex.notes}</p>` : ''}

  <!-- Signatures -->
  <div style="display:flex;gap:80px;margin-top:48px;">
    <div><div class="sig-line">Établi par</div></div>
    <div><div class="sig-line">Approuvé par</div></div>
    <div><div class="sig-line">Cachet de l'entreprise</div></div>
  </div>

  <div class="footer">
    <span>${entrepriseName} &mdash; Rapport exercice fiscal ${ex.annee}</span>
    <span>MuraStorage &mdash; ${now}</span>
  </div>

</body>
</html>`

  const w = window.open('', '_blank', 'width=900,height=700')
  if (!w) { alert('Autorisez les popups pour imprimer le rapport.'); return }
  w.document.open(); w.document.write(html); w.document.close()
  w.focus()
  setTimeout(() => w.print(), 600)
}

let refreshTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  chargerExercices()
  // Auto-refresh toutes les 60 secondes
  refreshTimer = setInterval(() => {
    chargerExercices()
  }, 60_000)
})

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer)
})
</script>
