<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { z } from "zod"
import type { FormSubmitEvent } from "#ui/types"
import { useApi } from '@/stores/useApi'
import { useNotification } from '~/types/useNotification'
import { API_BASE_URL } from '@/constants'

const { success, error } = useNotification()

const props = defineProps<{
  isOpen: boolean
  produit?: any
  mode: 'create' | 'edit'
}>()

const emit = defineEmits(['close', 'saved'])

// Données réactives
const categories = ref([])
const fournisseurs = ref([])
const loading = ref(false)

// Charger les données de référence
const loadReferenceData = async () => {
  try {
    const [categoriesRes, fournisseursRes] = await Promise.all([
      useApi(`${API_BASE_URL}/api/categories/`),
      useApi(`${API_BASE_URL}/api/fournisseurs/`)
    ])
    
    categories.value = categoriesRes.data.value || []
    fournisseurs.value = fournisseursRes.data.value || []
  } catch (err) {
    console.error('Erreur lors du chargement des données:', err)
  }
}

// Schéma de validation optimisé
const schema = z.object({
  // Champs essentiels
  nom: z.string().min(1, "Le nom est requis"),
  description: z.string().optional(),
  prix_achat: z.number().min(0, "Le prix d'achat doit être positif"),
  prix_vente: z.number().min(0, "Le prix de vente doit être positif"),
  prix_gros: z.number().optional(),
  
  // Champs optionnels
  sku: z.string().optional(),
  code_barres: z.string().optional(),
  image: z.any().optional(),
  
  // Relations
  categorie: z.number().optional(),
  fournisseur_principal: z.number().optional(),
  
  // Gestion des stocks
  unite_mesure: z.string().default('piece'),
  stock_minimum: z.number().min(0).default(0),
  stock_maximum: z.number().min(0).default(1000),
  
  // État et spécifications
  etat_produit: z.string().default('neuf'),
  marque: z.string().optional(),
  modele: z.string().optional(),
  specifications: z.object({}).optional(),
  
  // Compatibilité
  reference: z.string().optional(),
  category: z.string().optional(),
})

type Schema = z.output<typeof schema>

const state = ref<Schema>({
  nom: "",
  description: "",
  prix_achat: 0,
  prix_vente: 0,
  prix_gros: undefined,
  sku: "",
  code_barres: "",
  image: null,
  categorie: undefined,
  fournisseur_principal: undefined,
  unite_mesure: 'piece',
  stock_minimum: 0,
  stock_maximum: 1000,
  etat_produit: 'neuf',
  marque: "",
  modele: "",
  specifications: {},
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
const deviseOptions = [
  { value: 'XAF', label: 'Franc CFA' },
  { value: 'EUR', label: 'Euro' },
  { value: 'USD', label: 'Dollar US' },
]

const uniteMesureOptions = [
  { value: 'piece', label: 'Pièce' },
  { value: 'kg', label: 'Kilogramme' },
  { value: 'g', label: 'Gramme' },
  { value: 'l', label: 'Litre' },
  { value: 'ml', label: 'Millilitre' },
  { value: 'm', label: 'Mètre' },
  { value: 'cm', label: 'Centimètre' },
  { value: 'carton', label: 'Carton' },
  { value: 'paquet', label: 'Paquet' },
]

const etatProduitOptions = [
  { value: 'neuf', label: 'Neuf' },
  { value: 'occasion', label: 'Occasion' },
  { value: 'reconditionne', label: 'Reconditionné' },
  { value: 'defectueux', label: 'Défectueux' },
]

const categoryOptions = [
  { value: 'telephone', label: 'Téléphone' },
  { value: 'ordinateur', label: 'Ordinateur' },
  { value: 'accessoire', label: 'Accessoire' },
  { value: 'ecran', label: 'Écran' },
  { value: 'imprimante', label: 'Imprimante' },
  { value: 'tablette', label: 'Tablette' },
  { value: 'casque', label: 'Casque' },
  { value: 'clavier', label: 'Clavier' },
  { value: 'souris', label: 'Souris' },
  { value: 'modem', label: 'Modem' },
  { value: 'disquedur', label: 'Disque dur' },
  { value: 'cleusb', label: 'Clé USB' },
  { value: 'autre', label: 'Autre' },
]

// Watchers
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    loadReferenceData()
    if (props.mode === 'edit' && props.produit) {
      // Remplir le formulaire avec les données du produit
      Object.keys(state.value).forEach(key => {
        if (props.produit[key] !== undefined) {
          state.value[key] = props.produit[key]
        }
      })
    }
  }
})

// Fonctions
const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  loading.value = true
  
  try {
    const userData = JSON.parse(localStorage.getItem('user') || '{}')
    const entrepriseData = JSON.parse(localStorage.getItem('entreprise') || '{}')
    
    const productData = {
      ...event.data,
      entreprise: entrepriseData.id,
      actif: true,
    }
    
    // Nettoyer les données - ne pas envoyer les champs vides
    Object.keys(productData).forEach(key => {
      if (productData[key] === '' || productData[key] === null || productData[key] === undefined) {
        delete productData[key]
      }
    })
    
    // Validation des champs obligatoires
    if (!productData.nom) {
      error('Le nom du produit est requis')
      loading.value = false
      return
    }
    
    if (!productData.prix_achat || productData.prix_achat <= 0) {
      error('Le prix d\'achat doit être supérieur à 0')
      loading.value = false
      return
    }
    
    if (!productData.prix_vente || productData.prix_vente <= 0) {
      error('Le prix de vente doit être supérieur à 0')
      loading.value = false
      return
    }
    
    if (productData.prix_vente <= productData.prix_achat) {
      error('Le prix de vente doit être supérieur au prix d\'achat')
      loading.value = false
      return
    }
    
    console.log('Données envoyées:', productData)
    
    let response
    if (props.mode === 'create') {
      response = await useApi(`${API_BASE_URL}/api/produits/`, {
        method: 'POST',
        body: productData,
      })
    } else {
      response = await useApi(`${API_BASE_URL}/api/produits/${props.produit.id}/`, {
        method: 'PUT',
        body: productData,
      })
    }
    
    if (!response.error.value) {
      success(`Produit ${props.mode === 'create' ? 'créé' : 'modifié'} avec succès!`)
      emit('saved', response.data.value)
      emit('close')
    } else {
      console.error('Erreur API:', response.error.value)
      error(`Erreur lors de la ${props.mode === 'create' ? 'création' : 'modification'}: ${response.error.value.message || 'Erreur inconnue'}`)
    }
  } catch (err) {
    console.error('Erreur:', err)
    error('Une erreur est survenue')
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  Object.keys(state.value).forEach(key => {
    if (typeof state.value[key] === 'string') {
      state.value[key] = ""
    } else if (typeof state.value[key] === 'number') {
      state.value[key] = 0
    } else if (Array.isArray(state.value[key])) {
      state.value[key] = []
    } else if (typeof state.value[key] === 'object') {
      state.value[key] = {}
    } else {
      state.value[key] = undefined
    }
  })
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
        <!-- 1. Informations de base -->
        <div class="space-y-4">
          <h4 class="text-md font-medium text-gray-900 dark:text-white border-b pb-2">
            1. Informations de base
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
          
          <UFormGroup label="Image du produit" name="image">
            <UInput type="file" accept="image/*" @change="state.image = $event.target.files[0]" />
          </UFormGroup>
        </div>

        <!-- 2. Informations commerciales -->
        <div class="space-y-4">
          <h4 class="text-md font-medium text-gray-900 dark:text-white border-b pb-2">
            2. Informations commerciales
          </h4>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <UFormGroup label="Prix d'achat *" name="prix_achat">
              <UInput type="number" v-model="state.prix_achat" placeholder="0" />
            </UFormGroup>
            
            <UFormGroup label="Prix de vente *" name="prix_vente">
              <UInput type="number" v-model="state.prix_vente" placeholder="0" />
            </UFormGroup>
            
            <UFormGroup label="Prix de gros" name="prix_gros">
              <UInput type="number" v-model="state.prix_gros" placeholder="0" />
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

        <!-- 3. Gestion des stocks -->
        <div class="space-y-4">
          <h4 class="text-md font-medium text-gray-900 dark:text-white border-b pb-2">
            3. Gestion des stocks
          </h4>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <UFormGroup label="Unité de mesure" name="unite_mesure">
              <USelect v-model="state.unite_mesure" :options="uniteMesureOptions" />
            </UFormGroup>
            
            <UFormGroup label="Stock minimum" name="stock_minimum">
              <UInput type="number" v-model="state.stock_minimum" placeholder="0" />
            </UFormGroup>
            
            <UFormGroup label="Stock maximum" name="stock_maximum">
              <UInput type="number" v-model="state.stock_maximum" placeholder="1000" />
            </UFormGroup>
          </div>
        </div>

        <!-- 4. Relations -->
        <div class="space-y-4">
          <h4 class="text-md font-medium text-gray-900 dark:text-white border-b pb-2">
            4. Relations
          </h4>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormGroup label="Catégorie" name="categorie">
              <USelect 
                v-model="state.categorie" 
                :options="categories.map(c => ({ value: c.id, label: c.nom }))"
                placeholder="Sélectionner une catégorie"
              />
            </UFormGroup>
            
            <UFormGroup label="Fournisseur principal" name="fournisseur_principal">
              <USelect 
                v-model="state.fournisseur_principal" 
                :options="fournisseurs.map(f => ({ value: f.id, label: f.nom }))"
                placeholder="Sélectionner un fournisseur"
              />
            </UFormGroup>
          </div>
        </div>

        <!-- 5. Informations supplémentaires -->
        <div class="space-y-4">
          <h4 class="text-md font-medium text-gray-900 dark:text-white border-b pb-2">
            5. Informations supplémentaires
          </h4>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <UFormGroup label="État du produit" name="etat_produit">
              <USelect v-model="state.etat_produit" :options="etatProduitOptions" />
            </UFormGroup>
            
            <UFormGroup label="Marque" name="marque">
              <UInput v-model="state.marque" placeholder="Marque du produit" />
            </UFormGroup>
            
            <UFormGroup label="Modèle" name="modele">
              <UInput v-model="state.modele" placeholder="Modèle du produit" />
            </UFormGroup>
          </div>
          
          <!-- Catégorie de compatibilité -->
          <UFormGroup label="Catégorie (compatibilité)" name="category">
            <USelect v-model="state.category" :options="categoryOptions" placeholder="Sélectionner une catégorie" />
          </UFormGroup>
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
