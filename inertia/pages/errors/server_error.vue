<script setup lang="ts">
import { Button } from '~/components/ui/button'

defineProps<{ error: any }>()
</script>

<template>
      <AppHead title="Server error" description="Server has an error" />
  <div class="flex min-h-screen flex-col items-center justify-center">
    <div class="text-center space-y-4">
      <h1 class="text-4xl font-bold">Server Error</h1>
      <p class="text-muted-foreground">{{ error.message }}</p>
      <Button as="a" href="/learn">Back to Learn</Button>
    </div>
  </div>
</template>
