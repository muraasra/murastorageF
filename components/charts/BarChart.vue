<template>
  <div class="w-full" :style="{ height: `${height}px` }">
    <div v-if="loading" class="flex items-center justify-center h-full">
      <div class="animate-pulse space-y-2">
        <div class="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div class="h-32 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
    <div v-else class="h-full flex flex-col">
      <div class="flex-1 relative">
        <svg :viewBox="`0 0 ${width} ${height - 60}`" class="w-full h-full">
          <line :x1="padding" :y1="chartHeight" :x2="width - padding" :y2="chartHeight" stroke="#9CA3AF" stroke-width="1" />
          <line :x1="padding" :y1="padding" :x2="padding" :y2="chartHeight" stroke="#9CA3AF" stroke-width="1" />
          
          <g v-for="(bar, index) in chartData" :key="index">
            <rect
              :x="bar.x"
              :y="bar.y"
              :width="barWidth"
              :height="bar.height"
              :fill="bar.color"
              class="cursor-pointer hover:opacity-80 transition-opacity"
              @mouseenter="showTooltip(bar, $event)"
              @mouseleave="hideTooltip"
              @click="handleClick(bar)"
            />
            <text
              :x="bar.x + barWidth / 2"
              :y="chartHeight + 20"
              text-anchor="middle"
              font-size="10"
              fill="#6B7280"
              class="truncate"
            >
              {{ bar.label }}
            </text>
          </g>
        </svg>
        
        <div
          v-if="tooltip.visible"
          :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
          class="absolute z-10 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg pointer-events-none shadow-lg"
        >
          <div class="font-semibold">{{ tooltip.title }}</div>
          <div class="mt-1">{{ tooltip.value }}</div>
        </div>
      </div>
      
      <div v-if="showLegend && legendItems.length" class="flex justify-center space-x-4 mt-4">
        <div v-for="item in legendItems" :key="item.label" class="flex items-center text-xs">
          <div class="w-3 h-3 rounded mr-1" :style="{ backgroundColor: item.color }"></div>
          <span class="text-gray-600 dark:text-gray-400">{{ item.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface BarData {
  label: string
  value: number
  color?: string
  rawData?: any
}

interface Props {
  data: BarData[]
  height?: number
  showLegend?: boolean
  legendItems?: { label: string; color: string }[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  height: 200,
  showLegend: false,
  loading: false
})

const emit = defineEmits<{
  click: [data: BarData]
}>()

const width = 600
const padding = 40
const chartHeight = 160

const tooltip = reactive({
  visible: false,
  x: 0,
  y: 0,
  title: '',
  value: ''
})

const barWidth = computed(() => {
  const n = props.data.length || 1
  return Math.max(8, (width - padding * 2 - 20) / n - 10)
})

const maxValue = computed(() => {
  const values = props.data.map(d => d.value)
  return Math.max(1, ...values)
})

const chartData = computed(() => {
  return props.data.map((item, index) => ({
    ...item,
    x: padding + index * (barWidth.value + 10) + 5,
    y: chartHeight - (item.value / maxValue.value) * (chartHeight - padding),
    height: (item.value / maxValue.value) * (chartHeight - padding)
  }))
})

const showTooltip = (bar: any, event: MouseEvent) => {
  const rect = (event.currentTarget as SVGElement).getBoundingClientRect()
  tooltip.visible = true
  tooltip.x = event.clientX - rect.left + 10
  tooltip.y = event.clientY - rect.top - 10
  tooltip.title = bar.label
  tooltip.value = formatValue(bar.value)
}

const hideTooltip = () => {
  tooltip.visible = false
}

const handleClick = (bar: any) => {
  emit('click', bar)
}

const formatValue = (value: number) => {
  return new Intl.NumberFormat('fr-FR').format(value)
}
</script>