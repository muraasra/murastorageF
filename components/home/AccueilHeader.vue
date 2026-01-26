<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from "vue";
import ThemeSwitcher from "../blocks/ThemeSwitcher.vue";

const navIsOpen = ref(false);
const scrolled = ref(false);
const route = useRoute();

// Déterminer le lien actif
const isActive = (path: string) => {
  return route.path === path || route.path.startsWith(path + '/');
};

// Gérer le scroll pour l'effet de la navbar
const handleScroll = () => {
  scrolled.value = window.scrollY > 20;
};

// Fermer le menu mobile
const closeMobileMenu = () => {
  navIsOpen.value = false;
};

// Toggle menu mobile
const toggleMenu = () => {
  navIsOpen.value = !navIsOpen.value;
};

// Fermer automatiquement le menu lors d'un changement de route
watch(() => route.path, () => {
  navIsOpen.value = false;
}, { immediate: false });

// Bloquer le scroll du body quand le menu mobile est ouvert
watch(navIsOpen, (isOpen) => {
  if (process.client) {
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }
});

// Event listeners
onMounted(() => {
  if (process.client) {
    window.addEventListener('scroll', handleScroll);
    handleScroll();
  }
});

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener('scroll', handleScroll);
    document.body.style.overflow = '';
  }
});

// Liens de navigation
const navLinks = [
  { to: '/home/accueil', label: 'Accueil' },
  { to: '/home/a_propos', label: 'À propos' },
  { to: '/home/services', label: 'Services' },
  { to: '/home/tarification', label: 'Tarifs' },
  { to: '/home/faq', label: 'FAQ' },
  { to: '/home/contact_accueil', label: 'Contact' },
];
</script>

<template>
  <header
    :class="[
      'fixed top-0 left-0 right-0 z-[9999] transition-all duration-300',
      'py-3 bg-white dark:bg-gray-900 shadow-md',
      scrolled ? 'shadow-lg' : 'lg:bg-transparent lg:dark:bg-transparent lg:shadow-none'
    ]"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between">
        <!-- Logo -->
        <NuxtLink 
          to="/home/accueil" 
          @click="closeMobileMenu"
          class="flex items-center space-x-2 group"
        >
          <div class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-emerald-500/25 transition-all duration-300 group-hover:scale-105">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
          </div>
          <span class="text-xl font-bold">
            <span class="text-emerald-500">Mura</span>
            <span :class="scrolled ? 'text-gray-800 dark:text-white' : 'text-gray-800 dark:text-white'">Storage</span>
          </span>
        </NuxtLink>

        <!-- Navigation Desktop -->
        <nav class="hidden lg:flex items-center space-x-1">
          <NuxtLink 
            v-for="link in navLinks" 
            :key="link.to"
            :to="link.to"
            :class="[
              'px-4 py-2 rounded-lg font-medium transition-all duration-200',
              isActive(link.to)
                ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30'
                : 'text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            ]"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>

        <!-- Actions Desktop -->
        <div class="hidden lg:flex items-center space-x-3">
          <ThemeSwitcher />
          <NuxtLink 
            to="/connexion"
            class="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors"
          >
            Connexion
          </NuxtLink>
          <NuxtLink 
            to="/home/inscription"
            class="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-emerald-500/25 hover:scale-105 transition-all duration-300"
          >
            Commencer
          </NuxtLink>
        </div>

        <!-- Mobile Menu Button -->
        <div class="flex lg:hidden items-center space-x-3">
          <ThemeSwitcher />
          <button 
            @click="toggleMenu"
            class="relative w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
            :aria-expanded="navIsOpen"
            aria-label="Menu de navigation"
          >
            <div class="w-5 h-4 flex flex-col justify-between">
              <span 
                :class="[
                  'block h-0.5 bg-gray-600 dark:bg-gray-300 transition-all duration-300 origin-center',
                  navIsOpen ? 'rotate-45 translate-y-[7px]' : ''
                ]"
              />
              <span 
                :class="[
                  'block h-0.5 bg-gray-600 dark:bg-gray-300 transition-all duration-300',
                  navIsOpen ? 'opacity-0 scale-0' : ''
                ]"
              />
              <span 
                :class="[
                  'block h-0.5 bg-gray-600 dark:bg-gray-300 transition-all duration-300 origin-center',
                  navIsOpen ? '-rotate-45 -translate-y-[7px]' : ''
                ]"
              />
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Menu Overlay -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-300"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div 
        v-if="navIsOpen"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9997] lg:hidden"
        @click="closeMobileMenu"
      />
    </Transition>

    <!-- Mobile Menu Panel -->
    <Transition
      enter-active-class="transition-transform duration-300 ease-out"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-transform duration-300 ease-in"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <div 
        v-if="navIsOpen"
        class="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white dark:bg-gray-900 shadow-2xl z-[9998] lg:hidden overflow-y-auto"
      >
        <!-- Mobile Menu Header -->
        <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <NuxtLink 
            to="/home/accueil" 
            @click="closeMobileMenu"
            class="flex items-center space-x-2"
          >
            <div class="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
            <span class="text-lg font-bold text-gray-800 dark:text-white">
              <span class="text-emerald-500">Mura</span>Storage
            </span>
          </NuxtLink>
          <button 
            @click="closeMobileMenu"
            class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Mobile Navigation Links -->
        <nav class="p-4 space-y-1">
          <NuxtLink 
            v-for="(link, index) in navLinks" 
            :key="link.to"
            :to="link.to"
            @click="closeMobileMenu"
            :class="[
              'flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-200',
              isActive(link.to)
                ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            ]"
            :style="{ animationDelay: `${index * 50}ms` }"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>

        <!-- Mobile Menu Actions -->
        <div class="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
          <NuxtLink 
            to="/connexion"
            @click="closeMobileMenu"
            class="flex items-center justify-center w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:border-emerald-500 hover:text-emerald-600 transition-all duration-200"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
            </svg>
            Connexion
          </NuxtLink>
          <NuxtLink 
            to="/home/inscription"
            @click="closeMobileMenu"
            class="flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-emerald-500/25 transition-all duration-200"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            Commencer gratuitement
          </NuxtLink>
        </div>

        <!-- Mobile Menu Footer -->
        <div class="p-4 mt-auto">
          <div class="text-center text-sm text-gray-500 dark:text-gray-400">
            <p>© 2025 Mura Storage</p>
            <p class="mt-1">par Groupe Mura</p>
          </div>
        </div>
      </div>
    </Transition>
  </header>

  <!-- Spacer pour compenser le header fixed -->
  <div class="h-[72px] lg:h-20" />
</template>

<style scoped>
/* Animation pour les liens du menu mobile */
@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

nav a {
  animation: slideInRight 0.3s ease-out forwards;
}
</style>
