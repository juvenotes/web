<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import type ConceptDto from '#dtos/concept'
import DashLayout from '~/layouts/DashLayout.vue'
import { BookOpen, Settings } from 'lucide-vue-next'
import { TrainingLevel } from '#enums/training_level'
import { ref, computed, onMounted } from 'vue'
import UserStudySessionDto from '#dtos/user_study_session'
import axios from 'axios'

defineOptions({ layout: DashLayout })

const selectedLevel = ref<TrainingLevel | null>(null)

const filteredConcepts = computed(() => {
  if (!selectedLevel.value) return props.concepts
  return props.concepts.filter((c) => c.trainingLevel === selectedLevel.value)
})

interface Props {
  concepts: ConceptDto[]
  canManage: boolean
  studySession?: UserStudySessionDto
}

const props = defineProps<Props>()
const studySession = ref(props.studySession)

// Create a study session if one wasn't provided by the server
onMounted(async () => {
  if (!studySession.value) {
    try {
      const response = await axios.post('/api/study-sessions', {
        resourceType: 'concept',
        resourceId: 0, // Use 0 as a special ID for the concepts index page
      })
      studySession.value = response.data
    } catch (error) {
      console.error('Failed to create study session:', error)
    }
  }
})

const breadcrumbItems = [{ label: 'Concepts' }]
const hasConcepts = computed(() => filteredConcepts.value.length > 0)
</script>

<template>
  <AppHead title="All available concepts" description="All available concepts in Juvenotes" />
  
  <div class="min-h-screen bg-gray-50/50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <!-- Header Section -->
      <div class="mb-6 sm:mb-10 header-animation">
        <BreadcrumbTrail :items="breadcrumbItems" class="mb-4 sm:mb-5" />

        <!-- Title and Description -->
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-6 mb-5 sm:mb-6">
          <div class="flex items-start gap-3 sm:gap-4 flex-1">
            <div class="flex-shrink-0 mt-0.5">
              <div class="h-10 w-10 rounded-lg bg-[#55A9C4]/10 flex items-center justify-center">
                <BookOpen class="h-6 w-6 text-[#55A9C4]" />
              </div>
            </div>
            <div>
              <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Medical Concepts</h1>
              <p class="text-sm sm:text-base text-gray-600 max-w-3xl leading-relaxed">
                Explore medical concepts organized by topics and training levels.
              </p>
            </div>
          </div>

          <!-- Manage Button -->
          <div class="w-full sm:w-auto flex-shrink-0">
            <Link
              v-if="canManage"
              href="/manage/concepts"
              class="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#55A9C4] hover:bg-[#4795af] transition-colors text-white text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Settings class="h-4 w-4" />
              <span>Manage</span>
            </Link>
          </div>
        </div>

        <div class="w-12 h-1 bg-gradient-to-r from-[#55A9C4] to-[#55A9C4]/70 rounded-full"></div>
      </div>

      <!-- Filter Section -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 sm:mb-8">
        <p class="text-sm text-gray-500">
          Showing {{ filteredConcepts.length }} concepts
          <span v-if="selectedLevel" class="font-medium text-[#55A9C4]">({{ selectedLevel }} level)</span>
        </p>
        <ToggleTrainingLevel v-model="selectedLevel" />
      </div>

      <!-- Concepts Grid - Similar to articles grid -->
      <div v-if="hasConcepts" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        <div
          v-for="(concept, index) in filteredConcepts"
          :key="concept.id"
          class="concept-card"
          :style="`--animation-order: ${index};`"
        >
          <Link
            :href="`/concepts/${concept.slug}`"
            class="group block p-4 sm:p-5 bg-white rounded-xl border border-gray-200 hover:border-[#55A9C4]/40 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
          >
            <div class="flex items-start space-x-3">
              <div class="flex-shrink-0 mt-0.5">
                <div class="h-8 w-8 rounded-lg bg-[#55A9C4]/10 flex items-center justify-center">
                  <BookOpen class="h-5 w-5 text-[#55A9C4]" />
                </div>
              </div>
              <div>
                <h3 class="text-base font-semibold text-gray-900 group-hover:text-[#55A9C4] transition-colors duration-200 line-clamp-2">
                  {{ concept.title }}
                </h3>
                <p class="mt-1 text-sm text-gray-500">Explore concept</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      <!-- No Concepts message -->
      <div v-else class="text-center py-12 sm:py-16 empty-state">
        <div class="mx-auto h-16 w-16 sm:h-20 sm:w-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 sm:mb-5">
          <BookOpen class="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
        </div>
        <h3 class="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No concepts found</h3>
        <p class="text-sm sm:text-base text-gray-500 max-w-md mx-auto">
          <span v-if="selectedLevel">No concepts match your current filters. Try adjusting your selection.</span>
          <span v-else>We couldn't find any concepts. Check back later or contact support.</span>
        </p>
        <button
          v-if="selectedLevel"
          @click="selectedLevel = null"
          class="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#55A9C4] hover:bg-[#4795af] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#55A9C4] transition-colors duration-200"
        >
          Clear filters
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.header-animation {
  animation: fadeIn 0.5s ease-out forwards;
}

.concept-card {
  animation: fadeInUp 0.4s ease-out forwards;
  animation-delay: calc(var(--animation-order) * 0.05s);
  opacity: 0;
  will-change: transform, opacity;
}

.empty-state {
  animation: fadeIn 0.6s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Base typography */
html {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}
@supports (font-variation-settings: normal) {
  html { font-family: 'Inter var', system-ui, -apple-system, sans-serif; }
}

/* Improved touch targets */
@media (max-width: 640px) {
  .group {
    min-height: 56px;
  }
  
  .max-w-7xl {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>