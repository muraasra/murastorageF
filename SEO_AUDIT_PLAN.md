# Plan d'Audit SEO & Optimisation Aperçus Sociaux

## 📋 Pages Prioritaires (Top 10)

### Pages Publiques (Indexables)
1. **/** (home/accueil.vue) - Page d'accueil principale
2. **/home/a_propos** - À propos / About
3. **/home/services** - Services
4. **/home/tarification** - Tarification / Pricing
5. **/home/contact_accueil** - Contact
6. **/home/faq** - FAQ
7. **/home/conditions** - Conditions d'utilisation
8. **/home/confidentialite** - Confidentialité
9. **/connexion** - Page de connexion (noindex)
10. **/home/inscription** - Page d'inscription

### Pages Privées (Noindex)
- `/dashboard`, `/admin`, `/superadmin`, `/user`
- `/facturation`, `/produits`, `/inventaire`, `/mouvements-stock`
- `/listes-factures`, `/partenaires`, `/stock_produit`
- Toutes les pages nécessitant authentification

## 🎯 Objectifs par Page

### 1. Balises SEO Essentielles
- ✅ Title unique (55-70 caractères)
- ✅ Meta description (150-160 caractères)
- ✅ Keywords pertinents
- ✅ Canonical URL

### 2. Open Graph & Twitter Cards
- ✅ og:title, og:description, og:image, og:url, og:type
- ✅ twitter:card, twitter:title, twitter:description, twitter:image
- ✅ Image OG accessible publiquement (1200x630px)

### 3. Structured Data (JSON-LD)
- ✅ Organization
- ✅ WebSite
- ✅ WebPage

### 4. Robots & Indexation
- ✅ Pages publiques : index, follow
- ✅ Pages privées : noindex, nofollow
- ✅ robots.txt mis à jour
- ✅ sitemap.xml mis à jour

## 📁 Structure des Fichiers

```
Frontend/
├── public/
│   ├── social/
│   │   ├── og-default.jpg (1200x630)
│   │   ├── og-home.jpg
│   │   ├── og-about.jpg
│   │   ├── og-services.jpg
│   │   ├── og-pricing.jpg
│   │   └── og-contact.jpg
│   ├── robots.txt
│   └── sitemap.xml
├── composables/
│   └── useSeo.ts (composable réutilisable)
└── pages/
    └── [chaque page avec useSeoMeta]
```

## 🔧 Outils de Test

1. **Facebook Debugger**: https://developers.facebook.com/tools/debug/
2. **Twitter Card Validator**: https://cards-dev.twitter.com/validator
3. **LinkedIn Post Inspector**: https://www.linkedin.com/post-inspector/
4. **Google Rich Results Test**: https://search.google.com/test/rich-results
5. **WhatsApp**: Partage direct du lien

## ✅ Checklist par Page

Pour chaque page :
- [ ] Title unique et optimisé
- [ ] Meta description unique
- [ ] OG tags complets
- [ ] Twitter Cards complets
- [ ] Image OG accessible (200 OK)
- [ ] Canonical URL
- [ ] JSON-LD structured data
- [ ] Robots meta (index/noindex)
- [ ] Test Facebook Debugger
- [ ] Test Twitter Validator
- [ ] Test LinkedIn Inspector
- [ ] Test WhatsApp

