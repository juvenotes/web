<script setup lang="ts">
import { Link, useForm } from '@inertiajs/vue3'
import type EventDto from '#dtos/event'
import type EventQuizDto from '#dtos/event_quiz'
import type QuestionDto from '#dtos/question'
import type McqChoiceDto from '#dtos/mcq_choice'
import DashLayout from '~/layouts/DashLayout.vue'
import { 
  Calendar, 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  BookOpen,
  Play,
  RotateCcw
} from 'lucide-vue-next'
import BreadcrumbTrail from '~/components/BreadcrumbTrail.vue'
import AppHead from '~/components/AppHead.vue'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Label } from '~/components/ui/label'
import { Separator } from '~/components/ui/separator'
import { ref, computed } from 'vue'

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

const currentQuestionIndex = ref(0)
const selectedAnswers = ref<Record<number, number>>({})
const showResults = ref(false)

const currentQuestion = computed(() => props.quiz.questions?.[currentQuestionIndex.value] || null)
const totalQuestions = computed(() => props.quiz.questions?.length || 0)
const isLastQuestion = computed(() => currentQuestionIndex.value === totalQuestions.value - 1)
const isFirstQuestion = computed(() => currentQuestionIndex.value === 0)

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

function selectAnswer(questionIndex: number, choiceId: number) {
  selectedAnswers.value[questionIndex] = choiceId
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
</script>

<template>
  <AppHead 
    :title="`${quiz.title} - ${event.title}`" 
    :description="`Take the ${quiz.title} quiz for ${event.title} event`"
  />
  
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
    <!-- Breadcrumb -->
    <BreadcrumbTrail :items="breadcrumbItems" />

    <!-- Header -->
    <div class="text-center space-y-4">
      <div class="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Calendar class="h-4 w-4" />
        <span>{{ formatDate(event.startDate) }}</span>
      </div>
      
      <div>
        <h1 class="text-3xl font-bold tracking-tight">{{ quiz.title }}</h1>
        <p v-if="quiz.description" class="text-lg text-muted-foreground mt-2">
          {{ quiz.description }}
        </p>
      </div>

      <div class="flex items-center justify-center gap-4 text-sm">
        <Badge variant="secondary" class="flex items-center gap-1">
          <BookOpen class="h-3 w-3" />
          {{ totalQuestions }} Questions
        </Badge>
        <Badge v-if="showResults" :variant="scorePercentage >= 70 ? 'default' : 'destructive'" class="flex items-center gap-1">
          <CheckCircle class="h-3 w-3" />
          {{ score }}/{{ totalQuestions }} ({{ scorePercentage }}%)
        </Badge>
      </div>
    </div>

    <!-- Quiz Content -->
    <div v-if="totalQuestions > 0" class="space-y-6">
      <!-- Progress Bar -->
      <div v-if="!showResults" class="w-full bg-gray-200 rounded-full h-2">
        <div 
          class="bg-primary h-2 rounded-full transition-all duration-300"
          :style="{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }"
        />
      </div>

      <!-- Question Card -->
      <Card v-if="currentQuestion && !showResults">
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle class="text-lg">
              Question {{ currentQuestionIndex + 1 }} of {{ totalQuestions }}
            </CardTitle>
            <Badge variant="outline">MCQ</Badge>
          </div>
        </CardHeader>
        <CardContent class="space-y-6">
          <!-- Question Text -->
          <div class="prose max-w-none">
            <p class="text-lg font-medium leading-relaxed">
              {{ currentQuestion.questionText }}
            </p>
            
            <!-- Question Image if exists -->
            <div v-if="currentQuestion.questionImagePath" class="mt-4">
              <img 
                :src="currentQuestion.questionImagePath" 
                :alt="`Question ${currentQuestionIndex + 1} image`"
                class="max-w-full h-auto rounded-lg border"
              />
            </div>
          </div>

          <!-- Choices -->
          <div class="space-y-3">
            <div 
              v-for="(choice, choiceIndex) in currentQuestion.choices" 
              :key="choice.id"
              class="flex items-start space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
            >
              <input
                :id="`choice-${choice.id}`"
                :value="choice.id"
                :checked="selectedAnswers[currentQuestionIndex] === choice.id"
                type="radio"
                :name="`question-${currentQuestionIndex}`"
                class="mt-0.5 h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                @change="selectAnswer(currentQuestionIndex, choice.id)"
              />
              <Label 
                :for="`choice-${choice.id}`" 
                class="flex-1 cursor-pointer font-medium"
              >
                <span class="font-semibold mr-2">{{ String.fromCharCode(65 + choiceIndex) }}.</span>
                {{ choice.choiceText }}
              </Label>
            </div>
          </div>

          <!-- Navigation -->
          <div class="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              @click="previousQuestion"
              :disabled="isFirstQuestion"
            >
              <ArrowLeft class="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div class="text-sm text-muted-foreground">
              {{ currentQuestionIndex + 1 }} / {{ totalQuestions }}
            </div>

            <Button
              v-if="!isLastQuestion"
              @click="nextQuestion"
              :disabled="!selectedAnswers[currentQuestionIndex]"
            >
              Next
              <ArrowLeft class="h-4 w-4 ml-2 rotate-180" />
            </Button>

            <Button
              v-else
              @click="submitQuiz"
              :disabled="!selectedAnswers[currentQuestionIndex]"
            >
              <CheckCircle class="h-4 w-4 mr-2" />
              Submit Quiz
            </Button>
          </div>
        </CardContent>
      </Card>

      <!-- Results View -->
      <div v-if="showResults" class="space-y-6">
        <!-- Results Summary -->
        <Card>
          <CardHeader class="text-center">
            <CardTitle class="text-2xl">Quiz Results</CardTitle>
          </CardHeader>
          <CardContent class="text-center space-y-4">
            <div class="text-6xl font-bold" :class="scorePercentage >= 70 ? 'text-green-600' : 'text-red-600'">
              {{ scorePercentage }}%
            </div>
            <p class="text-lg text-muted-foreground">
              You got {{ score }} out of {{ totalQuestions }} questions correct
            </p>
            
            <div class="flex items-center justify-center gap-4 mt-6">
              <Button @click="restartQuiz" variant="outline">
                <RotateCcw class="h-4 w-4 mr-2" />
                Retake Quiz
              </Button>
              <Button asChild>
                <Link :href="`/events/${event.slug}`">
                  <ArrowLeft class="h-4 w-4 mr-2" />
                  Back to Event
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <!-- Detailed Results -->
        <div class="space-y-4">
          <h3 class="text-xl font-semibold">Review Your Answers</h3>
          
          <div v-for="(question, questionIndex) in quiz.questions" :key="question.id" class="space-y-2">
            <Card>
              <CardHeader class="pb-3">
                <CardTitle class="text-base flex items-center gap-2">
                  Question {{ questionIndex + 1 }}
                  <Badge 
                    :variant="selectedAnswers[questionIndex] && question.choices?.find(c => c.id === selectedAnswers[questionIndex])?.isCorrect ? 'default' : 'destructive'"
                    class="ml-2"
                  >
                    {{ selectedAnswers[questionIndex] && question.choices?.find(c => c.id === selectedAnswers[questionIndex])?.isCorrect ? 'Correct' : 'Incorrect' }}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent class="space-y-3">
                <p class="font-medium">{{ question.questionText }}</p>
                
                <div class="space-y-2">
                  <div 
                    v-for="(choice, choiceIndex) in question.choices" 
                    :key="choice.id"
                    class="p-2 rounded border"
                    :class="{
                      'bg-green-50 border-green-200': choice.isCorrect,
                      'bg-red-50 border-red-200': selectedAnswers[questionIndex] === choice.id && !choice.isCorrect,
                      'bg-gray-50': selectedAnswers[questionIndex] !== choice.id && !choice.isCorrect
                    }"
                  >
                    <div class="flex items-center gap-2">
                      <span class="font-semibold">{{ String.fromCharCode(65 + choiceIndex) }}.</span>
                      <span>{{ choice.choiceText }}</span>
                      <div class="ml-auto flex items-center gap-1">
                        <CheckCircle 
                          v-if="choice.isCorrect" 
                          class="h-4 w-4 text-green-600" 
                        />
                        <span 
                          v-if="selectedAnswers[questionIndex] === choice.id" 
                          class="text-xs font-medium px-2 py-1 rounded"
                          :class="choice.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                        >
                          Your Answer
                        </span>
                      </div>
                    </div>
                    
                    <!-- Show explanation for correct answer -->
                    <div v-if="choice.isCorrect && choice.explanation" class="mt-2 text-sm text-gray-600 pl-6">
                      <strong>Explanation:</strong> {{ choice.explanation }}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <Card v-else>
      <CardContent class="text-center py-12">
        <BookOpen class="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 class="text-lg font-semibold mb-2">No Questions Available</h3>
        <p class="text-muted-foreground mb-4">
          This quiz doesn't have any questions yet.
        </p>
        <Button asChild>
          <Link :href="`/events/${event.slug}`">
            <ArrowLeft class="h-4 w-4 mr-2" />
            Back to Event
          </Link>
        </Button>
      </CardContent>
    </Card>
  </div>
</template>
