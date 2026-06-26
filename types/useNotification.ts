// Système de notifications toast — coin supérieur droit
// - Succès : 5s auto-close, Erreur : 8s, Info : 6s, Warning : 7s
// - Barre de progression visible en bas du toast
// - Pause automatique au survol (hover)
// - Fermeture manuelle (×) ou Échap
// - Repositionnement fluide quand un toast se ferme

const sanitizeMessage = (message: string): string => {
  if (!message) return 'Une erreur est survenue'
  let clean = message
    .replace(/https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi, '')
    .replace(/localhost(:\d+)?[^\s<>"{}|\\^`\[\]]*/gi, '')
    .replace(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?[^\s<>"{}|\\^`\[\]]*/gi, '')
    .replace(/[a-zA-Z0-9-]+\.(com|cm|net|org|io|app|dev|pythonanywhere)[^\s<>"{}|\\^`\[\]]*/gi, '')
    .replace(/API_BASE_URL[^\s]*/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (!clean || clean.length < 3) return 'Une erreur est survenue'
  return clean
}

const TOAST_Z = 999999
const TOAST_CLASS = 'ms-toast-v2'
const TOAST_H = 88
const TOAST_GAP = 10
const TOAST_TOP = 16

function repositionAll() {
  const all = document.querySelectorAll<HTMLElement>(`.${TOAST_CLASS}`)
  Array.from(all).forEach((el, i) => {
    el.style.top = `${TOAST_TOP + i * (TOAST_H + TOAST_GAP)}px`
  })
}

let toastId = 0

const createToast = (
  message: string,
  type: 'success' | 'error' | 'info' | 'warning',
  duration: number
) => {
  if (!process.client) return

  const clean = sanitizeMessage(message)
  const id = ++toastId

  type Cfg = { border: string; iconBg: string; iconColor: string; bar: string; icon: string; title: string }
  const configs: Record<string, Cfg> = {
    success: {
      border: 'border-l-4 border-l-emerald-500',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      bar: 'bg-emerald-500',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>',
      title: 'Succès',
    },
    error: {
      border: 'border-l-4 border-l-red-500',
      iconBg: 'bg-red-100 dark:bg-red-900/40',
      iconColor: 'text-red-600 dark:text-red-400',
      bar: 'bg-red-500',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>',
      title: 'Erreur',
    },
    info: {
      border: 'border-l-4 border-l-blue-500',
      iconBg: 'bg-blue-100 dark:bg-blue-900/40',
      iconColor: 'text-blue-600 dark:text-blue-400',
      bar: 'bg-blue-500',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>',
      title: 'Information',
    },
    warning: {
      border: 'border-l-4 border-l-amber-500',
      iconBg: 'bg-amber-100 dark:bg-amber-900/40',
      iconColor: 'text-amber-600 dark:text-amber-400',
      bar: 'bg-amber-500',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>',
      title: 'Attention',
    },
  }
  const c = configs[type]

  const count = document.querySelectorAll<HTMLElement>(`.${TOAST_CLASS}`).length
  const topPx = TOAST_TOP + count * (TOAST_H + TOAST_GAP)

  const el = document.createElement('div')
  el.setAttribute('role', 'alert')
  el.setAttribute('aria-live', 'assertive')
  el.className = `${TOAST_CLASS} fixed right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[340px]`
  el.style.cssText = `
    z-index: ${TOAST_Z};
    top: ${topPx}px;
    opacity: 0;
    transform: translateX(calc(100% + 1.5rem));
    transition: top 0.25s ease, opacity 0.22s ease, transform 0.25s cubic-bezier(0.175,0.885,0.32,1.275);
  `

  el.innerHTML = `
    <div class="relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-2xl ${c.border}">
      <!-- Contenu principal -->
      <div class="flex items-start gap-3 px-4 py-3.5 pr-10">
        <div class="${c.iconBg} ${c.iconColor} w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">${c.icon}</svg>
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-bold text-gray-900 dark:text-white">${c.title}</p>
          <p class="text-xs text-gray-600 dark:text-gray-300 mt-0.5 leading-relaxed">${clean}</p>
        </div>
      </div>
      <!-- Bouton fermer -->
      <button
        id="toast-close-${id}"
        type="button"
        aria-label="Fermer"
        class="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
      <!-- Barre de progression -->
      <div class="absolute bottom-0 left-0 h-[3px] w-full bg-gray-100 dark:bg-gray-700">
        <div
          id="toast-bar-${id}"
          class="h-full ${c.bar} origin-left"
          style="width: 100%;"
        ></div>
      </div>
    </div>
  `

  document.body.appendChild(el)

  // Entrée
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.style.opacity = '1'
      el.style.transform = 'translateX(0)'
    })
  })

  // Timer pausable
  let timer: ReturnType<typeof setTimeout> | null = null
  let elapsed = 0
  let startAt: number
  let barEl: HTMLElement | null = null

  const dismiss = () => {
    if (timer) { clearTimeout(timer); timer = null }
    document.removeEventListener('keydown', onKey)
    el.style.opacity = '0'
    el.style.transform = 'translateX(calc(100% + 1.5rem))'
    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el)
      repositionAll()
    }, 280)
  }

  const startTimer = (remaining: number) => {
    if (remaining <= 0) { dismiss(); return }
    barEl = document.getElementById(`toast-bar-${id}`)
    startAt = Date.now()
    timer = setTimeout(dismiss, remaining)
    if (barEl) {
      const pct = (remaining / duration) * 100
      barEl.style.transition = 'none'
      barEl.style.width = `${pct}%`
      // Forcer le reflow puis animer
      void barEl.offsetWidth
      barEl.style.transition = `width ${remaining}ms linear`
      barEl.style.width = '0%'
    }
  }

  const pauseTimer = () => {
    if (!timer) return
    clearTimeout(timer)
    timer = null
    elapsed += Date.now() - startAt
    if (barEl) {
      const pct = Math.max(0, ((duration - elapsed) / duration) * 100)
      barEl.style.transition = 'none'
      barEl.style.width = `${pct}%`
    }
  }

  const resumeTimer = () => {
    startTimer(Math.max(0, duration - elapsed))
  }

  el.addEventListener('mouseenter', pauseTimer)
  el.addEventListener('mouseleave', resumeTimer)

  const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') dismiss() }
  document.addEventListener('keydown', onKey)

  document.getElementById(`toast-close-${id}`)?.addEventListener('click', dismiss)

  startTimer(duration)
  return dismiss
}

export const useNotification = () => {
  const success = (message: string) => createToast(message, 'success', 5000)
  const error   = (message: string) => createToast(message, 'error',   8000)
  const info    = (message: string) => createToast(message, 'info',    6000)
  const warning = (message: string) => createToast(message, 'warning', 7000)

  const apiError = (err: any) => {
    let message = 'Une erreur est survenue'
    if (err?.data?.detail)   message = err.data.detail
    else if (err?.data?.message) message = err.data.message
    else if (err?.data?.error)   message = err.data.error
    else if (err?.message)       message = err.message
    else if (typeof err === 'string') message = err

    const s = err?.statusCode || err?.status
    if (s === 401)        message = 'Session expirée. Veuillez vous reconnecter.'
    else if (s === 403)   message = "Vous n'avez pas les permissions nécessaires."
    else if (s === 404)   message = 'Ressource non trouvée.'
    else if (s === 500)   message = 'Erreur serveur. Veuillez réessayer plus tard.'
    else if (s === 502 || s === 503) message = 'Service temporairement indisponible.'
    else if (err?.name === 'FetchError' || (message + '').toLowerCase().includes('fetch'))
      message = 'Erreur de connexion. Vérifiez votre connexion internet.'

    error(message)
  }

  return { success, error, info, warning, apiError }
}
