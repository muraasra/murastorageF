<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { z } from "zod"
import type { FormSubmitEvent } from "#ui/types"
import { useApi } from '@/stores/useApi'
import { useNotification } from '~/types/useNotification'

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
const entrepots = ref([])
const loading = ref(false)

// Charger les données de référence
const loadReferenceData = async () => {
  try {
    const [categoriesRes, fournisseursRes, entrepotsRes] = await Promise.all([
      useApi('http://127.0.0.1:8000/api/categories/'),
      useApi('http://127.0.0.1:8000/api/fournisseurs/'),
      useApi('http://127.0.0.1:8000/api/boutiques/')
    ])
    
    categories.value = categoriesRes.data.value || []
    fournisseurs.value = fournisseursRes.data.value || []
    entrepots.value = entrepotsRes.data.value || []
  } catch (err) {
    console.error('Erreur lors du chargement des données:', err)
  }
}

// Schéma de validation
const schema = z.object({
  // 1. Identification du produit
  nom: z.string().min(1, "Le nom est requis"),
  sku: z.string().optional(),
  description: z.string().optional(),
  code_barres: z.string().optional(),
  qr_code: z.string().optional(),
  image: z.any().optional(),
  
  // Relations
  categorie: z.number().optional(),
  fournisseur_principal: z.number().optional(),
  
  // 2. Informations commerciales
  prix_achat: z.number().min(0, "Le prix d'achat doit être positif"),
  prix_vente: z.number().min(0, "Le prix de vente doit être positif"),
  prix_gros: z.number().optional(),
  devise: z.string().default('XAF'),
  taux_tva: z.number().min(0).max(100).default(19.25),
  remise_max: z.number().min(0).max(100).default(0),
  
  // 3. Informations logistiques
  unite_mesure: z.string().default('piece'),
  poids: z.number().optional(),
  volume: z.number().optional(),
  stock_minimum: z.number().min(0).default(0),
  stock_maximum: z.number().min(0).default(1000),
  point_commande: z.number().min(0).default(0),
  
  // 4. Informations avancées
  numero_lot: z.string().optional(),
  date_peremption: z.string().optional(),
  dluo: z.string().optional(),
  etat_produit: z.string().default('neuf'),
  couleur: z.string().optional(),
  taille: z.string().optional(),
  variante: z.string().optional(),
  tags: z.array(z.string()).default([]),
  
  // 5. Aspects financiers
  methode_valorisation: z.string().default('FIFO'),
  compte_comptable: z.string().optional(),
  
  // Champs spécifiques aux ordinateurs (compatibilité)
  marque: z.string().optional(),
  modele: z.string().optional(),
  processeur: z.string().optional(),
  ram: z.string().optional(),
  stockage: z.string().optional(),
  systeme_exploitation: z.string().optional(),
  annee: z.number().optional(),
})

type Schema = z.output<typeof schema>

const state = ref<Schema>({
  nom: "",
  sku: "",
  description: "",
  code_barres: "",
  qr_code: "",
  image: null,
  categorie: undefined,
  fournisseur_principal: undefined,
  prix_achat: 0,
  prix_vente: 0,
  prix_gros: undefined,
  devise: 'XAF',
  taux_tva: 19.25,
  remise_max: 0,
  unite_mesure: 'piece',
  poids: undefined,
  volume: undefined,
  stock_minimum: 0,
  stock_maximum: 1000,
  point_commande: 0,
  numero_lot: "",
  date_peremption: "",
  dluo: "",
  etat_produit: 'neuf',
  couleur: "",
  taille: "",
  variante: "",
  tags: [],
  methode_valorisation: 'FIFO',
  compte_comptable: "",
  marque: "",
  modele: "",
  processeur: "",
  ram: "",
  stockage: "",
  systeme_exploitation: "",
  annee: undefined,
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

const methodeValorisationOptions = [
  { value: 'FIFO', label: 'First In, First Out' },
  { value: 'LIFO', label: 'Last In, First Out' },
  { value: 'CUMP', label: 'Coût Unitaire Moyen Pondéré' },
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
    
    // S'assurer que les champs obligatoires sont présents
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
    
    console.log('Données envoyées:', productData)
    
    let response
    if (props.mode === 'create') {
      response = await useApi('http://127.0.0.1:8000/api/produits/', {
        method: 'POST',
        body: productData,
      })
    } else {
      response = await useApi(`http://127.0.0.1:8000/api/produits/${props.produit.id}/`, {
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
        <!-- 1. Identification du produit -->
        <div class="space-y-4">
          <h4 class="text-md font-medium text-gray-900 dark:text-white border-b pb-2">
            1. Identification du produit
          </h4>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormGroup label="Nom du produit *" name="nom">
              <UInput v-model="state.nom" placeholder="Nom du produit" />
            </UFormGroup>
            
            <UFormGroup label="SKU" name="sku">
              <UInput v-model="state.sku" placeholder="Code produit unique" />
            </UFormGroup>
            
            <UFormGroup label="Code-barres" name="code_barres">
              <UInput v-model="state.code_barres" placeholder="Code-barres" />
            </UFormGroup>
            
            <UFormGroup label="QR Code" name="qr_code">
              <UInput v-model="state.qr_code" placeholder="QR Code" />
            </UFormGroup>
          </div>
          
          <UFormGroup label="Description" name="description">
            <UTextarea v-model="state.description" placeholder="Description détaillée du produit" />
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
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <UFormGroup label="Devise" name="devise">
              <USelect v-model="state.devise" :options="deviseOptions" />
            </UFormGroup>
            
            <UFormGroup label="Taux TVA (%)" name="taux_tva">
              <UInput type="number" v-model="state.taux_tva" placeholder="19.25" />
            </UFormGroup>
            
            <UFormGroup label="Remise max (%)" name="remise_max">
              <UInput type="number" v-model="state.remise_max" placeholder="0" />
            </UFormGroup>
          </div>
          
          <!-- Calculs automatiques -->
          <div v-if="prix_achat && prix_vente" class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h5 class="font-medium text-blue-900 dark:text-blue-100 mb-2">Calculs automatiques</h5>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-blue-700 dark:text-blue-300">Marge absolue:</span>
                <span class="font-medium ml-2">{{ margeAbsolue.toFixed(2) }} {{ state.devise }}</span>
              </div>
              <div>
                <span class="text-blue-700 dark:text-blue-300">Marge (%):</span>
                <span class="font-medium ml-2">{{ marge.toFixed(2) }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. Informations logistiques -->
        <div class="space-y-4">
          <h4 class="text-md font-medium text-gray-900 dark:text-white border-b pb-2">
            3. Informations logistiques
          </h4>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <UFormGroup label="Unité de mesure" name="unite_mesure">
              <USelect v-model="state.unite_mesure" :options="uniteMesureOptions" />
            </UFormGroup>
            
            <UFormGroup label="Poids (kg)" name="poids">
              <UInput type="number" v-model="state.poids" placeholder="0" />
            </UFormGroup>
            
            <UFormGroup label="Volume (m³)" name="volume">
              <UInput type="number" v-model="state.volume" placeholder="0" />
            </UFormGroup>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <UFormGroup label="Stock minimum" name="stock_minimum">
              <UInput type="number" v-model="state.stock_minimum" placeholder="0" />
            </UFormGroup>
            
            <UFormGroup label="Stock maximum" name="stock_maximum">
              <UInput type="number" v-model="state.stock_maximum" placeholder="1000" />
            </UFormGroup>
            
            <UFormGroup label="Point de commande" name="point_commande">
              <UInput type="number" v-model="state.point_commande" placeholder="0" />
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

        <!-- 5. Informations avancées -->
        <div class="space-y-4">
          <h4 class="text-md font-medium text-gray-900 dark:text-white border-b pb-2">
            5. Informations avancées
          </h4>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <UFormGroup label="Numéro de lot" name="numero_lot">
              <UInput v-model="state.numero_lot" placeholder="Numéro de lot/série" />
            </UFormGroup>
            
            <UFormGroup label="Date de péremption" name="date_peremption">
              <UInput type="date" v-model="state.date_peremption" />
            </UFormGroup>
            
            <UFormGroup label="DLUO" name="dluo">
              <UInput type="date" v-model="state.dluo" />
            </UFormGroup>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <UFormGroup label="État du produit" name="etat_produit">
              <USelect v-model="state.etat_produit" :options="etatProduitOptions" />
            </UFormGroup>
            
            <UFormGroup label="Couleur" name="couleur">
              <UInput v-model="state.couleur" placeholder="Couleur" />
            </UFormGroup>
            
            <UFormGroup label="Taille" name="taille">
              <UInput v-model="state.taille" placeholder="Taille" />
            </UFormGroup>
            
            <UFormGroup label="Variante" name="variante">
              <UInput v-model="state.variante" placeholder="Variante" />
            </UFormGroup>
          </div>
        </div>

        <!-- 6. Aspects financiers -->
        <div class="space-y-4">
          <h4 class="text-md font-medium text-gray-900 dark:text-white border-b pb-2">
            6. Aspects financiers
          </h4>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormGroup label="Méthode de valorisation" name="methode_valorisation">
              <USelect v-model="state.methode_valorisation" :options="methodeValorisationOptions" />
            </UFormGroup>
            
            <UFormGroup label="Compte comptable" name="compte_comptable">
              <UInput v-model="state.compte_comptable" placeholder="Compte comptable" />
            </UFormGroup>
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
