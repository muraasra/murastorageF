<script setup>
import { ref, computed, onMounted } from "vue";
import AdminSidebar from "@/components/admin/AdminSidebar.vue";
import SuperAdminSidebar from "@/components/superadmin/SuperAdminSidebar.vue";
import Sidebar from "@/components/Sidebar.vue";
import notification from "@/components/notification.vue";
import UserTopbar from "@/components/UserTopbar.vue";
import GlobalLoader from "@/components/GlobalLoader.vue";
import MobileNavigation from "@/components/navigation.vue";
import { useStockAlerts } from "@/composables/useStockAlerts";
import OfflineBanner from "@/components/OfflineBanner.vue";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
const boutiqueSelected = ref(false);

onMounted(() => {
  boutiqueSelected.value = !!localStorage.getItem('boutique');
});

const userRole = computed(() => auth.user?.role || "user");

const SidebarComponent = computed(() => {
  if (userRole.value === "superadmin") {
    return boutiqueSelected.value ? AdminSidebar : SuperAdminSidebar;
  }
  if (userRole.value === "admin") return AdminSidebar;
  return Sidebar;
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

// Activer l'Ã©coute des alertes de stock pour tous les utilisateurs connectÃ©s
if (process.client) {
  useStockAlerts()
}
</script>

<template>
  <main class="w-full flex min-h-screen min-h-full bg-white dark:bg-gray-900">
    <OfflineBanner />
    <LogoutConfirmModal />
    <!-- Sidebar desktop -->
    <component :is="SidebarComponent" />

    <!-- Contenu principal -->
    <div class="flex-1 h-full pl-0 md:pl-[250px] pb-16 md:pb-10">
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


      <!-- Navigation mobile (bas de page) -->
      <MobileNavigation />
    </div>
  </main>
</template>



