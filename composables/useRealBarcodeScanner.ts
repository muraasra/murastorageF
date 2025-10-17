// Composable pour la détection réelle de code-barres avec QuaggaJS
export const useRealBarcodeScanner = () => {
  const isScanning = ref(false)
  const scannedCode = ref('')
  const scanError = ref('')
  const videoRef = ref<HTMLVideoElement | null>(null)
  const scannerContainer = ref<HTMLDivElement | null>(null)

  // Fonction pour démarrer le scanner QuaggaJS optimisé
  const startQuaggaScanner = async () => {
    try {
      scanError.value = ''
      
      // Importer QuaggaJS dynamiquement
      const Quagga = await import('quagga')
      
      if (!scannerContainer.value) {
        scanError.value = 'Conteneur scanner non trouvé'
        return false
      }

      // Configuration QuaggaJS optimisée pour la performance
      const config = {
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: scannerContainer.value,
          constraints: {
            width: 320,  // Résolution réduite pour la performance
            height: 240,
            facingMode: "environment"
          },
          singleChannel: false // Améliore la détection
        },
        locator: {
          patchSize: "small", // Patch plus petit = plus rapide
          halfSample: false   // Pas de demi-échantillon = plus rapide
        },
        numOfWorkers: 1,     // Réduit à 1 worker pour la performance
        frequency: 20,       // Augmenté à 20Hz pour plus de réactivité
        decoder: {
          readers: [
            "code_128_reader",    // Le plus commun
            "ean_reader",         // Codes produits
            "ean_8_reader",      // Codes courts
            "code_39_reader"     // Standard industriel
          ],
          debug: {
            showCanvas: false,
            showPatches: false,
            showFoundPatches: false,
            showSkeleton: false,
            showLabels: false,
            showPatchLabels: false,
            showBoundingBox: false,
            showBoundingBoxes: false,
            showScanline: false,
            showScanlines: false
          }
        },
        locate: true,
        src: null
      }

      console.log('🚀 Démarrage QuaggaJS avec configuration optimisée...')

      // Initialiser QuaggaJS
      Quagga.init(config, (err) => {
        if (err) {
          console.error('❌ Erreur initialisation Quagga:', err)
          scanError.value = 'Erreur initialisation scanner: ' + err.message
          return
        }
        
        console.log('✅ QuaggaJS initialisé avec succès')
        Quagga.start()
        isScanning.value = true
        
        // Ajouter un délai pour la stabilisation
        setTimeout(() => {
          console.log('📷 Scanner prêt à détecter')
        }, 1000)
      })

      // Écouter les résultats de détection
      Quagga.onDetected((result) => {
        const code = result.codeResult.code
        console.log('🎯 Code-barres détecté:', code)
        
        // Vérifier que le code n'est pas vide
        if (!code || code.length < 3) {
          console.log('⚠️ Code trop court, ignoré')
          return
        }
        
        // Jouer le bip sonore
        playBeepSound()
        
        // Traiter le code détecté
        processDetectedCode(code)
        
        // Arrêter temporairement le scan pour éviter les doublons
        Quagga.stop()
        setTimeout(() => {
          if (isScanning.value) {
            Quagga.start()
          }
        }, 1500) // Réduit à 1.5 secondes
      })

      // Écouter les erreurs
      Quagga.onProcessed((result) => {
        if (result && result.boxes) {
          // Log pour debug (peut être supprimé en production)
          // console.log('Processed:', result.boxes.length, 'boxes')
        }
      })

      return true
    } catch (error) {
      console.error('❌ Erreur démarrage scanner:', error)
      scanError.value = 'Impossible de démarrer le scanner: ' + error.message
      return false
    }
  }

  // Fonction pour arrêter le scanner
  const stopQuaggaScanner = async () => {
    try {
      const Quagga = await import('quagga')
      Quagga.stop()
      isScanning.value = false
      scannedCode.value = ''
      console.log('Scanner QuaggaJS arrêté')
    } catch (error) {
      console.error('Erreur arrêt scanner:', error)
    }
  }

  // Fonction pour jouer un bip sonore
  const playBeepSound = () => {
    if (process.client) {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
        oscillator.type = 'sine'
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
        
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.2)
        
        console.log('🔊 Bip sonore joué')
      } catch (error) {
        console.error('Erreur bip sonore:', error)
      }
    }
  }

  // Fonction pour traiter un code détecté
  const processDetectedCode = (code: string) => {
    scannedCode.value = code
    
    // Émettre un événement personnalisé
    if (process.client) {
      window.dispatchEvent(new CustomEvent('barcode-scanned', { 
        detail: { code } 
      }))
    }
    
    console.log('Code traité:', code)
    return code
  }

  // Fonction pour tester manuellement
  const testScan = () => {
    const testCode = prompt('Entrez un code-barres pour tester:')
    if (testCode) {
      playBeepSound()
      processDetectedCode(testCode)
    }
  }

  // Nettoyer les ressources
  const cleanup = async () => {
    if (isScanning.value) {
      await stopQuaggaScanner()
    }
  }

  return {
    isScanning,
    scannedCode,
    scanError,
    scannerContainer,
    videoRef,
    startQuaggaScanner,
    stopQuaggaScanner,
    testScan,
    processDetectedCode,
    cleanup
  }
}
