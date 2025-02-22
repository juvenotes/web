<script setup lang="ts">
import type ConceptDto from '#dtos/concept'
import type PastPaperDto from '#dtos/past_paper'
import type QuestionDto from '#dtos/question'
import DashLayout from '~/layouts/DashLayout.vue'
import { FileText, Circle, CheckCircle, XCircle, Settings } from 'lucide-vue-next'
import { computed, ref } from 'vue'

defineOptions({ layout: DashLayout })

interface Props {
  paper: PastPaperDto
  concept: ConceptDto
  questions: QuestionDto[]
  canManage: boolean
}

const props = defineProps<Props>()

const breadcrumbItems = computed(() => [
  { label: 'Papers', href: '/papers' },
  { label: props.concept.title, href: `/papers/${props.concept.slug}` },
  { label: props.paper.title },
])

const selectedAnswers = ref<Record<number, number | null>>({}) // to track selected answers
const showAnswer = ref<Record<number, boolean>>({}) // to show the answer explanation

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
            </div>
          </div>
        </div>
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

            <!-- Explanation for MCQ -->
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
              <!-- <div
                v-if="showAnswer[part.id]"
                class="mt-4 p-6 bg-[#CDE5ED] shadow-md rounded-lg border border-[#A8D3E7]"
              >
                <p class="text-base text-muted-foreground text-[#1F2937] font-medium">
                  <strong>Explanation:</strong> {{ part.expectedAnswer }}
                </p>
              </div> -->
              <div
                v-if="showAnswer[part.id]"
                class="mt-4 p-6 bg-[#CDE5ED] shadow-md rounded-lg border border-[#A8D3E7]"
              >
                <p class="text-base text-muted-foreground text-[#1F2937] font-medium">
                  <strong>Explanation:</strong>
                  <ViewExplanation :content="part.expectedAnswer" />
                </p>
              </div>
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
