<template>
  <div v-if="loading" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 flex items-center space-x-4">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      <span class="text-gray-700 dark:text-gray-300">{{ message || 'Chargement...' }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  loading: boolean
  message?: string
}

defineProps<Props>()
</script>










