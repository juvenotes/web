<script setup lang="ts">
import { Button } from '~/components/ui/button'
</script>

<template>
  <AppHead title="Page not found" description="Page not found" />
  <div class="flex min-h-screen flex-col items-center justify-center">
    <div class="text-center space-y-4">
      <h1 class="text-4xl font-bold">Page not found</h1>
      <p class="text-muted-foreground">This page does not exist.</p>
      <Button as="a" href="/">Back Home</Button>
    </div>
  </div>
</template>
