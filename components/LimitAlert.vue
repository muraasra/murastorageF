<template>
  <div v-if="showAlert" class="fixed top-4 right-4 z-50 max-w-md">
    <div class="bg-white rounded-lg shadow-lg border-l-4 p-4" :class="alertClass">
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5" :class="iconClass" fill="currentColor" viewBox="0 0 20 20">
            <path v-if="alertType === 'warning'" fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            <path v-else-if="alertType === 'error'" fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            <path v-else fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="ml-3 flex-1">
          <h3 class="text-sm font-medium" :class="titleClass">
            {{ title }}
          </h3>
          <div class="mt-2 text-sm" :class="messageClass">
            <p>{{ message }}</p>
            <div v-if="showProgress" class="mt-2">
              <div class="flex justify-between text-xs mb-1">
                <span>{{ current }} / {{ limit }}</span>
                <span>{{ percentage }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div 
                  class="h-2 rounded-full transition-all duration-300"
                  :class="progressClass"
                  :style="{ width: `${percentage}%` }"
                ></div>
              </div>
            </div>
          </div>
          <div v-if="showActions" class="mt-3">
            <div class="flex space-x-2">
              <button
                @click="handleUpgrade"
                class="text-sm font-medium px-3 py-1 rounded-md"
                :class="upgradeButtonClass"
              >
                Mettre à niveau
              </button>
              <button
                @click="dismiss"
                class="text-sm font-medium px-3 py-1 rounded-md text-gray-500 hover:text-gray-700"
              >
                Plus tard
              </button>
            </div>
          </div>
        </div>
        <div class="ml-4 flex-shrink-0">
          <button
            @click="dismiss"
            class="inline-flex text-gray-400 hover:text-gray-600"
          >
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps<{
  alertType: 'warning' | 'error' | 'success'
  title: string
  message: string
  current?: number
  limit?: number
  showActions?: boolean
  autoClose?: boolean
  duration?: number
}>()

const emit = defineEmits<{
  upgrade: []
  dismiss: []
}>()

const router = useRouter()
const showAlert = ref(true)

// Computed properties
const alertClass = computed(() => {
  const classes = {
    warning: 'border-orange-400 bg-orange-50',
    error: 'border-red-400 bg-red-50',
    success: 'border-green-400 bg-green-50'
  }
  return classes[props.alertType]
})

const iconClass = computed(() => {
  const classes = {
    warning: 'text-orange-400',
    error: 'text-red-400',
    success: 'text-green-400'
  }
  return classes[props.alertType]
})

const titleClass = computed(() => {
  const classes = {
    warning: 'text-orange-800',
    error: 'text-red-800',
    success: 'text-green-800'
  }
  return classes[props.alertType]
})

const messageClass = computed(() => {
  const classes = {
    warning: 'text-orange-700',
    error: 'text-red-700',
    success: 'text-green-700'
  }
  return classes[props.alertType]
})

const upgradeButtonClass = computed(() => {
  const classes = {
    warning: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
    error: 'bg-red-100 text-red-800 hover:bg-red-200',
    success: 'bg-green-100 text-green-800 hover:bg-green-200'
  }
  return classes[props.alertType]
})

const progressClass = computed(() => {
  const classes = {
    warning: 'bg-orange-500',
    error: 'bg-red-500',
    success: 'bg-green-500'
  }
  return classes[props.alertType]
})

const showProgress = computed(() => {
  return props.current !== undefined && props.limit !== undefined
})

const percentage = computed(() => {
  if (!props.current || !props.limit) return 0
  return Math.min((props.current / props.limit) * 100, 100)
})

// Methods
function dismiss() {
  showAlert.value = false
  emit('dismiss')
}

function handleUpgrade() {
  router.push('/tarification')
  emit('upgrade')
}

// Auto close
let timeoutId: NodeJS.Timeout | null = null

onMounted(() => {
  if (props.autoClose) {
    timeoutId = setTimeout(() => {
      dismiss()
    }, props.duration || 5000)
  }
})

onUnmounted(() => {
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
})
</script>















