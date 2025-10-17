<template>
  <div class="mb-4">
    <div class="flex justify-between items-center mb-1">
      <span class="text-sm font-medium text-gray-700">{{ label }}</span>
      <span class="text-sm text-gray-500">
        {{ current }} / {{ displayLimit }}
        <span v-if="isLimitReached" class="text-red-500 ml-1">(Limite atteinte)</span>
      </span>
    </div>
    <div class="w-full bg-gray-200 rounded-full h-2.5">
      <div
        class="h-2.5 rounded-full"
        :class="progressBarClass"
        :style="{ width: progressBarWidth }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  label: string
  current: number
  limit: number | null
}>()

const isLimitReached = computed(() => {
  if (!props.limit || props.limit >= 999999) return false
  return props.current >= props.limit
})

const displayLimit = computed(() => {
  if (!props.limit || props.limit >= 999999) return 'Illimité'
  return props.limit
})

const progressBarWidth = computed(() => {
  if (!props.limit || props.limit >= 999999) return '100%'
  const percentage = (props.current / props.limit) * 100
  return `${Math.min(percentage, 100)}%`
})

const progressBarClass = computed(() => {
  if (isLimitReached.value) return 'bg-red-500'
  if (!props.limit || props.limit >= 999999) return 'bg-green-500'
  const percentage = (props.current / props.limit) * 100
  if (percentage > 80) return 'bg-orange-500'
  return 'bg-blue-500'
})
</script>