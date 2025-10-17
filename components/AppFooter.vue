<template>
    <footer class="pt-8 border-t dark:border-t-gray-600 border-r-gray-200">
      <AtomsContainer class-name="pb-10">
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 gap-y-10 text-center md:text-left">
          <div class="text-center col-span-2 md:col-span-4 lg:col-span-2">
            <NuxtLink href="/" class="text-3xl text-center font-extrabold text-emerald-500"
              >Sto<span class="text-gray-800 dark:text-white">Rage</span></NuxtLink
            >
            <p class="text-gray-600 text-center dark:text-gray-300 pt-4 leading-relaxed max-w-sm mx-auto md:mx-0">
              Chez <span class="text-emerald-500 font-semibold">StoRage</span>, nous croyons que chaque entreprise mérite une gestion de stockage de qualité.
            </p>
          </div>
  
          <FooterNavBlock title="Entreprise" :links="quickLinks" />
          <FooterNavBlock title="Ressources" :links="ressourcesLinks" />
          <FooterNavBlock title="Support" :links="supportLinks" />
          <FooterNavBlock title="Services" :links="quickLinks" />
        </div>
      </AtomsContainer>
  
      <div class="py-4 mt-6 bg-gray-200 dark:bg-gray-900">
        <AtomsContainer>
          <div class="flex mx-auto text-center flex-col md:flex-row justify-between items-center gap-4 text-gray-600 dark:text-gray-300">
            <div class="text-center mx-auto">
              &copy; 2025 Tous droits réservés. Conçu par
              <NuxtLink
                target="_blank"
                to="https://durelmaevaranelle.com"
                class="font-bold text-emerald-500 hover:underline"
                >durel-maeva-rannelle-tayou</NuxtLink
              >
            </div>
  
            <!-- Réseaux sociaux -->
            <div class="flex items-center justify-center gap-4">
              <NuxtLink target="_blank" to="#" class="hover:scale-110 transition-transform">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 48 48"
                  class="fill-emerald-500 hover:fill-emerald-400 transition-colors"
                >
                  <path
                    d="M42,37c0,2.762-2.238,5-5,5H11c-2.761,0-5-2.238-5-5V11c0-2.762,2.239-5,5-5h26c2.762,0,5,2.238,5,5V37z"
                  ></path>
                  <path
                    fill="#FFF"
                    d="M12 19H17V36H12zM14.5 17c-1.5 0-2.5-1.1-2.5-2.5s1-2.5 2.5-2.5 2.5 1.1 2.5 2.5S16 17 14.5 17zM36 36h-5v-9c0-2.2-1.2-4-3.2-4-1.5 0-2.3 1-2.7 2 0 0.5 0 1.5 0 2v9h-5V19h5v2c0.8-1.2 2-2 4-2 3.6 0 6 2.2 6 7V36z"
                  ></path>
                </svg>
              </NuxtLink>
  
              <NuxtLink target="_blank" to="#" class="hover:scale-110 transition-transform">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 48 48"
                  class="fill-emerald-500 hover:fill-emerald-400 transition-colors"
                >
                  <path d="M24 5A19 19 0 1 0 24 43A19 19 0 1 0 24 5Z"></path>
                  <path
                    fill="#fff"
                    d="M26.6,29h5l1-5h-6v-3c0-2,1-4,3-4h3v-4c-0.5,0-2-0.2-4-0.2c-4.6,0-7.3,2.4-7.3,8v3h-5v5h5v14c1,0,2,0,3,0s2,0,3,0V29z"
                  ></path>
                </svg>
              </NuxtLink>
            </div>
          </div>
        </AtomsContainer>
      </div>
    </footer>
  </template>
  
  <script setup lang="ts">
  import FooterNavBlock from '~/components/blocks/FooterNavBlock.vue';
  
  const quickLinks = [
    { href: "/home/about", text: "À Propos" },
    { href: "/home/services", text: "Services" }
  ];
  
  const ressourcesLinks = [
    { href: "/home/tarification", text: "Prix" },
    { href: "/home/faq", text: "FAQ" }
  ];
  
  const supportLinks = [
    { href: "/home/contact_accueil", text: "Contactez-nous" },
    { href: "/home/quote", text: "Obtenir un devis" }
  ];
  </script>
  
  <style scoped>
  footer a:hover {
    color: #10b981; /* Vert émeraude */
  }
  
  svg {
    transition: transform 0.3s ease;
  }
  
  svg:hover {
    transform: scale(1.1);
  }
  </style>