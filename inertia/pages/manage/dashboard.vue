<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import AdminLayout from '~/layouts/AdminLayout.vue'
import type StatsDto from '#dtos/stats'
import { BookOpen, FileText, Stethoscope, FileQuestion } from 'lucide-vue-next'
import { computed } from 'vue'

defineOptions({ layout: AdminLayout })

type StatKey = keyof StatsDto

const props = defineProps<{
  stats: StatsDto
}>()

const stats = computed(() => props.stats)

const statItems: Array<{
  key: StatKey
  label: string
  icon: any
}> = [
  { key: 'concepts', label: 'Total Concepts', icon: BookOpen },
  { key: 'questions', label: 'Total Questions', icon: FileQuestion },
  { key: 'papers', label: 'Total Papers', icon: FileText },
]

const quickLinks = [
  {
    title: 'Concepts',
    description: 'Create and organize concepts',
    href: '/manage/concepts',
    icon: BookOpen,
  },
  {
    title: 'OSCE',
    description: 'Create and manage OSCEs',
    href: '/manage/osce',
    icon: Stethoscope,
  },
  {
    title: 'Past Papers',
    description: 'Organize examination papers',
    href: '/manage/papers',
    icon: FileText,
  },
  {
    title: 'Feedback',
    description: 'Review and resolve question feedback',
    href: '/manage/feedback',
    icon: FileQuestion,
  },
]
</script>

<template>
  <AppHead title="Admin Dashboard" description="Manage our content from here" />
  <div class="container mx-auto p-4 sm:p-6">
    <div class="flex flex-col sm:flex-row items-center justify-between mb-6 gap-2 sm:gap-0">
      <h1 class="text-2xl font-bold">Dashboard</h1>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8">
      <div v-for="item in statItems" :key="item.key" class="p-4 sm:p-6 bg-card rounded-lg border flex flex-col items-start">
        <div class="flex items-center gap-2">
          <component :is="item.icon" class="w-5 h-5 text-primary" />
          <h3 class="font-medium text-muted-foreground">{{ item.label }}</h3>
        </div>
        <p class="text-2xl font-bold mt-2">{{ stats[item.key] }}</p>
      </div>
    </div>

    <!-- Quick Links -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      <Link
        v-for="link in quickLinks"
        :key="link.title"
        :href="link.href"
        class="p-4 sm:p-6 rounded-lg border hover:border-primary transition-colors group flex flex-col h-full"
      >
        <div class="flex items-center gap-2 mb-2">
          <component
            :is="link.icon"
            class="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors"
          />
          <h3 class="font-semibold">{{ link.title }}</h3>
        </div>
        <p class="text-sm text-muted-foreground flex-1">{{ link.description }}</p>
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
