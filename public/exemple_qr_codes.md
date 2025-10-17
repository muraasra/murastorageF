# Guide d'utilisation des QR Codes

## 🎯 Fonctionnalités disponibles

### Types de QR Codes
- **QR Code standard** : 300x300px, taille optimale
- **QR Code petit** : 200x200px, pour les étiquettes
- **QR Code grand** : 500x500px, pour l'affichage
- **QR Code personnalisé** : Taille définie par l'utilisateur

### Contenu des QR Codes
1. **Référence du produit** : Code de référence unique
2. **Code-barre existant** : Utilise le code-barre du produit
3. **ID du produit** : Identifiant numérique
4. **URL du produit** : Lien direct vers la fiche produit
5. **Données complètes (JSON)** : Informations complètes du produit
6. **Texte personnalisé** : Contenu défini par l'utilisateur

### Formats de sortie
- **PNG** : Recommandé pour l'impression
- **SVG** : Vectoriel, redimensionnable sans perte
- **JPG** : Compressé, plus léger

## 🚀 Utilisation

### Génération individuelle
1. Cliquez sur l'icône QR code dans la liste des produits
2. Sélectionnez le type de QR code souhaité
3. Choisissez le contenu à encoder
4. Configurez les options (taille, format, informations supplémentaires)
5. Cliquez "Générer" pour prévisualiser
6. Cliquez "Télécharger" pour sauvegarder

### Génération en masse
1. Cliquez "Générer QR Codes" dans la barre d'actions
2. Sélectionnez les produits souhaités
3. Configurez les options de génération
4. Cliquez "Générer X code(s)" pour télécharger

## 📱 Cas d'usage

### Identification rapide
- **QR Code avec référence** : Scan rapide pour identifier le produit
- **QR Code avec URL** : Accès direct aux informations détaillées

### Inventaire et stock
- **QR Code avec données JSON** : Informations complètes pour les applications
- **QR Code avec nom et prix** : Affichage direct des informations importantes

### Marketing et vente
- **QR Code grand** : Affichage en magasin
- **QR Code petit** : Étiquetage des produits

## 🔧 Configuration avancée

### Options d'affichage
- ✅ Inclure le texte sous le code
- ✅ Inclure le nom du produit
- ✅ Inclure le prix

### Personnalisation
- Couleur : Noir sur fond blanc (standard)
- Marge : 10px autour du code
- Correction d'erreur : Niveau L (recommandé)

## 💡 Conseils d'utilisation

1. **Pour l'impression** : Utilisez le format PNG avec une résolution de 300 DPI
2. **Pour le web** : Le format SVG est idéal pour la responsivité
3. **Pour les étiquettes** : Utilisez la taille "petit" (200x200px)
4. **Pour l'affichage** : Utilisez la taille "grand" (500x500px)

## 📋 Exemples de contenu

### Référence simple
```
REF-001
```

### URL complète
```
https://votre-site.com/produits/123
```

### Données JSON
```json
{
  "id": 123,
  "nom": "iPhone 13",
  "reference": "IPH13-001",
  "prix_vente": 550000,
  "category": "telephone"
}
```

### Contenu enrichi
```
REF-001
iPhone 13
550000 XAF
```







