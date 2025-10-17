# Guide de Test - Accès à Tarification

## 🚀 Serveur démarré
Le serveur de développement devrait maintenant fonctionner sur `http://localhost:3000`

## 📋 Pages disponibles pour tester

### 1. Page de diagnostic (RECOMMANDÉ)
**URL:** `http://localhost:3000/debug-auth`
- ✅ Pas de middleware requis
- ✅ Affiche votre statut d'authentification
- ✅ Indique pourquoi l'accès est refusé
- ✅ Permet de tester la navigation

### 2. Page tarification de test
**URL:** `http://localhost:3000/superadmin/tarification-test`
- ✅ Pas de middleware requis
- ✅ Interface complète avec données statiques
- ✅ Fonctionne même sans authentification

### 3. Page tarification principale
**URL:** `http://localhost:3000/superadmin/tarification`
- ⚠️ Nécessite authentification superadmin
- ✅ Interface complète avec données dynamiques
- ✅ Intégration API complète

## 🔧 Tests à effectuer

### Test 1: Vérification de base
1. Allez sur `http://localhost:3000/debug-auth`
2. Vérifiez votre statut d'authentification
3. Notez les informations affichées

### Test 2: Accès sans authentification
1. Allez sur `http://localhost:3000/superadmin/tarification-test`
2. La page devrait s'afficher normalement
3. Testez les fonctionnalités (boutons, navigation)

### Test 3: Accès avec authentification
1. Connectez-vous d'abord sur `/connexion`
2. Assurez-vous d'avoir le rôle `superadmin`
3. Allez sur `http://localhost:3000/superadmin/tarification`

## 🐛 Résolution des problèmes

### Problème: Page ne se charge pas
**Solution:**
```bash
# Vérifier que le serveur fonctionne
curl http://localhost:3000
```

### Problème: Erreur 404
**Solution:**
- Vérifiez l'URL exacte
- Assurez-vous que le serveur est démarré
- Vérifiez la console du navigateur

### Problème: Redirection vers /connexion
**Solution:**
- Vous n'êtes pas connecté
- Allez sur `/connexion` d'abord
- Ou utilisez `/superadmin/tarification-test` pour tester

### Problème: Accès refusé même connecté
**Solution:**
- Vérifiez votre rôle dans `/debug-auth`
- Vous devez avoir le rôle `superadmin`
- Contactez un administrateur si nécessaire

## 📱 Test rapide dans la console

Ouvrez la console du navigateur (F12) et exécutez :

```javascript
// Vérifier l'authentification
console.log('Token:', localStorage.getItem('access_token'))
console.log('User:', localStorage.getItem('user'))
console.log('Boutique:', localStorage.getItem('boutique'))

// Simuler une connexion superadmin (pour test uniquement)
localStorage.setItem('access_token', 'test-token')
localStorage.setItem('user', JSON.stringify({
  id: 1,
  email: 'admin@test.com',
  role: 'superadmin'
}))

// Recharger la page
location.reload()
```

## ✅ Checklist de validation

- [ ] Serveur démarré sur localhost:3000
- [ ] Page `/debug-auth` accessible
- [ ] Page `/superadmin/tarification-test` accessible
- [ ] Statut d'authentification vérifié
- [ ] Rôle utilisateur confirmé
- [ ] Page `/superadmin/tarification` accessible (si superadmin)

## 📞 Support

Si les problèmes persistent :
1. Vérifiez la console du navigateur pour les erreurs
2. Vérifiez la console du serveur pour les logs
3. Utilisez `/debug-auth` pour diagnostiquer
4. Testez avec `/superadmin/tarification-test` en attendant








