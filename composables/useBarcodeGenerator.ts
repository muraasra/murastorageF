// Tous les imports lourds sont dynamiques — rien n'est chargé au démarrage de la page

export const useBarcodeGenerator = () => {
  const generateQRCode = async (data: string, options?: any): Promise<string> => {
    const QRCode = (await import('qrcode')).default
    const defaultOptions = {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: { dark: '#000000', light: '#FFFFFF' },
      width: 200,
      ...options
    }
    return await QRCode.toDataURL(data, defaultOptions)
  }

  const generateBarcode = async (data: string, options?: any): Promise<string> => {
    const JsBarcode = (await import('jsbarcode')).default
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
  }

  const dataURLToBlob = (dataURL: string): Blob => {
    const arr = dataURL.split(',')
    const mime = arr[0].match(/:(.*?);/)![1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) u8arr[n] = bstr.charCodeAt(n)
    return new Blob([u8arr], { type: mime })
  }

  const downloadZip = (zipBlob: Blob, filename: string) => {
    const url = URL.createObjectURL(zipBlob)
    const link = document.createElement('a')
    link.download = filename
    link.href = url
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const downloadImage = (dataUrl: string, filename: string) => {
    const link = document.createElement('a')
    link.download = filename
    link.href = dataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const generateQRCodeAndDownload = async (data: string, filename: string, options?: any) => {
    const url = await generateQRCode(data, options)
    downloadImage(url, filename)
    return url
  }

  const generateBarcodeAndDownload = async (data: string, filename: string, options?: any) => {
    const url = await generateBarcode(data, options)
    downloadImage(url, filename)
    return url
  }

  const generateProductCodes = async (produit: any, entrepriseId?: number) => {
    const uniqueId = entrepriseId ? `${entrepriseId}-${produit.id}` : produit.id.toString()
    const productData = {
      id: produit.id, entreprise_id: entrepriseId,
      nom: produit.nom, reference: produit.reference || produit.sku,
      prix: produit.prix_vente || produit.prix,
      code_barres: produit.code_barres, unique_id: uniqueId
    }
    const barcodeData = entrepriseId
      ? `${entrepriseId}${produit.code_barres || produit.reference || produit.sku || produit.id}`
      : (produit.code_barres || produit.reference || produit.sku || produit.id.toString())
    const timestamp = new Date().toISOString().slice(0, 10)
    const baseFilename = `${produit.nom.replace(/[^a-zA-Z0-9]/g, '_')}_${uniqueId}_${timestamp}`

    const [qrCode, barcode] = await Promise.all([
      generateQRCode(JSON.stringify(productData), { width: 300, margin: 2 }),
      generateBarcode(barcodeData, { width: 3, height: 120, fontSize: 16 })
    ])
    return {
      qrCode, barcode,
      qrFilename: `${baseFilename}_QR.png`,
      barcodeFilename: `${baseFilename}_Barcode.png`,
      uniqueId, barcodeData
    }
  }

  const generateAndDownloadProductCodes = async (produit: any, entrepriseId?: number) => {
    const codes = await generateProductCodes(produit, entrepriseId)
    downloadImage(codes.qrCode, codes.qrFilename)
    setTimeout(() => downloadImage(codes.barcode, codes.barcodeFilename), 500)
    return codes
  }

  const generateBulkCodes = async (produits: any[], entrepriseId?: number) => {
    const JSZip = (await import('jszip')).default
    const zip = new JSZip()
    const qrFolder = zip.folder('QR_Codes')
    const barcodeFolder = zip.folder('Codes_Barres')
    const results = []

    for (const produit of produits) {
      try {
        const codes = await generateProductCodes(produit, entrepriseId)
        qrFolder?.file(codes.qrFilename, dataURLToBlob(codes.qrCode))
        barcodeFolder?.file(codes.barcodeFilename, dataURLToBlob(codes.barcode))
        results.push({ produit, codes, success: true })
      } catch (error: any) {
        results.push({ produit, codes: null, success: false, error: error.message })
      }
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' })
    const zipFilename = `Codes_Produits_${new Date().toISOString().slice(0, 10)}.zip`
    downloadZip(zipBlob, zipFilename)

    return {
      results, zipFilename,
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length
    }
  }

  return {
    generateQRCode,
    generateBarcode,
    downloadImage,
    generateAndDownloadQRCode: generateQRCodeAndDownload,
    generateAndDownloadBarcode: generateBarcodeAndDownload,
    generateProductCodes,
    generateAndDownloadProductCodes,
    generateBulkCodes
  }
}
