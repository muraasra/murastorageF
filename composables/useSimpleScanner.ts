// Composable pour scanner simple et rapide
export const useSimpleScanner = () => {
  const isScanning = ref(false)
  const scannedCode = ref('')
  const scanError = ref('')
  const videoRef = ref<HTMLVideoElement | null>(null)
  const canvas = ref<HTMLCanvasElement | null>(null)
  const context = ref<CanvasRenderingContext2D | null>(null)
  const stream = ref<MediaStream | null>(null)
  const scanInterval = ref<NodeJS.Timeout | null>(null)

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

  // Fonction pour démarrer le scanner simple
  const startSimpleScanner = async () => {
    try {
      scanError.value = ''
      
      console.log('🚀 Démarrage scanner simple...')
      
      // Demander l'accès à la caméra
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      })

      stream.value = mediaStream
      isScanning.value = true

      // Attendre que la vidéo soit prête
      await nextTick()
      
      if (videoRef.value) {
        videoRef.value.srcObject = mediaStream
        videoRef.value.play()
        
        // Créer le canvas pour la détection
        canvas.value = document.createElement('canvas')
        context.value = canvas.value.getContext('2d')
        
        // Démarrer la détection simple
        startSimpleDetection()
      }

      console.log('✅ Scanner simple démarré')
      return true
    } catch (error) {
      console.error('❌ Erreur démarrage scanner:', error)
      scanError.value = 'Impossible d\'accéder à la caméra: ' + error.message
      isScanning.value = false
      return false
    }
  }

  // Fonction de détection simple (simulation améliorée)
  const startSimpleDetection = () => {
    if (!isScanning.value) return

    const detect = () => {
      if (!isScanning.value || !videoRef.value || !canvas.value || !context.value) return

      try {
        // Capturer l'image de la vidéo
        canvas.value.width = videoRef.value.videoWidth
        canvas.value.height = videoRef.value.videoHeight
        context.value.drawImage(videoRef.value, 0, 0)

        // Simulation de détection améliorée
        // Dans une vraie implémentation, vous analyseriez l'image ici
        simulateAdvancedDetection()
        
        // Continuer la détection
        scanInterval.value = setTimeout(detect, 100) // 10 FPS pour la performance
      } catch (error) {
        console.error('Erreur détection:', error)
      }
    }

    detect()
  }

  // Simulation de détection améliorée
  const simulateAdvancedDetection = () => {
    // Cette fonction simule une détection plus intelligente
    // Dans une vraie implémentation, vous utiliseriez une bibliothèque de détection
    
    // Pour les tests, on peut déclencher avec des touches
    if (process.client) {
      // Écouter les touches pour simulation
      const handleKeyPress = (event: KeyboardEvent) => {
        if (event.key === 'Enter' && isScanning.value) {
          const testCode = prompt('Entrez un code-barres pour tester:')
          if (testCode && testCode.length >= 3) {
            processDetectedCode(testCode)
          }
        }
      }
      
      // Ajouter l'écouteur une seule fois
      if (!window.simpleScannerListenerAdded) {
        window.addEventListener('keydown', handleKeyPress)
        window.simpleScannerListenerAdded = true
      }
    }
  }

  // Fonction pour traiter un code détecté
  const processDetectedCode = (code: string) => {
    if (!code || code.length < 3) return
    
    scannedCode.value = code
    console.log('🎯 Code détecté:', code)
    
    // Jouer le bip sonore
    playBeepSound()
    
    // Émettre un événement personnalisé
    if (process.client) {
      window.dispatchEvent(new CustomEvent('barcode-scanned', { 
        detail: { code } 
      }))
    }
    
    // Arrêter temporairement le scan
    stopSimpleScanner()
    setTimeout(() => {
      if (isScanning.value) {
        startSimpleScanner()
      }
    }, 2000)
    
    return code
  }

  // Fonction pour arrêter le scanner
  const stopSimpleScanner = () => {
    if (stream.value) {
      stream.value.getTracks().forEach(track => track.stop())
      stream.value = null
    }
    
    if (scanInterval.value) {
      clearTimeout(scanInterval.value)
      scanInterval.value = null
    }
    
    if (videoRef.value) {
      videoRef.value.srcObject = null
    }
    
    isScanning.value = false
    scannedCode.value = ''
    
    // Nettoyer l'écouteur
    if (process.client && window.simpleScannerListenerAdded) {
      window.removeEventListener('keydown', () => {})
      window.simpleScannerListenerAdded = false
    }
    
    console.log('🛑 Scanner simple arrêté')
  }

  // Fonction pour tester manuellement
  const testScan = () => {
    const testCode = prompt('Entrez un code-barres pour tester:')
    if (testCode && testCode.length >= 3) {
      playBeepSound()
      processDetectedCode(testCode)
    }
  }

  // Nettoyer les ressources
  const cleanup = () => {
    stopSimpleScanner()
  }

  return {
    isScanning,
    scannedCode,
    scanError,
    videoRef,
    startSimpleScanner,
    stopSimpleScanner,
    testScan,
    processDetectedCode,
    cleanup
  }
}

















