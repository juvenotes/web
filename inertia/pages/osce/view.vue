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
  Info,
  BookOpen,
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
        resourceId: props.paper.id
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
    <!-- <StudySessionTracker v-if="studySession" :sessionId="studySession.id" /> -->

  <FeedbackDialog
    v-model:open="feedbackDialog.isOpen"
    :question="feedbackDialog.question"
    @close="closeFeedbackDialog"
  />

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
    <!-- Header Section -->
    <div class="relative p-6 sm:p-8 bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#55A9C4] via-[#55A9C4]/50 to-transparent rounded-t-2xl" />

      <BreadcrumbTrail :items="breadcrumbItems" class="max-w-full overflow-x-auto pb-2 hide-scrollbar" />

      <div class="mt-6 flex flex-col sm:flex-row sm:items-start gap-6">
        <div class="flex items-start gap-4 flex-1">
          <div class="p-3 rounded-xl bg-[#55A9C4]/10 border border-[#55A9C4]/20 hover:bg-[#55A9C4]/20 transition-colors duration-200">
            <FileText class="h-5 w-5 text-[#55A9C4]" />
          </div>
          <div class="space-y-1">
            <h1 class="text-xl sm:text-2xl font-semibold text-gray-900">{{ paper.title }}</h1>
            <p class="text-sm text-gray-500 max-w-2xl">
              OSCE stations for {{ paper.title }} in {{ concept.title }}
            </p>
            <div class="flex flex-wrap items-center gap-3 pt-2">
              <span class="px-2.5 py-1 text-xs font-semibold bg-[#55A9C4]/15 text-[#55A9C4] rounded-full shadow-sm">
                OSCE
              </span>
              <span class="text-sm text-gray-500">{{ paper.year }}</span>
              <span class="flex items-center gap-1 text-sm text-gray-500">
                {{ paperProgress.attemptCount }} {{ paperProgress.attemptCount === 1 ? 'attempt' : 'attempts' }}
              </span>
            </div>
          </div>
        </div>

        <div class="w-full sm:w-auto mt-4 sm:mt-0 space-y-3">
          <Button
            v-if="paperProgress.progress?.lastQuestionId"
            class="flex items-center gap-1.5 w-full sm:w-auto bg-[#55A9C4] hover:bg-[#55A9C4]/90 text-white"
            @click="continueFromLastQuestion"
          >
            <ArrowRight class="h-4 w-4" />
            Continue where you left off
          </Button>

          <Link
            v-if="canManage"
            :href="`/manage/osce/${concept.slug}/${paper.slug}`"
            class="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#55A9C4] hover:bg-[#55A9C4]/90 text-white border border-[#55A9C4] text-sm font-medium hover:shadow-md transition-all duration-200 group"
          >
            <Settings class="h-4 w-4 transition-transform duration-500 group-hover:rotate-180" />
            <span>Edit OSCE</span>
          </Link>
        </div>
      </div>
    </div>

    <div v-if="paper.metadata?.lastEditedBy || paper.createdAt" class="text-xs sm:text-sm text-gray-500 px-1 italic">
      Last edited on {{ lastEditDate }}
    </div>

    <DisclaimerBanner />

    <!-- Progress Tracking Section -->
    <div class="bg-white p-5 sm:p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
      <div v-if="paperProgress.completionPercentage > 0" class="p-4 sm:p-5 bg-white/80 rounded-xl border border-[#55A9C4]/10 mb-4">
        <div class="flex justify-between items-center mb-2 sm:mb-3">
          <span class="font-medium text-sm sm:text-base">Your progress</span>
          <span class="text-sm sm:text-base font-semibold">
            {{ paperProgress.completionPercentage }}%
          </span>
        </div>

        <div class="h-2.5 sm:h-3 bg-gray-200 rounded-full overflow-hidden">
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

        <div class="mt-2 sm:mt-3 flex justify-between items-center text-xs sm:text-sm text-gray-500">
          <span>
            {{ Math.round((paperProgress.completionPercentage * totalStations) / 100) }} of
            {{ totalStations }} stations
          </span>
          <span
            v-if="paperProgress.completionPercentage === 100"
            class="text-green-600 font-medium flex items-center gap-1"
          >
            <CheckCircle class="h-3.5 w-3.5" /> Complete
          </span>
        </div>
      </div>
    </div>

    <!-- Questions List -->
    <div class="space-y-6 sm:space-y-8">
      <template v-if="questions.length">
        <div
          v-for="(question, questionIndex) in questions"
          :key="question.id"
          :id="`question-${question.id}`"
          class="p-4 sm:p-6 md:p-8 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 w-full max-w-full"
        >
          <div class="space-y-4 sm:space-y-5">
            <!-- Question Header -->
            <div class="flex flex-col gap-2 sm:gap-3">
              <span class="inline-block w-fit px-4 sm:px-5 py-1.5 sm:py-2 bg-[#55A9C4]/15 text-[#55A9C4] rounded-lg font-semibold text-base sm:text-lg shadow-sm">
                Station {{ questionIndex + 1 }}
              </span>
              <p class="text-gray-900 pl-1 text-sm sm:text-base md:text-lg break-words leading-relaxed">
                {{ question.questionText }}
              </p>
            </div>

            <!-- Question Image -->
            <div v-if="question.questionImagePath" class="flex justify-center mt-4">
              <img
                :src="question.questionImagePath"
                :alt="`Station ${questionIndex + 1} image`"
                class="max-w-full h-auto rounded-lg border shadow-sm max-h-[400px] object-contain"
              />
            </div>

            <!-- OSCE Parts -->
            <div class="mt-5 sm:mt-7 space-y-5 sm:space-y-7">
              <div
                class="bg-gradient-to-r from-[#55A9C4]/5 to-[#55A9C4]/0 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 w-full"
              >
                <!-- OSCE Parts Header -->
                <div
                  class="flex items-center justify-between px-5 py-4 bg-[#55A9C4]/15 border-b border-[#55A9C4]/10"
                >
                  <div class="flex items-center gap-3">
                    <BookOpen class="h-4 w-4 sm:h-5 sm:w-5 text-[#55A9C4]" />
                    <span class="text-sm sm:text-base font-medium text-[#55A9C4]">OSCE Stations</span>
                  </div>
                  <div
                    class="text-xs sm:text-sm bg-white/70 backdrop-blur-sm px-3 py-1.5 rounded-full text-[#55A9C4]/80 font-medium shadow-sm"
                  >
                    {{ question.stations.length }} part{{ question.stations.length > 1 ? 's' : '' }}
                  </div>
                </div>

                <!-- OSCE Stations List -->
                <div class="divide-y divide-[#55A9C4]/10">
                  <div
                    v-for="(part, partIndex) in question.stations"
                    :key="part.id"
                    class="px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 bg-white/80 hover:bg-white/100 transition-all duration-300"
                  >
                    <!-- Part Header with Part Number and Marks -->
                    <div class="flex items-center justify-between mb-3 sm:mb-4">
                      <div class="flex items-baseline gap-3">
                        <span
                          class="inline-flex items-center justify-center h-7 w-7 rounded-full bg-[#55A9C4]/15 text-[#55A9C4] text-xs font-semibold shadow-sm"
                        >
                          {{ partIndex + 1 }}
                        </span>
                        <span
                          class="text-xs sm:text-sm text-[#55A9C4]/80 font-medium px-2 py-0.5 bg-[#55A9C4]/5 rounded-md"
                        >
                          {{ part.marks }} mark{{ part.marks > 1 ? 's' : '' }}
                        </span>
                      </div>
                    </div>

                    <!-- Part Text -->
                    <p class="text-sm sm:text-base text-gray-900 break-words mb-4 sm:mb-5 leading-relaxed">
                      {{ part.partText }}
                    </p>

                    <!-- Part Image if present -->
                    <div v-if="part.imagePath" class="mt-3 flex justify-center">
                      <img
                        :src="part.imagePath"
                        :alt="`Part ${partIndex + 1} image`"
                        class="max-w-full h-auto rounded-lg border shadow-sm max-h-[300px] object-contain"
                      />
                    </div>

                    <!-- Show Answer Button -->
                    <button
                      v-if="!showAnswers[part.id]"
                      @click="handleOsceStationView(question.id, part.id)"
                      class="group w-full sm:w-auto flex items-center justify-center gap-2 mt-3 sm:mt-4 text-[#55A9C4] font-semibold text-xs sm:text-sm rounded-lg p-2.5 sm:p-3 bg-gradient-to-r from-[#55A9C4]/15 to-[#55A9C4]/5 hover:from-[#55A9C4]/25 hover:to-[#55A9C4]/15 border border-[#55A9C4]/20 transition-all duration-300 shadow-sm hover:shadow"
                    >
                      <ChevronDown
                        class="h-4 w-4 group-hover:translate-y-1 transition-transform duration-300"
                      />
                      <span>Show Expected Response</span>
                    </button>

                    <!-- Expected Response Section -->
                    <div v-if="showAnswers[part.id]" class="mt-5 sm:mt-6 animate-fadeIn">
                      <div class="relative overflow-hidden rounded-xl shadow-lg border border-gray-100 w-full">
                        <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#55A9C4] to-blue-500"></div>

                        <div class="p-4 sm:p-5 md:p-6 bg-gradient-to-r from-[#55A9C4]/5 to-blue-50 border-b border-gray-100">
                          <div class="flex items-center gap-3">
                            <div class="flex items-center justify-center w-8 h-8 rounded-full bg-[#55A9C4]/20 text-[#55A9C4]">
                              <CheckCircle class="h-5 w-5" />
                            </div>
                            <div>
                              <p class="text-sm text-gray-500 font-medium">Expected Response</p>
                              <p class="text-sm text-[#55A9C4]/80 font-medium">
                                {{ part.marks }} mark{{ part.marks > 1 ? 's' : '' }} available
                              </p>
                            </div>
                          </div>
                        </div>

                        <div class="p-4 sm:p-6 md:p-8 bg-white">
                          <div class="flex gap-3 items-start">
                            <div class="shrink-0 pt-1">
                              <div class="w-5 h-5 rounded-full bg-[#55A9C4]/10 flex items-center justify-center">
                                <Info class="h-3 w-3 text-[#55A9C4]" />
                              </div>
                            </div>
                            <div class="text-sm sm:text-base text-gray-700 font-medium break-words leading-relaxed explanation-content w-full">
                              <ViewExplanation :content="part.expectedAnswer" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        class="mt-5 sm:mt-6 flex items-center gap-3 sm:gap-4 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 transition-all duration-300 rounded-lg px-5 sm:px-6 py-3 sm:py-3.5 shadow-sm hover:shadow-md group text-xs sm:text-sm w-full sm:w-auto justify-center sm:justify-start animate-fadeIn"
                        @click="openFeedbackDialog(question)"
                      >
                        <div class="p-1.5 rounded-full bg-gray-100 shadow-sm">
                          <MessageSquare class="h-4 w-4 sm:h-5 sm:w-5 opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-300 text-gray-600" />
                        </div>
                        <span class="font-medium">Provide Feedback</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      
      <!-- Empty State -->
      <div v-else class="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
        <p class="text-gray-500">This OSCE paper has no stations yet.</p>
      </div>
    </div>

    <!-- Floating Progress Indicator -->
    <div
      v-if="paperProgress.completionPercentage > 0"
      class="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg border border-[#55A9C4]/20 flex items-center gap-3 z-50 transition-all duration-300 hover:shadow-xl group"
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
            class="text-[#55A9C4]"
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
        <span class="absolute inset-0 flex items-center justify-center text-xs sm:text-xs font-medium" style="font-size: 0.7rem">
          {{ Math.round(paperProgress.completionPercentage) }}%
        </span>
      </div>

      <div class="hidden sm:flex flex-col">
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
        class="hidden sm:flex"
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
  :deep(ol) {
    list-style-type: decimal;
    margin-left: 1.25rem;
    margin-top: 0.75rem;

    @media (min-width: 640px) {
      margin-left: 1.75rem;
      margin-top: 1rem;
    }
  }

  :deep(ul) {
    list-style-type: disc;
    margin-left: 1.25rem;
    margin-top: 0.75rem;

    @media (min-width: 640px) {
      margin-left: 1.75rem;
      margin-top: 1rem;
    }
  }

  :deep(li) {
    margin-bottom: 0.5rem;
    line-height: 1.5;
  }

  :deep(hr) {
    margin: 1rem 0;
    border-top: 1px dashed #a8d3e7;

    @media (min-width: 640px) {
      margin: 1.25rem 0;
    }
  }

  position: relative;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 5px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }

  @media (min-width: 640px) {
    max-height: 400px;
  }

  @media (min-width: 1024px) {
    max-height: 500px;
  }

  :deep(iframe) {
    max-width: 100%;
    height: auto;
    aspect-ratio: 16/9;
    display: block;
    margin: 1rem auto;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    width: 100%;
    max-height: 250px;

    @media (min-width: 640px) {
      width: 90%;
      max-height: 300px;
    }

    @media (min-width: 768px) {
      width: 85%;
      max-height: 350px;
    }
    transition: all 0.3s ease;
  }

  :deep(.video-container) {
    position: relative;
    padding-bottom: 56.25%;
    height: 0;
    overflow: hidden;
    max-width: 100%;
    margin: 1rem 0;
    border-radius: 0.5rem;

    iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      margin: 0;
    }
  }
}

.hide-scrollbar,
:deep(.breadcrumb-trail) {
  max-width: 100%;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  white-space: nowrap;
  padding-bottom: 4px;
}

.hide-scrollbar::-webkit-scrollbar,
:deep(.breadcrumb-trail::-webkit-scrollbar) {
  display: none;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.4s ease-out forwards;
}

.highlight-question {
  box-shadow: 0 0 0 3px rgba(85, 169, 196, 0.3);
}
</style>