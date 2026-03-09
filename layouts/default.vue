<script setup>
import { ref, computed, onMounted } from "vue";
import AdminSidebar from "@/components/admin/AdminSidebar.vue";
import SuperAdminSidebar from "@/components/superadmin/SuperAdminSidebar.vue";
import Sidebar from "@/components/Sidebar.vue";
import notification from "@/components/notification.vue";
import UserTopbar from "@/components/UserTopbar.vue";
import GlobalLoader from "@/components/GlobalLoader.vue";
import CacheIndicator from "@/components/CacheIndicator.vue";
import MobileNavigation from "@/components/navigation.vue";
import { useStockAlerts } from "@/composables/useStockAlerts";

const user = ref(null);

if (process.client) {
  const userData = localStorage.getItem('user');
  if (userData) {
    user.value = JSON.parse(userData);
  }
}

const userRole = computed(() => user.value?.role || "user");

const SidebarComponent = computed(() => {
  if (userRole.value === "user") {
    return AdminSidebar;
  } else if (userRole.value === "admin") {
    return SuperAdminSidebar;
  }
  return Sidebar;
});

onMounted(() => {
  if (user.value && process.client) {
    // Utiliser navigateTo au lieu de useRouter pour éviter les problèmes d'injection
    try {
      if (user.value.role === "user") {
        navigateTo("/admin/");
      } else if (user.value.role === "admin") {
        navigateTo("/admin/");
      } else {
        navigateTo("/user/");
      }
    } catch (error) {
      console.warn('Navigation error:', error);
    }
  }
});

const toasts = ref([]);
if (process.client) {
  provide('toasts', toasts);
}

const showEditProfile = ref(false)

// Global loading state
const isLoading = ref(false)
const loadingMessage = ref('')

// Provide loading state to child components
provide('isLoading', isLoading)
provide('loadingMessage', loadingMessage)

// Activer l'écoute des alertes de stock pour tous les utilisateurs connectés
if (process.client) {
  useStockAlerts()
}
</script>

<template>
  <main class="w-full flex min-h-screen min-h-full bg-white dark:bg-gray-900">
    <!-- Sidebar desktop -->
    <component :is="SidebarComponent" />

    <!-- Contenu principal -->
    <div class="flex-1 h-full pl-0 md:pl-[250px] pb-20 md:pb-10">
      <UserTopbar />
      <slot />

      <!-- Notifications -->
      <div
        class="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 space-y-2 w-full max-w-md pointer-events-none"
      >
        <notification />
      </div>

      <!-- Global loader -->
      <GlobalLoader :loading="isLoading" :message="loadingMessage" />

      <!-- Indicateur de cache <CacheIndicator /> -->
      

      <!-- Navigation mobile (bas de page) -->
      <MobileNavigation />
    </div>
  </main>
</template>

