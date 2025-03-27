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
} from 'lucide-vue-next'
import StatsDto from '#dtos/stats'

defineProps<{
  messages: Record<string, string | Record<string, string>>
  user: UserDto | null | undefined
  stats: StatsDto
  totalStudyTime: number
  formattedStudyTime: string
}>()

defineOptions({ layout: DashLayout })
</script>

<template>
  <AppHead title="Your dashboard" description="All available concepts in Juvenotes" />
  <div class="dashboard-content max-w-7xl mx-auto space-y-10 px-4 sm:px-6 py-6">
    <!-- Hero Welcome Section -->
    <div
      class="relative bg-gradient-to-br from-[#55A9C4]/10 via-[#55A9C4]/15 to-transparent p-6 rounded-2xl shadow-sm backdrop-blur-sm border border-[#55A9C4]/10"
    >
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <!-- Welcome Text -->
        <div class="space-y-2">
          <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-2">
            Hey {{ user?.fullName }}!
            <div class="wave-animation">
              <div
                class="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full shadow-md"
              >
                <Hand class="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </h1>
          <p class="text-sm text-[#4A6772]">Ready to continue your learning journey?</p>
        </div>

        <!-- Stats Grid -->
        <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <!-- Study Time -->
          <div
            class="group flex items-center gap-3 bg-white/90 hover:bg-gradient-to-r hover:from-[#55A9C4]/5 hover:to-[#55A9C4]/20 p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex-1 md:flex-initial border border-[#55A9C4]/20"
          >
            <div
              class="rounded-lg bg-[#55A9C4]/20 p-2 group-hover:scale-110 transition-transform duration-300"
            >
              <Clock class="h-5 w-5 text-[#55A9C4]" />
            </div>
            <div>
              <p class="text-xs font-medium text-[#4A6772]">Study Time</p>
              <!-- <p class="text-lg font-bold text-[#2C5D6F]">{{ formattedStudyTime }}</p> -->
            </div>
          </div>

          <!-- Streak Counter -->
          <div
            class="group flex items-center gap-3 bg-white/90 hover:bg-gradient-to-r hover:from-orange-50 hover:to-[#55A9C4]/10 p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex-1 md:flex-initial border border-[#55A9C4]/20 border-l-orange-200"
          >
            <div
              class="rounded-lg bg-orange-100 p-2 group-hover:scale-110 transition-transform duration-300"
            >
              <Flame class="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p class="text-xs font-medium text-[#4A6772]">Streak</p>
              <!-- <p class="text-lg font-bold text-[#2C5D6F]">{{ user?.streak_count ?? 0 }} days</p> -->
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Feature Cards Grid -->
    <div class="grid md:grid-cols-2 gap-8 p-6">
      <!-- Past Papers Card -->
      <div
        @click="$inertia.visit('/papers')"
        class="group relative overflow-hidden rounded-2xl bg-white p-8 cursor-pointer transition-all duration-300 hover:shadow-2xl border border-gray-100 hover:border-[#55A9C4]/40 transform hover:scale-[1.02] hover:-translate-y-2"
      >
        <div class="relative space-y-6 z-10 animate-fade-in">
          <div class="flex items-start gap-4">
            <div
              class="p-4 rounded-xl bg-gradient-to-br from-[#E3F5FA] to-[#D5F0F6] shadow-md group-hover:from-[#55A9C4]/10 group-hover:to-[#55A9C4]/20 transition-all duration-300"
            >
              <FileText class="h-8 w-8 text-[#55A9C4]" />
            </div>
            <div>
              <h3 class="text-2xl font-bold text-gray-900">Past Papers</h3>
              <p class="text-sm text-gray-600 mt-2">Practice with previous exams</p>
            </div>
          </div>
          <!-- Hover Message (Hidden on Mobile) -->
          <div
            class="absolute bottom-6 right-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex"
          >
            <span class="text-sm text-[#55A9C4] font-medium">Start Practicing</span>
            <ChevronRight class="h-5 w-5 text-[#55A9C4]" />
          </div>
        </div>
        <div
          class="absolute inset-0 bg-gradient-to-br from-white to-[#E3F5FA] opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block"
        ></div>
      </div>

      <!-- Concepts Card -->
      <div
        @click="$inertia.visit('/concepts')"
        class="group relative overflow-hidden rounded-2xl bg-white p-8 cursor-pointer transition-all duration-300 hover:shadow-2xl border border-gray-100 hover:border-[#55A9C4]/40 transform hover:scale-[1.02] hover:-translate-y-2"
      >
        <div class="relative space-y-6 z-10 animate-fade-in">
          <div class="flex items-start gap-4">
            <div
              class="p-4 rounded-xl bg-gradient-to-br from-[#E3F5FA] to-[#D5F0F6] shadow-md group-hover:from-[#55A9C4]/10 group-hover:to-[#55A9C4]/20 transition-all duration-300"
            >
              <BookOpen class="h-8 w-8 text-[#55A9C4]" />
            </div>
            <div>
              <h3 class="text-2xl font-bold text-gray-900">Concepts</h3>
              <p class="text-sm text-gray-600 mt-2">Master comprehensive study materials</p>
            </div>
          </div>
          <!-- Hover Message (Hidden on Mobile) -->
          <div
            class="absolute bottom-6 right-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex"
          >
            <span class="text-sm text-[#55A9C4] font-medium">Explore Concepts</span>
            <ChevronRight class="h-5 w-5 text-[#55A9C4]" />
          </div>
        </div>
        <div
          class="absolute inset-0 bg-gradient-to-br from-white to-[#E3F5FA] opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block"
        ></div>
      </div>

      <!-- OSCE Card -->
      <div
        @click="$inertia.visit('/osce')"
        class="group relative overflow-hidden rounded-2xl bg-white p-8 cursor-pointer transition-all duration-300 hover:shadow-2xl border border-gray-100 hover:border-[#55A9C4]/40 transform hover:scale-[1.02] hover:-translate-y-2"
      >
        <div class="relative space-y-6 z-10 animate-fade-in">
          <div class="flex items-start gap-4">
            <div
              class="p-4 rounded-xl bg-gradient-to-br from-[#E3F5FA] to-[#D5F0F6] shadow-md group-hover:from-[#55A9C4]/10 group-hover:to-[#55A9C4]/20 transition-all duration-300"
            >
              <Stethoscope class="h-8 w-8 text-[#55A9C4]" />
            </div>
            <div>
              <h3 class="text-2xl font-bold text-gray-900">OSCE</h3>
              <p class="text-sm text-gray-600 mt-2">Clinical scenario-based practice</p>
            </div>
          </div>
          <!-- Hover Message (Hidden on Mobile) -->
          <div
            class="absolute bottom-6 right-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex"
          >
            <span class="text-sm text-[#55A9C4] font-medium">Practice Scenarios</span>
            <ChevronRight class="h-5 w-5 text-[#55A9C4]" />
          </div>
        </div>
        <div
          class="absolute inset-0 bg-gradient-to-br from-white to-[#E3F5FA] opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block"
        ></div>
      </div>

      <!-- Spot Card -->
      <div
        @click="$inertia.visit('/spot')"
        class="group relative overflow-hidden rounded-2xl bg-white p-8 cursor-pointer transition-all duration-300 hover:shadow-2xl border border-gray-100 hover:border-[#55A9C4]/40 transform hover:scale-[1.02] hover:-translate-y-2"
      >
        <div class="relative space-y-6 z-10 animate-fade-in">
          <div class="flex items-start gap-4">
            <div
              class="p-4 rounded-xl bg-gradient-to-br from-[#E3F5FA] to-[#D5F0F6] shadow-md group-hover:from-[#55A9C4]/10 group-hover:to-[#55A9C4]/20 transition-all duration-300"
            >
              <Pin class="h-8 w-8 text-[#55A9C4]" />
            </div>
            <div>
              <h3 class="text-2xl font-bold text-gray-900">Spots</h3>
              <p class="text-sm text-gray-600 mt-2">Sharpen your identification skills</p>
            </div>
          </div>
          <!-- Hover Message (Hidden on Mobile) -->
          <div
            class="absolute bottom-6 right-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex"
          >
            <span class="text-sm text-[#55A9C4] font-medium">Identify Spots</span>
            <ChevronRight class="h-5 w-5 text-[#55A9C4]" />
          </div>
        </div>
        <div
          class="absolute inset-0 bg-gradient-to-br from-white to-[#E3F5FA] opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block"
        ></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-content {
  padding: 1.5rem; /* Adjust as needed */
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
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 1s ease-in-out;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .dashboard-content {
    padding: 1.5rem 1rem; /* Maintain reasonable padding */
  }

  .dashboard-content .grid {
    grid-template-columns: 1fr; /* Stack cards vertically */
    gap: 1.5rem; /* Keep decent spacing between cards */
    padding: 0 0.5rem; /* Small horizontal padding */
  }

  .dashboard-content .group {
    width: 100%; /* Make cards full width on mobile */
    max-width: 100%; /* Ensure cards don't exceed container width */
    padding: 1.5rem; /* Maintain good internal spacing */
  }

  .dashboard-content .group h3 {
    font-size: 1.5rem; /* Reasonable heading size */
  }

  .dashboard-content .group p {
    font-size: 0.875rem; /* Readable description text */
    margin-top: 0.5rem;
  }

  .dashboard-content .group .p-4 {
    padding: 0.75rem; /* Sufficient padding for icons */
  }
}

@media (max-width: 500px) {
  /* Additional small screen tweaks */
  .dashboard-content {
    padding: 1.25rem 0.75rem; /* Reduced but still adequate */
  }

  .dashboard-content .grid {
    gap: 1.25rem; /* Still provides good separation */
  }

  .dashboard-content .group {
    padding: 1.25rem; /* Enough breathing room */
  }

  .dashboard-content .group .flex.items-start {
    gap: 0.75rem; /* Maintain reasonable spacing */
  }
}
</style>
