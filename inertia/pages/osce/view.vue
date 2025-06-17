<script setup lang="ts">
import type ConceptDto from '#dtos/concept'
import type PastPaperDto from '#dtos/past_paper'
import type QuestionDto from '#dtos/question'
import type UserPaperProgressDto from '#dtos/user_paper_progress'
import DashLayout from '~/layouts/DashLayout.vue'
import {
  FileText,
  CheckCircle,
  Settings,
  MessageSquare,
  ChevronDown,
  ArrowRight,
} from 'lucide-vue-next'
import { computed, ref, reactive, onMounted } from 'vue'
import axios from 'axios'
import UserStudySessionDto from '#dtos/user_study_session'

defineOptions({ layout: DashLayout })

interface Props {
  paper: PastPaperDto
  concept: ConceptDto
  questions: QuestionDto[]
  canManage: boolean
  progress: UserPaperProgressDto | null
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
        resourceType: 'osce',
        resourceId: props.paper.id,
      })
      studySession.value = response.data
    } catch (error) {
      console.error('Failed to create study session:', error)
    }
  }
})

const breadcrumbItems = computed(() => [
  { label: 'OSCEs', href: '/osce' },
  { label: props.concept.title, href: `/osce/${props.concept.slug}` },
  { label: props.paper.title },
])

const showAnswers = ref<Record<number, boolean>>({})
const paperProgress = reactive({
  completionPercentage: props.completionPercentage,
  progress: props.progress,
  attemptCount: props.attemptCount,
})

const feedbackDialog = ref({
  isOpen: false,
  question: null as QuestionDto | null,
})

const openFeedbackDialog = (question: QuestionDto) => {
  feedbackDialog.value = {
    isOpen: true,
    question,
  }
}

const closeFeedbackDialog = () => {
  feedbackDialog.value = {
    isOpen: false,
    question: null,
  }
}

const lastEditDate = computed(() => {
  const date = new Date(props.paper.metadata?.lastEditedBy?.timestamp ?? props.paper.createdAt)
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).format(date)
})

const totalStations = computed(() => {
  return props.questions.reduce((total, question) => {
    return total + (question.stations?.length || 0)
  }, 0)
})

const handleOsceStationView = (questionId: number, stationId: number) => {
  showAnswers.value[stationId] = !showAnswers.value[stationId]

  if (showAnswers.value[stationId]) {
    axios
      .post('/api/papers/record-osce-response', {
        paperId: props.paper.id,
        questionId,
        stationId,
      })
      .then(() => {
        updateProgress()
      })
      .catch((error) => {
        console.error('Failed to record OSCE response', error)
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

const continueFromLastQuestion = () => {
  if (!paperProgress.progress || !paperProgress.progress.lastQuestionId) return

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
  <FeedbackDialog
    v-model:open="feedbackDialog.isOpen"
    :question="feedbackDialog.question"
    @close="closeFeedbackDialog"
  />

  <div class="min-h-screen bg-gray-50/50">
    <div class="w-full max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-3 sm:py-6 lg:py-8">
      <!-- Updated Header Section -->
      <div class="mb-4 sm:mb-8 header-animation">
        <BreadcrumbTrail :items="breadcrumbItems" class="mb-3 sm:mb-5" />

        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-6 mb-4 sm:mb-6">
          <div class="flex items-start gap-2 sm:gap-4 flex-1">
            <div class="flex-shrink-0 mt-0.5">
              <div class="h-10 w-10 rounded-lg bg-[#55A9C4]/10 flex items-center justify-center">
                <FileText class="h-6 w-6 text-[#55A9C4]" />
              </div>
            </div>
            <div>
              <h1 class="text-xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">{{ paper.title }}</h1>
              <p class="text-sm sm:text-base text-gray-600 max-w-3xl leading-relaxed">
                OSCE stations for {{ paper.title }} in {{ concept.title }}
              </p>
              <div class="flex flex-wrap items-center gap-2 pt-2">
                <span class="inline-flex px-2 py-1 rounded-md bg-[#55A9C4]/10 text-[#55A9C4] text-xs font-medium">
                  OSCE
                </span>
                <span class="text-xs text-gray-500">{{ paper.year }}</span>
                <span class="text-xs text-gray-500">
                  {{ paperProgress.attemptCount }}
                  {{ paperProgress.attemptCount === 1 ? 'attempt' : 'attempts' }}
                </span>
              </div>
            </div>
          </div>

          <div class="w-full sm:w-auto flex-shrink-0 space-y-2 sm:space-y-3 mt-2 sm:mt-0">
            <Button
              v-if="paperProgress.progress?.lastQuestionId"
              class="flex items-center gap-2 w-full sm:w-auto bg-[#55A9C4] hover:bg-[#4795af] text-white text-sm py-1.5 sm:py-2.5"
              @click="continueFromLastQuestion"
            >
              <ArrowRight class="h-4 w-4" />
              Continue where you left off
            </Button>

            <Link
              v-if="canManage"
              :href="`/manage/osce/${concept.slug}/${paper.slug}`"
              class="w-full sm:w-auto flex items-center justify-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-lg bg-[#55A9C4] hover:bg-[#4795af] text-white text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Settings class="h-4 w-4" />
              <span>Manage</span>
            </Link>
          </div>
        </div>

        <div class="w-12 h-1 bg-gradient-to-r from-[#55A9C4] to-[#55A9C4]/70 rounded-full"></div>
      </div>

      <div v-if="paper.metadata?.lastEditedBy || paper.createdAt" class="text-xs text-gray-500 px-2 italic">
        Last edited on {{ lastEditDate }}
      </div>

      <DisclaimerBanner />

      <!-- Progress Tracking Section -->
      <div v-if="paperProgress.completionPercentage > 0" class="bg-white p-3 sm:p-4 rounded-lg border-l-4 border-[#55A9C4] border-t border-b border-r shadow-sm w-full mb-4 sm:mb-5">
        <div class="flex justify-between items-center mb-2">
          <span class="font-medium text-sm">Your progress</span>
          <span class="text-sm font-semibold">
            {{ paperProgress.completionPercentage }}%
          </span>
        </div>

        <div class="h-2 sm:h-2.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            class="h-full bg-[#55A9C4] rounded-full transition-all duration-500"
            :style="{ width: `${paperProgress.completionPercentage}%` }"
            :class="{
              'bg-amber-500': paperProgress.completionPercentage < 25,
              'bg-orange-500': paperProgress.completionPercentage >= 25 && paperProgress.completionPercentage < 50,
              'bg-blue-500': paperProgress.completionPercentage >= 50 && paperProgress.completionPercentage < 75,
              'bg-green-500': paperProgress.completionPercentage >= 75,
            }"
          ></div>
        </div>

        <div class="mt-2 flex justify-between items-center text-xs sm:text-sm text-gray-500">
          <span>
            {{ Math.round((paperProgress.completionPercentage * totalStations) / 100) }} of
            {{ totalStations }} stations
          </span>
          <span
            v-if="paperProgress.completionPercentage === 100"
            class="text-green-600 font-medium flex items-center gap-1"
          >
            <CheckCircle class="h-3 w-3 sm:h-4 sm:w-4" /> Complete
          </span>
        </div>
      </div>

      <!-- Questions List -->
      <div class="space-y-4 sm:space-y-6">
        <template v-if="questions.length">
          <div
            v-for="(question, questionIndex) in questions"
            :key="question.id"
            :id="`question-${question.id}`"
            class="p-3 sm:p-5 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 w-full"
          >
            <div class="space-y-3 sm:space-y-4">
              <!-- Question Header -->
              <div class="flex flex-col gap-1 sm:gap-2">
                <span class="inline-block w-fit px-3 py-1 sm:px-4 sm:py-1.5 bg-[#55A9C4]/15 text-[#55A9C4] rounded-lg font-semibold text-sm shadow-sm">
                  Station {{ questionIndex + 1 }}
                </span>
                <p class="text-gray-900 text-sm sm:text-base break-words leading-relaxed">
                  {{ question.questionText }}
                </p>
              </div>

              <!-- Question Image -->
              <div v-if="question.questionImagePath" class="flex justify-center mt-2 sm:mt-4">
                <img
                  :src="question.questionImagePath"
                  :alt="`Station ${questionIndex + 1} image`"
                  class="w-full h-auto rounded-lg border shadow-sm max-h-[250px] sm:max-h-[350px] md:max-h-[400px] object-contain"
                />
              </div>

              <!-- OSCE Parts -->
              <div class="mt-3 sm:mt-5 space-y-3 sm:space-y-5">
                <div
                  v-for="(part, partIndex) in question.stations"
                  :key="part.id"
                  class="pl-3 py-3 pr-2 sm:p-4 bg-gray-50 rounded-lg border-l-4 border-[#55A9C4] border-y border-r border-gray-200 transition-all duration-300"
                >
                  <!-- Part Header with Part Number and Marks -->
                  <div class="flex items-center justify-between mb-2 sm:mb-3">
                    <div class="flex items-baseline gap-1 sm:gap-2">
                      <span class="inline-flex items-center justify-center h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-[#55A9C4]/15 text-[#55A9C4] text-xs font-semibold shadow-sm">
                        {{ partIndex + 1 }}
                      </span>
                      <span class="text-xs text-[#55A9C4]/80 font-medium px-2 py-0.5 bg-[#55A9C4]/5 rounded-md">
                        {{ part.marks }} mark{{ part.marks > 1 ? 's' : '' }}
                      </span>
                    </div>
                  </div>

                  <!-- Part Text -->
                  <p class="text-xs sm:text-sm text-gray-900 break-words mb-3 sm:mb-4 leading-relaxed">
                    {{ part.partText }}
                  </p>

                  <!-- Part Image if present -->
                  <div v-if="part.imagePath" class="mt-2 sm:mt-3 flex justify-center">
                    <img
                      :src="part.imagePath"
                      :alt="`Part ${partIndex + 1} image`"
                      class="w-full h-auto rounded-lg border shadow-sm max-h-[200px] sm:max-h-[250px] md:max-h-[300px] object-contain"
                    />
                  </div>
                  <!-- Show Answer Button -->
                  <button
                    v-if="!showAnswers[part.id]"
                    @click="handleOsceStationView(question.id, part.id)"
                    class="group w-full flex items-center justify-center gap-1 sm:gap-2 mt-2 sm:mt-3 text-[#55A9C4] font-semibold text-xs sm:text-sm rounded-lg p-2 sm:p-2.5 bg-gradient-to-r from-[#55A9C4]/10 to-[#55A9C4]/5 hover:from-[#55A9C4]/20 hover:to-[#55A9C4]/10 border border-[#55A9C4]/20 transition-all duration-300 shadow-sm hover:shadow"
                  >
                    <ChevronDown class="h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-y-1 transition-transform duration-300" />
                    <span>Show Expected Response</span>
                  </button>

                  <!-- Expected Response Section -->
                  <div v-if="showAnswers[part.id]" class="mt-3 sm:mt-4 animate-fadeIn">
                    <div class="relative overflow-hidden rounded-lg border border-gray-100 w-full">
                      <div class="absolute left-0 top-0 bottom-0 w-1 sm:w-1.5 bg-gradient-to-b from-[#55A9C4] to-blue-500"></div>

                      <div class="p-3 sm:p-4 bg-gradient-to-r from-[#55A9C4]/5 to-blue-50 border-b border-gray-100">
                        <div class="flex items-center gap-1.5 sm:gap-2">
                          <div class="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#55A9C4]/20 text-[#55A9C4]">
                            <CheckCircle class="h-3 w-3 sm:h-4 sm:w-4" />
                          </div>
                          <div>
                            <p class="text-xs sm:text-sm text-gray-500 font-medium">
                              Expected Response
                            </p>
                            <p class="text-xs sm:text-sm text-[#55A9C4]/80 font-medium">
                              {{ part.marks }} mark{{ part.marks > 1 ? 's' : '' }} available
                            </p>
                          </div>
                        </div>
                      </div>

                      <div class="p-3 sm:p-4 bg-white">
                        <div class="text-xs sm:text-sm text-gray-700 font-medium break-words leading-relaxed explanation-content w-full">
                          <ViewExplanation :content="part.expectedAnswer" />
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      class="mt-3 sm:mt-4 flex items-center gap-2 sm:gap-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 transition-all duration-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 shadow-sm hover:shadow-md group text-xs sm:text-sm w-full justify-center animate-fadeIn"
                      @click="openFeedbackDialog(question)"
                    >
                      <div class="p-0.5 sm:p-1 rounded-full bg-gray-100 shadow-sm">
                        <MessageSquare class="h-3 w-3 sm:h-4 sm:w-4 opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-300 text-gray-600" />
                      </div>
                      <span class="font-medium">Provide Feedback</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Empty State -->
        <div
          v-else
          class="text-center py-6 sm:py-10 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
        >
          <div class="flex justify-center">
            <div class="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3 sm:mb-4">
              <FileText class="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
            </div>
          </div>
          <h3 class="text-base sm:text-lg font-medium text-gray-700 mb-1 sm:mb-2">No stations found</h3>
          <p class="text-sm text-gray-500">This OSCE paper has no stations yet.</p>
        </div>
      </div>

      <!-- Floating Progress Indicator -->
      <div
        v-if="paperProgress.completionPercentage > 0"
        class="fixed bottom-4 sm:bottom-6 right-3 sm:right-6 bg-white shadow-md rounded-lg sm:rounded-xl border border-[#55A9C4]/20 flex items-center gap-2 sm:gap-3 z-50 transition-all duration-300 hover:shadow-lg group p-2 sm:p-3"
      >
        <div class="w-10 h-10 relative">
          <svg class="w-10 h-10 -rotate-90 transform">
            <circle
              class="text-gray-200"
              stroke-width="3"
              stroke="currentColor"
              fill="transparent"
              r="14"
              cx="16"
              cy="16"
            />
            <circle
              class="text-[#55A9C4]"
              stroke-width="3"
              :stroke-dasharray="88"
              :stroke-dashoffset="88 - paperProgress.completionPercentage * 0.88"
              stroke-linecap="round"
              stroke="currentColor"
              fill="transparent"
              r="14"
              cx="16"
              cy="16"
            />
          </svg>
          <span class="absolute inset-0 flex items-center justify-center text-xs font-medium">
            {{ Math.round(paperProgress.completionPercentage) }}%
          </span>
        </div>

        <div class="flex flex-col">
          <span class="text-sm font-medium">Your progress</span>
          <span class="text-xs text-gray-500">
            {{ Math.round((paperProgress.completionPercentage * totalStations) / 100) }} of
            {{ totalStations }}
          </span>
        </div>

        <Button
          v-if="paperProgress.progress?.lastQuestionId"
          size="sm"
          variant="ghost"
          @click="continueFromLastQuestion"
          class="flex"
        >
          <ArrowRight class="h-4 w-4 mr-1" />
          Continue
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Header animation styles to match */
.header-animation {
  animation: fadeIn 0.5s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Keep all other existing styles exactly the same */
.explanation-content {
  position: relative;
  max-height: 250px;
  overflow-y: auto;
  padding-right: 3px;

  /* Scrollbar styling (important for UX) */
  &::-webkit-scrollbar {
    width: 3px;
  }
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 10px;
  }

  /* Table handling - must keep */
  :deep(table) {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 0.5rem;
    display: block;
    overflow-x: auto;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;
    
    &::-webkit-scrollbar {
      height: 4px;
      width: 4px;
    }
  }

  /* Mobile-specific table adjustments - crucial */
  @media (max-width: 640px) {
    :deep(table) {
      font-size: 0.7rem;
    }
    :deep(th), :deep(td) {
      padding: 0.2rem 0.3rem;
    }
  }

  /* Standard table styles */
  :deep(th) {
    background-color: rgba(85, 169, 196, 0.1);
    color: #444;
    font-weight: 600;
    padding: 0.5rem;
    border: 1px solid rgba(85, 169, 196, 0.2);
  }

  /* Responsive scaling */
  @media (min-width: 640px) {
    max-height: 300px;
    padding-right: 4px;
    
    :deep(table) {
      font-size: 0.875rem;
    }
  }

  @media (min-width: 1024px) {
    max-height: 400px;
  }
}

/* Mobile-specific touch targets - important */
@media (max-width: 640px) {
  .station {
    padding: 0.75rem;
  }
  .station-text {
    font-size: 0.875rem;
    line-height: 1.4;
  }
}

/* Keep these essential utilities */
.hide-scrollbar {
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
}

.animate-fadeIn {
  animation: fadeIn 0.4s ease-out forwards;
}

.highlight-question {
  box-shadow: 0 0 0 3px rgba(85, 169, 196, 0.3);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>