<script setup lang="ts">
import type ConceptDto from '#dtos/concept'
import type PastPaperDto from '#dtos/past_paper'
import type QuestionDto from '#dtos/question'
import type UserStudySessionDto from '#dtos/user_study_session'
import DashLayout from '~/layouts/DashLayout.vue'
import { FileText, Clock, Settings, ArrowRight, CheckCircle} from 'lucide-vue-next'
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
        resourceId: props.paper.id
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

const lastEditDate = computed(() => {
  const date = new Date(props.paper.metadata?.lastEditedBy?.timestamp ?? props.paper.createdAt)
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).format(date)
})

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

  <div class="w-full mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-8 space-y-6 sm:space-y-8 font-sans">
    <!-- Header Section -->
    <div class="relative p-4 sm:p-6 md:p-8 bg-white rounded-xl border border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#55A9C4] via-[#55A9C4]/50 to-transparent rounded-t-xl" />

      <BreadcrumbTrail :items="breadcrumbItems" class="max-w-full overflow-x-auto pb-2 hide-scrollbar" />

      <div class="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
        <div class="flex items-start gap-3 flex-1">
          <div class="p-2 sm:p-3 rounded-lg bg-[#55A9C4]/10 border border-[#55A9C4]/20 hover:bg-[#55A9C4]/20 transition-colors duration-200">
            <FileText class="h-4 w-4 sm:h-5 sm:w-5 text-[#55A9C4]" />
          </div>
          <div class="space-y-1">
            <h1 class="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900">{{ paper.title }}</h1>
            <p class="text-xs sm:text-sm text-gray-500 max-w-full">
              SPOT stations for {{ paper.title }} in {{ concept.title }}
            </p>
            <div class="flex flex-wrap items-center gap-2 sm:gap-3 pt-1 sm:pt-2">
              <span class="px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs font-semibold bg-[#55A9C4]/15 text-[#55A9C4] rounded-full shadow-sm">
                SPOT
              </span>
              <span class="text-xs sm:text-sm text-gray-500">{{ paper.year }}</span>
              <span class="flex items-center gap-1 text-xs sm:text-sm text-gray-500">
                <Clock class="h-3 w-3" />
                Last edited {{ lastEditDate }}
              </span>
              <span class="flex items-center gap-1 text-xs sm:text-sm text-gray-500">
                {{ paperProgress.attemptCount }} {{ paperProgress.attemptCount === 1 ? 'attempt' : 'attempts' }}
              </span>
            </div>
          </div>
        </div>

        <div class="w-full sm:w-auto mt-3 sm:mt-0 space-y-2 sm:space-y-3">
          <Button
            v-if="paperProgress.progress?.lastQuestionId"
            class="flex items-center gap-1.5 w-full sm:w-auto bg-[#55A9C4] hover:bg-[#55A9C4]/90 text-white text-sm"
            @click="continueFromLastQuestion"
          >
            <ArrowRight class="h-4 w-4" />
            Continue where you left off
          </Button>

          <Link
            v-if="canManage"
            :href="`/manage/spot/${concept.slug}/${paper.slug}`"
            class="w-full sm:w-auto flex items-center justify-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-[#55A9C4] hover:bg-[#55A9C4]/90 text-white border border-[#55A9C4] text-xs sm:text-sm font-medium hover:shadow-md transition-all duration-200 group"
          >
            <Settings class="h-4 w-4 transition-transform duration-500 group-hover:rotate-180" />
            <span>Edit SPOT</span>
          </Link>
        </div>
      </div>
    </div>

    <DisclaimerBanner />

    <!-- Progress Tracking Section -->
    <div class="bg-white p-4 sm:p-5 md:p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
      <div v-if="paperProgress.completionPercentage > 0" class="p-3 sm:p-4 md:p-5 bg-white/80 rounded-xl border border-[#55A9C4]/10 mb-3 sm:mb-4">
        <div class="flex justify-between items-center mb-2">
          <span class="font-medium text-sm">Your progress</span>
          <span class="text-sm font-semibold">
            {{ paperProgress.completionPercentage }}%
          </span>
        </div>

        <div class="h-2 sm:h-2.5 md:h-3 bg-gray-200 rounded-full overflow-hidden">
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

        <div class="mt-2 flex justify-between items-center text-xs text-gray-500">
          <span>
            {{ Math.round((paperProgress.completionPercentage * totalStations) / 100) }} of
            {{ totalStations }} stations
          </span>
          <span
            v-if="paperProgress.completionPercentage === 100"
            class="text-green-600 font-medium flex items-center gap-1"
          >
            <CheckCircle class="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Complete
          </span>
        </div>
      </div>
    </div>

    <!-- Questions List -->
    <div class="space-y-4 sm:space-y-6">
      <template v-if="questions.length">
        <div
          v-for="(question, questionIndex) in questions"
          :key="question.id"
          :id="`question-${question.id}`"
          class="p-2 sm:p-4 md:p-6 bg-white rounded-lg sm:rounded-xl border border-gray-200 sm:border-gray-100 shadow-xs sm:shadow-sm hover:shadow-md transition-all duration-300 w-full max-w-full"
        >
          <div class="space-y-3 sm:space-y-4">
            <!-- Question Header -->
            <div class="flex flex-col gap-2">
              <span class="inline-block w-fit px-2 sm:px-4 py-1 sm:py-1.5 bg-[#55A9C4]/15 text-[#55A9C4] rounded-md sm:rounded-lg font-medium sm:font-semibold text-xs sm:text-base shadow-xs sm:shadow-sm">
                Question {{ questionIndex + 1 }}
              </span>
              <p class="text-gray-900 pl-0.5 text-sm sm:text-base md:text-lg break-words leading-relaxed">
                {{ question.questionText }}
              </p>
            </div>

            <!-- Question Image -->
            <div v-if="question.questionImagePath" class="flex justify-center mt-2 sm:mt-4">
              <img
                :src="question.questionImagePath"
                :alt="`Question ${questionIndex + 1} image`"
                class="w-full h-auto rounded-lg border shadow-xs sm:shadow-sm max-h-[250px] sm:max-h-[400px] object-contain"
              />
            </div>

            <!-- SPOT Stations -->
            <div class="mt-3 sm:mt-5 space-y-3 sm:space-y-5">
              <div
                v-for="(station, stationIndex) in question.spotStations"
                :key="station.id"
                class="p-2 sm:p-4 bg-white rounded-lg sm:rounded-xl border border-gray-200 sm:border-[#55A9C4]/10 shadow-xs sm:shadow-sm hover:shadow-md transition-all duration-300 relative"
              >
                <!-- Station Header -->
                <div class="flex items-center justify-between mb-1 sm:mb-3">
                  <div class="flex items-baseline gap-1 sm:gap-3">
                    <span
                      class="inline-flex items-center justify-center h-5 w-5 sm:h-7 sm:w-7 rounded-full bg-[#55A9C4]/15 text-[#55A9C4] text-xs font-semibold shadow-xs sm:shadow-sm"
                    >
                      {{ stationIndex + 1 }}
                    </span>
                    <span
                      class="text-xs text-[#55A9C4]/80 font-medium px-1.5 py-0.5 bg-[#55A9C4]/5 rounded-md"
                    >
                      {{ station.marks }} mark{{ station.marks > 1 ? 's' : '' }}
                    </span>
                  </div>
                </div>

                <!-- Station Text -->
                <p class="text-xs sm:text-base text-gray-900 break-words mb-2 sm:mb-4 leading-relaxed">
                  {{ station.partText }}
                </p>

                <!-- Station Image if present -->
                <div v-if="station.imagePath" class="mt-1 sm:mt-3 flex justify-center">
                  <img
                    :src="station.imagePath"
                    :alt="`Station ${stationIndex + 1} image`"
                    class="w-full h-auto rounded-lg border shadow-xs sm:shadow-sm max-h-[200px] sm:max-h-[300px] object-contain"
                  />
                </div>

                <!-- Show Answer Button -->
                <button
                  @click="handleSpotStationView(question.id, station.id)"
                  class="group w-full flex items-center justify-center gap-2 mt-2 text-[#55A9C4] font-medium sm:font-semibold text-xs sm:text-sm rounded-md sm:rounded-lg p-1.5 sm:p-2.5 md:p-3 bg-gradient-to-r from-[#55A9C4]/10 to-[#55A9C4]/5 hover:from-[#55A9C4]/20 hover:to-[#55A9C4]/10 border border-[#55A9C4]/20 transition-all duration-300 shadow-xs sm:shadow-sm hover:shadow"
                >
                  <ChevronDown
                    class="h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-y-1 transition-transform duration-300"
                  />
                  <span>{{ showAnswers[station.id] ? 'Hide Answer' : 'Show Answer' }}</span>
                </button>

                <!-- Expected Answer Section -->
                <div v-if="showAnswers[station.id]" class="mt-3 sm:mt-5 animate-fadeIn">
                  <div class="relative overflow-hidden rounded-lg sm:rounded-xl shadow-xs sm:shadow-lg border border-gray-200 sm:border-gray-100 w-full">
                    <div class="absolute left-0 top-0 bottom-0 w-1 sm:w-1.5 bg-gradient-to-b from-[#55A9C4] to-blue-500"></div>

                    <div class="p-2 sm:p-4 md:p-5 bg-gradient-to-r from-[#55A9C4]/5 to-blue-50 border-b border-gray-200 sm:border-gray-100">
                      <div class="flex items-center gap-2 sm:gap-3">
                        <div class="flex items-center justify-center w-5 h-5 sm:w-8 sm:h-8 rounded-full bg-[#55A9C4]/20 text-[#55A9C4]">
                          <CheckCircle class="h-3 w-3 sm:h-5 sm:w-5" />
                        </div>
                        <div>
                          <p class="text-xs sm:text-sm text-gray-500 font-medium">Expected Answer</p>
                          <p class="text-xs sm:text-sm text-[#55A9C4]/80 font-medium">
                            {{ station.marks }} mark{{ station.marks > 1 ? 's' : '' }} available
                          </p>
                        </div>
                      </div>
                    </div>

                    <div class="p-2 sm:p-4 md:p-5 bg-white">
                      <div class="text-xs sm:text-sm text-gray-700 font-medium break-words leading-relaxed explanation-content w-full">
                        <ViewExplanation :content="station.expectedAnswer" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      
      <!-- Empty State -->
      <div v-else class="text-center py-8 sm:py-12 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
        <p class="text-gray-500">This SPOT paper has no stations yet.</p>
      </div>
    </div>

    <!-- Floating Progress Indicator -->
    <div
      v-if="paperProgress.completionPercentage > 0"
      class="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg border border-[#55A9C4]/20 flex items-center gap-2 sm:gap-3 z-50 transition-all duration-300 hover:shadow-xl group"
      :class="{
        'p-1.5 sm:p-2 md:p-3': true,
      }"
    >
      <div class="w-8 h-8 sm:w-10 sm:h-10 relative">
        <svg class="w-8 h-8 sm:w-10 sm:h-10 -rotate-90 transform">
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
        <span class="absolute inset-0 flex items-center justify-center text-xs font-medium" style="font-size: 0.65rem">
          {{ Math.round(paperProgress.completionPercentage) }}%
        </span>
      </div>

      <div class="hidden sm:flex flex-col">
        <span class="text-xs sm:text-sm font-medium">Your progress</span>
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
  position: relative;
  max-height: 250px;
  overflow-y: auto;
  padding-right: 3px;
  padding-left: 0;

  /* Added table styling to match first file */
  :deep(table) {
    width: 100%;
    font-size: 0.75rem;
    border-collapse: collapse;
    margin-bottom: 0.5rem;
    display: block;
    overflow-x: auto;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;

    /* Horizontal scrollbar styling */
    &::-webkit-scrollbar {
      height: 4px;
      width: 4px;
    }
    
    &::-webkit-scrollbar-track {
      background: #f8f8f8;
      border-radius: 2px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: #d1d1d1;
      border-radius: 2px;
    }
    
    &::-webkit-scrollbar-thumb:hover {
      background: #b8b8b8;
    }
  }
  
  :deep(th) {
    background-color: rgba(85, 169, 196, 0.1);
    color: #444;
    font-weight: 600;
    padding: 0.25rem 0.5rem;
    text-align: left;
    border: 1px solid rgba(85, 169, 196, 0.2);
    white-space: nowrap;
  }
  
  :deep(td) {
    padding: 0.25rem 0.5rem;
    border: 1px solid rgba(85, 169, 196, 0.1);
    white-space: nowrap;
  }

  /* Mobile responsive adjustments for tables */
  @media (max-width: 640px) {
    :deep(table) {
      font-size: 0.7rem;
    }
    
    :deep(th),
    :deep(td) {
      padding: 0.2rem 0.3rem;
    }
  }

  /* Existing scrollbar styling */
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

  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }

  @media (min-width: 640px) {
    max-height: 350px;
    padding-right: 4px;
    
    &::-webkit-scrollbar {
      width: 4px;
    }
  }

  @media (min-width: 1024px) {
    max-height: 450px;
  }

  :deep(ol) {
    list-style-type: decimal;
    margin-left: 0.75rem;
    margin-top: 0.4rem;

    @media (min-width: 640px) {
      margin-left: 1rem;
      margin-top: 0.6rem;
    }
  }

  :deep(ul) {
    list-style-type: disc;
    margin-left: 0.75rem;
    margin-top: 0.4rem;

    @media (min-width: 640px) {
      margin-left: 1rem;
      margin-top: 0.6rem;
    }
  }

  :deep(li) {
    margin-bottom: 0.25rem;
    line-height: 1.35;
    
    @media (min-width: 640px) {
      margin-bottom: 0.4rem;
      line-height: 1.45;
    }
  }

  :deep(hr) {
    margin: 0.6rem 0;
    border-top: 1px dashed #a8d3e7;

    @media (min-width: 640px) {
      margin: 0.8rem 0;
    }
  }

  :deep(iframe) {
    max-width: 100%;
    height: auto;
    aspect-ratio: 16/9;
    display: block;
    margin: 0.75rem auto;
    border-radius: 0.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-height: 200px;

    @media (min-width: 640px) {
      margin: 1rem auto;
      width: 95%;
      max-height: 250px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }

    @media (min-width: 768px) {
      width: 90%;
      max-height: 300px;
    }
    transition: all 0.3s ease;
  }

  :deep(.video-container) {
    position: relative;
    padding-bottom: 56.25%;
    height: 0;
    overflow: hidden;
    max-width: 100%;
    margin: 0.75rem 0;
    border-radius: 0.5rem;

    @media (min-width: 640px) {
      margin: 1rem 0;
    }

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

/* Mobile-specific optimizations */
@media (max-width: 640px) {
  .question-container {
    padding: 0.75rem;
    border-radius: 0.5rem;
    border: 1px solid #e5e7eb;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }
  
  .station {
    padding: 0.75rem;
    margin-bottom: 0.75rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.375rem;
    background: white;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }
  
  .station-text {
    font-size: 0.875rem;
    line-height: 1.4;
  }
  
  .expected-answer {
    padding: 0.5rem;
    margin-top: 0.5rem;
  }
  
  .show-answer-btn {
    padding: 0.375rem 0.5rem;
    font-size: 0.75rem;
  }
  
  .question-header {
    font-size: 0.875rem;
    padding: 0.5rem 0.75rem;
  }
  
  .station-header {
    font-size: 0.75rem;
  }
  
  .station-number {
    width: 1.25rem;
    height: 1.25rem;
    font-size: 0.625rem;
  }
}
</style>