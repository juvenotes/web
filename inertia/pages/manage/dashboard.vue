<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import AdminLayout from '~/layouts/AdminLayout.vue'
import {
  BookOpen,
  FileText,
  Stethoscope,
  FileQuestion,
  Pin,
  Calendar,
  Users,
  School,
  GraduationCap,
} from 'lucide-vue-next'

defineOptions({ layout: AdminLayout })

const props = defineProps<{ stats: Record<string, number>; canManageAdmin: boolean }>()

const menuItems = [
  { name: 'Concepts', href: '/manage/concepts', icon: BookOpen },
  { name: 'Papers', href: '/manage/papers', icon: FileText },
  { name: 'Osce', href: '/manage/osce', icon: Stethoscope },
  { name: 'Spot', href: '/manage/spot', icon: Pin },
  { name: 'Question of the day', href: '/manage/today', icon: Calendar },
  { name: 'Feedback', href: '/manage/feedback', icon: FileQuestion },
]

const adminMenuItems = [
  { name: 'Users', href: '/manage/users', icon: Users },
  { name: 'Institutions', href: '/manage/institutions', icon: School },
  { name: 'Courses', href: '/manage/courses', icon: GraduationCap },
]
</script>

<template>
  <AppHead title="Admin dashboard" description="All we have" />
  <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
    <div class="flex flex-col sm:flex-row items-center justify-between mb-6 gap-2 sm:gap-0">
      <h1 class="text-2xl font-bold">Dashboard</h1>
    </div>
    <!-- Dashboard Stats (Concepts, Papers, Questions) -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
      <div
        class="rounded-xl bg-gradient-to-br from-blue-100 via-white to-blue-50 shadow flex flex-col items-center p-6 border border-blue-100"
      >
        <component :is="BookOpen" class="w-10 h-10 mb-3 text-blue-600" />
        <div class="text-3xl font-extrabold text-blue-900">{{ props.stats.concepts ?? 0 }}</div>
        <div class="text-sm text-blue-700 font-semibold mt-1 tracking-wide uppercase">Concepts</div>
      </div>
      <div
        class="rounded-xl bg-gradient-to-br from-fuchsia-100 via-white to-fuchsia-50 shadow flex flex-col items-center p-6 border border-fuchsia-100"
      >
        <component :is="FileText" class="w-10 h-10 mb-3 text-fuchsia-600" />
        <div class="text-3xl font-extrabold text-fuchsia-900">{{ props.stats.papers ?? 0 }}</div>
        <div class="text-sm text-fuchsia-700 font-semibold mt-1 tracking-wide uppercase">
          Papers
        </div>
      </div>
      <div
        class="rounded-xl bg-gradient-to-br from-emerald-100 via-white to-emerald-50 shadow flex flex-col items-center p-6 border border-emerald-100"
      >
        <component :is="FileQuestion" class="w-10 h-10 mb-3 text-emerald-600" />
        <div class="text-3xl font-extrabold text-emerald-900">{{ props.stats.questions ?? 0 }}</div>
        <div class="text-sm text-emerald-700 font-semibold mt-1 tracking-wide uppercase">
          Questions
        </div>
      </div>
    </div>
    <!-- Cards for each menu item -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <Link
        v-for="item in menuItems"
        :key="item.name + '-card'"
        :href="item.href"
        class="group block rounded-2xl bg-white shadow-lg hover:shadow-xl border border-slate-100 hover:border-blue-200 transition-all p-6 text-center cursor-pointer hover:-translate-y-1"
      >
        <div class="flex justify-center mb-3">
          <component
            :is="item.icon"
            class="w-10 h-10 text-blue-500 group-hover:text-blue-700 transition-colors"
          />
        </div>
        <div class="text-lg font-semibold text-slate-800 group-hover:text-blue-700">
          {{ item.name }}
        </div>
      </Link>
      <Link
        v-for="item in adminMenuItems"
        v-if="props.canManageAdmin"
        :key="item.name + '-admin-card'"
        :href="item.href"
        class="group block rounded-2xl bg-white shadow-lg hover:shadow-xl border border-slate-100 hover:border-blue-200 transition-all p-6 text-center cursor-pointer hover:-translate-y-1"
      >
        <div class="flex justify-center mb-3">
          <component
            :is="item.icon"
            class="w-10 h-10 text-blue-500 group-hover:text-blue-700 transition-colors"
          />
        </div>
        <div class="text-lg font-semibold text-slate-800 group-hover:text-blue-700">
          {{ item.name }}
        </div>
      </Link>
    </div>
  </div>
</template>

<style scoped>
@media (max-width: 640px) {
  .container {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
  .grid {
    gap: 1rem;
  }
  .p-4 {
    padding: 1rem !important;
  }
}
</style>
