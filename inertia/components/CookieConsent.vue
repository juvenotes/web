<script setup lang="ts">
import { ref, onMounted } from 'vue'

const showBanner = ref(true)

onMounted(() => {
  setTimeout(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (consent) {
      showBanner.value = false
    }
  }, 5000)
})

const acceptCookies = () => {
  localStorage.setItem('cookie-consent', 'accepted')
  showBanner.value = false
}

const declineCookies = () => {
  localStorage.setItem('cookie-consent', 'declined')
  showBanner.value = false
}
</script>

<template>
  <!-- Modal overlay for cookie consent -->
  <div v-if="showBanner" class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-60 z-50">
    <div class="bg-white p-8 rounded-xl shadow-lg w-11/12 max-w-lg">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Cookie Consent</h2>
        <button @click="declineCookies" class="text-gray-600 hover:text-gray-800 text-2xl font-semibold">
          &times;
        </button>
      </div>
      <p class="text-lg text-gray-600 mb-6">
        We use cookies to improve your experience on our site. By clicking "Accept", you consent to our use of cookies.
      </p>
      <div class="flex justify-between gap-6">
        <button
          @click="declineCookies"
          class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg text-lg font-medium hover:bg-gray-300 transition-colors"
        >
          Decline
        </button>
        <button
          @click="acceptCookies"
          class="px-6 py-3 bg-primary text-white rounded-lg text-lg font-medium hover:bg-primary/90 transition-colors"
          :style="{ backgroundColor: '#CDE5ED' }"
        >
          Accept
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom Primary Color */
.bg-primary {
  background-color: #CDE5ED;
}

.fixed {
  transition: opacity 0.5s ease-in-out;
}
</style>
