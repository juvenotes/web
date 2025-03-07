<script setup lang="ts">
import UserDto from '#dtos/user'
import DashLayout from '~/layouts/DashLayout.vue'
import { BookOpen, FileText, GraduationCap, Clock, Flame, ChevronRight } from 'lucide-vue-next'
// import FeatureFlagsDto from '#dtos/feature_flags'
import StatsDto from '#dtos/stats'

defineProps<{
  messages: Record<string, string | Record<string, string>>
  user: UserDto | null | undefined
  // features: FeatureFlagsDto
  stats: StatsDto
}>()

defineOptions({ layout: DashLayout })
</script>
<template>
  <AppHead title="Your dashboard" description="All available concepts in Juvenotes" />
  <div class="max-w-7xl mx-auto space-y-10 px-4 sm:px-6 py-6">
    <!-- Hero Welcome Section -->
    <div
      class="relative bg-gradient-to-br from-primary/10 via-primary/15 to-transparent p-8 rounded-2xl shadow-sm backdrop-blur-sm border border-primary/10"
    >
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <!-- Welcome Text -->
        <div class="space-y-3">
          <h1 class="text-3xl font-bold text-primary flex items-center gap-3">
            Hey {{ user?.fullName }}!
            <GraduationCap class="h-8 w-8 text-primary/80 animate-pulse" />
          </h1>
          <p class="text-base text-gray-600">Ready to continue your learning journey?</p>
        </div>

        <!-- Stats Grid -->
        <div class="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <!-- Study Time -->
          <div
            class="group flex items-center gap-4 bg-white/90 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex-1 md:flex-initial border border-blue-100/50"
          >
            <div class="rounded-lg bg-blue-100 p-3 group-hover:scale-110 transition-transform duration-300">
              <Clock class="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500">Study Time</p>
              <!-- <p class="text-xl font-bold text-primary">{{ formatTime(user?.total_study_time ?? 0) }}</p> -->
            </div>
          </div>

          <!-- Streak Counter -->
          <div
            class="group flex items-center gap-4 bg-white/90 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex-1 md:flex-initial border border-orange-100/50"
          >
            <div class="rounded-lg bg-orange-100 p-3 group-hover:scale-110 transition-transform duration-300">
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
    <div class="grid md:grid-cols-2 gap-8">
      <!-- Past Papers Card -->
      <div
        @click="$inertia.visit('/papers')"
        class="group relative overflow-hidden rounded-3xl bg-white p-8 cursor-pointer transition-all duration-300 hover:shadow-2xl border border-gray-100 hover:border-primary/20"
      >
        <!-- Top decorative bar -->
        <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-primary/50"></div>
        
        <!-- Ring decoration -->
        <div class="absolute -right-20 -bottom-20 w-40 h-40 rounded-full border-8 border-primary/5 opacity-70"></div>
        <div class="absolute right-10 bottom-10 w-20 h-20 rounded-full border-4 border-primary/10 opacity-50"></div>

        <!-- Content -->
        <div class="relative space-y-6 z-10">
          <!-- Icon & Title -->
          <div class="flex items-start gap-5">
            <div class="p-4 rounded-2xl bg-gray-50 shadow-sm group-hover:bg-primary/5 transition-colors duration-300">
              <FileText class="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 class="text-2xl font-semibold text-gray-900">Past Papers</h3>
              <p class="text-gray-600 text-base mt-2 leading-relaxed">
                Practice with previous examination papers to enhance your preparation
              </p>
            </div>
          </div>

          <!-- Stats & Info -->
          <div class="flex items-center gap-4 flex-wrap">
            <span
              class="inline-flex items-center px-4 py-2 rounded-full bg-primary/5 text-primary text-sm font-medium"
              data-umami-event="open_past_papers_from_dashboard"
            >
              {{ stats.papers }} Papers
            </span>
            <span class="text-sm text-gray-500 flex items-center gap-1.5">
              <Clock class="h-4 w-4" />
              Updated Weekly
            </span>
          </div>

          <!-- Action Button -->
          <div class="flex items-center justify-between">
            <span class="text-primary text-sm font-medium">Explore Past Papers</span>
            <div class="h-10 w-10 rounded-full bg-gray-50 group-hover:bg-primary group-hover:text-white flex items-center justify-center transition-all duration-300">
              <ChevronRight class="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      <!-- Concepts Card -->
      <div
        @click="$inertia.visit('/concepts')"
        class="group relative overflow-hidden rounded-3xl bg-white p-8 cursor-pointer transition-all duration-300 hover:shadow-2xl border border-gray-100 hover:border-primary/20"
      >
        <!-- Top decorative bar -->
        <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-primary/50"></div>
        
        <!-- Ring decoration -->
        <div class="absolute -right-20 -bottom-20 w-40 h-40 rounded-full border-8 border-primary/5 opacity-70"></div>
        <div class="absolute right-10 bottom-10 w-20 h-20 rounded-full border-4 border-primary/10 opacity-50"></div>

        <!-- Content -->
        <div class="relative space-y-6 z-10">
          <!-- Icon & Title -->
          <div class="flex items-start gap-5">
            <div class="p-4 rounded-2xl bg-gray-50 shadow-sm group-hover:bg-primary/5 transition-colors duration-300">
              <BookOpen class="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 class="text-2xl font-semibold text-gray-900">Concepts</h3>
              <p class="text-gray-600 text-base mt-2 leading-relaxed">
                Master comprehensive study materials organized by topics
              </p>
            </div>
          </div>

          <!-- Stats & Info -->
          <div class="flex items-center gap-4 flex-wrap">
            <span
              class="inline-flex items-center px-4 py-2 rounded-full bg-primary/5 text-primary text-sm font-medium"
              data-umami-event="open_concepts_from_dashboard"
            >
              {{ stats.concepts }} Units
            </span>
            <span class="text-sm text-gray-500 flex items-center gap-1.5">
              <BookOpen class="h-4 w-4" />
              {{ stats.contentfulConcepts }}+ Topics
            </span>
          </div>

          <!-- Action Button -->
          <div class="flex items-center justify-between">
            <span class="text-primary text-sm font-medium">Start Learning</span>
            <div class="h-10 w-10 rounded-full bg-gray-50 group-hover:bg-primary group-hover:text-white flex items-center justify-center transition-all duration-300">
              <ChevronRight class="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>