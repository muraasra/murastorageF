
<script setup lang="ts">
definePageMeta({
    layout: "accueil",
})
useSeoMeta({
  title: 'FAQ - Mura Storage',
  description: 'Questions fréquentes sur les offres, la sécurité, la facturation et l’essai gratuit de Mura Storage.'
});

const faqs = [
  {
    q: "Mura Storage propose-t-il un essai gratuit ?",
    a: "Oui. Essai gratuit de 14 jours sans carte bancaire. Annulez à tout moment depuis votre espace compte.",
  },
  {
    q: "Comment sont sécurisées mes données ?",
    a: "Chiffrement TLS en transit et AES‑256 au repos, sauvegardes répliquées, contrôle d’accès strict (Moindre privilège), journalisation et conformité RGPD.",
  },
  {
    q: "Quels moyens de paiement acceptez-vous ?",
    a: "Cartes bancaires, virement, Mobile Money (selon pays). Facturation mensuelle ou annuelle, sans engagement.",
  },
  {
    q: "Puis-je changer de plan à tout moment ?",
    a: "Oui, vous pouvez passer de Free à Basic/Premium/Organisation à tout moment. La facturation s’ajuste au prorata.",
  },
  {
    q: "Où sont hébergées les données ?",
    a: "Dans des datacenters conformes (hébergeurs certifiés). Nous appliquons des sauvegardes chiffrées et une surveillance continue.",
  },
  {
    q: "Quel est votre engagement de disponibilité ?",
    a: "Nous visons 99.9% d’uptime. Des maintenances programmées sont annoncées à l’avance.",
  },
  {
    q: "Offrez-vous un support ?",
    a: "Support email pour Free/Basic, support prioritaire pour Premium, et support dédié (SLA) pour Organisation.",
  },
  {
    q: "Mura Storage s’intègre-t-il avec mes outils ?",
    a: "Oui, intégrations ERP/e‑commerce et API. Contactez-nous pour vos connecteurs spécifiques.",
  },
]

const openIndex = ref<number | null>(0)
const toggle = (i: number) => {
  openIndex.value = openIndex.value === i ? null : i
}
</script>

<template>
  <div class="py-16 px-4 md:px-10 lg:px-20 bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
    <div class="text-center mb-12">
      <h1 class="text-4xl font-extrabold text-gray-900 dark:text-white">FAQ</h1>
      <p class="mt-3 text-lg text-gray-600 dark:text-gray-300">Tout ce qu’il faut savoir pour bien démarrer avec Mura Storage.</p>
    </div>

    <div class="max-w-3xl mx-auto space-y-4">
      <div v-for="(item, i) in faqs" :key="item.q" class="border dark:border-gray-700 rounded-xl overflow-hidden">
        <button @click="toggle(i)" class="w-full flex justify-between items-center p-5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">
          <span class="text-left font-semibold">{{ item.q }}</span>
          <svg :class="['w-5 h-5 transition-transform', openIndex === i ? 'rotate-45' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <div v-if="openIndex === i" class="p-5 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300">
          {{ item.a }}
        </div>
      </div>
    </div>

    <div class="text-center mt-12">
      <NuxtLink to="/home/inscription" class="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700">Commencer gratuitement</NuxtLink>
      <span class="mx-3 text-gray-500">ou</span>
      <NuxtLink to="/home/contact_accueil" class="px-6 py-3 border-2 border-emerald-600 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20">Parler à un expert</NuxtLink>
      <div class="mt-6 text-sm text-gray-500 dark:text-gray-400">Propulsé par Groupe Mura • +237 658 934 147 • support@murastorage.cm</div>
    </div>
  </div>
</template>