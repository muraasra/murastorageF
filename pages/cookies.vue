<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white rounded-lg shadow-md p-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">Politique des Cookies</h1>
        
        <div class="prose max-w-none">
          <h2>Qu'est-ce qu'un cookie ?</h2>
          <p>Un cookie est un petit fichier texte stocké sur votre ordinateur ou appareil mobile lorsque vous visitez notre site web.</p>
          
          <h2>Types de cookies utilisés</h2>
          <div class="space-y-4">
            <div class="bg-blue-50 p-4 rounded-lg">
              <h3 class="font-semibold text-blue-900">Cookies essentiels</h3>
              <p class="text-blue-700">Nécessaires au fonctionnement du site (authentification, sécurité)</p>
            </div>
            
            <div class="bg-green-50 p-4 rounded-lg">
              <h3 class="font-semibold text-green-900">Cookies de préférences</h3>
              <p class="text-green-700">Mémorisent vos choix (langue, thème, paramètres)</p>
            </div>
            
            <div class="bg-yellow-50 p-4 rounded-lg">
              <h3 class="font-semibold text-yellow-900">Cookies analytiques</h3>
              <p class="text-yellow-700">Nous aident à améliorer le site (statistiques anonymes)</p>
            </div>
          </div>
          
          <h2>Gestion des cookies</h2>
          <p>Vous pouvez accepter ou refuser les cookies non essentiels via les paramètres de votre navigateur.</p>
          
          <h2>Contact</h2>
          <p>Pour toute question sur notre utilisation des cookies : <a href="mailto:privacy@murastorage.com" class="text-blue-600 hover:text-blue-800">privacy@murastorage.com</a></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'public'
})
</script>


