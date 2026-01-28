<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { API_BASE_URL } from '@/constants'
import { useNotification } from '@/types/useNotification'

definePageMeta({
  layout: "accueil",
});

const notif = useNotification()

useSeoMeta({
  title: 'Contactez Mura Storage - Support et Assistance | Groupe Mura',
  description: 'Contactez l\'équipe Mura Storage pour obtenir de l\'aide, des informations sur nos solutions de gestion de stock, support technique, questions commerciales. Support expert Groupe Mura disponible pour vous accompagner.',
  ogTitle: 'Contact Mura Storage - Support et Assistance',
  ogDescription: 'Contactez notre équipe Mura Storage pour obtenir de l\'aide et des informations sur nos solutions de gestion de stock. Support expert disponible.',
  ogType: 'website',
  ogUrl: 'https://murastorage.netlify.app/home/contact_accueil',
  ogImage: 'https://murastorage.netlify.app/img/og-image-MuraSrorage.png',
  keywords: 'contact Mura Storage, support gestion stock, assistance logiciel stock, aide Mura Storage, support technique stock, contact Groupe Mura, service client stock, support 24/7, assistance entreprise',
  robots: 'index, follow',
  canonical: 'https://murastorage.netlify.app/home/contact_accueil'
});

const form = ref({
  fullname: "",
  email: "",
  phone: "",
  company: "",
  subject: "",
  message: "",
});

const errors = ref({
  fullname: "",
  email: "",
  phone: "",
  company: "",
  subject: "",
  message: "",
});

const isLoading = ref(false);

const validateField = (fieldName: string, value: string) => {
  let isValid = true;

  switch (fieldName) {
    case "fullname":
      errors.value.fullname =
        value.trim().length < 2
          ? "Le nom doit comporter au moins 2 caractères."
          : "";
      isValid = !errors.value.fullname;
      break;
    case "email":
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      errors.value.email = !emailRegex.test(value)
        ? "Adresse email invalide."
        : "";
      isValid = !errors.value.email;
      break;
    case "phone":
      errors.value.phone = value.trim().length < 8
        ? "Le numéro de téléphone doit comporter au moins 8 caractères."
        : "";
      isValid = !errors.value.phone;
      break;
    case "company":
      errors.value.company = "";
      break;
    case "subject":
      errors.value.subject =
        value.trim().length < 3
          ? "Le sujet doit comporter au moins 3 caractères."
          : "";
      isValid = !errors.value.subject;
      break;
    case "message":
      errors.value.message =
        value.trim().length < 10
          ? "Le message doit comporter au moins 10 caractères."
          : "";
      isValid = !errors.value.message;
      break;
  }

  return isValid;
};

const handleInput = (fieldName: string) => {
  validateField(fieldName, (form.value as any)[fieldName]);
};

const submitForm = async () => {
  const fieldsToValidate = ["fullname", "email", "phone", "subject", "message"];

  const isValid = fieldsToValidate.every((field) =>
    validateField(field, (form.value as any)[field])
  );

  if (!isValid) {
    notif.error("Veuillez corriger les erreurs dans le formulaire.");
    return;
  }

  isLoading.value = true;

  try {
    // Envoyer les données au backend Django
    const response = await fetch(`${API_BASE_URL}/api/contact/submit/`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(form.value),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Erreur lors de l'envoi du message");
    }

    if (result.success) {
      notif.success(result.message);
      
      // Reset form
      form.value = {
        fullname: "",
        email: "",
        phone: "",
        company: "",
        subject: "",
        message: "",
      };
    } else {
      throw new Error(result.error || "Erreur lors de l'envoi du message");
    }
    
  } catch (error: any) {
    console.error("Erreur:", error);
    notif.error(error.message || "Une erreur est survenue lors de l'envoi. Veuillez réessayer.");
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
    <!-- Hero Section -->
    <section class="relative py-20 md:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <!-- Background decorations -->
      <div class="absolute inset-0">
        <div class="absolute top-20 left-10 w-72 h-72 bg-emerald-200/30 dark:bg-emerald-900/20 rounded-full blur-3xl"></div>
        <div class="absolute bottom-20 right-10 w-72 h-72 bg-blue-200/30 dark:bg-blue-900/20 rounded-full blur-3xl"></div>
      </div>
      
      <div class="relative max-w-7xl mx-auto">
        <div class="text-center mb-16">
          <span class="inline-flex items-center px-4 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-6">
            Support & Assistance
          </span>
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6">
            Contactez
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-blue-600">-nous</span>
          </h1>
          <p class="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Notre équipe d'experts est là pour vous accompagner dans votre transformation digitale. 
            Obtenez des réponses personnalisées à vos questions.
          </p>
        </div>

        <!-- Contact Info Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
            <div class="w-16 h-16 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon icon="mi:location" width="32" height="32" class="text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Adresse</h3>
            <p class="text-gray-600 dark:text-gray-300">Bamendzi 2, Bafoussam<br>Cameroun</p>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
            <div class="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon icon="line-md:phone-twotone" width="32" height="32" class="text-blue-600 dark:text-blue-400" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Téléphone</h3>
            <p class="text-gray-600 dark:text-gray-300">
              <a href="tel:+237658934147" class="text-blue-600 hover:text-blue-700 transition-colors">
                +237 658 934 147
              </a>
            </p>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
            <div class="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon icon="mi:email" width="32" height="32" class="text-purple-600 dark:text-purple-400" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Email</h3>
            <p class="text-gray-600 dark:text-gray-300">
              <a href="mailto:wilfriedtayou6@gmail.com" class="text-purple-600 hover:text-purple-700 transition-colors">
                wilfriedtayou6@gmail.com
              </a>
            </p>
          </div>
        </div>

        <!-- Contact Form Section -->
        <div class="max-w-6xl mx-auto">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <!-- Contact Form -->
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <div class="mb-8">
                <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Envoyez-nous un message
                </h2>
                <p class="text-gray-600 dark:text-gray-300">
                  Remplissez le formulaire ci-dessous et notre équipe vous répondra dans les plus brefs délais.
                </p>
              </div>

              <form @submit.prevent="submitForm" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label for="fullname" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      id="fullname"
                      v-model="form.fullname"
                      placeholder="Votre nom complet"
                      required
                      class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                      :class="{ 'border-red-500': errors.fullname }"
                      @input="handleInput('fullname')"
                    />
                    <p v-if="errors.fullname" class="text-red-500 text-sm mt-1">{{ errors.fullname }}</p>
                  </div>

                  <div>
                    <label for="email" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      v-model="form.email"
                      placeholder="votre@email.com"
                      required
                      class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                      :class="{ 'border-red-500': errors.email }"
                      @input="handleInput('email')"
                    />
                    <p v-if="errors.email" class="text-red-500 text-sm mt-1">{{ errors.email }}</p>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label for="phone" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      v-model="form.phone"
                      placeholder="+237 XXX XXX XXX"
                      required
                      class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                      :class="{ 'border-red-500': errors.phone }"
                      @input="handleInput('phone')"
                    />
                    <p v-if="errors.phone" class="text-red-500 text-sm mt-1">{{ errors.phone }}</p>
                  </div>

                  <div>
                    <label for="company" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Entreprise
                    </label>
                    <input
                      type="text"
                      id="company"
                      v-model="form.company"
                      placeholder="Nom de votre entreprise"
                      class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label for="subject" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Sujet *
                  </label>
                  <select
                    id="subject"
                    v-model="form.subject"
                    required
                    class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                    :class="{ 'border-red-500': errors.subject }"
                    @change="handleInput('subject')"
                  >
                    <option value="">Sélectionnez un sujet</option>
                    <option value="Demande d'informations">Demande d'informations</option>
                    <option value="Démo du produit">Démo du produit</option>
                    <option value="Support technique">Support technique</option>
                    <option value="Partenariat">Partenariat</option>
                    <option value="Tarification">Tarification</option>
                    <option value="Autre">Autre</option>
                  </select>
                  <p v-if="errors.subject" class="text-red-500 text-sm mt-1">{{ errors.subject }}</p>
                </div>

                <div>
                  <label for="message" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    v-model="form.message"
                    placeholder="Décrivez votre besoin ou votre question..."
                    required
                    rows="6"
                    class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors resize-none"
                    :class="{ 'border-red-500': errors.message }"
                    @input="handleInput('message')"
                  ></textarea>
                  <p v-if="errors.message" class="text-red-500 text-sm mt-1">{{ errors.message }}</p>
                </div>

                <button
                  type="submit"
                  :disabled="isLoading"
                  class="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-4 px-8 rounded-lg font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                >
                  <Icon v-if="isLoading" icon="line-md:loading-twotone-loop" width="24" height="24" class="mr-2" />
                  {{ isLoading ? 'Envoi en cours...' : 'Envoyer le message' }}
                </button>
              </form>
            </div>

            <!-- Contact Info & Trust Signals -->
            <div class="space-y-8">
              <!-- Why Contact Us -->
              <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Pourquoi nous contacter ?
                </h3>
                <div class="space-y-4">
                  <div class="flex items-start">
                    <div class="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mr-4 mt-1">
                      <Icon icon="material-symbols:check" width="16" height="16" class="text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h4 class="font-semibold text-gray-900 dark:text-white">Démo personnalisée</h4>
                      <p class="text-gray-600 dark:text-gray-300 text-sm">Découvrez Mura Storage adapté à vos besoins spécifiques</p>
                    </div>
                  </div>
                  <div class="flex items-start">
                    <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-4 mt-1">
                      <Icon icon="material-symbols:check" width="16" height="16" class="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 class="font-semibold text-gray-900 dark:text-white">Support expert</h4>
                      <p class="text-gray-600 dark:text-gray-300 text-sm">Accompagnement par nos spécialistes en gestion de stock</p>
                    </div>
                  </div>
                  <div class="flex items-start">
                    <div class="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mr-4 mt-1">
                      <Icon icon="material-symbols:check" width="16" height="16" class="text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h4 class="font-semibold text-gray-900 dark:text-white">Tarification sur mesure</h4>
                      <p class="text-gray-600 dark:text-gray-300 text-sm">Solutions adaptées à votre budget et vos besoins</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Response Time -->
              <div class="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-xl p-8 text-white">
                <div class="text-center">
                  <Icon icon="material-symbols:schedule" width="48" height="48" class="mx-auto mb-4 opacity-90" />
                  <h3 class="text-2xl font-bold mb-2">Réponse rapide</h3>
                  <p class="text-emerald-100 mb-4">Nous nous engageons à vous répondre dans les 24 heures</p>
                  <div class="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div class="text-2xl font-bold">24h</div>
                      <div class="text-sm text-emerald-100">Réponse email</div>
                    </div>
                    <div>
                      <div class="text-2xl font-bold">2h</div>
                      <div class="text-sm text-emerald-100">Support urgent</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Trust Signals -->
              <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Ils nous font confiance
                </h3>
                <div class="grid grid-cols-2 gap-4 text-center">
                  <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div class="text-2xl font-bold text-emerald-600">500+</div>
                    <div class="text-sm text-gray-600 dark:text-gray-300">Entreprises</div>
                  </div>
                  <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div class="text-2xl font-bold text-emerald-600">99.9%</div>
                    <div class="text-sm text-gray-600 dark:text-gray-300">Disponibilité</div>
                  </div>
                  <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div class="text-2xl font-bold text-emerald-600">24/7</div>
                    <div class="text-sm text-gray-600 dark:text-gray-300">Support</div>
                  </div>
                  <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div class="text-2xl font-bold text-emerald-600">5★</div>
                    <div class="text-sm text-gray-600 dark:text-gray-300">Satisfaction</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>