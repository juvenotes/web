<script setup lang="ts">
import AppLayout from '~/layouts/AppLayout.vue'
import UserDto from '#dtos/user'
defineProps<{
  messages: Record<string, string | Record<string, string>>
  user: UserDto | null | undefined
}>()
defineOptions({ layout: AppLayout })
const features = [
  { icon: 'bookpile.png', title: 'Comprehensive Resources', desc: 'Access a wide range of study materials' },
  { icon: 'papers.png', title: 'Past Papers', desc: 'Practice with previous exam papers' },
  { icon: 'path.png', title: 'Custom Learning Paths', desc: 'Personalized study journey' },
  { icon: 'handshake.png', title: 'Active Community', desc: 'Learn together with peers' }
]

const stats = [
  { number: '636+', label: 'Active Students' },
  { number: '1200+', label: 'Practice Questions' },
  { number: '98%', label: 'Success Rate' }
]
</script>

<template>

  <AppHead title="Home" description="Welcome to Juvenotes" />

  <div class="min-h-screen bg-background">

    <!-- Hero Section -->
    <main class="flex-1 flex flex-col w-full overflow-y-auto">
    <!-- Hero Section -->
    <section class="bg-gray-50 py-8 flex-none">
      <div class="container mx-auto px-6 text-center">
        <div class="flex items-center justify-center gap-4">
          <h1 class="text-3xl font-bold text-gray-800">WELCOME TO JUVENOTES</h1>
          <img src="/public/images/pen.png" alt="Study Resources" class="w-16 h-16" />
        </div>

        <h2 class="text-xl font-semibold text-[#55A9C4] mb-4">Study Smart, Excel Easy!</h2>
        <p class="text-gray-600 mb-8 max-w-2xl mx-auto">
          Welcome to Juvenotes, your premier destination for a transformative medical education
          experience. 🚀 Here's why you should sign up:
        </p>
        <Button 
          class="bg-[#55A9C4] text-white px-6 py-2 text-lg font-medium rounded-lg shadow-lg hover:bg-[#55A9C4]/90"
          @click="$inertia.visit('/learn')"
        >
          START LEARNING NOW
        </Button>
      </div>
    </section>

    <!-- Features Grid -->
    <section class="flex-none py-8 bg-white">
      <div class="container mx-auto px-6">
        <h2 class="text-2xl font-bold text-center mb-6">Why Choose Juvenotes?</h2>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div 
            v-for="feature in features" 
            :key="feature.title"
            class="bg-gray-50 rounded-lg p-6 text-center hover:shadow-lg transition-shadow"
          >
            <img
              :src="`/images/${feature.icon}`"
              :alt="feature.title"
              class="w-16 h-16 mx-auto mb-4"
            />
            <h3 class="text-lg font-semibold text-gray-800 mb-2">
              {{ feature.title }}
            </h3>
            <p class="text-gray-600">{{ feature.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Mission Section -->
    <section
      class="py-16 relative bg-cover bg-center bg-no-repeat"
      :style="{
        backgroundImage: 'url(\'/images/dashboard.png\')'
      }"
    >
      <div class="absolute inset-0 bg-black/50"></div>

      <div class="container mx-auto px-6 relative z-10">
        <div class="max-w-4xl mx-auto text-center">
          <h2 class="text-3xl font-bold mb-6 text-white">Our Mission</h2>
          <p class="text-lg leading-relaxed text-white/90">
            At Juvenotes, we believe every medical student deserves access to affordable,
            high-quality, and locally-tailored educational resources. Our mission is to bridge
            the gap in medical education by providing study tools designed to empower students
            to excel in their academic and professional journeys. Join us today and take the
            first step toward transforming your learning experience!
          </p>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="bg-[#55A9C4]/5 py-16">
      <div class="container mx-auto px-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="bg-white rounded-lg p-8 text-center shadow-sm"
          >
            <h3 class="text-4xl font-bold text-[#55A9C4] mb-2">{{ stat.number }}</h3>
            <p class="text-gray-600">{{ stat.label }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 bg-white">
      <div class="container mx-auto px-6 text-center">
        <h2 class="text-3xl font-bold mb-8">Ready to Start Your Journey?</h2>
        <Button
          class="bg-[#55A9C4] text-white px-8 py-4 text-lg font-medium rounded-lg shadow-lg hover:bg-[#55A9C4]/90"
          @click="$inertia.visit('/register')"
        >
          Join Juvenotes Today
        </Button>
      </div>
    </section>
  </main>

  </div>
</template>