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
</script>

<template>
  <div class="min-h-screen flex flex-col bg-background">
    <!-- Navigation -->
    <nav
      class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div class="container mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center">
          <Link href="/">
            <img :src="logoPath" alt="Juvenotes Logo" class="h-12 w-auto" />
          </Link>
        </div>

        <div class="flex items-center gap-4">
          <template v-if="user">
            <span class="text-sm text-muted-foreground"> Welcome, {{ user?.fullName }} </span>
            <Button variant="ghost" @click="() => $inertia.post('/logout')"> Logout </Button>
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

    <!-- Main Content -->
    <main class="flex-grow container mx-auto px-4 py-8">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="w-screen border-t bg-background/95">
      <div class="container mx-auto px-4 sm:px-6 py-2">
        <div class="flex flex-col md:flex-row items-center justify-between gap-6">
          <!-- Company Info -->
          <div class="flex items-center gap-4">
            <img :src="logoPath" alt="Logo" class="h-10 w-auto" />
            <p class="text-sm text-muted-foreground">© 2025 Juvenotes. All rights reserved.</p>
          </div>

          <!-- Links and Social -->
          <div class="flex items-center gap-8">
            <!-- Legal Links -->
            <div class="flex items-center gap-6">
              <Link
                href="/terms"
                class="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Terms
              </Link>
              <Link
                href="/privacy"
                class="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Privacy
              </Link>
              <!-- Button to open cookie preferences -->
              <a
                href="#"
                class="text-sm text-muted-foreground hover:text-primary transition-colors"
                id="open_preferences_center"
                >Update cookies preferences</a
              >
            </div>

            <!-- Social Links -->
            <div class="flex items-center gap-3">
              <span class="text-sm font-medium text-muted-foreground">Contact us:</span>
              <div class="flex gap-2">
                <a
                  href="https://x.com/juvenotes"
                  class="p-2 rounded-full bg-[#55A9C4]/10 hover:bg-[#55A9C4]/20 transition-colors group"
                  aria-label="Twitter"
                >
                  <Twitter
                    class="h-4 w-4 text-[#55A9C4] group-hover:scale-110 transition-transform"
                  />
                </a>
                <a
                  href="https://www.instagram.com/juvenotes/"
                  class="p-2 rounded-full bg-[#55A9C4]/10 hover:bg-[#55A9C4]/20 transition-colors group"
                  aria-label="Instagram"
                >
                  <Instagram
                    class="h-4 w-4 text-[#55A9C4] group-hover:scale-110 transition-transform"
                  />
                </a>
                <a
                  href="https://www.linkedin.com/company/juvenotes"
                  class="p-2 rounded-full bg-[#55A9C4]/10 hover:bg-[#55A9C4]/20 transition-colors group"
                  aria-label="LinkedIn"
                >
                  <Linkedin
                    class="h-4 w-4 text-[#55A9C4] group-hover:scale-110 transition-transform"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>

    <ToastManager :messages="messages" />
  </div>
</template>
