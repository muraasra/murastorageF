<template>
  <section class="py-20 md:py-28 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-16">
        <span class="inline-flex items-center px-4 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-4">
          Témoignages
        </span>
        <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Ce que nos 
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-blue-600">clients</span> 
          disent de nous
        </h2>
        <p class="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Découvrez pourquoi des centaines d'entreprises nous font confiance
        </p>
      </div>

      <!-- Testimonials Carousel -->
      <div class="relative">
        <!-- Navigation Buttons -->
        <div class="flex justify-center items-center gap-4 mb-8">
          <button 
            @click="prevTestimonial" 
            class="p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl hover:bg-emerald-50 dark:hover:bg-gray-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-100 dark:border-gray-700"
            :disabled="currentIndex === 0"
            aria-label="Témoignage précédent"
          >
            <svg class="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <!-- Dots Indicator -->
          <div class="flex gap-2">
            <button 
              v-for="(_, index) in Math.ceil(testimonials.length / itemsPerPage)" 
              :key="index"
              @click="goToPage(index)"
              :class="[
                'w-2.5 h-2.5 rounded-full transition-all duration-300',
                currentIndex === index 
                  ? 'bg-emerald-600 w-8' 
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-emerald-400'
              ]"
              :aria-label="`Page ${index + 1}`"
            />
          </div>
          
          <button 
            @click="nextTestimonial" 
            class="p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl hover:bg-emerald-50 dark:hover:bg-gray-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-100 dark:border-gray-700"
            :disabled="currentIndex >= Math.ceil(testimonials.length / itemsPerPage) - 1"
            aria-label="Témoignage suivant"
          >
            <svg class="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <!-- Cards Grid -->
        <div 
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 transition-all duration-500"
        >
          <div 
            v-for="(testimonial, index) in visibleTestimonials" 
            :key="testimonial.id"
            :class="[
              'group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 dark:border-gray-700',
            ]"
            :style="{ animationDelay: `${index * 100}ms` }"
          >
            <!-- Quote Icon -->
            <div class="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg transform -rotate-12 group-hover:rotate-0 transition-transform duration-500">
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
              </svg>
            </div>

            <!-- Content -->
            <div class="relative pt-4">
              <!-- Stars -->
              <div class="flex gap-1 mb-4">
                <svg 
                  v-for="star in 5" 
                  :key="star"
                  :class="[
                    'w-5 h-5 transition-colors',
                    star <= testimonial.stars ? 'text-yellow-400' : 'text-gray-200 dark:text-gray-600'
                  ]"
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              </div>

              <!-- Testimonial Text -->
              <p class="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed italic">
                "{{ testimonial.content }}"
              </p>

              <!-- Author -->
              <div class="flex items-center">
                <div class="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg mr-4">
                  {{ testimonial.name.split(' ').map(n => n[0]).join('') }}
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900 dark:text-white">{{ testimonial.name }}</h4>
                  <p class="text-sm text-gray-500 dark:text-gray-400">{{ testimonial.role || 'Client satisfait' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- CTA -->
      <div class="text-center mt-16">
        <p class="text-gray-600 dark:text-gray-400 mb-4">Rejoignez nos clients satisfaits</p>
        <NuxtLink 
          to="/home/inscription"
          class="inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-105"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
          Commencer gratuitement
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

interface Testimonial {
  id: number;
  name: string;
  content: string;
  stars: number;
  role?: string;
}

const testimonials: Testimonial[] = [
  { 
    id: 1, 
    name: 'Jean Dupont', 
    content: 'Grâce à Mura Storage, ma gestion des stocks est impeccable et je gagne un temps précieux chaque mois. L\'interface est intuitive et le support est exceptionnel.',
    stars: 5,
    role: 'Gérant de boutique'
  },
  { 
    id: 2, 
    name: 'Marie Curie', 
    content: 'Une équipe experte et à l\'écoute. J\'ai enfin trouvé des conseils adaptés à mes besoins. Je recommande vivement !',
    stars: 5,
    role: 'Directrice commerciale'
  },
  { 
    id: 3, 
    name: 'Pierre Martin', 
    content: 'Ils m\'ont aidé à optimiser la gestion de mes produits dans toutes mes entreprises. Service exceptionnel et résultats immédiats.',
    stars: 5,
    role: 'Entrepreneur'
  },
  { 
    id: 4, 
    name: 'Sophie Durand', 
    content: 'Des solutions personnalisées pour mon entreprise. La facturation automatique m\'a fait gagner des heures de travail.',
    stars: 5,
    role: 'Responsable logistique'
  },
  { 
    id: 5, 
    name: 'Lucie Bernard', 
    content: 'Leur expertise m\'a permis de réduire mes coûts tout en améliorant la traçabilité de mon stock. Excellent rapport qualité-prix.',
    stars: 4,
    role: 'Propriétaire de restaurant'
  },
  { 
    id: 6, 
    name: 'Marc Lemoine', 
    content: 'Une équipe professionnelle et réactive. Ils m\'ont accompagné à chaque étape de la mise en place. Parfait !',
    stars: 5,
    role: 'Gestionnaire de stock'
  },
];

const currentIndex = ref(0);
const itemsPerPage = ref(3);
let autoPlayInterval: NodeJS.Timeout | null = null;

// Responsive items per page
const updateItemsPerPage = () => {
  if (typeof window !== 'undefined') {
    if (window.innerWidth < 768) {
      itemsPerPage.value = 1;
    } else if (window.innerWidth < 1024) {
      itemsPerPage.value = 2;
    } else {
      itemsPerPage.value = 3;
    }
  }
};

const visibleTestimonials = computed(() => {
  const start = currentIndex.value * itemsPerPage.value;
  return testimonials.slice(start, start + itemsPerPage.value);
});

const nextTestimonial = () => {
  if (currentIndex.value < Math.ceil(testimonials.length / itemsPerPage.value) - 1) {
    currentIndex.value++;
  } else {
    currentIndex.value = 0; // Loop back to start
  }
};

const prevTestimonial = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  } else {
    currentIndex.value = Math.ceil(testimonials.length / itemsPerPage.value) - 1;
  }
};

const goToPage = (index: number) => {
  currentIndex.value = index;
};

// Auto-play carousel
const startAutoPlay = () => {
  autoPlayInterval = setInterval(() => {
    nextTestimonial();
  }, 5000);
};

const stopAutoPlay = () => {
  if (autoPlayInterval) {
    clearInterval(autoPlayInterval);
    autoPlayInterval = null;
  }
};

onMounted(() => {
  updateItemsPerPage();
  startAutoPlay();
  
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', updateItemsPerPage);
  }
});

onUnmounted(() => {
  stopAutoPlay();
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', updateItemsPerPage);
  }
});
</script>

<style scoped>
/* Smooth card entrance animation */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.grid > div {
  animation: slideUp 0.5s ease-out forwards;
}
</style>
