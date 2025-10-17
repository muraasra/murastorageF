<script setup lang="ts">
definePageMeta({
  layout: "accueil",
});
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-gray-900">
    <!-- Hero Section -->
    <section class="relative bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-16 md:py-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            À propos de
            <span class="text-transparent bg-clip-text bg-gradient-to-br from-emerald-500 to-blue-600">
              Mura Storage
            </span>
          </h1>
          <p class="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-8">
            Nous révolutionnons la gestion de stock pour les entreprises modernes avec des solutions innovantes et fiables, propulsées par le Groupe Mura
          </p>
        </div>
      </div>
    </section>

    <!-- Mission Section -->
    <section class="py-16 md:py-24 bg-white dark:bg-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Notre Mission
            </h2>
            <p class="text-lg text-gray-600 dark:text-gray-300 mb-6">
              Chez Mura Storage, nous croyons que chaque entreprise mérite une gestion de stock efficace et moderne. 
              Notre mission est de démocratiser l'accès aux outils de gestion professionnels en proposant des 
              solutions intuitives, abordables et adaptées à tous les types d'entreprises.
            </p>
            <p class="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Nous nous engageons à fournir une plateforme qui simplifie les opérations complexes, réduit les 
              erreurs humaines et maximise l'efficacité opérationnelle de nos clients.
            </p>
            
            <!-- Values -->
            <div class="space-y-4">
              <div class="flex items-start space-x-3">
                <div class="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900 dark:text-white">Innovation continue</h3>
                  <p class="text-gray-600 dark:text-gray-300">Nous intégrons les dernières technologies pour rester à la pointe</p>
            </div>
          </div>
              
              <div class="flex items-start space-x-3">
                <div class="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
            </div>
                <div>
                  <h3 class="font-semibold text-gray-900 dark:text-white">Simplicité d'utilisation</h3>
                  <p class="text-gray-600 dark:text-gray-300">Des interfaces intuitives pour une adoption rapide</p>
                </div>
              </div>
              
              <div class="flex items-start space-x-3">
                <div class="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900 dark:text-white">Support exceptionnel</h3>
                  <p class="text-gray-600 dark:text-gray-300">Une équipe dédiée pour votre réussite</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="relative">
            <img 
              src="../../public/img/customer2.png" 
              alt="Équipe Mura Storage" 
              class="w-full rounded-2xl shadow-2xl"
            >
            <div class="absolute -bottom-6 -right-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div class="text-center">
                <div class="text-3xl font-bold text-emerald-600 mb-1">500+</div>
                <div class="text-sm text-gray-600 dark:text-gray-300">Clients satisfaits</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Story Section -->
    <section class="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Notre Histoire
          </h2>
          <p class="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            De l'idée à la réalité : comment Mura Storage est devenu la référence en gestion de stock
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Timeline Item 1 -->
          <div class="text-center">
            <div class="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span class="text-2xl font-bold text-white">2019</span>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Les Débuts</h3>
            <p class="text-gray-600 dark:text-gray-300">
              Lancement du Groupe Mura avec une vision : simplifier la gestion de stock pour les PME camerounaises.
            </p>
          </div>
          
          <!-- Timeline Item 2 -->
          <div class="text-center">
            <div class="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span class="text-2xl font-bold text-white">2021</span>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Première Version</h3>
            <p class="text-gray-600 dark:text-gray-300">
              Lancement de la première version de Mura storage avec 50 entreprises pilotes et des retours exceptionnels.
            </p>
          </div>
          
          <!-- Timeline Item 3 -->
          <div class="text-center">
            <div class="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span class="text-2xl font-bold text-white">2024</span>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Expansion</h3>
            <p class="text-gray-600 dark:text-gray-300">
              Plus de 500 entreprises nous font confiance. Nouvelle version avec IA et intégrations avancées.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Team Section -->
    <section class="py-16 md:py-24 bg-white dark:bg-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Notre Équipe
          </h2>
          <p class="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Des experts passionnés qui travaillent chaque jour pour améliorer votre expérience
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <!-- Team Member 1 -->
          <div class="text-center group">
            <div class="w-32 h-32 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full mx-auto mb-6 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <span class="text-4xl font-bold text-white">WT</span>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Wilfried Tayou</h3>
            <p class="text-emerald-600 font-medium mb-2">Fondateur & CEO</p>
            <p class="text-gray-600 dark:text-gray-300 text-sm">
              Visionnaire et entrepreneur passionné par l'innovation technologique
            </p>
          </div>
          
          
          <div class="text-center group">
            <div class="w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full mx-auto mb-6 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <span class="text-4xl font-bold text-white">MM</span>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Miss montex</h3>
            <p class="text-emerald-600 font-medium mb-2">CTO</p>
            <p class="text-gray-600 dark:text-gray-300 text-sm">
              Experte en développement ABAP et architecture BTP
            </p>
          </div>
          
          <!-- Team Member 3 -->
          <div class="text-center group">
            <div class="w-32 h-32 bg-gradient-to-br from-orange-400 to-red-500 rounded-full mx-auto mb-6 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <span class="text-4xl font-bold text-white">RN</span>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Ra-ra Nguetsa</h3>
            <p class="text-emerald-600 font-medium mb-2">Lead Developer</p>
            <p class="text-gray-600 dark:text-gray-300 text-sm">
              Spécialiste en développement full-stack et optimisation des performances
            </p>
          </div>
          
          <!-- Team Member 4 -->
          <div class="text-center group">
            <div class="w-32 h-32 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full mx-auto mb-6 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <span class="text-4xl font-bold text-white">DK</span>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Durel Kamga</h3>
            <p class="text-emerald-600 font-medium mb-2">Head of Product</p>
            <p class="text-gray-600 dark:text-gray-300 text-sm">
              Expert en front, UX/UI et gestion de produit avec une approche centrée utilisateur
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="py-16 md:py-24 bg-gradient-to-r from-emerald-600 to-blue-600">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">
            Nos Réalisations
          </h2>
          <p class="text-xl text-emerald-100 max-w-3xl mx-auto">
            Des chiffres qui témoignent de notre engagement et de notre succès
          </p>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div class="text-center">
            <div class="text-4xl md:text-5xl font-bold text-white mb-2">500+</div>
            <div class="text-emerald-100">Entreprises</div>
            <div class="text-emerald-200 text-sm">Clients satisfaits</div>
          </div>
          <div class="text-center">
            <div class="text-4xl md:text-5xl font-bold text-white mb-2">45+</div>
            <div class="text-emerald-100">Créations</div>
            <div class="text-emerald-200 text-sm">D'entreprises</div>
          </div>
          <div class="text-center">
            <div class="text-4xl md:text-5xl font-bold text-white mb-2">5+</div>
            <div class="text-emerald-100">Années</div>
            <div class="text-emerald-200 text-sm">D'expérience</div>
          </div>
          <div class="text-center">
            <div class="text-4xl md:text-5xl font-bold text-white mb-2">99.9%</div>
            <div class="text-emerald-100">Disponibilité</div>
            <div class="text-emerald-200 text-sm">Service uptime</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Values Section -->
    <section class="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Nos Valeurs
          </h2>
          <p class="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Les principes qui guident notre action et notre relation avec nos clients
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Value 1 -->
          <div class="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div class="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center mb-6">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Excellence</h3>
            <p class="text-gray-600 dark:text-gray-300">
              Nous nous efforçons de fournir des solutions de la plus haute qualité, en nous améliorant constamment.
            </p>
          </div>
          
          <!-- Value 2 -->
          <div class="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div class="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Confiance</h3>
            <p class="text-gray-600 dark:text-gray-300">
              La sécurité et la confidentialité de vos données sont notre priorité absolue.
            </p>
          </div>
          
          <!-- Value 3 -->
          <div class="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div class="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-6">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Innovation</h3>
            <p class="text-gray-600 dark:text-gray-300">
              Nous intégrons les dernières technologies pour vous offrir des solutions d'avant-garde.
            </p>
          </div>
          
          <!-- Value 4 -->
          <div class="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div class="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-6">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Collaboration</h3>
            <p class="text-gray-600 dark:text-gray-300">
              Nous travaillons en étroite collaboration avec nos clients pour comprendre leurs besoins.
            </p>
          </div>
          
          <!-- Value 5 -->
          <div class="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div class="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center mb-6">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Passion</h3>
            <p class="text-gray-600 dark:text-gray-300">
              Nous sommes passionnés par ce que nous faisons et cela se reflète dans notre travail.
            </p>
          </div>
          
          <!-- Value 6 -->
          <div class="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div class="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-6">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Transparence</h3>
            <p class="text-gray-600 dark:text-gray-300">
              Nous communiquons ouvertement et honnêtement avec nos clients et partenaires.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 md:py-24 bg-white dark:bg-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
          Rejoignez-nous dans cette aventure
        </h2>
        <p class="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
          Découvrez comment Mura Storage peut transformer votre gestion de stock et contribuer au succès de votre entreprise
        </p>
        
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink 
            to="/home/inscription" 
            class="inline-flex items-center px-8 py-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-semibold text-lg"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            Commencer maintenant
          </NuxtLink>
          
          <NuxtLink 
            to="/home/contact_accueil" 
            class="inline-flex items-center px-8 py-4 border-2 border-emerald-600 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors font-semibold text-lg"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
            Nous contacter
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
  </template>
  
<style scoped>
/* Responsive adjustments */
@media (max-width: 768px) {
  .text-6xl {
    font-size: 3rem;
  }
  
  .text-5xl {
    font-size: 2.5rem;
  }
  
  .text-4xl {
    font-size: 2rem;
  }
  }
  </style>