<script setup lang="ts">
import { Button } from '~/components/ui/button'
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center">
    <div class="text-center space-y-4">
      <h1 class="text-4xl font-bold">Page not found</h1>
      <p class="text-muted-foreground">This page does not exist.</p>
      <Button as="a" href="/learn">Back to Learn</Button>
    </div>
  </div>
</template>