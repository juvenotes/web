<script setup lang="ts">
import ErrorLayout from '~/layouts/ErrorLayout.vue'
defineProps<{
  status: number
  message: string
}>()
defineOptions({ layout: ErrorLayout })
</script>

<template>
  <AppHead title="Server error" description="Server Error" />
  <div class="flex min-h-screen flex-col items-center justify-center">
    <div class="text-center space-y-4">
      <h1 class="text-4xl font-bold">Server Error</h1>
      <p class="text-muted-foreground">Something went wrong</p>
      <p class="text-muted-foreground">Let us go back to knowledge.</p>
      <Button as="a" href="/learn">Go Back to Safety</Button>
    </div>
  </div>
</template>
