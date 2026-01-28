<template>
  <div>
    <!-- Barre de progression pendant la navigation (améliore la perception du chargement) -->
    <NuxtLoadingIndicator color="#10b981" :height="3" :duration="1500" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
