# Guide de résolution - Problème d'accès à Tarification

## Problème identifié
Vous ne pouvez pas accéder à la page `/superadmin/tarification` à cause des middlewares d'authentification.

## Solutions

### 1. Vérifier votre statut de connexion
Allez sur la page de debug : `http://localhost:3000/debug-auth`

Cette page vous montrera :
- Si vous êtes connecté
- Votre rôle utilisateur
- Si vous avez accès à la page tarification
- Les raisons d'un éventuel refus d'accès

### 2. Si vous n'êtes pas connecté
1. Allez sur `/connexion`
2. Connectez-vous avec vos identifiants
3. Assurez-vous d'avoir le rôle `superadmin`

### 3. Si vous êtes connecté mais pas superadmin
Contactez un administrateur pour :
- Vérifier votre rôle dans la base de données
- Vous attribuer le rôle `superadmin`

### 4. Si vous êtes superadmin mais toujours bloqué
1. Ouvrez la console du navigateur (F12)
2. Regardez les logs du middleware auth
3. Vérifiez les données dans localStorage :
   ```javascript
   console.log('Token:', localStorage.getItem('access_token'))
   console.log('User:', localStorage.getItem('user'))
   console.log('Boutique:', localStorage.getItem('boutique'))
   ```

### 5. Solution temporaire (pour les tests)
Si vous voulez tester sans authentification, modifiez temporairement le middleware :

```typescript
// Dans middleware/auth.global.ts
export default defineNuxtRouteMiddleware(async (to) => {
  // Désactiver temporairement pour les tests
  if (to.path === '/superadmin/tarification') {
    return // Autoriser l'accès
  }
  
  // ... reste du code
})
```

## Fichiers créés pour vous aider

1. **`/debug-auth`** - Page de diagnostic de l'authentification
2. **`/superadmin/tarification`** - Page tarification simplifiée
3. **Middleware auth amélioré** - Avec logs de debug

## Prochaines étapes

1. Allez sur `http://localhost:3000/debug-auth`
2. Vérifiez votre statut d'authentification
3. Suivez les instructions affichées
4. Une fois connecté en tant que superadmin, allez sur `/superadmin/tarification`

## Test rapide
```bash
# Dans la console du navigateur
localStorage.setItem('access_token', 'test-token')
localStorage.setItem('user', JSON.stringify({
  id: 1,
  email: 'admin@test.com',
  role: 'superadmin'
}))
```

Puis rechargez la page `/superadmin/tarification`














