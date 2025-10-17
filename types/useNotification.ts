export const useNotification = () => {
  const error = (message: string) => {
    if (process.client) {
      // Créer une notification d'erreur
      const notification = document.createElement('div')
      notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full'
      notification.innerHTML = `
        <div class="flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          ${message}
        </div>
      `
      
      document.body.appendChild(notification)
      
      // Animer l'entrée
      setTimeout(() => {
        notification.classList.remove('translate-x-full')
      }, 100)
      
      // Supprimer après 5 secondes
      setTimeout(() => {
        notification.classList.add('translate-x-full')
        setTimeout(() => {
          document.body.removeChild(notification)
        }, 300)
      }, 5000)
    }
  }

  const success = (message: string) => {
    if (process.client) {
      // Créer une notification de succès
      const notification = document.createElement('div')
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full'
      notification.innerHTML = `
        <div class="flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          ${message}
        </div>
      `
      
      document.body.appendChild(notification)
      
      // Animer l'entrée
      setTimeout(() => {
        notification.classList.remove('translate-x-full')
      }, 100)
      
      // Supprimer après 5 secondes
      setTimeout(() => {
        notification.classList.add('translate-x-full')
        setTimeout(() => {
          document.body.removeChild(notification)
        }, 300)
      }, 5000)
    }
  }

  const info = (message: string) => {
    if (process.client) {
      // Créer une notification d'information
      const notification = document.createElement('div')
      notification.className = 'fixed top-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full'
      notification.innerHTML = `
        <div class="flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          ${message}
        </div>
      `
      
      document.body.appendChild(notification)
      
      // Animer l'entrée
      setTimeout(() => {
        notification.classList.remove('translate-x-full')
      }, 100)
      
      // Supprimer après 5 secondes
      setTimeout(() => {
        notification.classList.add('translate-x-full')
        setTimeout(() => {
          document.body.removeChild(notification)
        }, 300)
      }, 5000)
    }
  }

  const warning = (message: string) => {
    if (process.client) {
      // Créer une notification d'avertissement
      const notification = document.createElement('div')
      notification.className = 'fixed top-4 right-4 bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full'
      notification.innerHTML = `
        <div class="flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
          ${message}
        </div>
      `
      
      document.body.appendChild(notification)
      
      // Animer l'entrée
      setTimeout(() => {
        notification.classList.remove('translate-x-full')
      }, 100)
      
      // Supprimer après 5 secondes
      setTimeout(() => {
        notification.classList.add('translate-x-full')
        setTimeout(() => {
          document.body.removeChild(notification)
        }, 300)
      }, 5000)
    }
  }

  return {
    error,
    success,
    info,
    warning
  }
}