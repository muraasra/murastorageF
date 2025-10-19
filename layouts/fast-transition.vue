<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Barre de navigation optimisée -->
    <nav class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <!-- Logo avec préchargement -->
            <NuxtLink 
              to="/user" 
              class="flex items-center space-x-2 text-xl font-bold text-blue-600 dark:text-blue-400"
              @mouseenter="preloadPage('/user')"
            >
              <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
              </svg>
              <span>StoRage</span>
            </NuxtLink>
          </div>

          <!-- Navigation principale avec préchargement -->
          <div class="hidden md:flex items-center space-x-8">
            <NuxtLink 
              to="/user" 
              class="nav-link"
              @mouseenter="preloadPage('/user')"
            >
              Dashboard
            </NuxtLink>
            <NuxtLink 
              to="/facturation" 
              class="nav-link"
              @mouseenter="preloadPage('/facturation')"
            >
              Facturation
            </NuxtLink>
            <NuxtLink 
              to="/listes-factures" 
              class="nav-link"
              @mouseenter="preloadPage('/listes-factures')"
            >
              Factures
            </NuxtLink>
            <NuxtLink 
              to="/mouvements-stock" 
              class="nav-link"
              @mouseenter="preloadPage('/mouvements-stock')"
            >
              Mouvements
            </NuxtLink>
            <NuxtLink 
              to="/stock-produit" 
              class="nav-link"
              @mouseenter="preloadPage('/stock-produit')"
            >
              Stock
            </NuxtLink>
          </div>

          <!-- Menu mobile -->
          <div class="md:hidden flex items-center">
            <button 
              @click="mobileMenuOpen = !mobileMenuOpen"
              class="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Menu mobile -->
        <div v-if="mobileMenuOpen" class="md:hidden border-t border-gray-200 dark:border-gray-700">
          <div class="px-2 pt-2 pb-3 space-y-1">
            <NuxtLink 
              to="/user" 
              class="mobile-nav-link"
              @click="mobileMenuOpen = false"
              @mouseenter="preloadPage('/user')"
            >
              Dashboard
            </NuxtLink>
            <NuxtLink 
              to="/facturation" 
              class="mobile-nav-link"
              @click="mobileMenuOpen = false"
              @mouseenter="preloadPage('/facturation')"
            >
              Facturation
            </NuxtLink>
            <NuxtLink 
              to="/listes-factures" 
              class="mobile-nav-link"
              @click="mobileMenuOpen = false"
              @mouseenter="preloadPage('/listes-factures')"
            >
              Factures
            </NuxtLink>
            <NuxtLink 
              to="/mouvements-stock" 
              class="mobile-nav-link"
              @click="mobileMenuOpen = false"
              @mouseenter="preloadPage('/mouvements-stock')"
            >
              Mouvements
            </NuxtLink>
            <NuxtLink 
              to="/stock-produit" 
              class="mobile-nav-link"
              @click="mobileMenuOpen = false"
              @mouseenter="preloadPage('/stock-produit')"
            >
              Stock
            </NuxtLink>
          </div>
        </div>
      </div>
    </nav>

    <!-- Contenu principal avec transition -->
    <main class="transition-all duration-150 ease-out">
      <Transition 
        name="page-transition" 
        mode="out-in"
        @before-enter="onBeforeEnter"
        @enter="onEnter"
        @leave="onLeave"
      >
        <slot />
      </Transition>
    </main>

    <!-- Indicateur de chargement global -->
    <div 
      v-if="isTransitioning" 
      class="fixed top-0 left-0 right-0 h-1 bg-blue-600 z-50 loading-transition"
    >
      <div class="h-full bg-blue-400 animate-pulse"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useFastTransitions } from '~/composables/useFastTransitions'

const { isTransitioning, preloadPage } = useFastTransitions()
const mobileMenuOpen = ref(false)

// Hooks de transition pour des animations fluides
const onBeforeEnter = (el: Element) => {
  el.classList.add('opacity-0', 'translate-x-4')
}

const onEnter = (el: Element, done: () => void) => {
  requestAnimationFrame(() => {
    el.classList.remove('opacity-0', 'translate-x-4')
    el.classList.add('opacity-100', 'translate-x-0')
    setTimeout(done, 150)
  })
}

const onLeave = (el: Element, done: () => void) => {
  el.classList.add('opacity-0', '-translate-x-4')
  setTimeout(done, 150)
}

onMounted(() => {
  // Précharger les pages importantes au montage
  preloadPage('/user')
  preloadPage('/facturation')
})
</script>

<style scoped>
.nav-link {
  @apply px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-150 ease-out;
}

.mobile-nav-link {
  @apply block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-150 ease-out;
}

.page-transition-enter-active,
.page-transition-leave-active {
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.page-transition-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.page-transition-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

.loading-transition {
  transition: opacity 100ms ease-in-out;
}
</style>

















