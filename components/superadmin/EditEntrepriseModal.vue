<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Overlay -->
      <div class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity" @click="$emit('close')"></div>

      <!-- Modal -->
      <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
        <!-- Header -->
        <div class="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="h-10 w-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                </div>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-semibold text-white">Modifier l'entreprise</h3>
                <p class="text-emerald-100 text-sm">Gérez les informations de votre entreprise</p>
              </div>
            </div>
            <button @click="$emit('close')" class="text-white hover:text-emerald-200 transition-colors">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="px-6 py-6">
          <!-- Logo de l'entreprise -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Logo de l'entreprise</label>
            <div class="flex items-center space-x-4">
              <div class="h-24 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden border-2 border-gray-300 dark:border-gray-600 cursor-pointer hover:shadow-lg transition-shadow" @click="showLogoPreview = true">
                <img v-if="logoImage" :src="logoImage" alt="Logo entreprise" class="h-full w-full object-contain p-2">
                <svg v-else class="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
              </div>
              <div>
                <input type="file" @change="handleLogoUpload" accept="image/*" class="hidden" ref="logoInput">
                <button @click="() => logoInput?.click()" class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm">
                  Changer le logo
                </button>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">JPG, PNG jusqu'à 2MB</p>
              </div>
            </div>
          </div>

          <!-- Formulaire -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Informations de base -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ID</label>
              <input v-model="form.id" type="text" disabled class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ID Entreprise</label>
              <input v-model="form.id_entreprise" type="text" disabled class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nom de l'entreprise *</label>
              <input v-model="form.nom" type="text" required class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white transition-colors">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Secteur d'activité</label>
              <select v-model="form.secteur_activite" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white transition-colors">
                <option value="">Sélectionner un secteur</option>
                <option value="technologie">Technologie</option>
                <option value="commerce">Commerce</option>
                <option value="industrie">Industrie</option>
                <option value="services">Services</option>
                <option value="agriculture">Agriculture</option>
                <option value="construction">Construction</option>
                <option value="sante">Santé</option>
                <option value="education">Éducation</option>
                <option value="finance">Finance</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ville *</label>
              <input v-model="form.ville" type="text" required class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white transition-colors">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Code postal</label>
              <input v-model="form.code_postal" type="text" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white transition-colors">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pays</label>
              <input v-model="form.pays" type="text" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white transition-colors">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Téléphone</label>
              <input v-model="form.telephone" type="tel" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white transition-colors">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <input v-model="form.email" type="email" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white transition-colors">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Site web</label>
              <input v-model="form.site_web" type="url" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white transition-colors">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre d'employés</label>
              <input v-model.number="form.nombre_employes" type="number" min="0" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white transition-colors">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Année de création</label>
              <input v-model.number="form.annee_creation" type="number" min="1900" :max="new Date().getFullYear()" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white transition-colors">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Numéro fiscal</label>
              <input v-model="form.numero_fiscal" type="text" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white transition-colors">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Durée du pack</label>
              <select v-model="form.pack_duree" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white transition-colors">
                <option value="mensuel">Mensuel</option>
                <option value="trimestriel">Trimestriel</option>
                <option value="annuel">Annuel</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Statut</label>
              <select v-model="form.is_active" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white transition-colors">
                <option value="true">Actif</option>
                <option value="false">Inactif</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date de création</label>
              <input v-model="form.created_at" type="text" disabled class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Dernière modification</label>
              <input v-model="form.updated_at" type="text" disabled class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400">
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
              <textarea v-model="form.description" rows="3" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white transition-colors"></textarea>
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Adresse complète</label>
              <textarea v-model="form.adresse" rows="3" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white transition-colors"></textarea>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-end space-x-3">
          <button @click="$emit('close')" class="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
            Annuler
          </button>
          <button @click="updateEntreprise" :disabled="loading" class="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 transition-colors">
            <span v-if="!loading">Enregistrer les modifications</span>
            <span v-else class="flex items-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sauvegarde...
            </span>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Modal de prévisualisation du logo -->
    <div v-if="showLogoPreview && logoImage" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <!-- Overlay -->
        <div class="fixed inset-0 bg-black bg-opacity-90 backdrop-blur-sm transition-opacity" @click="showLogoPreview = false"></div>

        <!-- Modal -->
        <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <!-- Header -->
          <div class="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="h-10 w-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-semibold text-white">Prévisualisation du logo</h3>
                  <p class="text-emerald-100 text-sm">{{ form.nom || 'Entreprise' }}</p>
                </div>
              </div>
              <button @click="showLogoPreview = false" class="text-white hover:text-emerald-200 transition-colors">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Content -->
          <div class="px-6 py-6">
            <div class="flex justify-center">
              <div class="max-w-2xl w-full">
                <div class="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 flex items-center justify-center">
                  <img :src="logoImage" :alt="`Logo ${form.nom}`" class="max-w-full max-h-96 object-contain">
                </div>
                <div class="mt-4 text-center">
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Cliquez en dehors de l'image ou sur la croix pour fermer
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useNotification } from '@/types/useNotification'
import { useAuth } from '@/composables/useAuth'
import { API_BASE_URL } from '@/constants'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits(['close', 'updated'])

const { error, success } = useNotification()
const { getAuthHeaders } = useAuth()
const loading = ref(false)
const showLogoPreview = ref(false)

const form = reactive({
  id: '',
  id_entreprise: '',
  nom: '',
  description: '',
  secteur_activite: '',
  ville: '',
  code_postal: '',
  pays: 'Cameroun',
  telephone: '',
  email: '',
  site_web: '',
  pack_type: 'basique',
  nombre_employes: 0,
  annee_creation: new Date().getFullYear(),
  numero_fiscal: '',
  pack_prix: 0,
  pack_duree: 'mensuel',
  is_active: true,
  created_at: '',
  updated_at: '',
  adresse: ''
})

const logoImage = ref('')

const loadEntrepriseData = async () => {
  if (!process.client) return

  const cached = localStorage.getItem('entreprise')
  if (!cached) return

  let entrepriseData = JSON.parse(cached)

  // Toujours tenter de récupérer la dernière version depuis l'API
  try {
    const entrepriseId = entrepriseData.id
    if (entrepriseId) {
      const latest = await $fetch(`${API_BASE_URL}/api/entreprises/${entrepriseId}/`, {
        method: 'GET',
        headers: getAuthHeaders()
      })
      entrepriseData = latest || entrepriseData
      localStorage.setItem('entreprise', JSON.stringify(entrepriseData))
    }
  } catch (e) {
    // En cas d'échec, on utilise les données en cache
  }

  Object.assign(form, {
    id: entrepriseData.id || '',
    id_entreprise: entrepriseData.id_entreprise || '',
    nom: entrepriseData.nom || '',
    description: entrepriseData.description || '',
    secteur_activite: entrepriseData.secteur_activite || '',
    ville: entrepriseData.ville || '',
    code_postal: entrepriseData.code_postal || '',
    pays: entrepriseData.pays || 'Cameroun',
    telephone: entrepriseData.telephone || '',
    email: entrepriseData.email || '',
    site_web: entrepriseData.site_web || '',
    pack_type: entrepriseData.pack_type || 'basique',
    nombre_employes: entrepriseData.nombre_employes || 0,
    annee_creation: entrepriseData.annee_creation || new Date().getFullYear(),
    numero_fiscal: entrepriseData.numero_fiscal || '',
    pack_prix: entrepriseData.pack_prix || 0,
    pack_duree: entrepriseData.pack_duree || 'mensuel',
    is_active: entrepriseData.is_active !== undefined ? entrepriseData.is_active : true,
    created_at: entrepriseData.created_at || '',
    updated_at: entrepriseData.updated_at || '',
    adresse: entrepriseData.adresse || ''
  })

  // Normaliser l'URL du logo pour affichage
  if (entrepriseData.logo && typeof entrepriseData.logo === 'string') {
    const logo = entrepriseData.logo as string
    const isAbsolute = /^https?:\/\//i.test(logo)
    const normalized = isAbsolute ? logo : `${API_BASE_URL}${logo.startsWith('/') ? logo : `/${logo}`}`
    logoImage.value = normalized
  } else {
    logoImage.value = ''
  }
}

const logoFile = ref<File | null>(null)
const logoInput = ref<HTMLInputElement | null>(null)

const handleLogoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    if (file.size > 2 * 1024 * 1024) {
      error('Le fichier doit faire moins de 2MB')
      return
    }
    
    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      error('Veuillez sélectionner un fichier image')
      return
    }
    
    logoFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      logoImage.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const updateEntreprise = async () => {
  if (!form.nom || !form.ville || !form.email || !form.annee_creation || !form.adresse) {
    error('Veuillez remplir tous les champs obligatoires: nom, ville, email, année de création et adresse')
    return
  }

  loading.value = true

  try {
    const entreprise = localStorage.getItem('entreprise')
    if (!entreprise) {
      error('Informations entreprise manquantes')
      return
    }

    const entrepriseData = JSON.parse(entreprise)
    const entrepriseId = entrepriseData.id

    const updateData: any = {}
    
    // Ne pas envoyer de champs vides ou null
    if (form.nom && form.nom.trim()) {
      updateData.nom = form.nom.trim()
    }
    if (form.description && form.description.trim()) {
      updateData.description = form.description.trim()
    }
    if (form.secteur_activite && form.secteur_activite.trim()) {
      updateData.secteur_activite = form.secteur_activite.trim()
    }
    if (form.ville && form.ville.trim()) {
      updateData.ville = form.ville.trim()
    }
    if (form.code_postal && form.code_postal.trim()) {
      updateData.code_postal = form.code_postal.trim()
    }
    if (form.pays && form.pays.trim()) {
      updateData.pays = form.pays.trim()
    }
    if (form.telephone && form.telephone.trim()) {
      updateData.telephone = form.telephone.trim()
    }
    if (form.email && form.email.trim()) {
      updateData.email = form.email.trim()
    }
    if (form.site_web && form.site_web.trim()) {
      updateData.site_web = form.site_web.trim()
    }
    // pack_type non envoyé
    if (form.nombre_employes !== undefined && form.nombre_employes !== null) {
      updateData.nombre_employes = form.nombre_employes
    }
    if (form.annee_creation !== undefined && form.annee_creation !== null) {
      updateData.annee_creation = form.annee_creation
    }
    if (form.numero_fiscal && form.numero_fiscal.trim()) {
      updateData.numero_fiscal = form.numero_fiscal.trim()
    }
    // pack_prix non envoyé
    if (form.pack_duree && form.pack_duree.trim()) {
      updateData.pack_duree = form.pack_duree.trim()
    }
    if (form.is_active !== undefined && form.is_active !== null) {
      updateData.is_active = form.is_active
    }
    if (form.adresse && form.adresse.trim()) {
      updateData.adresse = form.adresse.trim()
    }

    try {
      let data: any
      
      // Si un nouveau logo est sélectionné, utiliser FormData
      if (logoFile.value) {
        const formData = new FormData()
        
        // Ajouter tous les champs de données
        Object.keys(updateData).forEach(key => {
          formData.append(key, updateData[key])
        })
        
        // Ajouter le fichier logo
        formData.append('logo', logoFile.value)
        
        // Headers pour FormData (sans Content-Type pour laisser le navigateur le définir)
        const headers = getAuthHeaders()
        delete headers['Content-Type']
        
        data = await $fetch(`${API_BASE_URL}/api/entreprises/${entrepriseId}/`, {
          method: 'PATCH',
          body: formData,
          headers
        })
      } else {
        // Pas de nouveau logo, mise à jour normale
        data = await $fetch(`${API_BASE_URL}/api/entreprises/${entrepriseId}/`, {
          method: 'PATCH',
          body: updateData,
          headers: getAuthHeaders()
        })
      }
      
      // Mettre à jour logoImage avec l'URL du serveur si disponible
      if (data.logo) {
        logoImage.value = data.logo
      }
      
      // Mettre à jour le localStorage
      if (process.client) {
        const updatedEntreprise = { ...entrepriseData, ...updateData }
        // Ajouter l'URL du logo si disponible
        if (data.logo) {
          updatedEntreprise.logo = data.logo
        }
        localStorage.setItem('entreprise', JSON.stringify(updatedEntreprise))
      }
      
    } catch (apiError: any) {
      error('Erreur lors de la mise à jour de l\'entreprise: ' + (apiError.data?.message || apiError.message))
      return
    }

    success('Entreprise mise à jour avec succès')
    emit('updated')
    emit('close')
  } catch (err) {
    console.error('Erreur mise à jour entreprise:', err)
    error('Une erreur est survenue')
  } finally {
    loading.value = false
  }
}

watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    loadEntrepriseData()
  }
})
</script>