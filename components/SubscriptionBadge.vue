<template>
  <span
    v-if="planName && planDisplayName"
    :class="badgeClass"
    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
  >
    <svg v-if="showIcon" class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
    </svg>
    {{ planDisplayName }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  planName?: string
  planDisplayName?: string
  showIcon?: boolean
}>()

const badgeClass = computed(() => {
  if (!props.planName) {
    return 'bg-gray-100 text-gray-800'
  }
  switch (props.planName) {
    case 'free':
      return 'bg-blue-100 text-blue-800'
    case 'basic':
      return 'bg-green-100 text-green-800'
    case 'premium':
      return 'bg-purple-100 text-purple-800'
    case 'organisation':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
})
</script>