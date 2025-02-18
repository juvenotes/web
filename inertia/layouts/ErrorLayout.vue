<script setup lang="ts">
import { Link } from '@inertiajs/vue3'

const logoPath = '/images/logo.webp'
</script>

<template>
  <div class="min-h-screen bg-background flex flex-col">
    <!-- Header -->
    <header class="border-b">
      <nav class="flex items-center justify-between p-6 lg:px-8">
        <Link href="/" class="-m-1.5 p-1.5">
          <img :src="logoPath" alt="Juvenotes Logo" class="h-12 w-auto" />
        </Link>
      </nav>
    </header>

    <!-- Error Content -->
    <main class="flex-grow flex items-center justify-center">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="border-t py-4">
      <div class="container mx-auto px-4 text-center text-sm text-muted-foreground">
        © 2025 Juvenotes. All rights reserved.
      </div>
    </footer>
  </div>
</template>
