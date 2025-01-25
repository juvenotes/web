<script setup lang="ts">
defineProps<{
  status: number
  message: string
}>()
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center">
    <div class="text-center space-y-4">
      <h1 class="text-4xl font-bold">Server Error ({{ status }})</h1>
      <p class="text-muted-foreground">Something went wrong</p>
      <Button as="a" href="/">Back Home</Button>
    </div>
  </div>
</template>
