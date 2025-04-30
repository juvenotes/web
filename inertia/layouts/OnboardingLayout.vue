<script setup lang="ts">
import UserDto from '#dtos/user'

defineProps<{
  messages: Record<string, string | Record<string, string>>
  user: UserDto | null
}>()
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Header -->
    <header class="bg-white border-b px-4 py-3 shadow-sm">
      <div class="container mx-auto flex items-center justify-between">
        <!-- Logo -->
        <div>
          <!-- <img src="/images/logo.svg" alt="Juvenotes" class="h-8" /> -->
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="flex-1 container mx-auto px-4 py-8 max-w-2xl">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t py-4 px-4">
      <div class="container mx-auto text-center text-sm text-gray-500">
        <p>&copy; {{ new Date().getFullYear() }} Juvenotes. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>
