// Système de notifications style "toast" (type WhatsApp / notification OS)
// - Petite carte en haut de l'écran (mobile & desktop)
// - Au-dessus de tout (z-index 999999), non bloquante
// - Filtre les URLs du backend (sanitizeMessage)
// - S'adapte au mobile (pleine largeur) et au desktop (coin supérieur droit)

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

  const configs: Record<
    string,
    { bg: string; text: string; icon: string; title: string }
  > = {
    success: {
      bg: 'bg-emerald-100 dark:bg-emerald-900/40',
      text: 'text-emerald-700 dark:text-emerald-300',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>',
      title: 'Succès',
    },
    error: {
      bg: 'bg-red-100 dark:bg-red-900/40',
      text: 'text-red-700 dark:text-red-300',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>',
      title: 'Erreur',
    },
    info: {
      bg: 'bg-blue-100 dark:bg-blue-900/40',
      text: 'text-blue-700 dark:text-blue-300',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>',
      title: 'Information',
    },
    warning: {
      bg: 'bg-amber-100 dark:bg-amber-900/40',
      text: 'text-amber-700 dark:text-amber-300',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>',
      title: 'Attention',
    },
  }
  const config = configs[type]

  const bar = document.createElement('div')
  bar.id = `notification-bar-${id}`
  bar.setAttribute('role', 'alert')
  bar.className =
    `fixed ms-toast-notification ${config.text} ` +
    'right-4 left-4 sm:left-auto sm:right-6 max-w-sm w-auto ' +
    'bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200/80 dark:border-gray-700/80 ' +
    'transform -translate-y-full opacity-0 transition-all duration-300 ease-out pointer-events-auto'
  bar.style.zIndex = String(NOTIFICATION_Z)

  // Empiler les toasts : décaler en fonction du nombre déjà présents
  const existing = document.querySelectorAll('.ms-toast-notification').length
  const baseOffset = 16 // 16px
  const gap = 88 // hauteur approximative + marge
  const top = baseOffset + existing * gap
  bar.style.top = `${top}px`

  bar.innerHTML = `
    <div class="px-4 py-3 flex items-start gap-3">
      <div class="flex-shrink-0">
        <span class="w-9 h-9 rounded-full flex items-center justify-center ${config.bg}" aria-hidden="true">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">${config.icon}</svg>
        </span>
      </div>
      <div class="min-w-0 flex-1">
        <p class="font-semibold text-sm sm:text-[15px] mb-0.5">${config.title}</p>
        <p class="text-xs sm:text-sm text-gray-700 dark:text-gray-200 line-clamp-3 break-words">
          ${cleanMessage}
        </p>
      </div>
      <button
        id="notification-close-${id}"
        type="button"
        class="flex-shrink-0 mt-0.5 p-1.5 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
        aria-label="Fermer"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    bar.classList.remove('-translate-y-full', 'opacity-0')
    bar.classList.add('translate-y-0', 'opacity-100')
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
