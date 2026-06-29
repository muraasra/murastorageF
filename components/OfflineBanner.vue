<template>
  <!-- Bannière principale : hors ligne / synchro en cours / en attente -->
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="-translate-y-full opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="-translate-y-full opacity-0"
  >
    <div
      v-if="showMainBanner"
      class="fixed top-0 inset-x-0 z-50 flex items-center justify-center gap-3 px-4 py-2.5 text-sm font-medium shadow-md"
      :class="bannerClass"
    >
      <!-- Hors ligne -->
      <template v-if="!isOnline">
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 5.636a9 9 0 010 12.728M5.636 5.636a9 9 0 000 12.728M12 12h.01M3 3l18 18" />
          </svg>
          <span>Serveur non joignable — vos modifications seront envoyées à la reconnexion.</span>
          <span v-if="pendingCount > 0" class="bg-white/20 rounded-full px-2 py-0.5 text-xs ml-1">
            {{ pendingCount }} en attente
          </span>
        </div>
      </template>

      <!-- En ligne, synchro en cours -->
      <template v-else-if="isSyncing">
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <span>Synchronisation de {{ pendingCount }} opération(s) en cours…</span>
        </div>
      </template>

      <!-- En ligne, requêtes en attente -->
      <template v-else-if="pendingCount > 0">
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
          </svg>
          <span>Connexion serveur rétablie — {{ pendingCount }} opération(s) en attente.</span>
          <button
            class="ml-2 underline underline-offset-2 hover:no-underline font-semibold"
            @click="sync"
          >
            Synchroniser maintenant
          </button>
        </div>
      </template>
    </div>
  </Transition>

  <!-- Toast succès : apparaît en bas à droite après une synchro réussie -->
  <Transition
    enter-active-class="transition-all duration-400 ease-out"
    enter-from-class="translate-y-4 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition-all duration-300 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-4 opacity-0"
  >
    <div
      v-if="showSuccessToast && lastSyncResult"
      class="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium"
    >
      <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      <span>
        {{ lastSyncResult.synced }} opération(s) synchronisée(s) avec succès.
        <span v-if="lastSyncResult.failed > 0" class="opacity-80 ml-1">
          ({{ lastSyncResult.failed }} échouée(s))
        </span>
      </span>
      <button
        class="ml-2 opacity-70 hover:opacity-100 transition-opacity"
        @click="dismissSuccess"
        aria-label="Fermer"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useOffline } from '@/composables/useOffline'

const { isOnline, isSyncing, pendingCount, lastSyncResult, showSyncSuccess, sync } = useOffline()

// Permet de fermer manuellement le toast de succès
const _dismissed = ref(false)
function dismissSuccess() { _dismissed.value = true }

// Réactive si un nouveau sync arrive
watch(lastSyncResult, () => { _dismissed.value = false })

const showMainBanner = computed(() =>
  !isOnline.value || isSyncing.value || pendingCount.value > 0
)

const bannerClass = computed(() => {
  if (!isOnline.value) return 'bg-gray-800 text-white'
  if (isSyncing.value) return 'bg-blue-600 text-white'
  return 'bg-amber-50 text-amber-800 border-b border-amber-200'
})

const showSuccessToast = computed(() =>
  showSyncSuccess.value && !_dismissed.value && !!lastSyncResult.value
)
</script>
