<script setup lang="ts">
import type ConceptDto from '#dtos/concept'
import type PastPaperDto from '#dtos/past_paper'
import type QuestionDto from '#dtos/question'
import DashLayout from '~/layouts/DashLayout.vue'
import { FileText, ArrowLeft, Circle, CheckCircle, XCircle } from 'lucide-vue-next'
import { computed, ref } from 'vue'

defineOptions({ layout: DashLayout })

interface Props {
  paper: PastPaperDto
  concept: ConceptDto
  questions: QuestionDto[]
}

const props = defineProps<Props>() 

const selectedAnswers = ref<Record<number, number | null>>({}) // to track selected answers
const showAnswer = ref<Record<number, boolean>>({}) // to show the answer explanation

function goBack() {
  window.history.back()
}

const handleChoiceSelect = (questionId: number, choiceId: number) => {
  selectedAnswers.value[questionId] = choiceId
  showAnswer.value[questionId] = true
}

const getCorrectAnswer = (question: QuestionDto) => {
  return question.choices.find((choice) => choice.isCorrect)
}
const getLastEditDate = computed(() => {
  return new Date(
    props.paper.metadata?.lastEditedBy?.timestamp ?? props.paper.createdAt
  ).toLocaleDateString()
})
</script>

<template>
  <AppHead :title="paper.title" :description="`Questions for ${paper.title}`" />

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
    <!-- Header section remains same -->
    <div class="relative p-6 sm:p-8 bg-white/50 rounded-2xl border shadow-sm">
      <div
        class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-primary/50 to-transparent"
      />

      <!-- Back Button -->
      <button @click="goBack" class="flex items-center gap-2 text-primary hover:text-primary/70">
        <ArrowLeft class="h-5 w-5" />
        <span class="text-sm font-medium">Back to Papers</span>
      </button>

      <!-- Paper Info -->
      <div class="mt-4 flex items-center gap-4">
        <div class="p-3 rounded-xl bg-primary/5 border border-primary/10">
          <FileText class="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 class="text-2xl font-bold text-foreground">{{ paper.title }}</h1>
          <div class="flex items-center gap-3 mt-1">
            <span class="text-sm text-muted-foreground">{{ concept.title }}</span>
            <span class="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
              {{ paper.examType }}
            </span>
            <span class="text-sm text-muted-foreground">{{ paper.year }}</span>
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="paper.metadata?.lastEditedBy || paper.createdAt"
      class="text-sm text-muted-foreground"
    >
      Last edited on {{ getLastEditDate }}
    </div>

    <!-- Questions List -->
    <div class="space-y-6">
      <div
        v-for="(question, index) in questions"
        :key="question.id"
        class="p-6 bg-white rounded-xl border"
      >
        <!-- Question Text -->
        <div class="space-y-4">
          <div class="flex gap-3">
            <span class="flex-none px-2 py-1 bg-primary/10 text-primary rounded-lg font-medium">
              Q{{ index + 1 }}
            </span>
            <p class="text-foreground">{{ question.questionText }}</p>
          </div>

          <!-- MCQ Section -->
          <div v-if="question.isMcq" class="pl-10 space-y-3">
            <div
              v-for="choice in question.choices"
              :key="choice.id"
              :class="{
                'border-green-500': selectedAnswers[question.id] === choice.id && choice.isCorrect,
                'border-red-500': selectedAnswers[question.id] === choice.id && !choice.isCorrect,
                'hover:bg-slate-50': !showAnswer[question.id],
                'border-transparent': !selectedAnswers[question.id] && !showAnswer[question.id],
              }"
              class="flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-150"
              @click="handleChoiceSelect(question.id, choice.id)"
            >
              <CheckCircle
                v-if="showAnswer[question.id] && choice.isCorrect"
                class="h-4 w-4 mt-1 text-green-500"
              />
              <XCircle
                v-else-if="
                  showAnswer[question.id] &&
                  selectedAnswers[question.id] === choice.id &&
                  !choice.isCorrect
                "
                class="h-4 w-4 mt-1 text-red-500"
              />
              <Circle v-else class="h-4 w-4 mt-1 text-muted-foreground" />
              <span class="text-muted-foreground">{{ choice.choiceText }}</span>
            </div>
          </div>

          <!-- SAQ Section -->
          <div v-if="question.isSaq" class="pl-10 space-y-4">
            <div
              v-for="part in question.parts"
              :key="part.id"
              class="border-l-2 border-primary/20 pl-4"
            >
              <p class="text-foreground">{{ part.partText }}</p>
              <p class="text-xs text-primary mt-1">{{ part.marks }} marks</p>
            </div>
          </div>
        </div>

        <!-- Display Correct Answer and Explanation -->
        <div
          v-if="showAnswer[question.id]"
          class="mt-4 p-6 rounded-lg bg-[#CDE5ED] shadow-md border border-[#A8D3E7]"
        >
          <p class="text-lg font-semibold text-foreground">
            <strong>Correct Answer:</strong> {{ getCorrectAnswer(question)?.choiceText }}
          </p>
          <p class="mt-2 text-base text-muted-foreground">
            <strong>Explanation:</strong> {{ getCorrectAnswer(question)?.explanation }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
