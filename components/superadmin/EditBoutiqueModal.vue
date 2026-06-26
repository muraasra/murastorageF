<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="$emit('close')">
      <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" @click="$emit('close')"></div>

      <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            </div>
            <div>
              <h3 class="text-base font-bold text-white">{{ isEditing ? 'Modifier l\'entrepôt' : 'Détails de l\'entrepôt' }}</h3>
              <p class="text-xs text-emerald-100">{{ boutiqueData?.nom }}</p>
            </div>
          </div>
          <button @click="$emit('close')" class="text-white/70 hover:text-white p-1 rounded-lg transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <!-- Contenu -->
        <div class="px-6 py-6 overflow-y-auto max-h-[70vh]">
          <!-- Vue -->
          <div v-if="!isEditing" class="space-y-5">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div v-for="(item, i) in details" :key="i">
                <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{{ item.label }}</p>
                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ item.value || '—' }}</p>
              </div>
            </div>
            <div class="flex justify-end gap-3 pt-2">
              <button @click="$emit('close')" class="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Fermer</button>
              <button @click="isEditing = true" class="px-5 py-2 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors">
                <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                Modifier
              </button>
            </div>
          </div>

          <!-- Édition -->
          <form v-else @submit.prevent="updateBoutique" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Nom <span class="text-red-500">*</span></label>
                <input v-model="form.nom" type="text" required
                  class="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Ville <span class="text-red-500">*</span></label>
                <input v-model="form.ville" type="text" required
                  class="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Responsable</label>
                <input v-model="form.responsable" type="text"
                  class="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Téléphone</label>
                <input v-model="form.telephone" type="tel"
                  class="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input v-model="form.email" type="email"
                  class="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400" />
              </div>
              <div class="sm:col-span-2">
                <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Adresse</label>
                <input v-model="form.adresse" type="text"
                  class="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400" />
              </div>
            </div>

            <div class="flex justify-end gap-3 pt-2">
              <button type="button" @click="isEditing = false" class="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Annuler</button>
              <button type="submit" :disabled="loading" class="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors disabled:opacity-50">
                <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                {{ loading ? 'Enregistrement...' : 'Enregistrer' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useNotification } from '@/types/useNotification'
import { useApiBase } from '@/composables/useApiBase'

const props = defineProps<{ isOpen: boolean; boutique?: any }>()
const emit = defineEmits(['close', 'updated'])

const { getApiUrl, getAuthHeaders } = useApiBase()
const { error, success } = useNotification()
const loading = ref(false)
const isEditing = ref(false)

async function apiFetch(path: string, opts: any = {}) {
  return $fetch(getApiUrl(path), { headers: getAuthHeaders(), ...opts })
}

const boutiqueData = ref<any>(null)
const form = reactive({ nom: '', ville: '', adresse: '', telephone: '', email: '', responsable: '' })

const details = computed(() => [
  { label: 'Nom', value: boutiqueData.value?.nom },
  { label: 'Ville', value: boutiqueData.value?.ville },
  { label: 'Responsable', value: boutiqueData.value?.responsable },
  { label: 'Téléphone', value: boutiqueData.value?.telephone },
  { label: 'Email', value: boutiqueData.value?.email },
  { label: 'Adresse', value: boutiqueData.value?.adresse },
])

function load() {
  if (!props.boutique) return
  boutiqueData.value = props.boutique
  Object.assign(form, {
    nom: props.boutique.nom || '',
    ville: props.boutique.ville || '',
    adresse: props.boutique.adresse || '',
    telephone: props.boutique.telephone || '',
    email: props.boutique.email || '',
    responsable: props.boutique.responsable || '',
  })
}

async function updateBoutique() {
  if (!form.nom.trim() || !form.ville.trim()) { error('Nom et ville sont obligatoires'); return }
  loading.value = true
  try {
    const data: any = await apiFetch(`/api/boutiques/${boutiqueData.value.id}/`, {
      method: 'PATCH',
      body: { nom: form.nom, ville: form.ville, adresse: form.adresse, telephone: form.telephone, email: form.email, responsable: form.responsable },
    })
    boutiqueData.value = { ...boutiqueData.value, ...data }
    success('Entrepôt mis à jour avec succès')
    emit('updated')
    isEditing.value = false
  } catch (err: any) {
    error(err?.data?.detail || err?.data?.message || 'Erreur lors de la mise à jour')
  } finally {
    loading.value = false
  }
}

watch(() => props.isOpen, (v) => { if (v) { load(); isEditing.value = false } })
</script>
