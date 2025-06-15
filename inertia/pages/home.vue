<script setup lang="ts">
import AppLayout from '~/layouts/AppLayout.vue'
import UserDto from '#dtos/user'
import StatsDto from '#dtos/stats'

const props = defineProps<{
  messages: Record<string, string | Record<string, string>>
  user: UserDto | null | undefined
  stats: StatsDto
}>()

defineOptions({ layout: AppLayout })
const features = [
  {
    icon: 'bookpile.webp',
    title: 'Comprehensive Resources',
    desc: 'Access a wide range of study materials',
  },
  { icon: 'papers.webp', title: 'Past Papers', desc: 'Practice with previous exam papers' },
  { icon: 'path.webp', title: 'Custom Learning Paths', desc: 'Personalized study journey' },
  { icon: 'handshake.webp', title: 'Active Community', desc: 'Learn together with peers' },
]

const statsDisplay = [
  { number: `${Math.floor(props.stats.users / 10) * 10}+`, label: 'Already Active Users' },
  { number: `${Math.floor(props.stats.concepts / 10) * 10}+`, label: 'Concepts Broken Down' },
  {
    number: `${Math.floor(props.stats.papers / 10) * 10}+`,
    label: 'Practice Papers With Questions',
  },
  { number: `${Math.floor(props.stats.questions / 10) * 10}+`, label: 'Questions' },
]
</script>

<template>
  <AppHead title="Home" description="Welcome to Juvenotes" />

  <!-- Main container with full-viewport gradient background -->
  <div class="min-h-screen bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#bae6fd] font-sans antialiased">
    <!-- Hero Section - full width -->
    <main class="flex-1 w-full">
      <section class="py-16 md:py-24 w-full">
        <div class="w-full text-center">
          <div class="flex flex-col items-center justify-center gap-6 animate-fade-in mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-center gap-4 flex-wrap">
              <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight font-inter">
                WELCOME TO JUVENOTES
              </h1>
              <img
                src="/public/images/pen.webp"
                alt="Study Resources"
                class="w-14 h-14 md:w-16 md:h-16 animate-bounce"
              />
            </div>
            <h2 class="text-xl md:text-2xl font-medium text-[#55A9C4] mb-2">Study Smart, Excel Easy!</h2>
            <p class="text-gray-600 mb-8 max-w-2xl mx-auto text-lg leading-relaxed">
              Welcome to Juvenotes, your destination for a transformative medical education
              experience. 🚀
            </p>
            <Button
              class="bg-[#55A9C4] hover:bg-[#4796b0] text-white px-8 py-3.5 text-base font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out"
              @click="$inertia.visit('/learn')"
            >
              Start Now
            </Button>
          </div>
        </div>
      </section>

      <!-- Features Grid -->
      <section class="py-16 md:py-20 bg-white/90 w-full">
        <div class="w-full">
          <div class="max-w-3xl mx-auto text-center mb-12 px-4 sm:px-6 lg:px-8">
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 font-inter mb-4">
              Why Choose Juvenotes?
            </h2>
            <p class="text-gray-500 text-lg">Designed to help you learn more effectively</p>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div
              v-for="feature in features"
              :key="feature.title"
              class="bg-white rounded-2xl p-6 text-center transition-all duration-300 ease-in-out border border-gray-100 hover:border-[#55A9C4]/30 hover:shadow-lg cursor-pointer group"
              @click="$inertia.visit(feature.title === 'Past Papers' ? '/papers' : '/learn')"
            >
              <div class="w-20 h-20 mx-auto mb-5 flex items-center justify-center bg-[#55A9C4]/10 rounded-full group-hover:bg-[#55A9C4]/20 transition-colors duration-300">
                <img
                  :src="`/images/${feature.icon}`"
                  :alt="feature.title"
                  class="w-10 h-10 object-contain animate-fade-in"
                />
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-3 group-hover:text-[#55A9C4] transition-colors duration-300">{{ feature.title }}</h3>
              <p class="text-gray-600 text-base">{{ feature.desc }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Mission Section - full width -->
      <section
        class="py-24 w-full bg-cover bg-center bg-no-repeat relative"
        :style="{
          backgroundImage: 'url(\'/images/dashboard.webp\')',
        }"
      >
        <div class="absolute inset-0 bg-gradient-to-r from-[#55A9C4]/90 to-[#4796b0]/90"></div>
        <div class="w-full relative z-10">
          <div class="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <div class="inline-block bg-white text-[#55A9C4] text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              Our Purpose
            </div>
            <h2 class="text-3xl md:text-4xl font-bold text-white mb-6 font-inter">Transforming Medical Education</h2>
            <p class="text-lg leading-relaxed text-white/90">
              At Juvenotes, we believe every medical student deserves access to affordable,
              high-quality, and locally-tailored educational resources. Our mission is to bridge the
              gap in medical education by providing study tools designed to empower students to
              excel in their academic and professional journeys. Join us today and take the first
              step toward transforming your learning experience!
            </p>
          </div>
        </div>
      </section>

      <!-- Stats Section -->
      <section class="py-16 md:py-20 bg-white/90 w-full">
        <div class="w-full">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div
              v-for="stat in statsDisplay"
              :key="stat.label"
              class="bg-white rounded-xl p-6 text-center border border-gray-100 hover:border-[#55A9C4]/30 transition-all duration-300 hover:shadow-sm"
            >
              <h3 class="text-4xl font-bold text-[#55A9C4] mb-3 font-inter">{{ stat.number }}</h3>
              <p class="text-gray-600 text-base">{{ stat.label }}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.font-inter {
  font-family: 'Inter', sans-serif;
}

/* Ensure full viewport coverage */
html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
  width: 100%;
}

/* Remove any default margins */
body {
  overflow-x: hidden;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

/* Smooth transitions for interactive elements */
.button-transition {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Responsive typography */
@media (max-width: 640px) {
  .text-responsive {
    font-size: 1.25rem;
  }
}
</style>