<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface TallyWidget {
  openPopup: (
    formId: string,
    options: {
      width?: number
      layout?: string
      emoji?: {
        text: string
        animation: string
      }
      onClose?: () => void
      onSubmit?: () => void
    }
  ) => void
}

declare global {
  interface Window {
    Tally?: TallyWidget
  }
}

const props = defineProps({
  formId: {
    type: String,
    default: 'mKaaJg',
  },
  buttonText: {
    type: String,
    default: 'Take our quick survey',
  },
  buttonClass: {
    type: String,
    default:
      'flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-all',
  },
  // Added emit for banner parent to handle visibility
  onFormInteraction: {
    type: Function,
    default: () => {},
  },
})

const isReady = ref(false)

onMounted(() => {
  // Check if Tally is loaded
  const checkTally = setInterval(() => {
    if (window.Tally) {
      isReady.value = true
      clearInterval(checkTally)
    }
  }, 300)

  // Stop checking after 5 seconds
  setTimeout(() => clearInterval(checkTally), 5000)
})

function openSurvey() {
  if (!isReady.value || !window.Tally) return

  window.Tally.openPopup(props.formId, {
    width: 500,
    layout: 'modal',
    emoji: {
      text: '👋',
      animation: 'wave',
    },
    onClose: () => {
      // Let parent know form was closed
      props.onFormInteraction('closed')
    },
    onSubmit: () => {
      // Let parent know form was submitted
      props.onFormInteraction('submitted')
    },
  })
}
</script>

<template>
  <!-- Removed v-if="shouldShow" -->
  <button :class="buttonClass" @click="openSurvey" :disabled="!isReady" type="button">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      <path d="M13 8H7"></path>
      <path d="M17 12H7"></path>
    </svg>
    {{ buttonText }}
  </button>
</template>
