<template>
  <div class="w-full" :style="{ height: `${height}px` }">
    <div v-if="loading" class="flex items-center justify-center h-full">
      <div class="animate-pulse">
        <div class="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      </div>
    </div>
    <div v-else class="flex items-center justify-center h-full">
      <div class="relative" :style="{ width: `${size}px`, height: `${size}px` }">
        <svg :viewBox="`0 0 ${size} ${size}`" class="w-full h-full">
          <g :transform="`translate(${size/2}, ${size/2})`">
            <path
              v-for="(segment, index) in segments"
              :key="index"
              :d="segment.path"
              :fill="segment.color"
              class="cursor-pointer hover:opacity-80 transition-opacity"
              @mouseenter="showTooltip(segment, $event)"
              @mouseleave="hideTooltip"
            />
          </g>
        </svg>
        
        <div
          v-if="tooltip.visible"
          :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
          class="absolute z-10 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg pointer-events-none shadow-lg"
        >
          <div class="font-semibold">{{ tooltip.label }}</div>
          <div>{{ tooltip.value }} ({{ tooltip.percent }}%)</div>
        </div>
      </div>
      
      <div v-if="showLegend" class="ml-6 space-y-2">
        <div v-for="segment in segments" :key="segment.label" class="flex items-center text-sm">
          <div class="w-3 h-3 rounded-full mr-2" :style="{ backgroundColor: segment.color }"></div>
          <span class="text-gray-700 dark:text-gray-300">{{ segment.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface PieData {
  label: string
  value: number
  color?: string
}

interface Props {
  data: PieData[]
  height?: number
  showLegend?: boolean
  loading?: boolean
  size?: number
}

const props = withDefaults(defineProps<Props>(), {
  height: 200,
  showLegend: true,
  loading: false,
  size: 160
})

const center = computed(() => props.size / 2)
const radius = computed(() => props.size / 2 - 10)

const total = computed(() => props.data.reduce((acc, item) => acc + item.value, 0))

const colors = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#06B6D4', '#EC4899', '#84CC16', '#F97316', '#6366F1'
]

const segments = computed(() => {
  let cumulativePercent = 0
  
  return props.data.map((item, index) => {
    const percent = total.value > 0 ? (item.value / total.value) * 100 : 0
    const color = item.color || colors[index % colors.length]
    
    const startPercent = cumulativePercent
    const endPercent = cumulativePercent + percent
    cumulativePercent = endPercent
    
    const startX = Math.cos(2 * Math.PI * (startPercent / 100)) * radius.value + center.value
    const startY = Math.sin(2 * Math.PI * (startPercent / 100)) * radius.value + center.value
    const endX = Math.cos(2 * Math.PI * (endPercent / 100)) * radius.value + center.value
    const endY = Math.sin(2 * Math.PI * (endPercent / 100)) * radius.value + center.value
    
    const largeArc = percent > 50 ? 1 : 0
    
    const path = [
      `M ${center.value} ${center.value}`,
      `L ${startX} ${startY}`,
      `A ${radius.value} ${radius.value} 0 ${largeArc} 1 ${endX} ${endY}`,
      'Z'
    ].join(' ')
    
    return {
      ...item,
      path,
      color,
      percent
    }
  })
})

const tooltip = reactive({
  visible: false,
  x: 0,
  y: 0,
  label: '',
  value: '',
  percent: 0
})

const showTooltip = (segment: any, event: MouseEvent) => {
  tooltip.visible = true
  tooltip.x = event.clientX + 10
  tooltip.y = event.clientY - 30
  tooltip.label = segment.label
  tooltip.value = segment.value.toLocaleString()
  tooltip.percent = segment.percent.toFixed(1)
}

const hideTooltip = () => {
  tooltip.visible = false
}
</script>