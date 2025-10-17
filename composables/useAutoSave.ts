// Composable pour la sauvegarde automatique des données
export const useAutoSave = () => {
  const saveToLocalStorage = (key: string, data: any) => {
    if (process.client) {
      try {
        localStorage.setItem(key, JSON.stringify(data))
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error)
      }
    }
  }

  const loadFromLocalStorage = (key: string, defaultValue: any = null) => {
    if (process.client) {
      try {
        const saved = localStorage.getItem(key)
        return saved ? JSON.parse(saved) : defaultValue
      } catch (error) {
        console.error('Erreur lors du chargement:', error)
        return defaultValue
      }
    }
    return defaultValue
  }

  const clearFromLocalStorage = (key: string) => {
    if (process.client) {
      localStorage.removeItem(key)
    }
  }

  // Sauvegarde automatique avec debounce
  const autoSave = (key: string, data: any, delay: number = 1000) => {
    let timeoutId: NodeJS.Timeout
    
    return () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        saveToLocalStorage(key, data)
      }, delay)
    }
  }

  return {
    saveToLocalStorage,
    loadFromLocalStorage,
    clearFromLocalStorage,
    autoSave
  }
}














