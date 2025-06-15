<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import { computed, onMounted, ref } from 'vue'
import type ConceptDto from '#dtos/concept'
import type PastPaperDto from '#dtos/past_paper'
import DashLayout from '~/layouts/DashLayout.vue'
import { FileText, Calendar, AlertCircle, Settings } from 'lucide-vue-next'
import { PaperType } from '#enums/exam_type'
import UserStudySessionDto from '#dtos/user_study_session'
import axios from 'axios'

defineOptions({
  layout: DashLayout,
  inheritAttrs: false,
})

interface Props {
  concept: ConceptDto
  papers: PastPaperDto[]
  canManage: boolean
  studySession?: UserStudySessionDto
}

const props = defineProps<Props>()
const studySession = ref(props.studySession)

// Initialize study session - KEPT EXACTLY THE SAME
onMounted(async () => {
  if (!studySession.value) {
    try {
      const response = await axios.post('/api/study-sessions', {
        resourceType: 'spot',
        resourceId: props.concept.id,
      })
      studySession.value = response.data
    } catch (error) {
      console.error('Failed to create study session:', error)
    }
  }
})

// Paper filtering and grouping - KEPT EXACTLY THE SAME
const spotPapers = computed(() =>
  props.papers.filter((paper) => paper.paperType === PaperType.SPOT)
)
const hasPapers = computed(() => spotPapers.value.length > 0)

const papersByYear = computed(() => {
  return spotPapers.value.reduce(
    (acc, paper) => {
      const year = paper.year
      if (!acc[year]) acc[year] = []
      acc[year].push(paper)
      return acc
    },
    {} as Record<string, PastPaperDto[]>
  )
})

const breadcrumbItems = computed(() => [
  { label: 'SPOT Papers', href: '/spot' },
  { label: props.concept.title },
])
</script>

<template>
  <AppHead :title="`${concept.title} SPOT Papers`" :description="`SPOT papers for ${concept.title}`" />
  
  <div class="min-h-screen bg-gray-50/50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <!-- Updated Header Section -->
      <div class="mb-6 sm:mb-10 header-animation">
        <BreadcrumbTrail :items="breadcrumbItems" class="mb-4 sm:mb-5" />

        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-6 mb-5 sm:mb-6">
          <div class="flex items-start gap-3 sm:gap-4 flex-1">
            <div class="flex-shrink-0 mt-0.5">
              <div class="h-10 w-10 rounded-lg bg-[#55A9C4]/10 flex items-center justify-center">
                <FileText class="h-6 w-6 text-[#55A9C4]" />
              </div>
            </div>
            <div>
              <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {{ concept.title }}
              </h1>
              <p class="text-sm sm:text-base text-gray-600 max-w-3xl leading-relaxed">
                SPOT Practice Papers
              </p>
            </div>
          </div>

          <!-- Manage Button - Same functionality, matched style -->
          <div class="w-full sm:w-auto flex-shrink-0">
            <Link
              v-if="canManage"
              :href="`/manage/spot/${concept.slug}`"
              class="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#55A9C4] hover:bg-[#4795af] text-white text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Settings class="h-4 w-4" />
              <span>Manage</span>
            </Link>
          </div>
        </div>

        <div class="w-12 h-1 bg-gradient-to-r from-[#55A9C4] to-[#55A9C4]/70 rounded-full"></div>
      </div>

      <!-- Papers by Year - Same grouping logic, updated styling -->
      <template v-if="hasPapers">
        <div v-for="(yearPapers, year) in papersByYear" :key="year" class="mb-8 sm:mb-10">
          <div class="flex items-center gap-3 mb-4 sm:mb-5">
            <div class="h-8 w-8 rounded-lg bg-[#55A9C4]/10 flex items-center justify-center">
              <Calendar class="h-5 w-5 text-[#55A9C4]" />
            </div>
            <h2 class="text-xl sm:text-2xl font-semibold text-gray-900">{{ year }}</h2>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            <Link
              v-for="(paper, index) in yearPapers"
              :key="paper.id"
              :href="`/spot/${concept.slug}/${paper.slug}`"
              class="concept-card"
              :style="`--animation-order: ${index};`"
            >
              <div class="group block p-4 sm:p-5 bg-white rounded-xl border border-gray-200 hover:border-[#55A9C4]/40 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                <div class="flex items-start space-x-3">
                  <div class="flex-shrink-0 mt-0.5">
                    <div class="h-8 w-8 rounded-lg bg-[#55A9C4]/10 flex items-center justify-center">
                      <FileText class="h-5 w-5 text-[#55A9C4]" />
                    </div>
                  </div>
                  <div>
                    <h3 class="text-base font-semibold text-gray-900 group-hover:text-[#55A9C4] transition-colors duration-200 line-clamp-2">
                      {{ paper.title }}
                    </h3>
                    <div class="mt-1 mb-1">
                      <span class="inline-flex px-2 py-1 rounded-md bg-[#55A9C4]/10 text-[#55A9C4] text-xs font-medium">
                        {{
                          paper.questions
                            ? paper.questions.reduce((sum, q) => sum + (q.spotStations?.length || 0), 0)
                            : 0
                        }} stations
                      </span>
                    </div>
                    <p class="text-sm text-gray-500">Practice SPOT</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </template>

      <!-- No Papers Available - Same logic, updated styling -->
      <div v-else class="text-center py-12 sm:py-16 empty-state">
        <div class="mx-auto h-16 w-16 sm:h-20 sm:w-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 sm:mb-5">
          <AlertCircle class="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
        </div>
        <h3 class="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No SPOT Papers Available Yet</h3>
        <p class="text-sm sm:text-base text-gray-500 max-w-md mx-auto">
          We're currently adding SPOT papers for {{ concept.title }}. Please check back later.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Consistent animations with other pages */
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

/* Base typography - Matched to other pages */
html {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}
@supports (font-variation-settings: normal) {
  html { font-family: 'Inter var', system-ui, -apple-system, sans-serif; }
}

/* Line clamp utility - Matched to other pages */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>