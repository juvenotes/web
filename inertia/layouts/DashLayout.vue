<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Link } from '@inertiajs/vue3'
import { Input } from '~/components/ui/input'
import {
  Search,
  User,
  Settings,
  LogOut,
  Home,
  BookOpen,
  FileText,
  Menu as MenuIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-vue-next'
import { Twitter, Instagram, Linkedin } from 'lucide-vue-next'
import UserDto from '#dtos/user'

defineProps<{
  messages: Record<string, string | Record<string, string>>
  user: UserDto | null | undefined
}>()

const logoPath = '/images/logo.png'
const isMenuOpen = ref(false)
const isSidebarCollapsed = ref(true)

const sidebarLinks = [
  { name: 'Dashboard', href: '/learn', icon: Home },
  { name: 'Concepts', href: '/concepts', icon: BookOpen },
  { name: 'Papers', href: '/papers', icon: FileText },
]

const closeOnClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.user-menu')) {
    isMenuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeOnClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', closeOnClickOutside)
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-background">
    <!-- Navigation -->
    <nav class="sticky top-0 z-[100] w-screen border-b bg-background/95 backdrop-blur">
      <div class="w-full px-4 sm:px-6">
        <div class="flex h-16 items-center justify-between">
          <div class="flex items-center gap-4">
            <button class="lg:hidden" @click="isSidebarCollapsed = !isSidebarCollapsed">
              <MenuIcon class="h-6 w-6" />
            </button>
            <Link href="/learn">
              <img :src="logoPath" alt="Logo" class="h-14 w-auto" />
            </Link>
          </div>

          <div class="flex-1 max-w-md mx-4 hidden md:block">
            <div class="relative">
              <Search class="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search...is not available yet" class="w-full pl-8 bg-muted/50" />
            </div>
          </div>

          <div class="relative user-menu">
            <button
              @click="isMenuOpen = !isMenuOpen"
              class="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
            >
              <User class="h-4 w-4" />
            </button>

            <div
              v-show="isMenuOpen"
              class="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white border py-1 z-[110]"
            >
              <!-- User Info Section -->
              <div class="px-4 py-2 border-b">
                <p class="text-sm font-medium">{{ user?.email }}</p>
                <p class="text-xs text-muted-foreground">{{ user?.fullName }}</p>
              </div>

              <!-- Settings Links -->
              <Link
                href="/settings/account"
                class="w-full px-4 py-2 text-sm text-left hover:bg-muted/50 flex items-center"
              >
                <Settings class="mr-2 h-4 w-4" />
                Account Settings
              </Link>

              <Link
                href="/settings/profile"
                class="w-full px-4 py-2 text-sm text-left hover:bg-muted/50 flex items-center"
              >
                <User class="mr-2 h-4 w-4" />
                Profile Settings
              </Link>

              <!-- Logout Section -->
              <div class="border-t mt-2">
                <button
                  class="w-full px-4 py-2 text-sm text-left text-destructive hover:bg-muted/50 flex items-center"
                  @click="$inertia.post('/logout')"
                >
                  <LogOut class="mr-2 h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <div class="flex-1 flex">
      <div
        v-show="!isSidebarCollapsed"
        class="fixed inset-0 bg-black/20 z-[80] lg:hidden"
        @click="isSidebarCollapsed = true"
      />

      <aside
        class="fixed lg:sticky top-16 bottom-0 left-0 transition-all duration-300 ease-in-out overflow-hidden flex flex-col border-r bg-white z-[90] -translate-x-full lg:translate-x-0"
        :class="[isSidebarCollapsed ? 'w-16' : 'w-64', !isSidebarCollapsed && 'translate-x-0']"
      >
        <!-- Desktop Toggle Button -->
        <button
          class="hidden lg:block absolute -right-3 top-4 bg-background rounded-full p-1.5 border shadow-sm hover:bg-muted/50 transition-colors z-50"
          @click="isSidebarCollapsed = !isSidebarCollapsed"
        >
          <ChevronLeft v-if="!isSidebarCollapsed" class="h-4 w-4" />
          <ChevronRight v-else class="h-4 w-4" />
        </button>

        <nav class="p-4 space-y-2 mt-12 flex-1">
          <Link
            v-for="link in sidebarLinks"
            :key="link.name"
            :href="link.href"
            class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors"
            @click="isSidebarCollapsed = true"
          >
            <component :is="link.icon" class="h-4 w-4 shrink-0" />
            <span
              :class="[
                'transition-opacity duration-300 whitespace-nowrap',
                isSidebarCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto',
              ]"
            >
              {{ link.name }}
            </span>
          </Link>
        </nav>

        <div class="border-t p-4">
          <button
            @click="$inertia.post('/logout')"
            class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors w-full text-destructive"
          >
            <LogOut class="h-4 w-4 shrink-0" />
            <span
              :class="[
                'transition-opacity duration-300 whitespace-nowrap',
                isSidebarCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto',
              ]"
            >
              Log out
            </span>
          </button>
        </div>
      </aside>

      <main class="flex-1 p-8 overflow-auto bg-gray-50/50 relative z-0">
        <slot />
      </main>
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
