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
}

const props = defineProps<Props>()

const breadcrumbItems = computed(() => [
  { label: 'Papers', href: '/papers' },
  { label: props.concept.title, href: `/papers/${props.concept.slug}` },
  { label: props.paper.title },
])

const selectedAnswers = ref<Record<number, number | null>>({}) // to track selected answers
const showAnswer = ref<Record<number, boolean>>({}) // to show the answer explanation

// Record answer to the server
async function recordResponse(questionId: number, choiceId: number, isCorrect: boolean) {
  try {
    await axios.post('/api/papers/record-response', {
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
    recordResponse(questionId, choiceId, choice.isCorrect).then(() => {
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
  <FeedbackDialog
    v-model:open="feedbackDialog.isOpen"
    :question="feedbackDialog.question"
    @close="closeFeedbackDialog"
  />
  <div class="max-w-7xl mx-auto px-1 sm:px-6 lg:px-8 py-6 space-y-8">
    <!-- Header section -->
    <div class="relative p-6 sm:p-8 bg-white/50 rounded-2xl border shadow-sm">
      <div
        class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-primary/50 to-transparent"
      />

      <BreadcrumbTrail :items="breadcrumbItems" />

      <!-- Paper Info -->
      <div class="mt-4 flex flex-col sm:flex-row gap-4 sm:items-start justify-between">
        <div class="flex items-start gap-4">
          <div class="p-3 rounded-xl bg-primary/5 border border-primary/10 shrink-0">
            <FileText class="h-6 w-6 text-primary" />
          </div>
          <div class="min-w-0 flex-1">
            <h1 class="text-xl sm:text-2xl font-bold text-foreground truncate">
              {{ paper.title }}
            </h1>
            <div class="flex flex-wrap items-center gap-2 mt-1">
              <span class="text-sm text-muted-foreground truncate max-w-[200px]">
                {{ concept.title }}
              </span>
              <span class="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                {{ paper.examType.toUpperCase() }}
              </span>
              <span class="text-sm text-muted-foreground">{{ paper.year }}</span>
              <span class="flex items-center gap-1 text-sm text-muted-foreground">
                <Users class="h-3 w-3" />
                {{ attemptCount }} {{ attemptCount === 1 ? 'attempt' : 'attempts' }}
              </span>
            </div>
            <!-- <div
              v-if="progress?.lastVisitedAt"
              class="flex items-center gap-1 mt-1 text-xs text-muted-foreground"
            >
              <Clock class="h-3 w-3" />
              Last visited {{ new Date(progress.lastVisitedAt).toLocaleDateString() }}
            </div> -->
          </div>
        </div>
        <!-- Action buttons -->
        <div class="flex flex-wrap gap-2">
          <!-- Continue button -->
          <Button
            v-if="paperProgress.progress?.lastQuestionId"
            variant="default"
            class="flex items-center gap-1.5"
            @click="continueFromLastQuestion"
          >
            <ArrowRight class="h-4 w-4" />
            Continue where you left off
          </Button>

          <!-- Manage button -->
          <Link
            v-if="canManage"
            :href="`/manage/papers/${concept.slug}/${paper.slug}`"
            class="flex items-center justify-center gap-2 px-4 py-2 rounded-lg hover:bg-primary/5 transition-colors text-primary border border-primary/10 w-full sm:w-auto"
          >
            <Settings class="h-4 w-4" />
            <span class="text-sm font-medium">Edit</span>
          </Link>
        </div>
      </div>
    </div>

    <div
      v-if="paper.metadata?.lastEditedBy || paper.createdAt"
      class="text-sm text-muted-foreground"
    >
      Last edited on {{ getLastEditDate }}
    </div>

    <DisclaimerBanner />

    <div class="bg-white p-6 rounded-xl border mb-6">
      <div v-if="paperProgress.progress" class="flex items-center gap-2 mb-4">
        <CheckCircle v-if="hasAttemptedPaper" class="h-5 w-5 text-green-500" />
        <XCircle v-else class="h-5 w-5 text-amber-500" />
        <span class="font-medium">{{ attemptCountText }}</span>
      </div>

      <div
        v-if="paperProgress.completionPercentage > 0"
        class="p-4 bg-white rounded-xl border mb-4"
      >
        <div class="flex justify-between items-center mb-2">
          <span class="font-medium text-sm">Your progress</span>
          <span class="text-sm font-semibold">{{ paperProgress.completionPercentage }}%</span>
        </div>

        <div class="h-2.5 bg-gray-200 rounded-full">
          <div
            class="h-2.5 bg-primary rounded-full transition-all duration-300"
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

        <div class="mt-2 flex justify-between items-center text-xs text-muted-foreground">
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

    <!-- Questions List -->
    <div class="space-y-6">
      <div
        v-for="(question, index) in questions"
        :key="question.id"
        :id="`question-${question.id}`"
        class="p-4 sm:p-6 bg-white rounded-xl border"
      >
        <!-- Question Text -->
        <div class="space-y-4">
          <div class="flex flex-col gap-2">
            <span
              class="inline-block w-fit px-4 py-1.5 bg-primary/10 text-primary rounded-lg font-semibold text-lg"
            >
              Question {{ index + 1 }}
            </span>
            <p class="text-foreground pl-1">{{ question.questionText }}</p>
          </div>

          <!-- MCQ Section -->
          <div v-if="question.isMcq" class="p-auto space-y-3">
            <!-- Choice Options -->
            <div
              v-for="choice in question.choices"
              :key="choice.id"
              :class="{
                'border-green-500': selectedAnswers[question.id] === choice.id && choice.isCorrect,
                'border-red-500': selectedAnswers[question.id] === choice.id && !choice.isCorrect,
                'hover:bg-slate-50': !showAnswer[question.id],
                'border-transparent': !selectedAnswers[question.id] && !showAnswer[question.id],
              }"
              class="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-150"
              @click="handleChoiceSelect(question.id, choice.id)"
            >
              <!-- Icon Container -->
              <div class="flex-shrink-0 w-5 h-5 flex items-center justify-center">
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
                <Circle v-else class="h-4 w-4 text-muted-foreground" />
              </div>
              <!-- Choice Text -->
              <span class="text-muted-foreground flex-1">{{ choice.choiceText }}</span>
            </div>

            <!-- Explanation Section -->
            <div
              v-if="showAnswer[question.id]"
              class="mt-4 p-3 sm:p-6 rounded-lg bg-[#CDE5ED] shadow-md border border-[#A8D3E7]"
            >
              <p class="text-lg font-semibold text-foreground">
                <strong>Correct Answer:</strong> {{ getCorrectAnswer(question)?.choiceText }}
              </p>
              <p class="mt-2 text-base text-muted-foreground text-[#1F2937] font-medium">
                <ViewExplanation :content="getCorrectAnswer(question)?.explanation || ''" />
              </p>
            </div>

            <!-- Feedback Button -->
            <Button
              v-if="showAnswer[question.id]"
              variant="outline"
              class="mt-4 flex items-center gap-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 border border-blue-200 transition-all duration-200 rounded-lg px-5 py-2.5 shadow-sm hover:shadow group"
              @click="openFeedbackDialog(question)"
            >
              <MessageSquare
                class="h-4.5 w-4.5 opacity-75 group-hover:scale-110 group-hover:opacity-100 transition-all duration-200"
              />
              <span class="font-medium">Provide Feedback</span>
            </Button>
          </div>

          <!-- SAQ Section -->
          <div v-if="question.isSaq" class="pl-2 sm:pl-10 space-y-4">
            <div
              v-for="part in question.parts"
              :key="part.id"
              class="border-l-2 border-primary/20 pl-4"
            >
              <!-- Part Text and Marks -->
              <p class="text-foreground">{{ part.partText }}</p>
              <p class="text-xs text-primary mt-1">{{ part.marks }} marks</p>

              <!-- Show Answer Button for Each Part -->
              <button
                v-if="!showAnswer[part.id]"
                @click="handleSaqPartView(question.id, part.id)"
                class="mt-3 text-primary font-semibold text-sm rounded-lg p-2 bg-[#CDE5ED]"
              >
                Show Answer
              </button>

              <!-- Explanation Section for Each Part -->
              <div
                v-if="showAnswer[part.id]"
                class="mt-4 p-3 sm:p-6 bg-[#CDE5ED] shadow-md rounded-lg border border-[#A8D3E7]"
              >
                <p class="text-base text-muted-foreground text-[#1F2937] font-medium">
                  <strong>Explanation:</strong>
                  <ViewExplanation :content="part.expectedAnswer" />
                </p>
              </div>
              <!-- Feedback Button -->
              <Button
                v-if="showAnswer[part.id]"
                variant="outline"
                class="mt-4 flex items-center gap-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 border border-blue-200 transition-all duration-200 rounded-lg px-5 py-2.5 shadow-sm hover:shadow group"
                @click="openFeedbackDialog(question)"
              >
                <MessageSquare class="h-4 w-4 text-gray-700 transition-colors" />
                <span class="font-medium">Provide Feedback</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- The progress floating icon -->
    <div
      v-if="paperProgress.completionPercentage > 0"
      class="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 border border-primary/20 flex items-center gap-3 z-50 transition-all duration-300 hover:shadow-xl"
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
        <span class="absolute inset-0 flex items-center justify-center text-xs font-medium">
          {{ Math.round(paperProgress.completionPercentage) }}%
        </span>
      </div>

      <div class="flex flex-col">
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
      >
        <ArrowRight class="h-4 w-4 mr-1" />
        Continue
      </Button>
    </div>
    <!-- The progress floating icon - with enhanced mobile responsiveness -->
    <!-- <div
      v-if="paperProgress.completionPercentage > 0"
      class="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg border border-primary/20 z-50 transition-all duration-300 hover:shadow-xl"
      :class="{
        'p-2 sm:p-4': true,
        'w-14 h-14 sm:w-auto sm:h-auto': true,
        'flex sm:flex-row flex-col items-center sm:gap-3 gap-1': true,
      }"
    >
      <div class="w-8 h-8 sm:w-10 sm:h-10 relative">
        <svg class="w-full h-full -rotate-90 transform">
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
        <span class="absolute inset-0 flex items-center justify-center text-xs font-medium">
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
        class="hidden sm:flex"
        @click="continueFromLastQuestion"
      >
        <ArrowRight class="h-4 w-4 mr-1" />
        Continue
      </Button>

      <Button
        v-if="paperProgress.progress?.lastQuestionId"
        size="icon"
        variant="ghost"
        class="sm:hidden absolute -top-2 -right-2 h-6 w-6 bg-primary text-white rounded-full p-1"
        @click="continueFromLastQuestion"
      >
        <ArrowRight class="h-4 w-4" />
      </Button>
    </div> -->
  </div>
</template>
<style scoped>
.highlight-question {
  animation: highlight 1.5s ease-in-out;
}

@keyframes highlight {
  0%,
  100% {
    box-shadow: none;
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(var(--color-primary), 0.4);
    transform: scale(1.02);
  }
}

.explanation-content {
  :deep(ol) {
    list-style-type: decimal;
    margin-left: 1.5rem;
    margin-top: 0.5rem;
  }

  :deep(ul) {
    list-style-type: disc;
    margin-left: 1.5rem;
    margin-top: 0.5rem;
  }

  :deep(li) {
    margin-bottom: 0.25rem;
  }

  :deep(hr) {
    margin: 1rem 0;
    border-top: 1px dashed #a8d3e7;
  }
}
</style>
