<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white rounded-lg shadow-md p-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">Sécurité</h1>
        
        <div class="prose max-w-none">
          <h2>Protection de vos données</h2>
          <p>Nous prenons la sécurité de vos données très au sérieux et mettons en place les meilleures pratiques de sécurité.</p>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div class="bg-green-50 p-6 rounded-lg">
              <h3 class="text-lg font-semibold text-green-900 mb-3">🔒 Chiffrement SSL/TLS</h3>
              <p class="text-green-700">Toutes les communications sont chiffrées avec SSL/TLS 256-bit</p>
            </div>
            
            <div class="bg-blue-50 p-6 rounded-lg">
              <h3 class="text-lg font-semibold text-blue-900 mb-3">🛡️ Authentification sécurisée</h3>
              <p class="text-blue-700">Système d'authentification JWT avec tokens sécurisés</p>
            </div>
            
            <div class="bg-purple-50 p-6 rounded-lg">
              <h3 class="text-lg font-semibold text-purple-900 mb-3">🔐 Sauvegarde régulière</h3>
              <p class="text-purple-700">Sauvegardes automatiques quotidiennes de vos données</p>
            </div>
            
            <div class="bg-orange-50 p-6 rounded-lg">
              <h3 class="text-lg font-semibold text-orange-900 mb-3">👥 Contrôle d'accès</h3>
              <p class="text-orange-700">Gestion fine des permissions utilisateur</p>
            </div>
          </div>
          
          <h2>Bonnes pratiques recommandées</h2>
          <ul class="list-disc pl-6 space-y-2">
            <li>Utilisez un mot de passe fort et unique</li>
            <li>Activez l'authentification à deux facteurs si disponible</li>
            <li>Ne partagez jamais vos identifiants de connexion</li>
            <li>Déconnectez-vous après chaque session</li>
            <li>Signalez immédiatement toute activité suspecte</li>
          </ul>
          
          <h2>Signalement d'incidents</h2>
          <p>En cas de problème de sécurité : <a href="mailto:security@murastorage.com" class="text-red-600 hover:text-red-800 font-medium">security@murastorage.com</a></p>
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
