<script setup lang="ts">
import AppLayout from '~/layouts/AppLayout.vue'
import UserDto from '#dtos/user'
import StatsDto from '#dtos/stats'
// import CookieConsent from '~/components/CookieConsent.vue'

const props = defineProps<{
  messages: Record<string, string | Record<string, string>>
  user: UserDto | null | undefined
  stats: StatsDto
}>()

defineOptions({ layout: AppLayout })
const features = [
  {
    icon: 'bookpile.png',
    title: 'Comprehensive Resources',
    desc: 'Access a wide range of study materials',
  },
  { icon: 'papers.png', title: 'Past Papers', desc: 'Practice with previous exam papers' },
  { icon: 'path.png', title: 'Custom Learning Paths', desc: 'Personalized study journey' },
  { icon: 'handshake.png', title: 'Active Community', desc: 'Learn together with peers' },
]

const statsDisplay = [
  { number: `${props.stats.users}+`, label: 'Already Active Users' },
  { number: `${props.stats.concepts}+`, label: 'Concepts Broken Down' },
  { number: `${props.stats.papers}+`, label: 'Practice Papers With Questions' },
]

import { onMounted } from 'vue';

declare global {
  interface Window {
    cookieconsent: any;
  }
}

onMounted(() => {
  const script = document.createElement('script')
  script.src = "//www.freeprivacypolicy.com/public/cookie-consent/4.2.0/cookie-consent.js"
  script.charset = "UTF-8"
  
  script.onload = () => {
    window.cookieconsent.run({
      notice_banner_type: "modal",
      website_name: "Juvenotes",
      website_privacy_policy_url: "https://juvenotes.com/privacy",
      consent_type: "express",
      palette: {
        popup: {
          background: "#ffffff",
          text: "#1a1b1f",
          border: "1px solid rgba(205, 229, 237, 0.2)"
        },
        button: {
          background: "#CDE5ED",
          text: "#1a1b1f"
        }
      },
      theme: "clean",
      position: "center",
      transition: "slide",
      layout: "basic-header",
      layouts: {
        "basic-header": "{{header}}{{message}}{{link}}{{compliance}}"
      },
      layouts_message: {
        "basic-header": "We care about your privacy and use cookies to enhance your experience."
      },
      button: {
        accept: {
          background: "#CDE5ED",
          text: "#1a1b1f",
          padding: "12px 24px",
          borderRadius: "8px"
        },
        reject: {
          background: "transparent",
          text: "#64748b",
          padding: "12px 24px",
          borderRadius: "8px"
        }
      },
      language: {
        header: {
          title: "Cookie Settings 🍪",
          text: ""
        }
      }
    })
  }
  
  document.head.appendChild(script)
});
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
            experience. 🚀 You get:
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
          backgroundImage: 'url(\'/images/dashboard.png\')',
        }"
      >
        <div class="absolute inset-0 bg-black/50"></div>

        <div class="container mx-auto px-6 relative z-10">
          <div class="max-w-4xl mx-auto text-center">
            <h2 class="text-3xl font-bold mb-6 text-white">Our Mission</h2>
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
        <div class="container mx-auto px-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div
              v-for="stat in statsDisplay"
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
      <!-- <section class="py-16 bg-white">
        <div class="container mx-auto px-6 text-center">
          <h2 class="text-3xl font-bold mb-8">Ready to Start Your Journey?</h2>
          <Button
            class="bg-[#55A9C4] text-white px-8 py-4 text-lg font-medium rounded-lg shadow-lg hover:bg-[#55A9C4]/90"
            @click="$inertia.visit('/register')"
          >
            Join Juvenotes Today
          </Button>
        </div>
      </section> -->
    </main>
    <!-- <CookieConsent /> -->
     <div>
    <!-- Button to open cookie preferences -->
    <a href="#" id="open_preferences_center">Update cookies preferences</a>
  </div>
  </div>
</template>

<style>
.cc-window {
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
  margin: 0 !important;
  z-index: 10000 !important;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15) !important;
  backdrop-filter: blur(12px) !important;
  border-radius: 16px !important;
  max-width: 450px !important;
  padding: 2rem !important;
  animation: modalFade 0.3s ease-out !important;
}


.cc-header {
  text-align: center !important;
  margin-bottom: 1.5rem !important;
}

.cc-header h1 {
  font-size: 1.5rem !important;
  font-weight: 600 !important;
  color: #1a1b1f !important;
}

.cc-message {
  font-size: 1rem !important;
  line-height: 1.6 !important;
  color: #4b5563 !important;
  text-align: center !important;
  margin-bottom: 1.5rem !important;
}

.cc-compliance {
  display: flex !important;
  gap: 1rem !important;
  justify-content: center !important;
}

.cc-btn {
  font-weight: 500 !important;
  transition: all 0.2s ease !important;
  flex: 1 !important;
  text-align: center !important;
}

.cc-btn:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 4px 6px rgba(205, 229, 237, 0.2) !important;
}

.cc-link {
  color: #CDE5ED !important;
  text-decoration: none !important;
  display: block !important;
  text-align: center !important;
  margin: 1rem 0 !important;
  font-size: 0.875rem !important;
}

@keyframes modalFade {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.cc-revoke {
  display: none !important;
}
.freeprivacypolicy-com---palette-dark .cc-nb-okagree{
  background-color: #55A9C4 !important;
}
.freeprivacypolicy-com---palette-dark .cc-nb-reject{
  background-color: #55A9C4 !important;
}
.freeprivacypolicy-com---palette-dark .cc-cp-foot-save{
  background-color: #55A9C4 !important;
}
.freeprivacypolicy-com---palette-dark.freeprivacypolicy-com---nb{
  background-color: #CDE5ED !important;
}
.freeprivacypolicy-com---palette-dark .cc-nb-title{
  color: #1a1b1f !important;
}
.cc-nb-text-content{
  color: #1a1b1f !important;
}
.freeprivacypolicy-com---palette-dark .cc-nb-changep{
  background-color: #fff !important;
}
</style>