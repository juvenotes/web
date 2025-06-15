<script setup lang="ts">
import type ConceptDto from '#dtos/concept'
import type PastPaperDto from '#dtos/past_paper'
import type QuestionDto from '#dtos/question'
import type UserPaperProgressDto from '#dtos/user_paper_progress'
import type UserStudySessionDto from '#dtos/user_study_session'
import DashLayout from '~/layouts/DashLayout.vue'
import { FileText, Settings, ArrowRight, CheckCircle, MessageSquare, ChevronDown } from 'lucide-vue-next'
import { computed, ref, reactive, onMounted } from 'vue'
import axios from 'axios'

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

const breadcrumbItems = computed(() => [
  { label: 'SPOT Papers', href: '/spot' },
  { label: props.concept.title, href: `/spot/${props.concept.slug}` },
  { label: props.paper.title },
])

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
    return total + (question.spotStations?.length || 0)
  }, 0)
})

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
  <FeedbackDialog
    v-model:open="feedbackDialog.isOpen"
    :question="feedbackDialog.question"
    @close="closeFeedbackDialog"
  />

  <div class="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-sans">
    <!-- Header Section -->
    <div class="relative p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#55A9C4] via-[#55A9C4]/50 to-transparent rounded-t-xl" />

      <BreadcrumbTrail
        :items="breadcrumbItems"
        class="w-full overflow-x-auto pb-2 hide-scrollbar"
      />

      <div class="mt-4 flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
        <div class="flex items-start gap-3 flex-1">
          <div class="p-3 rounded-lg bg-[#55A9C4]/10 border border-[#55A9C4]/20 hover:bg-[#55A9C4]/20 transition-colors duration-200">
            <FileText class="h-5 w-5 text-[#55A9C4]" />
          </div>
          <div class="space-y-2">
            <h1 class="text-xl sm:text-2xl font-semibold text-gray-900">{{ paper.title }}</h1>
            <p class="text-sm text-gray-600 max-w-full">
              SPOT stations for {{ paper.title }} in {{ concept.title }}
            </p>
            <div class="flex flex-wrap items-center gap-2 pt-2">
              <span class="px-2 py-1 text-xs font-semibold bg-[#55A9C4]/15 text-[#55A9C4] rounded-full shadow-sm">
                SPOT
              </span>
              <span class="text-xs text-gray-500">{{ paper.year }}</span>
              <span class="flex items-center gap-1 text-xs text-gray-500">
                {{ paperProgress.attemptCount }}
                {{ paperProgress.attemptCount === 1 ? 'attempt' : 'attempts' }}
              </span>
            </div>
          </div>
        </div>

        <div class="w-full sm:w-auto mt-4 sm:mt-0 space-y-3">
          <Button
            v-if="paperProgress.progress?.lastQuestionId"
            class="flex items-center gap-2 w-full sm:w-auto bg-[#55A9C4] hover:bg-[#55A9C4]/90 text-white text-sm"
            @click="continueFromLastQuestion"
          >
            <ArrowRight class="h-4 w-4" />
            Continue where you left off
          </Button>
          <Link
            v-if="canManage"
            :href="`/manage/spot/${concept.slug}/${paper.slug}`"
            class="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#55A9C4] hover:bg-[#55A9C4]/90 text-white border border-[#55A9C4] text-sm font-medium hover:shadow-md transition-all duration-200 group"
          >
            <Settings class="h-4 w-4 transition-transform duration-500 group-hover:rotate-180" />
            <span>Edit Spot</span>
          </Link>
        </div>
      </div>
    </div>

    <div v-if="paper.metadata?.lastEditedBy || paper.createdAt" class="text-xs text-gray-500 px-2 italic">
      Last edited on {{ lastEditDate }}
    </div>

    <DisclaimerBanner />

    <!-- Progress Tracking Section -->
    <div class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
      <div
        v-if="paperProgress.completionPercentage > 0"
        class="p-4 bg-white/80 rounded-lg border border-[#55A9C4]/10 mb-4"
      >
        <div class="flex justify-between items-center mb-2">
          <span class="font-medium text-sm">Your progress</span>
          <span class="text-sm font-semibold">
            {{ paperProgress.completionPercentage }}%
          </span>
        </div>

        <div class="h-2.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            class="h-full bg-[#55A9C4] rounded-full transition-all duration-500"
            :style="{ width: `${paperProgress.completionPercentage}%` }"
            :class="{
              'bg-amber-500': paperProgress.completionPercentage < 25,
              'bg-orange-500':
                paperProgress.completionPercentage >= 25 && paperProgress.completionPercentage < 50,
              'bg-blue-500':
                paperProgress.completionPercentage >= 50 && paperProgress.completionPercentage < 75,
              'bg-green-500': paperProgress.completionPercentage >= 75,
            }"
          ></div>
        </div>

        <div class="mt-2 flex justify-between items-center text-sm text-gray-500">
          <span>
            {{ Math.round((paperProgress.completionPercentage * totalStations) / 100) }} of
            {{ totalStations }} stations
          </span>
          <span
            v-if="paperProgress.completionPercentage === 100"
            class="text-green-600 font-medium flex items-center gap-1"
          >
            <CheckCircle class="h-4 w-4" /> Complete
          </span>
        </div>
      </div>
    </div>

    <!-- Questions List -->
    <div class="space-y-6">
      <template v-if="questions.length">
        <div
          v-for="question in questions"
          :key="question.id"
          :id="`question-${question.id}`"
          class="p-5 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 w-full"
        >
          <div class="space-y-4">
            <!-- Question Header -->
            <div class="bg-[#F5FBFD] border border-gray-100 p-4 rounded-lg">
              <p class="font-medium text-base text-gray-900">{{ question.questionText }}</p>
            </div>

            <!-- Question Image -->
            <div v-if="question.questionImagePath" class="flex justify-center mt-4">
              <img
                :src="question.questionImagePath"
                :alt="`Question image`"
                class="w-full h-auto rounded-lg border shadow-sm max-h-[400px] object-contain"
              />
            </div>

            <!-- SPOT Stations -->
            <div class="mt-5 space-y-5">
              <div
                v-for="(station, stationIndex) in question.spotStations"
                :key="station.id"
                class="p-4 bg-white rounded-lg border border-[#55A9C4]/10 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <!-- Station Header -->
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-baseline gap-2">
                    <span class="inline-flex items-center justify-center h-6 w-6 rounded-full bg-[#55A9C4]/15 text-[#55A9C4] text-xs font-semibold shadow-sm">
                      {{ stationIndex + 1 }}
                    </span>
                    <span class="text-sm font-medium text-gray-900">
                      Station {{ station.id }}
                    </span>
                  </div>
                </div>

                <!-- Station Instructions -->
                <div class="text-sm text-gray-700 prose prose-sm max-w-none mb-4 leading-relaxed">
                  <div v-html="station.partText"></div>
                </div>

                <!-- Show Answer Button -->
                <button
                  v-if="!showAnswers[station.id]"
                  @click="handleSpotStationView(question.id, station.id)"
                  class="group w-full flex items-center justify-center gap-2 mt-3 text-[#55A9C4] font-semibold text-sm rounded-lg p-2.5 bg-gradient-to-r from-[#55A9C4]/10 to-[#55A9C4]/5 hover:from-[#55A9C4]/20 hover:to-[#55A9C4]/10 border border-[#55A9C4]/20 transition-all duration-300 shadow-sm hover:shadow"
                >
                  <ChevronDown class="h-4 w-4 group-hover:translate-y-1 transition-transform duration-300" />
                  <span>Show Expected Response</span>
                </button>

                <!-- Expected Response Section -->
                <div v-if="showAnswers[station.id]" class="mt-4 animate-fadeIn">
                  <div class="relative overflow-hidden rounded-lg border border-gray-100 w-full">
                    <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#55A9C4] to-blue-500"></div>

                    <div class="p-4 bg-gradient-to-r from-[#55A9C4]/5 to-blue-50 border-b border-gray-100">
                      <div class="flex items-center gap-2">
                        <div class="flex items-center justify-center w-6 h-6 rounded-full bg-[#55A9C4]/20 text-[#55A9C4]">
                          <CheckCircle class="h-4 w-4" />
                        </div>
                        <div>
                          <p class="text-sm text-gray-500 font-medium">
                            Expected Response
                          </p>
                        </div>
                      </div>
                    </div>

                    <div class="p-4 bg-white">
                      <div class="text-sm text-gray-700 font-medium break-words leading-relaxed explanation-content w-full">
                        <ViewExplanation :content="station.expectedAnswer" />
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    class="mt-4 flex items-center gap-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 transition-all duration-300 rounded-lg px-4 py-3 shadow-sm hover:shadow-md group text-sm w-full justify-center animate-fadeIn"
                    @click="openFeedbackDialog(question)"
                  >
                    <div class="p-1 rounded-full bg-gray-100 shadow-sm">
                      <MessageSquare class="h-4 w-4 opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-300 text-gray-600" />
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
        class="text-center py-10 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
      >
        <p class="text-gray-500">This SPOT paper has no stations yet.</p>
      </div>
    </div>

    <!-- Floating Progress Indicator -->
    <div
      v-if="paperProgress.completionPercentage > 0"
      class="fixed bottom-6 right-6 bg-white shadow-md rounded-xl border border-[#55A9C4]/20 flex items-center gap-3 z-50 transition-all duration-300 hover:shadow-lg group p-3"
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
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.explanation-content {
  position: relative;
  max-height: 250px;
  overflow-y: auto;
  padding-right: 3px;

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

  @media (max-width: 640px) {
    :deep(table) {
      font-size: 0.7rem;
    }
    :deep(th), :deep(td) {
      padding: 0.2rem 0.3rem;
    }
  }

  :deep(th) {
    background-color: rgba(85, 169, 196, 0.1);
    color: #444;
    font-weight: 600;
    padding: 0.5rem;
    border: 1px solid rgba(85, 169, 196, 0.2);
  }

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