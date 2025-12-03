#!/usr/bin/env node

/**
 * Script pour nettoyer tous les caches du projet
 * Usage: node scripts/clean-cache.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');

// Dossiers et fichiers de cache à supprimer
const cachePaths = [
  '.nuxt',
  'dist',
  '.output',
  'node_modules/.cache',
  'node_modules/.vite',
  '.turbo',
  '.next',
  'coverage',
  '.nyc_output',
  '*.log',
  '.DS_Store',
];

// Fichiers de cache spécifiques
const cacheFiles = [
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  '.cache',
];

console.log('🧹 Nettoyage des caches...\n');

let deletedCount = 0;
let errorCount = 0;

function deletePath(targetPath) {
  const fullPath = path.join(projectRoot, targetPath);
  
  if (!fs.existsSync(fullPath)) {
    return false;
  }
  
  try {
    const stats = fs.statSync(fullPath);
    
    if (stats.isDirectory()) {
      fs.rmSync(fullPath, { recursive: true, force: true });
      console.log(`✅ Dossier supprimé: ${targetPath}`);
      return true;
    } else if (stats.isFile()) {
      fs.unlinkSync(fullPath);
      console.log(`✅ Fichier supprimé: ${targetPath}`);
      return true;
    }
  } catch (error) {
    console.error(`❌ Erreur lors de la suppression de ${targetPath}:`, error.message);
    errorCount++;
    return false;
  }
}

// Supprimer les dossiers de cache
cachePaths.forEach(cachePath => {
  if (deletePath(cachePath)) {
    deletedCount++;
  }
});

// Supprimer les fichiers de cache
cacheFiles.forEach(cacheFile => {
  if (deletePath(cacheFile)) {
    deletedCount++;
  }
});

// Nettoyer le cache du navigateur (localStorage simulé - instruction pour l'utilisateur)
console.log('\n📝 Instructions pour nettoyer le cache du navigateur:');
console.log('   1. Ouvrez les outils de développement (F12)');
console.log('   2. Allez dans l\'onglet "Application" (Chrome) ou "Stockage" (Firefox)');
console.log('   3. Cliquez sur "Local Storage" et supprimez les entrées');
console.log('   4. Cliquez sur "Session Storage" et supprimez les entrées');
console.log('   5. Rechargez la page avec Ctrl+Shift+R (ou Cmd+Shift+R sur Mac)');

// Nettoyer le cache de service worker si présent
const swPath = path.join(projectRoot, 'public', 'sw.js');
if (fs.existsSync(swPath)) {
  console.log('\n⚠️  Service Worker détecté. Assurez-vous de le désactiver si nécessaire.');
}

console.log(`\n✨ Nettoyage terminé!`);
console.log(`   - ${deletedCount} élément(s) supprimé(s)`);
if (errorCount > 0) {
  console.log(`   - ${errorCount} erreur(s) rencontrée(s)`);
}
console.log('\n💡 Pour une version complètement fraîche, exécutez:');
console.log('   npm run build');

