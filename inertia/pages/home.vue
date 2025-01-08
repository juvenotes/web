<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import Toaster from '@/components/ui/toast/Toaster.vue'
const logoPath = '/images/logo.png'
defineProps<{
  messages: Record<string, string | Record<string, string>>
  user: UserDto | null | undefined
}>()
</script>

<template>

  <Head title="Juvenotes - Study Smart, Excel Easy" />

  <div class="min-h-screen bg-background">

    <!-- Hero Section -->
    <main class="container mx-auto px-4 py-16 text-center">
      <h1 class="text-4xl font-bold text-primary mb-4">Welcome to Juvenotes</h1>
      <p class="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
        Your comprehensive medical education platform. Study smarter, not harder with our
        carefully curated resources and practice materials.
      </p>
      <Button size="lg" asChild>
        <a href="/register">Get Started Today</a>
      </Button>
    </main>
  </div>
  <Toaster :messages="messages" />
</template>