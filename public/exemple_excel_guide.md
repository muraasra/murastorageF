# Guide d'utilisation des fichiers Excel

## 📋 **Formats supportés**

### ✅ **Formats acceptés**
- **Excel moderne** : `.xlsx` (Excel 2007+)
- **Excel ancien** : `.xls` (Excel 97-2003)
- **CSV** : `.csv`, `.txt`, `.tsv`

### 📊 **Structure recommandée**

#### **Colonnes requises** (obligatoires)
- `Nom` - Nom du produit
- `Prix d'achat` - Prix d'achat en XAF
- `Prix de vente` - Prix de vente en XAF
- `Stock actuel` - Quantité en stock

#### **Colonnes optionnelles** (recommandées)
- `Référence` - Référence produit
- `Description` - Description détaillée
- `Catégorie` - Catégorie (telephone, ordinateur, accessoire, autre)
- `Code-barre` - Code-barre EAN/UPC
- `Unité` - Unité de mesure (unitaire, kg, m, etc.)
- `Fournisseur` - Nom du fournisseur
- `Marque` - Marque du produit
- `Modèle` - Modèle spécifique
- `Couleur` - Couleur du produit
- `Poids` - Poids en grammes
- `Dimensions` - Dimensions (L x l x H)
- `Garantie` - Durée de garantie
- `Localisation` - Emplacement dans l'entrepôt
- `TVA` - Taux de TVA (%)
- `Statut` - Statut (actif, inactif, discontinué)

## 🔧 **Instructions d'importation**

### **1. Préparation du fichier**
- Utilisez Excel, LibreOffice Calc ou Google Sheets
- Sauvegardez en format `.xlsx` ou `.csv`
- Vérifiez que les données sont dans la première feuille

### **2. Format des données**
- **En-têtes** : Première ligne doit contenir les noms des colonnes
- **Données** : Une ligne par produit
- **Séparateurs** : Virgules (,) pour CSV, colonnes pour Excel
- **Décimales** : Point (.) pour les prix
- **Encodage** : UTF-8 recommandé

### **3. Exemple de fichier Excel**

| Nom | Référence | Description | Prix d'achat | Prix de vente | Stock actuel | Catégorie | Code-barre | Unité | Fournisseur | Marque | Modèle | Couleur | Poids | Dimensions | Garantie | Localisation | TVA | Statut |
|-----|-----------|-------------|--------------|---------------|--------------|-----------|------------|-------|-------------|--------|--------|---------|-------|------------|----------|--------------|-----|--------|
| iPhone 15 Pro | IPH15-001 | Smartphone Apple avec puce A17 Pro | 650000 | 750000 | 8 | telephone | 1234567890123 | unitaire | Apple Store | Apple | iPhone 15 Pro | Natural Titanium | 187 | 147.6 x 71.6 x 8.25 mm | 2 ans | Rayon A | 19.25 | actif |

## ⚠️ **Points d'attention**

### **Validation des données**
- Les prix doivent être des nombres positifs
- Le stock doit être un nombre entier positif
- Les catégories doivent correspondre aux valeurs autorisées
- Les références doivent être uniques

### **Limitations**
- Taille maximale : 10MB
- Nombre de lignes : 100 pour la prévisualisation
- Formats complexes : Formules Excel non supportées

## 🚀 **Processus d'importation**

### **1. Sélection du fichier**
- Cliquez sur "Importer" dans l'interface
- Sélectionnez votre fichier Excel ou CSV
- Le système détecte automatiquement le format

### **2. Prévisualisation**
- Vérifiez les données parsées
- Corrigez les erreurs éventuelles
- Consultez les statistiques d'importation

### **3. Importation**
- Cliquez sur "Importer X produit(s)"
- Attendez la confirmation
- Les produits sont ajoutés à votre catalogue

## 📤 **Export Excel**

### **Fonctionnalités d'export**
- **Format CSV** : Fichier texte séparé par virgules
- **Format Excel** : Fichier `.xlsx` compatible Excel
- **Colonnes complètes** : Toutes les 19 colonnes disponibles
- **Téléchargement automatique** : Fichier téléchargé immédiatement

### **Nom du fichier**
- Format : `produits_export_YYYY-MM-DD.xlsx`
- Exemple : `produits_export_2024-01-15.xlsx`

## 🔍 **Dépannage**

### **Erreurs courantes**
- **"Format non supporté"** : Vérifiez l'extension du fichier
- **"Données manquantes"** : Vérifiez les colonnes requises
- **"Erreur de parsing"** : Vérifiez le format des données
- **"Fichier trop volumineux"** : Réduisez la taille du fichier

### **Solutions**
- Convertissez en CSV si Excel ne fonctionne pas
- Vérifiez l'encodage (UTF-8)
- Supprimez les formules Excel
- Vérifiez les séparateurs

## 📞 **Support**

Pour toute question ou problème :
- Vérifiez ce guide en premier
- Consultez les exemples fournis
- Contactez l'administrateur système

---

**Note** : Ce système est optimisé pour les fichiers Excel simples. Pour des fichiers complexes avec formules, graphiques ou macros, convertissez d'abord en CSV.







