// Script de test pour les en-têtes Excel avec espaces et apostrophes
// À exécuter dans la console du navigateur

console.log('=== TEST EN-TÊTES EXCEL AVEC ESPACES ET APOSTROPHES ===');

// Test 1: En-têtes d'export Excel
console.log('1. Test des en-têtes d\'export Excel...');
const exportHeaders = [
  'Nom', 'Référence', 'Description', 'Prix d\'achat', 'Prix de vente', 'Stock actuel',
  'Catégorie', 'Code-barre', 'Unité', 'Fournisseur', 'Marque', 'Modèle',
  'État', 'Devise', 'SKU'
];

console.log('En-têtes d\'export:', exportHeaders);

// Test 2: Simulation du nettoyage des en-têtes
console.log('2. Test du nettoyage des en-têtes...');
const cleanedHeaders = exportHeaders.map(h => h.trim().toLowerCase().replace(/"/g, '').replace(/'/g, ''));
console.log('En-têtes nettoyés:', cleanedHeaders);

// Test 3: Simulation du mapping des colonnes
console.log('3. Test du mapping des colonnes...');
const mapping = {};

cleanedHeaders.forEach((header, index) => {
  const cleanHeader = header.toLowerCase().trim();
  
  if (cleanHeader.includes('nom') || cleanHeader.includes('name') || cleanHeader.includes('produit') || cleanHeader.includes('libelle')) {
    mapping.nom = index;
  } else if (cleanHeader.includes('prix d\'achat') || cleanHeader.includes('prix_achat') || cleanHeader.includes('prix d achat') || cleanHeader.includes('achat') || cleanHeader.includes('cost')) {
    mapping.prix_achat = index;
  } else if (cleanHeader.includes('prix de vente') || cleanHeader.includes('prix_vente') || cleanHeader.includes('prix d vente') || cleanHeader.includes('vente') || cleanHeader.includes('price') || cleanHeader.includes('prix')) {
    mapping.prix_vente = index;
  } else if (cleanHeader.includes('stock actuel') || cleanHeader.includes('quantite') || cleanHeader.includes('stock') || cleanHeader.includes('quantity')) {
    mapping.quantite = index;
  } else if (cleanHeader.includes('référence') || cleanHeader.includes('reference') || cleanHeader.includes('ref') || cleanHeader.includes('sku')) {
    mapping.reference = index;
  } else if (cleanHeader.includes('description') || cleanHeader.includes('desc')) {
    mapping.description = index;
  } else if (cleanHeader.includes('catégorie') || cleanHeader.includes('categorie') || cleanHeader.includes('category') || cleanHeader.includes('type')) {
    mapping.categorie = index;
  } else if (cleanHeader.includes('code-barre') || cleanHeader.includes('code_barre') || cleanHeader.includes('code barre') || cleanHeader.includes('barcode') || cleanHeader.includes('ean')) {
    mapping.code_barre = index;
  } else if (cleanHeader.includes('unité') || cleanHeader.includes('unite') || cleanHeader.includes('unit') || cleanHeader.includes('uom')) {
    mapping.unite_mesure = index;
  } else if (cleanHeader.includes('fournisseur') || cleanHeader.includes('supplier') || cleanHeader.includes('vendor')) {
    mapping.fournisseur_nom = index;
  } else if (cleanHeader.includes('marque') || cleanHeader.includes('brand') || cleanHeader.includes('fabricant')) {
    mapping.marque = index;
  } else if (cleanHeader.includes('modèle') || cleanHeader.includes('modele') || cleanHeader.includes('model') || cleanHeader.includes('version')) {
    mapping.modele = index;
  } else if (cleanHeader.includes('état') || cleanHeader.includes('etat') || cleanHeader.includes('condition') || cleanHeader.includes('state')) {
    mapping.etat_produit = index;
  } else if (cleanHeader.includes('devise') || cleanHeader.includes('currency') || cleanHeader.includes('monnaie')) {
    mapping.devise = index;
  } else if (cleanHeader.includes('sku') || cleanHeader.includes('code_sku') || cleanHeader.includes('reference_interne')) {
    mapping.sku = index;
  }
});

console.log('Mapping créé:', mapping);

// Test 4: Vérification des champs requis
console.log('4. Vérification des champs requis...');
const requiredFields = ['nom', 'prix_achat', 'prix_vente', 'quantite'];
const missingFields = requiredFields.filter(field => !(field in mapping));

if (missingFields.length === 0) {
  console.log('✅ Tous les champs requis sont mappés');
} else {
  console.log('❌ Champs manquants:', missingFields);
}

// Test 5: Test avec des en-têtes problématiques
console.log('5. Test avec des en-têtes problématiques...');
const problematicHeaders = [
  'Nom', 'Référence', 'Description', 'Prix d\'achat', 'Prix de vente', 'Stock actuel',
  'Catégorie', 'Code-barre', 'Unité', 'Fournisseur', 'Marque', 'Modèle',
  'État', 'Devise', 'SKU'
];

const problematicCleaned = problematicHeaders.map(h => h.trim().toLowerCase().replace(/"/g, '').replace(/'/g, ''));
console.log('En-têtes problématiques nettoyés:', problematicCleaned);

// Vérifier que les apostrophes sont supprimées
const hasApostrophes = problematicCleaned.some(h => h.includes("'"));
console.log('Apostrophes présentes après nettoyage:', hasApostrophes ? '❌ Oui' : '✅ Non');

// Vérifier que les espaces sont préservés
const hasSpaces = problematicCleaned.some(h => h.includes(' '));
console.log('Espaces préservés:', hasSpaces ? '✅ Oui' : '❌ Non');

console.log('=== TEST TERMINÉ ===');
console.log('Résultat: Les en-têtes Excel avec espaces et apostrophes devraient maintenant fonctionner!');
console.log('Pour tester:');
console.log('1. Allez sur la page produits');
console.log('2. Cliquez sur "Exporter" puis "Export Excel"');
console.log('3. Téléchargez le fichier Excel généré');
console.log('4. Cliquez sur "Importer" et sélectionnez le fichier téléchargé');
console.log('5. Vérifiez que les en-têtes sont correctement reconnus');
