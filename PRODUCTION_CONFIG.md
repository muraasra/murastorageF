# Configuration Frontend pour Production

## 🔧 Configuration API Backend

### Fichier modifié : `Frontend/constants/index.ts`

**AVANT (Développement) :**
```typescript
export const API_BASE_URL = 'http://127.0.0.1:8000'
```

**APRÈS (Production) :**
```typescript
export const API_BASE_URL = 'https://murastorage.pythonanywhere.com'
```

## 🌐 URLs de l'Application

### Backend (PythonAnywhere)
- **URL** : `https://murastorage.pythonanywhere.com`
- **API** : `https://murastorage.pythonanywhere.com/api/`
- **Admin** : `https://murastorage.pythonanywhere.com/admin/`

### Frontend (à déployer)
- **URL locale** : `http://localhost:3000`
- **URL production** : À configurer selon votre hébergeur

## 🔧 Configuration CORS

### Backend (settings_production.py)
```python
CORS_ALLOWED_ORIGINS = [
    "https://murastorage.pythonanywhere.com",
    "https://www.murastorage.pythonanywhere.com",
    "http://localhost:3000",  # Pour le développement
]
```

## 📋 Vérifications à faire

### 1. Test de connexion API
```bash
# Tester l'API backend
curl https://murastorage.pythonanywhere.com/api/

# Tester l'authentification
curl -X POST https://murastorage.pythonanywhere.com/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}'
```

### 2. Test Frontend
1. **Démarrer le frontend** : `npm run dev`
2. **Ouvrir** : `http://localhost:3000`
3. **Tester la connexion** avec les identifiants
4. **Vérifier** que les données se chargent

### 3. Configuration SSL
- ✅ **Backend** : HTTPS activé sur PythonAnywhere
- ⚠️ **Frontend** : À configurer selon l'hébergeur

## 🚀 Prochaines étapes

1. **Tester la connexion** frontend → backend
2. **Déployer le frontend** sur Netlify/Vercel/Render
3. **Configurer CORS** pour l'URL du frontend
4. **Tester l'application** complète en production

## 🔍 Dépannage

### Erreur CORS
- Vérifier `CORS_ALLOWED_ORIGINS` dans le backend
- Ajouter l'URL du frontend dans la liste

### Erreur de connexion
- Vérifier que le backend est accessible
- Vérifier les certificats SSL
- Vérifier les headers d'authentification

**🎉 Configuration terminée ! Votre frontend pointe maintenant vers le backend PythonAnywhere.**


