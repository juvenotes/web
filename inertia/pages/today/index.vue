<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import type TodayDto from '#dtos/today'
import type QuestionDto from '#dtos/question'
import DashLayout from '~/layouts/DashLayout.vue'
import { Calendar, CheckCircle, Circle, XCircle } from 'lucide-vue-next'
import { ref, computed } from 'vue'
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
  return question.choices?.find(choice => choice.isCorrect)
}

// Handle selecting an answer AND check it immediately
const handleChoiceSelect = (questionId: number, choiceId: number) => {
  selectedAnswers.value[questionId] = choiceId
  showAnswer.value[questionId] = true

  // Get the selected choice to determine if it's correct
  const question = props.questions.find((q) => q.id === questionId)
  const choice = question?.choices?.find((c) => c.id === choiceId)

  if (question && choice) {
    recordResponse(questionId, choiceId, choice.isCorrect)
  }
}

async function recordResponse(questionId: number, choiceId: number, isCorrect: boolean) {
  try {
    await axios.post('/api/papers/record-response', {
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
      <div v-if="canManage">
        <Link href="/manage/today" class="text-primary hover:text-primary/70">
          Manage Questions
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

          <!-- Explanation Section - EXACTLY like papers/view -->
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
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
