<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <!-- Guide d'utilisation -->
    <UCard class="mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
      <div class="p-6">
        <div class="flex items-start">
          <UIcon name="i-heroicons-information-circle" class="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3 mt-1 flex-shrink-0" />
          <div>
            <h3 class="font-semibold text-blue-900 dark:text-blue-100 mb-2">Comment utiliser les inventaires ?</h3>
            <ol class="list-decimal list-inside space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <li><strong>Créer un inventaire</strong> : Cliquez sur "Nouvel inventaire". L'entrepôt actuel sera automatiquement sélectionné (vous ne pouvez pas le changer). Tous les produits de cet entrepôt seront ajoutés automatiquement.</li>
              <li><strong>Démarrer l'inventaire</strong> : Cliquez sur le bouton vert "▶️" pour passer en "En cours" et commencer le comptage.</li>
              <li><strong>Comptez les produits</strong> : Cliquez sur l'icône "👁️" pour voir la liste des produits et entrez les quantités réelles trouvées en entrepôt. Les écarts s'afficheront automatiquement.</li>
              <li><strong>Ajuster les stocks</strong> : Cliquez sur le bouton orange "🔄 Ajuster les stocks" pour mettre à jour automatiquement les quantités dans le système. Des mouvements de stock seront créés pour la traçabilité.</li>
              <li><strong>Terminer l'inventaire</strong> : Cliquez sur le bouton violet "⏹️" pour finaliser et visualiser les écarts trouvés.</li>
              <li><strong>Générer le rapport comptable</strong> : Une fois terminé, cliquez sur "Exporter en Excel" pour obtenir un rapport complet avec toutes les valeurs comptables (théoriques, réelles, écarts en quantités et en valeurs).</li>
            </ol>
          </div>
        </div>
      </div>
    </UCard>

    <!-- En-tête -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Inventaires</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Gérez les inventaires physiques de vos entrepôts</p>
      </div>
      <button
        @click="openCreateModal"
        :disabled="false"
        class="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <UIcon name="i-heroicons-plus" class="w-4 h-4" />
        Nouvel inventaire
      </button>
    </div>

    <!-- Statistiques -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <UCard>
        <div class="p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Total</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.total }}</p>
            </div>
            <div class="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <UIcon name="i-heroicons-clipboard-document-list" class="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">En cours</p>
              <p class="text-2xl font-bold text-orange-600">{{ stats.en_cours }}</p>
            </div>
            <div class="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <UIcon name="i-heroicons-clock" class="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Terminés</p>
              <p class="text-2xl font-bold text-green-600">{{ stats.termine }}</p>
            </div>
            <div class="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <UIcon name="i-heroicons-check-circle" class="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Écarts</p>
              <p class="text-2xl font-bold text-red-600">{{ stats.ecarts }}</p>
            </div>
            <div class="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
              <UIcon name="i-heroicons-exclamation-triangle" class="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Liste des inventaires -->
    <UCard>
      <div class="p-6">
        <div v-if="loading" class="text-center py-8">
          <UIcon name="i-heroicons-arrow-path" class="animate-spin h-8 w-8 mx-auto text-blue-600 mb-4" />
          <p class="text-gray-600 dark:text-gray-400">Chargement des inventaires...</p>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-200 dark:border-gray-700">
                <th class="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Numéro</th>
                <th class="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Nom</th>
                <th class="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Entrepôt</th>
                <th class="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Statut</th>
                <th class="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Progression</th>
                <th class="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="inventaire in inventaires" :key="inventaire.id" class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                <td class="py-4 px-4 text-sm text-gray-900 dark:text-white font-mono">{{ inventaire.numero }}</td>
                <td class="py-4 px-4 text-sm text-gray-900 dark:text-white">{{ inventaire.nom }}</td>
                <td class="py-4 px-4 text-sm text-gray-700 dark:text-gray-300">{{ inventaire.entrepot_nom }} - {{ inventaire.entrepot_ville }}</td>
                <td class="py-4 px-4">
                  <UBadge :color="getStatutColor(inventaire.statut)">
                    {{ getStatutLabel(inventaire.statut) }}
                  </UBadge>
                </td>
                <td class="py-4 px-4">
                  <div class="flex items-center">
                    <div class="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                      <div class="bg-blue-600 h-2 rounded-full" :style="{ width: inventaire.progression + '%' }"></div>
                    </div>
                    <span class="text-xs text-gray-600 dark:text-gray-400">{{ inventaire.progression }}%</span>
                  </div>
                </td>
                <td class="py-4 px-4">
                  <div class="flex gap-2" :title="getButtonTooltip(inventaire.statut)">
                    <UButton
                      size="xs"
                      color="blue"
                      variant="ghost"
                      icon="i-heroicons-eye"
                      title="Voir les détails et comptez les produits"
                      @click="viewInventaire(inventaire.id)"
                    />
                    <UButton
                      v-if="inventaire.statut === 'planifie'"
                      size="xs"
                      color="green"
                      variant="ghost"
                      icon="i-heroicons-play"
                      title="Démarrer cet inventaire"
                      @click="demarrerInventaire(inventaire.id)"
                    />
                    <UButton
                      v-if="inventaire.statut === 'en_cours'"
                      size="xs"
                      color="orange"
                      variant="ghost"
                      icon="i-heroicons-arrow-path"
                      title="Ajuster les stocks selon les comptages"
                      @click="ajusterStocks(inventaire.id)"
                    />
                    <UButton
                      v-if="inventaire.statut === 'en_cours'"
                      size="xs"
                      color="purple"
                      variant="ghost"
                      icon="i-heroicons-stop-circle"
                      title="Terminer cet inventaire"
                      @click="terminerInventaire(inventaire.id)"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </UCard>

    <!-- Modal de création -->
    <UModal v-model="showCreateModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Nouvel inventaire</h3>
        </template>
        
        <UForm @submit="createInventaire">
          <div class="space-y-4">
            <UFormGroup label="Nom *" name="nom">
              <UInput v-model="formState.nom" placeholder="Ex: Inventaire annuel 2024" />
            </UFormGroup>
            
            <UFormGroup label="Description" name="description">
              <UTextarea v-model="formState.description" placeholder="Description de l'inventaire" />
            </UFormGroup>
            
            <UFormGroup label="Entrepôt actuel" name="entrepot">
              <UInput
                :model-value="currentEntrepot ? currentEntrepot.nom + ' - ' + currentEntrepot.ville : 'Non assigné'"
                disabled
                class="bg-gray-100 dark:bg-gray-700"
              />
              <template #help>
                <span class="text-xs text-gray-500">Inventaire créé automatiquement pour votre entrepôt assigné</span>
              </template>
            </UFormGroup>
            
            <div class="grid grid-cols-2 gap-4">
              <UFormGroup label="Date de début *" name="date_debut">
                <UInput
                  v-model="formState.date_debut"
                  type="datetime-local"
                />
              </UFormGroup>
              
              <UFormGroup label="Date de fin prévue *" name="date_fin_prevue">
                <UInput
                  v-model="formState.date_fin_prevue"
                  type="datetime-local"
                />
              </UFormGroup>
            </div>
            
            <div class="flex justify-end gap-3 pt-4 border-t">
              <UButton color="gray" variant="outline" @click="showCreateModal = false">
                Annuler
              </UButton>
              <UButton type="submit" color="blue" :loading="loading">
                Créer
              </UButton>
            </div>
          </div>
        </UForm>
      </UCard>
    </UModal>
  </div>
  </div>
</template>

<script setup lang="ts">
import { useNotification } from '@/types/useNotification'
import { useSubscriptionLimits } from '@/composables/useSubscriptionLimits'
import { useApiBase } from '@/composables/useApiBase'

definePageMeta({
  layout: "default"
})

const { success, error, warning } = useNotification()
const { getApiUrl, getAuthHeaders } = useApiBase()
const nuxtApp = useNuxtApp()

// Vérification des limites
const { isLimitReached, isFeatureAvailable, getLimitErrorMessage, loadSubscription, loadLimits, loadUsage, getUpgradeSuggestion } = useSubscriptionLimits()

interface Inventaire {
  id: number
  numero: string
  nom: string
  description: string
  entrepot: number
  entrepot_nom: string
  entrepot_ville: string
  statut: 'planifie' | 'en_cours' | 'termine' | 'annule'
  progression: number
  total_produits: number
  produits_comptes: number
  ecarts_trouves: number
  date_debut: string
  date_fin_prevue: string
  responsable_nom?: string
}

// État
const inventaires = ref<Inventaire[]>([])
const entrepots = ref<any[]>([])
const loading = ref(false)
const showCreateModal = ref(false)
const currentEntrepot = ref<any>(null)

const formState = ref({
  nom: '',
  description: '',
  entrepot: null as number | null,
  date_debut: '',
  date_fin_prevue: ''
})

// Fonction pour récupérer l'entrepôt actuel de l'utilisateur
const getCurrentEntrepot = () => {
  if (process.client) {
    const boutiqueData = localStorage.getItem('boutique')
    if (boutiqueData) {
      try {
        return JSON.parse(boutiqueData)
      } catch (e) {
        console.error('Erreur parsing boutique:', e)
      }
    }
  }
  return null
}

// Statistiques
const stats = computed(() => {
  return {
    total: inventaires.value.length,
    en_cours: inventaires.value.filter(i => i.statut === 'en_cours').length,
    termine: inventaires.value.filter(i => i.statut === 'termine').length,
    ecarts: inventaires.value.reduce((sum, i) => sum + i.ecarts_trouves, 0)
  }
})

import { API_BASE_URL } from '@/constants'

// Fonctions
const loadData = async () => {
  loading.value = true
  try {
    // Récupérer l'entrepôt actuel de l'utilisateur
    currentEntrepot.value = getCurrentEntrepot()
    
    // Charger les inventaires via useApi (gestion automatique du cache - AUCUN CACHE)
    const { data: invData, error: invError } = await useApi('/api/inventaires/')
    if (invError.value) throw invError.value
    inventaires.value = invData.value?.results || invData.value || []
    
    // Charger les entrepôts
    const { data: entData, error: entError } = await useApi('/api/boutiques/')
    if (entError.value) throw entError.value
    entrepots.value = entData.value?.results || entData.value || []
    
  } catch (err: any) {
    console.error('Erreur chargement:', err)
    error('Erreur lors du chargement des données')
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  // Utiliser l'entrepôt actuel de l'utilisateur
  const entrepot = getCurrentEntrepot()
  
  formState.value = {
    nom: '',
    description: '',
    entrepot: entrepot?.id || null,  // Entrepôt actuel pré-rempli et verrouillé
    date_debut: '',
    date_fin_prevue: ''
  }
  showCreateModal.value = true
  
  if (!entrepot) {
    error('Vous devez être assigné à un entrepôt pour créer un inventaire')
  }
}

const createInventaire = async () => {
  // Vérifier la limite de inventaires
  if (isLimitReached('max_inventaires_per_month')) {
    error(getLimitErrorMessage('max_inventaires_per_month'))
    error(getUpgradeSuggestion('inventaires'))
    return
  }

  if (!formState.value.nom || !formState.value.entrepot || !formState.value.date_debut || !formState.value.date_fin_prevue) {
    error('Veuillez remplir tous les champs obligatoires')
    return
  }
  
  loading.value = true
  
  try {
    const token = process.client ? localStorage.getItem('access_token') : null
    
    console.log('Création d\'inventaire avec les données:', {
      nom: formState.value.nom,
      entrepot: formState.value.entrepot,
      date_debut: formState.value.date_debut,
      date_fin_prevue: formState.value.date_fin_prevue
    })
    
    const { data: response, error: createError } = await useApi('/api/inventaires/', {
      method: 'POST',
      body: {
        nom: formState.value.nom,
        description: formState.value.description || '',
        entrepot: formState.value.entrepot,
        date_debut: formState.value.date_debut,
        date_fin_prevue: formState.value.date_fin_prevue
      }
    })
    
    if (createError.value) throw createError.value
    
    const inventaireResponse = response.value
    console.log('Réponse de création:', inventaireResponse)
    
    success(`Inventaire "${formState.value.nom}" créé avec succès! Il contient ${inventaireResponse?.total_produits || 0} produits à inventorier.`)
    showCreateModal.value = false
    
    // Invalider le cache pour voir le nouvel inventaire en temps réel
    if (process.client) {
      const invalidateCache = nuxtApp.$invalidateCacheByPattern
      if (invalidateCache) {
        invalidateCache('/api/inventaires')
        console.log('[Cache] Cache invalidé après création inventaire')
      }
    }
    
    // Recharger la liste des inventaires SANS CACHE
    await loadData()
    
    // Afficher un message explicatif
    setTimeout(() => {
      warning('Cliquez sur "En cours" pour démarrer cet inventaire et commencer le comptage')
    }, 500)
    
  } catch (err: any) {
    console.error('Erreur création inventaire:', err)
    const errorMsg = err.data?.detail || err.data?.error || err.message || 'Erreur lors de la création de l\'inventaire'
    error(errorMsg)
  } finally {
    loading.value = false
  }
}

const viewInventaire = (id: number) => {
  navigateTo(`/inventaires/${id}`)
}

const demarrerInventaire = async (id: number) => {
  if (!confirm('Êtes-vous sûr de vouloir démarrer cet inventaire ? Vous pourrez maintenant commencer à comptez les produits.')) {
    return
  }
  
  loading.value = true
  try {
    const token = process.client ? localStorage.getItem('access_token') : null
    const { data: response, error: demarrageError } = await useApi(`/api/inventaires/${id}/demarrer/`, {
      method: 'POST'
    })
    
    if (demarrageError.value) {
      const errorMsg = (demarrageError.value as any).data?.error || 'Erreur lors du démarrage de l\'inventaire'
      error(errorMsg)
      return
    }
    
    success('Inventaire démarré ! Vous pouvez maintenant commencer à comptez les produits.')
    
    // Recharger les données
    await loadData()
    
    // Suggérer d'ouvrir la page de détail
    setTimeout(() => {
      const inventaireNom = response.value?.inventaire?.nom
      success('Cliquez sur l\'icône 👁️ pour voir les produits à comptez')
    }, 500)
    
  } catch (err: any) {
    console.error('Erreur démarrage:', err)
    error('Erreur lors du démarrage de l\'inventaire')
  } finally {
    loading.value = false
  }
}

const ajusterStocks = async (id: number) => {
  const inventaire = inventaires.value.find(i => i.id === id)
  if (!inventaire) return
  if (inventaire.produits_comptes === 0) {
    error('Aucun produit compté — ajoutez des comptages avant d\'ajuster')
    return
  }
  if (!confirm(`Ajuster les stocks de "${inventaire.nom}" ?\n\nCela mettra à jour les quantités en stock pour correspondre aux comptages réels.\nDes mouvements de stock seront créés pour la traçabilité.`)) return

  loading.value = true
  try {
    const res: any = await $fetch(getApiUrl(`/api/inventaires/${id}/ajuster-stocks/`), {
      method: 'POST',
      headers: getAuthHeaders(),
    })
    success(res?.message || `Stocks ajustés — ${res?.ajustements_effectues ?? ''} mouvement(s) créé(s)`)
    await loadData()
  } catch (err: any) {
    error(err?.data?.error || 'Erreur lors de l\'ajustement des stocks')
  } finally {
    loading.value = false
  }
}

const terminerInventaire = async (id: number) => {
  const inventaire = inventaires.value.find(i => i.id === id)
  if (!inventaire) return
  
  // Vérifier qu'il y a des produits comptés
  if (inventaire.produits_comptes === 0) {
    error('Vous devez comptez au moins un produit avant de terminer l\'inventaire')
    return
  }
  
  // Vérifier que les stocks ont été ajustés (via API car stocks_ajustes n'est pas dans cette interface)
  if (!confirm(`Terminer l'inventaire "${inventaire.nom}" ?\n\nProduits comptés: ${inventaire.produits_comptes}/${inventaire.total_produits}\nÉcarts trouvés: ${inventaire.ecarts_trouves}\n\n⚠️ IMPORTANT: Ajustez d'abord les stocks avant de terminer.`)) {
    return
  }
  
  loading.value = true
  try {
    const { data: response, error: terminerError } = await useApi(`/api/inventaires/${id}/terminer/`, {
      method: 'POST'
    })
    
    if (terminerError.value) {
      const errorMsg = (terminerError.value as any).data?.error || 'Erreur lors de la finalisation de l\'inventaire'
      error(errorMsg)
      return
    }
    
    success(`Inventaire "${inventaire.nom}" terminé ! Écarts trouvés: ${inventaire.ecarts_trouves}`)
    
    // Recharger les données
    await loadData()
  } catch (err: any) {
    console.error('Erreur finalisation:', err)
    error('Erreur lors de la finalisation de l\'inventaire')
  } finally {
    loading.value = false
  }
}

const getStatutColor = (statut: string) => {
  const colors: Record<string, string> = {
    'planifie': 'gray',
    'en_cours': 'orange',
    'termine': 'green',
    'annule': 'red'
  }
  return colors[statut] || 'gray'
}

const getStatutLabel = (statut: string) => {
  const labels: Record<string, string> = {
    'planifie': 'Planifié',
    'en_cours': 'En cours',
    'termine': 'Terminé',
    'annule': 'Annulé'
  }
  return labels[statut] || statut
}

const getButtonTooltip = (statut: string) => {
  const tooltips: Record<string, string> = {
    'planifie': 'Cliquez sur ▶️ pour démarrer, puis 👁️ pour comptez',
    'en_cours': 'Cliquez sur 👁️ pour comptez, puis ⏹️ pour terminer',
    'termine': 'Inventaire terminé - consultez les écarts',
    'annule': 'Inventaire annulé'
  }
  return tooltips[statut] || ''
}

// Auto-refresh
let refreshTimer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  loadSubscription()
  loadLimits()
  loadUsage()
  loadData()
  refreshTimer = setInterval(loadData, 60_000)
})
onUnmounted(() => { if (refreshTimer) clearInterval(refreshTimer) })
</script>

