<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import type EventDto from '#dtos/event'
import type EventQuizDto from '#dtos/event_quiz'
import DashLayout from '~/layouts/DashLayout.vue'
import {
  Calendar,
  ArrowLeft,
  CheckCircle,
  Clock,
  BookOpen,
  Play,
  RotateCcw,
  Settings,
} from 'lucide-vue-next'
import BreadcrumbTrail from '~/components/BreadcrumbTrail.vue'
import AppHead from '~/components/AppHead.vue'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Label } from '~/components/ui/label'
import { Separator } from '~/components/ui/separator'
import { ref, computed } from 'vue'
import { router } from '@inertiajs/vue3'
import { toast } from '~/components/ui/toast'
import axios from 'axios'

defineOptions({ layout: DashLayout })

interface Props {
  event: EventDto
  quiz: EventQuizDto
  canManage?: boolean // Add canManage prop (optional for backward compatibility)
  attemptedQuestionIds?: number[]
  userResponses?: Record<number, { choiceId: number; isCorrect: boolean }>
}

const props = defineProps<Props>()

const breadcrumbItems = [
  { label: 'Events', href: '/events' },
  { label: props.event.title, href: `/events/${props.event.slug}` },
  { label: props.quiz.title },
]

const currentQuestionIndex = ref(0)
const selectedAnswers = ref<Record<number, number>>({})
const showResults = ref(false)
const showAnswer = ref<Record<number, boolean>>({})

// Initialize showAnswer and selectedAnswers for already attempted questions
if (props.attemptedQuestionIds && props.quiz.questions && props.userResponses) {
  props.quiz.questions.forEach((question, index) => {
    if (props.attemptedQuestionIds!.includes(question.id)) {
      showAnswer.value[index] = true
      // Set the user's previous choice if available
      const userResponse = props.userResponses![question.id]
      if (userResponse) {
        selectedAnswers.value[index] = userResponse.choiceId
      }
    }
  })
}

const currentQuestion = computed(() => props.quiz.questions?.[currentQuestionIndex.value] || null)
const totalQuestions = computed(() => props.quiz.questions?.length || 0)
const isLastQuestion = computed(() => currentQuestionIndex.value === totalQuestions.value - 1)
const isFirstQuestion = computed(() => currentQuestionIndex.value === 0)

const score = computed(() => {
  if (!showResults.value) return 0
  let correct = 0
  props.quiz.questions?.forEach((question, index) => {
    const selectedChoiceId = selectedAnswers.value[index]
    const selectedChoice = question.choices?.find((c) => c.id === selectedChoiceId)
    if (selectedChoice?.isCorrect) correct++
  })
  return correct
})

const scorePercentage = computed(() => {
  if (totalQuestions.value === 0) return 0
  return Math.round((score.value / totalQuestions.value) * 100)
})

function selectAnswer(questionIndex: number, choiceId: number) {
  if (!showAnswer.value[questionIndex]) {
    const question = props.quiz.questions![questionIndex]

    // Submit answer to backend
    submitAnswerToBackend(question.id, choiceId, questionIndex)
  }
}

async function submitAnswerToBackend(questionId: number, choiceId: number, questionIndex: number) {
  try {
    const question = props.quiz.questions![questionIndex]
    const selectedChoice = question.choices?.find((c) => c.id === choiceId)
    const isCorrect = selectedChoice?.isCorrect || false

    const response = await axios.post(
      `/api/events/${props.event.slug}/quiz/${props.quiz.id}/answer`,
      {
        quizId: props.quiz.id,
        questionId,
        choiceId,
        isCorrect,
      }
    )

    if (response.data.success) {
      // Update local state only after successful API call
      selectedAnswers.value[questionIndex] = choiceId
      showAnswer.value[questionIndex] = true

      // Add this question to attempted questions
      if (props.attemptedQuestionIds && !props.attemptedQuestionIds.includes(questionId)) {
        props.attemptedQuestionIds.push(questionId)
      }

      // Show success/failure feedback using the isCorrect we calculated
      if (isCorrect) {
        const correctChoice = question.choices?.find((c) => c.isCorrect)
        toast({
          title: 'Correct!',
          description: correctChoice?.explanation || 'Well done!',
          variant: 'default',
        })
      } else {
        const correctChoice = question.choices?.find((c) => c.isCorrect)
        toast({
          title: 'Incorrect',
          description: correctChoice?.explanation || 'Try reviewing the material.',
          variant: 'destructive',
        })
      }
    }
  } catch (error: any) {
    // Handle API errors
    if (
      error.response?.status === 400 &&
      error.response?.data?.error?.includes('already answered')
    ) {
      // Mark as attempted in local state
      showAnswer.value[questionIndex] = true
      if (props.attemptedQuestionIds && !props.attemptedQuestionIds.includes(questionId)) {
        props.attemptedQuestionIds.push(questionId)
      }

      toast({
        title: 'Already Answered',
        description: 'You have already answered this question.',
        variant: 'destructive',
      })
    } else {
      console.error('Failed to submit answer:', error)
      toast({
        title: 'Error',
        description: 'Failed to submit your answer. Please try again.',
        variant: 'destructive',
      })
    }
  }
}

function nextQuestion() {
  if (!isLastQuestion.value) {
    currentQuestionIndex.value++
  }
}

function previousQuestion() {
  if (!isFirstQuestion.value) {
    currentQuestionIndex.value--
  }
}

function submitQuiz() {
  showResults.value = true
}

function restartQuiz() {
  currentQuestionIndex.value = 0
  selectedAnswers.value = {}
  showResults.value = false
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function isAttempted(questionId: number) {
  return props.attemptedQuestionIds?.includes(questionId)
}
</script>

<template>
  <AppHead
    :title="`${props.quiz.title} - ${props.event.title}`"
    :description="`Take the ${props.quiz.title} quiz for ${props.event.title} event`"
  />

  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
    <!-- Header Section -->
    <div class="mb-6 sm:mb-10 header-animation">
      <BreadcrumbTrail :items="breadcrumbItems" class="mb-4 sm:mb-5" />
      <div
        class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-6 mb-5 sm:mb-6"
      >
        <div class="flex items-start gap-3 sm:gap-4 flex-1">
          <div class="flex-shrink-0 mt-0.5">
            <div class="h-10 w-10 rounded-lg bg-[#55A9C4]/10 flex items-center justify-center">
              <BookOpen class="h-6 w-6 text-[#55A9C4]" />
            </div>
          </div>
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {{ props.quiz.title }}
            </h1>
            <div class="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Calendar class="h-4 w-4" />
              <span>Starts on {{ formatDate(props.event.startDate) }}</span>
            </div>
          </div>
        </div>
        <!-- Manage Button -->
        <div class="w-full sm:w-auto flex-shrink-0 flex flex-col gap-2">
          <Link
            v-if="props.canManage"
            :href="`/manage/events/${props.event.slug}/quiz/${props.quiz.id}`"
            class="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#55A9C4] hover:bg-[#4795af] text-white text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
          >
            <Settings class="h-4 w-4" />
            <span>Manage</span>
          </Link>
        </div>
      </div>
      <div class="flex items-center justify-center gap-4 text-sm mb-4">
        <Badge variant="secondary" class="flex items-center gap-1">
          <BookOpen class="h-3 w-3" />
          {{ totalQuestions }} Questions
        </Badge>
        <Badge
          v-if="showResults"
          :variant="scorePercentage >= 70 ? 'default' : 'destructive'"
          class="flex items-center gap-1"
        >
          <CheckCircle class="h-3 w-3" />
          {{ score }}/{{ totalQuestions }} ({{ scorePercentage }}%)
        </Badge>
      </div>
      <div class="w-12 h-1 bg-gradient-to-r from-[#55A9C4] to-[#55A9C4]/70 rounded-full"></div>
    </div>

    <!-- Questions List -->
    <div v-if="props.quiz.questions && props.quiz.questions.length" class="space-y-4 mt-8">
      <div
        v-for="(question, index) in props.quiz.questions"
        :key="question.id"
        class="bg-white rounded-lg border border-gray-200 p-6"
      >
        <div class="flex items-center gap-3 mb-4">
          <span class="text-sm font-medium text-gray-500">Q{{ index + 1 }}</span>
          <Badge v-if="question.isMcq" class="bg-blue-100 text-blue-800">MCQ</Badge>
          <Badge v-if="showAnswer[index]" class="bg-green-100 text-green-800"> Answered </Badge>
        </div>
        <div class="space-y-4">
          <div class="prose prose-sm max-w-none">
            <div v-html="question.questionText"></div>
          </div>
          <div v-if="question.questionImagePath" class="mt-4">
            <img
              :src="question.questionImagePath"
              alt="Question image"
              class="max-w-md rounded-lg border"
            />
          </div>
          <div v-if="question.isMcq && question.choices?.length" class="space-y-2">
            <div
              v-for="(choice, choiceIndex) in question.choices"
              :key="choice.id"
              class="flex items-start gap-3 p-3 rounded-lg border transition-all duration-200"
              :class="[
                showAnswer[index] && choice.isCorrect
                  ? 'bg-green-50 border-green-200'
                  : 'bg-gray-50 border-gray-200',
                showAnswer[index]
                  ? 'pointer-events-none opacity-70 cursor-default'
                  : 'cursor-pointer',
                selectedAnswers[index] === choice.id && !choice.isCorrect && showAnswer[index]
                  ? 'border-red-400 bg-red-50'
                  : '',
              ]"
              @click="!showAnswer[index] && selectAnswer(index, choice.id)"
              :aria-disabled="showAnswer[index] ? 'true' : 'false'"
            >
              <span
                class="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium"
                :class="
                  showAnswer[index] && choice.isCorrect
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-400 text-white'
                "
              >
                {{ String.fromCharCode(65 + choiceIndex) }}
              </span>
              <div class="flex-1">
                <div v-html="choice.choiceText"></div>
                <div
                  v-if="showAnswer[index] && choice.isCorrect && choice.explanation"
                  class="mt-2 text-sm text-green-700"
                >
                  <strong>Explanation:</strong> {{ choice.explanation }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Empty State -->
    <div v-else class="text-center p-8 bg-white rounded-2xl border border-slate-100 mt-8">
      <div class="flex flex-col items-center gap-4">
        <div class="p-4 rounded-full bg-muted/20">
          <Calendar class="h-8 w-8 text-muted-foreground" />
        </div>
        <div class="space-y-2">
          <h3 class="text-lg font-semibold text-foreground">No questions yet</h3>
          <p class="text-muted-foreground">This quiz does not have any questions yet.</p>
        </div>
      </div>
    </div>
  </div>
</template>
