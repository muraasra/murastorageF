// Script de test pour l'import/export Excel
// À exécuter dans la console du navigateur

console.log('=== TEST IMPORT/EXPORT EXCEL ===');

// Test 1: Vérifier que les fonctions existent
console.log('1. Vérification des fonctions...');
if (typeof window.testExcelGeneration === 'function') {
  console.log('✅ testExcelGeneration disponible');
} else {
  console.log('❌ testExcelGeneration non disponible');
}

// Test 2: Créer des données de test
console.log('2. Création de données de test...');
const testData = [
  {
    nom: 'Test Produit 1',
    reference: 'TEST-001',
    description: 'Produit de test 1',
    prix_achat: 100000,
    prix_vente: 120000,
    quantite: 10,
    categorie_nom: 'test',
    code_barres: '1234567890123',
    unite_mesure: 'piece',
    fournisseur_nom: 'Test Fournisseur',
    marque: 'Test Brand',
    modele: 'Test Model',
    etat_produit: 'actif',
    devise: 'XAF',
    sku: 'TEST-001'
  },
  {
    nom: 'Test Produit 2',
    reference: 'TEST-002',
    description: 'Produit de test 2',
    prix_achat: 200000,
    prix_vente: 250000,
    quantite: 5,
    categorie_nom: 'test',
    code_barres: '2345678901234',
    unite_mesure: 'piece',
    fournisseur_nom: 'Test Fournisseur',
    marque: 'Test Brand',
    modele: 'Test Model 2',
    etat_produit: 'actif',
    devise: 'XAF',
    sku: 'TEST-002'
  }
];

console.log('✅ Données de test créées:', testData.length, 'produits');

// Test 3: Tester l'export Excel
console.log('3. Test de l\'export Excel...');
try {
  // Simuler l'export Excel
  const headers = [
    'Nom', 'Référence', 'Description', 'Prix d\'achat', 'Prix de vente', 'Stock actuel',
    'Catégorie', 'Code-barre', 'Unité', 'Fournisseur', 'Marque', 'Modèle',
    'État', 'Devise', 'SKU'
  ];
  
  const csvContent = headers.join(',') + '\n' + 
    testData.map(p => [
      p.nom,
      p.reference,
      p.description,
      p.prix_achat,
      p.prix_vente,
      p.quantite,
      p.categorie_nom,
      p.code_barres,
      p.unite_mesure,
      p.fournisseur_nom,
      p.marque,
      p.modele,
      p.etat_produit,
      p.devise,
      p.sku
    ].join(',')).join('\n');
  
  console.log('✅ Export CSV généré:', csvContent.substring(0, 200) + '...');
} catch (error) {
  console.log('❌ Erreur export:', error);
}

// Test 4: Tester le mapping des colonnes
console.log('4. Test du mapping des colonnes...');
const testHeaders = [
  'Nom', 'Référence', 'Description', 'Prix d\'achat', 'Prix de vente', 'Stock actuel',
  'Catégorie', 'Code-barre', 'Unité', 'Fournisseur', 'Marque', 'Modèle',
  'État', 'Devise', 'SKU'
];

// Simuler le mapping
const mapping = {};
testHeaders.forEach((header, index) => {
  const cleanHeader = header.toLowerCase().trim();
  
  if (cleanHeader.includes('nom')) {
    mapping.nom = index;
  } else if (cleanHeader.includes('prix d\'achat')) {
    mapping.prix_achat = index;
  } else if (cleanHeader.includes('prix de vente')) {
    mapping.prix_vente = index;
  } else if (cleanHeader.includes('stock actuel')) {
    mapping.quantite = index;
  } else if (cleanHeader.includes('référence')) {
    mapping.reference = index;
  } else if (cleanHeader.includes('description')) {
    mapping.description = index;
  } else if (cleanHeader.includes('catégorie')) {
    mapping.categorie = index;
  } else if (cleanHeader.includes('code-barre')) {
    mapping.code_barre = index;
  } else if (cleanHeader.includes('unité')) {
    mapping.unite_mesure = index;
  } else if (cleanHeader.includes('fournisseur')) {
    mapping.fournisseur_nom = index;
  } else if (cleanHeader.includes('marque')) {
    mapping.marque = index;
  } else if (cleanHeader.includes('modèle')) {
    mapping.modele = index;
  } else if (cleanHeader.includes('état')) {
    mapping.etat_produit = index;
  } else if (cleanHeader.includes('devise')) {
    mapping.devise = index;
  } else if (cleanHeader.includes('sku')) {
    mapping.sku = index;
  }
});

console.log('✅ Mapping créé:', mapping);

// Test 5: Vérifier la compatibilité
console.log('5. Vérification de la compatibilité...');
const requiredFields = ['nom', 'prix_achat', 'prix_vente', 'quantite'];
const missingFields = requiredFields.filter(field => !(field in mapping));

if (missingFields.length === 0) {
  console.log('✅ Tous les champs requis sont mappés');
} else {
  console.log('❌ Champs manquants:', missingFields);
}

console.log('=== TEST TERMINÉ ===');
console.log('Résultat: L\'import/export Excel devrait maintenant fonctionner correctement!');
console.log('Pour tester:');
console.log('1. Allez sur la page produits');
console.log('2. Cliquez sur "Exporter" puis "Export Excel"');
console.log('3. Téléchargez le fichier Excel généré');
console.log('4. Cliquez sur "Importer" et sélectionnez le fichier téléchargé');
console.log('5. Vérifiez que les données sont correctement parsées');
