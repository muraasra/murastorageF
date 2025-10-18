// Composable pour masquer les URLs sensibles dans les logs
export const useSecureLogging = () => {
  const maskUrl = (url: string): string => {
    if (!url) return url
    
    // Masquer les URLs du backend
    return url.replace(/https?:\/\/[^\/]+/, '[API]')
  }

  const maskError = (error: any): any => {
    if (!error) return error
    
    const maskedError = { ...error }
    
    // Masquer les URLs dans le message d'erreur
    if (maskedError.message) {
      maskedError.message = maskedError.message.replace(/https?:\/\/[^\s]+/g, '[Serveur]')
    }
    
    // Masquer les URLs dans la stack trace
    if (maskedError.stack) {
      maskedError.stack = maskedError.stack.replace(/https?:\/\/[^\s]+/g, '[Serveur]')
    }
    
    return maskedError
  }

  const secureLog = (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${maskUrl(message)}]`, data ? maskError(data) : '')
    }
  }

  const secureError = (message: string, error?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${maskUrl(message)}]`, error ? maskError(error) : '')
    }
  }

  return {
    maskUrl,
    maskError,
    secureLog,
    secureError
  }
}

