# Guide de Test - Correction Import "Source Inconnu"

## ✅ **Problème identifié et corrigé :**

Le backend attendait des **nombres** pour `prix_achat`, `prix_vente`, et `quantite`, mais on envoyait des **chaînes de caractères**.

## 🔧 **Corrections apportées :**

### 1. **Conversion des données avant envoi à l'API**
```javascript
// Maintenant on convertit les chaînes en nombres
const prixAchat = parseFloat(String(item.prix_achat).replace(/[^\d.,]/g, '').replace(',', '.')) || 0
const prixVente = parseFloat(String(item.prix_vente).replace(/[^\d.,]/g, '').replace(',', '.')) || 0
const quantite = parseInt(String(item.quantite).replace(/[^\d]/g, '')) || 0
```

### 2. **Gestion d'erreurs améliorée**
- Affichage des erreurs détaillées dans la console
- Message d'erreur clair pour l'utilisateur
- Fallback sur import local si l'API n'est pas disponible

## 🧪 **Test immédiat :**

### **Étape 1 : Exporter des produits**
1. Aller sur `http://localhost:3000/produits`
2. Cliquer sur "Exporter CSV" ou "Exporter Excel"
3. Le fichier contient maintenant les en-têtes simples : `nom,prix_achat,prix_vente,quantite...`

### **Étape 2 : Importer le fichier**
1. Cliquer sur "Importer"
2. Sélectionner le fichier exporté
3. **✅ L'import devrait maintenant fonctionner !**

### **Étape 3 : Vérifier la console (F12)**
Si l'import échoue encore, ouvrez la console du navigateur (F12) pour voir les erreurs détaillées :
- Type d'erreur
- Message exact
- Données envoyées

## 📊 **Ce qui est envoyé maintenant à l'API :**

```json
{
  "produits": [
    {
      "nom": "Produit Test",
      "prix_achat": 1000,        // ✅ Nombre, pas chaîne
      "prix_vente": 1500,        // ✅ Nombre, pas chaîne
      "quantite": 50,            // ✅ Nombre, pas chaîne
      "reference": "REF001",
      "description": "Description...",
      ...
    }
  ]
}
```

## 🎯 **Résultats attendus :**

- ✅ **Export** : Génère des fichiers avec en-têtes simples
- ✅ **Import** : Convertit automatiquement les données en nombres
- ✅ **API** : Reçoit les données dans le bon format
- ✅ **Succès** : Message "X produit(s) importé(s) avec succès!"

## 🔍 **En cas de problème :**

1. Ouvrez la console du navigateur (F12)
2. Regardez les messages commençant par "Erreur importation complète:"
3. Envoyez-moi le message d'erreur exact

**Testez maintenant et dites-moi si ça fonctionne !** 🎉
