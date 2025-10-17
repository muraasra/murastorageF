import XLSX from 'xlsx';

// Créer un nouveau workbook
const wb = XLSX.utils.book_new();

// Données avec en-têtes simples
const data = [
  ['nom', 'prix_achat', 'prix_vente', 'quantite', 'reference', 'description', 'categorie', 'code_barre', 'unite', 'fournisseur', 'marque', 'modele', 'etat', 'devise', 'sku'],
  ['Produit Test 1', '1000', '1500', '50', 'REF001', 'Description du produit test', 'Electronique', '1234567890123', 'piece', 'Fournisseur A', 'Brand A', 'Model A', 'actif', 'XAF', 'SKU001'],
  ['Produit Test 2', '2000', '2500', '30', 'REF002', 'Description du produit test 2', 'Informatique', '1234567890124', 'piece', 'Fournisseur B', 'Brand B', 'Model B', 'actif', 'XAF', 'SKU002'],
  ['Produit Test 3', '3000', '3500', '20', 'REF003', 'Description du produit test 3', 'Maison', '1234567890125', 'piece', 'Fournisseur C', 'Brand C', 'Model C', 'actif', 'XAF', 'SKU003']
];

// Créer une feuille de calcul
const ws = XLSX.utils.aoa_to_sheet(data);

// Ajouter la feuille au workbook
XLSX.utils.book_append_sheet(wb, ws, 'Produits');

// Écrire le fichier
XLSX.writeFile(wb, 'test_simple_headers.xlsx');

console.log('Fichier Excel créé avec succès : test_simple_headers.xlsx');
