<script setup lang="ts">
import { Twitter, Instagram, Linkedin } from 'lucide-vue-next'
defineProps<{
  messages: Record<string, string | Record<string, string>>
}>()

const logoPath = '/images/logo.png'
</script>

<template>
  <div>
    <header>
      <nav class="flex items-center justify-between p-6 lg:px-8">
        <div class="flex lg:flex-1">
          <Link href="/" class="-m-1.5 p-1.5">
            <span class="sr-only">Juvenotes</span>
            <img :src="logoPath" alt="Juvenotes Logo" class="h-12 w-auto" />
          </Link>
        </div>
        <!-- <div class="flex flex-1 justify-end gap-4">
          <Link href="/register" class="text-sm font-semibold leading-6 text-slate-900">
            Register
          </Link>
          <Link href="/login" class="text-sm font-semibold leading-6 text-slate-900"> Login </Link>
        </div> -->
      </nav>
    </header>
    <div class="p-6 lg:p-8">
      <div class="flex flex-col justify-center space-y-6 w-full sm:w-[350px] mx-auto">
        <slot />
      </div>
    </div>
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
