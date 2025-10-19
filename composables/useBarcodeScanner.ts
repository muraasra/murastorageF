// Composable pour la recherche par code-barres
export const useBarcodeScanner = () => {
  const isScanning = ref(false)
  const scannedCode = ref('')
  const scanError = ref('')

  // Fonction pour démarrer le scan
  const startScan = () => {
    isScanning.value = true
    scanError.value = ''
    scannedCode.value = ''
  }

  // Fonction pour arrêter le scan
  const stopScan = () => {
    isScanning.value = false
  }

  // Fonction pour traiter le code scanné
  const processScannedCode = (code: string) => {
    scannedCode.value = code
    isScanning.value = false
    return code
  }

  // Fonction pour simuler un scan (pour les tests)
  const simulateScan = (code: string) => {
    return processScannedCode(code)
  }

  return {
    isScanning,
    scannedCode,
    scanError,
    startScan,
    stopScan,
    processScannedCode,
    simulateScan
  }
}




















