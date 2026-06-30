<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useLogoutConfirm } from '~/composables/useLogoutConfirm'
import { useLocale } from '~/composables/useLocale'

const auth = useAuthStore()
const { show, cancel } = useLogoutConfirm()
const { t } = useLocale()

function confirm() {
  show.value = false
  auth.logout()
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="show"
        class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="cancel"
      >
        <Transition name="scale">
          <div v-if="show" class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-center w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 mx-auto mb-4">
              <UIcon name="i-heroicons-arrow-right-on-rectangle" class="w-7 h-7 text-red-600 dark:text-red-400" />
            </div>
            <h3 class="text-lg font-bold text-center text-gray-900 dark:text-white mb-2">{{ t('logoutModal.title') }}</h3>
            <p class="text-sm text-center text-gray-500 dark:text-gray-400 mb-6">{{ t('logoutModal.message') }}</p>
            <div class="flex gap-3">
              <button
                @click="cancel"
                class="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {{ t('logoutModal.cancel') }}
              </button>
              <button
                @click="confirm"
                class="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors"
              >
                {{ t('logoutModal.confirm') }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.scale-enter-active { transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease; }
.scale-leave-active { transition: transform 0.15s ease, opacity 0.15s ease; }
.scale-enter-from { transform: scale(0.85); opacity: 0; }
.scale-leave-to   { transform: scale(0.9); opacity: 0; }
</style>
