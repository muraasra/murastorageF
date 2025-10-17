# Configuration Google Analytics pour Mura Storage

## 📊 Vue d'ensemble

Ce guide explique comment configurer et utiliser Google Analytics 4 (GA4) avec votre application Mura Storage.

## 🔧 Configuration initiale

### 1. Obtenir votre ID Google Analytics

1. Allez sur [Google Analytics](https://analytics.google.com/)
2. Créez une nouvelle propriété pour votre site
3. Copiez votre ID de mesure (format: `G-XXXXXXXXXX`)

### 2. Configuration dans le code

Modifiez le fichier `Frontend/constants/analytics.ts` :

```typescript
export const ANALYTICS_CONFIG = {
  // Remplacez par votre ID Google Analytics réel
  GA_ID: 'G-VOTRE_ID_ICI',
  
  // Google Search Console ID (déjà configuré)
  GSC_ID: '9artqrghm4Re-7Mtnpp73H61ynt3zNIncWDWGh96fuA',
  
  // Autres configurations...
}
```

## 🎯 Événements trackés

### Événements automatiques

- **Page views** : Chaque page visitée
- **Connexions** : Succès et échecs de connexion
- **Erreurs** : Erreurs d'API et exceptions

### Événements personnalisés

- **Gestion de stock** : Ajout, modification, suppression de produits
- **Facturation** : Création de factures, paiements
- **Abonnements** : Démarrage, mise à niveau, annulation
- **Performance** : Temps de chargement des pages et API

## 📈 Utilisation dans vos composants

### Exemple basique

```vue
<script setup>
import { useMuraTracking } from '@/composables/useMuraTracking'

const { trackProductView, trackStockUpdate } = useMuraTracking()

// Tracking d'une vue de produit
const viewProduct = (product) => {
  trackProductView(product.id, product.name, product.category)
}

// Tracking d'une mise à jour de stock
const updateStock = (productId, oldQty, newQty) => {
  trackStockUpdate(productId, oldQty, newQty, 'adjust')
}
</script>
```

### Exemple avancé avec performance

```vue
<script setup>
import { useMuraTracking } from '@/composables/useMuraTracking'

const { trackPageLoadTime, trackApiResponseTime } = useMuraTracking()

onMounted(() => {
  // Tracking du temps de chargement
  const startTime = performance.now()
  
  nextTick(() => {
    const loadTime = performance.now() - startTime
    trackPageLoadTime('Dashboard', loadTime)
  })
})

// Tracking des appels API
const callApi = async () => {
  const startTime = performance.now()
  
  try {
    const response = await fetch('/api/data')
    const responseTime = performance.now() - startTime
    
    trackApiResponseTime('/api/data', responseTime, response.status)
  } catch (error) {
    trackError('api_error', error.message, 'dashboard')
  }
}
</script>
```

## 🔍 Événements disponibles

### Navigation
- `trackHomePage()` - Page d'accueil
- `trackLoginPage()` - Page de connexion
- `trackDashboard(userRole)` - Tableau de bord

### Authentification
- `trackLoginSuccess(userRole, loginType)` - Connexion réussie
- `trackLoginError(errorType, errorMessage)` - Erreur de connexion
- `trackLogout(userRole)` - Déconnexion

### Gestion de stock
- `trackProductView(productId, productName, category)` - Vue de produit
- `trackStockUpdate(productId, oldQty, newQty, action)` - Mise à jour stock
- `trackStockTransfer(fromLocation, toLocation, productId, quantity)` - Transfert

### Facturation
- `trackInvoiceCreate(invoiceId, amount, currency)` - Création facture
- `trackPaymentSuccess(invoiceId, amount, paymentMethod)` - Paiement réussi

### Abonnements
- `trackSubscriptionStart(planName, price, currency)` - Démarrage abonnement
- `trackSubscriptionUpgrade(fromPlan, toPlan, priceDifference)` - Mise à niveau

### Performance
- `trackPageLoadTime(pageName, loadTime)` - Temps de chargement
- `trackApiResponseTime(endpoint, responseTime, statusCode)` - Temps de réponse API
- `trackError(errorType, errorMessage, page, additionalData)` - Erreurs

## 🚀 Déploiement

### Variables d'environnement

Créez un fichier `.env` avec :

```env
NUXT_PUBLIC_GA_ID=G-VOTRE_ID_ICI
NUXT_PUBLIC_GSC_ID=9artqrghm4Re-7Mtnpp73H61ynt3zNIncWDWGh96fuA
```

### Netlify

Ajoutez les variables d'environnement dans les paramètres Netlify :

1. Allez dans **Site settings** > **Environment variables**
2. Ajoutez `NUXT_PUBLIC_GA_ID` avec votre ID Google Analytics
3. Redéployez votre site

## 📊 Vérification

### Google Analytics

1. Allez sur [Google Analytics](https://analytics.google.com/)
2. Sélectionnez votre propriété
3. Vérifiez les **Événements en temps réel**

### Google Search Console

1. Allez sur [Google Search Console](https://search.google.com/search-console/)
2. Ajoutez votre propriété `murastorage.netlify.app`
3. Vérifiez avec le fichier HTML ou la balise meta

## 🔒 Confidentialité

- ✅ **RGPD compliant** : Pas de données personnelles trackées
- ✅ **Anonymisation** : IPs anonymisées automatiquement
- ✅ **Consentement** : Ajoutez un banner de cookies si nécessaire

## 🛠️ Dépannage

### Problèmes courants

1. **Événements non visibles** : Vérifiez que l'ID GA est correct
2. **Erreurs de build** : Vérifiez les imports dans les composables
3. **Données manquantes** : Attendez 24-48h pour les données complètes

### Debug

Activez le mode debug dans `analytics.ts` :

```typescript
gtag('config', measurementId, {
  debug_mode: process.env.NODE_ENV === 'development'
});
```

## 📚 Ressources

- [Google Analytics 4 Documentation](https://developers.google.com/analytics/devguides/collection/ga4)
- [Google Search Console](https://search.google.com/search-console/)
- [RGPD et Analytics](https://support.google.com/analytics/answer/9019185)
