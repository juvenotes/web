<script setup lang="ts">
import type ConceptDto from '#dtos/concept'
import type PastPaperDto from '#dtos/past_paper'
import type QuestionDto from '#dtos/question'
import type UserPaperProgressDto from '#dtos/user_paper_progress'
import DashLayout from '~/layouts/DashLayout.vue'
import {
  FileText,
  Circle,
  CheckCircle,
  XCircle,
  Settings,
  MessageSquare,
  ChevronDown,
  BookOpen,
  Info,
  Users,
  ArrowRight,
} from 'lucide-vue-next'
import { computed, ref, onMounted, reactive } from 'vue'
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

onMounted(async () => {
  if (!studySession.value) {
    try {
      const response = await axios.post('/api/study-sessions', {
        resourceType: 'paper',
        resourceId: props.concept.id // Using concept ID as this is a listing page
      })
      studySession.value = response.data
    } catch (error) {
      console.error('Failed to create study session:', error)
    }
  }
})

const breadcrumbItems = computed(() => [
  { label: 'Papers', href: '/papers' },
  { label: props.concept.title, href: `/papers/${props.concept.slug}` },
  { label: props.paper.title },
])

const selectedAnswers = ref<Record<number, number | null>>({}) // to track selected answers
const showAnswer = ref<Record<number, boolean>>({}) // to show the answer explanation

// Record answer to the server
async function recordMcqResponse(questionId: number, choiceId: number, isCorrect: boolean) {
  try {
    await axios.post('/api/papers/record-mcq-response', {
      paperId: props.paper.id,
      questionId,
      choiceId,
      isCorrect,
    })
  } catch (error) {
    console.error('Failed to record response', error)
  }
}

// Record SAQ viewing as progress
const handleSaqPartView = (questionId: number, partId: number) => {
  showAnswer.value[partId] = true

  axios
    .post('/api/papers/record-saq-response', {
      paperId: props.paper.id,
      questionId,
      partId,
    })
    .then(() => {
      updateProgress()
    })
    .catch((error) => {
      console.error('Failed to record SAQ response', error)
    })
}

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

const handleChoiceSelect = (questionId: number, choiceId: number) => {
  selectedAnswers.value[questionId] = choiceId
  showAnswer.value[questionId] = true

  // Get the selected choice to determine if it's correct
  const question = props.questions.find((q) => q.id === questionId)
  const choice = question?.choices.find((c) => c.id === choiceId)

  if (question && choice) {
    recordMcqResponse(questionId, choiceId, choice.isCorrect).then(() => {
      updateProgress()
    })
  }
}

const paperProgress = reactive({
  completionPercentage: props.completionPercentage,
  progress: props.progress,
  attemptCount: props.attemptCount,
})

const hasAttemptedPaper = computed(() => paperProgress.completionPercentage > 0)

const attemptCountText = computed(() =>
  hasAttemptedPaper.value
    ? 'You have attempted questions in this paper'
    : 'You have not attempted any questions yet'
)

// Continue from last question function
const continueFromLastQuestion = () => {
  // Early return if no progress or lastQuestionId
  if (!paperProgress.progress || !paperProgress.progress.lastQuestionId) {
    return
  }

  // Store the ID in a local constant - TypeScript will better track this
  const lastQuestionId = paperProgress.progress.lastQuestionId

  const questionIndex = props.questions.findIndex((q) => q.id === lastQuestionId)

  if (questionIndex === -1) return

  // Use the local constant in the timeout function
  setTimeout(() => {
    const element = document.getElementById(`question-${lastQuestionId}`)

    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      element.classList.add('highlight-question')
      setTimeout(() => element.classList.remove('highlight-question'), 2000)
    }
  }, 500)
}

// Initialize user answers from saved responses
const initializeUserAnswers = async () => {
  if (!paperProgress.progress?.attemptCount) return

  try {
    const response = await axios.get(`/api/papers/${props.paper.id}/my-responses`)

    if (response.data.responses?.length) {
      response.data.responses.forEach((item: { questionId: number; selectedOption: string }) => {
        const question = props.questions.find((q) => q.id === item.questionId)
        if (!question) return

        // Convert letter (A, B, C) back to choice ID
        const choiceIndex = item.selectedOption.charCodeAt(0) - 65
        if (question.choices[choiceIndex]) {
          selectedAnswers.value[question.id] = question.choices[choiceIndex].id
          showAnswer.value[question.id] = true
        }
      })
    }
  } catch (error) {
    console.error('Failed to fetch user responses:', error)
  }
}

// Function to update progress data
const updateProgress = async () => {
  try {
    const response = await axios.get(`/api/papers/${props.paper.id}/my-responses`)
    if (response.data) {
      paperProgress.completionPercentage = response.data.completionPercentage || 0
      if (response.data.progress) {
        paperProgress.progress = response.data.progress
      }
    }
  } catch (error) {
    console.error('Failed to update progress:', error)
  }
}

const getCorrectAnswer = (question: QuestionDto) => {
  return question.choices.find((choice) => choice.isCorrect)
}

// Call this on component mount
onMounted(() => {
  if ((paperProgress.progress?.attemptCount ?? 0) > 0) {
    initializeUserAnswers()
  }
})

const getLastEditDate = computed(() => {
  const date = new Date(props.paper.metadata?.lastEditedBy?.timestamp ?? props.paper.createdAt)

  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).format(date)
})
</script>

<template>
  <AppHead :title="paper.title" :description="`Questions for ${paper.title}`" />
  <StudySessionTracker v-if="studySession" :sessionId="studySession.id" />
  <FeedbackDialog
    v-model:open="feedbackDialog.isOpen"
    :question="feedbackDialog.question"
    @close="closeFeedbackDialog"
  />
  <div class="max-w-7xl mx-auto px-3 sm:px-4 lg:px-5 py-5 sm:py-8 space-y-6 sm:space-y-10">
    <!-- Header section with glass morphism effect -->
    <div
      class="relative p-5 sm:p-8 bg-white/70 backdrop-blur-sm rounded-2xl border border-primary/10 shadow-sm transition-all duration-300 hover:shadow-md"
    >
      <div
        class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent rounded-t-2xl"
      />

      <BreadcrumbTrail
        :items="breadcrumbItems"
        class="max-w-full overflow-x-auto pb-2 hide-scrollbar"
      />

      <!-- Paper Info with improved spacing -->
      <div
        class="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-4 sm:gap-6 sm:items-start justify-between"
      >
        <div class="flex items-start gap-4 sm:gap-5">
          <div
            class="p-3 sm:p-4 rounded-xl bg-primary/10 border border-primary/15 shadow-sm shrink-0"
          >
            <FileText class="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          </div>
          <div class="min-w-0 flex-1">
            <h1 class="text-xl sm:text-2xl md:text-3xl font-bold text-foreground truncate">
              {{ paper.title }}
            </h1>
            <div class="flex flex-wrap items-center gap-3 mt-2">
              <span
                class="text-sm sm:text-base text-muted-foreground truncate max-w-[180px] sm:max-w-[250px]"
              >
                {{ concept.title }}
              </span>
              <span
                class="px-2.5 py-1 text-xs font-semibold bg-primary/15 text-primary rounded-full shadow-sm"
              >
                {{ paper.examType.toUpperCase() }}
              </span>
              <span class="text-sm sm:text-base text-muted-foreground">{{ paper.year }}</span>
              <span class="flex items-center gap-1 text-sm text-muted-foreground">
                <Users class="h-3 w-3" />
                {{ attemptCount }} {{ attemptCount === 1 ? 'attempt' : 'attempts' }}
              </span>
            </div>
          </div>
        </div>
        <!-- Action buttons -->
        <div class="flex flex-wrap items-center gap-2 mt-3 sm:mt-0">
          <!-- Continue button -->
          <Button
            v-if="paperProgress.progress?.lastQuestionId"
            variant="default"
            class="flex items-center gap-1.5 w-full sm:w-auto"
            @click="continueFromLastQuestion"
          >
            <ArrowRight class="h-4 w-4" />
            Continue where you left off
          </Button>

          <!-- Manage button with hover effect -->
          <Link
            v-if="canManage"
            :href="`/manage/papers/${concept.slug}/${paper.slug}`"
            class="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-all duration-200 text-primary border border-primary/15 w-full sm:w-auto shadow-sm hover:shadow group"
          >
            <Settings
              class="h-4 w-4 sm:h-5 sm:w-5 group-hover:rotate-45 transition-transform duration-300"
            />
            <span class="text-sm font-medium">Edit Paper</span>
          </Link>
        </div>
      </div>
    </div>

    <div
      v-if="paper.metadata?.lastEditedBy || paper.createdAt"
      class="text-xs sm:text-sm text-muted-foreground px-1 italic"
    >
      Last edited on {{ getLastEditDate }}
    </div>

    <DisclaimerBanner />

    <!-- Progress Tracking Section -->
    <div
      class="bg-white p-5 sm:p-6 rounded-xl border shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div v-if="paperProgress.progress" class="flex items-center gap-3 mb-4">
        <CheckCircle v-if="hasAttemptedPaper" class="h-5 w-5 text-green-500" />
        <XCircle v-else class="h-5 w-5 text-amber-500" />
        <span class="font-medium text-sm sm:text-base">{{ attemptCountText }}</span>
      </div>

      <div
        v-if="paperProgress.completionPercentage > 0"
        class="p-4 sm:p-5 bg-white/80 rounded-xl border border-primary/10 mb-4"
      >
        <div class="flex justify-between items-center mb-2 sm:mb-3">
          <span class="font-medium text-sm sm:text-base">Your progress</span>
          <span class="text-sm sm:text-base font-semibold"
            >{{ paperProgress.completionPercentage }}%</span
          >
        </div>

        <div class="h-2.5 sm:h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            class="h-full bg-primary rounded-full transition-all duration-500"
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

        <div
          class="mt-2 sm:mt-3 flex justify-between items-center text-xs sm:text-sm text-muted-foreground"
        >
          <span
            >{{ Math.round((paperProgress.completionPercentage * questions.length) / 100) }} of
            {{ questions.length }} questions</span
          >

          <span
            v-if="paperProgress.completionPercentage === 100"
            class="text-green-600 font-medium flex items-center gap-1"
          >
            <CheckCircle class="h-3.5 w-3.5" /> Complete
          </span>
        </div>
      </div>
    </div>

    <!-- Questions List with enhanced spacing and shadows -->
    <div class="space-y-6 sm:space-y-8">
      <div
        v-for="(question, index) in questions"
        :key="question.id"
        :id="`question-${question.id}`"
        class="p-4 sm:p-6 md:p-8 bg-white rounded-xl border shadow-sm hover:shadow-md transition-all duration-300 w-full max-w-full"
      >
        <!-- Question Text with improved typography -->
        <div class="space-y-4 sm:space-y-5">
          <div class="flex flex-col gap-2 sm:gap-3">
            <span
              class="inline-block w-fit px-4 sm:px-5 py-1.5 sm:py-2 bg-primary/15 text-primary rounded-lg font-semibold text-base sm:text-lg shadow-sm"
            >
              Question {{ index + 1 }}
            </span>
            <p
              class="text-foreground pl-1 text-sm sm:text-base md:text-lg break-words leading-relaxed"
            >
              {{ question.questionText }}
            </p>
          </div>

          <!-- Question Image if present -->
          <div v-if="question.questionImagePath" class="flex justify-center mt-4">
            <img
              :src="question.questionImagePath"
              :alt="`Question ${index + 1} image`"
              class="max-w-full h-auto rounded-lg border shadow-sm max-h-[400px] object-contain"
            />
          </div>

          <!-- MCQ Section with enhanced UI -->
          <div v-if="question.isMcq" class="p-auto space-y-4 sm:space-y-5 mt-4 sm:mt-6">
            <!-- Choice Options with subtle animations -->
            <div
              v-for="choice in question.choices"
              :key="choice.id"
              :class="{
                'border-green-500 bg-green-50':
                  selectedAnswers[question.id] === choice.id && choice.isCorrect,
                'border-red-500 bg-red-50':
                  selectedAnswers[question.id] === choice.id && !choice.isCorrect,
                'hover:bg-slate-50 hover:shadow hover:border-primary/30': !showAnswer[question.id],
                'border-transparent': !selectedAnswers[question.id] && !showAnswer[question.id],
              }"
              class="flex items-center gap-4 sm:gap-5 p-4 sm:p-5 rounded-xl border transition-all duration-300 text-sm sm:text-base cursor-pointer group sm:hover:scale-[1.02]"
              @click="handleChoiceSelect(question.id, choice.id)"
            >
              <!-- Icon Container with enhanced visuals -->
              <div
                class="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full group-hover:bg-primary/15 transition-colors duration-300"
              >
                <CheckCircle
                  v-if="showAnswer[question.id] && choice.isCorrect"
                  class="h-5 w-5 text-green-500 sm:scale-110 animate-fadeIn"
                />
                <XCircle
                  v-else-if="
                    showAnswer[question.id] &&
                    selectedAnswers[question.id] === choice.id &&
                    !choice.isCorrect
                  "
                  class="h-5 w-5 text-red-500 sm:scale-110 animate-fadeIn"
                />
                <Circle v-else class="h-5 w-5 text-muted-foreground" />
              </div>

              <!-- Choice Text with improved styling -->
              <span
                :class="{
                  'text-green-700 font-medium': showAnswer[question.id] && choice.isCorrect,
                  'text-red-700 font-medium':
                    showAnswer[question.id] &&
                    selectedAnswers[question.id] === choice.id &&
                    !choice.isCorrect,
                  'text-muted-foreground': !(
                    showAnswer[question.id] &&
                    (choice.isCorrect || selectedAnswers[question.id] === choice.id)
                  ),
                }"
                class="flex-1 break-words transition-colors duration-300 leading-relaxed"
              >
                {{ choice.choiceText }}
              </span>
            </div>

            <!-- EXPLANATION SECTION with card UI -->
            <div v-if="showAnswer[question.id]" class="mt-6 sm:mt-8 animate-fadeIn">
              <!-- Header with elegant design -->
              <div class="flex items-center gap-2 mb-4">
                <div class="h-6 w-1 bg-green-500 rounded-full"></div>
                <h3 class="text-lg font-bold text-gray-800">Solution Explanation</h3>
              </div>

              <!-- Modern card with sidebar accent - WIDER -->
              <div
                class="relative overflow-hidden rounded-xl shadow-lg border border-gray-100 w-full"
              >
                <!-- Left accent border -->
                <div
                  class="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-green-400 to-blue-500"
                ></div>

                <!-- Answer header -->
                <div
                  class="p-4 sm:p-5 md:p-6 bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-100"
                >
                  <div class="flex items-center gap-3">
                    <div
                      class="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600"
                    >
                      <CheckCircle class="h-5 w-5" />
                    </div>
                    <div>
                      <p class="text-sm text-gray-500 font-medium">Correct Answer</p>
                      <p class="text-base sm:text-lg font-semibold text-gray-800">
                        {{ getCorrectAnswer(question)?.choiceText }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Explanation content with visual separation - WIDER -->
                <div class="p-4 sm:p-6 md:p-8 bg-white">
                  <div class="flex gap-3 items-start">
                    <div class="shrink-0 pt-1">
                      <div
                        class="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center"
                      >
                        <Info class="h-3 w-3 text-blue-600" />
                      </div>
                    </div>
                    <div
                      class="text-sm sm:text-base text-gray-700 font-medium break-words leading-relaxed explanation-content w-full"
                    >
                      <ViewExplanation :content="getCorrectAnswer(question)?.explanation || ''" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Feedback Button with enhanced styling -->
              <Button
                variant="outline"
                class="mt-5 sm:mt-6 flex items-center gap-3 sm:gap-4 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 transition-all duration-300 rounded-lg px-5 sm:px-6 py-3 sm:py-3.5 shadow-sm hover:shadow-md group text-xs sm:text-sm w-full sm:w-auto justify-center sm:justify-start animate-fadeIn"
                @click="openFeedbackDialog(question)"
              >
                <div class="p-1.5 rounded-full bg-gray-100 shadow-sm">
                  <MessageSquare
                    class="h-4 w-4 sm:h-5 sm:w-5 opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-300 text-gray-600"
                  />
                </div>
                <span class="font-medium">Provide Feedback</span>
              </Button>
            </div>
          </div>

          <!-- Enhanced SAQ Section with modern card design -->
          <div v-if="question.isSaq" class="mt-5 sm:mt-7 space-y-5 sm:space-y-7">
            <div
              class="bg-gradient-to-r from-primary/5 to-primary/0 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 w-full"
            >
              <!-- SAQ Header with improved styling -->
              <div
                class="flex items-center justify-between px-5 py-4 bg-primary/15 border-b border-primary/10"
              >
                <div class="flex items-center gap-3">
                  <BookOpen class="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  <span class="text-sm sm:text-base font-medium text-primary"
                    >Short Answer Questions</span
                  >
                </div>
                <div
                  class="text-xs sm:text-sm bg-white/70 backdrop-blur-sm px-3 py-1.5 rounded-full text-primary/80 font-medium shadow-sm"
                >
                  {{ question.parts.length }} part{{ question.parts.length > 1 ? 's' : '' }}
                </div>
              </div>

              <!-- SAQ Parts List with hover effects -->
              <div class="divide-y divide-primary/10">
                <div
                  v-for="(part, partIndex) in question.parts"
                  :key="part.id"
                  class="px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 bg-white/80 hover:bg-white/100 transition-all duration-300"
                >
                  <!-- Part Header with Part Number and Marks -->
                  <div class="flex items-center justify-between mb-3 sm:mb-4">
                    <div class="flex items-baseline gap-3">
                      <span
                        class="inline-flex items-center justify-center h-7 w-7 rounded-full bg-primary/15 text-primary text-xs font-semibold shadow-sm"
                      >
                        {{ partIndex + 1 }}
                      </span>
                      <span
                        class="text-xs sm:text-sm text-primary/80 font-medium px-2 py-0.5 bg-primary/5 rounded-md"
                      >
                        {{ part.marks }} mark{{ part.marks > 1 ? 's' : '' }}
                      </span>
                    </div>
                  </div>

                  <!-- Part Text with improved typography -->
                  <div>
                    <p
                      class="text-sm sm:text-base text-foreground break-words mb-4 sm:mb-5 leading-relaxed"
                    >
                      {{ part.partText }}
                    </p>
                  </div>

                  <!-- Show Answer Button with enhanced animation -->
                  <button
                    v-if="!showAnswer[part.id]"
                    @click="handleSaqPartView(question.id, part.id)"
                    class="group w-full sm:w-auto flex items-center justify-center gap-2 mt-3 sm:mt-4 text-primary font-semibold text-xs sm:text-sm rounded-lg p-2.5 sm:p-3 bg-gradient-to-r from-primary/15 to-primary/5 hover:from-primary/25 hover:to-primary/15 border border-primary/20 transition-all duration-300 shadow-sm hover:shadow"
                  >
                    <ChevronDown
                      class="h-4 w-4 group-hover:translate-y-1 transition-transform duration-300"
                    />
                    <span>Show Answer</span>
                  </button>

                  <!-- EXPLANATION SECTION FOR SAQ - WIDER -->
                  <div v-if="showAnswer[part.id]" class="mt-5 sm:mt-6 animate-fadeIn">
                    <!-- Modern card with sidebar accent - WIDER -->
                    <div
                      class="relative overflow-hidden rounded-xl shadow-lg border border-gray-100 w-full"
                    >
                      <!-- Left accent border -->
                      <div
                        class="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-primary to-blue-500"
                      ></div>

                      <!-- Answer header -->
                      <div
                        class="p-4 sm:p-5 md:p-6 bg-gradient-to-r from-primary/5 to-blue-50 border-b border-gray-100"
                      >
                        <div class="flex items-center gap-3">
                          <div
                            class="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary"
                          >
                            <CheckCircle class="h-5 w-5" />
                          </div>
                          <div>
                            <p class="text-sm text-gray-500 font-medium">Expected Answer</p>
                            <p class="text-sm text-primary/80 font-medium">
                              {{ part.marks }} mark{{ part.marks > 1 ? 's' : '' }} available
                            </p>
                          </div>
                        </div>
                      </div>

                      <!-- Explanation content with improved formatting - WIDER -->
                      <div class="p-4 sm:p-6 md:p-8 bg-white">
                        <div
                          class="text-sm sm:text-base text-gray-700 font-medium break-words leading-relaxed explanation-content w-full"
                        >
                          <ViewExplanation :content="part.expectedAnswer" />
                        </div>
                      </div>
                    </div>

                    <!-- Feedback Button -->
                    <Button
                      variant="ghost"
                      class="mt-4 sm:mt-5 flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-300 text-xs sm:text-sm w-full sm:w-auto justify-center sm:justify-start group"
                      @click="openFeedbackDialog(question)"
                    >
                      <MessageSquare
                        class="h-4 w-4 text-gray-600 group-hover:scale-110 transition-all duration-300"
                      />
                      <span class="font-medium">Provide Feedback</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- The progress floating icon -->
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
          class="absolute inset-0 flex items-center justify-center text-xs sm:text-xs font-medium"
          style="font-size: 0.7rem"
        >
          {{ Math.round(paperProgress.completionPercentage) }}%
        </span>
      </div>

      <div class="hidden sm:flex flex-col">
        <span class="text-sm font-medium">Your progress</span>
        <span class="text-xs text-muted-foreground">
          {{ Math.round((paperProgress.completionPercentage * questions.length) / 100) }} of
          {{ questions.length }}
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

  /* Scrolling properties */
  position: relative;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 5px;

  /* Style the scrollbar */
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

  /* Adjust max-height based on screen size */
  @media (min-width: 640px) {
    max-height: 400px;
  }

  @media (min-width: 1024px) {
    max-height: 500px;
  }

  /* Responsive video styling */
  :deep(iframe) {
    max-width: 100%;
    height: auto;
    aspect-ratio: 16/9;
    display: block;
    margin: 1rem auto;
    border-radius: 0.5rem;
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);

    /* Base size for small devices */
    width: 100%;
    max-height: 250px;

    /* Adjust size for medium devices */
    @media (min-width: 640px) {
      width: 90%;
      max-height: 300px;
    }

    /* Adjust size for larger devices */
    @media (min-width: 768px) {
      width: 85%;
      max-height: 350px;
    }

    /* Optional transition for smooth resizing */
    transition: all 0.3s ease;
  }

  /* Create a responsive container for videos if needed */
  :deep(.video-container) {
    position: relative;
    padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
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

/* Improved scrollbar hiding for better mobile experience */
.hide-scrollbar,
:deep(.breadcrumb-trail) {
  max-width: 100%;
  overflow-x: auto;
  scrollbar-width: none; /* For Firefox */
  -ms-overflow-style: none; /* For IE and Edge */
  white-space: nowrap;
  padding-bottom: 4px;
}

.hide-scrollbar::-webkit-scrollbar,
:deep(.breadcrumb-trail::-webkit-scrollbar) {
  display: none; /* For Chrome, Safari, Opera */
}

/* Enhanced animation for smoother transitions */
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

/* Highlight effect for current question */
.highlight-question {
  box-shadow: 0 0 0 3px rgba(var(--color-primary), 0.3);
}
</style>
