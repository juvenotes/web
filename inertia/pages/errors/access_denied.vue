<script setup lang="ts">
import ErrorLayout from '~/layouts/ErrorLayout.vue'
import { Link } from '@inertiajs/vue3'
import { Button } from '~/components/ui/button'
import { ShieldX } from 'lucide-vue-next'

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
  <AppHead :title="`${error.status} - Access Denied`" description="Access Denied" />
  <div class="flex min-h-screen flex-col items-center justify-center bg-background">
    <div class="text-center space-y-6">
      <ShieldX class="h-16 w-16 mx-auto text-destructive" />
      <div class="space-y-2">
        <h1 class="text-4xl font-bold text-foreground">Access Denied</h1>
        <p class="text-lg text-muted-foreground">{{ error.message }}</p>
      </div>
      <div class="space-y-4">
        <p class="text-sm text-muted-foreground">You'll be redirected back in a few seconds...</p>
        <Button asChild variant="default" class="min-w-32">
          <Link href="/learn"> Go Back </Link>
        </Button>
      </div>
    </div>
  </div>
</template>
