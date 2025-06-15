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

  <div class="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-5 md:py-6 space-y-4 sm:space-y-5 md:space-y-6 font-sans">
    <!-- Header Section -->
    <div class="relative p-3 sm:p-4 md:p-5 bg-white rounded-lg sm:rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
      <div
        class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#55A9C4] via-[#55A9C4]/50 to-transparent rounded-t-lg"
      />

      <!-- Scrollable breadcrumbs with better mobile handling -->
      <div class="overflow-x-auto hide-scrollbar pb-2">
        <BreadcrumbTrail
          :items="breadcrumbItems"
          class="w-max min-w-full"
        />
      </div>

      <div class="mt-2.5 sm:mt-3 md:mt-4 flex flex-col sm:flex-row sm:items-start gap-2.5 sm:gap-3 md:gap-4">
        <div class="flex items-start gap-2 sm:gap-2.5 flex-1">
          <div class="p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-[#55A9C4]/10 border border-[#55A9C4]/20 hover:bg-[#55A9C4]/20 transition-colors duration-200">
            <FileText class="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-[#55A9C4]" />
          </div>
          <div class="space-y-0.5 sm:space-y-1">
            <h1 class="text-sm sm:text-base md:text-lg font-medium sm:font-semibold text-gray-900">{{ paper.title }}</h1>
            <p class="text-2xs sm:text-xs text-gray-500 max-w-full">
              SPOT stations for {{ paper.title }} in {{ concept.title }}
            </p>
            <div class="flex flex-wrap items-center gap-1 sm:gap-1.5 md:gap-2 pt-0.5 sm:pt-1">
              <span
                class="px-1.5 sm:px-2 py-0.5 text-2xs sm:text-xs font-medium bg-[#55A9C4]/15 text-[#55A9C4] rounded-full"
              >
                SPOT
              </span>
              <span class="text-2xs sm:text-xs text-gray-500">{{ paper.year }}</span>
              <span class="flex items-center gap-0.5 sm:gap-1 text-2xs sm:text-xs text-gray-500">
                <CheckCircle class="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-600" />
                {{ paperProgress.completionPercentage }}% complete
              </span>
            </div>
          </div>
        </div>

        <!-- Manage Paper Button - Show only for users with manage permission -->
        <div class="mt-2 sm:mt-0">
          <Link
            v-if="canManage"
            :href="`/manage/spot/${concept.slug}/${paper.slug}/edit`"
            class="w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-md sm:rounded-lg bg-[#55A9C4] hover:bg-[#55A9C4]/90 text-white text-2xs sm:text-xs md:text-sm font-medium hover:shadow-sm transition-all duration-200 group"
          >
            <Settings class="h-3 w-3 sm:h-3.5 sm:w-3.5 transition-transform duration-500 group-hover:rotate-180" />
            <span>Edit Paper</span>
          </Link>
        </div>
      </div>

      <!-- Progress Indicator for SPOT Paper -->
      <div class="mt-3 sm:mt-4">
        <div class="relative w-full h-1.5 sm:h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            class="absolute left-0 top-0 bottom-0 bg-[#55A9C4]"
            :style="{ width: `${paperProgress.completionPercentage}%` }"
          ></div>
        </div>
        <div class="mt-1 sm:mt-1.5 flex justify-between items-center text-2xs sm:text-xs text-gray-500">
          <span>
            {{ paperProgress.attemptCount }} {{ paperProgress.attemptCount === 1 ? 'attempt' : 'attempts' }}
          </span>
          <span>{{ totalStations }} stations</span>
        </div>
      </div>

      <!-- Continue Button -->
      <div v-if="paperProgress.progress?.lastQuestionId && paperProgress.completionPercentage < 100" class="mt-3 sm:mt-4">
        <button
          @click="continueFromLastQuestion"
          class="w-full sm:w-auto flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-md sm:rounded-lg bg-gradient-to-r from-[#55A9C4] to-[#55A9C4]/90 hover:from-[#55A9C4] hover:to-[#55A9C4] text-white text-2xs sm:text-xs md:text-sm font-medium hover:shadow-md transition-all duration-200"
        >
          <span>Continue from last position</span>
          <ArrowRight class="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        </button>
      </div>
    </div>

    <!-- Questions Grid -->
    <div class="space-y-4 sm:space-y-5 md:space-y-6 pb-4">
      <!-- Display each question -->
      <div
        v-for="question in questions"
        :key="question.id"
        :id="`question-${question.id}`"
        class="transition-colors duration-500 rounded-lg sm:rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md border border-gray-100"
      >
        <div class="bg-[#F5FBFD] border-b border-gray-100 p-2.5 sm:p-3 md:p-4">
          <p class="font-medium text-sm sm:text-base text-gray-900">{{ question.questionText }}</p>
        </div>

        <!-- Display each SPOT station for this question -->
        <div class="divide-y divide-gray-100">
          <div
            v-for="station in question.spotStations"
            :key="station.id"
            class="p-3 sm:p-4 md:p-5 space-y-2 sm:space-y-3 md:space-y-4 transition-all duration-300 hover:bg-[#F5FBFD]/50"
          >
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 class="text-xs sm:text-sm md:text-base font-medium text-gray-900">
                Station {{ station.id }}
              </h3>
              <button
                @click="handleSpotStationView(question.id, station.id)"
                class="self-start text-2xs sm:text-xs whitespace-nowrap flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full bg-[#55A9C4]/10 text-[#55A9C4] hover:bg-[#55A9C4]/20 transition-colors duration-200"
              >
                {{ showAnswers[station.id] ? 'Hide Answer' : 'Show Answer' }}
                <svg
                  class="h-2.5 w-2.5 sm:h-3 sm:w-3 transform transition-transform duration-300"
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

            <!-- Station Instructions -->
            <div class="text-2xs sm:text-xs md:text-sm text-gray-700 prose prose-sm max-w-none">
              <div v-html="station.partText"></div>
            </div>

            <!-- Answer Section -->
            <div
              v-if="showAnswers[station.id]"
              class="mt-3 pt-3 border-t border-dashed border-gray-200 transition-all duration-500 space-y-2 sm:space-y-3"
            >
              <h4 class="text-2xs sm:text-xs md:text-sm font-semibold text-[#55A9C4]">Answer:</h4>
              <div class="text-2xs sm:text-xs md:text-sm text-gray-700 prose prose-sm max-w-none">
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
  background-color: rgba(85, 169, 196, 0.1);
  transition: background-color 1000ms;
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
