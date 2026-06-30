<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useLocale } from '~/composables/useLocale'
import { useLogoutConfirm } from '~/composables/useLogoutConfirm'

const { t, locale, toggleLocale } = useLocale()
const { requestLogout } = useLogoutConfirm()

const emit = defineEmits<{ 'open-profile': [] }>()

// ── User data ──────────────────────────────────────────────────────────────────
const userData = ref<any>(null)
onMounted(() => {
  if (!process.client) return
  try { userData.value = JSON.parse(localStorage.getItem('user') || 'null') } catch {}
})

const initials = computed(() => {
  const u = userData.value
  if (!u) return '?'
  const first = u.first_name?.[0] || u.username?.[0] || ''
  const last = u.last_name?.[0] || ''
  return (first + last).toUpperCase() || '?'
})

const displayName = computed(() => {
  const u = userData.value
  if (!u) return '—'
  return [u.first_name, u.last_name].filter(Boolean).join(' ') || u.username || '—'
})

const roleLabel = computed(() => {
  const role = userData.value?.role
  if (role === 'admin') return t('profile.roles.admin')
  if (role === 'superadmin') return t('profile.roles.superadmin')
  return t('profile.roles.user')
})

// ── Dropdown open/close ────────────────────────────────────────────────────────
const open = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

function onOutsideClick(e: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    open.value = false
  }
}
onMounted(() => document.addEventListener('mousedown', onOutsideClick))
onUnmounted(() => document.removeEventListener('mousedown', onOutsideClick))

// ── Dark mode ──────────────────────────────────────────────────────────────────
const isDark = ref(false)
onMounted(() => {
  if (!process.client) return
  const saved = localStorage.getItem('theme')
  isDark.value = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches
})

function toggleTheme() {
  isDark.value = !isDark.value
  if (process.client) {
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', isDark.value)
  }
}

// ── Logout → délègue au modal global ──────────────────────────────────────────
function doLogout() {
  open.value = false
  requestLogout()
}
</script>

<template>
  <div ref="dropdownRef" class="relative">
    <!-- Trigger -->
    <button
      @click="open = !open"
      class="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      :aria-expanded="open"
    >
      <div class="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
        {{ initials }}
      </div>
      <div class="hidden sm:block text-left leading-tight">
        <p class="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[120px]">{{ displayName }}</p>
        <p class="text-[10px] text-gray-500 dark:text-gray-400">{{ roleLabel }}</p>
      </div>
      <UIcon name="i-heroicons-chevron-down" class="w-4 h-4 text-gray-400 transition-transform" :class="open ? 'rotate-180' : ''" />
    </button>

    <!-- Dropdown panel -->
    <Transition name="dropdown">
      <div
        v-if="open"
        class="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
      >
        <!-- Header -->
        <div class="flex items-center gap-3 px-4 py-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/10 border-b border-gray-100 dark:border-gray-800">
          <div class="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center text-white text-base font-bold flex-shrink-0">
            {{ initials }}
          </div>
          <div class="min-w-0">
            <p class="text-sm font-bold text-gray-900 dark:text-white truncate">{{ displayName }}</p>
            <span class="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
              {{ roleLabel }}
            </span>
          </div>
        </div>

        <div class="p-2 space-y-1">
          <!-- Apparence / Appearance -->
          <div class="px-3 py-2">
            <p class="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">{{ t('profile.appearance') }}</p>
            <div class="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
              <button
                @click="isDark && toggleTheme()"
                class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
                :class="!isDark ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'"
              >
                <UIcon name="i-heroicons-sun" class="w-4 h-4" />
                {{ t('profile.light') }}
              </button>
              <button
                @click="!isDark && toggleTheme()"
                class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
                :class="isDark ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'"
              >
                <UIcon name="i-heroicons-moon" class="w-4 h-4" />
                {{ t('profile.dark') }}
              </button>
            </div>
          </div>

          <!-- Langue / Language -->
          <div class="px-3 py-2">
            <p class="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">{{ t('profile.language') }}</p>
            <div class="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
              <button
                @click="locale !== 'fr' && toggleLocale()"
                class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
                :class="locale === 'fr' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'"
              >
                🇫🇷 Français
              </button>
              <button
                @click="locale !== 'en' && toggleLocale()"
                class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
                :class="locale === 'en' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'"
              >
                🇬🇧 English
              </button>
            </div>
          </div>

          <div class="border-t border-gray-100 dark:border-gray-800 my-1" />

          <!-- Modifier le profil -->
          <button
            @click="emit('open-profile'); open = false"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <UIcon name="i-heroicons-user-circle" class="w-5 h-5 text-gray-400" />
            {{ t('profile.editProfile') }}
          </button>

          <div class="border-t border-gray-100 dark:border-gray-800 my-1" />

          <!-- Déconnexion -->
          <button
            @click="doLogout"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <UIcon name="i-heroicons-arrow-right-on-rectangle" class="w-5 h-5" />
            {{ t('profile.logout') }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.dropdown-enter-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.dropdown-leave-active { transition: opacity 0.1s ease, transform 0.1s ease; }
.dropdown-enter-from { opacity: 0; transform: translateY(-8px) scale(0.97); }
.dropdown-leave-to  { opacity: 0; transform: translateY(-4px) scale(0.97); }
</style>
