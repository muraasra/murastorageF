<template>
  <div class="animate-pulse">
    <div v-if="type === 'card'" class="bg-gray-200 dark:bg-gray-700 rounded-lg p-4">
      <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
      <div class="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
    </div>
    
    <div v-else-if="type === 'table'" class="space-y-3">
      <div v-for="i in rows" :key="i" class="flex space-x-4">
        <div v-for="j in columns" :key="j" class="h-4 bg-gray-300 dark:bg-gray-600 rounded flex-1"></div>
      </div>
    </div>
    
    <div v-else-if="type === 'list'" class="space-y-2">
      <div v-for="i in rows" :key="i" class="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
    </div>
    
    <div v-else class="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  type?: 'card' | 'table' | 'list' | 'default'
  rows?: number
  columns?: number
}

withDefaults(defineProps<Props>(), {
  type: 'default',
  rows: 3,
  columns: 4
})
</script>










