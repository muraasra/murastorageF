#!/usr/bin/env node

/**
 * Script pour identifier les fichiers potentiellement inutiles
 * Usage: node scripts/cleanup-unused-files.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');

// Patterns de fichiers potentiellement inutiles
const unusedPatterns = [
  /copy\.vue$/i,
  /\.bak$/i,
  /\.old$/i,
  /\.tmp$/i,
  /\.backup$/i,
  /~$/,
  /\.orig$/i,
];

// Dossiers à ignorer
const ignoreDirs = [
  'node_modules',
  '.git',
  '.nuxt',
  'dist',
  '.output',
];

function findUnusedFiles(dir, results = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(projectRoot, fullPath);
    
    // Ignorer certains dossiers
    if (ignoreDirs.some(ignore => relativePath.includes(ignore))) {
      continue;
    }
    
    if (entry.isDirectory()) {
      findUnusedFiles(fullPath, results);
    } else if (entry.isFile()) {
      // Vérifier si le fichier correspond à un pattern inutile
      const isUnused = unusedPatterns.some(pattern => pattern.test(entry.name));
      if (isUnused) {
        results.push(relativePath);
      }
    }
  }
  
  return results;
}

console.log('🔍 Recherche de fichiers potentiellement inutiles...\n');

const unusedFiles = findUnusedFiles(projectRoot);

if (unusedFiles.length === 0) {
  console.log('✅ Aucun fichier inutile trouvé!\n');
} else {
  console.log(`⚠️  ${unusedFiles.length} fichier(s) potentiellement inutile(s) trouvé(s):\n`);
  unusedFiles.forEach(file => {
    console.log(`   - ${file}`);
  });
  console.log('\n💡 Vérifiez manuellement ces fichiers avant de les supprimer.');
}

console.log('\n📝 Autres vérifications recommandées:');
console.log('   1. Vérifier les imports non utilisés dans les fichiers .vue et .ts');
console.log('   2. Vérifier les dépendances non utilisées dans package.json');
console.log('   3. Vérifier les composants non utilisés dans components/');
console.log('   4. Vérifier les pages non référencées dans pages/');

