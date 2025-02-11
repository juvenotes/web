<script setup lang="ts">
import ErrorLayout from '~/layouts/ErrorLayout.vue'
defineProps<{
  status: number
  message: string
}>()
defineOptions({ layout: ErrorLayout })
</script>

<template>
  <AppHead title="Page not found" description="Page not found" />
  <div class="flex min-h-screen flex-col items-center justify-center">
    <div class="text-center space-y-4">
      <h1 class="text-4xl font-bold">Page not found</h1>
      <p class="text-muted-foreground">This page does not exist.</p>
      <p class="text-muted-foreground">Let us go back to knowledge.</p>
      <Button as="a" href="/learn">Go Back to Safety</Button>
    </div>
  </div>
</template>
