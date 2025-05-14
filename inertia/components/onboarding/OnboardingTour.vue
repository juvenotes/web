<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import UserDto from '#dtos/user'

const props = defineProps<{
  user: UserDto | null | undefined
}>()

const hasSeenTour = ref(false)
const isActive = ref(false)
const currentStep = ref(0)

// Define the tour steps
const steps = [
  {
    target: 'search',
    title: 'Search',
    content: 'Search for topics across our platform.',
    element: null as HTMLElement | null,
  },
  {
    target: 'concepts',
    title: 'Medical Concepts',
    content: 'Explore our concepts organized by topics and training levels.',
    element: null as HTMLElement | null,
  },
  {
    target: 'papers',
    title: 'Past Papers',
    content: 'Practice with previous exam papers and test your knowledge.',
    element: null as HTMLElement | null,
  },
  {
    target: 'spot',
    title: 'SPOT Questions',
    content: 'Sharpen your identification skills with SPOT questions.',
    element: null as HTMLElement | null,
  },
  {
    target: 'osce',
    title: 'OSCE Questions',
    content: 'Practice with clinical scenario-based OSCE questions.',
    element: null as HTMLElement | null,
  },
]

// Track whether we're on a mobile device
const isMobile = ref(false)

// Check if the user has already seen the tour and find target elements
onMounted(() => {
  // Set initial mobile state
  checkMobileState()
  
  // Add window resize listener
  window.addEventListener('resize', checkMobileState)
  
  initializeTour()
})

// Clean up event listener
onUnmounted(() => {
  window.removeEventListener('resize', checkMobileState)
})

function checkMobileState() {
  isMobile.value = window.innerWidth < 768 // Standard mobile breakpoint
}

// Initialize the tour with delay to ensure DOM elements are fully loaded
async function initializeTour() {
  const userEmail = props.user?.email

  if (userEmail) {
    const tourKey = `juvenotes_tour_completed_${userEmail}`
    hasSeenTour.value = localStorage.getItem(tourKey) === 'true'

    // Wait for DOM to be fully rendered
    await nextTick()

    // Small delay to ensure all elements are fully mounted
    setTimeout(() => {
      // Find all target elements
      steps.forEach((step) => {
        step.element = document.querySelector(`[data-tour="${step.target}"]`)
        if (!step.element) {
          console.warn(`Element with data-tour="${step.target}" not found`)
        }
      })

      // Only start the tour if the user hasn't seen it before and all elements are found
      if (!hasSeenTour.value && steps.some((step) => step.element)) {
        isActive.value = true
        // Position the tooltip after activating
        setTimeout(updatePosition, 100)
      }
    }, 1000)
  }
}

// Watch for changes in the current step to update the position
watch(currentStep, () => {
  nextTick(() => updatePosition())
})

// Watch for changes in active state
watch(isActive, (val) => {
  if (val) {
    nextTick(() => updatePosition())
  }
})

// Watch for changes in screen size
watch(isMobile, () => {
  nextTick(() => updatePosition())
})

// Calculate and update the position of the tooltip
function updatePosition() {
  if (!isActive.value || currentStep.value >= steps.length) return

  const step = steps[currentStep.value]
  if (!step.element) {
    console.warn(`Element for step ${currentStep.value} not found`)
    return
  }

  const rect = step.element.getBoundingClientRect()
  const tooltip = document.querySelector('.onboarding-tooltip') as HTMLElement

  if (!tooltip) {
    console.warn('Tooltip element not found')
    return
  }

  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const tooltipHeight = tooltip.offsetHeight
  const tooltipWidth = tooltip.offsetWidth

  // Position strategy changes based on mobile or desktop
  if (isMobile.value) {
    // On mobile, position at bottom of viewport with fixed width
    tooltip.style.left = '50%'
    tooltip.style.width = 'calc(100% - 32px)' // Full width minus margins
    tooltip.style.maxWidth = '100%'
    tooltip.style.transform = 'translateX(-50%)'
    tooltip.style.bottom = '16px' // Fixed distance from bottom
    tooltip.style.top = 'auto' // Clear top position
    
    // Always use top arrow on mobile (pointing to element from bottom of screen)
    tooltip.setAttribute('data-arrow', 'none') // Hide arrow on mobile
  } else {
    // On desktop, restore original width
    tooltip.style.width = '320px' // Original width
    tooltip.style.maxWidth = '90vw'
    
    // Default to positioning below the element
    let topPosition = rect.bottom + 10
    let arrowPosition = 'top' // Default arrow position (pointing up)

    // For steps 2-5 (card elements), position the tooltip to the right of the card
    if (currentStep.value >= 1) {
      if (rect.right + tooltipWidth + 10 < viewportWidth) {
        // If there's enough space to the right, position it there
        tooltip.style.left = `${rect.right + 10}px`
        tooltip.style.transform = 'none' // Remove any transform
        arrowPosition = 'left' // Arrow pointing left
      } else if (rect.left > tooltipWidth + 10) {
        // If not enough space on right but enough on left, position it to the left
        tooltip.style.left = `${rect.left - 10}px`
        tooltip.style.transform = 'translateX(-100%)' // Move fully to the left
        arrowPosition = 'right' // Arrow pointing right
      } else {
        // Default to below if there's not enough horizontal space
        tooltip.style.left = `${rect.left + rect.width / 2}px`
        tooltip.style.transform = 'translateX(-50%)'
        arrowPosition = 'top' // Arrow pointing up
      }
    } else {
      // For step 1 (search), position below
      tooltip.style.left = `${rect.left + rect.width / 2}px`
      tooltip.style.transform = 'translateX(-50%)'
      arrowPosition = 'top' // Arrow pointing up
    }

    // Check if tooltip would go outside viewport at bottom and adjust if needed
    if (topPosition + tooltipHeight > viewportHeight - 16) {
      // If there's no room below, put it above
      topPosition = rect.top - tooltipHeight - 10
      if (arrowPosition === 'top') arrowPosition = 'bottom' // Flip arrow when positioning above
    }

    // Set vertical position
    tooltip.style.top = `${topPosition}px`
    tooltip.style.bottom = 'auto' // Clear bottom position

    // Update arrow class based on position
    tooltip.setAttribute('data-arrow', arrowPosition)
  }

  // Add highlight to the current step's element
  step.element.classList.add('onboarding-highlight')

  // Make sure the highlighted element is visible by scrolling to it if needed
  ensureElementVisible(step.element)

  // Remove highlight from other elements
  steps.forEach((s, i) => {
    if (i !== currentStep.value && s.element) {
      s.element.classList.remove('onboarding-highlight')
    }
  })

  // Ensure the tooltip is visible
  tooltip.style.visibility = 'visible'
  tooltip.style.opacity = '1'
}

// Ensure the highlighted element is visible in the viewport
function ensureElementVisible(element: HTMLElement) {
  const rect = element.getBoundingClientRect()
  const isInViewport = (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= window.innerHeight &&
    rect.right <= window.innerWidth
  )
  
  if (!isInViewport) {
    // If not in viewport, scroll element into view with some padding
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

function nextStep() {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
  }
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

function completeTour() {
  const userEmail = props.user?.email
  if (userEmail) {
    const tourKey = `juvenotes_tour_completed_${userEmail}`
    localStorage.setItem(tourKey, 'true')
    hasSeenTour.value = true
  }

  // Remove highlight from all elements
  steps.forEach((step) => {
    if (step.element) {
      step.element.classList.remove('onboarding-highlight')
    }
  })

  isActive.value = false
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isActive && currentStep < steps.length"
      class="onboarding-tooltip fixed z-[1001] bg-white shadow-lg rounded-lg p-4 transition-all duration-300"
      :class="{ 'mobile-tooltip': isMobile }"
    >
      <!-- Dynamic arrows based on position (hidden on mobile) -->
      <div
        v-if="!isMobile"
        class="arrow absolute w-4 h-4 bg-white rotate-45"
      ></div>

      <div class="relative">
        <!-- Step Number -->
        <div
          class="absolute -top-2 -right-2 bg-[#55A9C4] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium"
        >
          {{ currentStep + 1 }}/{{ steps.length }}
        </div>

        <!-- Content -->
        <h3 class="font-bold text-gray-800 mb-1">{{ steps[currentStep]?.title }}</h3>
        <p class="text-gray-600 mb-4">{{ steps[currentStep]?.content }}</p>

        <!-- Navigation -->
        <div class="flex justify-between items-center">
          <button
            v-if="currentStep > 0"
            @click="prevStep"
            class="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Previous
          </button>
          <div class="flex-grow"></div>
          <button
            v-if="currentStep < steps.length - 1"
            @click="nextStep"
            class="px-4 py-1.5 bg-[#55A9C4] text-white rounded-md text-sm hover:bg-[#4a91aa] transition-colors"
          >
            Next
          </button>
          <button
            v-else
            @click="completeTour"
            class="px-4 py-1.5 bg-[#55A9C4] text-white rounded-md text-sm hover:bg-[#4a91aa] transition-colors"
          >
            Finish
          </button>
        </div>
      </div>
    </div>

    <!-- Overlay when tour is active -->
    <div v-if="isActive" class="fixed inset-0 bg-black/30 z-[999]" @click="completeTour"></div>
  </Teleport>
</template>

<style>
.onboarding-highlight {
  position: relative;
  z-index: 1000;
  box-shadow: 0 0 0 4px rgba(85, 169, 196, 0.5);
  border-radius: 4px;
}

/* Force the tooltip to display when active */
.onboarding-tooltip {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  pointer-events: auto !important;
}

/* Mobile tooltip styles */
.mobile-tooltip {
  max-width: calc(100vw - 32px) !important;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.15) !important;
}

/* Arrow positioning */
.onboarding-tooltip .arrow {
  position: absolute;
}

.onboarding-tooltip[data-arrow='top'] .arrow {
  top: -2px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
}

.onboarding-tooltip[data-arrow='bottom'] .arrow {
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
}

.onboarding-tooltip[data-arrow='left'] .arrow {
  left: -2px;
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
}

.onboarding-tooltip[data-arrow='right'] .arrow {
  right: -2px;
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
}

.onboarding-tooltip[data-arrow='none'] .arrow {
  display: none;
}

/* Media query for mobile */
@media (max-width: 767px) {
  .onboarding-tooltip {
    bottom: 16px !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
    width: calc(100% - 32px) !important;
    max-width: 100% !important;
  }
}
</style>