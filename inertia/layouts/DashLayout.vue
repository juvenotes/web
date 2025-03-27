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
} from 'lucide-vue-next'
import { Twitter, Instagram, Linkedin } from 'lucide-vue-next'
import UserDto from '#dtos/user'

defineProps<{
  messages: Record<string, string | Record<string, string>>
  user: UserDto | null | undefined
}>()

const logoPath = '/images/logo.webp'
const isMenuOpen = ref(false)
const isSidebarCollapsed = ref(true) // Keep this as true initially to avoid hydration mismatch
const isSearchOpen = ref(false) // State to manage search modal visibility

const sidebarLinks = [
  { name: 'Dashboard', href: '/learn', icon: Home },
  { name: 'Concepts', href: '/concepts', icon: BookOpen },
  { name: 'Papers', href: '/papers', icon: FileText },
  { name: 'Osces', href: '/osce', icon: Stethoscope },
  { name: 'Spot', href: '/spot', icon: Pin },
]

const closeOnClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.user-menu')) {
    isMenuOpen.value = false
  }
}

const handleResize = () => {
  // Only set initial state on first load
  if (window.innerWidth >= 1024) {
    isSidebarCollapsed.value = false // Set sidebar to open on large screens
  } else {
    isSidebarCollapsed.value = true // Collapse on small screens
  }
}

// Function to conditionally collapse sidebar on mobile
const handleSidebarLinkClick = () => {
  if (window.innerWidth < 1024) {
    isSidebarCollapsed.value = true
  }
  // On desktop, do nothing - keep sidebar open
}

onMounted(() => {
  document.addEventListener('click', closeOnClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', closeOnClickOutside)
})

onMounted(() => {
  handleResize() // Set initial state based on screen size - this will override the default true state

  // Add resize listener but with a modified function that doesn't change the state
  // once the user has manually toggled it
  let userHasToggled = false

  window.addEventListener('resize', () => {
    // Only auto-adjust on resize if the user hasn't manually toggled the sidebar
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
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <!-- Navigation - modern flat design with subtle shadow -->
    <nav
      class="sticky top-0 z-[50] w-screen bg-white border-b border-gray-100 shadow-sm backdrop-blur-md"
    >
      <div class="w-full px-4 sm:px-6">
        <div class="flex h-16 items-center justify-between">
          <!-- Left section - Logo only, no text -->
          <div class="flex items-center gap-4 w-[200px]">
            <button
              class="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-primary transition-all duration-200"
              @click="isSidebarCollapsed = !isSidebarCollapsed"
            >
              <MenuIcon class="h-5 w-5" />
            </button>
            <Link href="/learn" class="flex items-center">
              <img :src="logoPath" alt="Logo" class="h-20 w-auto" />
            </Link>
          </div>

          <!-- Center search - modern rounded style -->
          <div class="hidden md:flex flex-1 mx-auto max-w-2xl">
            <Search />
          </div>
          <button
            class="block md:hidden p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-200 ease-in-out text-gray-600"
            @click="isSearchOpen = true"
          >
            <SearchIcon class="h-5 w-5" />
          </button>

          <!-- User menu with modern avatar button -->
          <div class="relative user-menu shrink-0">
            <button
              @click="isMenuOpen = !isMenuOpen"
              class="h-9 w-9 rounded-full bg-gradient-to-br from-[#55A9C4]/90 to-[#4a91aa] flex items-center justify-center hover:shadow-md transition-all duration-200 ease-in-out"
            >
              <User class="h-4 w-4 text-white" />
            </button>

            <!-- Modern user menu dropdown with sharper design -->
            <div
              v-show="isMenuOpen"
              class="absolute right-0 mt-3 w-64 rounded-xl overflow-hidden shadow-lg bg-white border border-gray-100 py-0 z-[70]"
            >
              <!-- User Info Section -->
              <div class="px-5 py-4 bg-gradient-to-r from-[#55A9C4]/10 to-[#4a91aa]/5">
                <p class="text-sm font-medium text-gray-800">{{ user?.email }}</p>
                <p class="text-xs text-gray-500 mt-1">{{ user?.fullName }}</p>
              </div>

              <!-- Settings Links -->
              <div class="py-2">
                <Link
                  href="/settings/account"
                  class="w-full px-5 py-3 text-sm text-left hover:bg-gray-50 flex items-center transition-colors duration-200"
                >
                  <Settings class="mr-3 h-4 w-4 text-[#55A9C4]" />
                  Account Settings
                </Link>

                <Link
                  href="/settings/profile"
                  class="w-full px-5 py-3 text-sm text-left hover:bg-gray-50 flex items-center transition-colors duration-200"
                >
                  <User class="mr-3 h-4 w-4 text-[#55A9C4]" />
                  Profile Settings
                </Link>
              </div>

              <!-- Logout Section -->
              <div class="border-t border-gray-100 py-2">
                <button
                  class="w-full px-5 py-3 text-sm text-left text-red-500 hover:bg-gray-50 flex items-center transition-colors duration-200"
                  @click="$inertia.post('/logout')"
                >
                  <LogOut class="mr-3 h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Modern Search Modal with enhanced aesthetics -->
    <div
      v-show="isSearchOpen"
      class="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4"
      @click.self="isSearchOpen = false"
    >
      <div
        class="w-full max-w-lg p-6 bg-white rounded-xl shadow-xl relative border border-gray-100"
      >
        <button
          @click="isSearchOpen = false"
          class="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-all duration-200"
        >
          <ChevronRight class="h-4 w-4" />
        </button>
        <Search />
      </div>
    </div>

    <div class="flex-1 flex">
      <!-- Backdrop for sidebar on mobile -->
      <div
        v-show="!isSidebarCollapsed"
        class="fixed inset-0 bg-black/20 backdrop-blur-sm z-[25] lg:hidden"
        @click="isSidebarCollapsed = true"
      />

      <!-- Modern sidebar with card-style design -->
      <aside
        class="fixed lg:sticky top-16 bottom-0 left-0 transition-all duration-300 ease-in-out overflow-hidden flex flex-col bg-white z-[30] -translate-x-full lg:translate-x-0 shadow-lg lg:shadow-sm border-r border-gray-100"
        :class="[isSidebarCollapsed ? 'w-16' : 'w-72', !isSidebarCollapsed && 'translate-x-0']"
        style="max-height: calc(100vh - 4rem)"
      >
        <!-- Desktop Toggle Button -->
        <button
          class="hidden lg:block absolute -right-3 top-6 bg-white rounded-full p-1 border border-gray-200 shadow-md hover:shadow-lg hover:border-[#55A9C4]/30 transition-all duration-200 ease-in-out z-50"
          @click="isSidebarCollapsed = !isSidebarCollapsed"
        >
          <ChevronLeft v-if="!isSidebarCollapsed" class="h-4 w-4 text-gray-600" />
          <ChevronRight v-else class="h-4 w-4 text-gray-600" />
        </button>

        <!-- Modern sidebar navigation with active indicators -->
        <div class="px-3 pt-6 pb-2 mb-2 border-b border-gray-100">
          <div class="px-3 flex items-center mb-6" v-if="!isSidebarCollapsed">
            <span class="text-sm font-medium text-gray-400 uppercase tracking-wider"
              >Main Menu</span
            >
          </div>
        </div>

        <nav class="px-3 space-y-1 flex-1 overflow-y-auto">
          <Link
            v-for="link in sidebarLinks"
            :key="link.name"
            :href="link.href"
            class="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-[#55A9C4]/10 transition-colors duration-200 text-gray-700 hover:text-[#55A9C4] group"
            @click="handleSidebarLinkClick"
          >
            <div
              class="w-8 h-8 flex items-center justify-center rounded-lg bg-white group-hover:bg-[#55A9C4]/10 transition-colors"
            >
              <component
                :is="link.icon"
                class="h-5 w-5 shrink-0 text-gray-500 group-hover:text-[#55A9C4] transition-colors"
              />
            </div>
            <span
              :class="[
                'transition-opacity duration-300 whitespace-nowrap text-sm font-medium',
                isSidebarCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto',
              ]"
            >
              {{ link.name }}
            </span>
          </Link>
        </nav>

        <!-- Logout positioned at bottom of sidebar -->
        <!-- <div class="p-3 border-t border-gray-100">
          <button
            @click="$inertia.post('/logout')"
            class="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-red-50 transition-colors duration-200 w-full text-gray-700 hover:text-red-500 group"
          >
            <div
              class="w-8 h-8 flex items-center justify-center rounded-lg bg-white group-hover:bg-red-50 transition-colors"
            >
              <LogOut
                class="h-4 w-4 shrink-0 text-gray-500 group-hover:text-red-500 transition-colors"
              />
            </div>
            <span
              :class="[
                'transition-opacity duration-300 whitespace-nowrap text-sm font-medium',
                isSidebarCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto',
              ]"
            >
              Log out
            </span>
          </button>
        </div> -->
      </aside>

      <!-- Main content with subtle pattern background -->
      <main
        class="flex-1 p-6 md:p-8 overflow-auto bg-gray-50 bg-[url('data:image/svg+xml,%3Csvg width=%2760%27 height=%2760%27 viewBox=%270 0 60 60%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cg fill=%27none%27 fill-rule=%27evenodd%27%3E%3Cg fill=%27%23000000%27 fill-opacity=%270.03%27%3E%3Cpath d=%27M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%27/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] relative z-[0]"
      >
        <SurveyBanner />
        <slot />
      </main>
    </div>

    <!-- Minimal compact footer with social icons -->
    <footer class="w-screen border-t border-gray-200 bg-white">
      <div class="container mx-auto px-6 py-3">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <!-- Logo only -->
          <div class="flex items-center">
            <img :src="logoPath" alt="Logo" class="h-9 w-auto" />
            <span class="text-xs text-gray-400 ml-4">© 2025</span>
          </div>

          <!-- Centered links -->
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

          <!-- Social icons only, no labels -->
          <div class="flex items-center gap-3">
            <a
              href="https://x.com/juvenotes"
              class="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200 group"
              aria-label="Twitter"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Twitter class="h-4 w-4 text-gray-500 group-hover:text-[#55A9C4] transition-all" />
            </a>
            <a
              href="https://www.instagram.com/juvenotes/"
              class="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200 group"
              aria-label="Instagram"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Instagram class="h-4 w-4 text-gray-500 group-hover:text-[#55A9C4] transition-all" />
            </a>
            <a
              href="https://www.linkedin.com/company/juvenotes"
              class="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200 group"
              aria-label="LinkedIn"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Linkedin class="h-4 w-4 text-gray-500 group-hover:text-[#55A9C4] transition-all" />
            </a>
          </div>
        </div>
      </div>
    </footer>
    <ToastManager :messages="messages" />
  </div>
</template>
