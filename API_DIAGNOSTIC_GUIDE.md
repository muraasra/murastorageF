# Guide de Test - Diagnostic Import API

## 🔍 **Problème actuel :**
L'authentification fonctionne, les données sont préparées, mais l'import échoue après l'envoi de la requête API.

## 🧪 **Test avec logs détaillés :**

### **Étape 1 : Tester l'import**
1. Allez sur `http://localhost:3000/produits`
2. Ouvrez la console (F12)
3. Cliquez sur "Importer"
4. Sélectionnez un fichier
5. Cliquez sur "Importer X produit(s)"

### **Étape 2 : Regarder les logs**
Vous devriez voir dans la console :
```
🔐 Token: Présent
👤 User: Présent
✅ Conditions OK, démarrage de l'import...
=== IMPORT VIA API BACKEND ===
2 produits à importer
Données préparées: (2) [{…}, {…}]
🚀 Envoi de la requête API...
URL complète: http://127.0.0.1:8000/api/produits/import_produits/
Headers: {Content-Type: "application/json", Authorization: "Bearer eyJ0eXAiOiJKV1QiLCJhbGc..."}
Body produits count: 2
```

### **Étape 3 : Vérifier la réponse**
Après l'envoi, vous devriez voir soit :
- `✅ Réponse API reçue: {success: true, imported_count: 2}`
- `❌ ERREUR IMPORTATION COMPLÈTE:` avec les détails

## 🚨 **Diagnostic selon les logs :**

### **Si vous voyez "✅ Réponse API reçue" :**
- L'API fonctionne
- Vérifiez le contenu de la réponse

### **Si vous voyez "❌ ERREUR IMPORTATION COMPLÈTE" :**
- Regardez les détails de l'erreur :
  - `Erreur status:` (404, 500, etc.)
  - `Erreur message:` (message d'erreur)
  - `Erreur data:` (détails supplémentaires)

## 🔧 **Solutions selon l'erreur :**

### **Status 404 :**
- Endpoint non trouvé
- Vérifier l'URL du backend

### **Status 500 :**
- Erreur serveur
- Vérifier les logs du backend Django

### **Status 400 :**
- Données invalides
- Vérifier le format des données envoyées

## 📋 **Actions à faire :**

1. **Testez l'import** et copiez-collez **TOUS** les logs de la console
2. **Regardez les logs du backend** Django dans le terminal
3. **Envoyez-moi** :
   - Les logs de la console frontend
   - Les logs du backend Django
   - Le message d'erreur exact

## 🎯 **Résultat attendu :**
```
✅ Réponse API reçue: {success: true, imported_count: 2}
X produit(s) importé(s) avec succès!
```

**Testez maintenant et envoyez-moi tous les logs !** 🔍
