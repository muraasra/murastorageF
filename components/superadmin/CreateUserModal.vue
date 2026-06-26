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
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-base font-bold text-white">Nouvel utilisateur</h3>
              <p class="text-xs text-emerald-100">Créer et affecter un utilisateur</p>
            </div>
          </div>
          <button @click="$emit('close')" class="text-white/70 hover:text-white p-1 rounded-lg transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <!-- Form -->
        <div class="px-6 py-5 space-y-4 overflow-y-auto max-h-[75vh]">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Prénom <span class="text-red-500">*</span></label>
              <input v-model="form.first_name" type="text" placeholder="Jean" class="field" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Nom <span class="text-red-500">*</span></label>
              <input v-model="form.last_name" type="text" placeholder="Dupont" class="field" />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Email <span class="text-red-500">*</span></label>
              <input v-model="form.email" type="email" placeholder="jean@exemple.com" class="field" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Téléphone</label>
              <input v-model="form.telephone" type="tel" placeholder="+237 6XX XXX XXX" class="field" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Poste</label>
              <input v-model="form.poste" type="text" placeholder="Ex: Gestionnaire" class="field" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Rôle</label>
              <select v-model="form.role" class="field">
                <option value="user">Utilisateur</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Entrepôt assigné</label>
              <div v-if="loadingBoutiques" class="field text-gray-400 text-xs flex items-center gap-2">
                <svg class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                Chargement…
              </div>
              <select v-else v-model="form.boutique" class="field">
                <option value="">Aucun (sans entrepôt)</option>
                <option v-for="b in boutiques" :key="b.id" :value="b.id">{{ b.nom }} ({{ b.ville }})</option>
              </select>
            </div>
          </div>

          <!-- Email option -->
          <div class="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-3">
            <input v-model="form.send_email" type="checkbox" id="send_email"
              class="mt-0.5 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded" />
            <label for="send_email" class="text-xs text-blue-700 dark:text-blue-300 leading-relaxed cursor-pointer">
              <span class="font-semibold">Envoyer les identifiants par email</span><br>
              Un mot de passe temporaire sera envoyé à l'adresse email saisie.
            </label>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700 flex gap-3 justify-end">
          <button @click="$emit('close')" class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 transition-colors">
            Annuler
          </button>
          <button @click="createUser" :disabled="loading"
            class="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors disabled:opacity-50">
            <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
            {{ loading ? 'Création...' : 'Créer l\'utilisateur' }}
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

async function apiFetch(path: string, opts: any = {}) {
  return $fetch(getApiUrl(path), { headers: getAuthHeaders(), ...opts })
}

const loading = ref(false)
const loadingBoutiques = ref(false)
const boutiques = ref<any[]>([])

const form = reactive({
  first_name: '',
  last_name: '',
  email: '',
  telephone: '',
  poste: '',
  role: 'user',
  boutique: '' as string | number,
  send_email: true,
})

function resetForm() {
  Object.assign(form, {
    first_name: '', last_name: '', email: '', telephone: '',
    poste: '', role: 'user', boutique: '', send_email: true,
  })
}

async function loadBoutiques() {
  loadingBoutiques.value = true
  boutiques.value = []
  try {
    const raw = process.client ? localStorage.getItem('entreprise') : null
    const entrepriseId = raw ? JSON.parse(raw).id : null
    const qs = entrepriseId ? `?entreprise=${entrepriseId}` : ''
    const res: any = await apiFetch(`/api/boutiques/${qs}`)
    boutiques.value = res.results ?? (Array.isArray(res) ? res : [])
  } catch {
    boutiques.value = []
  } finally {
    loadingBoutiques.value = false
  }
}

async function createUser() {
  if (!form.first_name.trim() || !form.last_name.trim() || !form.email.trim()) {
    error('Prénom, nom et email sont obligatoires')
    return
  }

  loading.value = true
  try {
    const raw = process.client ? localStorage.getItem('entreprise') : null
    if (!raw) { error('Informations entreprise manquantes. Reconnectez-vous.'); return }
    const entrepriseId = JSON.parse(raw).id

    const res: any = await apiFetch('/api/users/', {
      method: 'POST',
      body: {
        username: form.email,
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        telephone: form.telephone,
        poste: form.poste,
        role: form.role,
        entreprise: entrepriseId,
        boutique: form.boutique || null,
        send_email: form.send_email,
      },
    })

    if (form.send_email) {
      success('Utilisateur créé — les identifiants ont été envoyés par email.')
    } else {
      const pwd = res?.temp_password
      success(pwd ? `Utilisateur créé. Mot de passe temporaire : ${pwd}` : 'Utilisateur créé avec succès.')
    }
    emit('created')
    emit('close')
    resetForm()
  } catch (err: any) {
    const data = err?.data
    const msg = data?.email?.[0] || data?.username?.[0] || data?.detail || data?.message || err?.message || ''
    error(msg || 'Erreur lors de la création de l\'utilisateur')
  } finally {
    loading.value = false
  }
}

watch(() => props.isOpen, (v) => {
  if (v) { resetForm(); loadBoutiques() }
})
</script>

<style scoped>
.field {
  @apply w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent;
}
</style>
