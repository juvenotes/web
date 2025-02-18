<script setup lang="ts">
import AdminLayout from '~/layouts/AdminLayout.vue'
import { Link } from '@inertiajs/vue3'
import type InstitutionDto from '#dtos/institution'
import { ArrowLeft, GraduationCap, School } from 'lucide-vue-next'

defineOptions({ layout: AdminLayout })

interface Course {
  id: number
  name: string
}

interface CourseLevel {
  levelName: string
  courses: Course[]
}

interface Props {
  institution: InstitutionDto
  coursesByLevel: Record<number, CourseLevel>
}

defineProps<Props>()
</script>

<template>
  <AppHead :title="institution.name" description="Institution details" />
  <div class="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
    <!-- Header with Back Button -->
    <div class="flex items-center gap-4">
      <Link
        href="/manage/institutions"
        class="flex items-center gap-2 text-primary hover:text-primary/70 transition-colors"
      >
        <ArrowLeft class="h-5 w-5" />
        <span class="text-sm font-medium">Back to Institutions</span>
      </Link>
    </div>

    <!-- Institution Info Card -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex items-start justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ institution.name }}</h1>
          <p class="text-gray-500 mt-1">{{ institution.branch || 'Main Branch' }}</p>
        </div>
        <span
          class="px-3 py-1 rounded-full text-sm font-medium"
          :class="institution.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
        >
          {{ institution.isActive ? 'Active' : 'Inactive' }}
        </span>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div class="bg-primary/5 rounded-lg p-4 flex items-center gap-3">
          <School class="h-5 w-5 text-primary" />
          <div>
            <p class="text-sm text-gray-600">Total Courses</p>
            <p class="text-xl font-semibold text-primary">
              {{
                Object.values(coursesByLevel).reduce((sum, level) => sum + level.courses.length, 0)
              }}
            </p>
          </div>
        </div>

        <div class="bg-primary/5 rounded-lg p-4 flex items-center gap-3">
          <GraduationCap class="h-5 w-5 text-primary" />
          <div>
            <p class="text-sm text-gray-600">Education Levels</p>
            <p class="text-xl font-semibold text-primary">
              {{ Object.keys(coursesByLevel).length }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Courses by Level -->
    <div
      v-for="(level, levelId) in coursesByLevel"
      :key="levelId"
      class="bg-white rounded-lg shadow"
    >
      <div class="p-4 border-b">
        <h2 class="text-lg font-semibold text-gray-900">{{ level.levelName }}</h2>
      </div>

      <div class="p-4">
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="course in level.courses"
            :key="course.id"
            class="p-4 rounded-lg border bg-gray-50/50"
          >
            <h3 class="font-medium text-gray-900">{{ course.name }}</h3>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
