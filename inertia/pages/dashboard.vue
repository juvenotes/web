<script setup lang="ts">
import UserDto from '#dtos/user'
import DashLayout from '~/layouts/DashLayout.vue'
import {
  BookOpen,
  FileText,
  Clock,
  Flame,
  ChevronRight,
  Stethoscope,
  Pin,
  Hand,
  Library
} from 'lucide-vue-next'
import StatsDto from '#dtos/stats'
import SurveyBanner from '~/components/SurveyBanner.vue';

defineProps<{
  messages: Record<string, string | Record<string, string>>
  user: UserDto | null | undefined
  stats: StatsDto
  totalStudyTime: number
  formattedStudyTime: string
  todayStudyTime: number
  formattedTodayStudyTime: string
}>()

defineOptions({ layout: DashLayout })
</script>

<template>
  <AppHead title="Your dashboard" description="All available concepts in Juvenotes" />
  <OnboardingTour :user="user" />
  <div class="dashboard-content max-w-7xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8 py-6 md:py-8">
    <!-- Tally Survey Banner -->
    <SurveyBanner />
    
    <!-- Hero Welcome Section -->
    <div
      class="relative bg-gradient-to-br from-accent/10 via-accent/15 to-transparent p-6 sm:p-8 rounded-3xl shadow-sm backdrop-blur-sm border border-accent/15 overflow-hidden"
    >
      <!-- Decorative background elements -->
      <div class="absolute -top-16 -right-16 w-64 h-64 bg-accent/5 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-8 -left-8 w-40 h-40 bg-accent/5 rounded-full blur-2xl"></div>

      <div
        class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10"
      >
        <!-- Welcome Text -->
        <div class="space-y-2">
          <h1 class="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
            Hey {{ user?.fullName }}!
            <div class="wave-animation">
              <div
                class="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-100 to-yellow-300 rounded-full shadow-md"
              >
                <Hand class="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
              </div>
            </div>
          </h1>
          <p class="text-sm sm:text-base text-muted-foreground font-medium">
            Ready to continue your learning journey?
          </p>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-2 gap-3 w-full sm:w-auto sm:flex">
          <!-- Study Time -->
          <div
            class="group flex items-center gap-3 bg-card hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/15 p-3 sm:p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-border"
          >
            <div
              class="rounded-lg bg-primary/15 p-2 group-hover:scale-105 transition-transform duration-300"
            >
              <Clock class="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <div>
              <p class="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Today
              </p>
              <p class="text-base sm:text-lg font-bold text-foreground">
                {{ formattedTodayStudyTime }}
              </p>
            </div>
          </div>

          <!-- Streak Counter -->
          <div
            class="group flex items-center gap-3 bg-card hover:bg-gradient-to-r hover:from-orange-50 hover:to-accent/10 p-3 sm:p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-accent/15 border-l-orange-200"
          >
            <div
              class="rounded-lg bg-orange-100 p-2 group-hover:scale-105 transition-transform duration-300"
            >
              <Flame class="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
            </div>
            <div>
              <p class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Streak</p>
              <p class="text-base sm:text-lg font-bold text-foreground">
                {{ user?.streak?.currentStreak ?? 0 }}
                <span class="text-xs text-muted-foreground">day<span v-if="(user?.streak?.currentStreak ?? 0) !== 1">s</span></span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Cards Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      <!-- Past Papers -->
      <Link href="/papers" preserve-scroll preserve-state
        class="group relative overflow-hidden rounded-2xl bg-card p-6 cursor-pointer transition-all duration-300 hover:shadow-lg border border-border hover:border-accent/30"
      >
        <!-- Decorative elements -->
        <div
          class="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        ></div>
        <div
          class="absolute top-0 right-0 w-40 h-40 bg-accent/5 rounded-full -translate-y-20 translate-x-20 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-300"
        ></div>

        <div class="relative z-10">
          <div
            class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent"
          >
            <FileText class="h-6 w-6" />
          </div>
          <div>
            <h3 class="text-xl font-bold text-foreground">Past Papers</h3>
            <p class="text-sm text-muted-foreground mt-1 font-medium">Practice with previous exams</p>
          </div>
          <div class="mt-6 flex items-center text-primary">
            <span class="text-sm font-medium">View papers</span>
            <ChevronRight class="ml-1 h-4 w-4" />
          </div>
        </div>
      </Link>

      <!-- Concepts Card -->
      <div
        data-tour="concepts"
        @click="$inertia.visit('/concepts')"
        class="group relative overflow-hidden rounded-2xl bg-white p-6 cursor-pointer transition-all duration-300 hover:shadow-lg border border-gray-100"
      >
        <div class="relative space-y-4 z-10 animate-fade-in">
          <div class="flex items-start gap-4">
            <div
              class="p-4 rounded-xl bg-gradient-to-br from-[#E3F5FA] to-[#D5F0F6] shadow-sm group-hover:shadow-md group-hover:from-[#55A9C4]/15 group-hover:to-[#55A9C4]/25 transition-all duration-300"
            >
              <BookOpen class="h-6 w-6 text-[#55A9C4]" />
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-bold text-gray-900">Concepts</h3>
              <p class="text-sm text-gray-600 mt-1 font-medium">
                Master comprehensive study materials
              </p>
              
              <div
                class="mt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0"
              >
                <span class="text-xs text-[#55A9C4] font-semibold">Explore Concepts</span>
                <ChevronRight class="h-4 w-4 text-[#55A9C4]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Library Card -->
      <div
        data-tour="library"
        @click="$inertia.visit('/library')"
        class="group relative overflow-hidden rounded-2xl bg-white p-6 cursor-pointer transition-all duration-300 hover:shadow-lg border border-gray-100 hover:border-[#55A9C4]/30"
      >
        <div class="relative space-y-4 z-10 animate-fade-in">
          <div class="flex items-start gap-4">
            <div
              class="p-4 rounded-xl bg-gradient-to-br from-[#E3F5FA] to-[#D5F0F6] shadow-sm group-hover:shadow-md group-hover:from-[#55A9C4]/15 group-hover:to-[#55A9C4]/25 transition-all duration-300"
            >
              <Library class="h-6 w-6 text-[#55A9C4]" />
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-bold text-gray-900">Library</h3>
              <p class="text-sm text-gray-600 mt-1 font-medium">
                Access all your saved resources
              </p>
              
              <div
                class="mt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0"
              >
                <span class="text-xs text-[#55A9C4] font-semibold">View Library</span>
                <ChevronRight class="h-4 w-4 text-[#55A9C4]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- OSCE Card -->
      <div
        data-tour="osce"
        @click="$inertia.visit('/osce')"
        class="group relative overflow-hidden rounded-2xl bg-white p-6 cursor-pointer transition-all duration-300 hover:shadow-lg border border-gray-100 hover:border-[#55A9C4]/30"
      >
        <div class="relative space-y-4 z-10 animate-fade-in">
          <div class="flex items-start gap-4">
            <div
              class="p-4 rounded-xl bg-gradient-to-br from-[#E3F5FA] to-[#D5F0F6] shadow-sm group-hover:shadow-md group-hover:from-[#55A9C4]/15 group-hover:to-[#55A9C4]/25 transition-all duration-300"
            >
              <Stethoscope class="h-6 w-6 text-[#55A9C4]" />
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-bold text-gray-900">OSCE</h3>
              <p class="text-sm text-gray-600 mt-1 font-medium">
                Clinical scenario-based practice
              </p>
              
              <div
                class="mt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0"
              >
                <span class="text-xs text-[#55A9C4] font-semibold">Practice Scenarios</span>
                <ChevronRight class="h-4 w-4 text-[#55A9C4]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Spot Card -->
      <div
        data-tour="spot"
        @click="$inertia.visit('/spot')"
        class="group relative overflow-hidden rounded-2xl bg-white p-6 cursor-pointer transition-all duration-300 hover:shadow-lg border border-gray-100 hover:border-[#55A9C4]/30"
      >
        <div class="relative space-y-4 z-10 animate-fade-in">
          <div class="flex items-start gap-4">
            <div
              class="p-4 rounded-xl bg-gradient-to-br from-[#E3F5FA] to-[#D5F0F6] shadow-sm group-hover:shadow-md group-hover:from-[#55A9C4]/15 group-hover:to-[#55A9C4]/25 transition-all duration-300"
            >
              <Pin class="h-6 w-6 text-[#55A9C4]" />
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-bold text-gray-900">Spots</h3>
              <p class="text-sm text-gray-600 mt-1 font-medium">
                Sharpen your identification skills
              </p>
              
              <div
                class="mt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0"
              >
                <span class="text-xs text-[#55A9C4] font-semibold">Identify Spots</span>
                <ChevronRight class="h-4 w-4 text-[#55A9C4]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-content {
  padding: 1.5rem;
}

@keyframes wave {
  0% {
    transform: rotate(0deg);
  }
  10% {
    transform: rotate(14deg);
  }
  20% {
    transform: rotate(-8deg);
  }
  30% {
    transform: rotate(14deg);
  }
  40% {
    transform: rotate(-4deg);
  }
  50% {
    transform: rotate(10deg);
  }
  60% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(0deg);
  }
}

.wave-animation {
  animation: wave 2.5s ease-in-out infinite;
  transform-origin: 70% 70%;
  display: inline-block;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.6s ease-out forwards;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .dashboard-content {
    padding: 1rem;
    gap: 1.5rem;
  }
}

@media (max-width: 640px) {
  .feature-card {
    padding: 1.25rem;
  }

  .feature-card h3 {
    font-size: 1.125rem;
  }

  .feature-card p {
    font-size: 0.8125rem;
  }
}

@media (max-width: 400px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    padding: 0.75rem;
  }
  
  .stat-card p:last-child {
    font-size: 0.9375rem;
  }
}
</style>