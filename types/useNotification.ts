// Système de notifications en POPUP
// - Modal centré sur l'écran
// - Backdrop semi-transparent
// - Visible sur mobile et PC
// - Filtre automatiquement les URLs du backend
// - Animation fluide
// - Support du mode sombre

// Fonction pour nettoyer les messages (supprimer les URLs)
const sanitizeMessage = (message: string): string => {
  if (!message) return 'Une erreur est survenue'
  
  // Supprimer les URLs (http, https, localhost, IP, domaines)
  let cleanMessage = message
    .replace(/https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi, '')
    .replace(/localhost(:\d+)?[^\s<>"{}|\\^`\[\]]*/gi, '')
    .replace(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?[^\s<>"{}|\\^`\[\]]*/gi, '')
    .replace(/[a-zA-Z0-9-]+\.(com|cm|net|org|io|app|dev|pythonanywhere)[^\s<>"{}|\\^`\[\]]*/gi, '')
    .replace(/API_BASE_URL[^\s]*/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
  
  // Si le message est vide après nettoyage, retourner un message par défaut
  if (!cleanMessage || cleanMessage.length < 3) {
    return 'Une erreur est survenue'
  }
  
  return cleanMessage
}

// Compteur pour les IDs uniques
let popupId = 0

const createPopupNotification = (
  message: string, 
  type: 'success' | 'error' | 'info' | 'warning',
  duration: number = 0 // 0 = manuel (doit cliquer pour fermer)
) => {
  if (!process.client) return
  
  const cleanMessage = sanitizeMessage(message)
  const id = ++popupId
  
  // Configuration des styles selon le type
  const configs = {
    success: {
      bgGradient: 'from-emerald-500 to-emerald-600',
      bgLight: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      textColor: 'text-emerald-800',
      buttonBg: 'bg-emerald-600 hover:bg-emerald-700',
      icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>`,
      title: 'Succès !',
      emoji: '✓'
    },
    error: {
      bgGradient: 'from-red-500 to-red-600',
      bgLight: 'bg-red-50',
      borderColor: 'border-red-200',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      textColor: 'text-red-800',
      buttonBg: 'bg-red-600 hover:bg-red-700',
      icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>`,
      title: 'Erreur',
      emoji: '✕'
    },
    info: {
      bgGradient: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-800',
      buttonBg: 'bg-blue-600 hover:bg-blue-700',
      icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>`,
      title: 'Information',
      emoji: 'ℹ'
    },
    warning: {
      bgGradient: 'from-amber-500 to-orange-500',
      bgLight: 'bg-amber-50',
      borderColor: 'border-amber-200',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      textColor: 'text-amber-800',
      buttonBg: 'bg-amber-600 hover:bg-amber-700',
      icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>`,
      title: 'Attention',
      emoji: '⚠'
    }
  }
  
  const config = configs[type]
  
  // Créer le backdrop
  const backdrop = document.createElement('div')
  backdrop.id = `popup-backdrop-${id}`
  backdrop.className = 'fixed inset-0 z-[99998] bg-black/60 backdrop-blur-sm opacity-0 transition-opacity duration-300'
  backdrop.style.cssText = 'display: flex; align-items: center; justify-content: center; padding: 16px;'
  
  // Créer le popup
  const popup = document.createElement('div')
  popup.id = `popup-${id}`
  popup.className = 'relative w-full max-w-md transform scale-90 opacity-0 transition-all duration-300'
  
  popup.innerHTML = `
    <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border ${config.borderColor} dark:border-gray-700">
      <!-- Header avec gradient -->
      <div class="bg-gradient-to-r ${config.bgGradient} px-6 py-5 relative overflow-hidden">
        <!-- Pattern décoratif -->
        <div class="absolute inset-0 opacity-10">
          <svg class="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid-${id}" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" stroke-width="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid-${id})"/>
          </svg>
        </div>
        
        <div class="relative flex items-center gap-4">
          <!-- Icône principale -->
          <div class="flex-shrink-0 w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg">
            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              ${config.icon}
            </svg>
          </div>
          
          <!-- Titre -->
          <div class="flex-1">
            <h3 class="text-2xl font-bold text-white drop-shadow-sm">${config.title}</h3>
            <p class="text-white/80 text-sm mt-0.5">Notification du système</p>
          </div>
        </div>
      </div>
      
      <!-- Corps du message -->
      <div class="px-6 py-6">
        <div class="${config.bgLight} dark:bg-gray-700/50 rounded-2xl p-5 border ${config.borderColor} dark:border-gray-600">
          <p class="${config.textColor} dark:text-gray-200 text-base sm:text-lg leading-relaxed font-medium">
            ${cleanMessage}
          </p>
        </div>
      </div>
      
      <!-- Footer avec bouton -->
      <div class="px-6 pb-6">
        <button 
          id="popup-close-${id}"
          class="w-full ${config.buttonBg} text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-lg"
        >
          <span>Compris</span>
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Indicateur de fermeture automatique (si duration > 0) -->
    ${duration > 0 ? `
    <div class="absolute bottom-0 left-6 right-6 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden" style="bottom: 24px; margin-bottom: 60px;">
      <div id="popup-progress-${id}" class="h-full ${config.buttonBg.split(' ')[0]} transition-all ease-linear" style="width: 100%; transition-duration: ${duration}ms;"></div>
    </div>
    ` : ''}
  `
  
  backdrop.appendChild(popup)
  document.body.appendChild(backdrop)
  
  // Bloquer le scroll du body
  document.body.style.overflow = 'hidden'
  
  // Fonction pour fermer le popup
  const closePopup = () => {
    backdrop.classList.remove('opacity-100')
    backdrop.classList.add('opacity-0')
    popup.classList.remove('scale-100', 'opacity-100')
    popup.classList.add('scale-90', 'opacity-0')
    
    setTimeout(() => {
      if (backdrop.parentNode) {
        backdrop.parentNode.removeChild(backdrop)
      }
      // Restaurer le scroll si plus de popups
      if (!document.querySelector('[id^="popup-backdrop-"]')) {
        document.body.style.overflow = ''
      }
    }, 300)
  }
  
  // Animer l'entrée
  requestAnimationFrame(() => {
    backdrop.classList.remove('opacity-0')
    backdrop.classList.add('opacity-100')
    popup.classList.remove('scale-90', 'opacity-0')
    popup.classList.add('scale-100', 'opacity-100')
    
    // Démarrer la barre de progression si duration > 0
    if (duration > 0) {
      const progress = document.getElementById(`popup-progress-${id}`)
      if (progress) {
        requestAnimationFrame(() => {
          progress.style.width = '0%'
        })
      }
    }
  })
  
  // Événement de fermeture sur le bouton
  const closeButton = document.getElementById(`popup-close-${id}`)
  if (closeButton) {
    closeButton.addEventListener('click', closePopup)
  }
  
  // Fermeture sur clic du backdrop (optionnel)
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) {
      closePopup()
    }
  })
  
  // Fermeture avec la touche Escape
  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closePopup()
      document.removeEventListener('keydown', handleKeydown)
    }
  }
  document.addEventListener('keydown', handleKeydown)
  
  // Fermeture automatique si duration > 0
  if (duration > 0) {
    setTimeout(closePopup, duration)
  }
  
  // Retourner la fonction de fermeture pour usage externe
  return closePopup
}

export const useNotification = () => {
  const error = (message: string, autoClose: boolean = false) => {
    createPopupNotification(message, 'error', autoClose ? 6000 : 0)
  }

  const success = (message: string, autoClose: boolean = true) => {
    createPopupNotification(message, 'success', autoClose ? 4000 : 0)
  }

  const info = (message: string, autoClose: boolean = true) => {
    createPopupNotification(message, 'info', autoClose ? 5000 : 0)
  }

  const warning = (message: string, autoClose: boolean = false) => {
    createPopupNotification(message, 'warning', autoClose ? 5000 : 0)
  }

  // Fonction pour afficher les erreurs d'API de manière conviviale
  const apiError = (err: any) => {
    let message = 'Une erreur est survenue'
    
    if (err?.data?.detail) {
      message = err.data.detail
    } else if (err?.data?.message) {
      message = err.data.message
    } else if (err?.data?.error) {
      message = err.data.error
    } else if (err?.message) {
      message = err.message
    } else if (typeof err === 'string') {
      message = err
    }
    
    // Messages conviviaux pour les erreurs courantes
    if (err?.statusCode === 401 || err?.status === 401) {
      message = 'Session expirée. Veuillez vous reconnecter.'
    } else if (err?.statusCode === 403 || err?.status === 403) {
      message = 'Vous n\'avez pas les permissions nécessaires.'
    } else if (err?.statusCode === 404 || err?.status === 404) {
      message = 'Ressource non trouvée.'
    } else if (err?.statusCode === 500 || err?.status === 500) {
      message = 'Erreur serveur. Veuillez réessayer plus tard.'
    } else if (err?.statusCode === 502 || err?.status === 502) {
      message = 'Service temporairement indisponible.'
    } else if (err?.statusCode === 503 || err?.status === 503) {
      message = 'Service en maintenance. Veuillez réessayer plus tard.'
    } else if (err?.name === 'FetchError' || message.toLowerCase().includes('fetch')) {
      message = 'Erreur de connexion. Vérifiez votre connexion internet.'
    } else if (message.toLowerCase().includes('network')) {
      message = 'Problème de réseau. Vérifiez votre connexion.'
    }
    
    error(message)
  }

  return {
    error,
    success,
    info,
    warning,
    apiError
  }
}
