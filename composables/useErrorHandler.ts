import { useSecureLogging } from '@/composables/useSecureLogging'

export const useErrorHandler = () => {
  const { error } = useNotification()
  const { maskError, secureError } = useSecureLogging()

  const handleApiError = (apiError: any, context: string = '') => {
    if (!apiError) return

    // Log sécurisé de l'erreur (masque les URLs)
    secureError(`API Error in ${context}`, apiError)

    const statusCode = apiError.statusCode || apiError.status || 0
    
    // Messages d'erreur directs selon le code de statut
    if (statusCode === 0 || 
        apiError.message?.includes('fetch') || 
        apiError.message?.includes('network') ||
        apiError.message?.includes('Failed to fetch') ||
        apiError.message?.includes('ERR_NETWORK') ||
        apiError.message?.includes('ERR_CONNECTION_REFUSED')) {
      error('Problème de connexion réseau. Vérifiez votre connexion internet.')
    }
    // Erreur d'authentification (serveur répond mais identifiants incorrects)
    else if (statusCode === 401 || statusCode === 400) {
      error('Identifiants incorrects')
    }
    // Erreur de permissions
    else if (statusCode === 403) {
      error('Accès non autorisé. Vérifiez vos permissions.')
    }
    // Erreur serveur interne
    else if (statusCode >= 500) {
      error('Erreur du serveur. Veuillez réessayer plus tard.')
    }
    // Erreur de validation
    else if (statusCode === 422) {
      error('Données invalides. Vérifiez les informations saisies.')
    }
    // Autres erreurs - message générique
    else {
      error('Une erreur est survenue lors de la connexion')
    }
  }

  const handleNetworkError = () => {
    error('Problème de connexion réseau. Vérifiez votre connexion internet.')
  }

  const handleAuthError = () => {
    error('Email ou mot de passe incorrect')
  }

  const handleGenericError = (message?: string) => {
    error(message || 'Une erreur est survenue')
  }

  return {
    handleApiError,
    handleNetworkError,
    handleAuthError,
    handleGenericError
  }
}
