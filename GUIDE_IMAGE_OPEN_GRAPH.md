# Guide pour créer l'image Open Graph de Mura Storage

## Spécifications de l'image Open Graph

L'image Open Graph est utilisée pour l'aperçu du site sur les réseaux sociaux (Facebook, Twitter, LinkedIn, etc.) et dans les résultats de recherche Google.

### Dimensions recommandées
- **Taille** : 1200 x 630 pixels (ratio 1.91:1)
- **Format** : PNG ou JPG
- **Poids** : < 1 MB (idéalement < 300 KB)
- **Nom du fichier** : `og-image-MuraSrorage.png`
- **Emplacement** : `Frontend/public/img/og-image-MuraSrorage.png`

### Contenu suggéré pour l'image

L'image devrait contenir :
1. **Logo Mura Storage** (centré ou en haut à gauche)
2. **Titre** : "Mura Storage" (grand, lisible)
3. **Sous-titre** : "Gestion de Stock Professionnelle" ou "par Groupe Mura"
4. **Couleurs** : 
   - Vert émeraude (#10B981) et bleu (#3B82F6) pour correspondre au design du site
   - Fond : dégradé ou couleur unie claire
5. **Éléments visuels** : Icônes de stock, entrepôt, ou graphiques simples
6. **Texte** : "Essai gratuit 14 jours" (optionnel)

### Outils pour créer l'image

1. **Canva** (https://www.canva.com/)
   - Template "Open Graph Image" (1200x630)
   - Ajouter logo, texte, couleurs

2. **Figma** (https://www.figma.com/)
   - Créer un frame 1200x630
   - Designer l'image avec les éléments du brand

3. **Photoshop / GIMP**
   - Créer un nouveau document 1200x630px
   - Designer l'image

4. **Outils en ligne** :
   - https://www.bannerbear.com/
   - https://og-image.vercel.app/

### Exemple de structure visuelle

```
┌─────────────────────────────────────────────┐
│                                             │
│         [Logo Mura Storage]                 │
│                                             │
│         MURA STORAGE                        │
│         Gestion de Stock Professionnelle    │
│         par Groupe Mura                     │
│                                             │
│         [Icône entrepôt/stock]             │
│                                             │
│         Essai gratuit 14 jours              │
│                                             │
└─────────────────────────────────────────────┘
```

### Vérification

Une fois l'image créée :
1. Placer le fichier dans `Frontend/public/img/og-image-MuraSrorage.png`
2. Tester avec :
   - Facebook Debugger : https://developers.facebook.com/tools/debug/
   - Twitter Card Validator : https://cards-dev.twitter.com/validator
   - LinkedIn Post Inspector : https://www.linkedin.com/post-inspector/

### Note importante

L'image est actuellement référencée dans :
- `Frontend/nuxt.config.ts`
- `Frontend/pages/home/accueil.vue`
- Toutes les autres pages publiques

Une fois l'image créée et placée au bon endroit, elle sera automatiquement utilisée pour tous les partages sociaux.




