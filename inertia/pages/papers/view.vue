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
  Clock,
} from 'lucide-vue-next'
import { computed, ref, onMounted } from 'vue'
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

// Continue from last question logic
// const continueFromLastQuestion = () => {
//   console.log('Continue function called', props.progress)

//   if (!props.progress?.lastQuestionId) {
//     console.log('No lastQuestionId to continue from')
//     return
//   }

//   const questionIndex = props.questions.findIndex((q) => q.id === props.progress.lastQuestionId)

//   console.log('Found question at index:', questionIndex, 'with ID:', props.progress.lastQuestionId)

//   if (questionIndex === -1) return

//   // Add a slightly longer timeout to ensure DOM is ready
//   setTimeout(() => {
//     const element = document.getElementById(`question-${props.progress.lastQuestionId}`)
//     console.log('Found element:', element)

//     if (element) {
//       element.scrollIntoView({ behavior: 'smooth' })
//       element.classList.add('highlight-question')
//       setTimeout(() => element.classList.remove('highlight-question'), 2000)
//     }
//   }, 500) // Increased from 300ms to 500ms for reliability
// }

// Record answer to the server
async function recordResponse(questionId: number, choiceId: number, isCorrect: boolean) {
  try {
    // Find the question and determine the index of the selected choice
    const question = props.questions.find((q) => q.id === questionId)
    if (!question) return

    const choiceIndex = question.choices.findIndex((c) => c.id === choiceId)
    if (choiceIndex === -1) return

    // Convert index to letter (0 → 'A', 1 → 'B', etc.)
    const letterChoice = String.fromCharCode(65 + choiceIndex)

    await axios.post('/api/papers/record-response', {
      paperId: props.paper.id,
      questionId,
      choiceId: letterChoice, // Now sending 'A', 'B', etc. instead of numeric ID
      isCorrect,
    })
  } catch (error) {
    console.error('Failed to record response', error)
  }
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
    recordResponse(questionId, choiceId, choice.isCorrect)
  }
}

// Mark all questions user has previously answered
// const initializeUserAnswers = async () => {
//   if (!props.progress?.attemptCount) return

//   try {
//     console.log('Fetching user responses')
//     const response = await axios.get(`/api/papers/${props.paper.id}/my-responses`)
//     console.log('Received responses:', response.data)

//     if (response.data.responses?.length) {
//       response.data.responses.forEach((item) => {
//         const question = props.questions.find((q) => q.id === item.questionId)
//         if (!question) return

//         // Convert letter (A, B, C) back to choice ID
//         const choiceIndex = item.selectedOption.charCodeAt(0) - 65
//         if (question.choices[choiceIndex]) {
//           selectedAnswers.value[question.id] = question.choices[choiceIndex].id
//           showAnswer.value[question.id] = true
//         }
//       })

//       console.log('Initialized selected answers:', selectedAnswers.value)
//     }
//   } catch (error) {
//     console.error('Failed to fetch user responses:', error)
//   }
// }

// Call this on component mount
// onMounted(() => {
//   if ((props.progress?.attemptCount ?? 0) > 0) {
//     initializeUserAnswers()
//   }
// })

// const hasAttemptedPaper = computed(
//   () =>
//     !!props.progress &&
//     typeof props.progress.attemptCount === 'number' &&
//     props.progress.attemptCount > 0
// )

// const attemptCountText = computed(() => {
//   if (!props.progress) return ''
//   return props.progress.attemptCount > 0
//     ? `You have attempted this paper before (${props.progress.attemptCount} times)`
//     : 'You have not attempted this paper yet'
// })

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
  <FeedbackDialog
    v-model:open="feedbackDialog.isOpen"
    :question="feedbackDialog.question"
    @close="closeFeedbackDialog"
  />
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
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
          <!-- <Button
            v-if="progress?.lastQuestionId"
            variant="default"
            class="flex items-center gap-1.5"
            @click="continueFromLastQuestion"
          >
            <ArrowRight class="h-4 w-4" />
            Continue where you left off
          </Button> -->

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

    <!-- <div class="bg-white p-6 rounded-xl border mb-6">
      <div v-if="progress" class="flex items-center gap-2 mb-4">
        <CheckCircle v-if="hasAttemptedPaper" class="h-5 w-5 text-green-500" />
        <XCircle v-else class="h-5 w-5 text-amber-500" />
        <span class="font-medium">{{ attemptCountText }}</span>
      </div>

      <div v-if="completionPercentage > 0" class="p-4 bg-white rounded-xl border mb-4">
        <div class="flex justify-between items-center mb-2">
          <span class="font-medium text-sm">Your progress</span>
          <span class="text-sm font-semibold">{{ completionPercentage }}%</span>
        </div>

        <div class="h-2.5 bg-gray-200 rounded-full">
          <div
            class="h-2.5 bg-primary rounded-full transition-all duration-300"
            :style="{ width: `${completionPercentage}%` }"
            :class="{
              'bg-amber-500': completionPercentage < 25,
              'bg-orange-500': completionPercentage >= 25 && completionPercentage < 50,
              'bg-blue-500': completionPercentage >= 50 && completionPercentage < 75,
              'bg-green-500': completionPercentage >= 75,
            }"
          ></div>
        </div>

        <div class="mt-2 flex justify-between items-center text-xs text-muted-foreground">
          <span
            >{{ Math.round((completionPercentage * questions.length) / 100) }} of
            {{ questions.length }} questions</span
          >

          <span
            v-if="completionPercentage === 100"
            class="text-green-600 font-medium flex items-center gap-1"
          >
            <CheckCircle class="h-3.5 w-3.5" /> Complete
          </span>
        </div>
      </div>
    </div> -->

    <!-- Questions List -->
    <div class="space-y-6">
      <div
        v-for="(question, index) in questions"
        :key="question.id"
        :id="`question-${question.id}`"
        class="p-6 bg-white rounded-xl border"
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
              class="mt-4 p-6 rounded-lg bg-[#CDE5ED] shadow-md border border-[#A8D3E7]"
            >
              <p class="text-lg font-semibold text-foreground">
                <strong>Correct Answer:</strong> {{ getCorrectAnswer(question)?.choiceText }}
              </p>
              <p class="mt-2 text-base text-muted-foreground text-[#1F2937] font-medium">
                <ViewExplanation :content="getCorrectAnswer(question)?.explanation || ''" />
              </p>
            </div>

            <!-- Feedback Button -->
            <!-- <Button v-if="showAnswer[question.id]" variant="outline"
              class="mt-4 flex items-center gap-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 border border-blue-200 transition-all duration-200 rounded-lg px-5 py-2.5 shadow-sm hover:shadow group"
              @click="openFeedbackDialog(question)">
              <MessageSquare
                class="h-4.5 w-4.5 opacity-75 group-hover:scale-110 group-hover:opacity-100 transition-all duration-200" />
              <span class="font-medium">Provide Feedback</span>
            </Button> -->
          </div>

          <!-- SAQ Section -->
          <div v-if="question.isSaq" class="pl-10 space-y-4">
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
                @click="showAnswer[part.id] = true"
                class="mt-3 text-primary font-semibold text-sm rounded-lg p-2 bg-[#CDE5ED]"
              >
                Show Answer
              </button>

              <!-- Explanation Section for Each Part -->
              <div
                v-if="showAnswer[part.id]"
                class="mt-4 p-6 bg-[#CDE5ED] shadow-md rounded-lg border border-[#A8D3E7]"
              >
                <p class="text-base text-muted-foreground text-[#1F2937] font-medium">
                  <strong>Explanation:</strong>
                  <ViewExplanation :content="part.expectedAnswer" />
                </p>
              </div>
              <!-- <Button
                v-if="showAnswer[question.id]"
                variant="ghost"
                class="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all"
                @click="openFeedbackDialog(question)"
              >
                <MessageSquare class="h-4 w-4 text-gray-700 transition-colors" />
                <span class="font-medium">Provide Feedback</span>
              </Button> -->
            </div>
          </div>
        </div>
      </div>
    </div>
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
