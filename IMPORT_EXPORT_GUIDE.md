# Guide d'Import/Export des Produits - Version Corrigée

## Problèmes Résolus

### 1. **Incompatibilité Export/Import**
- ✅ **Export CSV** : Génère maintenant des en-têtes français compatibles
- ✅ **Import** : Reconnaît les en-têtes français et anglais
- ✅ **Mapping** : Correspondance parfaite entre export et import

### 2. **Support Multi-format**
- ✅ **CSV** : Support complet avec en-têtes français
- ✅ **Excel** : Conversion automatique vers CSV pour l'API
- ✅ **JSON** : Support direct via API backend

### 3. **API Backend Améliorée**
- ✅ **Import JSON** : Accepte les données structurées
- ✅ **Import CSV** : Support des fichiers CSV
- ✅ **Validation** : Contrôles de données robustes

## Structure des Fichiers Compatibles

### En-têtes CSV Standard
```
Nom,Référence,Description,Prix d'achat,Prix de vente,Stock actuel,Catégorie,Code-barre,Unité,Fournisseur,Marque,Modèle,État,Devise,SKU
```

### Exemple de Données
```csv
iPhone 15 Pro,IPH15-001,Smartphone Apple avec puce A17 Pro,650000,750000,8,telephone,1234567890123,unitaire,Apple Store,Apple,iPhone 15 Pro,actif,XAF,IPH15-001
MacBook Air M2,MBA-M2-001,Ordinateur portable Apple avec puce M2,950000,1150000,5,ordinateur,2345678901234,unitaire,Apple Store,Apple,MacBook Air M2,actif,XAF,MBA-M2-001
```

## Fonctionnalités

### Export
1. **CSV** : Format standard avec en-têtes français
2. **Excel** : Conversion automatique avec SheetJS
3. **Compatibilité** : Fichiers directement réimportables

### Import
1. **CSV** : Support des fichiers CSV avec en-têtes français
2. **Excel** : Conversion automatique vers CSV
3. **API** : Envoi des données au backend pour persistance
4. **Fallback** : Import local si API indisponible

### Mapping Intelligent
- **Flexible** : Reconnaît les variantes d'en-têtes
- **Français/Anglais** : Support bilingue
- **Validation** : Contrôles de données automatiques

## Utilisation

### 1. Export
1. Cliquer sur "Exporter" dans la page produits
2. Choisir le format (CSV ou Excel)
3. Le fichier est téléchargé avec la structure compatible

### 2. Import
1. Cliquer sur "Importer" dans la page produits
2. Sélectionner un fichier CSV ou Excel
3. Vérifier l'aperçu des données
4. Confirmer l'importation
5. Les données sont envoyées au backend

### 3. Validation
- **Champs obligatoires** : Nom, Prix d'achat, Prix de vente, Stock actuel
- **Types de données** : Validation automatique des prix et quantités
- **Erreurs** : Affichage détaillé des problèmes détectés

## Fichiers d'Exemple

- `exemple_produits_compatible.csv` : Format standard recommandé
- `exemple_produits.xlsx` : Version Excel compatible
- `exemple_produits.csv` : Ancien format (toujours supporté)

## Notes Techniques

### Frontend
- **Mapping** : Reconnaissance intelligente des colonnes
- **Validation** : Contrôles côté client
- **API** : Communication avec backend Django

### Backend
- **Endpoints** : `/api/produits/import_produits/`
- **Formats** : CSV et JSON supportés
- **Validation** : Contrôles de données robustes
- **Entreprise** : Association automatique à l'entreprise utilisateur

### Compatibilité
- **Rétrocompatibilité** : Anciens formats toujours supportés
- **Évolutivité** : Facile d'ajouter de nouveaux champs
- **Performance** : Import par lots optimisé
