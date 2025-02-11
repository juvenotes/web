<script setup lang="ts">
import ErrorLayout from '~/layouts/ErrorLayout.vue'
import { Link } from '@inertiajs/vue3'
import { Button } from '~/components/ui/button'

interface Props {
  error: {
    status: number
    message: string
  }
}

defineProps<Props>()
defineOptions({ layout: ErrorLayout })
</script>

<template>
  <AppHead title="Access Denied" description="Access Denied" />
  <div class="flex min-h-screen flex-col items-center justify-center">
    <div class="text-center space-y-4">
      <h1 class="text-4xl font-bold">Access Denied</h1>
      <p class="text-muted-foreground">{{ error.message }}</p>
      <p class="text-muted-foreground">Redirecting you back...</p>
      <Button asChild>
        <Link href="/learn">Go Back to Safety</Link>
      </Button>
    </div>
  </div>
</template>
