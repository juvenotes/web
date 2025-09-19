<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { Clock, AlertTriangle } from 'lucide-vue-next'

interface Props {
  initialTimeRemaining?: number // in seconds
  isActive?: boolean
  variant?: 'default' | 'warning' | 'danger'
}

interface Emits {
  (e: 'time-up'): void
  (e: 'warning', timeRemaining: number): void
}

const props = withDefaults(defineProps<Props>(), {
  initialTimeRemaining: 0,
  isActive: true,
  variant: 'default'
})

const emit = defineEmits<Emits>()

const timeRemaining = ref(props.initialTimeRemaining)
let intervalId: NodeJS.Timeout | null = null

const hours = computed(() => Math.floor(timeRemaining.value / 3600))
const minutes = computed(() => Math.floor((timeRemaining.value % 3600) / 60))
const seconds = computed(() => timeRemaining.value % 60)

const formattedTime = computed(() => {
  const h = hours.value.toString().padStart(2, '0')
  const m = minutes.value.toString().padStart(2, '0')
  const s = seconds.value.toString().padStart(2, '0')
  
  if (hours.value > 0) {
    return `${h}:${m}:${s}`
  }
  return `${m}:${s}`
})

const timerVariant = computed(() => {
  // Auto-determine variant based on time remaining
  if (timeRemaining.value <= 300) return 'danger' // 5 minutes
  if (timeRemaining.value <= 1800) return 'warning' // 30 minutes
  return props.variant
})

const timerClass = computed(() => {
  const baseClass = 'inline-flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-sm font-semibold'
  
  switch (timerVariant.value) {
    case 'danger':
      return `${baseClass} bg-red-100 text-red-800 border border-red-200 animate-pulse`
    case 'warning':
      return `${baseClass} bg-amber-100 text-amber-800 border border-amber-200`
    default:
      return `${baseClass} bg-blue-100 text-blue-800 border border-blue-200`
  }
})

function startTimer() {
  if (!props.isActive) return
  
  intervalId = setInterval(() => {
    if (timeRemaining.value > 0) {
      timeRemaining.value--
      
      // Emit warnings at specific intervals
      if (timeRemaining.value === 1800) { // 30 minutes
        emit('warning', timeRemaining.value)
      } else if (timeRemaining.value === 300) { // 5 minutes
        emit('warning', timeRemaining.value)
      } else if (timeRemaining.value === 60) { // 1 minute
        emit('warning', timeRemaining.value)
      }
      
      // Time's up
      if (timeRemaining.value === 0) {
        emit('time-up')
        stopTimer()
      }
    }
  }, 1000)
}

function stopTimer() {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

// Watch for prop changes
watch(() => props.isActive, (newValue) => {
  if (newValue) {
    startTimer()
  } else {
    stopTimer()
  }
})

watch(() => props.initialTimeRemaining, (newValue) => {
  timeRemaining.value = newValue
})

onMounted(() => {
  if (props.isActive) {
    startTimer()
  }
})

onUnmounted(() => {
  stopTimer()
})

// Public method to update time (for syncing with server)
function updateTimeRemaining(seconds: number) {
  timeRemaining.value = seconds
}

defineExpose({
  updateTimeRemaining,
  stopTimer,
  startTimer
})
</script>

<template>
  <div :class="timerClass">
    <Clock class="h-4 w-4" />
    <span class="tabular-nums">{{ formattedTime }}</span>
    <AlertTriangle 
      v-if="timerVariant === 'danger'" 
      class="h-4 w-4 text-red-600" 
    />
  </div>
</template>