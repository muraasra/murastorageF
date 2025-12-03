/**
 * Script pour convertir le SVG Open Graph en PNG
 * Utilise sharp si disponible, sinon donne des instructions
 * 
 * Exécution :
 * node scripts/convert-svg-to-png.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const svgPath = path.join(__dirname, '../public/img/og-image-MuraSrorage.svg');
const pngPath = path.join(__dirname, '../public/img/og-image-MuraSrorage.png');

// Essayer d'utiliser sharp
let sharp;
try {
  sharp = (await import('sharp')).default;
} catch (e) {
  console.log('⚠️  Sharp n\'est pas installé. Installation...');
  console.log('   npm install sharp --save-dev');
  console.log('\n💡 Alternative: Utilisez un outil en ligne pour convertir le SVG en PNG:');
  console.log('   https://svgtopng.com/');
  console.log('   https://convertio.co/svg-png/');
  console.log('\n📁 Fichier SVG disponible à:');
  console.log(`   ${svgPath}`);
  process.exit(0);
}

try {
  // Lire le SVG
  const svgBuffer = fs.readFileSync(svgPath);
  
  // Convertir en PNG avec sharp
  await sharp(svgBuffer)
    .resize(1200, 630)
    .png()
    .toFile(pngPath);
  
  const stats = fs.statSync(pngPath);
  console.log('\n✅ Image PNG générée avec succès !');
  console.log(`📁 Emplacement: ${pngPath}`);
  console.log(`💾 Taille: ${(stats.size / 1024).toFixed(2)} KB`);
  console.log('\n✨ L\'image Open Graph est prête à être utilisée !\n');
} catch (error) {
  console.error('❌ Erreur lors de la conversion:', error.message);
  console.log('\n💡 Alternative: Utilisez un outil en ligne pour convertir le SVG en PNG');
  console.log('   https://svgtopng.com/');
  process.exit(1);
}




