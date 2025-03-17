<script setup lang="ts">
import type ConceptDto from '#dtos/concept'
import type PastPaperDto from '#dtos/past_paper'
import type QuestionDto from '#dtos/question'
import DashLayout from '~/layouts/DashLayout.vue'
import { FileText, Clock, Settings } from 'lucide-vue-next'
import { computed, ref, reactive } from 'vue'
import axios from 'axios'

defineOptions({ layout: DashLayout })

interface Props {
  paper: PastPaperDto
  concept: ConceptDto
  questions: QuestionDto[]
  canManage: boolean
  progress: any | null
  attemptCount: number
  completionPercentage: number
}

const props = defineProps<Props>()

const paperProgress = reactive({
  completionPercentage: props.completionPercentage,
  progress: props.progress,
  attemptCount: props.attemptCount,
})

const showAnswers = ref<Record<number, boolean>>({})

const lastEditDate = computed(() => {
  return new Date(
    props.paper.metadata?.lastEditedBy?.timestamp ?? props.paper.createdAt
  ).toLocaleDateString()
})

const breadcrumbItems = computed(() => [
  { label: 'SPOT Papers', href: '/spot' },
  { label: props.concept.title, href: `/spot/${props.concept.slug}` },
  { label: props.paper.title },
])

// Record SPOT station viewing as progress
const handleSpotStationView = (questionId: number, stationId: number) => {
  showAnswers.value[stationId] = !showAnswers.value[stationId]

  // Only send the API request when revealing the answer (not when hiding it)
  if (showAnswers.value[stationId]) {
    axios
      .post('/api/papers/record-spot-response', {
        paperId: props.paper.id,
        questionId,
        stationId,
      })
      .then(() => {
        updateProgress()
      })
      .catch((error) => {
        console.error('Failed to record SPOT response', error)
      })
  }
}

const updateProgress = async () => {
  try {
    const response = await axios.get(`/api/papers/${props.paper.id}/my-responses`)
    if (response.data) {
      paperProgress.completionPercentage = response.data.completionPercentage || 0
      paperProgress.progress = response.data.progress || null
      paperProgress.attemptCount = response.data.attemptCount || 0
    }
  } catch (error) {
    console.error('Failed to update progress:', error)
  }
}

const totalStations = computed(() => {
  return props.questions.reduce((total, question) => {
    return total + (question.spotStations?.length || 0)
  }, 0)
})
</script>

<template>
  <AppHead :title="paper.title" :description="`Practice ${paper.title}`" />

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
    <!-- Header Section -->
    <div class="relative p-6 sm:p-8 bg-white/50 rounded-2xl border shadow-sm">
      <div
        class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-primary/50 to-transparent"
      />

      <!-- Navigation -->
      <BreadcrumbTrail :items="breadcrumbItems" />

      <div class="mt-4 flex flex-col sm:flex-row gap-4 sm:items-start justify-between">
        <div class="flex items-start gap-4">
          <div class="p-3 rounded-xl bg-primary/5 border border-primary/10 shrink-0">
            <FileText class="h-6 w-6 text-primary" />
          </div>
          <div class="space-y-1">
            <h1 class="text-2xl font-bold text-foreground">{{ paper.title }}</h1>
            <div class="flex flex-wrap items-center gap-2 sm:gap-3 text-sm text-muted-foreground">
              <span class="truncate max-w-[150px] sm:max-w-none">{{ concept.title }}</span>
              <span class="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                SPOT
              </span>
              <span>{{ paper.year }}</span>
            </div>
            <div class="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock class="h-3 w-3" />
              <span>Last edited {{ lastEditDate }}</span>
            </div>
          </div>
        </div>

        <!-- Manage button -->
        <Link
          v-if="canManage"
          :href="`/manage/spot/${concept.slug}/${paper.slug}`"
          class="flex items-center justify-center gap-2 px-4 py-2 rounded-lg hover:bg-primary/5 transition-colors text-primary border border-primary/10 w-full sm:w-auto"
        >
          <Settings class="h-4 w-4" />
          <span class="text-sm font-medium">Edit</span>
        </Link>
      </div>
    </div>

    <DisclaimerBanner />

    <!-- Questions List -->
    <div class="space-y-4">
      <template v-if="questions.length">
        <div
          v-for="(question, questionIndex) in questions"
          :key="question.id"
          class="p-6 bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow"
        >
          <div class="space-y-4">
            <!-- Question Header -->
            <div class="flex gap-3">
              <span
                class="shrink-0 px-2 py-1 bg-primary/10 text-primary rounded text-sm font-medium"
              >
                Q{{ questionIndex + 1 }}
              </span>
              <p class="text-base text-foreground">{{ question.questionText }}</p>
            </div>

            <!-- Question Image if present -->
            <div v-if="question.questionImagePath" class="flex justify-center">
              <img
                :src="question.questionImagePath"
                :alt="`Question ${questionIndex + 1} image`"
                class="max-w-full h-auto rounded-lg border shadow-sm max-h-[400px] object-contain"
              />
            </div>

            <!-- SPOT Stations -->
            <div class="pl-10 space-y-4">
              <div
                v-for="(station, stationIndex) in question.spotStations"
                :key="station.id"
                class="relative pl-4 border-l-2 border-primary/20 py-3"
              >
                <!-- Station Text -->
                <div class="flex justify-between items-start">
                  <div class="space-y-2">
                    <div class="flex items-center gap-2">
                      <span class="font-medium text-base">Station {{ stationIndex + 1 }}</span>
                      <span
                        class="text-sm px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium"
                      >
                        {{ station.marks }} marks
                      </span>
                    </div>
                    <p class="text-base">{{ station.partText }}</p>
                  </div>
                </div>

                <!-- Expected Answer -->
                <button
                  @click="handleSpotStationView(question.id, station.id)"
                  class="mt-3 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium transition hover:bg-primary/80"
                >
                  {{ showAnswers[station.id] ? 'Hide Answer' : 'Show Answer' }}
                </button>
                <div
                  v-if="showAnswers[station.id]"
                  class="mt-3 bg-gray-50 border border-gray-200 shadow-sm rounded-xl p-4"
                >
                  <p class="text-sm font-semibold text-muted-foreground">Expected Answer:</p>
                  <div class="mt-2 text-md text-gray-800 leading-relaxed whitespace-pre-wrap">
                    <ViewExplanation :content="station.expectedAnswer" />
                  </div>
                </div>

                <!-- Station Image if present -->
                <div v-if="station.imagePath" class="mt-3 flex justify-center">
                  <img
                    :src="station.imagePath"
                    :alt="`Station ${stationIndex + 1} image`"
                    class="max-w-full h-auto rounded-lg border shadow-sm max-h-[300px] object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      <div v-else class="text-center py-12 bg-white rounded-xl border">
        <p class="text-muted-foreground">This SPOT paper has no questions yet.</p>
      </div>
    </div>
    <div
      v-if="paperProgress.completionPercentage > 0"
      class="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg border border-primary/20 flex items-center gap-3 z-50 transition-all duration-300 hover:shadow-xl group"
      :class="{
        'p-2 sm:p-4': true,
        'sm:hover:w-auto hover:w-10': true,
      }"
    >
      <div class="w-10 h-10 relative">
        <svg class="w-10 h-10 -rotate-90 transform">
          <circle
            class="text-gray-200"
            stroke-width="3"
            stroke="currentColor"
            fill="transparent"
            r="16"
            cx="20"
            cy="20"
          />
          <circle
            class="text-primary"
            stroke-width="3"
            :stroke-dasharray="100.5"
            :stroke-dashoffset="100.5 - paperProgress.completionPercentage"
            stroke-linecap="round"
            stroke="currentColor"
            fill="transparent"
            r="16"
            cx="20"
            cy="20"
          />
        </svg>
        <span
          class="absolute inset-0 flex items-center justify-center text-xs font-medium"
          style="font-size: 0.7rem"
        >
          {{ Math.round(paperProgress.completionPercentage) }}%
        </span>
      </div>

      <div class="hidden sm:flex flex-col">
        <span class="text-sm font-medium">Your progress</span>
        <span class="text-xs text-muted-foreground">
          {{ Math.round((paperProgress.completionPercentage * totalStations) / 100) }} of
          {{ totalStations }}
        </span>
      </div>
    </div>
  </div>
</template>