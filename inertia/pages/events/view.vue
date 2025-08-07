<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import type EventDto from '#dtos/event'
import type EventQuizDto from '#dtos/event_quiz'
import DashLayout from '~/layouts/DashLayout.vue'
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Circle, 
  RotateCcw,
  Trophy,
  Clock,
  FileText
} from 'lucide-vue-next'
import BreadcrumbTrail from '~/components/BreadcrumbTrail.vue'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Progress } from '~/components/ui/progress'
import { Badge } from '~/components/ui/badge'
import { ref, computed, reactive } from 'vue'

defineOptions({ layout: DashLayout })

interface Props {
  event: EventDto
  quiz: EventQuizDto
}

const props = defineProps<Props>()

const breadcrumbItems = [
  { label: 'Events', href: '/events' },
  { label: props.event.title, href: `/events/${props.event.slug}` },
  { label: props.quiz.title }
]

// Quiz state
const selectedAnswers = reactive<Record<number, number>>({})
const showAnswers = reactive<Record<number, boolean>>({})
const quizCompleted = ref(false)
const quizStarted = ref(false)
const currentQuestionIndex = ref(0)

// Quiz statistics
const answeredQuestions = computed(() => Object.keys(selectedAnswers).length)
const totalQuestions = computed(() => props.quiz.mcqs.length)
const progressPercentage = computed(() => 
  totalQuestions.value > 0 ? (answeredQuestions.value / totalQuestions.value) * 100 : 0
)

const correctAnswers = computed(() => {
  let correct = 0
  props.quiz.mcqs.forEach((mcq, index) => {
    const questionId = index
    if (selectedAnswers[questionId] === mcq.correctAnswer) {
      correct++
    }
  })
  return correct
})

const scorePercentage = computed(() => 
  totalQuestions.value > 0 ? (correctAnswers.value / totalQuestions.value) * 100 : 0
)

// Get letter for choice (A, B, C, D)
function getChoiceLetter(index: number): string {
  return String.fromCharCode(65 + index)
}

// Handle choice selection
function handleChoiceSelect(questionIndex: number, choiceIndex: number) {
  if (showAnswers[questionIndex]) return // Already answered
  
  selectedAnswers[questionIndex] = choiceIndex
  showAnswers[questionIndex] = true
  
  // Auto-advance to next question after a short delay
  setTimeout(() => {
    if (currentQuestionIndex.value < totalQuestions.value - 1) {
      currentQuestionIndex.value++
    } else {
      // Quiz completed
      completeQuiz()
    }
  }, 1500)
}

// Complete quiz
function completeQuiz() {
  quizCompleted.value = true
}

// Reset quiz
function resetQuiz() {
  Object.keys(selectedAnswers).forEach(key => delete selectedAnswers[key])
  Object.keys(showAnswers).forEach(key => delete showAnswers[key])
  quizCompleted.value = false
  quizStarted.value = false
  currentQuestionIndex.value = 0
}

// Start quiz
function startQuiz() {
  quizStarted.value = true
}

// Navigation
function goToQuestion(index: number) {
  currentQuestionIndex.value = index
}

function nextQuestion() {
  if (currentQuestionIndex.value < totalQuestions.value - 1) {
    currentQuestionIndex.value++
  }
}

function previousQuestion() {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
  }
}

const currentQuestion = computed(() => props.quiz.mcqs[currentQuestionIndex.value])

function getScoreColor(percentage: number): string {
  if (percentage >= 80) return 'text-green-600'
  if (percentage >= 60) return 'text-yellow-600'
  return 'text-red-600'
}

function getScoreBadgeColor(percentage: number): string {
  if (percentage >= 80) return 'bg-green-100 text-green-800'
  if (percentage >= 60) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}
</script>

<template>
  <AppHead 
    :title="`${quiz.title} - ${event.title}`" 
    :description="`Take the ${quiz.title} quiz for ${event.title}`" 
  />

  <div class="min-h-screen bg-gray-50/50">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <!-- Header -->
      <div class="mb-6">
        <BreadcrumbTrail :items="breadcrumbItems" class="mb-4" />
      </div>

      <!-- Quiz Start Screen -->
      <Card v-if="!quizStarted && !quizCompleted" class="text-center">
        <CardContent class="p-8">
          <div class="mb-6">
            <div class="h-16 w-16 mx-auto rounded-lg bg-[#55A9C4]/10 flex items-center justify-center mb-4">
              <FileText class="h-8 w-8 text-[#55A9C4]" />
            </div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ quiz.title }}</h1>
            <p v-if="quiz.description" class="text-gray-600 text-lg mb-6">{{ quiz.description }}</p>
          </div>

          <div class="grid md:grid-cols-3 gap-4 mb-8">
            <div class="p-4 bg-blue-50 rounded-lg">
              <FileText class="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p class="text-sm font-medium text-blue-900">{{ totalQuestions }} Questions</p>
              <p class="text-xs text-blue-700">Multiple Choice</p>
            </div>
            <div class="p-4 bg-green-50 rounded-lg">
              <Clock class="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p class="text-sm font-medium text-green-900">Self-Paced</p>
              <p class="text-xs text-green-700">No time limit</p>
            </div>
            <div class="p-4 bg-purple-50 rounded-lg">
              <Trophy class="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <p class="text-sm font-medium text-purple-900">Instant Results</p>
              <p class="text-xs text-purple-700">See scores immediately</p>
            </div>
          </div>

          <div class="space-y-4">
            <Button @click="startQuiz" class="bg-[#55A9C4] hover:bg-[#4795af] text-white px-8 py-3 text-lg">
              Start Quiz
            </Button>
            <p class="text-sm text-gray-500">
              You can review your answers after completing the quiz
            </p>
          </div>
        </CardContent>
      </Card>

      <!-- Quiz Interface -->
      <div v-else-if="quizStarted && !quizCompleted" class="space-y-6">
        <!-- Progress Bar -->
        <Card>
          <CardContent class="p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700">
                Question {{ currentQuestionIndex + 1 }} of {{ totalQuestions }}
              </span>
              <span class="text-sm text-gray-500">
                {{ Math.round(progressPercentage) }}% Complete
              </span>
            </div>
            <Progress :value="progressPercentage" class="h-2" />
          </CardContent>
        </Card>

        <!-- Question Card -->
        <Card v-if="currentQuestion">
          <CardHeader>
            <CardTitle class="text-xl">
              Question {{ currentQuestionIndex + 1 }}
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-6">
            <!-- Question Text -->
            <div class="p-4 bg-gray-50 rounded-lg">
              <p class="text-lg text-gray-900 leading-relaxed">
                {{ currentQuestion.question }}
              </p>
            </div>

            <!-- Choices -->
            <div class="space-y-3">
              <div
                v-for="(choice, choiceIndex) in currentQuestion.choices"
                :key="choiceIndex"
                :class="{
                  'border-green-500 bg-green-50': 
                    showAnswers[currentQuestionIndex] && choiceIndex === currentQuestion.correctAnswer,
                  'border-red-500 bg-red-50': 
                    showAnswers[currentQuestionIndex] && 
                    selectedAnswers[currentQuestionIndex] === choiceIndex && 
                    choiceIndex !== currentQuestion.correctAnswer,
                  'border-[#55A9C4] bg-[#55A9C4]/5': 
                    selectedAnswers[currentQuestionIndex] === choiceIndex && 
                    !showAnswers[currentQuestionIndex],
                  'hover:border-[#55A9C4]/50 hover:bg-gray-50': 
                    !showAnswers[currentQuestionIndex],
                  'opacity-60': showAnswers[currentQuestionIndex] && 
                    selectedAnswers[currentQuestionIndex] !== choiceIndex &&
                    choiceIndex !== currentQuestion.correctAnswer,
                }"
                class="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg cursor-pointer transition-all duration-200"
                @click="handleChoiceSelect(currentQuestionIndex, choiceIndex)"
              >
                <!-- Choice Letter -->
                <div 
                  :class="{
                    'bg-green-500 text-white': 
                      showAnswers[currentQuestionIndex] && choiceIndex === currentQuestion.correctAnswer,
                    'bg-red-500 text-white': 
                      showAnswers[currentQuestionIndex] && 
                      selectedAnswers[currentQuestionIndex] === choiceIndex && 
                      choiceIndex !== currentQuestion.correctAnswer,
                    'bg-[#55A9C4] text-white': 
                      selectedAnswers[currentQuestionIndex] === choiceIndex && 
                      !showAnswers[currentQuestionIndex],
                    'bg-gray-200 text-gray-700': 
                      !selectedAnswers[currentQuestionIndex] || 
                      selectedAnswers[currentQuestionIndex] !== choiceIndex,
                  }"
                  class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
                >
                  {{ getChoiceLetter(choiceIndex) }}
                </div>

                <!-- Choice Text -->
                <span 
                  :class="{
                    'text-green-800 font-medium': 
                      showAnswers[currentQuestionIndex] && choiceIndex === currentQuestion.correctAnswer,
                    'text-red-800': 
                      showAnswers[currentQuestionIndex] && 
                      selectedAnswers[currentQuestionIndex] === choiceIndex && 
                      choiceIndex !== currentQuestion.correctAnswer,
                  }"
                  class="flex-1 text-gray-900"
                >
                  {{ choice }}
                </span>

                <!-- Status Icon -->
                <div v-if="showAnswers[currentQuestionIndex]" class="flex-shrink-0">
                  <CheckCircle 
                    v-if="choiceIndex === currentQuestion.correctAnswer"
                    class="h-5 w-5 text-green-500" 
                  />
                  <XCircle 
                    v-else-if="selectedAnswers[currentQuestionIndex] === choiceIndex"
                    class="h-5 w-5 text-red-500" 
                  />
                </div>
              </div>
            </div>

            <!-- Explanation -->
            <div 
              v-if="showAnswers[currentQuestionIndex] && currentQuestion.explanation"
              class="p-4 bg-blue-50 border border-blue-200 rounded-lg"
            >
              <h4 class="font-semibold text-blue-900 mb-2">Explanation</h4>
              <p class="text-blue-800 text-sm leading-relaxed">
                {{ currentQuestion.explanation }}
              </p>
            </div>

            <!-- Navigation -->
            <div class="flex justify-between items-center pt-4 border-t border-gray-200">
              <Button
                @click="previousQuestion"
                :disabled="currentQuestionIndex === 0"
                variant="outline"
                class="flex items-center gap-2"
              >
                <ArrowLeft class="h-4 w-4" />
                Previous
              </Button>

              <div class="flex gap-2">
                <Button
                  v-for="(_, index) in quiz.mcqs"
                  :key="index"
                  @click="goToQuestion(index)"
                  :variant="index === currentQuestionIndex ? 'default' : 'outline'"
                  :class="{
                    'bg-green-100 border-green-500 text-green-700': 
                      showAnswers[index] && selectedAnswers[index] === quiz.mcqs[index].correctAnswer,
                    'bg-red-100 border-red-500 text-red-700': 
                      showAnswers[index] && selectedAnswers[index] !== quiz.mcqs[index].correctAnswer,
                    'bg-[#55A9C4] text-white': index === currentQuestionIndex,
                  }"
                  size="sm"
                  class="w-8 h-8 p-0"
                >
                  {{ index + 1 }}
                </Button>
              </div>

              <Button
                @click="nextQuestion"
                :disabled="currentQuestionIndex === totalQuestions - 1"
                variant="outline"
                class="flex items-center gap-2"
              >
                Next
                <ArrowLeft class="h-4 w-4 rotate-180" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Quiz Results -->
      <Card v-else-if="quizCompleted" class="text-center">
        <CardContent class="p-8">
          <div class="mb-6">
            <div class="h-16 w-16 mx-auto rounded-lg bg-[#55A9C4]/10 flex items-center justify-center mb-4">
              <Trophy class="h-8 w-8 text-[#55A9C4]" />
            </div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Quiz Completed!</h1>
            <p class="text-gray-600">Here are your results for {{ quiz.title }}</p>
          </div>

          <!-- Score -->
          <div class="mb-8">
            <div class="text-6xl font-bold mb-2" :class="getScoreColor(scorePercentage)">
              {{ Math.round(scorePercentage) }}%
            </div>
            <Badge :class="getScoreBadgeColor(scorePercentage)" class="text-lg px-4 py-1">
              {{ correctAnswers }}/{{ totalQuestions }} Correct
            </Badge>
          </div>

          <!-- Statistics -->
          <div class="grid md:grid-cols-3 gap-4 mb-8">
            <div class="p-4 bg-gray-50 rounded-lg">
              <div class="text-2xl font-bold text-gray-900">{{ totalQuestions }}</div>
              <p class="text-sm text-gray-600">Total Questions</p>
            </div>
            <div class="p-4 bg-green-50 rounded-lg">
              <div class="text-2xl font-bold text-green-600">{{ correctAnswers }}</div>
              <p class="text-sm text-green-700">Correct Answers</p>
            </div>
            <div class="p-4 bg-red-50 rounded-lg">
              <div class="text-2xl font-bold text-red-600">{{ totalQuestions - correctAnswers }}</div>
              <p class="text-sm text-red-700">Incorrect Answers</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <Button @click="resetQuiz" variant="outline" class="flex items-center gap-2">
              <RotateCcw class="h-4 w-4" />
              Retake Quiz
            </Button>
            <Link 
              :href="`/events/${event.slug}`"
              class="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#55A9C4] hover:bg-[#4795af] text-white rounded-lg font-medium transition-colors"
            >
              Back to Event
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.quiz-choice {
  transition: all 0.2s ease-in-out;
}

.quiz-choice:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>