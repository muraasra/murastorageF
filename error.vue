<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col items-center justify-center px-4 relative overflow-hidden">

    <!-- Fond décoratif -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-1/4 left-1/4 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl"></div>
      <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
    </div>

    <div class="relative z-10 text-center max-w-lg w-full">

      <!-- Logo -->
      <NuxtLink to="/home/accueil" class="inline-block mb-10">
        <img
          src="/img/logo-mura-storage.png"
          alt="MuRa StoRage"
          class="h-14 w-auto object-contain mx-auto drop-shadow-sm"
        />
      </NuxtLink>

      <!-- Code erreur en filigrane + icône centrée -->
      <div class="relative mb-6 select-none">
        <p class="text-[9rem] sm:text-[11rem] font-black leading-none bg-gradient-to-br from-emerald-400 to-emerald-600 bg-clip-text text-transparent opacity-[0.15] dark:opacity-[0.12]">
          {{ error?.statusCode ?? 404 }}
        </p>
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="w-24 h-24 sm:w-28 sm:h-28 bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex items-center justify-center border border-gray-100 dark:border-gray-700">
            <svg v-if="is404" class="w-12 h-12 text-emerald-500" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <svg v-else class="w-12 h-12 text-red-500" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Titre -->
      <h1 class="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-3">
        {{ is404 ? 'Page introuvable' : 'Une erreur est survenue' }}
      </h1>

      <!-- Description -->
      <p class="text-gray-500 dark:text-gray-400 text-sm sm:text-base mb-8 leading-relaxed">
        <template v-if="is404">
          La page que vous cherchez n'existe pas ou a été déplacée.
        </template>
        <template v-else>
          {{ sanitized || 'Quelque chose s\'est mal passé. Veuillez réessayer.' }}
        </template>
      </p>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          @click="goHome"
          class="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors shadow-sm w-full sm:w-auto justify-center"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          Retour à l'accueil
        </button>
        <button
          @click="goBack"
          class="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl border border-gray-200 dark:border-gray-600 transition-colors w-full sm:w-auto justify-center"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          Page précédente
        </button>
      </div>

      <!-- Pied -->
      <p class="mt-10 text-xs text-gray-400 dark:text-gray-600">
        Besoin d'aide ?
        <NuxtLink to="/home/contact_accueil" class="text-emerald-500 hover:underline font-medium">Contactez le support</NuxtLink>
        &nbsp;·&nbsp; Code : <span class="font-mono">{{ error?.statusCode ?? '—' }}</span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { NuxtError } from '#app'

const props = defineProps({
  error: Object as () => NuxtError,
})

const is404 = computed(() => props.error?.statusCode === 404)

// Masque les URLs internes du message d'erreur
const sanitized = computed(() => {
  const msg = props.error?.message || ''
  return msg
    .replace(/https?:\/\/[^\s]+/gi, '')
    .replace(/localhost(:\d+)?[^\s]*/gi, '')
    .trim()
})

const goHome = () => clearError({ redirect: '/home/accueil' })

const goBack = () => {
  if (process.client && window.history.length > 1) {
    window.history.back()
  } else {
    goHome()
  }
}
</script>
