// Composable pour la gestion de l'expiration des données
export const useDataExpiration = () => {
  const EXPIRATION_TIME = 24 * 60 * 60 * 1000 // 24 heures en millisecondes

  // Sauvegarder avec timestamp
  const saveWithExpiration = (key: string, data: any, expirationHours: number = 24) => {
    if (process.client) {
      try {
        const expirationTime = Date.now() + (expirationHours * 60 * 60 * 1000)
        const dataWithExpiration = {
          data,
          timestamp: Date.now(),
          expirationTime
        }
        localStorage.setItem(key, JSON.stringify(dataWithExpiration))
        console.log(`Données sauvegardées avec expiration dans ${expirationHours}h`)
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error)
      }
    }
  }

  // Charger avec vérification d'expiration
  const loadWithExpiration = (key: string, defaultValue: any = null) => {
    if (process.client) {
      try {
        const saved = localStorage.getItem(key)
        if (!saved) return defaultValue

        const parsed = JSON.parse(saved)
        
        // Vérifier si les données ont expiré
        if (Date.now() > parsed.expirationTime) {
          console.log('Données expirées, suppression...')
          localStorage.removeItem(key)
          return defaultValue
        }

        // Calculer le temps restant
        const timeLeft = parsed.expirationTime - Date.now()
        const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000))
        const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000))
        
        console.log(`Données valides encore ${hoursLeft}h ${minutesLeft}m`)
        return parsed.data
      } catch (error) {
        console.error('Erreur lors du chargement:', error)
        return defaultValue
      }
    }
    return defaultValue
  }

  // Vérifier si des données sont sur le point d'expirer
  const checkExpirationWarning = (key: string, warningHours: number = 2) => {
    if (process.client) {
      try {
        const saved = localStorage.getItem(key)
        if (!saved) return null

        const parsed = JSON.parse(saved)
        const timeLeft = parsed.expirationTime - Date.now()
        const hoursLeft = timeLeft / (60 * 60 * 1000)

        if (hoursLeft <= warningHours && hoursLeft > 0) {
          return {
            hoursLeft: Math.floor(hoursLeft),
            minutesLeft: Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000))
          }
        }
      } catch (error) {
        console.error('Erreur vérification expiration:', error)
      }
    }
    return null
  }

  // Nettoyer toutes les données expirées
  const cleanupExpiredData = () => {
    if (process.client) {
      const keys = Object.keys(localStorage)
      let cleanedCount = 0

      keys.forEach(key => {
        if (key.startsWith('invoice-draft') || key.startsWith('temp-data')) {
          try {
            const saved = localStorage.getItem(key)
            if (saved) {
              const parsed = JSON.parse(saved)
              if (parsed.expirationTime && Date.now() > parsed.expirationTime) {
                localStorage.removeItem(key)
                cleanedCount++
              }
            }
          } catch (error) {
            // Supprimer les données corrompues
            localStorage.removeItem(key)
            cleanedCount++
          }
        }
      })

      if (cleanedCount > 0) {
        console.log(`${cleanedCount} données expirées nettoyées`)
      }
    }
  }

  // Programmer le nettoyage automatique
  const scheduleCleanup = () => {
    if (process.client) {
      // Nettoyer toutes les heures
      setInterval(cleanupExpiredData, 60 * 60 * 1000)
      
      // Nettoyer au démarrage
      cleanupExpiredData()
    }
  }

  // Obtenir le statut d'expiration
  const getExpirationStatus = (key: string) => {
    if (process.client) {
      try {
        const saved = localStorage.getItem(key)
        if (!saved) return null

        const parsed = JSON.parse(saved)
        const timeLeft = parsed.expirationTime - Date.now()
        
        if (timeLeft <= 0) return { expired: true, timeLeft: 0 }
        
        const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000))
        const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000))
        
        return {
          expired: false,
          timeLeft,
          hoursLeft,
          minutesLeft,
          expirationTime: parsed.expirationTime
        }
      } catch (error) {
        return null
      }
    }
    return null
  }

  return {
    saveWithExpiration,
    loadWithExpiration,
    checkExpirationWarning,
    cleanupExpiredData,
    scheduleCleanup,
    getExpirationStatus
  }
}

















