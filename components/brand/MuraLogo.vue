<script setup lang="ts">
import { ref, computed } from 'vue'
import { BRAND_LOGO_PATH } from '@/constants'

const props = withDefaults(
  defineProps<{
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
    alt?: string
  }>(),
  {
    size: 'md',
    alt: 'MuRa StoRage'
  }
)

const imgError = ref(false)

const heightClass = computed(() => {
  switch (props.size) {
    case 'sm':  return 'h-9'
    case 'md':  return 'h-12'
    case 'lg':  return 'h-16'
    case 'xl':  return 'h-20'
    case '2xl': return 'h-28'
    default:    return 'h-12'
  }
})

const textClass = computed(() => {
  switch (props.size) {
    case 'sm':  return 'text-lg'
    case 'md':  return 'text-xl'
    case 'lg':  return 'text-2xl'
    case 'xl':  return 'text-3xl'
    case '2xl': return 'text-4xl'
    default:    return 'text-2xl'
  }
})
</script>

<template>
  <!-- Logo image -->
  <img
    v-if="!imgError"
    :src="BRAND_LOGO_PATH"
    :alt="alt"
    :class="[heightClass, 'w-auto object-contain max-w-none drop-shadow-sm']"
    @error="imgError = true"
  />
  <!-- Fallback texte si l'image ne charge pas -->
  <span v-else :class="[textClass, 'font-extrabold tracking-tight']">
    <span class="text-emerald-500">Mu</span><span class="text-gray-800 dark:text-white">Ra</span>
    <span class="text-gray-400 dark:text-gray-500 font-light mx-0.5">|</span>
    <span class="text-gray-700 dark:text-gray-200">StoRage</span>
  </span>
</template>
