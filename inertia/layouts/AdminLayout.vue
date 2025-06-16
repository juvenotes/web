<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import AdminSearch from '~/components/AdminSearch.vue'
import {
  LayoutDashboard,
  BookOpen,
  School,
  FileText,
  Users,
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
  canManageAdmin?: boolean
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
  // Admin-only items
  { name: 'Users', href: '/manage/users', icon: Users, adminOnly: true },
  { name: 'Institutions', href: '/manage/institutions', icon: School, adminOnly: true },
  { name: 'Courses', href: '/manage/courses', icon: GraduationCap, adminOnly: true },
]
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 dark:bg-background dark:bg-none">
    <!-- Top Navigation -->
    <nav
      class="sticky top-0 z-40 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm dark:bg-background/80 dark:border-border dark:backdrop-blur-md"
    >
      <div class="px-4 h-16 flex items-center justify-between">
        <button @click="isSidebarOpen = !isSidebarOpen" class="p-2 -ml-2 md:hidden">
          <Menu v-if="!isSidebarOpen" class="w-6 h-6 text-primary" />
          <X v-else class="w-6 h-6 text-primary" />
        </button>
        <!-- Search - Full width -->
        <div class="flex-1 mx-auto max-w-2xl">
          <AdminSearch />
        </div>
        <Button
          variant="ghost"
          @click="$inertia.post('/logout')"
          class="bg-primary/40 rounded-lg px-4 py-2 hover:bg-primary/20 transition-colors shadow"
          >Logout</Button
        >
      </div>
    </nav>

    <div class="flex">
      <!-- Mobile Overlay -->
      <div
        v-if="isSidebarOpen"
        class="fixed inset-0 z-30 bg-black/30 md:hidden"
        @click="isSidebarOpen = false"
      />

      <!-- Sidebar -->
      <aside
        :class="[
          'fixed md:sticky top-0 md:top-0 left-0 z-30 md:z-10 w-64 md:w-60 border-r bg-white/95 dark:bg-background/95 dark:border-border transition-transform duration-300 md:translate-x-0',
          'shadow-xl md:shadow-none',
          'overflow-y-auto',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
        ]"
        style="max-height: 100vh; min-height: 100vh"
      >
        <!-- Sidebar navigation -->
        <nav class="p-4 md:p-6 space-y-2 md:space-y-1 overflow-y-auto h-full">
          <Link
            v-for="item in menuItems"
            :key="item.name"
            :href="item.href"
            class="flex items-center gap-3 p-3 rounded-xl text-foreground font-medium transition-colors text-base md:text-lg"
            :class="{
              'bg-blue-100 text-blue-700 shadow dark:bg-primary/20 dark:text-primary dark:shadow-none': $page.url === item.href,
              'hover:bg-blue-50 dark:hover:bg-primary/10': $page.url !== item.href,
            }"
            @click="isSidebarOpen = false"
          >
            <component :is="item.icon" class="w-6 h-6" />
            <span class="block">{{ item.name }}</span>
          </Link>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 p-2 sm:p-4 md:p-8 w-full max-w-full md:max-w-[calc(100vw-15rem)] mx-auto">
        <slot />
      </main>
      <ToastManager :messages="messages" />
    </div>
  </div>
</template>
