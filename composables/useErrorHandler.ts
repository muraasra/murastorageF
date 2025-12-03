// Composable pour gérer et personnaliser les erreurs API
export const useErrorHandler = () => {
  
  // Messages d'erreur personnalisés (messages propres pour utilisateurs finaux)
  const errorMessages: Record<string, string> = {
    // Erreurs d'authentification
    '400': 'Requête invalide.',
    '401': 'Veuillez vous connecter.',
    '403': 'Vous n\'avez pas les permissions nécessaires pour cette action.',
    '404': 'Ressource introuvable.',
    '500': 'Erreur interne, veuillez réessayer.',
    '502': 'Service temporairement indisponible. Veuillez réessayer plus tard.',
    '503': 'Service temporairement indisponible. Veuillez réessayer plus tard.',
    
    // Erreurs de validation
    'validation_error': 'Les données fournies ne sont pas valides.',
    'required_field': 'Ce champ est obligatoire.',
    
    // Erreurs de limite
    'limit_reached': 'Vous avez atteint la limite autorisée par votre plan.',
    
    // Erreurs de connexion
    'network_error': 'Problème de connexion. Vérifiez votre connexion internet.',
    'timeout': 'Le serveur met trop de temps à répondre. Veuillez réessayer.',
  }
  
  // Fonction pour nettoyer et personnaliser les messages d'erreur
  const cleanErrorMessage = (error: any): string => {
    // Si c'est une string, la retourner telle quelle (déjà nettoyée)
    if (typeof error === 'string') {
      return error
    }
    
    // Gérer les erreurs HTTP
    if (error.status || error.statusCode) {
      const statusCode = error.status || error.statusCode
      return errorMessages[statusCode.toString()] || getErrorMessage(error)
    }
    
    // Gérer les erreurs API avec message
    if (error.message) {
      // Supprimer les URLs et chemins de fichiers
      let message = error.message
      
      // Supprimer les URLs complètes (http://, https://)
      message = message.replace(/https?:\/\/[^\s\)]+/g, '')
      
      // Supprimer les chemins de fichiers (Windows et Unix)
      message = message.replace(/[a-zA-Z]:\\?[^\s\)]+|[\/][a-zA-Z0-9_\.\/-]+/g, '')
      
      // Supprimer les numéros de ligne et références techniques
      message = message.replace(/line \d+|:\d+:|@\d+|#\d+/g, '')
      
      // Supprimer les stack traces complètes
      if (message.includes('at ')) {
        message = message.split('at ')[0].trim()
      }
      
      // Supprimer les références à des fichiers techniques
      message = message.replace(/\.(vue|ts|js|py|html):\d+/g, '')
      
      // Nettoyer les espaces multiples
      message = message.replace(/\s+/g, ' ').trim()
      
      return message
    }
    
    // Message par défaut
    return 'Une erreur inattendue est survenue.'
  }
  
  // Fonction pour obtenir un message d'erreur depuis l'objet d'erreur
  const getErrorMessage = (error: any): string => {
    // Priorité 1: Message personnalisé
    if (error.error_message) {
      return error.error_message
    }
    
    // Priorité 2: Message de détail
    if (error.detail) {
      return cleanErrorMessage({ message: error.detail })
    }
    
    // Priorité 3: Message général
    if (error.message) {
      return cleanErrorMessage({ message: error.message })
    }
    
    // Priorité 4: Message par défaut selon le code
    if (error.status || error.statusCode) {
      const code = error.status || error.statusCode
      return errorMessages[code.toString()] || 'Une erreur est survenue.'
    }
    
    // Dernier recours
    return 'Une erreur inattendue est survenue.'
  }
  
  // Fonction pour afficher une notification d'erreur
  const showError = (error: any, title: string = 'Erreur') => {
    const message = cleanErrorMessage(error)
    console.error(`[${title}]`, error)
    
    // Utiliser le système de notification de l'app
    if (process.client) {
      // Vous pouvez intégrer avec votre système de notification existant
      // Par exemple: useToast().error(title, message)
      alert(message) // Fallback basique - à remplacer
    }
  }
  
  // Fonction pour logger les erreurs sans les afficher
  const logError = (error: any, context?: string) => {
    const message = cleanErrorMessage(error)
    console.error(context ? `[${context}]` : '[Error]', message, error)
  }
  
  return {
    cleanErrorMessage,
    getErrorMessage,
    showError,
    logError,
    errorMessages
  }
}
