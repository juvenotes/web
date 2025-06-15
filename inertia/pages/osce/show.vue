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

onMounted(async () => {
  if (!studySession.value) {
    try {
      const response = await axios.post('/api/study-sessions', {
        resourceType: 'osce',
        resourceId: props.concept.id,
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
  
  <div class="osce-papers-container max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
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
            <p class="text-sm sm:text-base text-gray-600">OSCE Practice Papers</p>
          </div>
        </div>

        <!-- Manage Button -->
        <div class="w-full sm:w-auto flex-shrink-0">
          <Link
            v-if="canManage"
            :href="`/manage/osce/${concept.slug}`"
            class="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#55A9C4] hover:bg-[#4795af] transition-colors text-white text-sm font-medium hover:shadow-xs transition-all duration-200"
          >
            <Settings class="h-4 w-4" />
            <span>Manage OSCEs</span>
          </Link>
        </div>
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
            :href="`/osce/${concept.slug}/${paper.slug}`"
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
                  OSCE
                </span>
                <span class="text-sm text-gray-500">
                  {{ paper.questions?.reduce((sum, q) => sum + (q.stations?.length || 0), 0) }} stations
                </span>
              </div>

              <div
                class="flex items-center text-sm text-[#55A9C4] font-medium opacity-0 group-hover:opacity-100 transition-all duration-300"
              >
                <span>Practice OSCE</span>
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
          <h2 class="text-lg sm:text-xl font-semibold text-gray-900">No OSCE Papers Available Yet</h2>
          <p class="text-sm sm:text-base text-gray-600">
            We're currently adding OSCE papers for {{ concept.title }}. Please check back later.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.osce-papers-container {
  font-family: 'Inter', sans-serif;
}

.osce-papers-container h1,
.osce-papers-container h2,
.osce-papers-container h3 {
  font-weight: 600;
  line-height: 1.25;
}

.osce-papers-container p {
  font-weight: 400;
  color: #4b5563;
  line-height: 1.5;
}

.osce-papers-container a,
.osce-papers-container button,
.osce-papers-container .transition-all {
  transition: all 0.2s ease;
}

@media (hover: hover) {
  .osce-papers-container .group:hover .group-hover\:text-\[\#55A9C4\] {
    color: #55a9c4;
  }
  .osce-papers-container .group:hover .group-hover\:opacity-100 {
    opacity: 1;
  }
  .osce-papers-container .group:hover .group-hover\:translate-x-1 {
    transform: translateX(0.25rem);
  }
}
</style>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
</style>