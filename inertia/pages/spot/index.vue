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

  <div class="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6">
    <!-- Header Section -->
    <div
      class="relative p-3 sm:p-4 md:p-5 bg-white rounded-lg sm:rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
    >
      <!-- Gradient Top Border -->
      <div
        class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#55A9C4] via-[#55A9C4]/50 to-transparent"
      />

      <BreadcrumbTrail :items="breadcrumbItems" />

      <div class="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
        <!-- Icon and Title -->
        <div class="flex items-start gap-2 sm:gap-3 flex-1">
          <div
            class="p-1.5 sm:p-2 rounded-lg bg-[#55A9C4]/10 border border-[#55A9C4]/20 hover:bg-[#55A9C4]/20 transition-colors duration-200"
          >
            <Pin class="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#55A9C4]" />
          </div>
          <div class="space-y-0.5 sm:space-y-1">
            <h1 class="text-base sm:text-lg font-medium text-gray-900">SPOT Papers</h1>
            <p class="text-2xs sm:text-xs text-gray-500 max-w-2xl">
              Access and practice with previous SPOT examination papers
            </p>
          </div>
        </div>

        <!-- Manage Button -->
        <div class="w-full sm:w-auto mt-2 sm:mt-0">
          <Link
            v-if="canManage"
            href="/manage/spot"
            class="w-full sm:w-auto flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#55A9C4] hover:bg-[#55A9C4]/90 text-white border border-[#55A9C4] text-2xs sm:text-xs font-medium hover:shadow-sm transition-all duration-200 group"
          >
            <Settings class="h-3 w-3 transition-transform duration-500 group-hover:rotate-180" />
            <span>Edit</span>
          </Link>
        </div>
      </div>
    </div>

    <!-- SPOT Grid -->
    <div class="grid gap-2 sm:gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      <Link
        v-for="concept in concepts"
        :key="concept.id"
        :href="`/spot/${concept.slug}`"
        class="group relative overflow-hidden rounded-lg bg-white p-3 sm:p-4 border border-gray-100 hover:border-[#55A9C4]/20 hover:shadow-md transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 sm:hover:-translate-y-1"
      >
        <!-- Gradient Overlay on Hover -->
        <div
          class="absolute inset-0 bg-gradient-to-br from-[#55A9C4]/10 via-[#55A9C4]/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out"
        />
        <div
          class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#55A9C4] via-[#55A9C4]/50 to-transparent"
        />

        <div class="relative space-y-2 sm:space-y-3">
          <!-- Concept Title -->
          <h2
            class="text-sm sm:text-base font-medium text-gray-900 group-hover:text-[#55A9C4] transition-colors duration-200 ease-in-out"
          >
            {{ concept.title }}
          </h2>

          <!-- Papers and Stations Count -->
          <div class="flex items-center gap-1.5 sm:gap-2 text-2xs sm:text-xs text-muted-foreground">
            <span class="px-1.5 sm:px-2 py-0.5 rounded-md bg-[#55A9C4]/10 text-[#55A9C4] font-medium">
              {{ getSpotPaperCount(concept) }}
              {{ getSpotPaperCount(concept) === 1 ? 'paper' : 'papers' }}
            </span>
            <span
              v-if="getSpotStationCount(concept) > 0"
              class="px-1.5 sm:px-2 py-0.5 rounded-md bg-[#55A9C4]/10 text-[#55A9C4] font-medium"
            >
              {{ getSpotStationCount(concept) }}
              {{ getSpotStationCount(concept) === 1 ? 'station' : 'stations' }}
            </span>
          </div>

          <!-- View SPOT Papers Link -->
          <div
            class="flex items-center text-2xs sm:text-xs text-[#55A9C4] font-medium opacity-0 group-hover:opacity-100 transition-all duration-200 ease-in-out"
          >
            <span>View SPOTs</span>
            <svg
              class="w-2.5 h-2.5 sm:w-3 sm:h-3 ml-1 transform group-hover:translate-x-1 transition-transform duration-200 ease-in-out"
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

<style>
/* Remove the custom styles and rely on standardized project styling */
</style>
