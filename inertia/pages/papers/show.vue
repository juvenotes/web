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

function clearFilters() {
  selectedStudyLevel.value = null
  selectedExamType.value = null
}
</script>

<template>
  <AppHead :title="`${concept.title} Papers`" :description="`Past papers for ${concept.title}`" />

  <div class="min-h-screen bg-gray-50/50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <!-- Header Section -->
      <div class="mb-6 sm:mb-10 header-animation">
        <BreadcrumbTrail :items="breadcrumbItems" class="mb-4 sm:mb-5" />

        <!-- Title and Description -->
        <div
          class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-6 mb-5 sm:mb-6"
        >
          <div class="flex items-start gap-3 sm:gap-4 flex-1">
            <div class="flex-shrink-0 mt-0.5">
              <div class="h-10 w-10 rounded-lg bg-[#55A9C4]/10 flex items-center justify-center">
                <FileText class="h-6 w-6 text-[#55A9C4]" />
              </div>
            </div>
            <div>
              <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{{ concept.title }}</h1>
              <p class="text-sm sm:text-base text-gray-600 max-w-3xl leading-relaxed">
                Past Examination Papers
              </p>
            </div>
          </div>

          <!-- Manage Button -->
          <div class="w-full sm:w-auto flex-shrink-0">
            <Link
              v-if="canManage"
              :href="`/manage/papers/${concept.slug}`"
              class="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#55A9C4] hover:bg-[#4795af] transition-colors text-white text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Settings class="h-4 w-4" />
              <span>Manage Papers</span>
            </Link>
          </div>
        </div>

        <div class="w-12 h-1 bg-gradient-to-r from-[#55A9C4] to-[#55A9C4]/70 rounded-full"></div>
      </div>

      <!-- Filter Section -->
      <div
        class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 sm:mb-8"
      >
        <p class="text-sm text-gray-500">
          Showing {{ Object.values(papersByYear).flat().length }} papers
          <span v-if="selectedStudyLevel || selectedExamType" class="font-medium text-[#55A9C4]"
            >(filtered)</span
          >
        </p>
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
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
      </div>

      <!-- Papers by Year -->
      <template v-if="hasPapers">
        <div v-for="(yearPapers, year) in papersByYear" :key="year" class="mb-8 sm:mb-10">
          <div
            class="flex items-center gap-2 text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-5"
          >
            <Calendar class="h-5 w-5 text-[#55A9C4]" />
            <h2>{{ year }}</h2>
          </div>

          <!-- Papers Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            <div
              v-for="(paper, index) in yearPapers"
              :key="paper.id"
              class="paper-card"
              :style="`--animation-order: ${index};`"
            >
              <Link
                :href="`/papers/${concept.slug}/${paper.slug}`"
                class="group block p-4 sm:p-5 bg-white rounded-xl border border-gray-200 hover:border-[#55A9C4]/40 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
              >
                <div class="flex items-start space-x-3">
                  <div class="flex-shrink-0 mt-0.5">
                    <div
                      class="h-8 w-8 rounded-lg bg-[#55A9C4]/10 flex items-center justify-center"
                    >
                      <FileText class="h-5 w-5 text-[#55A9C4]" />
                    </div>
                  </div>
                  <div>
                    <h3
                      class="text-base font-semibold text-gray-900 group-hover:text-[#55A9C4] transition-colors duration-200 line-clamp-2"
                    >
                      {{ paper.title }}
                    </h3>

                    <div class="flex flex-wrap items-center gap-1 mt-1 mb-1">
                      <span
                        class="inline-flex px-2 py-0.5 rounded-md bg-[#55A9C4]/10 text-[#55A9C4] text-xs font-medium"
                      >
                        {{ paper.examType.toUpperCase() }}
                      </span>
                      <span
                        v-if="paper.paperType"
                        class="inline-flex px-2 py-0.5 rounded-md bg-[#55A9C4]/10 text-[#55A9C4] text-xs font-medium"
                      >
                        {{ paper.paperType.toUpperCase() }}
                      </span>
                    </div>

                    <p class="text-sm text-gray-500">
                      {{ paper.questions?.length ?? 0 }} questions
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </template>

      <!-- No Papers Available -->
      <div v-else class="text-center py-12 sm:py-16 empty-state">
        <div
          class="mx-auto h-16 w-16 sm:h-20 sm:w-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 sm:mb-5"
        >
          <AlertCircle class="h-8 w-8 sm:h-10 sm:w-10 text-amber-500" />
        </div>
        <h3 class="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Papers Available Yet</h3>
        <p class="text-sm sm:text-base text-gray-500 max-w-md mx-auto">
          <span v-if="selectedStudyLevel || selectedExamType"
            >No papers match your current filters. Try adjusting your selection.</span
          >
          <span v-else
            >We're currently adding past papers for {{ concept.title }}. Please check back
            later.</span
          >
        </p>
        <button
          v-if="selectedStudyLevel || selectedExamType"
          @click="clearFilters"
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

.paper-card {
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

/* Line clamp utility */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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
