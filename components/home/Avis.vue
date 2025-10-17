<template>
    <section class="py-20">
        <AtomsContainer>
            <div
            class="w-full relative py-8 md:py-10 px-6 md:px-8 rounded-2xl bg-gradient-to-tr from-emerald-100 to-emerald-300 dark:from-emerald-900 dark:to-body-color">
        
            <div class="mx-auto text-center max-w-xl md:max-w-2xl relative">
                <h2 class="text-gray-800 pt-4 dark:text-white font-bold text-4xl md:text-5xl lg:text-6x">
                        Découvrez ce que <span
                            class="text-center text-white dark:text-emerald-500">les gens</span>
                         disent de nous
                    </h2>
                    
            </div>    <br>      
      
      <div class="flex justify-center items-center space-x-4 mb-8">
        <button 
          @click="prevTestimonial" 
          class="p-3 rounded-full bg-primary text-white shadow-md hover:shadow-lg hover:bg-secondary transition duration-300 ease-in-out" 
          :disabled="currentIndex === 0"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button 
          @click="nextTestimonial" 
          class="p-3 rounded-full bg-primary text-white shadow-md hover:shadow-lg hover:bg-secondary transition duration-300 ease-in-out" 
          :disabled="currentIndex >= testimonials.length / 3 - 1"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        <div 
          v-for="(testimonial, index) in visibleTestimonials" 
          :key="testimonial.id" 
          class="relative p-6 border border-gray-200 rounded-lg shadow-lg bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 transition-transform transform hover:scale-105 hover:shadow-2xl"
        >
          <div class="absolute inset-0 bg-primary opacity-10 rounded-lg"></div>
          <div class="relative z-10">
            <div class="font-semibold text-lg text-gray-800 dark:text-white">{{ testimonial.name }}</div>
            <p class="mt-4 text-gray-600 dark:text-gray-300 italic">{{ testimonial.content }}</p>
            <div class="flex mt-4">
              <span v-for="star in testimonial.stars" :key="star" class="text-yellow-400 text-lg">★</span>
              <span v-for="emptyStar in 5 - testimonial.stars" :key="emptyStar" class="text-gray-300 text-lg">★</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </AtomsContainer>
  
    </section>
    
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue';
  
  interface Testimonial {
    id: number;
    name: string;
    content: string;
    stars: number;
  }
  
  const testimonials: Testimonial[] = [
    { id: 1, name: 'Jean Dupont', content: 'Grâce à cette plateforme, ma gestion des stocks est impeccable et je gagne du temps chaque mois.', stars: 5 },
    { id: 2, name: 'Marie Curie', content: 'Une équipe experte et à l’écoute. J’ai enfin trouvé des conseils  adaptés à mes besoins.', stars: 4 },
    { id: 3, name: 'Pierre Martin', content: 'Ils m’ont aidé à optimiser la gestion de mes produits dans toutes mes entreprises. Service exceptionnel !', stars: 5 },
    { id: 4, name: 'Sophie Durand', content: 'Des solutions personnalisées pour mon entreprise. Je les recommande vivement.', stars: 5 },
    { id: 5, name: 'Lucie Bernard', content: 'Leur expertise m’a permis de réduire mes coûts tout en respectant les réglementations.', stars: 4 },
    { id: 6, name: 'Marc Lemoine', content: 'Une equipe professionnelle et réactive. Ils m’ont accompagné à chaque étape.', stars: 5 },
    { id: 7, name: 'Claire Lefèvre', content: 'Je suis ravi de leurs services. Un vrai partenaire pour mon activité.', stars: 4 },
  ];
  
  const currentIndex = ref(0);
  
  const visibleTestimonials = computed(() => {
    const start = currentIndex.value * 3; // 3 témoignages par "page"
    return testimonials.slice(start, start + 3);
  });
  
  const nextTestimonial = () => {
    if (currentIndex.value < Math.ceil(testimonials.length / 3) - 1) {
      currentIndex.value++;
    }
  };
  
  const prevTestimonial = () => {
    if (currentIndex.value > 0) {
      currentIndex.value--;
    }
  };
  </script>
  
  <style scoped>
  h2 {
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.15);
  }
  
  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  </style>
  