<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import type TodayDto from '#dtos/today'
import type QuestionDto from '#dtos/question'
import DashLayout from '~/layouts/DashLayout.vue'
import { Calendar, CheckCircle, Circle, XCircle, Settings, Info } from 'lucide-vue-next'
import { ref, computed, onMounted } from 'vue'
import { DateTime } from 'luxon'
import axios from 'axios'

defineOptions({ layout: DashLayout })

interface Props {
  today: TodayDto
  questions: QuestionDto[]
  canManage: boolean
  isActive: boolean
}

const props = defineProps<Props>()

// Match papers/view.vue naming exactly
const selectedAnswers = ref<Record<number, number>>({}) // questionId -> choiceId
const showAnswer = ref<Record<number, boolean>>({}) // questionId -> boolean

// Load previously answered questions from localStorage
onMounted(() => {
  // Only restore if we have an active question
  if (props.today?.id) {
    const savedAnswers = localStorage.getItem(`today-answers-${props.today.id}`)
    const savedShownAnswers = localStorage.getItem(`today-shown-${props.today.id}`)

    if (savedAnswers) {
      selectedAnswers.value = JSON.parse(savedAnswers)
    }

    if (savedShownAnswers) {
      showAnswer.value = JSON.parse(savedShownAnswers)
    }
  }
})

// Format the scheduled date for display
const formattedDate = computed(() => {
  if (!props.today) return null
  try {
    return DateTime.fromISO(props.today.scheduledFor).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)
  } catch (e) {
    return props.today.scheduledFor
  }
})

function getCorrectAnswer(question: QuestionDto) {
  return question.choices?.find((choice) => choice.isCorrect)
}

// Handle selecting an answer AND check it immediately
const handleChoiceSelect = (questionId: number, choiceId: number) => {
  selectedAnswers.value[questionId] = choiceId
  showAnswer.value[questionId] = true

  // Save to localStorage
  if (props.today?.id) {
    localStorage.setItem(`today-answers-${props.today.id}`, JSON.stringify(selectedAnswers.value))
    localStorage.setItem(`today-shown-${props.today.id}`, JSON.stringify(showAnswer.value))
  }

  // Get the selected choice to determine if it's correct
  const question = props.questions.find((q) => q.id === questionId)
  const choice = question?.choices?.find((c) => c.id === choiceId)

  if (question && choice) {
    recordResponse(questionId, choiceId, choice.isCorrect)
  }
}

async function recordResponse(questionId: number, choiceId: number, isCorrect: boolean) {
  try {
    await axios.post('/api/papers/record-mcq-response', {
      paperId: props.today.id, // Use today ID here
      questionId,
      choiceId,
      isCorrect,
      source: 'today', // Explicitly specify this is from Today
    })
  } catch (error) {
    console.error('Failed to record response', error)
  }
}
</script>

<template>
  <AppHead title="Question of the Day" description="Daily question to test your knowledge" />
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-foreground">Question of the Day</h1>
      <div v-if="canManage" class="flex items-center gap-2">
        <Link
          href="/manage/today"
          class="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/5 hover:bg-primary/10 transition-all duration-200 text-primary border border-primary/15 shadow-sm hover:shadow"
        >
          <Settings class="h-4 w-4" />
          <span class="text-sm font-medium">Edit</span>
        </Link>
      </div>
    </div>

    <!-- No active question state -->
    <div v-if="!isActive || !today" class="text-center py-12 bg-white rounded-xl border shadow-sm">
      <Calendar class="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
      <h2 class="text-xl font-medium text-foreground mb-2">No active question today</h2>
      <p class="text-muted-foreground mb-8">
        Check back soon for a new question to test your knowledge!
      </p>
    </div>

    <!-- Active question -->
    <div v-else class="space-y-6">
      <!-- Today header -->
      <div class="relative p-6 bg-white rounded-xl border shadow-sm">
        <div
          class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent"
        />
        <div class="flex items-center gap-4">
          <div class="p-3 rounded-xl bg-primary/5 border border-primary/10">
            <Calendar class="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 class="text-xl font-semibold">{{ today.title }}</h2>
            <p v-if="formattedDate" class="text-sm text-muted-foreground">{{ formattedDate }}</p>
          </div>
        </div>
      </div>

      <!-- Questions -->
      <div
        v-for="(question, index) in questions"
        :key="question.id"
        class="p-4 sm:p-6 bg-white rounded-xl border"
      >
        <!-- Question Text - EXACTLY like papers/view -->
        <div class="flex flex-col gap-2">
          <span
            class="inline-block w-fit px-4 py-1.5 bg-primary/10 text-primary rounded-lg font-semibold text-lg"
          >
            Question {{ index + 1 }}
          </span>
          <p class="text-foreground pl-1">{{ question.questionText }}</p>
        </div>

        <!-- MCQ choices - EXACTLY like papers/view -->
        <div v-if="question.choices?.length" class="p-auto space-y-3 mt-4">
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

          <!-- Explanation Section - UPDATED to match the second file -->
          <div v-if="showAnswer[question.id]" class="mt-6 sm:mt-8 animate-fadeIn">
            <!-- Header with elegant design -->
            <div class="flex items-center gap-2 mb-4">
              <div class="h-6 w-1 bg-green-500 rounded-full"></div>
              <h3 class="text-lg font-bold text-gray-800">Solution Explanation</h3>
            </div>
            
            <!-- Modern card with sidebar accent -->
            <div class="relative overflow-hidden rounded-xl shadow-lg border border-gray-100 w-full">
              <!-- Left accent border -->
              <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-green-400 to-blue-500"></div>
              
              <!-- Answer header -->
              <div class="p-4 sm:p-5 md:p-6 bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-100">
                <div class="flex items-center gap-3">
                  <div class="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600">
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
              
              <!-- Explanation content with visual separation -->
              <div class="p-4 sm:p-6 md:p-8 bg-white">
                <div class="flex gap-3 items-start">
                  <div class="shrink-0 pt-1">
                    <div class="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                      <Info class="h-3 w-3 text-blue-600" />
                    </div>
                  </div>
                  <div class="text-sm sm:text-base text-gray-700 font-medium break-words leading-relaxed explanation-content w-full">
                    <ViewExplanation :content="getCorrectAnswer(question)?.explanation || ''" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Navigation buttons -->
            <div class="mt-6 flex flex-wrap gap-3">
              <Link
                href="/learn"
                class="flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-gray-50 text-primary border border-primary/30 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow"
              >
                <span>Go to Dashboard</span>
              </Link>

              <Link
                href="/papers"
                class="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow"
              >
                <span>Explore Past Papers</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
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
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    
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

/* Enhanced animation for smoother transitions */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fadeIn {
  animation: fadeIn 0.4s ease-out forwards;
}
</style>