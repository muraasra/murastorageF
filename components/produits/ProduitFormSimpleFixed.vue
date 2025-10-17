<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { z } from "zod"
import type { FormSubmitEvent } from "#ui/types"
import { useNotification } from '~/types/useNotification'

const { success, error } = useNotification()

const props = defineProps<{
  isOpen: boolean
  produit?: any
  mode: 'create' | 'edit'
}>()

const emit = defineEmits(['close', 'saved'])

// Données réactives
const loading = ref(false)

// Schéma de validation simplifié
const schema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  description: z.string().optional(),
  prix_achat: z.number().min(0, "Le prix d'achat doit être positif"),
  prix_vente: z.number().min(0, "Le prix de vente doit être positif"),
  quantite: z.number().min(0, "La quantité doit être positive"),
  reference: z.string().optional(),
  category: z.string().optional(),
})

type Schema = z.output<typeof schema>

const state = ref<Schema>({
  nom: "",
  description: "",
  prix_achat: 0,
  prix_vente: 0,
  quantite: 0,
  reference: "",
  category: "",
})

// Computed properties
const marge = computed(() => {
  if (state.value.prix_achat && state.value.prix_vente) {
    return ((state.value.prix_vente - state.value.prix_achat) / state.value.prix_achat) * 100
  }
  return 0
})

const margeAbsolue = computed(() => {
  if (state.value.prix_achat && state.value.prix_vente) {
    return state.value.prix_vente - state.value.prix_achat
  }
  return 0
})

// Options pour les selects
const categoryOptions = [
  { value: 'telephone', label: 'Téléphone' },
  { value: 'ordinateur', label: 'Ordinateur' },
  { value: 'accessoire', label: 'Accessoire' },
  { value: 'autre', label: 'Autre' },
]

// Watchers
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    if (props.mode === 'edit' && props.produit) {
      // Remplir le formulaire avec les données du produit
      state.value.nom = props.produit.nom || ""
      state.value.description = props.produit.description || ""
      state.value.prix_achat = props.produit.prix_achat || 0
      state.value.prix_vente = props.produit.prix_vente || 0
      state.value.quantite = props.produit.quantite || 0
      state.value.reference = props.produit.reference || ""
      state.value.category = props.produit.category || ""
    } else {
      // Réinitialiser le formulaire
      state.value = {
        nom: "",
        description: "",
        prix_achat: 0,
        prix_vente: 0,
        quantite: 0,
        reference: "",
        category: "",
      }
    }
  }
})

// Fonctions
const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  loading.value = true
  
  try {
    const productData = {
      nom: event.data.nom,
      description: event.data.description || "",
      prix_achat: event.data.prix_achat,
      prix_vente: event.data.prix_vente,
      quantite: event.data.quantite,
      reference: event.data.reference || "",
      category: event.data.category || "autre",
      actif: true,
      // Champs par défaut pour la compatibilité
      sku: "",
      code_barres: "",
      unite_mesure: "piece",
      stock_minimum: 0,
      stock_maximum: 1000,
      etat_produit: "neuf",
      marque: "",
      modele: "",
      specifications: {},
    }
    
    console.log('Données envoyées:', productData)
    
    // Simuler une réponse réussie
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    success(`Produit ${props.mode === 'create' ? 'créé' : 'modifié'} avec succès!`)
    emit('saved', productData)
    emit('close')
  } catch (err: any) {
    console.error('Erreur:', err)
    error(`Erreur lors de la ${props.mode === 'create' ? 'création' : 'modification'}: ${err.message || 'Erreur inconnue'}`)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UModal :model-value="isOpen" @update:model-value="emit('close')">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">
            {{ mode === 'create' ? 'Créer un nouveau produit' : 'Modifier le produit' }}
          </h3>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark-20-solid"
            @click="emit('close')"
          />
        </div>
      </template>

      <UForm
        :schema="schema"
        :state="state"
        class="space-y-6"
        @submit="onSubmit"
      >
        <!-- Informations de base -->
        <div class="space-y-4">
          <h4 class="text-md font-medium text-gray-900 dark:text-white border-b pb-2">
            Informations de base
          </h4>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormGroup label="Nom du produit *" name="nom">
              <UInput v-model="state.nom" placeholder="Nom du produit" />
            </UFormGroup>
            
            <UFormGroup label="Référence" name="reference">
              <UInput v-model="state.reference" placeholder="Référence produit" />
            </UFormGroup>
          </div>
          
          <UFormGroup label="Description" name="description">
            <UTextarea v-model="state.description" placeholder="Description du produit" />
          </UFormGroup>
          
          <UFormGroup label="Catégorie" name="category">
            <USelect v-model="state.category" :options="categoryOptions" placeholder="Sélectionner une catégorie" />
          </UFormGroup>
        </div>

        <!-- Informations commerciales -->
        <div class="space-y-4">
          <h4 class="text-md font-medium text-gray-900 dark:text-white border-b pb-2">
            Informations commerciales
          </h4>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <UFormGroup label="Prix d'achat *" name="prix_achat">
              <UInput type="number" v-model="state.prix_achat" placeholder="0" />
            </UFormGroup>
            
            <UFormGroup label="Prix de vente *" name="prix_vente">
              <UInput type="number" v-model="state.prix_vente" placeholder="0" />
            </UFormGroup>
            
            <UFormGroup label="Stock actuel *" name="quantite">
              <UInput type="number" v-model="state.quantite" placeholder="0" />
            </UFormGroup>
          </div>
          
          <!-- Calculs automatiques -->
          <div v-if="state.prix_achat && state.prix_vente" class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h5 class="font-medium text-blue-900 dark:text-blue-100 mb-2">Calculs automatiques</h5>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-blue-700 dark:text-blue-300">Marge absolue:</span>
                <span class="font-medium ml-2">{{ margeAbsolue.toFixed(2) }} XAF</span>
              </div>
              <div>
                <span class="text-blue-700 dark:text-blue-300">Marge (%):</span>
                <span class="font-medium ml-2">{{ marge.toFixed(2) }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end space-x-3 pt-4 border-t">
          <UButton type="button" color="gray" variant="outline" @click="emit('close')">
            Annuler
          </UButton>
          <UButton type="submit" color="blue" :loading="loading">
            {{ mode === 'create' ? 'Créer' : 'Modifier' }}
          </UButton>
        </div>
      </UForm>
    </UCard>
  </UModal>
</template>
