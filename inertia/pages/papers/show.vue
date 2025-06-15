<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import { computed, onMounted, ref } from 'vue'
import ConceptDto from '#dtos/concept'
import PastPaperDto from '#dtos/past_paper'
import type UserStudySessionDto from '#dtos/user_study_session'
import DashLayout from '~/layouts/DashLayout.vue'
import { FileText, Calendar, AlertCircle, Settings } from 'lucide-vue-next'
import { StudyLevel } from '#enums/study_level'
import axios from 'axios'

defineOptions({ layout: DashLayout })

interface Props {
  concept: ConceptDto
  papers: PastPaperDto[]
  canManage: boolean
  studySession?: UserStudySessionDto
}

const props = defineProps<Props>()
const studySession = ref(props.studySession)

onMounted(async () => {
  if (!studySession.value) {
    try {
      const response = await axios.post('/api/study-sessions', {
        resourceType: 'paper',
        resourceId: props.concept.id, // Using concept ID as this is a listing page
      })
      studySession.value = response.data
    } catch (error) {
      console.error('Failed to create study session:', error)
    }
  }
})

const breadcrumbItems = computed(() => [
  { label: 'Papers', href: '/papers' },
  { label: props.concept.title },
])

const hasPapers = computed(() => props.papers.length > 0)

const selectedStudyLevel = ref<StudyLevel | null>(null)
const selectedExamType = ref<string | null>(null)

const examTypes = computed(() => {
  // Get unique exam types from papers
  return Array.from(new Set(props.papers.map((p) => p.examType)))
})

const papersByYear = computed(() => {
  let filtered = props.papers
  if (selectedStudyLevel.value) {
    filtered = filtered.filter((p) => p.studyLevel === selectedStudyLevel.value)
  }
  if (selectedExamType.value) {
    filtered = filtered.filter((p) => p.examType === selectedExamType.value)
  }
  return filtered.reduce(
    (acc, paper) => {
      const year = paper.year
      if (!acc[year]) acc[year] = []
      acc[year].push(paper)
      return acc
    },
    {} as Record<string, PastPaperDto[]>
  )
})
</script>

<template>
  <AppHead :title="`${concept.title} Papers`" :description="`Past papers for ${concept.title}`" />
  
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
    <!-- Header Section -->
    <div
      class="relative p-6 sm:p-8 bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
    >
      <!-- Gradient Top Border -->
      <div
        class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#55A9C4] via-[#55A9C4]/50 to-transparent rounded-t-xl sm:rounded-t-2xl"
      />

      <BreadcrumbTrail :items="breadcrumbItems" class="mb-4" />

      <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-6">
        <!-- Icon and Title -->
        <div class="flex items-start gap-3 sm:gap-4 flex-1">
          <div
            class="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-[#55A9C4]/10 border border-[#55A9C4]/20 hover:bg-[#55A9C4]/20 transition-colors duration-200"
          >
            <FileText class="h-5 w-5 text-[#55A9C4]" />
          </div>
          <div class="space-y-1.5 sm:space-y-2">
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              {{ concept.title }}
            </h1>
            <p class="text-sm sm:text-base text-gray-600">Past Examination Papers</p>
          </div>
        </div>

        <!-- Manage Button -->
        <div class="w-full sm:w-auto flex-shrink-0">
          <Link
            v-if="canManage"
            :href="`/manage/papers/${concept.slug}`"
            class="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#55A9C4] hover:bg-[#4795af] transition-colors text-white text-sm font-medium hover:shadow-xs transition-all duration-200"
          >
            <Settings class="h-4 w-4" />
            <span>Manage Papers</span>
          </Link>
        </div>
      </div>
    </div>

    <!-- Filter Section -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-1 sm:px-0">
      <ToggleStudyLevel v-model="selectedStudyLevel" :papers="papers" />
      <div v-if="examTypes.length > 1" class="w-full sm:w-auto">
        <select
          v-model="selectedExamType"
          class="w-full sm:w-auto px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:border-[#55A9C4] focus:ring-1 focus:ring-[#55A9C4]/30 transition-all duration-200"
        >
          <option :value="null">All Exam Types</option>
          <option v-for="type in examTypes" :key="type" :value="type">
            {{ type.toUpperCase() }}
          </option>
        </select>
      </div>
    </div>

    <!-- Papers by Year -->
    <template v-if="hasPapers">
      <div v-for="(yearPapers, year) in papersByYear" :key="year" class="space-y-5 sm:space-y-6">
        <div class="flex items-center gap-2 text-lg sm:text-xl font-semibold text-gray-900">
          <Calendar class="h-5 w-5 text-[#55A9C4]" />
          <h2>{{ year }}</h2>
        </div>

        <div class="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            v-for="paper in yearPapers"
            :key="paper.id"
            :href="`/papers/${concept.slug}/${paper.slug}`"
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
              <h3
                class="text-lg sm:text-xl font-semibold text-gray-900 group-hover:text-[#55A9C4] transition-colors duration-300"
              >
                {{ paper.title }}
              </h3>

              <div class="flex flex-wrap items-center gap-2">
                <span class="px-2.5 py-1 rounded-md bg-[#55A9C4]/10 text-[#55A9C4] text-sm font-medium">
                  {{ paper.examType.toUpperCase() }}
                </span>
                <span
                  v-if="paper.paperType"
                  class="px-2.5 py-1 rounded-md bg-[#55A9C4]/10 text-[#55A9C4] text-sm font-medium"
                >
                  {{ paper.paperType.toUpperCase() }}
                </span>
                <span class="text-sm text-gray-500">
                  {{ paper.questions?.length ?? 0 }} questions
                </span>
              </div>

              <div
                class="flex items-center text-sm text-[#55A9C4] font-medium opacity-0 group-hover:opacity-100 transition-all duration-300"
              >
                <span>Attempt Paper</span>
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
      </div>
    </template>

    <!-- No Papers Available -->
    <div
      v-else
      class="relative p-6 sm:p-8 bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm"
    >
      <div class="flex items-start gap-3 sm:gap-4">
        <div class="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-amber-500/10 border border-amber-500/20">
          <AlertCircle class="h-5 w-5 text-amber-500" />
        </div>
        <div class="space-y-1.5 sm:space-y-2">
          <h2 class="text-lg sm:text-xl font-semibold text-gray-900">No Papers Available Yet</h2>
          <p class="text-sm sm:text-base text-gray-600">
            We're currently adding past papers for {{ concept.title }}. Please check back later.
          </p>
        </div>
      </div>
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
a, button, select, .transition-all {
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

/* Custom select styling */
select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2355A9C4' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1rem;
}
</style>