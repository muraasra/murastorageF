#!/bin/bash
# Script de test de charge pour le frontend Nuxt

echo "🚀 Test de charge - Frontend Nuxt"
echo "================================="

# Vérifier que le serveur Nuxt est démarré
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ Le serveur Nuxt n'est pas démarré sur http://localhost:3000"
    echo "   Démarrez le serveur avec: npm run dev"
    exit 1
fi

# Vérifier que le serveur Django est démarré
if ! curl -s http://127.0.0.1:8000/api/ > /dev/null; then
    echo "❌ Le serveur Django n'est pas démarré sur http://127.0.0.1:8000"
    echo "   Démarrez le serveur avec: python manage.py runserver"
    exit 1
fi

echo "✅ Serveurs détectés"

# Installer les dépendances si nécessaire
if ! node -e "require('puppeteer')" 2>/dev/null; then
    echo "📦 Installation des dépendances..."
    npm install puppeteer
fi

# Lancer le test de charge
echo "🏃 Lancement du test de charge frontend..."
node test/load_test_frontend.js

echo "✅ Test terminé"
