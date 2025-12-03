<script setup lang="ts">
import { NuxtLink } from "#components";
import ThemeSwitcher from "../blocks/ThemeSwitcher.vue";
import { ref, watch, onMounted, onUnmounted } from "vue";

const search = ref("");
const navIsOpen = ref(false);

// Fonction pour fermer le menu mobile
const closeMobileMenu = () => {
  navIsOpen.value = false;
};

// Fermer automatiquement le menu lors d'un changement de route
const route = useRoute();
watch(() => route.path, () => {
  // Fermer le menu à chaque changement de route
  navIsOpen.value = false;
}, { immediate: true });

// Fermer le menu lors d'un clic en dehors (uniquement sur mobile)
const handleClickOutside = (event: MouseEvent) => {
  if (!process.client) return;
  
  if (navIsOpen.value) {
    const target = event.target as HTMLElement;
    const header = document.querySelector('header');
    const nav = document.querySelector('nav');
    
    // Vérifier si le clic est en dehors du header et de la navigation
    if (header && nav && !header.contains(target) && !nav.contains(target)) {
      navIsOpen.value = false;
    }
  }
};

// Gérer les clics en dehors du menu et les changements de route
onMounted(() => {
  if (process.client) {
    // Utiliser setTimeout pour éviter les conflits avec les événements de navigation
    setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 100);
    
    // Écouter les changements de route via le router
    const router = useRouter();
    router.afterEach(() => {
      navIsOpen.value = false;
    });
    
    // Écouter aussi les événements de navigation Nuxt
    const nuxtApp = useNuxtApp();
    nuxtApp.hook('page:finish', () => {
      navIsOpen.value = false;
    });
  }
});

onUnmounted(() => {
  if (process.client) {
    document.removeEventListener('click', handleClickOutside);
  }
});
</script>

<template>
  <header
    class="sticky top-0 z-[9999] py-2 px-6 w-full flex items-center justify-between border-b dark:bg-black dark:border-b-gray-600 bg-white border-b-gray-200"
  >
    <h1 class="flex items-center justify-center">
      <NuxtLink @click="closeMobileMenu" to="/home/accueil" class="text-lg md:text-xl font-extrabold"
        ><span class="text-emerald-500">Sto</span>Rage</NuxtLink
      >
    </h1>
    
    <!-- Bouton burger mobile -->
    <button @click="navIsOpen = !navIsOpen" class="md:hidden focus:outline-none z-50">
      <svg
        v-if="!navIsOpen"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="2"
        stroke="currentColor"
        class="w-6 h-6"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M4 6h16M4 12h16m-7 6h7"
        />
      </svg>
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="2"
        stroke="currentColor"
        class="w-6 h-6"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
    
    <!-- Navigation -->
    <nav
      v-show="navIsOpen || !$device.isMobile"
      :class="navIsOpen ? 'block' : 'hidden md:flex'"
      class="absolute top-14 left-0 w-full bg-emerald-500 dark:bg-black md:static md:flex md:space-x-6 md:w-auto md:bg-transparent md:dark:bg-transparent z-[9998]"
      @click.stop
    >
      <NuxtLink 
        @click="closeMobileMenu" 
        to="/home/accueil" 
        class="block px-4 py-2 hover:text-emerald-500 md:inline transition-colors"
      >
        Accueil
      </NuxtLink>
      <NuxtLink 
        @click="closeMobileMenu" 
        to="/home/a_propos" 
        class="block px-4 py-2 hover:text-emerald-500 md:inline transition-colors"
      >
        A propos
      </NuxtLink>
      <NuxtLink 
        @click="closeMobileMenu" 
        to="/home/contact_accueil" 
        class="block px-4 py-2 hover:text-emerald-500 md:inline transition-colors"
      >
        Contact
      </NuxtLink>
      <NuxtLink 
        @click="closeMobileMenu" 
        to="/home/faq" 
        class="block px-4 py-2 hover:text-emerald-500 md:inline transition-colors"
      >
        Faq
      </NuxtLink>
      <NuxtLink 
        @click="closeMobileMenu" 
        to="/home/services" 
        class="block px-4 py-2 hover:text-emerald-500 md:inline transition-colors"
      >
        Services
      </NuxtLink>
      <NuxtLink 
        @click="closeMobileMenu" 
        to="/home/tarification" 
        class="block px-4 py-2 hover:text-emerald-500 md:inline transition-colors"
      >
        Tarification
      </NuxtLink>
      <NuxtLink 
        @click="closeMobileMenu" 
        to="/connexion" 
        class="block px-4 py-2 hover:bg-emerald-500 hover:text-white rounded-full md:inline transition-colors"
      >
        Se connecter
      </NuxtLink>
      <NuxtLink 
        @click="closeMobileMenu" 
        to="/home/inscription" 
        class="block px-4 py-2 hover:bg-emerald-500 hover:text-white rounded-full md:inline transition-colors"
      >
        S'inscrire
      </NuxtLink>
    </nav>
    
    <!-- Profil et Thème -->
    <div class="hidden md:flex items-center gap-x-5">
      <div class="flex items-start gap-x-2">
        <NuxtLink to="/connexion" class="flex items-center">
          <div class="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-semibold">
            U
          </div>
        </NuxtLink>
      </div>
      <ThemeSwitcher />
    </div>
  </header>
</template>
