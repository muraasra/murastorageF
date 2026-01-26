<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const position = ref(0)
const direction = ref(1) // 1 = right, -1 = left
const isWalking = ref(true)
const isPaused = ref(false)
const showBubble = ref(false)
const bubbleMessage = ref('')

const messages = [
  "Stock bien géré !",
  "Facture envoyée !",
  "Inventaire OK",
  "3 mois gratuits !",
  "Besoin d'aide ?",
  "Top performance !",
  "Données sécurisées"
]

let animationFrame: number | null = null
let pauseTimeout: NodeJS.Timeout | null = null

const walk = () => {
  if (!isWalking.value || isPaused.value) {
    animationFrame = requestAnimationFrame(walk)
    return
  }
  
  // Update position
  position.value += direction.value * 1.5
  
  // Screen width boundaries
  const maxWidth = typeof window !== 'undefined' ? window.innerWidth - 60 : 1000
  
  // Change direction at boundaries
  if (position.value >= maxWidth) {
    direction.value = -1
    triggerPause()
  } else if (position.value <= 0) {
    direction.value = 1
    triggerPause()
  }
  
  // Random pause occasionally
  if (Math.random() < 0.002 && !isPaused.value) {
    triggerPause()
  }
  
  animationFrame = requestAnimationFrame(walk)
}

const triggerPause = () => {
  isPaused.value = true
  
  // Show bubble sometimes
  if (Math.random() < 0.7) {
    bubbleMessage.value = messages[Math.floor(Math.random() * messages.length)]
    showBubble.value = true
  }
  
  pauseTimeout = setTimeout(() => {
    isPaused.value = false
    showBubble.value = false
  }, 2000 + Math.random() * 2000)
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    // Start at random position
    position.value = Math.random() * (window.innerWidth - 100)
    walk()
  }
})

onUnmounted(() => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
  if (pauseTimeout) {
    clearTimeout(pauseTimeout)
  }
})
</script>

<template>
  <div 
    class="fixed bottom-0 z-[9990] pointer-events-none transition-transform duration-100"
    :style="{ left: position + 'px', transform: `scaleX(${direction})` }"
  >
    <!-- Speech Bubble -->
    <Transition
      enter-active-class="transition-all duration-300"
      enter-from-class="opacity-0 scale-75 translate-y-2"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition-all duration-200"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-75"
    >
      <div 
        v-if="showBubble"
        class="absolute -top-12 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-xs px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap border border-emerald-200 dark:border-emerald-700"
        :style="{ transform: `scaleX(${direction}) translateX(-50%)` }"
      >
        {{ bubbleMessage }}
        <!-- Triangle -->
        <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white dark:bg-gray-800 border-r border-b border-emerald-200 dark:border-emerald-700 transform rotate-45"></div>
      </div>
    </Transition>
    
    <!-- Manager Character SVG -->
    <svg 
      width="50" 
      height="60" 
      viewBox="0 0 50 60" 
      class="drop-shadow-lg"
      :class="{ 'animate-walk': isWalking && !isPaused, 'animate-idle': isPaused }"
    >
      <!-- Head -->
      <circle cx="25" cy="12" r="10" fill="#FFDBB4"/>
      
      <!-- Hair -->
      <path d="M15 10 Q15 3 25 3 Q35 3 35 10 Q35 6 25 6 Q15 6 15 10" fill="#4A3728"/>
      
      <!-- Eyes -->
      <circle cx="21" cy="11" r="1.5" fill="#333"/>
      <circle cx="29" cy="11" r="1.5" fill="#333"/>
      <circle cx="21.5" cy="10.5" r="0.5" fill="#FFF"/>
      <circle cx="29.5" cy="10.5" r="0.5" fill="#FFF"/>
      
      <!-- Smile -->
      <path d="M22 15 Q25 18 28 15" stroke="#333" stroke-width="1" fill="none" stroke-linecap="round"/>
      
      <!-- Glasses -->
      <rect x="17" y="8" width="7" height="5" rx="1" fill="none" stroke="#333" stroke-width="0.8"/>
      <rect x="26" y="8" width="7" height="5" rx="1" fill="none" stroke="#333" stroke-width="0.8"/>
      <line x1="24" y1="10" x2="26" y2="10" stroke="#333" stroke-width="0.8"/>
      
      <!-- Body / Suit -->
      <path d="M17 22 L15 45 L20 45 L22 30 L25 32 L28 30 L30 45 L35 45 L33 22 Z" fill="#10B981"/>
      
      <!-- Tie -->
      <path d="M25 22 L23 26 L25 35 L27 26 Z" fill="#064E3B"/>
      
      <!-- Shirt collar -->
      <path d="M20 22 L25 25 L30 22" fill="none" stroke="#FFF" stroke-width="1.5"/>
      
      <!-- Arms -->
      <g :class="{ 'animate-arm-swing': isWalking && !isPaused }">
        <path d="M17 24 L8 35 L10 36 L18 28" fill="#10B981"/>
        <!-- Briefcase -->
        <rect x="4" y="33" width="8" height="6" rx="1" fill="#8B5E3C"/>
        <line x1="5" y1="36" x2="11" y2="36" stroke="#5D3A1A" stroke-width="0.5"/>
        <rect x="7" y="32" width="2" height="2" rx="0.5" fill="#5D3A1A"/>
      </g>
      
      <g :class="{ 'animate-arm-swing-reverse': isWalking && !isPaused }">
        <path d="M33 24 L40 32 L38 34 L32 28" fill="#10B981"/>
        <!-- Hand -->
        <circle cx="39" cy="33" r="2.5" fill="#FFDBB4"/>
      </g>
      
      <!-- Legs with walking animation -->
      <g :class="{ 'animate-leg-left': isWalking && !isPaused }">
        <path d="M20 45 L18 55 L22 55 L23 45" fill="#1E3A5F"/>
        <!-- Shoe -->
        <ellipse cx="20" cy="56" rx="4" ry="2" fill="#333"/>
      </g>
      
      <g :class="{ 'animate-leg-right': isWalking && !isPaused }">
        <path d="M27 45 L28 55 L32 55 L30 45" fill="#1E3A5F"/>
        <!-- Shoe -->
        <ellipse cx="30" cy="56" rx="4" ry="2" fill="#333"/>
      </g>
      
      <!-- ID Badge -->
      <rect x="28" y="26" width="5" height="7" rx="0.5" fill="#FFF" stroke="#CCC" stroke-width="0.3"/>
      <rect x="29" y="27" width="3" height="2" fill="#DDD"/>
      <line x1="29" y1="30" x2="32" y2="30" stroke="#10B981" stroke-width="0.5"/>
      <line x1="29" y1="31" x2="31" y2="31" stroke="#10B981" stroke-width="0.5"/>
    </svg>
  </div>
</template>

<style scoped>
@keyframes walk {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

.animate-walk {
  animation: walk 0.4s ease-in-out infinite;
}

@keyframes idle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-1px); }
}

.animate-idle {
  animation: idle 1.5s ease-in-out infinite;
}

@keyframes arm-swing {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(15deg); }
}

.animate-arm-swing {
  transform-origin: 17px 24px;
  animation: arm-swing 0.4s ease-in-out infinite;
}

@keyframes arm-swing-reverse {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(-15deg); }
}

.animate-arm-swing-reverse {
  transform-origin: 33px 24px;
  animation: arm-swing-reverse 0.4s ease-in-out infinite;
}

@keyframes leg-left {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(20deg); }
}

.animate-leg-left {
  transform-origin: 21px 45px;
  animation: leg-left 0.4s ease-in-out infinite;
}

@keyframes leg-right {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(-20deg); }
}

.animate-leg-right {
  transform-origin: 29px 45px;
  animation: leg-right 0.4s ease-in-out infinite;
}
</style>
