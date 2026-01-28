<template>
  <div class="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
    <!-- Animated Background Elements -->
    <div class="absolute inset-0 overflow-hidden">
      <!-- Grid Pattern -->
      <div class="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.05)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      
      <!-- Animated Gradient Orbs -->
      <div class="absolute top-0 -left-40 w-80 h-80 bg-emerald-500/20 dark:bg-emerald-500/30 rounded-full blur-3xl animate-blob"></div>
      <div class="absolute top-1/2 -right-40 w-96 h-96 bg-blue-500/15 dark:bg-blue-500/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
      <div class="absolute -bottom-40 left-1/2 w-80 h-80 bg-purple-500/15 dark:bg-purple-500/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      
      <!-- Floating Particles -->
      <div v-for="i in 20" :key="i" 
        class="absolute w-1 h-1 bg-emerald-500/30 dark:bg-emerald-400/40 rounded-full animate-float-random"
        :style="{ 
          left: `${Math.random() * 100}%`, 
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 5}s`,
          animationDuration: `${3 + Math.random() * 4}s`
        }"
      ></div>
      
      <!-- Animated Lines -->
      <svg class="absolute inset-0 w-full h-full opacity-10 dark:opacity-20" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#10B981;stop-opacity:0" />
            <stop offset="50%" style="stop-color:#10B981;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#10B981;stop-opacity:0" />
          </linearGradient>
        </defs>
        <line x1="0" y1="100%" x2="100%" y2="0" stroke="url(#line-gradient)" stroke-width="1" class="animate-draw-line" />
        <line x1="0" y1="60%" x2="60%" y2="0" stroke="url(#line-gradient)" stroke-width="1" class="animate-draw-line animation-delay-1000" />
        <line x1="40%" y1="100%" x2="100%" y2="40%" stroke="url(#line-gradient)" stroke-width="1" class="animate-draw-line animation-delay-2000" />
      </svg>
    </div>

    <!-- Two Column Layout for Large Screens -->
    <div class="relative w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
      
      <!-- Left Side - Animation/Illustration (Hidden on mobile) -->
      <div class="hidden lg:flex flex-col items-center justify-center space-y-8 animate-fade-in-left">
        <!-- Animated Stock Management Illustration -->
        <div class="relative w-full max-w-md">
          <!-- Main Dashboard Card -->
          <div class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700 animate-float-slow">
            <!-- Dashboard Header -->
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-semibold text-gray-900 dark:text-white">Mura Storage</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Tableau de bord</p>
                </div>
              </div>
              <div class="flex space-x-1">
                <div class="w-3 h-3 bg-red-400 rounded-full"></div>
                <div class="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div class="w-3 h-3 bg-green-400 rounded-full"></div>
              </div>
            </div>
            
            <!-- Stats Grid -->
            <div class="grid grid-cols-3 gap-4 mb-6">
              <div class="bg-emerald-50 dark:bg-emerald-900/30 rounded-xl p-3 text-center animate-pulse-slow">
                <p class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">1,234</p>
                <p class="text-xs text-gray-600 dark:text-gray-400">Produits</p>
              </div>
              <div class="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-3 text-center animate-pulse-slow animation-delay-500">
                <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">56</p>
                <p class="text-xs text-gray-600 dark:text-gray-400">Commandes</p>
              </div>
              <div class="bg-purple-50 dark:bg-purple-900/30 rounded-xl p-3 text-center animate-pulse-slow animation-delay-1000">
                <p class="text-2xl font-bold text-purple-600 dark:text-purple-400">89%</p>
                <p class="text-xs text-gray-600 dark:text-gray-400">Stock OK</p>
              </div>
            </div>
            
            <!-- Chart Animation -->
            <div class="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
              <div class="flex items-end space-x-2 h-24">
                <div class="flex-1 bg-emerald-500/60 rounded-t animate-chart-bar h-[40%]"></div>
                <div class="flex-1 bg-emerald-500/70 rounded-t animate-chart-bar animation-delay-100 h-[60%]"></div>
                <div class="flex-1 bg-emerald-500/80 rounded-t animate-chart-bar animation-delay-200 h-[45%]"></div>
                <div class="flex-1 bg-emerald-500/90 rounded-t animate-chart-bar animation-delay-300 h-[80%]"></div>
                <div class="flex-1 bg-emerald-500 rounded-t animate-chart-bar animation-delay-400 h-[70%]"></div>
                <div class="flex-1 bg-emerald-600 rounded-t animate-chart-bar animation-delay-500 h-[90%]"></div>
                <div class="flex-1 bg-emerald-700 rounded-t animate-chart-bar animation-delay-600 h-[100%]"></div>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">Ventes hebdomadaires</p>
            </div>
          </div>
          
          <!-- Floating Notification Cards -->
          <div class="absolute -top-4 -right-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 border border-gray-200 dark:border-gray-700 animate-float">
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <div>
                <p class="text-xs font-semibold text-gray-900 dark:text-white">Nouveau stock</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">+150 articles</p>
              </div>
            </div>
          </div>
          
          <div class="absolute -bottom-4 -left-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 border border-gray-200 dark:border-gray-700 animate-float-delayed">
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
              </div>
              <div>
                <p class="text-xs font-semibold text-gray-900 dark:text-white">Facture créée</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">#2025-0143</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Text Content -->
        <div class="text-center space-y-4 max-w-md">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
            Gérez votre stock en temps réel
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            Inventaires, factures, transferts multi-entrepôts. Tout ce dont vous avez besoin pour développer votre entreprise.
          </p>
          <div class="flex items-center justify-center space-x-6 text-sm">
            <div class="flex items-center text-emerald-600 dark:text-emerald-400">
              <svg class="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
              3 mois gratuits
            </div>
            <div class="flex items-center text-emerald-600 dark:text-emerald-400">
              <svg class="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
              Support 24/7
            </div>
          </div>
        </div>
      </div>
      
      <!-- Right Side - Login Form -->
      <div 
        :class="[
          'relative max-w-md w-full mx-auto space-y-8 transition-all duration-1000',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        ]"
      >
      <!-- Logo et titre avec animation -->
      <div class="text-center">
        <div class="mx-auto h-20 w-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/30 transform hover:scale-110 hover:rotate-3 transition-all duration-300 cursor-pointer group">
          <svg class="h-10 w-10 text-white transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
          </svg>
          <!-- Ripple effect on logo -->
          <div class="absolute inset-0 rounded-2xl bg-emerald-400/50 animate-ping opacity-0 group-hover:opacity-100"></div>
        </div>
        
        <h2 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Bienvenue sur
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-blue-500 dark:from-emerald-400 dark:to-blue-400 animate-gradient bg-[length:200%_auto]">
            Mura Storage
          </span>
        </h2>
        <p class="text-gray-600 dark:text-gray-400">
          Gérez votre entreprise et vos stocks efficacement
        </p>
        
        <!-- Animated typing text -->
        <div class="mt-4 h-6 flex items-center justify-center">
          <span class="text-emerald-600 dark:text-emerald-400 text-sm font-mono" v-if="typingText">{{ typingText }}</span>
          <span class="w-0.5 h-4 bg-emerald-500 dark:bg-emerald-400 animate-blink ml-1"></span>
        </div>
      </div>

      <!-- Formulaire de connexion avec glass effect -->
      <div class="backdrop-blur-xl bg-white/80 dark:bg-white/10 border border-gray-200 dark:border-white/20 py-8 px-8 shadow-2xl rounded-3xl relative overflow-hidden">
        <!-- Glow effect on hover -->
        <div class="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-blue-500/5 dark:from-emerald-500/10 dark:to-blue-500/10 opacity-0 hover:opacity-100 transition-opacity pointer-events-none"></div>
        
        <form @submit.prevent="handleLogin" class="relative space-y-6">
          <!-- Type de connexion avec animation -->
          <div class="space-y-4">
            <div class="flex space-x-3">
              <button
                type="button"
                @click="loginType = 'superadmin'"
                :class="[
                  'flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 transform',
                  loginType === 'superadmin'
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 scale-105'
                    : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 hover:scale-102'
                ]"
              >
                <svg class="w-5 h-5 inline mr-2 transition-transform" :class="loginType === 'superadmin' ? 'animate-bounce-slow' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
                Super Admin
              </button>
              <button
                type="button"
                @click="loginType = 'user'"
                :class="[
                  'flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 transform',
                  loginType === 'user'
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 scale-105'
                    : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 hover:scale-102'
                ]"
              >
                <svg class="w-5 h-5 inline mr-2 transition-transform" :class="loginType === 'user' ? 'animate-bounce-slow' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                Utilisateur
              </button>
            </div>
          </div>

          <!-- Champ Email avec animation focus -->
          <div class="group">
            <label for="email" class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2 transition-colors group-focus-within:text-emerald-500 dark:group-focus-within:text-emerald-400">
              Adresse e-mail
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-emerald-500 dark:group-focus-within:text-emerald-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
                </svg>
              </div>
              <input
                id="email"
                v-model="formData.email"
                type="email"
                autocomplete="email"
                required
                class="block w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 focus:bg-white dark:focus:bg-white/10"
                placeholder="votre@email.com"
                :class="{ 'border-red-500 focus:ring-red-500': errors.email }"
              />
              <!-- Animated underline -->
              <div class="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-300 w-0 group-focus-within:w-full rounded-full"></div>
            </div>
            <p v-if="errors.email" class="mt-2 text-sm text-red-400 flex items-center">
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              {{ errors.email }}
            </p>
          </div>

          <!-- Champ Mot de passe -->
          <div class="group">
            <label for="password" class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2 transition-colors group-focus-within:text-emerald-500 dark:group-focus-within:text-emerald-400">
              Mot de passe
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-emerald-500 dark:group-focus-within:text-emerald-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
              <input
                id="password"
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                required
                class="block w-full pl-12 pr-12 py-3.5 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 focus:bg-white dark:focus:bg-white/10"
                placeholder="Votre mot de passe"
                :class="{ 'border-red-500 focus:ring-red-500': errors.password }"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 dark:text-gray-500 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
              >
                <svg v-if="showPassword" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
                </svg>
                <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
              </button>
              <div class="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-300 w-0 group-focus-within:w-full rounded-full"></div>
            </div>
            <p v-if="errors.password" class="mt-2 text-sm text-red-400 flex items-center">
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              {{ errors.password }}
            </p>
          </div>

          <!-- Champ ID Entreprise (pour utilisateurs) avec slide animation -->
          <Transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 -translate-y-4 max-h-0"
            enter-to-class="opacity-100 translate-y-0 max-h-40"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="opacity-100 translate-y-0 max-h-40"
            leave-to-class="opacity-0 -translate-y-4 max-h-0"
          >
            <div v-if="loginType === 'user'" class="group overflow-hidden">
              <label for="entrepriseId" class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                ID de l'entreprise
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-emerald-500 dark:group-focus-within:text-emerald-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                </div>
                <input
                  id="entrepriseId"
                  v-model="formData.entrepriseId"
                  type="text"
                  class="block w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 focus:bg-white dark:focus:bg-white/10"
                  placeholder="ID de votre entreprise"
                />
              </div>
              <p class="mt-2 text-xs text-gray-500 dark:text-gray-500">
                Cet ID vous a été fourni par votre administrateur
              </p>
            </div>
          </Transition>

          <!-- Options supplémentaires -->
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember-me"
                v-model="formData.rememberMe"
                type="checkbox"
                class="h-4 w-4 bg-gray-100 dark:bg-white/10 border-gray-300 dark:border-white/20 rounded text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
              />
              <label for="remember-me" class="ml-2 block text-sm text-gray-600 dark:text-gray-400">
                Se souvenir de moi
              </label>
            </div>
            <NuxtLink to="/home/mot-de-passe-oublie" class="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 transition-colors hover:underline">
              Mot de passe oublié ?
            </NuxtLink>
          </div>

          <!-- Bouton de connexion avec effet ripple -->
          <div>
            <button
              type="submit"
              :disabled="isLoading"
              class="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-500/30 overflow-hidden"
            >
              <!-- Animated shine effect -->
              <div class="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              
              <span v-if="!isLoading" class="absolute left-4 inset-y-0 flex items-center">
                <svg class="h-5 w-5 text-emerald-300 group-hover:rotate-12 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path>
                </svg>
              </span>
              <span v-if="isLoading" class="absolute left-4 inset-y-0 flex items-center">
                <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              {{ isLoading ? 'Connexion en cours...' : 'Se connecter' }}
            </button>
          </div>

          <!-- Lien vers inscription -->
          <div class="text-center pt-4 border-t border-gray-200 dark:border-white/10">
            <p class="text-gray-600 dark:text-gray-400">
              Pas encore de compte ?
              <NuxtLink to="/home/inscription" class="font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 transition-colors ml-1 hover:underline">
                Créer une entreprise
              </NuxtLink>
            </p>
          </div>
        </form>
      </div>

      <!-- Informations de sécurité -->
      <div class="text-center flex items-center justify-center space-x-4">
        <div class="flex items-center text-gray-500 dark:text-gray-500 text-xs">
          <svg class="w-4 h-4 mr-1 text-emerald-600 dark:text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          SSL/TLS
        </div>
        <div class="flex items-center text-gray-500 dark:text-gray-500 text-xs">
          <svg class="w-4 h-4 mr-1 text-emerald-600 dark:text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          RGPD
        </div>
        <div class="flex items-center text-gray-500 dark:text-gray-500 text-xs">
          <svg class="w-4 h-4 mr-1 text-emerald-600 dark:text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
          </svg>
          Support 24/7
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { API_BASE_URL } from '@/constants'
import { useNotification } from '@/types/useNotification'

definePageMeta({
  layout: "accueil",
})

// Animation states
const isVisible = ref(false)
const typingText = ref('')
const typingPhrases = [
  'Gestion de stock simplifiée...',
  'Multi-entrepôts en un clic...',
  'Facturation automatisée...',
  'Gestion des entrées/sorties ...',
  'Analyses en temps réel...'
]
let typingIndex = 0
let charIndex = 0
let typingInterval: NodeJS.Timeout | null = null

// Typing animation
const startTyping = () => {
  typingInterval = setInterval(() => {
    const currentPhrase = typingPhrases[typingIndex]
    if (charIndex < currentPhrase.length) {
      typingText.value = currentPhrase.substring(0, charIndex + 1)
      charIndex++
    } else {
      // Wait then start next phrase
      setTimeout(() => {
        charIndex = 0
        typingIndex = (typingIndex + 1) % typingPhrases.length
        typingText.value = ''
      }, 2000)
    }
  }, 80)
}

const useAuthStore = () => ({
  setToken: (token: string) => { if (process.client) localStorage.setItem('access_token', token) },
  setUser: (user: any) => { if (process.client) localStorage.setItem('user', JSON.stringify(user)) }
})

const { error, success } = useNotification()
const auth = useAuthStore()

// Form state
const loginType = ref<'superadmin' | 'user'>('superadmin')
const isLoading = ref(false)
const showPassword = ref(false)

const formData = reactive({
  email: '',
  password: '',
  entrepriseId: '',
  rememberMe: false
})

const errors = reactive({
  email: '',
  password: '',
  entrepriseId: ''
})

// Validation
const validateForm = () => {
  errors.email = ''
  errors.password = ''
  errors.entrepriseId = ''
  let isValid = true

  if (!formData.email) {
    errors.email = 'L\'adresse e-mail est requise'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Format d\'e-mail invalide'
    isValid = false
  }

  if (!formData.password) {
    errors.password = 'Le mot de passe est requis'
    isValid = false
  } else if (formData.password.length < 6) {
    errors.password = 'Minimum 6 caractères'
    isValid = false
  }

  if (loginType.value === 'user' && !formData.entrepriseId) {
    errors.entrepriseId = 'L\'ID entreprise est requis'
    isValid = false
  }

  return isValid
}

// Login handler
const handleLogin = async () => {
  if (!validateForm()) return

  isLoading.value = true

  try {
    if (process.server) {
      error('Connexion non disponible')
      return
    }

    const loginData = {
      email: formData.email,
      password: formData.password,
      ...(loginType.value === 'user' && { entreprise_id: formData.entrepriseId })
    }

    const response = await $fetch<any>(`${API_BASE_URL}/api/auth/jwt/login/`, {
      method: 'POST',
      body: loginData,
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      credentials: 'omit',
      mode: 'cors'
    })

    auth.setToken(response.access)
    auth.setUser(response.user)

    if (process.client) {
      localStorage.setItem('user', JSON.stringify(response.user))
      localStorage.setItem('refresh_token', response.refresh)
      localStorage.setItem('entreprise', JSON.stringify(response.entreprise))
      if (response.boutique) localStorage.setItem('boutique', JSON.stringify(response.boutique))
      localStorage.setItem('permissions', JSON.stringify(response.permissions))
      if (formData.rememberMe) localStorage.setItem('remember_me', 'true')

      // Email verification: forcer la vérification si aucune info n'est fournie
      const verificationKeys = [
        'email_verified',
        'emailVerified',
        'is_email_verified',
        'is_verified',
        'verified',
        'isVerified'
      ]
      let explicitEmailVerified: boolean | undefined = undefined
      if (response.user) {
        for (const key of verificationKeys) {
          if (Object.prototype.hasOwnProperty.call(response.user, key)) {
            const value = (response.user as any)[key]
            if (typeof value === 'boolean') explicitEmailVerified = value
            else if (typeof value === 'string') {
              const normalized = value.trim().toLowerCase()
              if (normalized === 'true') explicitEmailVerified = true
              if (normalized === 'false') explicitEmailVerified = false
            }
            break
          }
        }
      }

      if (explicitEmailVerified !== undefined) {
        localStorage.setItem('email_verified', String(explicitEmailVerified))
      } else if (localStorage.getItem('email_verified') === null) {
        localStorage.setItem('email_verified', 'false')
      }
    }

    const isVerified = (response.user && (typeof (response.user as any).email_verified !== 'undefined')
      ? (response.user as any).email_verified
      : (response.user && (typeof (response.user as any).is_email_verified !== 'undefined')
        ? (response.user as any).is_email_verified
        : false))
    success('Connexion réussie !')

    setTimeout(() => {
      if (!isVerified) {
        navigateTo('/home/verification')
      } else {
        navigateTo(response.user.role === 'superadmin' ? '/superadmin/dashboard' : '/')
      }
    }, 1000)

  } catch (err: any) {
    console.error('Login error:', err)
    if (err.statusCode === 401) error('Email ou mot de passe incorrect')
    else if (err.statusCode === 400) error('Données invalides')
    else error('Erreur de connexion')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  setTimeout(() => { isVisible.value = true }, 100)
  startTyping()
  
  if (process.client) {
    const rememberMe = localStorage.getItem('remember_me')
    if (rememberMe === 'true') {
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        formData.email = JSON.parse(savedUser).email
        formData.rememberMe = true
      }
    }
  }
})

onUnmounted(() => {
  if (typingInterval) clearInterval(typingInterval)
})
</script>

<style scoped>
@keyframes blob {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

@keyframes float-random {
  0%, 100% { transform: translateY(0) translateX(0); opacity: 0.4; }
  25% { transform: translateY(-20px) translateX(10px); opacity: 0.8; }
  50% { transform: translateY(-10px) translateX(-10px); opacity: 0.4; }
  75% { transform: translateY(-30px) translateX(5px); opacity: 0.6; }
}

.animate-float-random {
  animation: float-random 5s ease-in-out infinite;
}

@keyframes draw-line {
  0% { stroke-dasharray: 0 1000; }
  50% { stroke-dasharray: 500 1000; }
  100% { stroke-dasharray: 1000 1000; }
}

.animate-draw-line {
  animation: draw-line 3s ease-in-out infinite;
}

.animation-delay-1000 {
  animation-delay: 1s;
}

@keyframes gradient {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.animate-gradient {
  animation: gradient 3s ease infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.animate-blink {
  animation: blink 1s step-end infinite;
}

@keyframes bounce-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

.animate-bounce-slow {
  animation: bounce-slow 2s ease-in-out infinite;
}

/* New animations for two-column layout */
@keyframes fade-in-left {
  0% { opacity: 0; transform: translateX(-30px); }
  100% { opacity: 1; transform: translateX(0); }
}

.animate-fade-in-left {
  animation: fade-in-left 0.8s ease-out forwards;
}

@keyframes float-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

.animate-float-slow {
  animation: float-slow 5s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-float-delayed {
  animation: float 3s ease-in-out infinite;
  animation-delay: 1.5s;
}

@keyframes pulse-slow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.animate-pulse-slow {
  animation: pulse-slow 2s ease-in-out infinite;
}

@keyframes chart-bar {
  0% { transform: scaleY(0); }
  100% { transform: scaleY(1); }
}.animate-chart-bar {
  transform-origin: bottom;
  animation: chart-bar 1s ease-out forwards;
}.animation-delay-100 { animation-delay: 100ms; }
.animation-delay-200 { animation-delay: 200ms; }
.animation-delay-300 { animation-delay: 300ms; }
.animation-delay-400 { animation-delay: 400ms; }
.animation-delay-500 { animation-delay: 500ms; }
.animation-delay-600 { animation-delay: 600ms; }
</style>
