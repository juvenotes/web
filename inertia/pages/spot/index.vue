<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import type ConceptDto from '#dtos/concept'
import DashLayout from '~/layouts/DashLayout.vue'
import { Pin, Settings } from 'lucide-vue-next'
import { PaperType } from '#enums/exam_type'
import UserStudySessionDto from '#dtos/user_study_session'
import axios from 'axios'
import { ref, onMounted } from 'vue'

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
        resourceType: 'spot',
        resourceId: 0, // Special case for index page
      })
      studySession.value = response.data
    } catch (error) {
      console.error('Failed to create study session:', error)
    }
  }
})

const getSpotPaperCount = (concept: ConceptDto) =>
  concept.pastPapers?.filter((paper) => paper.paperType === PaperType.SPOT).length ?? 0

const getSpotStationCount = (concept: ConceptDto) => {
  return (
    concept.pastPapers
      ?.filter((paper) => paper.paperType === PaperType.SPOT)
      .reduce((total, paper) => {
        return (
          total + (paper.questions?.reduce((sum, q) => sum + (q.spotStations?.length || 0), 0) || 0)
        )
      }, 0) || 0
  )
}

const breadcrumbItems = [{ label: 'SPOT Papers' }]
</script>

<template>
  <AppHead title="SPOT Papers" description="Access SPOT examination papers" />
  <!-- <StudySessionTracker v-if="studySession" :sessionId="studySession.id" /> -->

  <div class="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 font-sans">
    <!-- Header Section -->
    <div class="relative p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
      <!-- Theme-colored top border -->
      <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#55A9C4] via-[#55A9C4]/50 to-transparent rounded-t-xl" />

      <BreadcrumbTrail :items="breadcrumbItems" class="mb-4" />

      <div class="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
        <!-- Icon and Title -->
        <div class="flex items-start gap-4 flex-1">
          <div class="p-3 rounded-lg bg-[#55A9C4]/10 border border-[#55A9C4]/20 hover:bg-[#55A9C4]/20 transition-colors duration-200">
            <Pin class="h-5 w-5 text-[#55A9C4]" />
          </div>
          <div class="space-y-2">
            <h1 class="text-xl sm:text-2xl font-semibold text-gray-900">SPOT Papers</h1>
            <p class="text-sm text-gray-600 max-w-2xl">
              Access and practice with previous SPOT examination papers
            </p>
          </div>
        </div>

        <!-- Manage Button -->
        <div class="w-full sm:w-auto">
          <Link
            v-if="canManage"
            href="/manage/spot"
            class="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#55A9C4] hover:bg-[#55A9C4]/90 text-white border border-[#55A9C4] text-sm font-medium hover:shadow-md transition-all duration-200 group"
          >
            <Settings class="h-4 w-4 transition-transform duration-500 group-hover:rotate-180" />
            <span>Edit</span>
          </Link>
        </div>
      </div>
    </div>

    <!-- SPOT Grid -->
    <div class="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      <Link
        v-for="concept in concepts"
        :key="concept.id"
        :href="`/spot/${concept.slug}`"
        class="group relative overflow-hidden rounded-xl bg-white p-5 sm:p-6 border border-gray-100 hover:border-[#55A9C4]/30 hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 sm:hover:-translate-y-2"
      >
        <!-- Theme-colored overlay on hover -->
        <div class="absolute inset-0 bg-gradient-to-br from-[#55A9C4]/10 via-[#55A9C4]/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out" />
        <div class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#55A9C4] via-[#55A9C4]/50 to-transparent" />

        <div class="relative space-y-3 sm:space-y-4">
          <!-- Concept Title -->
          <h2 class="text-lg font-semibold text-gray-900 group-hover:text-[#55A9C4] transition-colors duration-300">
            {{ concept.title }}
          </h2>

          <!-- Papers and Stations Count -->
          <div class="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span class="px-2 py-1 rounded-md bg-[#55A9C4]/10 text-[#55A9C4] font-medium">
              {{ getSpotPaperCount(concept) }}
              {{ getSpotPaperCount(concept) === 1 ? 'paper' : 'papers' }}
            </span>
            <span
              v-if="getSpotStationCount(concept) > 0"
              class="px-2 py-1 rounded-md bg-[#55A9C4]/10 text-[#55A9C4] font-medium"
            >
              {{ getSpotStationCount(concept) }}
              {{ getSpotStationCount(concept) === 1 ? 'station' : 'stations' }}
            </span>
          </div>

          <!-- View SPOT Papers Link -->
          <div class="flex items-center text-sm text-[#55A9C4] font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 mt-2">
            <span>View SPOTs</span>
            <svg
              class="w-4 h-4 ml-2 transform group-hover:translate-x-2 transition-transform duration-300"
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
  </div>
</template>

<style scoped>
/* Enhanced responsive behavior */
@media (max-width: 640px) {
  .group:hover .group-hover\:text-\[\#55A9C4\] {
    color: inherit; /* Disable hover color change on mobile */
  }
  
  .group:hover .group-hover\:opacity-100 {
    opacity: 0; /* Keep hidden on mobile */
  }
}

/* Better touch targets for mobile */
@media (max-width: 640px) {
  [href] {
    min-height: 120px; /* Larger touch target */
    padding: 1rem; /* More padding for better spacing */
  }
}

/* Responsive grid adjustments */
@media (max-width: 767px) {
  .sm\:grid-cols-2 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}

/* Theme color consistency */
.bg-\[\#55A9C4\] {
  background-color: #55A9C4;
}
.border-\[\#55A9C4\] {
  border-color: #55A9C4;
}
.text-\[\#55A9C4\] {
  color: #55A9C4;
}
.hover\:bg-\[\#55A9C4\]\/90:hover {
  background-color: rgba(85, 169, 196, 0.9);
}
.bg-\[\#55A9C4\]\/10 {
  background-color: rgba(85, 169, 196, 0.1);
}
.border-\[\#55A9C4\]\/20 {
  border-color: rgba(85, 169, 196, 0.2);
}
.hover\:bg-\[\#55A9C4\]\/20:hover {
  background-color: rgba(85, 169, 196, 0.2);
}
.hover\:border-\[\#55A9C4\]\/30:hover {
  border-color: rgba(85, 169, 196, 0.3);
}
.from-\[\#55A9C4\] {
  --tw-gradient-from: #55A9C4;
  --tw-gradient-to: rgba(85, 169, 196, 0);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}
.from-\[\#55A9C4\]\/10 {
  --tw-gradient-from: rgba(85, 169, 196, 0.1);
  --tw-gradient-to: rgba(85, 169, 196, 0);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}
.via-\[\#55A9C4\]\/50 {
  --tw-gradient-to: rgba(85, 169, 196, 0);
  --tw-gradient-stops: var(--tw-gradient-from), rgba(85, 169, 196, 0.5), var(--tw-gradient-to);
}
</style>