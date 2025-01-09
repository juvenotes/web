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

const formatTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

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
  <div class="max-w-7xl mx-auto space-y-10">
    <!-- Hero Welcome Section -->
    <div class="relative bg-gradient-to-br from-primary/5 via-primary/10 to-transparent p-6 rounded-xl">
  <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
    <!-- Welcome Text -->
    <div class="space-y-2">
      <h1 class="text-3xl font-bold text-primary/90 flex items-center gap-3">
        Hey {{ user?.fullName }}! 
        <GraduationCap class="h-8 w-8 text-primary/80" />
      </h1>
      <p class="text-base text-muted-foreground/90">
        Ready to continue your learning journey?
      </p>
    </div>

    <!-- Stats Grid -->
    <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
      <!-- Study Time -->
      <div class="group flex items-center gap-3 bg-white/80 hover:bg-white/95 p-4 rounded-xl shadow-sm hover:shadow transition-all duration-300 flex-1 md:flex-initial">
        <div class="rounded-lg bg-blue-50 p-2.5 group-hover:scale-105 transition-transform">
          <Clock class="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <p class="text-sm font-medium text-muted-foreground">Study Time</p>
          <p class="text-xl font-bold text-primary">{{ formatTime(user?.total_study_time ?? 0) }}</p>
        </div>
      </div>

      <!-- Streak Counter -->
      <div class="group flex items-center gap-3 bg-white/80 hover:bg-white/95 p-4 rounded-xl shadow-sm hover:shadow transition-all duration-300 flex-1 md:flex-initial">
        <div class="rounded-lg bg-orange-50 p-2.5 group-hover:scale-105 transition-transform">
          <Flame class="h-5 w-5 text-orange-600" />
        </div>
        <div>
          <p class="text-sm font-medium text-muted-foreground">Streak</p>
          <p class="text-xl font-bold text-primary">{{ user?.streak_count ?? 0 }} days</p>
        </div>
      </div>
    </div>
  </div>
</div>

    <!-- Feature Cards Grid -->
    <!-- Feature Cards -->
<div class="grid md:grid-cols-2 gap-8">
  <!-- Past Papers Card -->
  <div
    @click="$inertia.visit('/pastpapers')"
    class="group relative overflow-hidden rounded-2xl bg-white p-8 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-primary/10"
  >
    <!-- Gradient Overlay -->
    <div class="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    
    <!-- Content -->
    <div class="relative space-y-6">
      <!-- Icon & Title -->
      <div class="flex items-center gap-4">
        <div class="p-4 rounded-2xl bg-primary/5 group-hover:bg-primary/10 transition-colors">
          <FileText class="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
        </div>
        <h3 class="text-2xl font-semibold text-primary">Past Papers</h3>
      </div>
      
      <!-- Description -->
      <p class="text-muted-foreground/90 text-base leading-relaxed">
        Practice with previous examination papers to enhance your preparation
      </p>
      
      <!-- Stats & Info -->
      <div class="flex items-center gap-4">
        <span class="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
          25 Papers
        </span>
        <span class="text-sm text-muted-foreground">Updated Weekly</span>
      </div>
      
      <!-- Action Indicator -->
      <div class="flex items-center text-primary text-sm font-medium">
        <span>Explore Papers</span>
        <svg class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </div>
    </div>
  </div>

  <!-- Concepts Card -->
  <div
    @click="$inertia.visit('/concepts')"
    class="group relative overflow-hidden rounded-2xl bg-white p-8 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-primary/10"
  >
    <!-- Gradient Overlay -->
    <div class="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    
    <!-- Content -->
    <div class="relative space-y-6">
      <!-- Icon & Title -->
      <div class="flex items-center gap-4">
        <div class="p-4 rounded-2xl bg-primary/5 group-hover:bg-primary/10 transition-colors">
          <BookOpen class="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
        </div>
        <h3 class="text-2xl font-semibold text-primary">Concepts</h3>
      </div>
      
      <!-- Description -->
      <p class="text-muted-foreground/90 text-base leading-relaxed">
        Master comprehensive study materials organized by topics
      </p>
      
      <!-- Stats & Info -->
      <div class="flex items-center gap-4">
        <span class="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
          12 Units
        </span>
        <span class="text-sm text-muted-foreground">200+ Topics</span>
      </div>
      
      <!-- Action Indicator -->
      <div class="flex items-center text-primary text-sm font-medium">
        <span>Start Learning</span>
        <svg class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </div>
    </div>
  </div>
</div>
  </div>
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
