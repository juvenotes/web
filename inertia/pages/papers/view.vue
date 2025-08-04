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
const userAnswersLoaded = ref(false)

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
  await initializeUserAnswers()
  userAnswersLoaded.value = true
})

const breadcrumbItems = computed(() => [
  { label: 'Papers', href: '/papers' },
  { label: props.concept.title, href: `/papers/${props.concept.slug}` },
  { label: props.paper.title },
])

const selectedAnswers = reactive<Record<number, number | null>>({})
const showAnswer = reactive<Record<number, boolean>>({})

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
  showAnswer[partId] = true

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
  selectedAnswers[questionId] = choiceId
  showAnswer[questionId] = true

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
  try {
    const response = await axios.get(`/api/papers/${props.paper.id}/my-responses`)
    if (response.data.responses?.length) {
      response.data.responses.forEach(
        (item: { questionId: number; selectedOption: string; partId?: number }) => {
          const question = props.questions.find((q) => q.id === item.questionId)
          if (!question) return

          // MCQ
          if (item.selectedOption && question.choices) {
            const choiceIndex = item.selectedOption.charCodeAt(0) - 65
            if (question.choices[choiceIndex]) {
              selectedAnswers[question.id] = question.choices[choiceIndex].id
              showAnswer[question.id] = true
            }
          }
          // SAQ (if backend provides partId for answered parts)
          if (item.partId) {
            showAnswer[item.partId] = true
          }
        }
      )
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

  <!-- Updated background to match first file -->
  <div class="min-h-screen bg-gray-50/50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <!-- Updated Header Section with animation -->
      <div class="mb-6 sm:mb-10 header-animation">
        <BreadcrumbTrail :items="breadcrumbItems" class="mb-4 sm:mb-5" />

        <!-- Title and Description -->
        <div
          class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-6 mb-5 sm:mb-6"
        >
          <div class="flex items-start gap-3 sm:gap-4 flex-1">
            <div class="flex-shrink-0 mt-0.5">
              <div class="h-10 w-10 rounded-lg bg-[#55A9C4]/10 flex items-center justify-center">
                <FileText class="h-6 w-6 text-[#55A9C4]" />
              </div>
            </div>
            <div>
              <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{{ paper.title }}</h1>
              <p class="text-sm sm:text-base text-gray-600 max-w-3xl leading-relaxed">
                {{ concept.title }} - {{ paper.examType.toUpperCase() }} {{ paper.year }}
              </p>
              <div class="flex items-center gap-2 mt-2 text-sm text-gray-500">
                <Users class="h-4 w-4" />
                <span>{{ attemptCount }} {{ attemptCount === 1 ? 'attempt' : 'attempts' }}</span>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="w-full sm:w-auto flex-shrink-0 flex flex-col gap-2">
            <!-- Continue button -->
            <Button
              v-if="paperProgress.progress?.lastQuestionId"
              class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#55A9C4] hover:bg-[#4795af] transition-colors text-white text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
              @click="continueFromLastQuestion"
            >
              <ArrowRight class="h-4 w-4" />
              <span>Continue</span>
            </Button>

            <!-- Manage Button -->
            <Link
              v-if="canManage"
              :href="`/manage/papers/${concept.slug}/${paper.slug}`"
              class="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#55A9C4] hover:bg-[#4795af] transition-colors text-white text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Settings class="h-4 w-4" />
              <span>Manage Paper</span>
            </Link>
          </div>
        </div>

        <div class="w-12 h-1 bg-gradient-to-r from-[#55A9C4] to-[#55A9C4]/70 rounded-full"></div>
      </div>

      <div
        v-if="paper.metadata?.lastEditedBy || paper.createdAt"
        class="text-xs sm:text-sm text-gray-500 px-2 italic mb-6"
      >
        Last edited on {{ getLastEditDate }}
      </div>

      <!-- Progress Tracking Section -->
      <div
        class="bg-white p-4 sm:p-5 rounded-xl border border-gray-100 shadow-xs hover:shadow-sm transition-all duration-300 mb-6 sm:mb-8"
      >
        <div v-if="paperProgress.progress" class="flex items-center gap-3 mb-3">
          <CheckCircle v-if="hasAttemptedPaper" class="h-5 w-5 text-green-500" />
          <XCircle v-else class="h-5 w-5 text-amber-500" />
          <span class="font-medium text-sm sm:text-base">{{ attemptCountText }}</span>
        </div>

        <div
          v-if="paperProgress.completionPercentage > 0"
          class="p-3 bg-white/80 rounded-lg border border-[#55A9C4]/10 mb-3"
        >
          <div class="flex justify-between items-center mb-2">
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
                  paperProgress.completionPercentage >= 25 &&
                  paperProgress.completionPercentage < 50,
                'bg-blue-500':
                  paperProgress.completionPercentage >= 50 &&
                  paperProgress.completionPercentage < 75,
                'bg-green-500': paperProgress.completionPercentage >= 75,
              }"
            ></div>
          </div>

          <div class="mt-2 flex justify-between items-center text-xs sm:text-sm text-gray-500">
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

      <!-- Questions List -->
      <div class="space-y-5 sm:space-y-6">
        <div
          v-for="(question, index) in questions"
          :key="`${question.id}-${userAnswersLoaded}`"
          :id="`question-${question.id}`"
          class="p-5 sm:p-6 bg-white rounded-xl border border-gray-100 shadow-xs hover:shadow-sm transition-all duration-300"
        >
          <div class="space-y-4">
            <div class="flex flex-col gap-2">
              <span
                class="inline-block w-fit px-3 py-1.5 bg-[#55A9C4]/10 text-[#55A9C4] rounded-lg font-semibold text-base sm:text-lg"
              >
                Question {{ index + 1 }}
              </span>
              <p class="text-gray-900 dark:text-foreground text-sm sm:text-base leading-relaxed">
                {{ question.questionText }}
              </p>
            </div>

            <div v-if="question.questionImagePath" class="flex justify-center mt-4">
              <img
                :src="question.questionImagePath"
                :alt="`Question ${index + 1} image`"
                class="max-w-full h-auto rounded-lg border shadow-sm max-h-[400px] object-contain"
              />
            </div>

            <!-- MCQ options -->
            <div v-if="question.isMcq" class="space-y-3 mt-4">
              <div
                v-for="choice in question.choices"
                :key="choice.id"
                :class="{
                  'border-green-500 bg-green-50':
                    selectedAnswers[question.id] === choice.id && choice.isCorrect,
                  'border-red-500 bg-red-50':
                    selectedAnswers[question.id] === choice.id && !choice.isCorrect,
                  'hover:bg-gray-50 hover:border-[#55A9C4]/30': !showAnswer[question.id],
                  'border-transparent': !selectedAnswers[question.id] && !showAnswer[question.id],
                }"
                class="flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 cursor-pointer"
                @click="handleChoiceSelect(question.id, choice.id)"
              >
                <div class="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full">
                  <CheckCircle
                    v-if="showAnswer[question.id] && choice.isCorrect"
                    class="h-4 w-4 text-green-500"
                  />
                  <XCircle
                    v-else-if="
                      showAnswer[question.id] &&
                      selectedAnswers[question.id] === choice.id &&
                      !choice.isCorrect
                    "
                    class="h-4 w-4 text-red-500"
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
                  class="flex-1 leading-relaxed"
                >
                  {{ choice.choiceText }}
                </span>
              </div>

              <div v-if="showAnswer[question.id]" class="mt-5">
                <div class="flex items-center gap-2 mb-3">
                  <div class="h-5 w-1 bg-green-500 rounded-full"></div>
                  <h3 class="text-base font-bold text-foreground">Solution Explanation</h3>
                </div>

                <div class="relative overflow-hidden rounded-lg shadow-sm border border-border">
                  <div
                    class="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-green-400 to-[#55A9C4]"
                  ></div>

                  <div
                    class="p-3 bg-gradient-to-r from-green-500/10 to-[#55A9C4]/10 border-b border-border"
                  >
                    <div class="flex items-center gap-3">
                      <div
                        class="flex items-center justify-center w-6 h-6 rounded-full bg-green-500/20 text-green-600 dark:text-green-400"
                      >
                        <CheckCircle class="h-4 w-4" />
                      </div>
                      <div>
                        <p class="text-xs text-muted-foreground font-medium">Correct Answer</p>
                        <p class="text-sm sm:text-base font-semibold text-foreground">
                          {{ getCorrectAnswer(question)?.choiceText }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div class="p-4 bg-white">
                    <div class="text-sm text-gray-700 leading-relaxed">
                      <ViewExplanation :content="getCorrectAnswer(question)?.explanation || ''" />
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  class="mt-4 flex items-center gap-2 text-gray-700 border border-gray-200"
                  @click="openFeedbackDialog(question)"
                >
                  <MessageSquare class="h-4 w-4" />
                  <span class="font-medium">Provide Feedback</span>
                </Button>
              </div>
            </div>

            <!-- SAQ section -->
            <div v-if="question.isSaq" class="mt-4">
              <div class="bg-white rounded-lg overflow-hidden shadow-sm border border-[#55A9C4]/20">
                <div
                  class="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#55A9C4]/15 to-[#55A9C4]/5 border-b border-[#55A9C4]/10"
                >
                  <div class="flex items-center gap-2">
                    <BookOpen class="h-4 w-4 text-[#55A9C4]" />
                    <span class="text-sm font-medium text-[#55A9C4]">Short Answer Questions</span>
                  </div>
                  <div
                    class="text-xs bg-white/70 px-2 py-1 rounded-full text-[#55A9C4]/80 font-medium"
                  >
                    {{ question.parts.length }} part{{ question.parts.length > 1 ? 's' : '' }}
                  </div>
                </div>

                <div class="divide-y divide-[#55A9C4]/10">
                  <div v-for="(part, partIndex) in question.parts" :key="part.id" class="p-4">
                    <div class="flex items-center justify-between mb-2">
                      <div class="flex items-baseline gap-2">
                        <span
                          class="inline-flex items-center justify-center h-5 w-5 rounded-full bg-[#55A9C4]/15 text-[#55A9C4] text-xs font-semibold"
                        >
                          {{ partIndex + 1 }}
                        </span>
                        <span
                          class="text-xs text-[#55A9C4]/80 font-medium px-2 py-1 bg-[#55A9C4]/5 rounded-md"
                        >
                          {{ part.marks }} mark{{ part.marks > 1 ? 's' : '' }}
                        </span>
                      </div>
                    </div>

                    <div>
                      <p class="text-sm text-gray-900 leading-relaxed">
                        {{ part.partText }}
                      </p>
                    </div>

                    <button
                      v-if="!showAnswer[part.id]"
                      @click="handleSaqPartView(question.id, part.id)"
                      class="w-full flex items-center justify-center gap-2 mt-3 text-primary font-medium text-sm rounded-md p-2 bg-primary/10 border border-primary/20"
                    >
                      <ChevronDown class="h-4 w-4" />
                      <span>Show Answer</span>
                    </button>

                    <div v-if="showAnswer[part.id]" class="mt-4">
                      <div
                        class="relative overflow-hidden rounded-lg shadow-sm border border-border"
                      >
                        <div
                          class="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#55A9C4] to-blue-500"
                        ></div>

                        <div
                          class="p-3 bg-gradient-to-r from-[#55A9C4]/15 to-blue-500/10 border-b border-border"
                        >
                          <div class="flex items-center gap-2">
                            <div
                              class="flex items-center justify-center w-5 h-5 rounded-full bg-[#55A9C4]/20 text-[#55A9C4] dark:text-[#7AC7E3]"
                            >
                              <CheckCircle class="h-3 w-3" />
                            </div>
                            <div>
                              <p class="text-xs text-muted-foreground font-medium">
                                Expected Answer
                              </p>
                              <p class="text-xs text-[#55A9C4] dark:text-[#7AC7E3] font-medium">
                                {{ part.marks }} mark{{ part.marks > 1 ? 's' : '' }} available
                              </p>
                            </div>
                          </div>
                        </div>

                        <div class="p-4 bg-background">
                          <div class="text-sm text-gray-700 leading-relaxed">
                            <ViewExplanation :content="part.expectedAnswer" />
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        class="mt-3 flex items-center gap-2 text-gray-600 hover:text-gray-900"
                        @click="openFeedbackDialog(question)"
                      >
                        <MessageSquare class="h-4 w-4" />
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
        class="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg border border-[#55A9C4]/20 flex items-center gap-3 p-3 z-50"
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

        <div class="flex flex-col">
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
          class="p-1"
        >
          <ArrowRight class="h-3 w-3 mr-1" />
          <span class="text-xs">Continue</span>
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Header animation from first file */
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

/* Base typography */
html {
  font-family:
    'Inter',
    system-ui,
    -apple-system,
    sans-serif;
}
@supports (font-variation-settings: normal) {
  html {
    font-family:
      'Inter var',
      system-ui,
      -apple-system,
      sans-serif;
  }
}

/* Improved touch targets */
@media (max-width: 640px) {
  .group {
    min-height: 56px;
  }

  .max-w-7xl {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

.highlight-question {
  box-shadow: 0 0 0 3px rgba(85, 169, 196, 0.3);
  transition: box-shadow 0.3s ease;
}

/* Enhanced explanation content styling */
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

  /* Scrollbar styling */
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: #f8f8f8;
  }
  &::-webkit-scrollbar-thumb {
    background: #d1d1d1;
    border-radius: 2px;
    &:hover {
      background: #b8b8b8;
    }
  }

  @media (min-width: 640px) {
    max-height: 350px;
  }
  @media (min-width: 1024px) {
    max-height: 500px;
  }

  /* Embedded content styling */
  :deep(iframe) {
    max-width: 100%;
    aspect-ratio: 16/9;
    margin: 1rem auto;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }

  :deep(.video-container) {
    position: relative;
    padding-bottom: 56.25%;
    height: 0;
    overflow: hidden;
    margin: 1rem 0;
    border-radius: 0.5rem;
    iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  }

  /* Table styling */
  :deep(table) {
    width: 100%;
    font-size: 0.75rem;
    border-collapse: collapse;
    margin-bottom: 0.5rem;
    display: block;
    overflow-x: auto;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;

    &::-webkit-scrollbar {
      height: 4px;
    }
    &::-webkit-scrollbar-track {
      background: #f8f8f8;
    }
    &::-webkit-scrollbar-thumb {
      background: #d1d1d1;
      border-radius: 2px;
    }
  }

  :deep(th) {
    background-color: rgba(85, 169, 196, 0.1);
    color: #444;
    font-weight: 600;
    padding: 0.5rem;
    text-align: left;
    border: 1px solid rgba(85, 169, 196, 0.2);
  }

  :deep(td) {
    padding: 0.5rem;
    border: 1px solid rgba(85, 169, 196, 0.1);
  }
}

/* Mobile table adjustments */
@media (max-width: 640px) {
  .explanation-content {
    :deep(table) {
      font-size: 0.7rem;
    }
    :deep(th),
    :deep(td) {
      padding: 0.3rem;
    }
  }
}

/* Hide scrollbar utility */
.hide-scrollbar {
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
}

/* Animations */
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

/* Question highlight effect */
.highlight-question {
  box-shadow: 0 0 0 3px rgba(85, 169, 196, 0.3);
  transition: box-shadow 0.3s ease;
}

/* Smooth transitions for interactive elements */
a,
button,
.transition-all {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  :deep(.breadcrumb-trail) {
    font-size: 0.875rem;
  }
}
</style>
