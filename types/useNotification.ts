// Système de notifications type Amazon
// - Barre en haut de l'écran, au-dessus de tout (navbar, modales)
// - z-index 999999 pour être toujours visible
// - Pas de fond plein écran : barre seule, non bloquante
// - Filtre les URLs du backend (sanitizeMessage)
// - Support mobile/desktop et mode sombre

const sanitizeMessage = (message: string): string => {
  if (!message) return 'Une erreur est survenue'

  let cleanMessage = message
    .replace(/https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi, '')
    .replace(/localhost(:\d+)?[^\s<>"{}|\\^`\[\]]*/gi, '')
    .replace(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?[^\s<>"{}|\\^`\[\]]*/gi, '')
    .replace(/[a-zA-Z0-9-]+\.(com|cm|net|org|io|app|dev|pythonanywhere)[^\s<>"{}|\\^`\[\]]*/gi, '')
    .replace(/API_BASE_URL[^\s]*/gi, '')
    .replace(/\s+/g, ' ')
    .trim()

  if (!cleanMessage || cleanMessage.length < 3) return 'Une erreur est survenue'
  return cleanMessage
}

let barId = 0
const NOTIFICATION_Z = 999999

const createTopBarNotification = (
  message: string,
  type: 'success' | 'error' | 'info' | 'warning',
  duration: number = 0
) => {
  if (!process.client) return

  const cleanMessage = sanitizeMessage(message)
  const id = ++barId

  const configs: Record<string, { bg: string; text: string; icon: string; title: string }> = {
    success: {
      bg: 'bg-emerald-600 dark:bg-emerald-700',
      text: 'text-white',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>',
      title: 'Succès',
    },
    error: {
      bg: 'bg-red-600 dark:bg-red-700',
      text: 'text-white',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>',
      title: 'Erreur',
    },
    info: {
      bg: 'bg-blue-600 dark:bg-blue-700',
      text: 'text-white',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>',
      title: 'Information',
    },
    warning: {
      bg: 'bg-amber-600 dark:bg-amber-700',
      text: 'text-white',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>',
      title: 'Attention',
    },
  }
  const config = configs[type]

  const bar = document.createElement('div')
  bar.id = `notification-bar-${id}`
  bar.setAttribute('role', 'alert')
  bar.className = `fixed top-0 left-0 right-0 ${config.bg} ${config.text} shadow-lg transform -translate-y-full transition-transform duration-300 ease-out`
  bar.style.zIndex = String(NOTIFICATION_Z)

  bar.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
      <div class="flex items-center gap-3 min-w-0 flex-1">
        <span class="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center" aria-hidden="true">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">${config.icon}</svg>
        </span>
        <div class="min-w-0">
          <p class="font-semibold text-sm sm:text-base">${config.title}</p>
          <p class="text-white/95 text-sm sm:text-base truncate sm:whitespace-normal">${cleanMessage}</p>
        </div>
      </div>
      <button
        id="notification-close-${id}"
        type="button"
        class="flex-shrink-0 p-2 rounded-full hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label="Fermer"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  `

  document.body.appendChild(bar)

  const closeBar = () => {
    document.removeEventListener('keydown', handleKeydown)
    bar.classList.remove('translate-y-0')
    bar.classList.add('-translate-y-full')
    setTimeout(() => {
      if (bar.parentNode) bar.parentNode.removeChild(bar)
    }, 300)
  }

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') closeBar()
  }

  const closeBtn = document.getElementById(`notification-close-${id}`)
  if (closeBtn) closeBtn.addEventListener('click', closeBar)
  document.addEventListener('keydown', handleKeydown)

  requestAnimationFrame(() => {
    bar.classList.remove('-translate-y-full')
    bar.classList.add('translate-y-0')
  })

  if (duration > 0) setTimeout(closeBar, duration)

  return closeBar
}

export const useNotification = () => {
  const error = (message: string, autoClose: boolean = false) => {
    return createTopBarNotification(message, 'error', autoClose ? 6000 : 0)
  }

  const success = (message: string, autoClose: boolean = true) => {
    return createTopBarNotification(message, 'success', autoClose ? 4000 : 0)
  }

  const info = (message: string, autoClose: boolean = true) => {
    return createTopBarNotification(message, 'info', autoClose ? 5000 : 0)
  }

  const warning = (message: string, autoClose: boolean = false) => {
    return createTopBarNotification(message, 'warning', autoClose ? 5000 : 0)
  }

  const apiError = (err: any) => {
    let message = 'Une erreur est survenue'

    if (err?.data?.detail) message = err.data.detail
    else if (err?.data?.message) message = err.data.message
    else if (err?.data?.error) message = err.data.error
    else if (err?.message) message = err.message
    else if (typeof err === 'string') message = err

    if (err?.statusCode === 401 || err?.status === 401) message = 'Session expirée. Veuillez vous reconnecter.'
    else if (err?.statusCode === 403 || err?.status === 403) message = "Vous n'avez pas les permissions nécessaires."
    else if (err?.statusCode === 404 || err?.status === 404) message = 'Ressource non trouvée.'
    else if (err?.statusCode === 500 || err?.status === 500) message = 'Erreur serveur. Veuillez réessayer plus tard.'
    else if (err?.statusCode === 502 || err?.status === 502) message = 'Service temporairement indisponible.'
    else if (err?.statusCode === 503 || err?.status === 503) message = 'Service en maintenance. Veuillez réessayer plus tard.'
    else if (err?.name === 'FetchError' || (message && message.toLowerCase().includes('fetch'))) message = 'Erreur de connexion. Vérifiez votre connexion internet.'
    else if (message && message.toLowerCase().includes('network')) message = 'Problème de réseau. Vérifiez votre connexion.'

    error(message)
  }

  return { error, success, info, warning, apiError }
}
