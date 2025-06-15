<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import type ConceptDto from '#dtos/concept'
import DashLayout from '~/layouts/DashLayout.vue'
import { FileText, Settings } from 'lucide-vue-next'
import { ref, computed, onMounted } from 'vue'
import { TrainingLevel } from '#enums/training_level'
import UserStudySessionDto from '#dtos/user_study_session'
import axios from 'axios'

defineOptions({ layout: DashLayout })

interface Props {
  concepts: ConceptDto[]
  canManage: boolean
  studySession?: UserStudySessionDto
}

const props = defineProps<Props>()
const studySession = ref(props.studySession)

// Initialize study session if not provided
onMounted(async () => {
  if (!studySession.value) {
    try {
      const response = await axios.post('/api/study-sessions', {
        resourceType: 'paper',
        resourceId: 0, // Special case for index
      })
      studySession.value = response.data
    } catch (error) {
      console.error('Failed to create study session:', error)
    }
  }
})

const selectedLevel = ref<TrainingLevel | null>(null)

const filteredConcepts = computed(() => {
  if (!selectedLevel.value) return props.concepts
  return props.concepts.filter((c) => c.trainingLevel === selectedLevel.value)
})
</script>

<template>
  <AppHead title="Past Papers" description="Access past examination papers" />
  
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
    <!-- Header Section -->
    <div
      class="relative p-6 sm:p-8 bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
    >
      <!-- Gradient Top Border -->
      <div
        class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#55A9C4] via-[#55A9C4]/50 to-transparent rounded-t-xl sm:rounded-t-2xl"
      />

      <BreadcrumbTrail :items="[{ label: 'Papers' }]" class="mb-4" />

      <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-6">
        <!-- Icon and Title -->
        <div class="flex items-start gap-3 sm:gap-4 flex-1">
          <div
            class="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-[#55A9C4]/10 border border-[#55A9C4]/20 hover:bg-[#55A9C4]/20 transition-colors duration-200"
          >
            <FileText class="h-5 w-5 text-[#55A9C4]" />
          </div>
          <div class="space-y-1.5 sm:space-y-2">
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Past Papers</h1>
            <p class="text-sm sm:text-base text-gray-600 max-w-3xl leading-relaxed">
              Access and practice with previous examination papers organized by subjects and training levels.
            </p>
          </div>
        </div>

        <!-- Manage Button -->
        <div class="w-full sm:w-auto flex-shrink-0">
          <Link
            v-if="canManage"
            href="/manage/papers"
            class="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#55A9C4] hover:bg-[#4795af] transition-colors text-white text-sm font-medium hover:shadow-xs transition-all duration-200"
          >
            <Settings class="h-4 w-4" />
            <span>Manage</span>
          </Link>
        </div>
      </div>
    </div>

    <!-- Filter Section -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 px-1 sm:px-0">
      <p class="text-sm text-gray-500">
        Showing {{ filteredConcepts.length }} subjects
        <span v-if="selectedLevel" class="font-medium text-[#55A9C4]">({{ selectedLevel }} level)</span>
      </p>
      <ToggleTrainingLevel v-model="selectedLevel" />
    </div>

    <!-- Papers Grid -->
    <div class="grid gap-4 sm:gap-5 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      <Link
        v-for="concept in filteredConcepts"
        :key="concept.id"
        :href="`/papers/${concept.slug}`"
        class="group relative overflow-hidden rounded-xl bg-white p-5 sm:p-6 border border-gray-100 hover:border-[#55A9C4]/30 hover:shadow-xs transition-all duration-300"
      >
        <!-- Gradient Overlay on Hover -->
        <div
          class="absolute inset-0 bg-gradient-to-br from-[#55A9C4]/5 via-[#55A9C4]/3 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"
        />
        <div
          class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#55A9C4] via-[#55A9C4]/50 to-transparent"
        />

        <div class="relative space-y-3 sm:space-y-4">
          <!-- Concept Title -->
          <h2
            class="text-lg sm:text-xl font-semibold text-gray-900 group-hover:text-[#55A9C4] transition-colors duration-300"
          >
            {{ concept.title }}
          </h2>
          
          <!-- Papers Count -->
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-1 rounded-md bg-[#55A9C4]/10 text-[#55A9C4] text-sm font-medium">
              {{ concept.pastPapers?.length ?? 0 }}
              {{ (concept.pastPapers?.length ?? 0) === 1 ? 'paper' : 'papers' }} available
            </span>
          </div>

          <!-- View Papers Link -->
          <div
            class="flex items-center text-sm text-[#55A9C4] font-medium opacity-0 group-hover:opacity-100 transition-all duration-300"
          >
            <span>View papers</span>
            <svg
              class="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300"
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
      </Link>
    </div>

    <!-- Empty State -->
    <div 
      v-if="filteredConcepts.length === 0" 
      class="text-center py-12 sm:py-16 bg-white rounded-xl border border-gray-100"
    >
      <div class="mx-auto h-16 w-16 sm:h-20 sm:w-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 sm:mb-5">
        <FileText class="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
      </div>
      <h3 class="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No papers found</h3>
      <p class="text-sm sm:text-base text-gray-600 max-w-md mx-auto mb-4">
        No papers match your current filters. Try adjusting your selection.
      </p>
      <button
        @click="selectedLevel = null"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-xs text-white bg-[#55A9C4] hover:bg-[#4795af] focus:outline-none transition-colors duration-200"
      >
        Clear filters
      </button>
    </div>
  </div>
</template>

<style>
/* Base typography */
html {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}
@supports (font-variation-settings: normal) {
  html { font-family: 'Inter var', system-ui, -apple-system, sans-serif; }
}

/* Smooth transitions */
a, button, .transition-all {
  transition-property: color, background-color, border-color, transform, opacity, box-shadow;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .max-w-7xl {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>