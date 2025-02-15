<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import type ConceptDto from '#dtos/concept'
import type QuestionDto from '#dtos/question'
import { computed, ref, watchEffect } from 'vue'
import MdxContent from '~/components/MdxContent.vue'

import DashLayout from '~/layouts/DashLayout.vue'
import { BookOpen, Network, HelpCircle, Circle, Award, Settings } from 'lucide-vue-next'

defineOptions({ layout: DashLayout })

const props = defineProps<{
  concept: ConceptDto
  children: ConceptDto[]
  questions: QuestionDto[]
  content: string | null
  parentConcepts?: ConceptDto[]
  canManage: boolean
}>()

const children = ref(props.children)
const questions = ref(props.questions)
const content = computed(() => props.content || '')

const breadcrumbItems = computed(() => {
  const items = [{ label: 'Concepts', href: '/concepts' }]

  // Add parent concepts if they exist
  if (props.parentConcepts?.length) {
    props.parentConcepts.forEach((parent: ConceptDto) => {
      items.push({
        label: parent.title,
        href: `/concepts/${parent.slug}`,
      })
    })
  }

  // Add current concept
  items.push({
    label: props.concept.title,
    href: '',
  })

  return items
})

const getLastEditDate = computed(() => {
  return new Date(
    props.concept.metadata?.lastEditedBy?.timestamp ?? props.concept.createdAt
  ).toLocaleDateString()
})

watchEffect(() => {
  children.value = props.children
  questions.value = props.questions
})

const selectedAnswers = ref<Record<number, number | null>>({}) // to track selected answers
const showAnswer = ref<Record<number, boolean>>({}) // to show the answer explanation

const handleChoiceSelect = (questionId: number, choiceId: number) => {
  selectedAnswers.value[questionId] = choiceId
  showAnswer.value[questionId] = true
}

const getCorrectAnswer = (question: QuestionDto) => {
  return question.choices.find((choice) => choice.isCorrect)
}
</script>

<template>
  <AppHead :title="`${concept.title}`" description="All available concepts in Juvenotes" />
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
    <div class="space-y-8">
      <!-- Enhanced Title Section -->
      <div class="relative p-6 sm:p-8 bg-white/50 rounded-2xl border shadow-sm">
        <div
          class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-primary/50 to-transparent"
        />

        <BreadcrumbTrail :items="breadcrumbItems" />

        <div class="mt-4 flex flex-col sm:flex-row sm:items-start gap-4 justify-between">
          <div class="flex items-start gap-4">
            <div class="p-3 rounded-xl bg-primary/5 border border-primary/10 shrink-0">
              <BookOpen class="h-6 w-6 text-primary" />
            </div>
            <div class="space-y-1">
              <h1 class="text-2xl font-bold text-foreground">{{ concept.title }}</h1>
              <div
                v-if="concept.metadata?.lastEditedBy || concept.createdAt"
                class="text-sm text-muted-foreground"
              >
                Last edited {{ getLastEditDate }}
              </div>
            </div>
          </div>

          <!-- Manage button -->
          <Link
            v-if="canManage"
            :href="`/manage/concepts/${concept.slug}`"
            class="flex items-center justify-center gap-2 px-4 py-2 rounded-lg hover:bg-primary/5 transition-colors text-primary border border-primary/10 w-full sm:w-auto"
          >
            <Settings class="h-4 w-4" />
            <span class="text-sm font-medium">Edit</span>
          </Link>
        </div>
      </div>

      <!-- Modernized Child Concepts Grid -->
      <div v-if="children?.length" class="space-y-4">
        <div class="flex items-center gap-2">
          <Network class="h-5 w-5 text-primary" />
          <h2 class="text-lg font-semibold text-foreground">Related Concepts</h2>
        </div>

        <div class="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link
            v-for="child in children"
            :key="child.id"
            :href="`/concepts/${child.slug}`"
            class="group p-5 rounded-xl bg-white/50 backdrop-blur-sm border hover:border-primary/20 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 transform"
          >
            <h3
              class="text-base font-medium group-hover:text-primary transition-colors flex items-center gap-2"
            >
              <BookOpen class="h-4 w-4 text-primary/70" />
              {{ child.title }}
            </h3>
          </Link>
        </div>
      </div>

      <!-- Enhanced Main Content -->
      <div
        v-if="content"
        class="prose prose-primary max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-video:mx-auto prose-video:w-full"
      >
        <MdxContent :content="content" />
      </div>

      <!-- Modern Questions Section -->
      <div v-if="questions?.length" class="space-y-6">
        <div class="flex items-center gap-2">
          <HelpCircle class="h-5 w-5 text-primary" />
          <h2 class="text-lg font-semibold text-foreground">Practice Questions</h2>
        </div>

        <div class="space-y-6">
          <div
            v-for="question in questions"
            :key="question.id"
            class="p-6 rounded-xl bg-white/50 backdrop-blur-sm border shadow-md hover:shadow-xl transition-all duration-300"
          >
            <p class="font-medium text-foreground">{{ question.questionText }}</p>

            <!-- Enhanced MCQ Choices -->
            <div v-if="question.choices?.length" class="mt-4 space-y-2">
              <div
                v-for="choice in question.choices"
                :key="choice.id"
                :class="{
                  'border-green-500':
                    selectedAnswers[question.id] === choice.id && choice.isCorrect,
                  'border-red-500': selectedAnswers[question.id] === choice.id && !choice.isCorrect,
                  'hover:bg-primary/10': !showAnswer[question.id],
                }"
                class="flex items-start gap-3 p-3 rounded-lg border border-transparent hover:border-primary/20 transition-all duration-100 cursor-pointer"
                @click="handleChoiceSelect(question.id, choice.id)"
              >
                <Circle class="h-4 w-4 mt-0.5 text-muted-foreground" />
                <span class="text-muted-foreground">{{ choice.choiceText }}</span>
              </div>
            </div>

            <!-- Enhanced SAQ Parts -->
            <div v-if="question.parts?.length" class="mt-6 space-y-4">
              <div v-for="part in question.parts" :key="part.id" class="relative pl-6 py-3">
                <div
                  class="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/40 to-primary/10 rounded-full"
                />
                <p class="font-medium text-foreground">{{ part.partText }}</p>
                <p class="mt-2 text-muted-foreground">{{ part.expectedAnswer }}</p>
                <div class="flex items-center gap-2 mt-2">
                  <Award class="h-4 w-4 text-primary/70" />
                  <p class="text-xs text-primary/70 font-medium">{{ part.marks }} marks</p>
                </div>
              </div>
            </div>

            <!-- Display Correct Answer and Explanation -->
            <div
              v-if="showAnswer[question.id]"
              class="mt-4 p-4 rounded-lg bg-primary/5 text-muted-foreground"
            >
              <p class="font-medium text-foreground">
                <strong>Correct Answer: </strong>{{ getCorrectAnswer(question)?.choiceText }}
              </p>
              <p><strong>Explanation: </strong>{{ getCorrectAnswer(question)?.explanation }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style>
/* Video Container Styles */
.prose iframe {
  aspect-ratio: 16/9;
  width: 100%;
  max-width: 100%;
  margin: 2rem auto;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  position: relative;
  z-index: 10;
}

/* Responsive breakpoints */
@media (min-width: 768px) {
  .prose iframe {
    max-width: 80%;
  }
}

@media (min-width: 1024px) {
  .prose iframe {
    max-width: 70%;
  }
}

/* YouTube specific wrapper */
.prose .youtube-wrapper {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; /* 16:9 */
  height: 0;
  overflow: visible;
  margin: 2rem auto;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.prose .youtube-wrapper iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  z-index: 20;
}
</style>
