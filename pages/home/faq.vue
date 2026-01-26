<script setup lang="ts">
import { ref, onMounted } from 'vue'

definePageMeta({
    layout: "accueil",
})

useSeoMeta({
  title: 'FAQ Mura Storage - Questions Fréquentes sur la Gestion de Stock',
  description: 'Trouvez les réponses aux questions fréquentes sur Mura Storage : essai gratuit, sécurité des données, tarification, facturation, fonctionnalités, support, conformité RGPD, gestion multi-entrepôts, codes-barres, inventaires.',
  ogTitle: 'FAQ Mura Storage - Questions Fréquentes',
  ogDescription: 'Réponses aux questions fréquentes sur Mura Storage : essai gratuit, sécurité, tarification, fonctionnalités, support.',
  ogType: 'website',
  ogUrl: 'https://murastorage.netlify.app/home/faq',
  ogImage: 'https://murastorage.netlify.app/img/og-image-MuraSrorage.png',
  keywords: 'FAQ Mura Storage, questions fréquentes gestion stock, aide logiciel stock, FAQ gestion inventaire, questions Mura Storage, support FAQ, assistance utilisateur stock, guide utilisation stock',
  robots: 'index, follow',
  canonical: 'https://murastorage.netlify.app/home/faq'
});

const isVisible = ref(false)

onMounted(() => {
  setTimeout(() => {
    isVisible.value = true
  }, 100)
})

// FAQ categories
const categories = [
  { id: 'general', label: 'Général', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'pricing', label: 'Tarification', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'security', label: 'Sécurité', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  { id: 'support', label: 'Support', icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z' }
]

const faqs = [
  {
    category: 'general',
    q: "Mura Storage propose-t-il un essai gratuit ?",
    a: "Oui ! Profitez d'un essai gratuit de 3 mois sans carte bancaire requise. Vous pouvez annuler à tout moment depuis votre espace compte. Aucun engagement, aucune surprise.",
  },
  {
    category: 'general',
    q: "Mura Storage s'intègre-t-il avec mes outils existants ?",
    a: "Absolument ! Nous proposons des intégrations avec les principaux ERP et plateformes e-commerce, ainsi qu'une API complète pour vos développements personnalisés. Contactez-nous pour vos connecteurs spécifiques.",
  },
  {
    category: 'security',
    q: "Comment sont sécurisées mes données ?",
    a: "Vos données bénéficient d'un chiffrement TLS en transit et AES-256 au repos. Nous effectuons des sauvegardes répliquées quotidiennes, appliquons un contrôle d'accès strict (principe du moindre privilège), et maintenons une journalisation complète en conformité RGPD.",
  },
  {
    category: 'security',
    q: "Où sont hébergées les données ?",
    a: "Vos données sont hébergées dans des datacenters certifiés et conformes aux normes internationales de sécurité. Nous appliquons des sauvegardes chiffrées et une surveillance continue 24/7.",
  },
  {
    category: 'pricing',
    q: "Quels moyens de paiement acceptez-vous ?",
    a: "Nous acceptons les cartes bancaires (Visa, Mastercard), les virements bancaires et le Mobile Money (Orange Money, MTN MoMo selon les pays). La facturation peut être mensuelle ou annuelle, sans engagement.",
  },
  {
    category: 'pricing',
    q: "Puis-je changer de plan à tout moment ?",
    a: "Oui, vous êtes libre de passer de Free à Basic, Premium ou Organisation à tout moment. La facturation s'ajuste automatiquement au prorata de votre utilisation. Aucuns frais de changement.",
  },
  {
    category: 'support',
    q: "Quel est votre engagement de disponibilité ?",
    a: "Nous garantissons un uptime de 99.9%. Les maintenances programmées sont toujours annoncées à l'avance par email et sur notre page de statut. Votre activité ne doit jamais s'arrêter.",
  },
  {
    category: 'support',
    q: "Offrez-vous un support technique ?",
    a: "Bien sûr ! Support email pour les plans Free et Basic, support prioritaire avec temps de réponse garanti pour Premium, et un support dédié avec SLA personnalisé pour Organisation.",
  },
]

const activeCategory = ref('general')
const openIndex = ref<number | null>(0)

const filteredFaqs = computed(() => {
  return faqs.filter(faq => faq.category === activeCategory.value)
})

const toggle = (i: number) => {
  openIndex.value = openIndex.value === i ? null : i
}

const setCategory = (categoryId: string) => {
  activeCategory.value = categoryId
  openIndex.value = 0
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
    <!-- Hero Section -->
    <section class="relative py-20 md:py-28 overflow-hidden">
      <div class="absolute inset-0">
        <div class="absolute top-20 left-10 w-72 h-72 bg-emerald-200/30 dark:bg-emerald-900/20 rounded-full blur-3xl"></div>
        <div class="absolute bottom-20 right-10 w-72 h-72 bg-blue-200/30 dark:bg-blue-900/20 rounded-full blur-3xl"></div>
      </div>
      
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          :class="[
            'text-center transition-all duration-700',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          ]"
        >
          <span class="inline-flex items-center px-4 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-6">
            Centre d'aide
          </span>
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6">
            Questions 
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-blue-600">Fréquentes</span>
          </h1>
          <p class="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Tout ce qu'il faut savoir pour bien démarrer avec Mura Storage
          </p>
        </div>
      </div>
    </section>

    <!-- FAQ Content -->
    <section class="py-16 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        <!-- Category Tabs -->
        <div 
          :class="[
            'flex flex-wrap justify-center gap-3 mb-12 transition-all duration-700',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          ]"
          style="transition-delay: 200ms"
        >
          <button
            v-for="category in categories"
            :key="category.id"
            @click="setCategory(category.id)"
            :class="[
              'inline-flex items-center px-5 py-2.5 rounded-xl font-medium transition-all duration-300',
              activeCategory === category.id
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            ]"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="category.icon"/>
            </svg>
            {{ category.label }}
          </button>
        </div>

        <!-- FAQ Accordion -->
        <div 
          :class="[
            'space-y-4 transition-all duration-700',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          ]"
          style="transition-delay: 400ms"
        >
          <div 
            v-for="(item, i) in filteredFaqs" 
            :key="item.q" 
            class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-xl"
          >
            <button 
              @click="toggle(i)" 
              class="w-full flex justify-between items-center p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <span class="text-lg font-semibold text-gray-900 dark:text-white pr-8">{{ item.q }}</span>
              <div 
                :class="[
                  'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300',
                  openIndex === i 
                    ? 'bg-emerald-600 rotate-180' 
                    : 'bg-gray-100 dark:bg-gray-700'
                ]"
              >
                <svg 
                  :class="[
                    'w-5 h-5 transition-colors',
                    openIndex === i ? 'text-white' : 'text-gray-600 dark:text-gray-300'
                  ]" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </div>
            </button>
            
            <Transition
              enter-active-class="transition-all duration-300 ease-out"
              enter-from-class="opacity-0 max-h-0"
              enter-to-class="opacity-100 max-h-96"
              leave-active-class="transition-all duration-200 ease-in"
              leave-from-class="opacity-100 max-h-96"
              leave-to-class="opacity-0 max-h-0"
            >
              <div v-if="openIndex === i" class="overflow-hidden">
                <div class="px-6 pb-6 text-gray-600 dark:text-gray-300 leading-relaxed border-t border-gray-100 dark:border-gray-700 pt-4">
                  {{ item.a }}
                </div>
              </div>
            </Transition>
          </div>
        </div>

        <!-- Still Have Questions -->
        <div 
          :class="[
            'mt-16 text-center bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-3xl p-8 md:p-12 transition-all duration-700',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          ]"
          style="transition-delay: 600ms"
        >
          <div class="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Vous avez d'autres questions ?
          </h3>
          <p class="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
            Notre équipe est disponible pour répondre à toutes vos questions
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <NuxtLink 
              to="/home/contact_accueil"
              class="inline-flex items-center justify-center px-8 py-4 bg-emerald-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 transition-all duration-300"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              Nous contacter
            </NuxtLink>
            <NuxtLink 
              to="/home/inscription"
              class="inline-flex items-center justify-center px-8 py-4 border-2 border-emerald-600 text-emerald-600 dark:text-emerald-400 rounded-xl font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all duration-300"
            >
              Commencer gratuitement
            </NuxtLink>
          </div>
          
          <!-- Contact Info -->
          <div class="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div class="flex flex-wrap justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
              <a href="tel:+237658934147" class="flex items-center hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                +237 658 934 147
              </a>
              <a href="mailto:support@murastorage.cm" class="flex items-center hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                support@murastorage.cm
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
