<template>
  <div class="fixed bottom-4 right-4 z-50">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3">
      <div class="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
        <span>Cache: {{ cacheSize }} entrées</span>
        <button 
          @click="clearCache" 
          class="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs transition-colors"
          title="Vider le cache"
        >
          Vider
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const cacheSize = ref(0)
let interval: NodeJS.Timeout | null = null

const updateCacheSize = () => {
  if (process.client) {
    const nuxtApp = useNuxtApp()
    const getCacheSize = nuxtApp?.$getCacheSize as (() => number) || (() => 0)
    cacheSize.value = getCacheSize()
  }
}

const clearCache = () => {
  if (process.client) {
    const nuxtApp = useNuxtApp()
    const clearCache = nuxtApp?.$clearCache as (() => void) || (() => {})
    clearCache()
    updateCacheSize()
  }
}

onMounted(() => {
  updateCacheSize()
  // Mettre à jour toutes les 5 secondes
  interval = setInterval(updateCacheSize, 5000)
})

onUnmounted(() => {
  if (interval) {
    clearInterval(interval)
  }
})
</script>










