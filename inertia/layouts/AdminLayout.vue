<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import AdminSearch from '~/components/AdminSearch.vue'
import {
  LayoutDashboard,
  BookOpen,
  School,
  FileText,
  Users,
  // Settings,
  Menu,
  Stethoscope,
  Pin,
  X,
  Calendar,
  GraduationCap,
  FileQuestion,
} from 'lucide-vue-next'
import { ref } from 'vue'
import type UserDto from '#dtos/user'

defineProps<{
  messages: Record<string, string | Record<string, string>>
  user: UserDto | null
}>()

const isSidebarOpen = ref(false) // Default closed for mobile

const menuItems = [
  { name: 'Dashboard', href: '/manage', icon: LayoutDashboard },
  { name: 'Concepts', href: '/manage/concepts', icon: BookOpen },
  { name: 'Papers', href: '/manage/papers', icon: FileText },
  { name: 'Osce', href: '/manage/osce', icon: Stethoscope },
  { name: 'Spot', href: '/manage/spot', icon: Pin },
  { name: 'Today', href: '/manage/today', icon: Calendar },
  { name: 'Feedback', href: '/manage/feedback', icon: FileQuestion },
  { name: 'Users', href: '/manage/users', icon: Users },
  { name: 'Institutions', href: '/manage/institutions', icon: School },
  { name: 'Courses', href: '/manage/courses', icon: GraduationCap },
]
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Top Navigation -->
    <nav
      class="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60"
    >
      <div class="px-4 h-16 flex items-center justify-between">
        <button @click="isSidebarOpen = !isSidebarOpen" class="p-2 -ml-2 md:hidden">
          <Menu v-if="!isSidebarOpen" class="w-5 h-5" />
          <X v-else class="w-5 h-5" />
        </button>
        <!-- Search - Full width -->
        <div class="flex-1 mx-auto max-w-2xl">
          <AdminSearch />
        </div>
        <Button
          variant="ghost"
          @click="$inertia.post('/logout')"
          class="bg-primary/40 rounded-lg px-4 py-2 hover:bg-primary/20 transition-colors"
          >Logout</Button
        >
      </div>
    </nav>

    <div class="flex">
      <!-- Mobile Overlay -->
      <div
        v-if="isSidebarOpen"
        class="fixed inset-0 z-30 bg-black/20 md:hidden"
        @click="isSidebarOpen = false"
      />

      <!-- Sidebar -->
      <aside
        :class="[
          'fixed md:static inset-y-0 left-0 z-30 w-64 border-r bg-background transition-transform duration-300 md:translate-x-0',
          'bg-white shadow-lg md:shadow-none', // Always visible and clear on mobile
          'overflow-y-auto', // Scrollable if needed
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
        ]"
        style="max-height: 100vh;"
      >
        <!-- Sidebar navigation -->
        <nav class="p-4 space-y-2">
          <Link
            v-for="item in menuItems"
            :key="item.name"
            :href="item.href"
            class="flex items-center gap-2 p-2 rounded-lg text-foreground transition-colors"
            :class="{
              'bg-accent': $page.url === item.href,
              'hover:bg-accent/10': $page.url !== item.href,
            }"
            @click="isSidebarOpen = false"
          >
            <component :is="item.icon" class="w-5 h-5" />
            <span class="block">{{ item.name }}</span>
          </Link>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 p-4 md:p-6 w-full">
        <slot />
      </main>
      <ToastManager :messages="messages" />
    </div>
  </div>
</template>
