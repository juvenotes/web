<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import type ConceptDto from '#dtos/concept'
import DashLayout from '~/layouts/DashLayout.vue'
import { Stethoscope, Settings } from 'lucide-vue-next'
import { PaperType } from '#enums/exam_type'
import { onMounted, ref, computed } from 'vue'
import axios from 'axios'
import UserStudySessionDto from '#dtos/user_study_session'

defineOptions({ layout: DashLayout })

interface Props {
  concepts: ConceptDto[]
  canManage: boolean
  studySession?: UserStudySessionDto
}

const props = defineProps<Props>()
const studySession = ref(props.studySession)

// Initialize study session if not provided - KEPT EXACTLY THE SAME
onMounted(async () => {
  if (!studySession.value) {
    try {
      const response = await axios.post('/api/study-sessions', {
        resourceType: 'osce',
        resourceId: 0, // Special case for index page
      })
      studySession.value = response.data
    } catch (error) {
      console.error('Failed to create study session:', error)
    }
  }
})

// Paper counting function - KEPT EXACTLY THE SAME
const getOscePaperCount = (concept: ConceptDto) =>
  concept.pastPapers?.filter((paper) => paper.paperType === PaperType.OSCE).length ?? 0

const breadcrumbItems = [{ label: 'OSCEs' }]
const hasConcepts = computed(() => props.concepts.length > 0) // Added for consistent empty state
</script>

<template>
  <AppHead title="OSCE Papers" description="Access OSCE examination papers" />

  <div class="min-h-screen bg-gray-50/50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <!-- Header Section - Matched Past Papers style -->
      <div class="mb-6 sm:mb-10 header-animation">
        <BreadcrumbTrail :items="breadcrumbItems" class="mb-4 sm:mb-5" />

        <div
          class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-6 mb-5 sm:mb-6"
        >
          <div class="flex items-start gap-3 sm:gap-4 flex-1">
            <div class="flex-shrink-0 mt-0.5">
              <div class="h-10 w-10 rounded-lg bg-[#55A9C4]/10 flex items-center justify-center">
                <Stethoscope class="h-6 w-6 text-[#55A9C4]" />
              </div>
            </div>
            <div>
              <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">OSCE Papers</h1>
              <p class="text-sm sm:text-base text-gray-600 max-w-3xl leading-relaxed">
                Access and practice with previous Objective Structured Clinical Examination papers.
              </p>
            </div>
          </div>

          <!-- Manage Button - Same functionality, matched style -->
          <div class="w-full sm:w-auto flex-shrink-0">
            <Link
              v-if="canManage"
              href="/manage/osce"
              class="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#55A9C4] hover:bg-[#4795af] transition-colors text-white text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Settings class="h-4 w-4" />
              <span>Manage</span>
            </Link>
          </div>
        </div>

        <div class="w-12 h-1 bg-gradient-to-r from-[#55A9C4] to-[#55A9C4]/70 rounded-full"></div>
      </div>

      <!-- OSCE Grid - Same data rendering, matched card style -->
      <div
        v-if="hasConcepts"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5"
      >
        <div
          v-for="(concept, index) in concepts"
          :key="concept.id"
          class="concept-card"
          :style="`--animation-order: ${index};`"
        >
          <Link
            :href="`/osce/${concept.slug}`"
            class="group block p-4 sm:p-5 bg-white rounded-xl border border-gray-200 hover:border-[#55A9C4]/40 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
          >
            <div class="flex items-start space-x-3">
              <div class="flex-shrink-0 mt-0.5">
                <div class="h-8 w-8 rounded-lg bg-[#55A9C4]/10 flex items-center justify-center">
                  <Stethoscope class="h-5 w-5 text-[#55A9C4]" />
                </div>
              </div>
              <div>
                <h3
                  class="text-base font-semibold text-gray-900 group-hover:text-[#55A9C4] transition-colors duration-200 line-clamp-2"
                >
                  {{ concept.title }}
                </h3>
                <div class="mt-1 mb-1">
                  <span
                    class="inline-flex px-2 py-1 rounded-md bg-[#55A9C4]/10 text-[#55A9C4] text-xs font-medium"
                  >
                    {{ getOscePaperCount(concept) }}
                    {{ getOscePaperCount(concept) === 1 ? 'paper' : 'papers' }}
                  </span>
                </div>
                <p class="text-sm text-gray-500">View OSCEs</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      <!-- Empty State - Same conditional logic, matched style -->
      <div v-else class="text-center py-12 sm:py-16 empty-state">
        <div
          class="mx-auto h-16 w-16 sm:h-20 sm:w-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 sm:mb-5"
        >
          <Stethoscope class="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
        </div>
        <h3 class="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No OSCEs found</h3>
        <p class="text-sm sm:text-base text-gray-500 max-w-md mx-auto">
          No OSCE papers are currently available. Check back later or contact support.
        </p>
        <Link
          v-if="canManage"
          href="/manage/osce"
          class="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#55A9C4] hover:bg-[#4795af] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#55A9C4] transition-colors duration-200"
        >
          Add OSCE Papers
        </Link>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Animation styles matched to Past Papers */
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

/* Base typography - Matched to Past Papers */
html {
  font-family:
    'Inter',
    system-ui,
    -apple-system,
    sans-serif;
}
@supports (font-variation-settings: normal) {
  html {
    font-family:
      'Inter var',
      system-ui,
      -apple-system,
      sans-serif;
  }
}

/* Responsive adjustments - Matched to Past Papers */
@media (max-width: 640px) {
  .group {
    min-height: 56px;
  }

  .max-w-7xl {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

/* Line clamp utility - Matched to Past Papers */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
