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
  <!-- <StudySessionTracker v-if="studySession" :sessionId="studySession.id" /> -->

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
    <!-- Header -->
    <div
      class="relative p-6 sm:p-8 bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300"
    >
      <!-- Gradient Top Border -->
      <div
        class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#55A9C4] via-[#55A9C4]/50 to-transparent"
      />

      <BreadcrumbTrail :items="breadcrumbItems" />

      <div class="mt-6 flex flex-col sm:flex-row sm:items-start gap-6">
        <!-- Icon and Title -->
        <div class="flex items-start gap-4 flex-1">
          <div
            class="p-3 rounded-xl bg-[#55A9C4]/10 border border-[#55A9C4]/20 hover:bg-[#55A9C4]/20 transition-colors duration-200"
          >
            <FileText class="h-5 w-5 text-[#55A9C4]" />
          </div>
          <div class="space-y-1">
            <h1 class="text-xl sm:text-2xl font-semibold text-gray-900">{{ concept.title }}</h1>
            <p class="text-sm text-gray-500">Past Examination Papers</p>
          </div>
        </div>

        <!-- Manage Button -->
        <div class="w-full sm:w-auto mt-4 sm:mt-0">
          <Link
            v-if="canManage"
            :href="`/manage/papers/${concept.slug}`"
            class="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#55A9C4] hover:bg-[#55A9C4]/90 transition-colors text-white border border-[#55A9C4] text-sm font-medium hover:shadow-md transition-all duration-200 group"
          >
            <Settings class="h-4 w-4 transition-transform duration-500 group-hover:rotate-180" />
            <span>Edit</span>
          </Link>
        </div>
      </div>
    </div>

    <div class="flex flex-col sm:flex-row items-start gap-2 px-0 sm:px-6 lg:px-8 mb-2">
      <ToggleStudyLevel v-model="selectedStudyLevel" :papers="papers" />
      <div v-if="examTypes.length > 1" class="w-full sm:w-auto">
        <select
          v-model="selectedExamType"
          class="max-w-[10rem] w-auto px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm"
        >
          <option :value="null">Exam</option>
          <option v-for="type in examTypes" :key="type" :value="type">
            {{ type.toUpperCase() }}
          </option>
        </select>
      </div>
    </div>

    <!-- Papers by Year -->
    <template v-if="hasPapers">
      <div v-for="(yearPapers, year) in papersByYear" :key="year" class="space-y-6">
        <div class="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <Calendar class="h-5 w-5 text-[#55A9C4]" />
          <h2>{{ year }}</h2>
        </div>

        <div class="grid gap-6 sm:gap-8 lg:gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <Link
            v-for="paper in yearPapers"
            :key="paper.id"
            :href="`/papers/${concept.slug}/${paper.slug}`"
            class="group relative overflow-hidden rounded-2xl bg-white p-6 border border-gray-100 hover:border-[#55A9C4]/20 hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-2"
          >
            <!-- Gradient Overlay on Hover -->
            <div
              class="absolute inset-0 bg-gradient-to-br from-[#55A9C4]/10 via-[#55A9C4]/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out"
            />
            <div
              class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#55A9C4] via-[#55A9C4]/50 to-transparent"
            />

            <div class="relative space-y-4">
              <h3
                class="text-lg font-semibold text-gray-900 group-hover:text-[#55A9C4] transition-colors duration-300 ease-in-out"
              >
                {{ paper.title }}
              </h3>

              <div class="flex items-center gap-3 text-sm">
                <span class="px-2 py-1 rounded-md bg-[#55A9C4]/10 text-[#55A9C4] font-medium">
                  {{ paper.examType.toUpperCase() }}
                </span>
                <span
                  v-if="paper.paperType"
                  class="px-2 py-1 rounded-md bg-[#55A9C4]/10 text-[#55A9C4] font-medium"
                >
                  {{ paper.paperType.toUpperCase() }}
                </span>
                <span class="text-gray-500"> {{ paper.questions?.length ?? 0 }} questions </span>
              </div>

              <div
                class="flex items-center text-sm text-[#55A9C4] font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out"
              >
                <span>Attempt Paper</span>
                <svg
                  class="w-4 h-4 ml-2 transform group-hover:translate-x-2 transition-transform duration-300 ease-in-out"
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
    <div v-else class="relative p-8 bg-white rounded-2xl border border-gray-100 shadow-lg">
      <div class="flex items-start gap-4">
        <div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <AlertCircle class="h-5 w-5 text-amber-500" />
        </div>
        <div class="space-y-1">
          <h2 class="text-lg font-semibold text-gray-900">No Papers Available Yet</h2>
          <p class="text-sm text-gray-500 max-w-2xl">
            We're currently adding past papers for {{ concept.title }}. Please check back later.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* Import Inter font */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

/* Apply Inter font to the entire page */
body {
  font-family: 'Inter', sans-serif;
}

/* Enhance Typography */
h1,
h2,
h3 {
  font-weight: 600;
}

p {
  font-weight: 400;
  color: #4b5563; /* Gray-600 */
}

/* Smooth Transitions */
a,
button,
.transition-all {
  transition: all 0.3s ease;
}

/* Hover Effects */
.group:hover .group-hover\:text-\[\#55A9C4\] {
  color: #55a9c4;
}

.group:hover .group-hover\:opacity-100 {
  opacity: 1;
}

.group:hover .group-hover\:translate-x-1 {
  transform: translateX(0.25rem);
}
</style>
