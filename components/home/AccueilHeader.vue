<script setup lang="ts">
import { NuxtLink } from "#components";
import ThemeSwitcher from "../blocks/ThemeSwitcher.vue";
import { ref } from "vue";

const search = ref("");
const navIsOpen = ref(false);
</script>

<template>
  <header
    class="sticky top-0 z-[9999] py-2 px-6 w-full flex items-center justify-between border-b dark:bg-black dark:border-b-gray-600 bg-white border-b-gray-200"
  >
    <h1 class="flex items-center justify-center">
      <NuxtLink href="/" class="text-lg md:text-xl font-extrabold"
        ><span class="text-emerald-500">Sto</span>Rage</NuxtLink
      >
    </h1>
    
    <!-- Bouton burger mobile -->
    <button @click="navIsOpen = !navIsOpen" class="md:hidden focus:outline-none">
      <svg
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
    </button>
    
    <!-- Navigation -->
    <nav
      :class="navIsOpen ? 'block' : 'hidden'"
      class="absolute top-14 left-0 w-full bg-emerald-500 dark:bg-black md:static md:flex md:space-x-6 md:w-auto md:bg-transparent md:dark:bg-transparent z-[9998]"
    >
      <NuxtLink href="/home/accueil" class="block px-4 py-2 hover:text-emerald-500 md:inline">Accueil</NuxtLink>
      <NuxtLink href="/home/a_propos" class="block px-4 py-2 hover:text-emerald-500 md:inline">A propos</NuxtLink>
      <NuxtLink href="/home/contact_accueil" class="block px-4 py-2 hover:text-emerald-500 md:inline">Contact</NuxtLink>
      <NuxtLink href="/home/faq" class="block px-4 py-2 hover:text-emerald-500 md:inline">Faq</NuxtLink>
      <NuxtLink href="/home/services" class="block px-4 py-2 hover:text-emerald-500 md:inline">Services</NuxtLink>
      <NuxtLink href="/home/tarification" class="block px-4 py-2 hover:text-emerald-500 md:inline">Tarification</NuxtLink>
      <NuxtLink href="/connexion" class="block px-4 py-2 hover:bg-emerald-500 hover:text-white rounded-full md:inline">Se connecter</NuxtLink>
      <NuxtLink href="/home/inscription" class="block px-4 py-2 hover:bg-emerald-500 hover:text-white rounded-full md:inline">S'inscrire</NuxtLink>
    </nav>
    
    <!-- Profil et Thème -->
    <div class="hidden md:flex items-center gap-x-5">
      <div class="flex items-start gap-x-2">
        <NuxtLink href="/connexion" class="flex items-center">
          <div class="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-semibold">
            U
          </div>
        </NuxtLink>
      </div>
      <ThemeSwitcher />
    </div>
  </header>
</template>
