# 🚀 Guide de Démarrage Rapide - Système de Transfert

## ⚡ **Démarrage en 3 Étapes :**

### **1. Vérifier le Serveur**
```bash
# Vérifier que le serveur fonctionne
# Le serveur doit être actif sur http://localhost:3000
```

### **2. Se Connecter**
1. **Ouvrez** `http://localhost:3000/connexion`
2. **Connectez-vous** avec vos identifiants
3. ✅ **Vérifiez** que l'entreprise s'affiche

### **3. Tester le Transfert**
1. **Ouvrez** `http://localhost:3000/transfert`
2. **Cliquez** sur "Nouveau Transfert"
3. **Recherchez** "Dell" et sélectionnez-le
4. **Créez** un transfert de test
5. ✅ **Vérifiez** que tout fonctionne

## 🧪 **Test Rapide (2 minutes) :**

### **Étape 1 : Créer un Transfert**
1. **Page** : `http://localhost:3000/transfert`
2. **Action** : Cliquer "Nouveau Transfert"
3. **Recherche** : Taper "Dell"
4. **Sélection** : Cliquer sur "Ordinateur Portable Dell"
5. **Source** : Sélectionner "Entrepôt Principal (15 disponibles)"
6. **Destination** : Sélectionner "Entrepôt Secondaire"
7. **Quantité** : Entrer "3"
8. **Créer** : Cliquer "Créer le Transfert"

### **Étape 2 : Gérer le Transfert**
1. **Démarrer** : Cliquer "Démarrer" sur le transfert créé
2. **Compléter** : Cliquer "Compléter" sur le transfert en cours
3. ✅ **Vérifier** : Le statut passe à "Complété"

### **Étape 3 : Vérifier les Résultats**
1. **Détails** : Cliquer sur le transfert pour voir les détails
2. **Filtres** : Utiliser le filtre "Complétés"
3. **Recherche** : Rechercher "Dell" pour voir les transferts

## ✅ **Si Tout Fonctionne :**

- ✅ **Page se charge** sans erreur
- ✅ **Entreprise s'affiche** dans l'en-tête
- ✅ **Statistiques** montrent les compteurs
- ✅ **Transfert se crée** avec succès
- ✅ **Actions fonctionnent** (démarrer, compléter)
- ✅ **Filtres marchent** correctement

## ❌ **Si Problème :**

### **Erreur : "Utilisateur non connecté"**
- **Solution** : Se connecter d'abord sur `/connexion`

### **Erreur : "Entreprise non définie"**
- **Solution** : Vérifier que l'entreprise est dans localStorage

### **Page ne se charge pas**
- **Solution** : Vérifier que le serveur fonctionne sur port 3000

### **Erreurs dans la console**
- **Solution** : Ouvrir F12 et vérifier les erreurs

## 🎯 **Résultat Attendu :**

Après le test, vous devriez voir :
- **1 transfert créé** avec le produit Dell
- **Statut "Complété"** avec date de completion
- **Stock mis à jour** dans les entrepôts
- **Notification de succès** pour chaque action

**Le système fonctionne parfaitement !** 🎉

## 📞 **Support :**

Si vous rencontrez des problèmes :
1. **Vérifiez** la console (F12) pour les erreurs
2. **Redémarrez** le serveur si nécessaire
3. **Vérifiez** que vous êtes connecté
4. **Testez** avec les données de test fournies

**Le système est prêt à être utilisé !** 🚀















