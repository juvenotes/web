<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import { Button } from '~/components/ui/button'
import type UserDto from '#dtos/user'
import { Twitter, Instagram, Linkedin } from 'lucide-vue-next'

defineProps<{
  messages: Record<string, string | Record<string, string>>
  user: UserDto | null | undefined
}>()

const logoPath = '/images/logo.png'

const handleLogout = () => {
  $inertia.post(route('auth.logout'))
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Navigation -->
    <nav class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="container mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center">
          <Link href="/">
            <img :src="logoPath" alt="Juvenotes Logo" class="h-12 w-auto" />
          </Link>
        </div>
        
        <div class="flex items-center gap-4">
          <template v-if="user">
            <span class="text-sm text-muted-foreground">
                Welcome, {{ user.fullName || user.email }}
            </span>
            <Button variant="ghost" @click="() => $inertia.post('/logout')">
              Logout
            </Button>
          </template>
          <template v-else>
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Register</Link>
            </Button>
          </template>
        </div>
      </div>
    </nav>

    <!-- Messages -->
    <div v-if="messages.success" class="container mx-auto px-4 mt-4">
      <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
        {{ messages.success }}
      </div>
    </div>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <slot />
    </main>

    <footer class="border-t bg-background/95 w-full">
      <div class="container mx-auto py-3 px-4">
        <div class="flex justify-between items-center">
          <!-- Company Info -->
          <div class="flex items-center gap-4">
            <img :src="logoPath" alt="Logo" class="h-12 w-auto" />
            <p class="text-sm text-muted-foreground">
              © 2025 Juvenotes. All rights reserved.
            </p>
          </div>

          <!-- Contact & Social -->
          <div class="flex gap-4">
            <h4 class="font-semibold">Contact Us:</h4>
            <div class="flex gap-4">
              <a href="#" class="text-[#55A9C4] hover:text-[#55A9C4]/80 transition-colors">
                <Twitter class="h-5 w-5" />
              </a>
              <a href="#" class="text-[#55A9C4] hover:text-[#55A9C4]/80 transition-colors">
                <Instagram class="h-5 w-5" />
              </a>
              <a href="#" class="text-[#55A9C4] hover:text-[#55A9C4]/80 transition-colors">
                <Linkedin class="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
    
  </div>
</template>