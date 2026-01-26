<script setup lang="ts">
import { ref, nextTick, onMounted, watch } from 'vue'

const isOpen = ref(false)
const isMinimized = ref(false)
const message = ref('')
const isTyping = ref(false)
const hasUnread = ref(true)

interface Message {
  id: number
  text: string
  isBot: boolean
  time: string
}

const messages = ref<Message[]>([
  {
    id: 1,
    text: "Bonjour ! 👋 Je suis l'assistant virtuel de Mura Storage. Comment puis-je vous aider aujourd'hui ?",
    isBot: true,
    time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }
])

// Quick replies
const quickReplies = [
  { text: "Tarifs", query: "tarifs" },
  { text: "Fonctionnalités", query: "fonctionnalités" },
  { text: "Essai gratuit", query: "essai" },
  { text: "Contacter", query: "contact" }
]

// Bot responses based on keywords
const getBotResponse = (userMessage: string): string => {
  const lowerMessage = userMessage.toLowerCase()
  
  if (lowerMessage.includes('tarif') || lowerMessage.includes('prix') || lowerMessage.includes('coût')) {
    return "📊 Nos tarifs sont simples et transparents :\n\n• **Free** : Gratuit pendant 3 mois\n• **Basic** : 9 900 XAF/mois\n• **Premium** : 29 900 XAF/mois\n• **Organisation** : Sur devis\n\nVoulez-vous que je vous aide à choisir le plan adapté à vos besoins ?"
  }
  
  if (lowerMessage.includes('fonctionnalit') || lowerMessage.includes('feature') || lowerMessage.includes('service')) {
    return "🚀 Mura Storage offre de nombreuses fonctionnalités :\n\n• Gestion de stock en temps réel\n• Multi-entrepôts et boutiques\n• Facturation automatisée\n• Codes-barres et QR codes\n• Rapports et analyses\n• API pour intégrations\n\nQuelle fonctionnalité vous intéresse le plus ?"
  }
  
  if (lowerMessage.includes('essai') || lowerMessage.includes('gratuit') || lowerMessage.includes('test')) {
    return "🎉 Excellente nouvelle ! Vous pouvez essayer Mura Storage **gratuitement pendant 3 mois** sans carte bancaire.\n\nCliquez sur 'Commencer gratuitement' pour créer votre compte dès maintenant !"
  }
  
  if (lowerMessage.includes('contact') || lowerMessage.includes('téléphone') || lowerMessage.includes('email')) {
    return "📞 Vous pouvez nous contacter de plusieurs façons :\n\n• **Téléphone** : +237 658 934 147\n• **Email** : contact@murastorage.cm\n• **Adresse** : Bafoussam, Cameroun\n\nNotre équipe est disponible 24/7 pour vous accompagner !"
  }
  
  if (lowerMessage.includes('bonjour') || lowerMessage.includes('salut') || lowerMessage.includes('hello')) {
    return "Bonjour ! 😊 Ravi de vous accueillir. Comment puis-je vous aider avec Mura Storage aujourd'hui ?"
  }
  
  if (lowerMessage.includes('merci')) {
    return "De rien ! 🙏 C'est un plaisir de vous aider. N'hésitez pas si vous avez d'autres questions !"
  }
  
  return "Je comprends votre question. Pour une assistance plus personnalisée, je vous invite à :\n\n• Consulter notre FAQ\n• Nous contacter directement au +237 658 934 147\n• Demander une démo personnalisée\n\nY a-t-il autre chose que je puisse faire pour vous ?"
}

const messagesContainer = ref<HTMLElement | null>(null)

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const sendMessage = (text?: string) => {
  const messageText = text || message.value.trim()
  if (!messageText) return
  
  // Add user message
  messages.value.push({
    id: Date.now(),
    text: messageText,
    isBot: false,
    time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  })
  
  message.value = ''
  scrollToBottom()
  
  // Simulate bot typing
  isTyping.value = true
  
  setTimeout(() => {
    isTyping.value = false
    messages.value.push({
      id: Date.now() + 1,
      text: getBotResponse(messageText),
      isBot: true,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    })
    scrollToBottom()
  }, 1000 + Math.random() * 1000)
}

const toggleChat = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    hasUnread.value = false
    isMinimized.value = false
    scrollToBottom()
  }
}

const handleQuickReply = (query: string) => {
  sendMessage(query)
}

// Subtle bounce animation for the button
const showPulse = ref(true)

onMounted(() => {
  // Show pulse for 10 seconds then stop
  setTimeout(() => {
    showPulse.value = false
  }, 10000)
})
</script>

<template>
  <!-- Chat Button -->
  <button
    @click="toggleChat"
    class="fixed bottom-6 right-6 z-[9998] group"
    aria-label="Ouvrir le chat"
  >
    <!-- Pulse rings -->
    <div v-if="showPulse && !isOpen" class="absolute inset-0">
      <span class="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-30"></span>
      <span class="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-20 animation-delay-500"></span>
    </div>
    
    <!-- Unread badge -->
    <span 
      v-if="hasUnread && !isOpen"
      class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-bounce"
    >
      1
    </span>
    
    <!-- Button -->
    <div 
      :class="[
        'relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300',
        isOpen 
          ? 'bg-gray-700 hover:bg-gray-600 rotate-0' 
          : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 hover:scale-110'
      ]"
    >
      <!-- Chat icon -->
      <svg 
        v-if="!isOpen"
        class="w-7 h-7 text-white transition-transform group-hover:scale-110" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
      </svg>
      <!-- Close icon -->
      <svg 
        v-else
        class="w-6 h-6 text-white" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
      </svg>
    </div>
    
    <!-- Tooltip -->
    <span 
      v-if="!isOpen"
      class="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
    >
      Besoin d'aide ? 💬
    </span>
  </button>

  <!-- Chat Window -->
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 scale-95 translate-y-4"
    enter-to-class="opacity-100 scale-100 translate-y-0"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 scale-100 translate-y-0"
    leave-to-class="opacity-0 scale-95 translate-y-4"
  >
    <div 
      v-if="isOpen"
      class="fixed bottom-24 right-6 z-[9997] w-[360px] max-w-[calc(100vw-3rem)] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
    >
      <!-- Header -->
      <div class="bg-gradient-to-r from-emerald-600 to-emerald-500 p-4 text-white">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
            <div>
              <h3 class="font-semibold">Mura Assistant</h3>
              <p class="text-xs text-emerald-100 flex items-center">
                <span class="w-2 h-2 bg-green-400 rounded-full mr-1.5 animate-pulse"></span>
                En ligne
              </p>
            </div>
          </div>
          <button 
            @click="isMinimized = !isMinimized"
            class="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 12H6"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Messages -->
      <div 
        v-show="!isMinimized"
        ref="messagesContainer"
        class="h-80 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800"
      >
        <div 
          v-for="msg in messages" 
          :key="msg.id"
          :class="[
            'flex',
            msg.isBot ? 'justify-start' : 'justify-end'
          ]"
        >
          <div 
            :class="[
              'max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm',
              msg.isBot 
                ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none' 
                : 'bg-emerald-600 text-white rounded-tr-none'
            ]"
          >
            <p class="text-sm whitespace-pre-line" v-html="msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')"></p>
            <p :class="['text-xs mt-1', msg.isBot ? 'text-gray-400' : 'text-emerald-200']">
              {{ msg.time }}
            </p>
          </div>
        </div>

        <!-- Typing indicator -->
        <div v-if="isTyping" class="flex justify-start">
          <div class="bg-white dark:bg-gray-700 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
            <div class="flex space-x-1">
              <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
              <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
              <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Replies -->
      <div v-show="!isMinimized && messages.length <= 2" class="px-4 pb-2 bg-gray-50 dark:bg-gray-800">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="reply in quickReplies"
            :key="reply.query"
            @click="handleQuickReply(reply.query)"
            class="px-3 py-1.5 bg-white dark:bg-gray-700 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-sm rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors"
          >
            {{ reply.text }}
          </button>
        </div>
      </div>

      <!-- Input -->
      <div v-show="!isMinimized" class="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <form @submit.prevent="sendMessage()" class="flex items-center space-x-2">
          <input
            v-model="message"
            type="text"
            placeholder="Tapez votre message..."
            class="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 border-0 rounded-full text-sm focus:ring-2 focus:ring-emerald-500 dark:text-white"
          />
          <button
            type="submit"
            :disabled="!message.trim()"
            class="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
          </button>
        </form>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.animation-delay-500 {
  animation-delay: 500ms;
}
</style>
