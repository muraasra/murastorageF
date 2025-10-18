<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useNotification } from '@/types/useNotification'

definePageMeta({
  layout: "accueil",
})

const { error, success } = useNotification()

// État du composant
const email = ref('')
const verificationCode = ref('')
const isLoading = ref(false)
const isResending = ref(false)
const countdown = ref(0)
const timer = ref(null)

// Charger l'email depuis localStorage
onMounted(() => {
  if (process.client) {
    const savedData = localStorage.getItem('inscription_form_data')
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        email.value = parsedData.user?.email || ''
      } catch (e) {
        console.error('Erreur lors du chargement des données:', e)
      }
    }
  }
})

// Fonction pour vérifier le code
const verifyCode = async () => {
  if (!verificationCode.value || verificationCode.value.length !== 6) {
    error('Veuillez entrer un code de vérification à 6 chiffres')
    return
  }

  isLoading.value = true

  try {
    const { data, error: apiError } = await useApi('https://murastorage.pythonanywhere.com/api/email-verification/verify_code/', {
      method: 'POST',
      body: JSON.stringify({
        email: email.value,
        code: verificationCode.value
      }),
      server: false
    })

    if (apiError.value) {
      error(apiError.value.message || 'Erreur lors de la vérification')
      return
    }

    if (data.value?.success) {
      success('Email vérifié avec succès ! Vous allez recevoir un email de confirmation.')
      
      // Effacer les données sauvegardées
      if (process.client) {
        localStorage.removeItem('inscription_form_data')
      }
      
      // Redirection vers la page de connexion après 3 secondes
      setTimeout(() => {
        navigateTo('/connexion')
      }, 3000)
    } else {
      error(data.value?.message || 'Erreur lors de la vérification')
    }

  } catch (err) {
    console.error('Erreur lors de la vérification:', err)
    error('Une erreur est survenue lors de la vérification')
  } finally {
    isLoading.value = false
  }
}

// Fonction pour renvoyer le code
const resendCode = async () => {
  if (!email.value) {
    error('Email requis pour renvoyer le code')
    return
  }

  isResending.value = true

  try {
    const { data, error: apiError } = await useApi('https://murastorage.pythonanywhere.com/api/email-verification/resend_code/', {
      method: 'POST',
      body: JSON.stringify({
        email: email.value
      }),
      server: false
    })

    if (apiError.value) {
      error(apiError.value.message || 'Erreur lors du renvoi du code')
      return
    }

    if (data.value?.success) {
      success('Code de vérification renvoyé avec succès !')
      startCountdown()
    } else {
      error(data.value?.message || 'Erreur lors du renvoi du code')
    }

  } catch (err) {
    console.error('Erreur lors du renvoi:', err)
    error('Une erreur est survenue lors du renvoi du code')
  } finally {
    isResending.value = false
  }
}

// Fonction pour démarrer le compte à rebours
const startCountdown = () => {
  countdown.value = 60 // 60 secondes
  timer.value = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer.value)
      timer.value = null
    }
  }, 1000)
}

// Démarrer le compte à rebours au montage
onMounted(() => {
  startCountdown()
})

// Nettoyer le timer au démontage
onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value)
  }
})

// Formatage du code de vérification (limiter à 6 chiffres)
const formatCode = (value: string) => {
  return value.replace(/\D/g, '').slice(0, 6)
}

// Mise à jour du code avec formatage
const updateCode = (event: Event) => {
  const target = event.target as HTMLInputElement
  verificationCode.value = formatCode(target.value)
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
    <div class="max-w-md mx-auto">
      <!-- En-tête -->
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Vérification de votre email
        </h1>
        <p class="text-gray-600 dark:text-gray-300">
          Nous avons envoyé un code de vérification à 6 chiffres à
        </p>
        <p class="text-emerald-600 font-medium">{{ email }}</p>
      </div>

      <!-- Formulaire de vérification -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <form @submit.prevent="verifyCode" class="space-y-6">
          <!-- Champ code de vérification -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Code de vérification *
            </label>
            <div class="relative">
              <input
                v-model="verificationCode"
                @input="updateCode"
                type="text"
                maxlength="6"
                placeholder="123456"
                class="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
              Entrez le code à 6 chiffres reçu par email
            </p>
          </div>

          <!-- Bouton de vérification -->
          <UButton
            type="submit"
            :disabled="!verificationCode || verificationCode.length !== 6 || isLoading"
            :loading="isLoading"
            color="emerald"
            size="lg"
            class="w-full"
          >
            <template #leading>
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </template>
            {{ isLoading ? 'Vérification...' : 'Vérifier le code' }}
          </UButton>

          <!-- Bouton renvoyer le code -->
          <div class="text-center">
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Vous n'avez pas reçu le code ?
            </p>
            <UButton
              @click="resendCode"
              :disabled="isResending || countdown > 0"
              :loading="isResending"
              variant="outline"
              color="gray"
              size="sm"
            >
              <template #leading>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
              </template>
              {{ countdown > 0 ? `Renvoyer dans ${countdown}s` : 'Renvoyer le code' }}
            </UButton>
          </div>
        </form>

        <!-- Informations supplémentaires -->
        <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div class="flex items-start">
              <svg class="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
              </svg>
              <div>
                <h4 class="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                  Code non reçu ?
                </h4>
                <ul class="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Vérifiez votre dossier spam/courrier indésirable</li>
                  <li>• Le code expire dans 15 minutes</li>
                  <li>• Vous pouvez demander un nouveau code</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Lien vers la connexion -->
      <div class="text-center mt-6">
        <p class="text-gray-600 dark:text-gray-400">
          Vous avez déjà un compte ? 
          <NuxtLink to="/connexion" class="text-emerald-600 hover:underline font-medium">
            Se connecter
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>






























