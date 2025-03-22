<script setup lang="ts">
import { ref } from 'vue'
import TallySurveyButton from './TallySurveyButton.vue'

const isVisible = ref(true)

function hideBanner() {
  isVisible.value = false
  localStorage.setItem('tally_survey_status', 'closed')
}
</script>

<template>
  <div 
    v-if="isVisible" 
    class="rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 p-4 my-4 shadow-sm"
  >
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="flex-1">
        <h3 class="font-medium text-gray-800">Help us improve Juvenotes!</h3>
        <p class="text-sm text-gray-600 mt-1">We'd love your feedback on how we can make Juvenotes better for you.</p>
      </div>
      
      <div class="flex items-center gap-2 self-end sm:self-center mt-3 sm:mt-0">
        <TallySurveyButton buttonClass="flex items-center gap-2 bg-primary text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-primary/90 transition-all text-sm whitespace-nowrap" />
        
        <button 
          @click="hideBanner" 
          class="p-1.5 rounded-full hover:bg-gray-200/50 text-gray-500 transition-colors shrink-0"
          aria-label="Dismiss"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6 6 18"></path>
            <path d="m6 6 12 12"></path>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>