<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import { 
  LayoutDashboard, 
  BookOpen, 
  FileQuestion,
  FileText,
  Users,
  Settings,
  Menu
} from 'lucide-vue-next'
import { ref } from 'vue'
import type UserDto from '#dtos/user'

defineProps<{
  messages: Record<string, string | Record<string, string>>
  user: UserDto | null
}>()

const isSidebarOpen = ref(true)

const menuItems = [
  { name: 'Dashboard', href: '/manage', icon: LayoutDashboard },
  { name: 'Concepts', href: '/manage/concepts', icon: BookOpen },
  { name: 'Questions', href: '/manage/questions', icon: FileQuestion },
  { name: 'Papers', href: '/manage/papers', icon: FileText },
  { name: 'Users', href: '/manage/users', icon: Users },
  { name: 'Settings', href: '/manage/settings', icon: Settings }
]
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Top Navigation -->
    <nav class="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div class="px-4 h-16 flex items-center justify-between">
        <button @click="isSidebarOpen = !isSidebarOpen" class="p-2">
          <Menu class="w-5 h-5" />
        </button>
        <div class="flex items-center gap-4">
          <span class="text-sm text-muted-foreground">{{ user?.email }}</span>
          <Button variant="ghost" @click="$inertia.post('/logout')">Logout</Button>
        </div>
      </div>
    </nav>

    <div class="flex">
      <!-- Sidebar -->
      <aside 
        :class="[
          'w-64 border-r transition-all duration-300',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        ]"
      >
        <nav class="p-4 space-y-2">
          <Link 
            v-for="item in menuItems" 
            :key="item.name"
            :href="item.href"
            class="flex items-center gap-2 p-2 rounded-lg hover:bg-accent transition-colors"
            :class="{ 'bg-accent': $page.url.startsWith(item.href) }"
          >
            <component :is="item.icon" class="w-5 h-5" />
            {{ item.name }}
          </Link>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>