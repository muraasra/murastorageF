<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer">
    <div class="flex justify-between items-start">
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{{ title }}</p>
        <p class="text-2xl font-bold mt-2 truncate" :class="valueColor">{{ formattedValue }}</p>
        <div v-if="trend || subtitle" class="flex items-center mt-2 text-xs">
          <svg v-if="trend" class="h-3 w-3 flex-shrink-0" :class="trendColor">
            <path v-if="trendDirection === 'up'" fill="none" stroke="currentColor" stroke-width="2" d="M7 17l9-9 4 4M17 8l-4-4-9 9"/>
            <path v-else-if="trendDirection === 'down'" fill="none" stroke="currentColor" stroke-width="2" d="M17 17l-9-9-4 4M7 8l4-4 9 9"/>
            <circle v-else cx="12" cy="12" r="2" fill="currentColor"/>
          </svg>
          <span v-if="trend" :class="trendColor" class="ml-1 font-medium">{{ trend }}</span>
          <span v-else-if="subtitle" class="text-gray-500 dark:text-gray-400">{{ subtitle }}</span>
        </div>
      </div>
      <div :class="[
        'p-3 rounded-lg flex-shrink-0',
        iconBgColor
      ]">
        <UIcon :name="icon" class="w-5 h-5" :class="iconColor" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  value: string | number
  icon?: string
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray' | 'orange'
  trend?: string
  trendDirection?: 'up' | 'down' | 'neutral'
  subtitle?: string
  format?: 'number' | 'currency' | 'percent' | 'text'
  unit?: string
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'i-heroicons-information-circle',
  color: 'blue',
  format: 'text',
  trendDirection: 'neutral'
})

const formattedValue = computed(() => {
  if (props.format === 'currency') {
    const num = typeof props.value === 'string' ? parseFloat(props.value) : props.value
    if (isNaN(num)) return props.value
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(num) + ' FCFA'
  }
  if (props.format === 'percent') {
    const num = typeof props.value === 'string' ? parseFloat(props.value) : props.value
    if (isNaN(num)) return props.value
    return new Intl.NumberFormat('fr-FR', {
      style: 'percent',
      minimumFractionDigits: 1
    }).format(num / 100)
  }
  if (props.format === 'number') {
    const num = typeof props.value === 'string' ? parseFloat(props.value) : props.value
    if (isNaN(num)) return props.value
    return new Intl.NumberFormat('fr-FR').format(num)
  }
  return props.value
})

const valueColor = computed(() => {
  const colors: Record<string, string> = {
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    red: 'text-red-600 dark:text-red-400',
    yellow: 'text-amber-600 dark:text-amber-400',
    purple: 'text-purple-600 dark:text-purple-400',
    gray: 'text-gray-600 dark:text-gray-300',
    orange: 'text-orange-600 dark:text-orange-400'
  }
  return colors[props.color]
})

const iconBgColor = computed(() => {
  const colors: Record<string, string> = {
    blue: 'bg-blue-100 dark:bg-blue-900/30',
    green: 'bg-green-100 dark:bg-green-900/30',
    red: 'bg-red-100 dark:bg-red-900/30',
    yellow: 'bg-amber-100 dark:bg-amber-900/30',
    purple: 'bg-purple-100 dark:bg-purple-900/30',
    gray: 'bg-gray-100 dark:bg-gray-700',
    orange: 'bg-orange-100 dark:bg-orange-900/30'
  }
  return colors[props.color]
})

const iconColor = computed(() => {
  const colors: Record<string, string> = {
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    red: 'text-red-600 dark:text-red-400',
    yellow: 'text-amber-600 dark:text-amber-400',
    purple: 'text-purple-600 dark:text-purple-400',
    gray: 'text-gray-600 dark:text-gray-300',
    orange: 'text-orange-600 dark:text-orange-400'
  }
  return colors[props.color]
})

const trendColor = computed(() => {
  if (props.trendDirection === 'up') return 'text-green-600 dark:text-green-400'
  if (props.trendDirection === 'down') return 'text-red-600 dark:text-red-400'
  return 'text-gray-500 dark:text-gray-400'
})
</script>