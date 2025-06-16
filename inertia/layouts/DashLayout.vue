<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Link } from '@inertiajs/vue3'
import Search from '~/components/Search.vue'
import {
  User,
  Settings,
  LogOut,
  Home,
  BookOpen,
  FileText,
  Menu as MenuIcon,
  ChevronLeft,
  ChevronRight,
  Search as SearchIcon,
  Stethoscope,
  Pin,
  Library,
} from 'lucide-vue-next'
import { Twitter, Instagram, Linkedin } from 'lucide-vue-next'
import UserDto from '#dtos/user'

defineProps<{
  messages: Record<string, string | Record<string, string>>
  user: UserDto | null | undefined
}>()

const logoPath = '/images/logo.webp'
const isMenuOpen = ref(false)
const isSidebarCollapsed = ref(true)
const isSearchOpen = ref(false)

const sidebarLinks = [
  { name: 'Dashboard', href: '/learn', icon: Home },
  { name: 'Library', href: '/library', icon: Library },
  { name: 'Concepts', href: '/concepts', icon: BookOpen },
  { name: 'Papers', href: '/papers', icon: FileText },
  { name: 'OSCE', href: '/osce', icon: Stethoscope },
  { name: 'Spot', href: '/spot', icon: Pin },
]

const closeOnClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.user-menu')) {
    isMenuOpen.value = false
  }
}

const handleResize = () => {
  if (window.innerWidth >= 1024) {
    isSidebarCollapsed.value = false
  } else {
    isSidebarCollapsed.value = true
  }
}

const handleSidebarLinkClick = () => {
  if (window.innerWidth < 1024) {
    isSidebarCollapsed.value = true
  }
}

onMounted(() => {
  document.addEventListener('click', closeOnClickOutside)
  handleResize()

  let userHasToggled = false

  window.addEventListener('resize', () => {
    if (!userHasToggled) {
      if (window.innerWidth >= 1024) {
        isSidebarCollapsed.value = false
      } else {
        isSidebarCollapsed.value = true
      }
    }
  })

  // Add event listener to track when user manually toggles the sidebar
  const toggleButton = document.querySelector('.lg\\:hidden[class*="rounded-lg"]')
  const desktopToggleButton = document.querySelector('.lg\\:block[class*="rounded-full"]')

  if (toggleButton) {
    toggleButton.addEventListener('click', () => {
      userHasToggled = true
    })
  }

  if (desktopToggleButton) {
    desktopToggleButton.addEventListener('click', () => {
      userHasToggled = true
    })
  }
})

onUnmounted(() => {
  document.removeEventListener('click', closeOnClickOutside)
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50 dark:bg-background">
    <!-- Navigation Bar -->
    <nav class="sticky top-0 z-50 w-full bg-white border-b border-gray-100 dark:bg-background dark:border-border shadow-sm">
      <div class="px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 items-center justify-between">
          <!-- Left Section -->
          <div class="flex items-center gap-4 min-w-[160px]">
            <button
              class="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
              @click="isSidebarCollapsed = !isSidebarCollapsed"
            >
              <MenuIcon class="h-5 w-5" />
            </button>
            <Link href="/learn" class="flex items-center">
              <img :src="logoPath" alt="Logo" class="h-9 w-auto" />
            </Link>
          </div>

          <!-- Center Search -->
          <div class="hidden md:flex flex-1 mx-4 max-w-xl">
            <Search />
          </div>
          <button
            class="md:hidden p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-gray-500"
            @click="isSearchOpen = true"
          >
            <SearchIcon class="h-5 w-5" />
          </button>

          <!-- User Menu -->
          <div class="relative user-menu ml-4">
            <button
              @click="isMenuOpen = !isMenuOpen"
              class="h-8 w-8 rounded-full bg-gradient-to-br from-[#55A9C4] to-[#4a91aa] flex items-center justify-center hover:shadow-sm transition-shadow"
            >
              <User class="h-4 w-4 text-white" />
            </button>

            <div
              v-show="isMenuOpen"
              class="absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-white border border-gray-100 py-1 z-50"
            >
              <div class="px-4 py-3 border-b border-gray-100">
                <p class="text-sm font-medium text-gray-900">{{ user?.fullName }}</p>
                <p class="text-xs text-gray-500 truncate">{{ user?.email }}</p>
              </div>
              <div class="py-1">
                <Link
                  href="/settings/account"
                  class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Settings class="mr-3 h-4 w-4 text-gray-500" />
                  Account
                </Link>
                <Link
                  href="/settings/profile"
                  class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <User class="mr-3 h-4 w-4 text-gray-500" />
                  Profile
                </Link>
              </div>
              <div class="py-1 border-t border-gray-100">
                <button
                  class="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                  @click="$inertia.post('/logout')"
                >
                  <LogOut class="mr-3 h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Search Modal -->
    <div
      v-show="isSearchOpen"
      class="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4"
      @click.self="isSearchOpen = false"
    >
      <div class="w-full max-w-md bg-white rounded-xl shadow-xl p-6 relative">
        <button
          @click="isSearchOpen = false"
          class="absolute top-5 right-5 p-1 rounded-full hover:bg-gray-50"
        >
          <ChevronRight class="h-5 w-5 text-gray-500" />
        </button>
        <Search />
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex flex-1">
      <!-- Sidebar Backdrop -->
      <div
        v-show="!isSidebarCollapsed"
        class="fixed inset-0 bg-black/20 lg:hidden z-40"
        @click="isSidebarCollapsed = true"
      />

      <!-- Sidebar (original behavior preserved) -->
      <aside
        class="fixed lg:sticky top-16 bottom-0 left-0 transition-all duration-300 ease-in-out overflow-hidden flex flex-col bg-white dark:bg-background z-40 -translate-x-full lg:translate-x-0 shadow-lg lg:shadow-sm border-r border-gray-100 dark:border-border"
        :class="[isSidebarCollapsed ? 'w-16' : 'w-64', !isSidebarCollapsed && 'translate-x-0']"
        style="max-height: calc(100vh - 4rem)"
      >
        <!-- Desktop Toggle Button -->
        <button
          class="hidden lg:block absolute -right-3 top-6 bg-white rounded-full p-1 border border-gray-200 shadow-sm hover:shadow-md z-50"
          @click="isSidebarCollapsed = !isSidebarCollapsed"
        >
          <ChevronLeft v-if="!isSidebarCollapsed" class="h-4 w-4 text-gray-600" />
          <ChevronRight v-else class="h-4 w-4 text-gray-600" />
        </button>

        <div class="h-full flex flex-col">
          <div class="px-4 pt-6 pb-2">
            <div class="px-3 mb-6" v-if="!isSidebarCollapsed">
              <span class="text-xs font-medium text-gray-400 uppercase tracking-wider">Menu</span>
            </div>
          </div>

          <nav class="flex-1 px-3 space-y-1 overflow-y-auto">
            <Link
              v-for="link in sidebarLinks"
              :key="link.name"
              :href="link.href"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#55A9C4]/5 text-gray-700 hover:text-[#55A9C4] transition-colors"
              @click="handleSidebarLinkClick"
            >
              <div class="w-8 h-8 flex items-center justify-center rounded-lg">
                <component
                  :is="link.icon"
                  class="h-5 w-5 text-gray-500 group-hover:text-[#55A9C4]"
                />
              </div>
              <span
                :class="[
                  'text-sm font-medium whitespace-nowrap transition-opacity duration-300',
                  isSidebarCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto',
                ]"
              >
                {{ link.name }}
              </span>
            </Link>
          </nav>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main
        class="flex-1 p-6 lg:p-8 overflow-auto bg-gray-50 dark:bg-transparent bg-[url('data:image/svg+xml,%3Csvg width=%2760%27 height=%2760%27 viewBox=%270 0 60 60%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cg fill=%27none%27 fill-rule=%27evenodd%27%3E%3Cg fill=%27%23000000%27 fill-opacity=%270.03%27%3E%3Cpath d=%27M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%27/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] dark:bg-none"
      >
        <slot />
      </main>
    </div>

    <!-- Footer -->
    <footer class="border-t border-gray-200 dark:border-border bg-white dark:bg-background py-4">
      <div class="px-6 mx-auto max-w-7xl">
        <div class="flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <img :src="logoPath" alt="Logo" class="h-6 w-auto" />
            <span class="text-xs text-gray-400">© {{ new Date().getFullYear() }}</span>
          </div>

          <div class="flex items-center gap-6">
            <Link
              href="/terms"
              class="text-xs text-gray-500 hover:text-[#55A9C4] transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              class="text-xs text-gray-500 hover:text-[#55A9C4] transition-colors"
            >
              Privacy
            </Link>
            <a
              href="#"
              class="text-xs text-gray-500 hover:text-[#55A9C4] transition-colors"
              id="open_preferences_center"
            >
              Cookies
            </a>
          </div>

          <div class="flex items-center gap-3">
            <a
              href="https://x.com/juvenotes"
              class="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              target="_blank"
              rel="noopener"
            >
              <Twitter class="h-4 w-4 text-gray-500 hover:text-[#55A9C4]" />
            </a>
            <a
              href="https://www.instagram.com/juvenotes/"
              class="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              target="_blank"
              rel="noopener"
            >
              <Instagram class="h-4 w-4 text-gray-500 hover:text-[#55A9C4]" />
            </a>
            <a
              href="https://www.linkedin.com/company/juvenotes"
              class="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              target="_blank"
              rel="noopener"
            >
              <Linkedin class="h-4 w-4 text-gray-500 hover:text-[#55A9C4]" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* Original sidebar behavior styles */
aside {
  transition: transform 0.3s ease, width 0.3s ease;
}

/* Accessibility improvements */
button:focus {
  outline: 2px solid #55A9C4;
  outline-offset: 2px;
}

/* Smooth transitions for other elements */
.transition-colors {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
</style>