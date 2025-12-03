/**
 * Script pour générer automatiquement l'image Open Graph de Mura Storage (SVG)
 * Génère un SVG qui peut être utilisé directement ou converti en PNG
 * 
 * Exécution :
 * node scripts/generate-og-image-svg.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const width = 1200;
const height = 630;
const outputDir = path.join(__dirname, '../public/img');
const outputPath = path.join(outputDir, 'og-image-MuraSrorage.svg');

// Créer le dossier si nécessaire
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Couleurs du thème Mura Storage
const colors = {
  emerald: '#10B981',
  emeraldLight: '#34D399',
  emeraldDark: '#059669',
  blue: '#3B82F6',
  blueLight: '#60A5FA',
  blueDark: '#2563EB',
  white: '#FFFFFF',
  gray100: '#F3F4F6'
};

// Générer le SVG
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Dégradé de fond -->
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.emerald};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${colors.blue};stop-opacity:1" />
    </linearGradient>
    
    <!-- Dégradé pour le logo -->
    <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.emeraldLight};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${colors.blueLight};stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Fond avec dégradé -->
  <rect width="${width}" height="${height}" fill="url(#bgGradient)"/>
  
  <!-- Cercles décoratifs en arrière-plan -->
  <circle cx="${width - 150}" cy="150" r="200" fill="${colors.white}" opacity="0.15"/>
  <circle cx="150" cy="${height - 150}" r="150" fill="${colors.white}" opacity="0.15"/>
  <circle cx="${width / 2}" cy="${height / 2}" r="100" fill="${colors.white}" opacity="0.15"/>
  
  <!-- Logo (carré avec initiales MS) -->
  <rect x="80" y="${(height - 140) / 2}" width="140" height="140" fill="url(#logoGradient)" stroke="${colors.white}" stroke-width="4" rx="8"/>
  <text x="150" y="${height / 2 + 10}" font-family="Arial, sans-serif" font-size="70" font-weight="bold" fill="${colors.white}" text-anchor="middle" dominant-baseline="middle">MS</text>
  
  <!-- Titre MURA -->
  <text x="270" y="${height / 2 - 120}" font-family="Arial, sans-serif" font-size="80" font-weight="bold" fill="${colors.white}">MURA</text>
  
  <!-- Titre STORAGE -->
  <text x="270" y="${height / 2 - 30}" font-family="Arial, sans-serif" font-size="80" font-weight="bold" fill="${colors.emeraldLight}">STORAGE</text>
  
  <!-- Description -->
  <text x="270" y="${height / 2 + 80}" font-family="Arial, sans-serif" font-size="38" fill="${colors.white}">Gestion de Stock Professionnelle</text>
  
  <!-- Par Groupe Mura -->
  <text x="270" y="${height / 2 + 140}" font-family="Arial, sans-serif" font-size="30" fill="${colors.gray100}">par Groupe Mura</text>
  
  <!-- Badge "Essai gratuit" -->
  <rect x="270" y="${height - 100}" width="450" height="70" fill="${colors.white}" fill-opacity="0.25" stroke="${colors.white}" stroke-width="3" rx="8"/>
  <text x="495" y="${height - 65}" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="${colors.white}" text-anchor="middle" dominant-baseline="middle">✓ Essai gratuit 14 jours</text>
  
  <!-- Icônes décoratives (entrepôt/stock) -->
  <g opacity="0.4">
    <!-- Boîte principale -->
    <rect x="${width - 280}" y="180" width="100" height="70" fill="${colors.white}"/>
    <rect x="${width - 280}" y="180" width="100" height="25" fill="${colors.white}"/>
    <!-- Boîte secondaire -->
    <rect x="${width - 160}" y="200" width="60" height="50" fill="${colors.white}"/>
    <rect x="${width - 160}" y="200" width="60" height="15" fill="${colors.white}"/>
    <!-- Flèche -->
    <path d="M ${width - 230} ${180 + 100} L ${width - 210} ${180 + 120} L ${width - 190} ${180 + 100} Z" fill="${colors.white}"/>
  </g>
  
  <!-- Ligne décorative -->
  <line x1="270" y1="${height - 50}" x2="870" y2="${height - 50}" stroke="${colors.emeraldLight}" stroke-width="5"/>
  
  <!-- Points décoratifs -->
  <g fill="${colors.white}" opacity="0.6">
    <circle cx="270" cy="${height - 50}" r="4"/>
    <circle cx="390" cy="${height - 50}" r="4"/>
    <circle cx="510" cy="${height - 50}" r="4"/>
    <circle cx="630" cy="${height - 50}" r="4"/>
    <circle cx="750" cy="${height - 50}" r="4"/>
  </g>
</svg>`;

// Sauvegarder le SVG
try {
  fs.writeFileSync(outputPath, svg, 'utf8');
  console.log('\n✅ Image Open Graph SVG générée avec succès !');
  console.log(`📁 Emplacement: ${outputPath}`);
  console.log(`📐 Dimensions: ${width}x${height}px`);
  console.log(`💾 Taille: ${(svg.length / 1024).toFixed(2)} KB`);
  console.log('\n🎨 L\'image contient:');
  console.log('   - Logo MS avec dégradé');
  console.log('   - Titre "MURA STORAGE"');
  console.log('   - Description professionnelle');
  console.log('   - Badge "Essai gratuit 14 jours"');
  console.log('   - Éléments décoratifs');
  console.log('\n💡 Note: Le SVG peut être utilisé directement ou converti en PNG');
  console.log('   Pour convertir en PNG, vous pouvez utiliser:');
  console.log('   - Un outil en ligne (https://svgtopng.com/)');
  console.log('   - ImageMagick: magick convert og-image-MuraSrorage.svg og-image-MuraSrorage.png');
  console.log('   - Inkscape: inkscape og-image-MuraSrorage.svg --export-filename=og-image-MuraSrorage.png\n');
} catch (error) {
  console.error('❌ Erreur lors de la génération de l\'image:', error);
  process.exit(1);
}

