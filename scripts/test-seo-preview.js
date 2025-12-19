#!/usr/bin/env node

/**
 * Script pour tester l'accessibilité des images OG et valider les meta tags
 * Usage: node scripts/test-seo-preview.js
 */

import https from 'https';
import http from 'http';

const SITE_URL = 'https://murastorage.netlify.app';
const IMAGES_TO_TEST = [
  '/img/og-image-MuraSrorage.png',
  '/img/og-image-MuraSrorage.svg',
];

const PAGES_TO_TEST = [
  { path: '/', name: 'Accueil' },
  { path: '/home/accueil', name: 'Accueil (home)' },
  { path: '/home/a_propos', name: 'À propos' },
  { path: '/home/services', name: 'Services' },
  { path: '/home/tarification', name: 'Tarification' },
  { path: '/home/contact_accueil', name: 'Contact' },
  { path: '/home/faq', name: 'FAQ' },
  { path: '/home/inscription', name: 'Inscription' },
  { path: '/home/conditions', name: 'Conditions' },
  { path: '/home/confidentialite', name: 'Confidentialité' },
];

function checkUrl(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, (res) => {
      resolve({
        url,
        status: res.statusCode,
        headers: res.headers,
        success: res.statusCode === 200
      });
    });

    req.on('error', (err) => {
      resolve({
        url,
        status: 0,
        error: err.message,
        success: false
      });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        url,
        status: 0,
        error: 'Timeout',
        success: false
      });
    });
  });
}

async function testImages() {
  console.log('🖼️  Test des images OG...\n');
  
  for (const imagePath of IMAGES_TO_TEST) {
    const fullUrl = `${SITE_URL}${imagePath}`;
    const result = await checkUrl(fullUrl);
    
    if (result.success) {
      console.log(`✅ ${imagePath}`);
      console.log(`   Status: ${result.status}`);
      console.log(`   Content-Type: ${result.headers['content-type']}`);
      console.log(`   Size: ${result.headers['content-length'] || 'Unknown'} bytes\n`);
    } else {
      console.log(`❌ ${imagePath}`);
      console.log(`   Status: ${result.status || 'Error'}`);
      console.log(`   Error: ${result.error || 'Unknown'}\n`);
    }
  }
}

async function testPages() {
  console.log('📄 Test des pages...\n');
  
  for (const page of PAGES_TO_TEST) {
    const fullUrl = `${SITE_URL}${page.path}`;
    const result = await checkUrl(fullUrl);
    
    if (result.success) {
      console.log(`✅ ${page.name} (${page.path})`);
      console.log(`   Status: ${result.status}\n`);
    } else {
      console.log(`❌ ${page.name} (${page.path})`);
      console.log(`   Status: ${result.status || 'Error'}`);
      console.log(`   Error: ${result.error || 'Unknown'}\n`);
    }
  }
}

async function main() {
  console.log('🔍 Test SEO & Accessibilité des Ressources\n');
  console.log('='.repeat(50) + '\n');
  
  await testImages();
  await testPages();
  
  console.log('='.repeat(50));
  console.log('\n📝 Prochaines étapes:');
  console.log('1. Tester avec Facebook Debugger: https://developers.facebook.com/tools/debug/');
  console.log('2. Tester avec Twitter Card Validator: https://cards-dev.twitter.com/validator');
  console.log('3. Tester avec LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/');
  console.log('4. Tester avec Google Rich Results: https://search.google.com/test/rich-results');
  console.log('5. Tester le partage WhatsApp directement\n');
}

main().catch(console.error);



