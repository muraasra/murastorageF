<script lang="ts" setup>
import { defineAsyncComponent } from "vue";
import AccueilHeader from "~/components/home/AccueilHeader.vue";
// ChatBot et WalkingManager chargés en différé pour accélérer le first paint
const ChatBot = defineAsyncComponent(() => import("~/components/ChatBot.vue"));
const WalkingManager = defineAsyncComponent(() => import("~/components/WalkingManager.vue"));

const currentYear = new Date().getFullYear();

// Liens footer
const footerLinks = {
  produit: [
    { to: '/home/accueil', label: 'Accueil' },
    { to: '/home/services', label: 'Fonctionnalités' },
    { to: '/home/tarification', label: 'Tarification' },
    { to: '/home/faq', label: 'FAQ' },
  ],
  entreprise: [
    { to: '/home/a_propos', label: 'À propos' },
    { to: '/home/contact_accueil', label: 'Contact' },
    { to: '#', label: 'Carrières' },
    { to: '#', label: 'Blog' },
  ],
  legal: [
    { to: '/home/conditions', label: "Conditions d'utilisation" },
    { to: '/home/confidentialite', label: 'Confidentialité' },
    { to: '#', label: 'Cookies' },
    { to: '#', label: 'Sécurité' },
  ],
};

const socialLinks = [
  { href: 'https://facebook.com', icon: 'facebook', label: 'Facebook' },
  { href: 'https://twitter.com', icon: 'twitter', label: 'Twitter' },
  { href: 'https://linkedin.com', icon: 'linkedin', label: 'LinkedIn' },
  { href: 'https://instagram.com', icon: 'instagram', label: 'Instagram' },
];
</script>

<template>
  <div class="min-h-screen flex flex-col bg-white dark:bg-gray-900">
    <AccueilHeader/>
    
    <main class="flex-1">
      <slot />
    </main>
    
    <!-- ChatBot flottant (chargé en différé) -->
    <ClientOnly>
      <Suspense>
        <ChatBot />
        <template #fallback><span /></template>
      </Suspense>
    </ClientOnly>

    <!-- Bonhomme gestionnaire (chargé en différé) -->
    <ClientOnly>
      <Suspense>
        <WalkingManager />
        <template #fallback><span /></template>
      </Suspense>
    </ClientOnly>
    
    <!-- Footer Amélioré -->
    <footer class="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white border-t border-gray-200 dark:border-gray-800">
      <!-- Section principale -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          <!-- Logo et description -->
          <div class="lg:col-span-2">
            <NuxtLink to="/home/accueil" class="inline-flex items-center space-x-2 mb-4">
              <div class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                </svg>
              </div>
              <span class="text-xl font-bold">
                <span class="text-emerald-600 dark:text-emerald-400">Mura</span><span class="text-gray-900 dark:text-white">Storage</span>
              </span>
            </NuxtLink>
            <p class="text-gray-600 dark:text-gray-400 mb-6 max-w-md leading-relaxed">
              La solution complète de gestion de stock pour les entreprises africaines. 
              Multi-entrepôts, facturation, inventaires et plus encore.
            </p>
            
            <!-- Réseaux sociaux -->
            <div class="flex space-x-4">
              <a 
                v-for="social in socialLinks"
                :key="social.icon"
                :href="social.href"
                target="_blank"
                rel="noopener noreferrer"
                class="w-10 h-10 bg-gray-200 dark:bg-gray-800 hover:bg-emerald-600 dark:hover:bg-emerald-600 text-gray-600 dark:text-white hover:text-white rounded-lg flex items-center justify-center transition-colors duration-200"
                :aria-label="social.label"
              >
                <!-- Facebook -->
                <svg v-if="social.icon === 'facebook'" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <!-- Twitter -->
                <svg v-if="social.icon === 'twitter'" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
                <!-- LinkedIn -->
                <svg v-if="social.icon === 'linkedin'" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <!-- Instagram -->
                <svg v-if="social.icon === 'instagram'" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
            </div>
          </div>

          <!-- Liens Produit -->
          <div>
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Produit</h3>
            <ul class="space-y-3">
              <li v-for="link in footerLinks.produit" :key="link.to">
                <NuxtLink :to="link.to" class="text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  {{ link.label }}
                </NuxtLink>
              </li>
            </ul>
          </div>

          <!-- Liens Entreprise -->
          <div>
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Entreprise</h3>
            <ul class="space-y-3">
              <li v-for="link in footerLinks.entreprise" :key="link.to">
                <NuxtLink :to="link.to" class="text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  {{ link.label }}
                </NuxtLink>
              </li>
            </ul>
          </div>

          <!-- Liens Légal -->
          <div>
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Légal</h3>
            <ul class="space-y-3">
              <li v-for="link in footerLinks.legal" :key="link.to">
                <NuxtLink :to="link.to" class="text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  {{ link.label }}
                </NuxtLink>
              </li>
            </ul>
          </div>
        </div>

        <!-- Contact rapide -->
        <div class="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-emerald-100 dark:bg-emerald-600/20 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
              </div>
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">Téléphone</p>
                <p class="text-gray-900 dark:text-white font-medium">+237 658 934 147</p>
              </div>
            </div>
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-emerald-100 dark:bg-emerald-600/20 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </div>
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">Email</p>
                <p class="text-gray-900 dark:text-white font-medium">contact@murastorage.cm</p>
              </div>
            </div>
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-emerald-100 dark:bg-emerald-600/20 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">Adresse</p>
                <p class="text-gray-900 dark:text-white font-medium">Bafoussam, Cameroun</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Copyright -->
      <div class="border-t border-gray-200 dark:border-gray-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p class="text-gray-600 dark:text-gray-400 text-sm">
              © {{ currentYear }} Mura Storage par Groupe Mura. Tous droits réservés.
            </p>
            <p class="text-gray-500 dark:text-gray-500 text-sm">
              Conçu avec ❤️ par 
              <a href="https://tayou.netlify.app" target="_blank" rel="noopener noreferrer" class="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 transition-colors">
                durel-tayou
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
