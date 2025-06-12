<template>
  <!-- Add a subtle background color and ensure it fills the screen -->
  <div class="bg-gray-50 min-h-screen">
    <div class="container mx-auto p-4 md:p-8">
      <!-- Animated header with a modern gradient -->
      <div class="text-center mb-8 md:mb-12 animate__animated animate__fadeInDown">
        <h1
          class="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 pb-2"
        >
          Medical Library
        </h1>
        <p class="text-lg text-gray-600 mt-2">Browse articles by medical subject</p>
      </div>

      <!-- A clean, responsive grid of subject cards with staggered animation -->
      <div
        v-if="subjects.length"
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6"
      >
        <!-- Loop through the subjects and apply a delayed animation to each card -->
        <div
          v-for="(subject, index) in subjects"
          :key="subject"
          class="animate__animated animate__fadeInUp"
          :style="{ animationDelay: `${index * 80}ms` }"
        >
          <!-- The entire card is a link, now with centered content and an icon -->
          <Link
            :href="`/library/${encodeURIComponent(subject)}`"
            class="group p-6 bg-white rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 border border-gray-200 transition-all duration-300 h-full flex flex-col items-center text-center"
          >
            <!--
              FIX: The div using v-html is now a self-closing tag to prevent the syntax error.
            -->
            <div
              class="flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 text-indigo-500 transition-colors duration-300 group-hover:bg-indigo-500 group-hover:text-white mb-4"
              v-html="getIconForSubject(subject)"
            />

            <!-- Subject Name -->
            <h2
              class="text-lg font-semibold text-gray-800 transition-colors duration-300 group-hover:text-indigo-600 break-words"
            >
              {{ subject }}
            </h2>

            <!-- Article Count Badge -->
            <p class="mt-2 text-sm font-medium text-gray-500">
              {{ subjectMap[subject].count }} articles
            </p>
          </Link>
        </div>
      </div>

      <!-- Enhanced "No Subjects" message -->
      <div v-else class="text-center text-gray-500 mt-8 animate__animated animate__fadeIn">
        <div class="bg-white rounded-lg shadow-md p-10 max-w-lg mx-auto">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="mx-auto h-16 w-16 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
            />
          </svg>
          <h3 class="mt-4 text-xl font-semibold text-gray-700">Library is Empty</h3>
          <p class="mt-2 text-base">No subjects have been added yet. Please check back later!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Link } from '@inertiajs/vue3'

const props = defineProps({
  subjects: Array,
  subjectMap: Object,
})

// --- ICON LOGIC ---
// A comprehensive map of your medical subjects to their respective SVG icons.
// Using v-html is safe here because we control the SVG strings entirely.
// I've chosen icons that are either literal or conceptual representations.

const subjectIcons = {
  'Allergy & Immunology': `<svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>`, // Shield for defense
  'Cardiovascular System': `<svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>`, // Heart
  'Dermatology': `<svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>`, // Sparkles for skin health/glow
  'Ear, Nose & Throat (ENT)': `<svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.858 15.858a5 5 0 01-2.828-7.072m9.9 9.9a1 1 0 11-1.414 1.414A1 1 0 0111.314 17.27l-2.829-2.828a1 1 0 010-1.414l2.829-2.829a1 1 0 011.414 0l2.828 2.829a1 1 0 010 1.414l-2.828 2.828z" /></svg>`, // Sound waves
  'Embryology': `<svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`, // A simplified cell/egg
  'Endocrine, Diabetes & Metabolism': `<svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>`, // Scale for balance
  'Female Reproductive System & Breast': `<svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-1a6 6 0 00-1-3.72a4 4 0 00-4 0A6 6 0 003 20v1z" /></svg>`, // Abstract user group/nurturing symbol
  'Gastrointestinal & Nutrition': `<svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>`, // A 'collection' representing the GI tract
  'Hematology & Oncology': `<svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.404 7.95a12.001 12.001 0 00-14.808 0" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.334 16.126a1.001 1.001 0 00-1.415-1.415L12 15.586l-1.01-1.01a1.001 1.001 0 00-1.415 1.415l1.01 1.01-1.01 1.01a1.001 1.001 0 001.415 1.415L12 18.414l1.01 1.01a1.001 1.001 0 001.415-1.415l-1.01-1.01 1.01-1.01zM12 21a9 9 0 100-18 9 9 0 000 18z" /></svg>`, // A ribbon inside a circle, for awareness/research
  'Infectious Diseases': `<svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>`, // Lightning bolt for fast-spreading pathogens
  'Male Reproductive System': `<svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>`, // Standard user icon
  'Miscellaneous (Multisystem)': `<svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>`, // Puzzle piece for interconnected/varied systems
  'Nervous System': `<svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6.002l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>`, // Network/share icon for neural pathways
  'Ophthalmology': `<svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>`, // Eye
  'Poisoning & Environmental Exposure': `<svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>`, // Warning sign
  'Pregnancy, Childbirth & Puerperium': `<svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>`, // Users icon for family
  'Psychiatric/Behavioral & Substance Abuse': `<svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>`, // Speech bubble for therapy/dialogue
  'Pulmonary & Critical Care': `<svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>`, // Trending up/vitals line
  'Renal, Urinary Systems & Electrolytes': `<svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 8v8a1 1 0 001 1h10a1 1 0 001-1V8m-9 4h4" /></svg>`, // A filter, representing the kidney's function
  'Rheumatology/Orthopedics & Sports': `<svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6L14.6 7.2A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" /></svg>`, // Fast-forward/motion icon for sports
  'Social Sciences & Ethics': `<svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h8" /></svg>`, // Library/Book icon for knowledge, law, and humanities
}

// A default icon for any subject not in the map above. This makes the system robust.
const defaultIcon = `<svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>`

// Function to get the correct icon string for a subject
function getIconForSubject(subjectName) {
  // Use the mapped icon, or fall back to the default icon if the subject name doesn't exist in the map
  return subjectIcons[subjectName] || defaultIcon
}
</script>
