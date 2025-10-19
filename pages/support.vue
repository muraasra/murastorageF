<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white rounded-lg shadow-md p-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">Support</h1>
        
        <div class="prose max-w-none">
          <h2>Comment pouvons-nous vous aider ?</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div class="bg-blue-50 p-6 rounded-lg">
              <h3 class="text-lg font-semibold text-blue-900 mb-3">📧 Contact par email</h3>
              <p class="text-blue-700 mb-4">Pour toute question technique ou demande d'assistance</p>
              <a href="mailto:support@murastorage.com" class="text-blue-600 hover:text-blue-800 font-medium">
                support@murastorage.com
              </a>
            </div>
            
            <div class="bg-green-50 p-6 rounded-lg">
              <h3 class="text-lg font-semibold text-green-900 mb-3">📞 Support téléphonique</h3>
              <p class="text-green-700 mb-4">Du lundi au vendredi, 9h-18h</p>
              <p class="text-green-600 font-medium">+237 6XX XX XX XX</p>
            </div>
          </div>
          
          <h3 class="mt-8">FAQ</h3>
          <div class="space-y-4 mt-4">
            <div class="border-l-4 border-blue-500 pl-4">
              <h4 class="font-semibold">Comment créer mon compte ?</h4>
              <p>Cliquez sur "Créer une entreprise" et suivez les étapes d'inscription.</p>
            </div>
            
            <div class="border-l-4 border-blue-500 pl-4">
              <h4 class="font-semibold">Comment importer mes produits ?</h4>
              <p>Utilisez la fonction d'import Excel dans la section Produits.</p>
            </div>
            
            <div class="border-l-4 border-blue-500 pl-4">
              <h4 class="font-semibold">Problème de connexion ?</h4>
              <p>Vérifiez vos identifiants et contactez-nous si le problème persiste.</p>
            </div>
          </div>
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



