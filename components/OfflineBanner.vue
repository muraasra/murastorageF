<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="-translate-y-full opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="-translate-y-full opacity-0"
  >
    <div
      v-if="!isOnline || (pendingCount > 0 && isOnline)"
      class="fixed top-0 inset-x-0 z-50 flex items-center justify-center gap-3 px-4 py-2.5 text-sm font-medium shadow-md"
      :class="isOnline ? 'bg-amber-50 text-amber-800 border-b border-amber-200' : 'bg-gray-800 text-white'"
    >
      <!-- Hors ligne -->
      <template v-if="!isOnline">
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-wifi-slash" class="w-4 h-4 flex-shrink-0" />
          <span>Mode hors ligne — vos modifications seront synchronisées à la reconnexion.</span>
          <span v-if="pendingCount > 0" class="bg-white/20 rounded-full px-2 py-0.5 text-xs">
            {{ pendingCount }} en attente
          </span>
        </div>
      </template>

      <!-- En ligne mais synchro en cours -->
      <template v-else-if="isSyncing">
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin" />
          <span>Synchronisation de {{ pendingCount }} opération(s) en cours...</span>
        </div>
      </template>

      <!-- En ligne, requêtes en attente, pas encore en synchro -->
      <template v-else-if="pendingCount > 0">
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-signal" class="w-4 h-4 text-amber-600" />
          <span>Connexion rétablie — {{ pendingCount }} opération(s) en attente de synchronisation.</span>
          <button
            class="ml-2 underline underline-offset-2 hover:no-underline text-amber-700"
            @click="sync"
          >
            Synchroniser maintenant
          </button>
        </div>
      </template>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useOffline } from '@/composables/useOffline'

const { isOnline, isSyncing, pendingCount, sync } = useOffline()
</script>
