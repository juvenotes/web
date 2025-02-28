<script setup lang="ts">
import { AlertTriangle, Info, X } from 'lucide-vue-next'
import { ref, onMounted } from 'vue'

// Use refs to track visibility state of each banner
const showWarning = ref(true)
const showInfo = ref(true)

// Load saved preferences on component mount
onMounted(() => {
  // Check if the user has previously closed the banners
  const warningClosed = localStorage.getItem('disclaimerWarningClosed') === 'true'
  const infoClosed = localStorage.getItem('disclaimerInfoClosed') === 'true'

  // Set initial states based on saved preferences
  if (warningClosed) showWarning.value = false
  if (infoClosed) showInfo.value = false
})

// Close functions that save preference
const closeWarning = () => {
  showWarning.value = false
  localStorage.setItem('disclaimerWarningClosed', 'true')
}

const closeInfo = () => {
  showInfo.value = false
  localStorage.setItem('disclaimerInfoClosed', 'true')
}
</script>

<template>
  <div class="space-y-3 mb-6">
    <!-- Warning disclaimer -->
    <Transition name="fade">
      <div
        v-if="showWarning"
        class="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start"
      >
        <AlertTriangle class="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
        <div class="ml-3 flex-1">
          <h3 class="text-sm font-medium text-amber-800">DISCLAIMER</h3>
          <p class="mt-1 text-sm text-amber-700">
            The information contained in this site is provided on "as is" basis with no guarantees
            of accuracy, usefulness or timeliness. The provided contents and information are
            academic in nature and shall serve for information and study purposes only.
          </p>
        </div>
        <button
          @click="closeWarning"
          class="shrink-0 ml-2 text-amber-400 hover:text-amber-500 focus:outline-none"
          aria-label="Close disclaimer"
        >
          <X class="h-5 w-5" />
        </button>
      </div>
    </Transition>

    <!-- Info disclaimer -->
    <Transition name="fade">
      <div
        v-if="showInfo"
        class="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start"
      >
        <Info class="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
        <div class="ml-3 flex-1">
          <p class="text-sm text-blue-700">
            While we have taken every precaution to ensure that the content of this site is both
            accurate, errors can occur. We are open to correction. In case of errors and omissions,
            kindly use the feedback button (soon available to all questions).
          </p>
        </div>
        <button
          @click="closeInfo"
          class="shrink-0 ml-2 text-blue-400 hover:text-blue-500 focus:outline-none"
          aria-label="Close info"
        >
          <X class="h-5 w-5" />
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
