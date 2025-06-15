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

defineOptions({ layout: DashLayout })

interface Props {
  concept: ConceptDto
  papers: PastPaperDto[]
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
        resourceId: props.concept.id,
      })
      studySession.value = response.data
    } catch (error) {
      console.error('Failed to create study session:', error)
    }
  }
})

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
  <AppHead
    :title="`${concept.title} SPOT Papers`"
    :description="`SPOT papers for ${concept.title}`"
  />

  <div class="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6 md:space-y-8 font-sans">
    <!-- Header Section -->
    <div
      class="relative p-3 sm:p-4 md:p-6 bg-white rounded-lg sm:rounded-xl md:rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div
        class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#55A9C4] via-[#55A9C4]/50 to-transparent"
      />

      <BreadcrumbTrail :items="breadcrumbItems" />

      <div class="mt-3 sm:mt-4 md:mt-5 flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 md:gap-5">
        <!-- Icon and Title -->
        <div class="flex items-start gap-2 sm:gap-3 md:gap-4 flex-1">
          <div
            class="p-2 sm:p-2.5 rounded-lg bg-[#55A9C4]/10 border border-[#55A9C4]/20 hover:bg-[#55A9C4]/20 transition-colors duration-200"
          >
            <FileText class="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-[#55A9C4]" />
          </div>
          <div class="space-y-0.5 sm:space-y-1 min-w-0">
            <h1 class="text-base sm:text-lg md:text-xl font-medium sm:font-semibold text-gray-900 truncate">
              {{ concept.title }}
            </h1>
            <p class="text-2xs sm:text-xs md:text-sm text-gray-500">SPOT Practice Papers</p>
          </div>
        </div>

        <!-- Manage Button -->
        <div class="w-full sm:w-auto mt-2 sm:mt-0">
          <Link
            v-if="canManage"
            :href="`/manage/spot/${concept.slug}`"
            class="w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-md sm:rounded-lg bg-[#55A9C4] hover:bg-[#55A9C4]/90 text-white border border-[#55A9C4] text-2xs sm:text-xs md:text-sm font-medium hover:shadow-md transition-all duration-200 group"
          >
            <Settings class="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 transition-transform duration-500 group-hover:rotate-180" />
            <span>Edit</span>
          </Link>
        </div>
      </div>
    </div>

    <!-- Papers by Year -->
    <template v-if="hasPapers">
      <div v-for="(papers, year) in papersByYear" :key="year" class="space-y-3 sm:space-y-4 md:space-y-5">
        <div class="flex items-center gap-2 sm:gap-3 text-base sm:text-lg font-medium sm:font-semibold text-gray-900">
          <Calendar class="h-4 w-4 sm:h-5 sm:w-5 text-[#55A9C4]" />
          <h2>{{ year }}</h2>
        </div>

        <div class="grid gap-3 sm:gap-4 md:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            v-for="paper in papers"
            :key="paper.id"
            :href="`/spot/${concept.slug}/${paper.slug}`"
            class="group relative overflow-hidden rounded-lg sm:rounded-xl bg-white p-3 sm:p-4 md:p-5 border border-gray-100 hover:border-[#55A9C4]/20 hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 sm:hover:-translate-y-1"
          >
            <div
              class="absolute inset-0 bg-gradient-to-br from-[#55A9C4]/10 via-[#55A9C4]/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out"
            />

            <div class="relative space-y-2 sm:space-y-3">
              <h3
                class="text-sm sm:text-base md:text-lg font-medium sm:font-semibold text-gray-900 group-hover:text-[#55A9C4] transition-colors duration-300"
              >
                {{ paper.title }}
              </h3>

              <div class="flex items-center gap-2 sm:gap-3 text-2xs sm:text-xs md:text-sm">
                <span class="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md bg-[#55A9C4]/10 text-[#55A9C4] font-medium">
                  SPOT
                </span>
                <span class="text-gray-500">
                  {{
                    paper.questions
                      ? paper.questions.reduce((sum: number, q: any) => sum + (q.spotStations?.length || 0), 0)
                      : 0
                  }}
                  stations
                </span>
              </div>
              <div
                class="flex items-center text-2xs sm:text-xs md:text-sm text-[#55A9C4] font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out"
              >
                <span>Practice SPOT</span>
                <svg
                  class="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 ml-1 sm:ml-2 transform group-hover:translate-x-1 transition-transform duration-300 ease-in-out"
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

    <!-- Empty State -->
    <div
      v-else
      class="relative p-3 sm:p-4 md:p-6 bg-white rounded-lg sm:rounded-xl md:rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div class="flex items-start gap-2 sm:gap-3 md:gap-4">
        <div
          class="p-2 sm:p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors duration-200"
        >
          <AlertCircle class="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-amber-500" />
        </div>
        <div class="space-y-1 sm:space-y-2">
          <h2 class="text-sm sm:text-base md:text-lg font-medium sm:font-semibold text-gray-900">No SPOT Papers Available Yet</h2>
          <p class="text-2xs sm:text-xs md:text-sm text-gray-500 max-w-2xl">
            We're currently adding SPOT papers for {{ concept.title }}. Please check back later.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
