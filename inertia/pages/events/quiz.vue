<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import type EventDto from '#dtos/event'
import type EventQuizDto from '#dtos/event_quiz'
import DashLayout from '~/layouts/DashLayout.vue'
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  BookOpen,
  Play,
  Settings
} from 'lucide-vue-next'
import BreadcrumbTrail from '~/components/BreadcrumbTrail.vue'
import AppHead from '~/components/AppHead.vue'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import QuizAuthenticationDialog from '~/components/quiz/QuizAuthenticationDialog.vue'
import QuizTimer from '~/components/quiz/QuizTimer.vue'
import LockdownDetector from '~/components/quiz/LockdownDetector.vue'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { toast } from '~/components/ui/toast'
import axios from 'axios'

defineOptions({ layout: DashLayout })

interface Props {
  event: EventDto
  quiz: EventQuizDto
  canManage?: boolean
  attemptedQuestionIds?: number[]
  userResponses?: Record<number, { choiceId: number; isCorrect: boolean }>
  quizSession?: {
    id: number
    startedAt: string | null
    timeRemaining: number | null
  } | null
}

const props = defineProps<Props>()

const breadcrumbItems = [
  { label: 'Events', href: '/events' },
  { label: props.event.title, href: `/events/${props.event.slug}` },
  { label: props.quiz.title }
]

const selectedAnswers = ref<Record<number, number>>({})
const showResults = ref(false)
const showAnswer = ref<Record<number, boolean>>({})
const showAuthDialog = ref(false)
const quizStarted = ref(!!props.quizSession)
const timeRemaining = ref(props.quizSession?.timeRemaining || 0)
const sessionId = ref(props.quizSession?.id || null)

// Initialize showAnswer and selectedAnswers for already attempted questions
if (props.attemptedQuestionIds && props.quiz.questions && props.userResponses) {
  props.quiz.questions.forEach((question, index) => {
    if (props.attemptedQuestionIds!.includes(question.id)) {
      showAnswer.value[index] = true
      const userResponse = props.userResponses![question.id]
      if (userResponse) {
        selectedAnswers.value[index] = userResponse.choiceId
      }
    }
  })
}

const totalQuestions = computed(() => props.quiz.questions?.length || 0)

const score = computed(() => {
  if (!showResults.value) return 0
  let correct = 0
  props.quiz.questions?.forEach((question, index) => {
    const selectedChoiceId = selectedAnswers.value[index]
    const selectedChoice = question.choices?.find(c => c.id === selectedChoiceId)
    if (selectedChoice?.isCorrect) correct++
  })
  return correct
})

const scorePercentage = computed(() => {
  if (totalQuestions.value === 0) return 0
  return Math.round((score.value / totalQuestions.value) * 100)
})

const hasTimer = computed(() => props.quiz.hasTimer && props.quiz.durationMinutes)
const showStartButton = computed(() => !quizStarted.value && hasTimer.value)

function handleStartQuiz() {
  if (hasTimer.value) {
    showAuthDialog.value = true
  } else {
    quizStarted.value = true
  }
}

async function handleAuthComplete(data: { fullName: string; studentId: string; school: string }) {
  try {
    const response = await axios.post(`/api/events/${props.event.slug}/quiz/${props.quiz.id}/session/start`, {
      quizId: props.quiz.id,
      fullName: data.fullName,
      studentId: data.studentId,
      school: data.school
    })

    if (response.data.success) {
      sessionId.value = response.data.session.id
      timeRemaining.value = response.data.session.timeRemaining
      quizStarted.value = true
      showAuthDialog.value = false
      
      toast({
        title: 'Quiz Started',
        description: 'Good luck with your quiz!',
        variant: 'default',
      })
    }
  } catch (error: any) {
    console.error('Failed to start quiz session:', error)
    toast({
      title: 'Error',
      description: 'Failed to start quiz session. Please try again.',
      variant: 'destructive',
    })
  }
}

function selectAnswer(questionIndex: number, choiceId: number) {
  if (!showAnswer.value[questionIndex]) {
    const question = props.quiz.questions![questionIndex]
    submitAnswerToBackend(question.id, choiceId, questionIndex)
  }
}

async function submitAnswerToBackend(questionId: number, choiceId: number, questionIndex: number) {
  try {
    const question = props.quiz.questions![questionIndex]
    const selectedChoice = question.choices?.find(c => c.id === choiceId)
    const isCorrect = selectedChoice?.isCorrect || false

    const response = await axios.post(`/api/events/${props.event.slug}/quiz/${props.quiz.id}/answer`, {
      quizId: props.quiz.id,
      questionId,
      choiceId,
      isCorrect
    })

    if (response.data.success) {
      selectedAnswers.value[questionIndex] = choiceId
      showAnswer.value[questionIndex] = true
      
      if (props.attemptedQuestionIds && !props.attemptedQuestionIds.includes(questionId)) {
        props.attemptedQuestionIds.push(questionId)
      }
      
      if (isCorrect) {
        const correctChoice = question.choices?.find(c => c.isCorrect)
        toast({
          title: 'Correct!',
          description: correctChoice?.explanation || 'Well done!',
          variant: 'default',
        })
      } else {
        const correctChoice = question.choices?.find(c => c.isCorrect)
        toast({
          title: 'Incorrect',
          description: correctChoice?.explanation || 'Try reviewing the material.',
          variant: 'destructive',
        })
      }
    }
  } catch (error: any) {
    if (error.response?.status === 400 && error.response?.data?.error?.includes('already answered')) {
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

async function submitQuiz() {
  if (sessionId.value) {
    try {
      await axios.post(`/api/events/${props.event.slug}/quiz/${props.quiz.id}/session/submit`, {
        quizId: props.quiz.id,
        autoSubmitted: false
      })
      
      toast({
        title: 'Quiz Submitted',
        description: 'Your quiz has been submitted successfully.',
        variant: 'default',
      })
    } catch (error) {
      console.error('Failed to submit quiz session:', error)
    }
  }
  
  showResults.value = true
}

async function handleSuspiciousActivity(activity: { type: string; count: number }) {
  if (!sessionId.value) return
  
  try {
    const response = await axios.post(`/api/events/${props.event.slug}/quiz/${props.quiz.id}/session/activity`, {
      quizId: props.quiz.id,
      activityType: activity.type,
      data: { timestamp: new Date().toISOString() }
    })

    if (response.data.autoSubmitTriggered) {
      await submitQuiz()
    }
  } catch (error) {
    console.error('Failed to record suspicious activity:', error)
  }
}

async function handleAutoSubmit() {
  await submitQuiz()
}

function handleTimeUp() {
  toast({
    title: 'Time\'s Up!',
    description: 'Your quiz has been automatically submitted.',
    variant: 'destructive',
  })
  submitQuiz()
}

function handleTimeWarning(timeLeft: number) {
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  
  let message = ''
  if (minutes > 0) {
    message = `${minutes} minute${minutes > 1 ? 's' : ''} remaining`
  } else {
    message = `${seconds} second${seconds > 1 ? 's' : ''} remaining`
  }
  
  toast({
    title: 'Time Warning',
    description: message,
    variant: 'destructive',
  })
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Sync timer with server every 30 seconds
let syncInterval: NodeJS.Timeout | null = null

onMounted(() => {
  if (quizStarted.value && hasTimer.value) {
    syncInterval = setInterval(async () => {
      try {
        const response = await axios.get(`/api/events/${props.event.slug}/quiz/${props.quiz.id}/session/time`, {
          params: { quizId: props.quiz.id }
        })
        
        if (response.data.timeRemaining !== null) {
          timeRemaining.value = response.data.timeRemaining
        }
      } catch (error) {
        console.error('Failed to sync time with server:', error)
      }
    }, 30000) // Every 30 seconds
  }
})

onUnmounted(() => {
  if (syncInterval) {
    clearInterval(syncInterval)
  }
})
</script>

<template>
  <AppHead 
    :title="`${props.quiz.title} - ${props.event.title}`" 
    :description="`Take the ${props.quiz.title} quiz for ${props.event.title} event`"
  />
  
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
    <!-- Quiz Timer (when active) -->
    <div v-if="quizStarted && hasTimer" class="fixed top-4 right-4 z-40">
      <QuizTimer
        :initial-time-remaining="timeRemaining"
        :is-active="true"
        @time-up="handleTimeUp"
        @warning="handleTimeWarning"
      />
    </div>

    <!-- Lockdown Detector -->
    <LockdownDetector
      :is-enabled="quizStarted && props.quiz.lockdownMode"
      :auto-submit-threshold="5"
      @suspicious-activity="handleSuspiciousActivity"
      @auto-submit-triggered="handleAutoSubmit"
    />

    <!-- Authentication Dialog -->
    <QuizAuthenticationDialog
      :is-open="showAuthDialog"
      :event-title="props.event.title"
      :quiz-title="props.quiz.title"
      :duration-minutes="props.quiz.durationMinutes"
      :lockdown-mode="props.quiz.lockdownMode"
      @start-quiz="handleAuthComplete"
      @close="showAuthDialog = false"
    />
    
    <!-- Header Section -->
    <div class="mb-6 sm:mb-10 header-animation">
      <BreadcrumbTrail :items="breadcrumbItems" class="mb-4 sm:mb-5" />
      <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-6 mb-5 sm:mb-6">
        <div class="flex items-start gap-3 sm:gap-4 flex-1">
          <div class="flex-shrink-0 mt-0.5">
            <div class="h-10 w-10 rounded-lg bg-[#55A9C4]/10 flex items-center justify-center">
              <BookOpen class="h-6 w-6 text-[#55A9C4]" />
            </div>
          </div>
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{{ props.quiz.title }}</h1>
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
      <div class="flex items-center justify-center gap-4 text-sm mb-4 flex-wrap">
        <Badge variant="secondary" class="flex items-center gap-1">
          <BookOpen class="h-3 w-3" />
          {{ totalQuestions }} Questions
        </Badge>
        <Badge v-if="hasTimer" variant="outline" class="flex items-center gap-1">
          <Clock class="h-3 w-3" />
          {{ props.quiz.durationMinutes }} minutes
        </Badge>
        <Badge v-if="props.quiz.lockdownMode" variant="outline" class="flex items-center gap-1">
          <span class="w-2 h-2 bg-red-500 rounded-full"></span>
          Lockdown Mode
        </Badge>
        <Badge v-if="showResults" :variant="scorePercentage >= 70 ? 'default' : 'destructive'" class="flex items-center gap-1">
          <CheckCircle class="h-3 w-3" />
          {{ score }}/{{ totalQuestions }} ({{ scorePercentage }}%)
        </Badge>
      </div>
      <div class="w-12 h-1 bg-gradient-to-r from-[#55A9C4] to-[#55A9C4]/70 rounded-full"></div>
    </div>

    <!-- Start Quiz Button (for timed quizzes) -->
    <div v-if="showStartButton" class="text-center p-8 bg-white rounded-2xl border border-slate-100">
      <div class="flex flex-col items-center gap-4">
        <div class="p-4 rounded-full bg-[#55A9C4]/10">
          <Play class="h-8 w-8 text-[#55A9C4]" />
        </div>
        <div class="space-y-2">
          <h3 class="text-lg font-semibold text-foreground">Ready to Start?</h3>
          <p class="text-muted-foreground max-w-md">
            This quiz has a time limit of {{ props.quiz.durationMinutes }} minutes.
            {{ props.quiz.lockdownMode ? ' Lockdown mode is enabled.' : '' }}
          </p>
        </div>
        <Button 
          @click="handleStartQuiz"
          class="bg-[#55A9C4] hover:bg-[#4795af] text-white"
        >
          <Play class="h-4 w-4 mr-2" />
          Start Quiz
        </Button>
      </div>
    </div>

    <!-- Questions List (only show if quiz started or no timer) -->
    <div v-else-if="props.quiz.questions && props.quiz.questions.length && (quizStarted || !hasTimer)" class="space-y-4 mt-8">
      <div
        v-for="(question, index) in props.quiz.questions"
        :key="question.id"
        class="bg-white rounded-lg border border-gray-200 p-4 sm:p-6"
      >
        <div class="flex items-center gap-3 mb-4">
          <span class="text-sm font-medium text-gray-500">Q{{ index + 1 }}</span>
          <Badge v-if="question.isMcq" class="bg-blue-100 text-blue-800">MCQ</Badge>
          <Badge 
            v-if="showAnswer[index]" 
            class="bg-green-100 text-green-800"
          >
            Answered
          </Badge>
        </div>
        <div class="space-y-4">
          <div class="prose prose-sm max-w-none">
            <div v-html="question.questionText"></div>
          </div>
          <div v-if="question.questionImagePath" class="mt-4">
            <img
              :src="question.questionImagePath"
              alt="Question image"
              class="max-w-full sm:max-w-md rounded-lg border"
            />
          </div>
          <div v-if="question.isMcq && question.choices?.length" class="space-y-2">
            <div
              v-for="(choice, choiceIndex) in question.choices"
              :key="choice.id"
              class="flex items-start gap-3 p-3 rounded-lg border transition-all duration-200"
              :class="[
                showAnswer[index] && choice.isCorrect ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200',
                showAnswer[index] ? 'pointer-events-none opacity-70 cursor-default' : 'cursor-pointer hover:bg-gray-100',
                selectedAnswers[index] === choice.id && !choice.isCorrect && showAnswer[index] ? 'border-red-400 bg-red-50' : '',
              ]"
              @click="!showAnswer[index] && selectAnswer(index, choice.id)"
              :aria-disabled="showAnswer[index] ? 'true' : 'false'"
            >
              <span class="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium"
                :class="showAnswer[index] && choice.isCorrect ? 'bg-green-600 text-white' : 'bg-gray-400 text-white'"
              >
                {{ String.fromCharCode(65 + choiceIndex) }}
              </span>
              <div class="flex-1 min-w-0">
                <div v-html="choice.choiceText" class="text-sm"></div>
                <div v-if="showAnswer[index] && choice.isCorrect && choice.explanation" class="mt-2 text-xs text-green-700">
                  <strong>Explanation:</strong> {{ choice.explanation }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Submit Quiz Button -->
      <div v-if="!showResults && (quizStarted || !hasTimer)" class="text-center pt-4">
        <Button 
          @click="submitQuiz"
          class="bg-[#55A9C4] hover:bg-[#4795af] text-white"
        >
          Submit Quiz
        </Button>
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