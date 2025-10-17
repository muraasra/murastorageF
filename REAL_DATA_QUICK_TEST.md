# 🚀 Guide de Test Rapide - Vraies Données

## ⚡ **Test en 3 Étapes :**

### **1. Vérifier le Backend**
```bash
# Vérifiez que votre backend Django fonctionne
# Les endpoints suivants doivent être accessibles :
# - GET /api/boutiques/
# - GET /api/produits/
# - GET /api/mouvements-stock/
# - POST /api/mouvements-stock/transfert/
```

### **2. Se Connecter**
1. **Ouvrez** `http://localhost:3000/connexion`
2. **Connectez-vous** avec un utilisateur d'une entreprise
3. ✅ **Vérifiez** que l'entreprise s'affiche

### **3. Tester le Transfert**
1. **Ouvrez** `http://localhost:3000/transfert`
2. **Ouvrez** la console (F12) pour voir les logs
3. ✅ **Vérifiez** que les vraies données se chargent

## 🔍 **Logs à Vérifier :**

### **Chargement Réussi :**
```
🏢 Chargement des entrepôts pour l'entreprise: [Votre Entreprise]
📦 Entrepôts chargés: [Nombre]
📦 Entrepôts: [Liste des entrepôts]
📦 Chargement des produits pour l'entreprise: [Votre Entreprise]
📦 Produits chargés: [Nombre]
📦 Produits: [Liste des produits]
```

### **Transfert Réussi :**
```
🚀 Création du transfert via API
✅ Transfert créé via API: [Réponse]
```

## 🧪 **Test Rapide (2 minutes) :**

### **Étape 1 : Vérifier les Données**
1. **Page** : `http://localhost:3000/transfert`
2. **Console** : Ouvrir F12
3. ✅ **Vérifier** : Les logs montrent vos vraies données

### **Étape 2 : Créer un Transfert**
1. **Cliquer** : "Nouveau Transfert"
2. **Rechercher** : Un produit de votre entreprise
3. **Sélectionner** : Un produit avec du stock
4. **Choisir** : Entrepôt source et destination
5. **Créer** : Le transfert

### **Étape 3 : Vérifier la Persistance**
1. **Actualiser** : La page (F5)
2. ✅ **Vérifier** : Le transfert est toujours là
3. ✅ **Vérifier** : Les stocks ont été mis à jour

## ✅ **Si Tout Fonctionne :**

- ✅ **Vraies données** de votre entreprise
- ✅ **Entrepôts réels** avec leurs noms
- ✅ **Produits réels** avec leurs prix
- ✅ **Stocks réels** par entrepôt
- ✅ **Transferts persistants** en base
- ✅ **Mise à jour** des stocks en temps réel

## ❌ **Si Problème :**

### **Erreur : "Token d'authentification manquant"**
- **Solution** : Se connecter d'abord

### **Erreur : "Entreprise non connectée"**
- **Solution** : Vérifier que l'utilisateur a une entreprise

### **Erreur : "Erreur lors du chargement des entrepôts"**
- **Solution** : Vérifier que le backend fonctionne et que l'endpoint `/api/boutiques/` existe

### **Données vides**
- **Solution** : Vérifier que votre entreprise a des produits et entrepôts

### **Fallback activé**
- **Solution** : Les données de test sont utilisées, vérifiez la configuration API

## 🎯 **Résultat Attendu :**

Après le test, vous devriez voir :
- **Vraies données** de votre entreprise
- **Entrepôts réels** dans la liste
- **Produits réels** avec leurs prix
- **Stocks réels** par entrepôt
- **Transferts sauvegardés** en base de données

## 📞 **Support :**

Si vous rencontrez des problèmes :
1. **Vérifiez** la console (F12) pour les erreurs
2. **Vérifiez** que le backend fonctionne
3. **Vérifiez** que vous êtes connecté
4. **Vérifiez** que votre entreprise a des données

**Le système utilise maintenant vos vraies données !** 🚀














