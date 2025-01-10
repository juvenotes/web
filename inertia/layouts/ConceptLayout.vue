<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Link } from '@inertiajs/vue3'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { 
  Search, 
  User, 
  Settings, 
  LogOut,
  Home,
  BookOpen,
  FileText,
  BarChart2,
  Menu as MenuIcon,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Clock,
  Flame
} from 'lucide-vue-next'
import UserDto from '#dtos/user'

defineProps<{
  user: UserDto | null | undefined
}>()

const logoPath = '/images/logo.png'
const isMenuOpen = ref(false)
const isSidebarCollapsed = ref(false)

const sidebarLinks = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Courses', href: '/courses', icon: BookOpen },
  { name: 'Resources', href: '/resources', icon: FileText },
  { name: 'Progress', href: '/progress', icon: BarChart2 }
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
    <nav class="sticky top-0 z-50 w-screen border-b bg-background/95 backdrop-blur">
      <div class="w-full px-4 sm:px-6">
        <div class="flex h-16 items-center justify-between">
          <!-- Logo -->
          <div class="flex items-center gap-4">
            <button 
              class="lg:hidden"
              @click="isSidebarCollapsed = !isSidebarCollapsed"
            >
              <MenuIcon class="h-6 w-6" />
            </button>
            <Link href="/dashboard">
              <img :src="logoPath" alt="Logo" class="h-8 w-auto" />
            </Link>
          </div>

          <!-- Search -->
          <div class="flex-1 max-w-md mx-4 hidden md:block">
            <div class="relative">
              <Search class="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                class="w-full pl-8 bg-muted/50"
              />
            </div>
          </div>

          <!-- User Menu -->
          <div class="relative user-menu">
            <button
              @click="isMenuOpen = !isMenuOpen"
              class="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
            >
              <User class="h-4 w-4" />
            </button>

            <Transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="transform scale-95 opacity-0"
              enter-to-class="transform scale-100 opacity-100"
              leave-active-class="transition duration-75 ease-in"
              leave-from-class="transform scale-100 opacity-100"
              leave-to-class="transform scale-95 opacity-0"
            >
              <div
                v-show="isMenuOpen"
                class="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white border py-1 z-50"
              >
                <div class="px-4 py-2 border-b">
                  <p class="text-sm font-medium">{{ user?.email }}</p>
                  <p class="text-xs text-muted-foreground">{{ user?.fullName }}</p>
                </div>
                
                <button 
                  class="w-full px-4 py-2 text-sm text-left hover:bg-muted/50 flex items-center"
                  @click="$inertia.visit('/settings')"
                >
                  <Settings class="mr-2 h-4 w-4" />
                  Update Email
                </button>
                
                <button 
                  class="w-full px-4 py-2 text-sm text-left text-destructive hover:bg-muted/50 flex items-center"
                  @click="$inertia.visit('/delete-account')"
                >
                  <LogOut class="mr-2 h-4 w-4" />
                  Delete Account
                </button>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </nav>

    <div class="flex-1 flex">
      <!-- Sidebar -->
      <aside 
        class="border-r bg-muted/10 fixed lg:sticky top-16 bottom-0 left-0 transition-all duration-300 ease-in-out overflow-hidden flex flex-col"
        :class="[isSidebarCollapsed ? 'w-16' : 'w-64', 'lg:translate-x-0']"
      >
        <!-- Toggle Button -->
        <button
          @click="isSidebarCollapsed = !isSidebarCollapsed"
          class="absolute -right-3 top-4 bg-background rounded-full p-1.5 border shadow-sm hover:bg-muted/50 transition-colors z-50"
        >
          <ChevronLeft v-if="!isSidebarCollapsed" class="h-4 w-4" />
          <ChevronRight v-else class="h-4 w-4" />
        </button>

        <!-- Navigation Links -->
        <nav class="p-4 space-y-2 mt-12 flex-1">
          <Link
            v-for="link in sidebarLinks"
            :key="link.name"
            :href="link.href"
            class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <component :is="link.icon" class="h-4 w-4 shrink-0" />
            <span 
              :class="[
                'transition-opacity duration-300 whitespace-nowrap',
                isSidebarCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto'
              ]"
            >
              {{ link.name }}
            </span>
          </Link>
        </nav>

        <!-- Logout Section -->
        <div class="border-t p-4">
          <button
            @click="$inertia.post('/logout')"
            class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors w-full text-destructive"
          >
            <LogOut class="h-4 w-4 shrink-0" />
            <span 
              :class="[
                'transition-opacity duration-300 whitespace-nowrap',
                isSidebarCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto'
              ]"
            >
              Log out
            </span>
          </button>
        </div>
      </aside>

      <!-- Main Content -->
 <!-- Main Content -->
 <main class="flex-1 p-8 overflow-auto bg-gray-50/50">
        <slot />
</main>
    </div>
 <!-- Footer -->
     <footer class="w-screen border-t bg-background/95">
      <div class="w-full px-4 sm:px-6 py-4">
        <div class="flex flex-col md:flex-row items-center justify-between gap-4">
          <!-- Logo & Copyright -->
          <div class="flex items-center gap-4">
            <img :src="logoPath" alt="Logo" class="h-8 w-auto" />
            <p class="text-sm text-muted-foreground">
              © 2024 Juvenotes. All rights reserved.
            </p>
          </div>

          <!-- Legal Links -->
          <div class="flex items-center gap-4">
            <Link href="/terms" class="text-sm text-muted-foreground hover:text-primary">
              Terms
            </Link>
            <Link href="/privacy" class="text-sm text-muted-foreground hover:text-primary">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
