<template>
  <div class="container mx-auto px-4 py-8">
    <!-- En-tête -->
    <div class="mb-6">
      <UButton
        icon="i-heroicons-arrow-left"
        color="gray"
        variant="ghost"
        @click="navigateTo('/inventaire')"
        class="mb-4"
      >
        Retour
      </UButton>
      
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            <UIcon name="i-heroicons-clipboard-document-check" class="h-8 w-8 inline-block mr-3" />
            {{ inventaire?.nom || 'Chargement...' }}
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mt-2">
            {{ inventaire?.numero }} - {{ inventaire?.entrepot_nom }}
          </p>
        </div>
        <div class="flex gap-2">
          <UButton
            v-if="inventaire && inventaire.statut === 'en_cours' && !inventaire.stocks_ajustes"
            color="orange"
            icon="i-heroicons-arrow-path"
            @click="ajusterStocks"
            :loading="ajusting"
            :disabled="ajusting || loading"
          >
            Ajuster les stocks
          </UButton>
          <UButton
            v-if="inventaire && inventaire.statut === 'termine'"
            color="green"
            icon="i-heroicons-document-arrow-down"
            @click="exportToExcel"
            :disabled="loading"
          >
            Exporter en Excel
          </UButton>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin h-12 w-12 mx-auto text-blue-600" />
    </div>

    <div v-else-if="inventaire">
      <!-- Informations générales -->
      <UCard class="mb-6">
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Statut</p>
              <UBadge :color="getStatutColor(inventaire.statut)">
                {{ getStatutLabel(inventaire.statut) }}
              </UBadge>
            </div>
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Progression</p>
              <div class="flex items-center">
                <div class="w-48 bg-gray-200 dark:bg-gray-700 rounded-full h-3 mr-3">
                  <div class="bg-blue-600 h-3 rounded-full" :style="{ width: inventaire.progression + '%' }"></div>
                </div>
                <span class="text-sm font-bold">{{ inventaire.progression }}%</span>
              </div>
            </div>
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Écarts trouvés</p>
              <p class="text-2xl font-bold text-red-600">{{ inventaire.ecarts_trouves }}</p>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Liste des produits -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">
              Produits à inventorier ({{ inventaire.total_produits }})
            </h3>
            <UInput
              v-model="searchQuery"
              placeholder="Rechercher un produit..."
              icon="i-heroicons-magnifying-glass"
              class="w-64"
            />
          </div>
        </template>

        <div class="p-6">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-gray-200 dark:border-gray-700">
                  <th class="text-left py-3 px-4 text-sm font-semibold">Produit</th>
                  <th class="text-left py-3 px-4 text-sm font-semibold">Quantité théorique</th>
                  <th class="text-left py-3 px-4 text-sm font-semibold">Quantité réelle</th>
                  <th class="text-left py-3 px-4 text-sm font-semibold">Écart</th>
                  <th class="text-left py-3 px-4 text-sm font-semibold">Statut</th>
                  <th class="text-left py-3 px-4 text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="produit in filteredProduits"
                  :key="produit.id"
                  class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td class="py-4 px-4">
                    <div>
                      <p class="font-medium text-gray-900 dark:text-white">{{ produit.produit_nom }}</p>
                      <p class="text-xs text-gray-500">{{ produit.produit_reference || produit.produit_sku }}</p>
                    </div>
                  </td>
                  <td class="py-4 px-4 text-sm text-gray-900 dark:text-white">
                    {{ produit.quantite_theorique }}
                  </td>
                  <td class="py-4 px-4">
                    <UInput
                      v-if="inventaire.statut === 'en_cours'"
                      v-model="editQuantites[produit.id]"
                      type="number"
                      class="w-24"
                      @blur="saveQuantite(produit.id)"
                    />
                    <span v-else class="text-sm text-gray-900 dark:text-white">
                      {{ produit.quantite_reelle !== null ? produit.quantite_reelle : '-' }}
                    </span>
                  </td>
                  <td class="py-4 px-4">
                    <span
                      v-if="produit.est_compte"
                      :class="{
                        'text-red-600 font-bold': produit.ecart !== 0,
                        'text-green-600': produit.ecart === 0
                      }"
                    >
                      {{ produit.ecart > 0 ? '+' : '' }}{{ produit.ecart }}
                    </span>
                    <span v-else class="text-gray-400">-</span>
                  </td>
                  <td class="py-4 px-4">
                    <UBadge v-if="produit.est_compte" color="green">
                      Compté
                    </UBadge>
                    <UBadge v-else color="gray">
                      À faire
                    </UBadge>
                  </td>
                  <td class="py-4 px-4">
                    <UButton
                      v-if="inventaire.statut === 'en_cours' && !produit.est_compte"
                      size="xs"
                      color="blue"
                      @click="openCountModal(produit)"
                      :disabled="saving || loading"
                    >
                      Comptez
                    </UButton>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </UCard>

      <!-- Modal de comptage -->
      <UModal v-model="showCountModal">
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Comptage - {{ selectedProduit?.produit_nom }}</h3>
          </template>

          <div class="space-y-4 p-6">
            <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Quantité théorique</p>
              <p class="text-2xl font-bold">{{ selectedProduit?.quantite_theorique }}</p>
            </div>

            <UFormGroup label="Quantité réelle *" name="quantite_reelle">
              <UInput
                v-model="countForm.quantite_reelle"
                type="number"
                placeholder="Entrez la quantité comptée"
              />
            </UFormGroup>

            <UFormGroup label="Commentaire (optionnel)" name="commentaire">
              <UTextarea
                v-model="countForm.commentaire"
                placeholder="Note ou commentaire sur l'écart"
              />
            </UFormGroup>

            <div class="flex justify-end gap-3 pt-4 border-t">
              <UButton
                color="gray"
                variant="outline"
                @click="showCountModal = false"
                :disabled="saving"
              >
                Annuler
              </UButton>
              <UButton
                color="blue"
                :loading="saving"
                :disabled="saving"
                @click="saveCount"
              >
                Enregistrer
              </UButton>
            </div>
          </div>
        </UCard>
      </UModal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNotification } from '@/types/useNotification'
import * as XLSX from 'xlsx'

definePageMeta({
  layout: "default"
})

const nuxtApp = useNuxtApp()

const route = useRoute()
const inventaireId = route.params.id as string

const { success, error } = useNotification()

interface InventaireProduit {
  id: number
  produit_nom: string
  produit_sku: string
  produit_reference: string
  quantite_theorique: number
  quantite_reelle: number | null
  ecart: number
  est_compte: boolean
  commentaire: string
}

interface Inventaire {
  id: number
  numero: string
  nom: string
  description: string
  entrepot_nom: string
  statut: string
  progression: number
  total_produits: number
  produits_comptes: number
  ecarts_trouves: number
  stocks_ajustes: boolean
  date_ajustement?: string
  produits_detail: InventaireProduit[]
}

const inventaire = ref<Inventaire | null>(null)
const loading = ref(true)
const searchQuery = ref('')
const showCountModal = ref(false)
const selectedProduit = ref<InventaireProduit | null>(null)
const saving = ref(false)
const adjusting = ref(false)
const editQuantites = ref<Record<number, number>>({})

const countForm = ref({
  quantite_reelle: '',
  commentaire: ''
})

import { API_BASE_URL } from '@/constants'

const filteredProduits = computed(() => {
  if (!inventaire.value?.produits_detail) return []
  
  return inventaire.value.produits_detail.filter(p =>
    p.produit_nom.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    (p.produit_reference && p.produit_reference.toLowerCase().includes(searchQuery.value.toLowerCase()))
  )
})

const loadInventaire = async () => {
  loading.value = true
  try {
    // Charger via useApi (gestion automatique du cache)
    const { data, error: loadError } = await useApi(`/api/inventaires/${inventaireId}/`)
    
    if (loadError.value) {
      throw loadError.value
    }
    
    inventaire.value = data.value
    // Initialiser les quantités éditées
    data.value?.produits_detail?.forEach((p: InventaireProduit) => {
      editQuantites.value[p.id] = p.quantite_reelle || p.quantite_theorique
    })
    
  } catch (err: any) {
    console.error('Erreur chargement:', err)
    error('Erreur lors du chargement de l\'inventaire')
  } finally {
    loading.value = false
  }
}

const openCountModal = (produit: InventaireProduit) => {
  selectedProduit.value = produit
  countForm.value = {
    quantite_reelle: produit.quantite_reelle?.toString() || '',
    commentaire: ''
  }
  showCountModal.value = true
}

const saveCount = async () => {
  if (!selectedProduit.value || !countForm.value.quantite_reelle) return
  
  saving.value = true
  try {
    const { error: saveError } = await useApi(`/api/inventaires-produits/${selectedProduit.value.id}/`, {
      method: 'PATCH',
      body: {
        quantite_reelle: parseInt(countForm.value.quantite_reelle),
        commentaire: countForm.value.commentaire
      }
    })
    
    if (saveError.value) {
      error('Erreur lors de l\'enregistrement')
      return
    }
    
    success('Comptage enregistré avec succès!')
    showCountModal.value = false
    
    // Recharger IMMÉDIATEMENT
    await loadInventaire()
    
  } catch (err: any) {
    console.error('Erreur comptage:', err)
    error('Erreur lors de l\'enregistrement')
  } finally {
    saving.value = false
  }
}

const saveQuantite = async (produitId: number) => {
  const quantite = editQuantites.value[produitId]
  if (quantite === undefined) return
  
  // Trouver le produit
  const produit = inventaire.value?.produits_detail?.find(p => p.id === produitId)
  if (!produit) return
  
  // Sauvegarder
  await saveCount()
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

const ajusterStocks = async () => {
  if (!inventaire.value) return
  
  if (!confirm(`Ajuster les stocks de cet inventaire ?\n\nCette action va:\n- Mettre à jour les quantités dans le stock réel\n- Créer des mouvements de stock pour traçabilité\n- Vous ne pourrez plus modifier l'inventaire après\n\nÉcarts trouvés: ${inventaire.value.ecarts_trouves}\nProduits comptés: ${inventaire.value.produits_comptes}/${inventaire.value.total_produits}`)) {
    return
  }
  
  adjusting.value = true
  try {
    const { data: response, error: adjustError } = await useApi(`/api/inventaires/${inventaireId}/ajuster-stocks/`, {
      method: 'POST'
    })
    
    if (adjustError.value) {
      const errorMsg = (adjustError.value as any).data?.error || 'Erreur lors de l\'ajustement des stocks'
      error(errorMsg)
      return
    }
    
    success(`✅ Stocks ajustés avec succès! ${response.value?.ajustements_faits} produit(s) ajusté(s), ${response.value?.mouvements_crees} mouvement(s) de stock créé(s).`)
    
    // Recharger IMMÉDIATEMENT l'inventaire pour voir les nouveaux statuts
    await loadInventaire()
    
  } catch (err: any) {
    console.error('Erreur ajustement:', err)
    error('Erreur lors de l\'ajustement des stocks')
  } finally {
    adjusting.value = false
  }
}

const exportToExcel = async () => {
  try {
    if (!inventaire.value || !inventaire.value.produits_detail) {
      error('Aucune donnée à exporter')
      return
    }
    
    // Préparer les en-têtes pour l'export comptable
    const headers = [
      'Ligne',
      'Code Produit',
      'Nom du Produit',
      'Emplacement',
      'Qté Théorique',
      'Qté Réelle',
      'Écart',
      'Prix d\'achat unit.',
      'Valeur Théorique',
      'Valeur Réelle',
      'Écart en Valeur',
      'Date Comptage',
      'Compteur',
      'Commentaire'
    ]
    
    // Préparer les données
    const data = inventaire.value.produits_detail.map((produit: any, idx) => {
      // Récupérer le prix depuis les données du produit
      const prixAchat = parseFloat(produit.prix_achat || 0)
      const qteTheorique = produit.quantite_theorique
      const qteReelle = produit.quantite_reelle || 0
      const valeurTheorique = prixAchat * qteTheorique
      const valeurReelle = prixAchat * qteReelle
      
      return [
        idx + 1,
        produit.produit_sku || produit.produit_reference || '',
        produit.produit_nom,
        inventaire.value?.entrepot_nom || '',
        qteTheorique,
        produit.est_compte ? qteReelle : '-',
        produit.est_compte ? produit.ecart : '-',
        prixAchat,
        valeurTheorique,
        produit.est_compte ? valeurReelle : 0,
        produit.est_compte ? (valeurReelle - valeurTheorique) : '-',
        produit.date_comptage ? new Date(produit.date_comptage).toLocaleString('fr-FR') : '',
        produit.compteur_nom || '',
        produit.commentaire || ''
      ]
    })
    
    // Calculer les totaux
    const totalValeurTheorique = inventaire.value.produits_detail.reduce((sum, p: any) => {
      const prixAchat = parseFloat(p.prix_achat || 0)
      return sum + (prixAchat * p.quantite_theorique)
    }, 0)
    
    const totalValeurReelle = inventaire.value.produits_detail.reduce((sum, p: any) => {
      if (!p.est_compte) return sum
      const prixAchat = parseFloat(p.prix_achat || 0)
      return sum + (prixAchat * (p.quantite_reelle || 0))
    }, 0)
    
    // Créer le workbook
    const wb = XLSX.utils.book_new()
    
    // Créer la feuille avec les données
    const ws_data = [
      // Informations de l'inventaire
      ['RAPPORT D\'INVENTAIRE PHYSIQUE'],
      [`Numéro: ${inventaire.value.numero}`],
      [`Nom: ${inventaire.value.nom}`],
      [`Entrepôt: ${inventaire.value.entrepot_nom}`],
      [`Date début: ${new Date(inventaire.value.date_debut).toLocaleString('fr-FR')}`],
      [`Date fin: ${inventaire.value.date_fin_reelle ? new Date(inventaire.value.date_fin_reelle).toLocaleString('fr-FR') : new Date(inventaire.value.date_fin_prevue).toLocaleString('fr-FR')}`],
      [`Statut: ${inventaire.value.statut}`],
      [`Progression: ${inventaire.value.progression}%`],
      [''],
      // En-têtes
      headers,
      // Données
      ...data,
      // Ligne vide
      [],
      // Totaux
      ['TOTAUX', '', '', '', '', '', '', 'TOTAL', totalValeurTheorique, totalValeurReelle, totalValeurReelle - totalValeurTheorique, '', '', '']
    ]
    
    const ws = XLSX.utils.aoa_to_sheet(ws_data)
    
    // Largeurs de colonnes
    ws['!cols'] = [
      { wch: 8 },  // Ligne
      { wch: 15 }, // Code Produit
      { wch: 30 }, // Nom
      { wch: 15 }, // Emplacement
      { wch: 12 }, // Qté Théorique
      { wch: 12 }, // Qté Réelle
      { wch: 10 }, // Écart
      { wch: 15 }, // Prix unit.
      { wch: 15 }, // Valeur Théorique
      { wch: 15 }, // Valeur Réelle
      { wch: 15 }, // Écart en Valeur
      { wch: 18 }, // Date
      { wch: 20 }, // Compteur
      { wch: 30 }  // Commentaire
    ]
    
    // Ajouter la feuille au workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Inventaire')
    
    // Nom du fichier
    const filename = `Inventaire_${inventaire.value.numero}_${new Date().toISOString().split('T')[0]}.xlsx`
    
    // Télécharger
    XLSX.writeFile(wb, filename)
    
    success(`Rapport Excel généré et téléchargé avec succès! - ${filename}`)
    
  } catch (err: any) {
    console.error('Erreur export:', err)
    error('Erreur lors de l\'export du rapport Excel')
  }
}

onMounted(() => {
  loadInventaire()
})
</script>

