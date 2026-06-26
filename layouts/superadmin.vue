<template>
  <main class="w-full flex min-h-screen bg-white dark:bg-gray-900">
    <OfflineBanner />

    <!-- Sidebar superadmin -->
    <SuperAdminSidebar />

    <!-- Contenu principal -->
    <div class="flex-1 h-full pl-0 md:pl-[250px] pb-20 md:pb-10">
      <UserTopbar />
      <slot />

      <!-- Notifications -->
      <div class="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 space-y-2 w-full max-w-md pointer-events-none">
        <notification />
      </div>

      <!-- Navigation mobile (bas de page) -->
      <MobileNavigation />
    </div>
  </main>
</template>

<script setup lang="ts">
import SuperAdminSidebar from '@/components/superadmin/SuperAdminSidebar.vue'
import UserTopbar from '@/components/UserTopbar.vue'
import notification from '@/components/notification.vue'
import MobileNavigation from '@/components/navigation.vue'
import OfflineBanner from '@/components/OfflineBanner.vue'
import { useStockAlerts } from '@/composables/useStockAlerts'

if (process.client) {
  useStockAlerts()
}
</script>
