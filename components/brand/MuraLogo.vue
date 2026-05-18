<script setup lang="ts">
import { BRAND_LOGO_PATH } from '@/constants'

const props = withDefaults(
  defineProps<{
    size?: 'sm' | 'md' | 'lg' | 'xl'
    alt?: string
  }>(),
  {
    size: 'md',
    alt: 'MuRa StoRage'
  }
)

const heightClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'h-8'
    case 'lg':
      return 'h-14'
    case 'xl':
      return 'h-20'
    default:
      return 'h-10'
  }
})
</script>

<template>
  <img
    :src="BRAND_LOGO_PATH"
    :alt="alt"
    :class="[heightClass, 'w-auto object-contain']"
  />
</template>
