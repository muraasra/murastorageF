# Guide de Correction - Problème d'Authentification (403 Forbidden)

## 🚨 **Problème identifié :**
Toutes les requêtes API retournent **403 Forbidden** car l'authentification ne fonctionne pas.

## 🔍 **Diagnostic :**

### **Étape 1 : Vérifier la connexion**
1. Allez sur `http://localhost:3000/connexion`
2. Connectez-vous avec vos identifiants
3. Vérifiez que vous êtes redirigé vers `/produits`

### **Étape 2 : Vérifier le token dans la console**
1. Ouvrez la console du navigateur (F12)
2. Tapez dans la console :
```javascript
console.log('Token:', localStorage.getItem('access_token'))
console.log('User:', localStorage.getItem('user'))
```

### **Étape 3 : Tester l'import avec logs**
1. Allez sur `http://localhost:3000/produits`
2. Cliquez sur "Importer"
3. Sélectionnez un fichier
4. Cliquez sur "Importer X produit(s)"
5. **Regardez la console** - vous devriez voir :
```
🔐 Token: Présent
👤 User: Présent
```

## 🔧 **Solutions selon le problème :**

### **Si Token = null :**
- Vous n'êtes pas connecté
- Reconnectez-vous sur `/connexion`

### **Si Token existe mais 403 persiste :**
- Le token est expiré
- Reconnectez-vous pour obtenir un nouveau token

### **Si User = null :**
- Problème de session
- Reconnectez-vous

## 🧪 **Test rapide :**

### **1. Vérifier l'authentification :**
```javascript
// Dans la console du navigateur
const token = localStorage.getItem('access_token')
const user = localStorage.getItem('user')
console.log('Authentifié:', !!(token && user))
```

### **2. Tester une requête API :**
```javascript
// Dans la console du navigateur
fetch('/api/produits/', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
  }
}).then(r => console.log('Status:', r.status))
```

## ✅ **Résultat attendu :**
- Status 200 (au lieu de 403)
- Import fonctionne normalement

## 🚨 **Si le problème persiste :**
1. **Déconnectez-vous** complètement
2. **Reconnectez-vous** sur `/connexion`
3. **Testez l'import** à nouveau

**Le problème vient de l'authentification, pas du code d'import !** 🔐
