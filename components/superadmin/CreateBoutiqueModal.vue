<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="$emit('close')">
      <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" @click="$emit('close')"></div>

      <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
            <div>
              <h3 class="text-base font-bold text-white">Nouvel entrepôt</h3>
              <p class="text-xs text-emerald-100">Créer un entrepôt pour votre entreprise</p>
            </div>
          </div>
          <button @click="$emit('close')" class="text-white/70 hover:text-white transition-colors p-1 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <!-- Form -->
        <div class="px-6 py-5 space-y-4 overflow-y-auto max-h-[70vh]">
          <!-- Limite atteinte -->
          <div v-if="limitReached" class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4 text-sm text-amber-700 dark:text-amber-300">
            <p class="font-semibold">Limite d'entrepôts atteinte</p>
            <p class="mt-0.5 text-xs">Passez au plan supérieur pour créer plus d'entrepôts.</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="sm:col-span-2">
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Nom de l'entrepôt <span class="text-red-500">*</span></label>
              <input v-model="form.nom" type="text" placeholder="Ex: Entrepôt Nord"
                class="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Ville <span class="text-red-500">*</span></label>
              <input v-model="form.ville" type="text" placeholder="Ex: Yaoundé"
                class="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Téléphone</label>
              <input v-model="form.telephone" type="tel" placeholder="+237 6XX XXX XXX"
                class="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent" />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Adresse complète</label>
              <input v-model="form.adresse" type="text" placeholder="Rue, quartier…"
                class="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input v-model="form.email" type="email" placeholder="entrepot@exemple.com"
                class="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Responsable</label>
              <input v-model="form.responsable" type="text" placeholder="Nom du responsable"
                class="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent" />
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700 flex gap-3 justify-end">
          <button @click="$emit('close')"
            class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 rounded-xl transition-colors">
            Annuler
          </button>
          <button @click="createBoutique" :disabled="loading || limitReached"
            class="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors disabled:opacity-50">
            <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
            {{ loading ? 'Création...' : 'Créer l\'entrepôt' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useNotification } from '@/types/useNotification'
import { useApiBase } from '@/composables/useApiBase'

const props = defineProps<{ isOpen: boolean }>()
const emit = defineEmits(['close', 'created'])

const { getApiUrl, getAuthHeaders } = useApiBase()
const { error, success } = useNotification()
const loading = ref(false)
const limitReached = ref(false)

async function apiFetch(path: string, opts: any = {}) {
  return $fetch(getApiUrl(path), { headers: getAuthHeaders(), ...opts })
}

const form = reactive({
  nom: '',
  ville: '',
  adresse: '',
  telephone: '',
  email: '',
  responsable: '',
})

function resetForm() {
  Object.assign(form, { nom: '', ville: '', adresse: '', telephone: '', email: '', responsable: '' })
}

const createBoutique = async () => {
  if (!form.nom.trim() || !form.ville.trim()) {
    error('Le nom et la ville sont obligatoires')
    return
  }

  loading.value = true
  try {
    // Récupérer l'ID de l'entreprise depuis le localStorage
    const raw = process.client ? localStorage.getItem('entreprise') : null
    if (!raw) { error('Informations entreprise manquantes. Reconnectez-vous.'); return }
    const entrepriseId = JSON.parse(raw).id

    await apiFetch('/api/boutiques/', {
      method: 'POST',
      body: {
        nom: form.nom,
        ville: form.ville,
        adresse: form.adresse,
        telephone: form.telephone,
        email: form.email,
        responsable: form.responsable,
        entreprise: entrepriseId,
      },
    })

    success('Entrepôt créé avec succès !')
    emit('created')
    emit('close')
    resetForm()
  } catch (err: any) {
    const msg = err?.data?.detail || err?.data?.nom?.[0] || err?.data?.message || err?.message || ''
    error(msg || 'Erreur lors de la création de l\'entrepôt')
  } finally {
    loading.value = false
  }
}

watch(() => props.isOpen, (v) => { if (v) resetForm() })
</script>
