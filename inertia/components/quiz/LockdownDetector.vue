<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { AlertTriangle, Eye, EyeOff } from 'lucide-vue-next'
import { toast } from '~/components/ui/toast'

interface Props {
  isEnabled: boolean
  autoSubmitThreshold?: number
}

interface Emits {
  (e: 'suspicious-activity', activity: { type: string; count: number }): void
  (e: 'auto-submit-triggered'): void
}

const props = withDefaults(defineProps<Props>(), {
  autoSubmitThreshold: 5
})

const emit = defineEmits<Emits>()

const tabSwitchCount = ref(0)
const focusLossCount = ref(0)
const isPageVisible = ref(true)
const warningVisible = ref(false)

function handleVisibilityChange() {
  if (!props.isEnabled) return
  
  const isVisible = !document.hidden
  
  if (!isVisible && isPageVisible.value) {
    // Page became hidden (tab switch)
    tabSwitchCount.value++
    recordActivity('tab_switch')
    showWarning('Tab switching detected! Please stay on this page during the quiz.')
  }
  
  isPageVisible.value = isVisible
}

function handleWindowFocus() {
  if (!props.isEnabled) return
  // Page regained focus - hide warning
  hideWarning()
}

function handleWindowBlur() {
  if (!props.isEnabled) return
  
  focusLossCount.value++
  recordActivity('focus_loss')
  showWarning('Window focus lost! Please keep this window focused during the quiz.')
}

function recordActivity(type: string) {
  const totalCount = tabSwitchCount.value + focusLossCount.value
  
  emit('suspicious-activity', {
    type,
    count: totalCount
  })
  
  // Check if we should trigger auto-submit
  if (totalCount >= props.autoSubmitThreshold) {
    toast({
      title: 'Quiz Auto-Submitted',
      description: 'Too many suspicious activities detected. Your quiz has been automatically submitted.',
      variant: 'destructive',
    })
    
    emit('auto-submit-triggered')
  }
}

function showWarning(message: string) {
  warningVisible.value = true
  
  toast({
    title: 'Warning: Suspicious Activity',
    description: message,
    variant: 'destructive',
  })
  
  // Auto-hide warning after 5 seconds
  setTimeout(() => {
    hideWarning()
  }, 5000)
}

function hideWarning() {
  warningVisible.value = false
}

onMounted(() => {
  if (props.isEnabled) {
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleWindowFocus)
    window.addEventListener('blur', handleWindowBlur)
  }
})

onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('focus', handleWindowFocus)
  window.removeEventListener('blur', handleWindowBlur)
})

// Expose counts for parent component
defineExpose({
  tabSwitchCount: tabSwitchCount.value,
  focusLossCount: focusLossCount.value,
  totalSuspiciousActivities: tabSwitchCount.value + focusLossCount.value
})
</script>

<template>
  <div v-if="isEnabled" class="fixed top-4 right-4 z-50">
    <!-- Lockdown Status Indicator -->
    <div class="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
      <div class="flex items-center gap-2 text-sm">
        <Eye v-if="isPageVisible" class="h-4 w-4 text-green-600" />
        <EyeOff v-else class="h-4 w-4 text-red-600" />
        <span class="font-medium">Lockdown Active</span>
      </div>
      
      <div class="text-xs text-gray-600 mt-1">
        Violations: {{ tabSwitchCount + focusLossCount }}/{{ autoSubmitThreshold }}
      </div>
    </div>

    <!-- Warning Overlay -->
    <div 
      v-if="warningVisible"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
        <div class="flex items-center gap-3 mb-4">
          <AlertTriangle class="h-8 w-8 text-red-600" />
          <div>
            <h3 class="font-semibold text-lg">Security Warning</h3>
            <p class="text-sm text-gray-600">Suspicious activity detected</p>
          </div>
        </div>
        
        <div class="space-y-2 text-sm">
          <p><strong>Tab Switches:</strong> {{ tabSwitchCount }}</p>
          <p><strong>Focus Losses:</strong> {{ focusLossCount }}</p>
          <p class="text-red-600">
            <strong>{{ autoSubmitThreshold - (tabSwitchCount + focusLossCount) }}</strong> 
            more violations will result in auto-submission.
          </p>
        </div>
        
        <div class="mt-4 text-xs text-gray-500">
          Please keep this window focused and avoid switching tabs during the quiz.
        </div>
      </div>
    </div>
  </div>
</template>