/**
 * Script pour générer automatiquement l'image Open Graph de Mura Storage
 * Utilise node-canvas pour créer une image 1200x630px
 * 
 * Installation des dépendances :
 * npm install canvas --save-dev
 * 
 * Exécution :
 * npm run generate:og
 * ou
 * node scripts/generate-og-image.js
 */

const fs = require('fs');
const path = require('path');

// Vérifier si canvas est disponible
let Canvas;
try {
  Canvas = require('canvas');
} catch (e) {
  console.error('❌ Erreur: Le module "canvas" n\'est pas installé.');
  console.log('📦 Installation: npm install canvas --save-dev');
  process.exit(1);
}

// Configuration
const width = 1200;
const height = 630;
const outputDir = path.join(__dirname, '../public/img');
const outputPath = path.join(outputDir, 'og-image-MuraSrorage.png');

// Créer le dossier si nécessaire
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Créer le canvas
const canvas = Canvas.createCanvas(width, height);
const ctx = canvas.getContext('2d');

// Couleurs du thème Mura Storage
const colors = {
  emerald: '#10B981',
  emeraldLight: '#34D399',
  emeraldDark: '#059669',
  blue: '#3B82F6',
  blueLight: '#60A5FA',
  blueDark: '#2563EB',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray800: '#1F2937',
  gray900: '#111827'
};

// Fonction pour dessiner un dégradé
function drawGradient(x1, y1, x2, y2, color1, color2) {
  const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  return gradient;
}

// 1. Fond avec dégradé (vert émeraude vers bleu)
const bgGradient = drawGradient(0, 0, width, height, colors.emerald, colors.blue);
ctx.fillStyle = bgGradient;
ctx.fillRect(0, 0, width, height);

// 2. Formes décoratives en arrière-plan (cercles)
ctx.globalAlpha = 0.15;
ctx.fillStyle = colors.white;
// Grand cercle en haut à droite
ctx.beginPath();
ctx.arc(width - 150, 150, 200, 0, Math.PI * 2);
ctx.fill();
// Cercle moyen en bas à gauche
ctx.beginPath();
ctx.arc(150, height - 150, 150, 0, Math.PI * 2);
ctx.fill();
// Petit cercle au centre
ctx.beginPath();
ctx.arc(width / 2, height / 2, 100, 0, Math.PI * 2);
ctx.fill();
ctx.globalAlpha = 1;

// 3. Logo/Icone (carré avec dégradé et initiales MS)
const logoSize = 140;
const logoX = 80;
const logoY = (height - logoSize) / 2;
const logoGradient = drawGradient(logoX, logoY, logoX + logoSize, logoY + logoSize, colors.emeraldLight, colors.blueLight);
ctx.fillStyle = logoGradient;
ctx.fillRect(logoX, logoY, logoSize, logoSize);
// Bordure blanche
ctx.strokeStyle = colors.white;
ctx.lineWidth = 4;
ctx.strokeRect(logoX, logoY, logoSize, logoSize);
// Initiales MS
ctx.fillStyle = colors.white;
ctx.font = 'bold 70px Arial';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('MS', logoX + logoSize / 2, logoY + logoSize / 2);

// 4. Texte principal "MURA"
ctx.fillStyle = colors.white;
ctx.font = 'bold 80px Arial';
ctx.textAlign = 'left';
ctx.textBaseline = 'top';
const titleX = logoX + logoSize + 50;
const titleY = height / 2 - 120;
ctx.fillText('MURA', titleX, titleY);

// 5. Sous-titre "STORAGE" avec couleur différente
ctx.fillStyle = colors.emeraldLight;
ctx.font = 'bold 80px Arial';
ctx.fillText('STORAGE', titleX, titleY + 90);

// 6. Description principale
ctx.fillStyle = colors.white;
ctx.font = 'normal 38px Arial';
ctx.fillText('Gestion de Stock Professionnelle', titleX, titleY + 200);

// 7. "par Groupe Mura"
ctx.fillStyle = colors.gray100;
ctx.font = 'normal 30px Arial';
ctx.fillText('par Groupe Mura', titleX, titleY + 260);

// 8. Badge "Essai gratuit 14 jours"
const badgeY = height - 100;
const badgeX = titleX;
const badgeWidth = 450;
const badgeHeight = 70;
// Fond du badge avec transparence
ctx.fillStyle = colors.white;
ctx.globalAlpha = 0.25;
ctx.fillRect(badgeX, badgeY, badgeWidth, badgeHeight);
ctx.globalAlpha = 1;
// Bordure du badge
ctx.strokeStyle = colors.white;
ctx.lineWidth = 3;
ctx.strokeRect(badgeX, badgeY, badgeWidth, badgeHeight);
// Texte du badge
ctx.fillStyle = colors.white;
ctx.font = 'bold 28px Arial';
ctx.textAlign = 'center';
ctx.fillText('✓ Essai gratuit 14 jours', badgeX + badgeWidth / 2, badgeY + badgeHeight / 2 + 10);

// 9. Icônes décoratives (formes simples représentant stock/entrepôt)
ctx.fillStyle = colors.white;
ctx.globalAlpha = 0.4;
// Boîte/entrepôt principal (en haut à droite)
const boxX = width - 280;
const boxY = 180;
ctx.fillRect(boxX, boxY, 100, 70);
ctx.fillRect(boxX, boxY, 100, 25); // Toit
// Boîtes empilées
ctx.fillRect(boxX + 120, boxY + 20, 60, 50);
ctx.fillRect(boxX + 120, boxY + 20, 60, 15); // Toit
// Flèche vers le bas (transfert)
ctx.beginPath();
ctx.moveTo(boxX + 50, boxY + 100);
ctx.lineTo(boxX + 70, boxY + 120);
ctx.lineTo(boxX + 30, boxY + 120);
ctx.closePath();
ctx.fill();
ctx.globalAlpha = 1;

// 10. Ligne décorative en bas
ctx.strokeStyle = colors.emeraldLight;
ctx.lineWidth = 5;
ctx.beginPath();
ctx.moveTo(titleX, height - 50);
ctx.lineTo(titleX + 600, height - 50);
ctx.stroke();

// 11. Points décoratifs
ctx.fillStyle = colors.white;
ctx.globalAlpha = 0.6;
for (let i = 0; i < 5; i++) {
  ctx.beginPath();
  ctx.arc(titleX + i * 120, height - 50, 4, 0, Math.PI * 2);
  ctx.fill();
}
ctx.globalAlpha = 1;

// Sauvegarder l'image
try {
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  
  console.log('\n✅ Image Open Graph générée avec succès !');
  console.log(`📁 Emplacement: ${outputPath}`);
  console.log(`📐 Dimensions: ${width}x${height}px`);
  console.log(`💾 Taille: ${(buffer.length / 1024).toFixed(2)} KB`);
  console.log('\n🎨 L\'image contient:');
  console.log('   - Logo MS avec dégradé');
  console.log('   - Titre "MURA STORAGE"');
  console.log('   - Description professionnelle');
  console.log('   - Badge "Essai gratuit 14 jours"');
  console.log('   - Éléments décoratifs');
  console.log('\n✨ L\'image est prête à être utilisée pour les réseaux sociaux !\n');
} catch (error) {
  console.error('❌ Erreur lors de la génération de l\'image:', error);
  process.exit(1);
}
