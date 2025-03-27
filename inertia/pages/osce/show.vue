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
  inheritAttrs: false // Prevent style inheritance
})

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
        resourceType: 'osce',
        resourceId: props.concept.id
      })
      studySession.value = response.data
    } catch (error) {
      console.error('Failed to create study session:', error)
    }
  }
})

const oscePapers = computed(() =>
  props.papers.filter((paper) => paper.paperType === PaperType.OSCE)
)
const hasPapers = computed(() => oscePapers.value.length > 0)

const papersByYear = computed(() => {
  return oscePapers.value.reduce(
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
  { label: 'OSCEs', href: '/osce' },
  { label: props.concept.title },
])
</script>

<template>
  <AppHead :title="`${concept.title} OSCEs`" :description="`OSCE papers for ${concept.title}`" />
    <!-- <StudySessionTracker v-if="studySession" :sessionId="studySession.id" /> -->

  <!-- Unique wrapper class for this page only -->
  <div class="osce-page-container">
    <div class="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 space-y-6 md:space-y-8">
      <!-- Header -->
      <div class="relative p-4 sm:p-6 md:p-8 bg-white rounded-xl md:rounded-2xl border border-gray-100 shadow-md hover:shadow-lg md:hover:shadow-xl transition-shadow duration-300">
        <div class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#55A9C4] via-[#55A9C4]/50 to-transparent"/>
        
        <BreadcrumbTrail :items="breadcrumbItems" class="text-xs sm:text-sm"/>
        
        <div class="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 md:gap-6">
          <div class="flex items-start gap-3 sm:gap-4 flex-1">
            <div class="p-2 sm:p-3 md:p-4 rounded-lg md:rounded-xl bg-[#55A9C4]/10 border border-[#55A9C4]/20 hover:bg-[#55A9C4]/20 transition-colors duration-200">
              <FileText class="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-[#55A9C4]"/>
            </div>
            <div class="min-w-0 space-y-0.5 sm:space-y-1">
              <h1 class="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 truncate">
                {{ concept.title }}
              </h1>
              <p class="text-xs sm:text-sm text-gray-500">OSCE Practice Papers</p>
            </div>
          </div>
          
          <div class="w-full sm:w-auto mt-2 sm:mt-0">
            <Link
              v-if="canManage"
              :href="`/manage/osce/${concept.slug}`"
              class="w-full sm:w-auto flex items-center justify-center gap-1 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-md md:rounded-lg bg-[#55A9C4] hover:bg-[#55A9C4]/90 transition-colors text-white border border-[#55A9C4] text-xs sm:text-sm font-medium hover:shadow-sm md:hover:shadow-md transition-all duration-200 group"
            >
              <Settings class="h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-500 group-hover:rotate-180"/>
              <span>Edit</span>
            </Link>
          </div>
        </div>
      </div>

      <!-- Papers by Year -->
      <template v-if="hasPapers">
        <div v-for="(yearPapers, year) in papersByYear" :key="year" class="space-y-3 sm:space-y-4 md:space-y-6">
          <div class="flex items-center gap-2 text-base sm:text-lg font-semibold text-gray-900">
            <Calendar class="h-4 w-4 sm:h-5 sm:w-5 text-[#55A9C4]"/>
            <h2>{{ year }}</h2>
          </div>

          <div class="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              v-for="paper in yearPapers"
              :key="paper.id"
              :href="`/osce/${concept.slug}/${paper.slug}`"
              class="group relative overflow-hidden rounded-lg md:rounded-2xl bg-white p-3 sm:p-4 md:p-6 border border-gray-100 hover:border-[#55A9C4]/20 shadow-sm hover:shadow-lg md:hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 md:hover:-translate-y-2"
            >
              <div class="absolute inset-0 bg-gradient-to-br from-[#55A9C4]/10 via-[#55A9C4]/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out"/>
              
              <div class="relative space-y-2 sm:space-y-3 md:space-y-4">
                <h3 class="text-sm sm:text-base md:text-lg font-semibold text-gray-900 group-hover:text-[#55A9C4] transition-colors duration-300 ease-in-out">
                  {{ paper.title }}
                </h3>

                <div class="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                  <span class="px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md bg-[#55A9C4]/10 text-[#55A9C4] font-medium">
                    OSCE
                  </span>
                  <span class="text-gray-500">
                    A few stations
                  </span>
                </div>

                <div class="flex items-center text-xs sm:text-sm text-[#55A9C4] font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out">
                  <span>Practice OSCE</span>
                  <svg
                    class="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2 transform group-hover:translate-x-1 sm:group-hover:translate-x-2 transition-transform duration-300 ease-in-out"
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
      <div v-else class="relative p-4 sm:p-6 md:p-8 bg-white rounded-xl md:rounded-2xl border border-gray-100 shadow-md">
        <div class="flex items-start gap-3 sm:gap-4">
          <div class="p-2 sm:p-3 rounded-lg md:rounded-xl bg-amber-500/10 border border-amber-500/20">
            <AlertCircle class="h-4 w-4 sm:h-5 sm:w-5 text-amber-500"/>
          </div>
          <div class="space-y-0.5 sm:space-y-1">
            <h2 class="text-base sm:text-lg font-semibold text-gray-900">No OSCE Papers Available Yet</h2>
            <p class="text-xs sm:text-sm text-gray-500 max-w-2xl">
              We're currently adding OSCE papers for {{ concept.title }}. Please check back later.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Scoped styles ensure they only apply to this component */
.osce-page-container {
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Responsive typography */
.osce-page-container h1,
.osce-page-container h2,
.osce-page-container h3 {
  font-weight: 600;
  line-height: 1.25;
}

.osce-page-container p {
  font-weight: 400;
  color: #4b5563;
  line-height: 1.5;
}

/* Transitions */
.osce-page-container a,
.osce-page-container button,
.osce-page-container .transition-all {
  transition: all 0.2s ease;
}

/* Touch targets */
.osce-page-container a,
.osce-page-container button {
  min-height: 44px;
  min-width: 44px;
}

/* Hover effects (only for hover-capable devices) */
@media (hover: hover) {
  .osce-page-container .group:hover .group-hover\:text-\[\#55A9C4\] {
    color: #55A9C4;
  }
  .osce-page-container .group:hover .group-hover\:opacity-100 {
    opacity: 1;
  }
  .osce-page-container .group:hover .group-hover\:translate-x-1 {
    transform: translateX(0.25rem);
  }
}
</style>

<style>
/* Global font import (outside scoped) */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
</style>