<template>
  <div
    v-if="message"
    class="flex items-start gap-3 rounded-xl px-4 py-3 text-sm border"
    :class="type === 'error'
      ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
      : 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400'"
  >
    <svg class="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
    <div class="flex-1">
      <span>{{ message }}</span>
      <NuxtLink
        v-if="showUpgrade"
        to="/superadmin/tarification"
        class="ml-2 underline underline-offset-2 font-semibold hover:no-underline"
      >
        Mettre à niveau →
      </NuxtLink>
    </div>
    <button v-if="dismissible" @click="$emit('dismiss')" class="ml-2 opacity-60 hover:opacity-100">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  message?: string
  type?: 'warning' | 'error'
  showUpgrade?: boolean
  dismissible?: boolean
}>()

defineEmits<{
  dismiss: []
}>()
</script>
