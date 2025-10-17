// Composable pour le scanner de caméra réel
export const useCameraScanner = () => {
  const isScanning = ref(false)
  const scannedCode = ref('')
  const scanError = ref('')
  const videoRef = ref<HTMLVideoElement | null>(null)
  const stream = ref<MediaStream | null>(null)
  const canvas = ref<HTMLCanvasElement | null>(null)
  const context = ref<CanvasRenderingContext2D | null>(null)

  // Fonction pour démarrer la caméra (masquée)
  const startCamera = async () => {
    try {
      scanError.value = ''
      
      // Demander l'accès à la caméra
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Caméra arrière si disponible
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })

      stream.value = mediaStream
      isScanning.value = true

      // Attendre que la vidéo soit prête
      await nextTick()
      
      if (videoRef.value) {
        videoRef.value.srcObject = mediaStream
        videoRef.value.play()
        
        // Masquer la vidéo (elle fonctionne en arrière-plan)
        videoRef.value.style.display = 'none'
        
        // Créer le canvas pour la détection
        canvas.value = document.createElement('canvas')
        context.value = canvas.value.getContext('2d')
        
        // Démarrer la détection
        startDetection()
      }

      console.log('📷 Caméra démarrée en arrière-plan')
      return true
    } catch (error) {
      console.error('Erreur caméra:', error)
      scanError.value = 'Impossible d\'accéder à la caméra'
      isScanning.value = false
      return false
    }
  }

  // Fonction pour arrêter la caméra
  const stopCamera = () => {
    if (stream.value) {
      stream.value.getTracks().forEach(track => track.stop())
      stream.value = null
    }
    
    if (videoRef.value) {
      videoRef.value.srcObject = null
    }
    
    isScanning.value = false
    scannedCode.value = ''
  }

  // Fonction de détection de code-barres (simplifiée)
  const startDetection = () => {
    if (!videoRef.value || !canvas.value || !context.value) return

    const detect = () => {
      if (!isScanning.value) return

      try {
        // Capturer l'image de la vidéo
        canvas.value!.width = videoRef.value!.videoWidth
        canvas.value!.height = videoRef.value!.videoHeight
        context.value!.drawImage(videoRef.value!, 0, 0)

        // Ici, vous pourriez intégrer une vraie bibliothèque de détection de codes-barres
        // Pour l'instant, on simule la détection
        simulateDetection()
        
        // Continuer la détection
        requestAnimationFrame(detect)
      } catch (error) {
        console.error('Erreur détection:', error)
      }
    }

    detect()
  }

  // Simulation de détection (à remplacer par une vraie bibliothèque)
  const simulateDetection = () => {
    // Cette fonction simule la détection d'un code-barres
    // Dans une vraie implémentation, vous utiliseriez une bibliothèque comme:
    // - QuaggaJS
    // - ZXing
    // - jsQR (pour QR codes)
    
    // Pour les tests, on peut déclencher manuellement
    if (process.client) {
      window.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && isScanning.value) {
          const testCode = prompt('Entrez un code-barres pour tester:')
          if (testCode) {
            processScannedCode(testCode)
          }
        }
      })
    }
  }

  // Fonction pour jouer un bip sonore
  const playBeepSound = () => {
    if (process.client) {
      try {
        // Créer un contexte audio
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        // Configuration du bip
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime) // Fréquence 800Hz
        oscillator.type = 'sine'
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
        
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.2)
        
        console.log('🔊 Bip sonore joué')
      } catch (error) {
        console.error('Erreur bip sonore:', error)
        // Fallback : utiliser l'API Web Audio simple
        try {
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBS13yO/eizEIHWq+8+OWT')
          audio.volume = 0.3
          audio.play().catch(() => {})
        } catch (fallbackError) {
          console.error('Erreur fallback audio:', fallbackError)
        }
      }
    }
  }

  // Fonction pour traiter un code scanné
  const processScannedCode = (code: string) => {
    scannedCode.value = code
    
    // Jouer le bip sonore
    playBeepSound()
    
    // Émettre un événement personnalisé
    if (process.client) {
      window.dispatchEvent(new CustomEvent('barcode-scanned', { 
        detail: { code } 
      }))
    }
    
    // Arrêter temporairement le scan après détection
    setTimeout(() => {
      scannedCode.value = ''
    }, 2000)
    
    return code
  }

  // Fonction pour scanner un fichier image
  const scanImageFile = async (file: File) => {
    try {
      const imageUrl = URL.createObjectURL(file)
      const img = new Image()
      
      img.onload = () => {
        if (canvas.value && context.value) {
          canvas.value.width = img.width
          canvas.value.height = img.height
          context.value.drawImage(img, 0, 0)
          
          // Ici, analyser l'image pour détecter les codes-barres
          // Pour l'instant, on demande à l'utilisateur
          const code = prompt('Code-barres détecté dans l\'image (simulation):')
          if (code) {
            processScannedCode(code)
          }
        }
        URL.revokeObjectURL(imageUrl)
      }
      
      img.src = imageUrl
    } catch (error) {
      console.error('Erreur scan image:', error)
      scanError.value = 'Erreur lors du scan de l\'image'
    }
  }

  // Nettoyer les ressources
  const cleanup = () => {
    stopCamera()
    if (process.client) {
      window.removeEventListener('keydown', () => {})
    }
  }

  return {
    isScanning,
    scannedCode,
    scanError,
    videoRef,
    startCamera,
    stopCamera,
    scanImageFile,
    processScannedCode,
    cleanup
  }
}
