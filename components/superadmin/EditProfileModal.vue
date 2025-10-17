<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Overlay -->
      <div class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity" @click="$emit('close')"></div>

      <!-- Modal -->
      <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
        <!-- Header -->
        <div class="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="h-10 w-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-semibold text-white">Modifier mon profil</h3>
                <p class="text-blue-100 text-sm">Gérez vos informations personnelles</p>
              </div>
            </div>
            <button @click="$emit('close')" class="text-white hover:text-blue-200 transition-colors">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="px-6 py-6">
          <!-- Mode d'affichage / édition -->
          <div class="flex items-center justify-between mb-4">
            <span class="text-sm text-gray-500 dark:text-gray-400">
              {{ isEditing ? 'Mode édition' : 'Mode lecture' }}
            </span>
            <button v-if="!isEditing" @click="isEditing = true" class="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Modifier
            </button>
          </div>
          <!-- Photo de profil -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Photo de profil</label>
            <div class="flex items-center space-x-4">
              <div class="h-20 w-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-300 dark:border-gray-600">
                <img v-if="profileImage" :src="profileImage" alt="Photo de profil" class="h-full w-full object-cover rounded-full">
                <svg v-else class="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <div>
                <input type="file" @change="handleImageUpload" accept="image/*" class="hidden" ref="imageInput">
                <button @click="$refs.imageInput.click()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  Changer la photo
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
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Username</label>
              <input v-model="form.username" type="text" disabled class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Prénom *</label>
              <input v-model="form.first_name" :disabled="!isEditing" type="text" required class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors" :class="{ 'bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400': !isEditing }">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nom *</label>
              <input v-model="form.last_name" :disabled="!isEditing" type="text" required class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors" :class="{ 'bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400': !isEditing }">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <input v-model="form.email" type="email" disabled class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rôle</label>
              <select v-model="form.role" disabled class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400">
                <option value="superadmin">SuperAdmin</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Téléphone</label>
              <input v-model="form.telephone" :disabled="!isEditing" type="tel" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors" :class="{ 'bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400': !isEditing }">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Poste</label>
              <input v-model="form.poste" :disabled="!isEditing" type="text" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors" :class="{ 'bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400': !isEditing }">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date d'embauche</label>
              <input v-model="form.date_embauche" :disabled="!isEditing" type="date" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors" :class="{ 'bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400': !isEditing }">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Statut employé</label>
              <select v-model="form.is_active_employee" :disabled="!isEditing" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors" :class="{ 'bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400': !isEditing }">
                <option value="true">Actif</option>
                <option value="false">Inactif</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ID Entreprise</label>
              <input v-model="form.entreprise" type="text" disabled class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nom Entreprise</label>
              <input v-model="form.entreprise_nom" type="text" disabled class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400">
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
              <label class="inline-flex items-center text-sm text-gray-700 dark:text-gray-300">
                <input type="checkbox" v-model="changePassword" :disabled="!isEditing" class="mr-2">
                Modifier mon mot de passe
              </label>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1" v-if="!changePassword">Coché pour afficher les champs de mot de passe</p>
            </div>
            <template v-if="changePassword">
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ancien mot de passe</label>
                <input v-model="form.old_password" :disabled="!isEditing" type="password" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors">
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nouveau mot de passe</label>
                <input v-model="form.new_password" :disabled="!isEditing" type="password" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors">
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirmer le nouveau mot de passe</label>
                <input v-model="form.confirm_new_password" :disabled="!isEditing" type="password" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors">
              </div>
            </template>
          </div>
        </div>

        <!-- Footer -->
        <div class="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-end space-x-3">
          <button @click="$emit('close')" class="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
            {{ isEditing ? 'Annuler' : 'Fermer' }}
          </button>
          <button v-if="isEditing" @click="updateProfile" :disabled="loading" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors">
            <span v-if="!loading">Enregistrer</span>
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
const isEditing = ref(false)
const changePassword = ref(false)

const form = reactive({
  id: '',
  username: '',
  first_name: '',
  last_name: '',
  email: '',
  role: '',
  telephone: '',
  poste: '',
  date_embauche: '',
  is_active_employee: true,
  entreprise: '',
  entreprise_nom: '',
  created_at: '',
  updated_at: '',
  old_password: '',
  new_password: '',
  confirm_new_password: ''
})

const profileImage = ref('')

const loadUserData = () => {
  if (process.client) {
    const user = localStorage.getItem('user')
    if (user) {
      const userData = JSON.parse(user)
      Object.assign(form, {
        id: userData.id || '',
        username: userData.username || '',
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        email: userData.email || '',
        role: userData.role || '',
        telephone: userData.telephone || '',
        poste: userData.poste || '',
        date_embauche: userData.date_embauche || '',
        is_active_employee: userData.is_active_employee !== undefined ? userData.is_active_employee : true,
        entreprise: userData.entreprise || '',
        entreprise_nom: userData.entreprise_nom || '',
        created_at: userData.created_at || '',
        updated_at: userData.updated_at || '',
        password: '',
        confirm_password: ''
      })
      profileImage.value = userData.profile_image || ''
    }
  }
}

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    if (file.size > 2 * 1024 * 1024) {
      error('Le fichier doit faire moins de 2MB')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      profileImage.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const updateProfile = async () => {
  if (changePassword.value) {
    if (!form.old_password || !form.new_password || !form.confirm_new_password) {
      error('Veuillez remplir tous les champs de mot de passe')
      return
    }
    if (form.new_password !== form.confirm_new_password) {
      error('Les nouveaux mots de passe ne correspondent pas')
      return
    }
  }

  loading.value = true
  try {
    const user = localStorage.getItem('user')
    if (!user) {
      error('Informations utilisateur manquantes')
      return
    }
    
    const userData = JSON.parse(user)
    const userId = userData.id

    const updateData: any = {}
    
    // Ne pas envoyer de champs vides ou null
    if (form.first_name && form.first_name.trim()) {
      updateData.first_name = form.first_name.trim()
    }
    if (form.last_name && form.last_name.trim()) {
      updateData.last_name = form.last_name.trim()
    }
    if (form.telephone && form.telephone.trim()) {
      updateData.telephone = form.telephone.trim()
    }
    if (form.poste && form.poste.trim()) {
      updateData.poste = form.poste.trim()
    }
    if (form.date_embauche && form.date_embauche.trim()) {
      updateData.date_embauche = form.date_embauche.trim()
    }
    if (form.is_active_employee !== undefined && form.is_active_employee !== null) {
      updateData.is_active_employee = form.is_active_employee
    }

    if (changePassword.value) {
      updateData.old_password = form.old_password
      updateData.password = form.new_password
    }

    // Debug: Afficher les données envoyées
    console.log('🔍 Debug PATCH Profile:')
    console.log('📤 URL:', `${API_BASE_URL}/api/users/${userId}/`)
    console.log('📤 Headers:', getAuthHeaders())
    console.log('📤 Body:', updateData)
    console.log('📤 Body JSON:', JSON.stringify(updateData))

    try {
      const data = await $fetch(`${API_BASE_URL}/api/users/${userId}/`, {
        method: 'PATCH',
        body: updateData,
        headers: getAuthHeaders()
      })
      console.log('✅ PATCH Profile Success:', data)
    } catch (apiError: any) {
      console.error('❌ PATCH Profile Error:', apiError)
      console.error('❌ Error Data:', apiError.data)
      console.error('❌ Error Message:', apiError.message)
      error('Erreur lors de la mise à jour du profil: ' + (apiError.data?.message || apiError.message))
      return
    }

    // Mettre à jour le localStorage
    if (process.client) {
      const updatedUser = { ...userData, ...updateData }
      if (changePassword.value) {
        delete (updatedUser as any).old_password
      }
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }

    success('Profil mis à jour avec succès')
    emit('updated')
    emit('close')
    isEditing.value = false
    changePassword.value = false
  } catch (err) {
    console.error('Erreur mise à jour profil:', err)
    error('Une erreur est survenue')
  } finally {
    loading.value = false
  }
}

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    loadUserData()
    isEditing.value = false
    changePassword.value = false
  }
})
</script>