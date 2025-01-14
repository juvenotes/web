<script setup lang="ts">
import AuthLayout from '~/layouts/AuthLayout.vue'
import { onMounted } from 'vue'
import { router } from '@inertiajs/vue3'
import { Loader } from 'lucide-vue-next'

defineOptions({ layout: AuthLayout })

onMounted(() => {
  setTimeout(() => {
    router.visit('/learn')
  }, 3000)
})
</script>

<template>
  <AppHead title="Email Verified" description="Your email has been verified" />
  <div class="min-h-[80vh] flex items-center justify-center px-4">
    <div class="w-full max-w-md text-center space-y-6">
      <div class="bg-white rounded-lg shadow p-8 space-y-4">
        <div
          class="text-green-500 mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-green-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-8 w-8"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
        </div>

        <h1 class="text-2xl font-bold text-gray-900">Email Verified!</h1>
        <p class="text-gray-600">Your email has been successfully verified.</p>

        <div class="flex items-center justify-center gap-2 text-sm text-gray-500">
          <Loader class="h-4 w-4 animate-spin" />
          <span>Redirecting you to the learning dashboard...</span>
        </div>
      </div>
    </div>
  </div>
</template>
