<script setup lang="ts">
import type ConceptDto from '#dtos/concept'
import type PastPaperDto from '#dtos/past_paper'
import type QuestionDto from '#dtos/question'
import type UserPaperProgressDto from '#dtos/user_paper_progress'
import type UserStudySessionDto from '#dtos/user_study_session'
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
  Users,
  ArrowRight,
} from 'lucide-vue-next'
import { computed, ref, onMounted, reactive } from 'vue'
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

onMounted(async () => {
  if (!studySession.value) {
    try {
      const response = await axios.post('/api/study-sessions', {
        resourceType: 'paper',
        resourceId: props.paper.id,
      })
      studySession.value = response.data
    } catch (error) {
      console.error('Failed to create study session:', error)
    }
  }

  if ((paperProgress.progress?.attemptCount ?? 0) > 0) {
    initializeUserAnswers()
  }
})

const breadcrumbItems = computed(() => [
  { label: 'Papers', href: '/papers' },
  { label: props.concept.title, href: `/papers/${props.concept.slug}` },
  { label: props.paper.title },
])

const selectedAnswers = ref<Record<number, number | null>>({})
const showAnswer = ref<Record<number, boolean>>({})

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

const continueFromLastQuestion = () => {
  if (!paperProgress.progress || !paperProgress.progress.lastQuestionId) {
    return
  }

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

const initializeUserAnswers = async () => {
  if (!paperProgress.progress?.attemptCount) return

  try {
    const response = await axios.get(`/api/papers/${props.paper.id}/my-responses`)
    if (response.data.responses?.length) {
      response.data.responses.forEach((item: { questionId: number; selectedOption: string }) => {
        const question = props.questions.find((q) => q.id === item.questionId)
        if (!question) return

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
  <!-- Further increased width by changing from max-w-5xl to max-w-6xl -->
  <div class="max-w-6xl mx-auto px-1 sm:px-2 py-5 space-y-5 font-sans">
    <!-- Header Section with reduced padding -->
    <div
      class="relative p-2 sm:p-3 bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300"
    >
      <!-- Gradient Top Border -->
      <div
        class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#55A9C4] via-[#55A9C4]/50 to-transparent rounded-t-2xl"
      />

      <BreadcrumbTrail
        :items="breadcrumbItems"
        class="max-w-full overflow-x-auto pb-1 hide-scrollbar text-xs sm:text-sm"
      />

      <!-- Paper Info -->
      <div class="mt-4 flex flex-col sm:flex-row sm:items-start gap-4">
        <div class="flex items-start gap-3 flex-1">
          <div
            class="p-2 rounded-xl bg-[#55A9C4]/10 border border-[#55A9C4]/20 hover:bg-[#55A9C4]/20 transition-colors duration-200"
          >
            <FileText class="h-5 w-5 text-[#55A9C4]" />
          </div>
          <div class="min-w-0 flex-1">
            <h1 class="text-xl sm:text-2xl font-semibold text-gray-900 truncate">
              {{ paper.title }}
            </h1>
            <div class="flex flex-wrap items-center gap-2 mt-1">
              <span class="text-sm text-gray-500 truncate max-w-[180px] sm:max-w-[250px]">
                {{ concept.title }}
              </span>
              <span
                class="px-2 py-0.5 text-xs font-semibold bg-[#55A9C4]/15 text-[#55A9C4] rounded-full shadow-sm"
              >
                {{ paper.examType.toUpperCase() }}
              </span>
              <span class="text-sm text-gray-500">{{ paper.year }}</span>
              <span class="flex items-center gap-1 text-sm text-gray-500">
                <Users class="h-3 w-3" />
                {{ attemptCount }} {{ attemptCount === 1 ? 'attempt' : 'attempts' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="w-full sm:w-auto mt-3 sm:mt-0 space-y-2">
          <!-- Continue button -->
          <Button
            v-if="paperProgress.progress?.lastQuestionId"
            class="flex items-center gap-1.5 w-full sm:w-auto bg-[#55A9C4] hover:bg-[#55A9C4]/90 text-white"
            @click="continueFromLastQuestion"
          >
            <ArrowRight class="h-4 w-4" />
            <span>Continue where you left off</span>
          </Button>

          <!-- Manage button -->
          <Link
            v-if="canManage"
            :href="`/manage/papers/${concept.slug}/${paper.slug}`"
            class="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#55A9C4] hover:bg-[#55A9C4]/90 text-white border border-[#55A9C4] text-sm font-medium hover:shadow-md transition-all duration-200 group"
          >
            <Settings class="h-4 w-4 transition-transform duration-500 group-hover:rotate-180" />
            <span>Edit Paper</span>
          </Link>
        </div>
      </div>
    </div>

    <div
      v-if="paper.metadata?.lastEditedBy || paper.createdAt"
      class="text-xs sm:text-sm text-gray-500 px-1 italic"
    >
      Last edited on {{ getLastEditDate }}
    </div>

    <DisclaimerBanner />

    <!-- Progress Tracking Section with reduced padding -->
    <div
      class="bg-white p-2 sm:p-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div v-if="paperProgress.progress" class="flex items-center gap-3 mb-3">
        <CheckCircle v-if="hasAttemptedPaper" class="h-5 w-5 text-green-500" />
        <XCircle v-else class="h-5 w-5 text-amber-500" />
        <span class="font-medium text-sm sm:text-base">{{ attemptCountText }}</span>
      </div>

      <div
        v-if="paperProgress.completionPercentage > 0"
        class="p-2 bg-white/80 rounded-xl border border-[#55A9C4]/10 mb-3"
      >
        <div class="flex justify-between items-center mb-1">
          <span class="font-medium text-sm sm:text-base">Your progress</span>
          <span class="text-sm sm:text-base font-semibold">
            {{ paperProgress.completionPercentage }}%
          </span>
        </div>

        <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
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

        <div class="mt-1 flex justify-between items-center text-xs sm:text-sm text-gray-500">
          <span>
            {{ Math.round((paperProgress.completionPercentage * questions.length) / 100) }} of
            {{ questions.length }} questions
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

    <!-- Questions List with reduced padding -->
    <div class="space-y-4 sm:space-y-5 w-full">
      <div
        v-for="(question, index) in questions"
        :key="question.id"
        :id="`question-${question.id}`"
        class="p-2 sm:p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 w-full"
      >
        <div class="space-y-3">
          <div class="flex flex-col gap-1">
            <span
              class="inline-block w-fit px-2 py-1 bg-[#55A9C4]/15 text-[#55A9C4] rounded-lg font-semibold text-base sm:text-lg shadow-sm"
            >
              Question {{ index + 1 }}
            </span>
            <p class="text-gray-900 pl-1 text-sm sm:text-base break-words leading-relaxed">
              {{ question.questionText }}
            </p>
          </div>

          <div v-if="question.questionImagePath" class="flex justify-center mt-3">
            <img
              :src="question.questionImagePath"
              :alt="`Question ${index + 1} image`"
              class="max-w-full h-auto rounded-lg border shadow-sm max-h-[400px] object-contain"
            />
          </div>

          <!-- MCQ options with reduced padding -->
          <div v-if="question.isMcq" class="p-auto space-y-2 sm:space-y-3 mt-3">
            <div
              v-for="choice in question.choices"
              :key="choice.id"
              :class="{
                'border-green-500 bg-green-50':
                  selectedAnswers[question.id] === choice.id && choice.isCorrect,
                'border-red-500 bg-red-50':
                  selectedAnswers[question.id] === choice.id && !choice.isCorrect,
                'hover:bg-gray-50 hover:shadow hover:border-[#55A9C4]/30': !showAnswer[question.id],
                'border-transparent': !selectedAnswers[question.id] && !showAnswer[question.id],
              }"
              class="flex items-center gap-2 p-2 rounded-lg border transition-all duration-300 text-sm cursor-pointer group sm:hover:scale-[1.01]"
              @click="handleChoiceSelect(question.id, choice.id)"
            >
              <div
                class="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full group-hover:bg-[#55A9C4]/15 transition-colors duration-300"
              >
                <CheckCircle
                  v-if="showAnswer[question.id] && choice.isCorrect"
                  class="h-4 w-4 text-green-500 sm:scale-110 animate-fadeIn"
                />
                <XCircle
                  v-else-if="
                    showAnswer[question.id] &&
                    selectedAnswers[question.id] === choice.id &&
                    !choice.isCorrect
                  "
                  class="h-4 w-4 text-red-500 sm:scale-110 animate-fadeIn"
                />
                <Circle v-else class="h-4 w-4 text-gray-400" />
              </div>

              <span
                :class="{
                  'text-green-700 font-medium': showAnswer[question.id] && choice.isCorrect,
                  'text-red-700 font-medium':
                    showAnswer[question.id] &&
                    selectedAnswers[question.id] === choice.id &&
                    !choice.isCorrect,
                  'text-gray-700': !(
                    showAnswer[question.id] &&
                    (choice.isCorrect || selectedAnswers[question.id] === choice.id)
                  ),
                }"
                class="flex-1 break-words transition-colors duration-300 leading-relaxed"
              >
                {{ choice.choiceText }}
              </span>
            </div>

            <div v-if="showAnswer[question.id]" class="mt-4 sm:mt-5 animate-fadeIn">
              <div class="flex items-center gap-2 mb-2">
                <div class="h-5 w-1 bg-green-500 rounded-full"></div>
                <h3 class="text-base font-bold text-gray-800">Solution Explanation</h3>
              </div>

              <div class="relative overflow-hidden rounded-lg shadow-lg border border-gray-100 w-full">
                <div
                  class="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-green-400 to-[#55A9C4]"
                ></div>

                <div class="p-2 bg-gradient-to-r from-green-50 to-[#55A9C4]/10 border-b border-gray-100">
                  <div class="flex items-center gap-2">
                    <div
                      class="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600"
                    >
                      <CheckCircle class="h-4 w-4" />
                    </div>
                    <div>
                      <p class="text-xs text-gray-500 font-medium">Correct Answer</p>
                      <p class="text-sm sm:text-base font-semibold text-gray-800">
                        {{ getCorrectAnswer(question)?.choiceText }}
                      </p>
                    </div>
                  </div>
                </div>

                <div class="p-2 sm:p-3 bg-white">
                  <div
                    class="text-sm text-gray-700 font-medium break-words leading-relaxed explanation-content w-full pt-1"
                  >
                    <ViewExplanation :content="getCorrectAnswer(question)?.explanation || ''" />
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                class="mt-3 sm:mt-4 flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 transition-all duration-300 rounded-lg px-3 py-1.5 shadow-sm hover:shadow-md group text-xs sm:text-sm w-full sm:w-auto justify-center sm:justify-start animate-fadeIn"
                @click="openFeedbackDialog(question)"
              >
                <div class="p-1 rounded-full bg-gray-100 shadow-sm">
                  <MessageSquare
                    class="h-3 w-3 sm:h-4 sm:w-4 opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-300 text-gray-600"
                  />
                </div>
                <span class="font-medium">Provide Feedback</span>
              </Button>
            </div>
          </div>

          <!-- SAQ section with improved visual design -->
          <div v-if="question.isSaq" class="mt-3 space-y-3">
            <div
              class="bg-white rounded-lg overflow-hidden shadow-sm border border-[#55A9C4]/20 hover:shadow-md transition-all duration-300 w-full"
            >
              <div
                class="flex items-center justify-between px-2 py-2 bg-gradient-to-r from-[#55A9C4]/15 to-[#55A9C4]/5 border-b border-[#55A9C4]/10"
              >
                <div class="flex items-center gap-2">
                  <BookOpen class="h-4 w-4 text-[#55A9C4]" />
                  <span class="text-sm font-medium text-[#55A9C4]">Short Answer Questions</span>
                </div>
                <div
                  class="text-xs bg-white/70 backdrop-blur-sm px-2 py-0.5 rounded-full text-[#55A9C4]/80 font-medium shadow-sm"
                >
                  {{ question.parts.length }} part{{ question.parts.length > 1 ? 's' : '' }}
                </div>
              </div>

              <div class="divide-y divide-[#55A9C4]/10">
                <div
                  v-for="(part, partIndex) in question.parts"
                  :key="part.id"
                  class="p-2 bg-white hover:bg-[#55A9C4]/5 transition-all duration-300 w-full"
                >
                  <div class="flex items-center justify-between mb-1.5">
                    <div class="flex items-baseline gap-2">
                      <span
                        class="inline-flex items-center justify-center h-5 w-5 rounded-full bg-[#55A9C4]/15 text-[#55A9C4] text-xs font-semibold shadow-sm"
                      >
                        {{ partIndex + 1 }}
                      </span>
                      <span
                        class="text-xs text-[#55A9C4]/80 font-medium px-1.5 py-0.5 bg-[#55A9C4]/5 rounded-md"
                      >
                        {{ part.marks }} mark{{ part.marks > 1 ? 's' : '' }}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p class="text-sm text-gray-900 break-words mb-2 leading-relaxed pl-1">
                      {{ part.partText }}
                    </p>
                  </div>

                  <button
                    v-if="!showAnswer[part.id]"
                    @click="handleSaqPartView(question.id, part.id)"
                    class="group w-full flex items-center justify-center gap-1.5 mt-1.5 text-[#55A9C4] font-medium text-xs rounded-md p-1.5 bg-gradient-to-r from-[#55A9C4]/10 to-[#55A9C4]/5 hover:from-[#55A9C4]/20 hover:to-[#55A9C4]/10 border border-[#55A9C4]/10 transition-all duration-300 shadow-sm hover:shadow"
                  >
                    <ChevronDown
                      class="h-3 w-3 group-hover:translate-y-0.5 transition-transform duration-300"
                    />
                    <span>Show Answer</span>
                  </button>

                  <div v-if="showAnswer[part.id]" class="mt-2 animate-fadeIn">
                    <div
                      class="relative overflow-hidden rounded-lg shadow-sm border border-gray-100 w-full"
                    >
                      <div
                        class="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#55A9C4] to-blue-500"
                      ></div>

                      <div
                        class="p-1.5 bg-gradient-to-r from-[#55A9C4]/5 to-blue-50 border-b border-gray-100"
                      >
                        <div class="flex items-center gap-1.5">
                          <div
                            class="flex items-center justify-center w-5 h-5 rounded-full bg-[#55A9C4]/20 text-[#55A9C4]"
                          >
                            <CheckCircle class="h-3 w-3" />
                          </div>
                          <div>
                            <p class="text-xs text-gray-500 font-medium">Expected Answer</p>
                            <p class="text-xs text-[#55A9C4]/80 font-medium">
                              {{ part.marks }} mark{{ part.marks > 1 ? 's' : '' }} available
                            </p>
                          </div>
                        </div>
                      </div>

                      <div class="p-2 bg-white/80 w-full">
                        <div
                          class="text-sm text-gray-700 break-words leading-relaxed explanation-content w-full"
                        >
                          <ViewExplanation :content="part.expectedAnswer" />
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      class="mt-1.5 flex items-center gap-1.5 px-2 py-1 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-300 text-xs w-full justify-center sm:justify-start group"
                      @click="openFeedbackDialog(question)"
                    >
                      <MessageSquare
                        class="h-3 w-3 text-gray-600 group-hover:scale-110 transition-all duration-300"
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

    <!-- Floating Progress Indicator -->
    <div
      v-if="paperProgress.completionPercentage > 0"
      class="fixed bottom-3 right-3 bg-white shadow-lg rounded-lg border border-[#55A9C4]/20 flex items-center gap-2 z-50 transition-all duration-300 hover:shadow-xl group"
      :class="{
        'p-1.5 sm:p-2': true,
        'sm:hover:w-auto hover:w-9': true,
      }"
    >
      <div class="w-8 h-8 relative">
        <svg class="w-8 h-8 -rotate-90 transform">
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
        <span
          class="absolute inset-0 flex items-center justify-center text-xs font-medium"
          style="font-size: 0.65rem"
        >
          {{ Math.round(paperProgress.completionPercentage) }}%
        </span>
      </div>

      <div class="hidden sm:flex flex-col">
        <span class="text-xs font-medium">Your progress</span>
        <span class="text-xs text-gray-500">
          {{ Math.round((paperProgress.completionPercentage * questions.length) / 100) }} of
          {{ questions.length }}
        </span>
      </div>

      <Button
        v-if="paperProgress.progress?.lastQuestionId"
        size="sm"
        variant="ghost"
        @click="continueFromLastQuestion"
        class="hidden sm:flex p-1"
      >
        <ArrowRight class="h-3 w-3 mr-1" />
        <span class="text-xs">Continue</span>
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

  /* Vertical scrollbar styling */
  &::-webkit-scrollbar {
    width: 3px;
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

  @media (min-width: 640px) {
    max-height: 350px;
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
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
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

  /* Table styling with visible horizontal scrollbar */
  :deep(table) {
    width: 100%;
    font-size: 0.75rem;
    border-collapse: collapse;
    margin-bottom: 0.5rem;
    display: block;
    overflow-x: auto;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */

    /* Horizontal scrollbar styling */
    &::-webkit-scrollbar {
      height: 4px;
      width: 4px; /* For vertical scrollbar if needed */
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
}

/* Mobile responsive adjustments */
@media (max-width: 640px) {
  .explanation-content {
    :deep(table) {
      font-size: 0.7rem;
    }

    :deep(th),
    :deep(td) {
      padding: 0.2rem 0.3rem;
    }
  }
}

/* For elements where you actually want to hide scrollbar */
.hide-scrollbar,
:deep(.breadcrumb-trail) {
  max-width: 100%;
  overflow-x: auto;
  white-space: nowrap;
  padding-bottom: 4px;

  /* If you want to KEEP these hidden */
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
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
