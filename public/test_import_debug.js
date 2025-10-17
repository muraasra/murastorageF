// Test d'import pour identifier le problème "source inconnu"
const testImport = async () => {
  console.log('=== TEST IMPORT ===')
  
  // Données de test simples
  const testData = [{
    nom: 'Produit Test',
    reference: 'TEST001',
    description: 'Description test',
    prix_achat: '1000',
    prix_vente: '1500',
    quantite: '10',
    categorie: 'test',
    code_barres: '123456789',
    unite_mesure: 'piece',
    stock_minimum: 0,
    stock_maximum: 100,
    fournisseur_principal: 'Test Fournisseur',
    marque: 'Test Brand',
    modele: 'Test Model',
    etat_produit: 'neuf',
    devise: 'XAF',
    sku: 'SKU001',
    actif: true
  }]
  
  try {
    console.log('Tentative d\'import via API...')
    
    const response = await fetch('/api/produits/import_produits/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        produits: testData
      })
    })
    
    console.log('Status:', response.status)
    console.log('Headers:', response.headers)
    
    const result = await response.text()
    console.log('Response:', result)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${result}`)
    }
    
    console.log('Import réussi!')
    
  } catch (error) {
    console.error('Erreur détaillée:', error)
    console.error('Message:', error.message)
    console.error('Stack:', error.stack)
  }
}

// Exécuter le test
testImport()
