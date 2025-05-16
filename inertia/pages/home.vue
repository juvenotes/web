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

  <div class="min-h-screen bg-background font-sans">
    <!-- Hero Section -->
    <main class="flex-1 flex flex-col w-full overflow-y-auto">
      <section class="bg-gradient-to-b from-[#f0f9ff] to-white py-12">
        <div class="container mx-auto px-6 text-center">
          <div class="flex items-center justify-center gap-4 animate-fade-in">
            <h1 class="text-4xl md:text-5xl font-extrabold text-gray-800 tracking-tight font-inter">
              WELCOME TO JUVENOTES
            </h1>
            <img src="/public/images/pen.webp" alt="Study Resources" class="w-16 h-16 animate-bounce" />
          </div>

          <h2 class="text-xl font-semibold text-[#55A9C4] mb-4 mt-2">Study Smart, Excel Easy!</h2>
          <p class="text-gray-600 mb-8 max-w-2xl mx-auto">
            Welcome to Juvenotes, your destination for a transformative medical education experience. 🚀
          </p>
          <Button
            class="bg-[#55A9C4] text-white px-6 py-3 text-lg font-semibold rounded-lg shadow-lg hover:bg-[#55A9C4]/90 transition transform hover:scale-105 duration-300"
            @click="$inertia.visit('/learn')"
          >
            Start Now
          </Button>
        </div>
      </section>

      <!-- Features Grid -->
      <section class="py-12 bg-white">
        <div class="container mx-auto px-6">
          <h2 class="text-3xl font-bold text-center mb-10 text-gray-800 font-inter">Why Choose Juvenotes?</h2>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div
              v-for="feature in features"
              :key="feature.title"
              class="bg-gray-50 rounded-lg p-6 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 hover:ring-2 hover:ring-[#55A9C4] cursor-pointer"
              @click="$inertia.visit(feature.title === 'Past Papers' ? '/papers' : '/learn')"
            >
              <img
                :src="`/images/${feature.icon}`"
                :alt="feature.title"
                class="w-16 h-16 mx-auto mb-4 animate-fade-in"
              />
              <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ feature.title }}</h3>
              <p class="text-gray-600">{{ feature.desc }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Mission Section -->
      <section
        class="py-20 bg-cover bg-center bg-no-repeat relative"
        :style="{
          backgroundImage: 'url(\'/images/dashboard.webp\')',
        }"
      >
        <div class="absolute inset-0 bg-black/50"></div>
        <div class="container mx-auto px-6 relative z-10 text-white text-center">
          <div class="max-w-4xl mx-auto">
            <h2 class="text-3xl font-bold mb-6 font-inter">Our Mission</h2>
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
      <section class="bg-[#55A9C4]/5 py-16">
        <div class="container mx-auto px-4 sm:px-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div
              v-for="stat in statsDisplay"
              :key="stat.label"
              class="bg-white/80 backdrop-blur rounded-lg p-6 text-center shadow-md transform transition-transform duration-300 hover:scale-105"
            >
              <h3 class="text-4xl font-bold text-[#55A9C4] mb-2 font-inter">{{ stat.number }}</h3>
              <p class="text-gray-700 text-base">{{ stat.label }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Floating CTA -->
      <div class="fixed bottom-6 right-6 z-50">
        <button
          @click="$inertia.visit('/register')"
          class="bg-[#55A9C4] text-white px-5 py-3 rounded-full shadow-lg hover:bg-[#4793a9] transition-all duration-300"
        >
          Join Now
        </button>
      </div>
    </main>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@600;700&display=swap');

.font-inter {
  font-family: 'Inter', sans-serif;
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
  animation: fadeIn 1s ease-out;
}
</style>
