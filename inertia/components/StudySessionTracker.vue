<template>
  <!-- This component has no visible UI -->
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import axios from 'axios'

const props = defineProps({
  sessionId: {
    type: Number,
    required: true,
  },
})

// Session state
const currentSessionId = ref(props.sessionId)
const sessionWasPausedForInactivity = ref(false)
let idleTimer = null
let heartbeatInterval = null
const IDLE_TIMEOUT = 5 * 60 * 1000 // 5 minutes in milliseconds
const HEARTBEAT_INTERVAL = 30000 // 30 seconds

// Watch for session ID changes
watch(
  () => props.sessionId,
  (newSessionId) => {
    currentSessionId.value = newSessionId
  }
)

// Handle visibility changes
function handleVisibilityChange() {
  if (document.hidden) {
    // User switched tabs or minimized browser - pause session
    if (currentSessionId.value) {
      axios
        .post(`/api/study-sessions/${currentSessionId.value}/pause`, { reason: 'visibility' })
        .catch((error) => console.error('Failed to pause session:', error))
    }
  } else {
    // User returned to tab - resume session
    if (currentSessionId.value) {
      axios
        .post(`/api/study-sessions/${currentSessionId.value}/resume`)
        .catch((error) => console.error('Failed to resume session:', error))
    }
  }
}

// Reset the idle timer
function resetIdleTimer() {
  clearTimeout(idleTimer)

  // If session was paused due to inactivity, resume it
  if (sessionWasPausedForInactivity.value && currentSessionId.value) {
    axios
      .post(`/api/study-sessions/${currentSessionId.value}/resume`)
      .then(() => {
        sessionWasPausedForInactivity.value = false
      })
      .catch((error) => console.error('Failed to resume session:', error))
  }

  // Set new idle timer
  idleTimer = setTimeout(() => {
    // User is idle - pause the session
    if (currentSessionId.value) {
      axios
        .post(`/api/study-sessions/${currentSessionId.value}/pause`, { reason: 'idle' })
        .then(() => {
          sessionWasPausedForInactivity.value = true
        })
        .catch((error) => console.error('Failed to pause session for inactivity:', error))
    }
  }, IDLE_TIMEOUT)
}

// Heartbeat to detect overlapping sessions
function startHeartbeat() {
  heartbeatInterval = setInterval(() => {
    if (currentSessionId.value && !document.hidden && !sessionWasPausedForInactivity.value) {
      axios
        .post(`/api/study-sessions/${currentSessionId.value}/heartbeat`)
        .then((response) => {
          // Handle conflicting sessions
          if (response.data.conflictingSession) {
            // Update local state with the consolidated session
            currentSessionId.value = response.data.sessionId
          }
        })
        .catch((error) => console.error('Heartbeat failed:', error))
    }
  }, HEARTBEAT_INTERVAL)
}

onMounted(() => {
  // Set up visibility change detection
  document.addEventListener('visibilitychange', handleVisibilityChange)

  // Set up idle detection
  const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
  activityEvents.forEach((event) => {
    document.addEventListener(event, resetIdleTimer)
  })

  // Start initial idle timer
  resetIdleTimer()

  // Start heartbeat for session overlap detection
  startHeartbeat()
})

onUnmounted(() => {
  // Clean up visibility listener
  document.removeEventListener('visibilitychange', handleVisibilityChange)

  // Clean up idle detection
  const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
  activityEvents.forEach((event) => {
    document.removeEventListener(event, resetIdleTimer)
  })

  // Clear timers
  clearTimeout(idleTimer)
  clearInterval(heartbeatInterval)

  // Pause session on component unmount
  if (currentSessionId.value) {
    axios
      .post(`/api/study-sessions/${currentSessionId.value}/pause`, { reason: 'unmount' })
      .catch((error) => console.error('Failed to pause session on unmount:', error))
  }
})
</script>
