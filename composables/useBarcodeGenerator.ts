import QRCode from 'qrcode'
import JsBarcode from 'jsbarcode'
import JSZip from 'jszip'

export const useBarcodeGenerator = () => {
  // Générer un QR Code
  const generateQRCode = async (data: string, options?: QRCode.QRCodeToDataURLOptions): Promise<string> => {
    try {
      const defaultOptions: QRCode.QRCodeToDataURLOptions = {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 200,
        ...options
      }
      
      return await QRCode.toDataURL(data, defaultOptions)
    } catch (error) {
      console.error('Erreur lors de la génération du QR Code:', error)
      throw new Error('Impossible de générer le QR Code')
    }
  }

  // Générer un code-barres
  const generateBarcode = (data: string, options?: any): string => {
    try {
      const canvas = document.createElement('canvas')
      
      const defaultOptions = {
        format: 'CODE128',
        width: 2,
        height: 100,
        displayValue: true,
        fontSize: 14,
        margin: 10,
        background: '#ffffff',
        lineColor: '#000000',
        ...options
      }
      
      JsBarcode(canvas, data, defaultOptions)
      
      return canvas.toDataURL('image/png')
    } catch (error) {
      console.error('Erreur lors de la génération du code-barres:', error)
      throw new Error('Impossible de générer le code-barres')
    }
  }

  // Convertir dataURL en données binaires
  const dataURLToBlob = (dataURL: string): Blob => {
    const arr = dataURL.split(',')
    const mime = arr[0].match(/:(.*?);/)![1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new Blob([u8arr], { type: mime })
  }

  // Télécharger un fichier ZIP
  const downloadZip = (zipBlob: Blob, filename: string) => {
    try {
      const url = URL.createObjectURL(zipBlob)
      const link = document.createElement('a')
      link.download = filename
      link.href = url
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erreur lors du téléchargement du ZIP:', error)
      throw new Error('Impossible de télécharger le fichier ZIP')
    }
  }

  // Télécharger une image
  const downloadImage = (dataUrl: string, filename: string) => {
    try {
      const link = document.createElement('a')
      link.download = filename
      link.href = dataUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error)
      throw new Error('Impossible de télécharger le fichier')
    }
  }

  // Générer et télécharger un QR Code
  const generateAndDownloadQRCode = async (data: string, filename: string, options?: QRCode.QRCodeToDataURLOptions) => {
    try {
      const qrCodeDataUrl = await generateQRCode(data, options)
      downloadImage(qrCodeDataUrl, filename)
      return qrCodeDataUrl
    } catch (error) {
      console.error('Erreur lors de la génération et téléchargement du QR Code:', error)
      throw error
    }
  }

  // Générer et télécharger un code-barres
  const generateAndDownloadBarcode = (data: string, filename: string, options?: any) => {
    try {
      const barcodeDataUrl = generateBarcode(data, options)
      downloadImage(barcodeDataUrl, filename)
      return barcodeDataUrl
    } catch (error) {
      console.error('Erreur lors de la génération et téléchargement du code-barres:', error)
      throw error
    }
  }

  // Générer les deux codes pour un produit
  const generateProductCodes = async (produit: any, entrepriseId?: number) => {
    try {
      // Créer un identifiant unique incluant l'ID de l'entreprise
      const uniqueId = entrepriseId ? `${entrepriseId}-${produit.id}` : produit.id.toString()
      
      const productData = {
        id: produit.id,
        entreprise_id: entrepriseId,
        nom: produit.nom,
        reference: produit.reference || produit.sku,
        prix: produit.prix_vente || produit.prix,
        code_barres: produit.code_barres,
        description: produit.description,
        unique_id: uniqueId
      }

      const qrData = JSON.stringify(productData)
      // Pour le code-barres, utiliser l'ID unique avec l'entreprise
      const barcodeData = entrepriseId ? `${entrepriseId}${produit.code_barres || produit.reference || produit.sku || produit.id}` : (produit.code_barres || produit.reference || produit.sku || produit.id.toString())

      const timestamp = new Date().toISOString().slice(0, 10)
      const baseFilename = `${produit.nom.replace(/[^a-zA-Z0-9]/g, '_')}_${uniqueId}_${timestamp}`

      const qrCodeDataUrl = await generateQRCode(qrData, {
        width: 300,
        margin: 2
      })

      const barcodeDataUrl = generateBarcode(barcodeData, {
        width: 3,
        height: 120,
        fontSize: 16
      })

      return {
        qrCode: qrCodeDataUrl,
        barcode: barcodeDataUrl,
        qrFilename: `${baseFilename}_QR.png`,
        barcodeFilename: `${baseFilename}_Barcode.png`,
        uniqueId,
        barcodeData
      }
    } catch (error) {
      console.error('Erreur lors de la génération des codes produit:', error)
      throw error
    }
  }

  // Générer et télécharger les codes pour un produit
  const generateAndDownloadProductCodes = async (produit: any, entrepriseId?: number) => {
    try {
      const codes = await generateProductCodes(produit, entrepriseId)
      
      // Télécharger le QR Code
      downloadImage(codes.qrCode, codes.qrFilename)
      
      // Attendre un peu avant de télécharger le code-barres
      setTimeout(() => {
        downloadImage(codes.barcode, codes.barcodeFilename)
      }, 500)
      
      return codes
    } catch (error) {
      console.error('Erreur lors de la génération et téléchargement des codes produit:', error)
      throw error
    }
  }

  // Générer des codes en masse et créer un ZIP
  const generateBulkCodes = async (produits: any[], entrepriseId?: number) => {
    try {
      const zip = new JSZip()
      const results = []
      
      // Créer un dossier pour organiser les fichiers
      const qrFolder = zip.folder('QR_Codes')
      const barcodeFolder = zip.folder('Codes_Barres')
      
      for (let i = 0; i < produits.length; i++) {
        const produit = produits[i]
        
        try {
          const codes = await generateProductCodes(produit, entrepriseId)
          
          // Convertir les dataURL en blobs
          const qrBlob = dataURLToBlob(codes.qrCode)
          const barcodeBlob = dataURLToBlob(codes.barcode)
          
          // Ajouter les fichiers au ZIP
          qrFolder?.file(codes.qrFilename, qrBlob)
          barcodeFolder?.file(codes.barcodeFilename, barcodeBlob)
          
          results.push({
            produit,
            codes,
            success: true
          })
          
        } catch (error) {
          results.push({
            produit,
            codes: null,
            success: false,
            error: error.message
          })
        }
      }
      
      // Générer le ZIP
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      
      // Créer le nom du fichier ZIP
      const timestamp = new Date().toISOString().slice(0, 10)
      const zipFilename = `Codes_Produits_${timestamp}.zip`
      
      // Télécharger le ZIP
      downloadZip(zipBlob, zipFilename)
      
      return {
        results,
        zipFilename,
        successCount: results.filter(r => r.success).length,
        errorCount: results.filter(r => !r.success).length
      }
      
    } catch (error) {
      console.error('Erreur lors de la génération en masse:', error)
      throw error
    }
  }

  return {
    generateQRCode,
    generateBarcode,
    downloadImage,
    generateAndDownloadQRCode,
    generateAndDownloadBarcode,
    generateProductCodes,
    generateAndDownloadProductCodes,
    generateBulkCodes
  }
}
