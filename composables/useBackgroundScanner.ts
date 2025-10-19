// Composable pour le scanner automatique en arrière-plan
export const useBackgroundScanner = () => {
  const isScanning = ref(false)
  const scannedCode = ref('')
  const scanError = ref('')
  const isActive = ref(false)

  // Fonction pour démarrer le scan en arrière-plan
  const startBackgroundScan = () => {
    isActive.value = true
    isScanning.value = true
    scanError.value = ''
    
    // Simuler la détection de code-barres
    // Dans une vraie implémentation, ceci utiliserait une API de caméra
    console.log('Scanner en arrière-plan démarré')
  }

  // Fonction pour arrêter le scan
  const stopBackgroundScan = () => {
    isActive.value = false
    isScanning.value = false
    console.log('Scanner en arrière-plan arrêté')
  }

  // Fonction pour traiter un code scanné
  const processScannedCode = (code: string) => {
    if (!isActive.value) return null
    
    scannedCode.value = code
    console.log('Code détecté:', code)
    
    // Émettre un événement personnalisé pour notifier le composant parent
    if (process.client) {
      window.dispatchEvent(new CustomEvent('barcode-scanned', { 
        detail: { code } 
      }))
    }
    
    return code
  }

  // Fonction pour simuler un scan (pour les tests)
  const simulateScan = (code: string) => {
    if (isActive.value) {
      return processScannedCode(code)
    }
    return null
  }

  // Écouter les événements de scan (pour une vraie implémentation)
  const setupScanListener = () => {
    if (process.client) {
      // Écouter les événements de scan réel
      window.addEventListener('barcode-detected', (event: any) => {
        if (isActive.value) {
          processScannedCode(event.detail.code)
        }
      })
    }
  }

  // Nettoyer les événements
  const cleanup = () => {
    if (process.client) {
      window.removeEventListener('barcode-detected', () => {})
    }
  }

  return {
    isScanning,
    scannedCode,
    scanError,
    isActive,
    startBackgroundScan,
    stopBackgroundScan,
    processScannedCode,
    simulateScan,
    setupScanListener,
    cleanup
  }
}




















