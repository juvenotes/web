<script setup lang="ts">
import UserDto from '#dtos/user'
import DashLayout from '~/layouts/DashLayout.vue'
import { BookOpen, FileText, GraduationCap, Clock, Flame } from 'lucide-vue-next'
import FeatureFlagsDto from '#dtos/feature_flags'

defineProps<{
  messages: Record<string, string | Record<string, string>>
  user: UserDto | null | undefined
  features: FeatureFlagsDto
}>()

defineOptions({ layout: DashLayout })
</script>
<template>
  <AppHead title="Your dashboard" description="All available concepts in Juvenotes" />
  <div class="max-w-7xl mx-auto space-y-10">
    <!-- Hero Welcome Section -->
    <div
      class="relative bg-gradient-to-br from-primary/5 via-primary/10 to-transparent p-6 rounded-xl"
    >
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <!-- Welcome Text -->
        <div class="space-y-2">
          <h1 class="text-3xl font-bold text-primary flex items-center gap-3">
            Hey {{ user?.fullName }}!
            <GraduationCap class="h-8 w-8 text-primary/80" />
          </h1>
          <p class="text-base text-gray-600">Ready to continue your learning journey?</p>
        </div>

        <!-- Stats Grid -->
        <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <!-- Study Time -->
          <div
            class="group flex items-center gap-3 bg-white/90 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex-1 md:flex-initial"
          >
            <div class="rounded-lg bg-blue-100 p-2.5 group-hover:scale-105 transition-transform">
              <Clock class="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500">Study Time</p>
              <!-- <p class="text-xl font-bold text-primary">{{ formatTime(user?.total_study_time ?? 0) }}</p> -->
            </div>
          </div>

          <!-- Streak Counter -->
          <div
            class="group flex items-center gap-3 bg-white/90 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex-1 md:flex-initial"
          >
            <div class="rounded-lg bg-orange-100 p-2.5 group-hover:scale-105 transition-transform">
              <Flame class="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500">Streak</p>
              <!-- <p class="text-xl font-bold text-primary">{{ user?.streak_count ?? 0 }} days</p> -->
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
        @click="$inertia.visit('/papers')"
        class="group relative overflow-hidden rounded-2xl bg-white p-8 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-primary/10"
      >
        <!-- Gradient Overlay -->
        <div
          class="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        />

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
          <p class="text-gray-600  text-base leading-relaxed">
            Practice with previous examination papers to enhance your preparation
          </p>

          <!-- Stats & Info -->
          <div class="flex items-center gap-4">
            <span
              class="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
            >
              25 Papers
            </span>
            <span class="text-sm text-gray-500">Updated Weekly</span>
          </div>

          <!-- Action Indicator -->
          <div class="flex items-center text-primary text-sm font-medium">
            <span>Explore Papers</span>
            <svg
              class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
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
        <div
          class="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        />

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
          <p class="text-gray-600 text-base leading-relaxed">
            Master comprehensive study materials organized by topics
          </p>

          <!-- Stats & Info -->
          <div class="flex items-center gap-4">
            <span
              class="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
            >
              12 Units
            </span>
            <span class="text-sm text-gray-500">200+ Topics</span>
          </div>

          <!-- Action Indicator -->
          <div class="flex items-center text-primary text-sm font-medium">
            <span>Start Learning</span>
            <svg
              class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
