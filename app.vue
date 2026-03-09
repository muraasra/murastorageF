<template>
  <div class="min-h-screen w-full">
    <ClientOnly>
      <NuxtLoadingIndicator color="#10b981" :height="3" :duration="1500" />
      <template #fallback><span /></template>
    </ClientOnly>
    <NuxtLayout>
      <NuxtPage :key="route.fullPath" />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
</script>
