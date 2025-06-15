<script setup lang="ts">
import type ConceptDto from '#dtos/concept'
import type PastPaperDto from '#dtos/past_paper'
import type QuestionDto from '#dtos/question'
import type UserStudySessionDto from '#dtos/user_study_session'
import DashLayout from '~/layouts/DashLayout.vue'
import { FileText, Settings, ArrowRight, CheckCircle } from 'lucide-vue-next'
import { computed, ref, reactive, onMounted } from 'vue'
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
        resourceId: props.paper.id,
      })
      studySession.value = response.data
    } catch (error) {
      console.error('Failed to create study session:', error)
    }
  }
})

const paperProgress = reactive({
  completionPercentage: props.completionPercentage,
  progress: props.progress,
  attemptCount: props.attemptCount,
})

const showAnswers = ref<Record<number, boolean>>({})

// Removed unused computed property lastEditDate

const breadcrumbItems = computed(() => [
  { label: 'SPOT Papers', href: '/spot' },
  { label: props.concept.title, href: `/spot/${props.concept.slug}` },
  { label: props.paper.title },
])

const handleSpotStationView = (questionId: number, stationId: number) => {
  showAnswers.value[stationId] = !showAnswers.value[stationId]

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

const continueFromLastQuestion = () => {
  if (!paperProgress.progress?.lastQuestionId) return

  const lastQuestionId = paperProgress.progress.lastQuestionId
  const questionIndex = props.questions.findIndex((q) => q.id === lastQuestionId)
  if (questionIndex === -1) return

  setTimeout(() => {
    const element = document.getElementById(`question-${lastQuestionId}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      element.classList.add('highlight-question')
      setTimeout(() => element.classList.remove('highlight-question'), 2000)
    }
  }, 500)
}
</script>

<template>
  <AppHead :title="paper.title" :description="`Practice ${paper.title}`" />
  <StudySessionTracker v-if="studySession" :sessionId="studySession.id" />

  <div class="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
    <!-- Header Section -->
    <div class="relative p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
      <!-- Theme-colored top border -->
      <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#55A9C4] via-[#55A9C4]/50 to-transparent rounded-t-xl" />

      <BreadcrumbTrail :items="breadcrumbItems" class="mb-4" />

      <div class="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
        <!-- Icon and Title -->
        <div class="flex items-start gap-4 flex-1">
          <div class="p-3 rounded-lg bg-[#55A9C4]/10 border border-[#55A9C4]/20 hover:bg-[#55A9C4]/20 transition-colors duration-200">
            <FileText class="h-5 w-5 text-[#55A9C4]" />
          </div>
          <div class="space-y-2 min-w-0">
            <h1 class="text-xl sm:text-2xl font-semibold text-gray-900 truncate">
              {{ paper.title }}
            </h1>
            <p class="text-sm text-gray-600">
              SPOT stations for {{ paper.title }} in {{ concept.title }}
            </p>
            <div class="flex flex-wrap items-center gap-2">
              <span class="px-2 py-1 rounded-full bg-[#55A9C4]/15 text-[#55A9C4] text-xs font-medium">
                SPOT
              </span>
              <span class="text-xs text-gray-500">{{ paper.year }}</span>
              <span class="flex items-center gap-1 text-xs text-gray-500">
                <CheckCircle class="h-3 w-3 text-green-600" />
                {{ paperProgress.completionPercentage }}% complete
              </span>
            </div>
          </div>
        </div>

        <!-- Manage Button -->
        <div class="w-full sm:w-auto">
          <Link
            v-if="canManage"
            :href="`/manage/spot/${concept.slug}/${paper.slug}/edit`"
            class="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#55A9C4] hover:bg-[#55A9C4]/90 text-white text-sm font-medium hover:shadow-md transition-all duration-200 group"
          >
            <Settings class="h-4 w-4 transition-transform duration-500 group-hover:rotate-180" />
            <span>Edit Paper</span>
          </Link>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="mt-6">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm font-medium">Your progress</span>
          <span class="text-sm font-semibold">
            {{ paperProgress.completionPercentage }}%
          </span>
        </div>
        <div class="h-2.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            class="h-full bg-[#55A9C4] rounded-full transition-all duration-500"
            :style="{ width: `${paperProgress.completionPercentage}%` }"
          ></div>
        </div>
        <div class="mt-2 flex justify-between items-center text-sm text-gray-500">
          <span>
            {{ paperProgress.attemptCount }} {{ paperProgress.attemptCount === 1 ? 'attempt' : 'attempts' }}
          </span>
          <span>
            {{ Math.round((paperProgress.completionPercentage * totalStations) / 100) }} of
            {{ totalStations }} stations
          </span>
        </div>
      </div>

      <!-- Continue Button -->
      <button
        v-if="paperProgress.progress?.lastQuestionId && paperProgress.completionPercentage < 100"
        @click="continueFromLastQuestion"
        class="mt-6 w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#55A9C4] to-[#55A9C4]/90 hover:from-[#55A9C4] hover:to-[#55A9C4] text-white text-sm font-medium hover:shadow-md transition-all duration-200"
      >
        <span>Continue from last position</span>
        <ArrowRight class="h-4 w-4" />
      </button>
    </div>

    <!-- Questions List -->
    <div class="space-y-6">
      <div
        v-for="question in questions"
        :key="question.id"
        :id="`question-${question.id}`"
        class="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
      >
        <!-- Question Header -->
        <div class="bg-[#F5FBFD] border-b border-gray-100 p-6">
          <p class="font-medium text-gray-900">{{ question.questionText }}</p>
        </div>

        <!-- Stations List -->
        <div class="divide-y divide-gray-100">
          <div
            v-for="station in question.spotStations"
            :key="station.id"
            class="p-6 transition-all duration-300 hover:bg-[#F5FBFD]/50"
          >
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <h3 class="text-lg font-medium text-gray-900">
                Station {{ station.id }}
              </h3>
              <button
                @click="handleSpotStationView(question.id, station.id)"
                class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#55A9C4]/10 text-[#55A9C4] hover:bg-[#55A9C4]/20 transition-colors duration-200"
              >
                <span>{{ showAnswers[station.id] ? 'Hide Answer' : 'Show Answer' }}</span>
                <svg
                  class="h-4 w-4 transform transition-transform duration-300"
                  :class="{ 'rotate-180': showAnswers[station.id] }"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </div>

            <!-- Station Content -->
            <div class="prose prose-sm max-w-none text-gray-700 mb-4">
              <div v-html="station.partText"></div>
            </div>

            <!-- Answer Section -->
            <div
              v-if="showAnswers[station.id]"
              class="mt-6 pt-6 border-t border-dashed border-gray-200 transition-all duration-500"
            >
              <div class="flex items-center gap-3 mb-4">
                <div class="flex items-center justify-center w-8 h-8 rounded-full bg-[#55A9C4]/10 text-[#55A9C4]">
                  <CheckCircle class="h-4 w-4" />
                </div>
                <h4 class="text-lg font-semibold text-[#55A9C4]">Expected Answer</h4>
              </div>
              <div class="prose prose-sm max-w-none text-gray-700">
                <div v-html="station.expectedAnswer"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.highlight-question {
  animation: highlight 2s ease-out;
}

@keyframes highlight {
  0% {
    box-shadow: 0 0 0 4px rgba(85, 169, 196, 0.3);
  }
  100% {
    box-shadow: 0 0 0 4px rgba(85, 169, 196, 0);
  }
}

.prose :deep(table) {
  width: 100%;
  font-size: 0.875rem;
  border-collapse: collapse;
  margin-bottom: 1rem;
  display: block;
  overflow-x: auto;
}

.prose :deep(th) {
  background-color: rgba(85, 169, 196, 0.1);
  color: #444;
  font-weight: 600;
  padding: 0.5rem;
  text-align: left;
  border: 1px solid rgba(85, 169, 196, 0.2);
}

.prose :deep(td) {
  padding: 0.5rem;
  border: 1px solid rgba(85, 169, 196, 0.1);
}

@media (max-width: 640px) {
  .prose :deep(table) {
    font-size: 0.75rem;
  }
  
  .prose :deep(th),
  .prose :deep(td) {
    padding: 0.25rem;
  }
}
</style>