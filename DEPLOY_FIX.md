# Fix pour l'erreur de déploiement Netlify

## Problème
Erreur `Cannot use 'import.meta' outside a module` lors du build sur Netlify.

## Cause
Conflit de versions entre `@nuxt/ui`, `@nuxtjs/tailwindcss` (dépendance transitive) et `@nuxt/kit` qui utilise `import.meta` dans un contexte CommonJS.

## Solutions appliquées

### 1. Mise à jour des versions
- **Nuxt** : `^3.14.159` → `^3.17.5` (version stable compatible)
- **@nuxt/ui** : `^2.19.2` → `^2.20.0` (dernière version)
- **tailwindcss** : `^3.4.14` → `^3.4.17` (dernière version)

### 2. Résolution de dépendances
Ajout de `overrides` dans `package.json` pour forcer une version compatible de `@nuxt/kit` :
```json
"overrides": {
  "@nuxt/kit": "^3.17.5"
}
```

### 3. Configuration de build
Ajout de `@nuxt/kit` dans `build.transpile` dans `nuxt.config.ts` pour forcer la transpilation :
```typescript
build: {
  transpile: ['@nuxt/ui', '@nuxt/kit']
}
```

## Commandes à exécuter avant le déploiement

```bash
cd Frontend
rm -rf node_modules package-lock.json
npm install
npm run generate
```

## Vérification locale

Avant de pousser sur Netlify, tester localement :
```bash
npm run generate
```

Si le build fonctionne localement, le déploiement Netlify devrait aussi fonctionner.

## Notes

- Les `overrides` dans `package.json` forcent npm à utiliser la version spécifiée de `@nuxt/kit` pour toutes les dépendances
- La transpilation de `@nuxt/kit` garantit que le code ESM est correctement transformé pour le build
- La mise à jour de Nuxt vers 3.17.5 assure la compatibilité avec les dernières versions des modules

