<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import type ConceptDto from '#dtos/concept'
import type QuestionDto from '#dtos/question'
import type UserStudySessionDto from '#dtos/user_study_session'
import { computed, ref, watchEffect, onMounted } from 'vue'

import DashLayout from '~/layouts/DashLayout.vue'
import { BookOpen, Network, HelpCircle, Circle, Award, Settings } from 'lucide-vue-next'
import axios from 'axios'

defineOptions({ layout: DashLayout })

const props = defineProps<{
  concept: ConceptDto
  children: ConceptDto[]
  questions: QuestionDto[]
  content: string | null
  parentConcepts?: ConceptDto[]
  canManage: boolean
  studySession?: UserStudySessionDto
}>()

const children = ref(props.children)
const questions = ref(props.questions)
const content = computed(() => props.content || '')
const studySession = ref(props.studySession)

// Create a study session if one wasn't provided by the server
onMounted(async () => {
  if (!studySession.value) {
    try {
      const response = await axios.post('/api/study-sessions', {
        resourceType: 'concept',
        resourceId: props.concept.id,
      })
      studySession.value = response.data
    } catch (error) {
      console.error('Failed to create study session:', error)
    }
  }
})

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
  const date = new Date(props.concept.metadata?.lastEditedBy?.timestamp ?? props.concept.createdAt)

  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).format(date)
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
  <AppHead :title="`${concept.title}`" :description="`Learn about ${concept.title} in Juvenotes`" />
  
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
    <!-- Header Section -->
    <div
      class="relative p-6 sm:p-8 bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
    >
      <!-- Gradient Top Border -->
      <div
        class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#55A9C4] via-[#55A9C4]/50 to-transparent rounded-t-xl sm:rounded-t-2xl"
      />

      <BreadcrumbTrail :items="breadcrumbItems" class="mb-4" />

      <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-6">
        <!-- Icon and Title -->
        <div class="flex items-start gap-3 sm:gap-4 flex-1">
          <div
            class="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-[#55A9C4]/10 border border-[#55A9C4]/20 hover:bg-[#55A9C4]/20 transition-colors duration-200"
          >
            <BookOpen class="h-5 w-5 text-[#55A9C4]" />
          </div>
          <div class="space-y-1.5 sm:space-y-2">
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              {{ concept.title }}
            </h1>
            <div
              v-if="concept.metadata?.lastEditedBy || concept.createdAt"
              class="text-sm text-gray-500"
            >
              Last updated {{ getLastEditDate }}
            </div>
          </div>
        </div>

        <!-- Manage Button -->
        <div class="w-full sm:w-auto flex-shrink-0">
          <Link
            v-if="canManage"
            :href="`/manage/concepts/${concept.slug}`"
            class="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#55A9C4] hover:bg-[#4795af] transition-colors text-white text-sm font-medium hover:shadow-xs transition-all duration-200"
          >
            <Settings class="h-4 w-4" />
            <span>Edit Concept</span>
          </Link>
        </div>
      </div>
    </div>

    <!-- Related Concepts Section -->
    <div v-if="children?.length" class="space-y-5 sm:space-y-6">
      <div class="flex items-center gap-2">
        <Network class="h-5 w-5 flex-shrink-0 text-[#55A9C4]" />
        <h2 class="text-lg sm:text-xl font-semibold text-gray-900">Related Concepts</h2>
      </div>

      <div class="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          v-for="child in children"
          :key="child.id"
          :href="`/concepts/${child.slug}`"
          class="group relative overflow-hidden rounded-xl bg-white p-4 sm:p-5 border border-gray-100 hover:border-[#55A9C4]/30 hover:shadow-xs transition-all duration-300"
        >
          <div
            class="absolute inset-0 bg-gradient-to-br from-[#55A9C4]/5 via-[#55A9C4]/3 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"
          />
          <div
            class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#55A9C4] via-[#55A9C4]/50 to-transparent"
          />

          <div class="relative flex items-center gap-3">
            <BookOpen class="h-5 w-5 flex-shrink-0 text-[#55A9C4]/70" />
            <h3 class="text-sm sm:text-base font-medium text-gray-900 group-hover:text-[#55A9C4]">
              {{ child.title }}
            </h3>
          </div>
        </Link>
      </div>
    </div>

    <!-- Content Section -->
    <div
      v-if="content"
      class="prose prose-sm sm:prose-base max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-[#55A9C4] hover:prose-a:text-[#4795af] prose-video:mx-auto prose-video:w-full"
    >
      <MdxContent :content="content" />
    </div>

    <!-- Practice Questions Section -->
    <div v-if="questions?.length" class="space-y-6">
      <div class="flex items-center gap-2">
        <HelpCircle class="h-5 w-5 text-[#55A9C4]" />
        <h2 class="text-lg sm:text-xl font-semibold text-gray-900">Practice Questions</h2>
      </div>

      <div class="space-y-5 sm:space-y-6">
        <div
          v-for="question in questions"
          :key="question.id"
          class="p-5 sm:p-6 rounded-xl bg-white border border-gray-100 shadow-xs hover:shadow-sm transition-all duration-300"
        >
          <p class="font-medium text-gray-900">{{ question.questionText }}</p>

          <!-- MCQ Choices -->
          <div v-if="question.choices?.length" class="mt-4 space-y-2">
            <div
              v-for="choice in question.choices"
              :key="choice.id"
              :class="{
                'border-green-500 bg-green-50':
                  selectedAnswers[question.id] === choice.id && choice.isCorrect,
                'border-red-500 bg-red-50':
                  selectedAnswers[question.id] === choice.id && !choice.isCorrect,
                'hover:bg-[#55A9C4]/5': !showAnswer[question.id],
              }"
              class="flex items-start gap-3 p-3 rounded-lg border border-gray-200 transition-all duration-200 cursor-pointer"
              @click="handleChoiceSelect(question.id, choice.id)"
            >
              <Circle class="h-4 w-4 mt-0.5 text-gray-400" />
              <span class="text-gray-700">{{ choice.choiceText }}</span>
            </div>
          </div>

          <!-- SAQ Parts -->
          <div v-if="question.parts?.length" class="mt-5 space-y-4">
            <div v-for="part in question.parts" :key="part.id" class="relative pl-6 py-3">
              <div
                class="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#55A9C4]/40 to-[#55A9C4]/10 rounded-full"
              />
              <p class="font-medium text-gray-900">{{ part.partText }}</p>
              <p class="mt-2 text-gray-600">{{ part.expectedAnswer }}</p>
              <div class="flex items-center gap-2 mt-2">
                <Award class="h-4 w-4 text-[#55A9C4]/70" />
                <p class="text-xs text-[#55A9C4]/70 font-medium">{{ part.marks }} marks</p>
              </div>
            </div>
          </div>

          <!-- Answer Explanation -->
          <div
            v-if="showAnswer[question.id]"
            class="mt-4 p-4 rounded-lg bg-[#55A9C4]/5 text-gray-700 border border-[#55A9C4]/10"
          >
            <p class="font-medium text-gray-900">
              <span class="text-[#55A9C4]">Correct Answer:</span> {{ getCorrectAnswer(question)?.choiceText }}
            </p>
            <p class="mt-2">
              <span class="text-[#55A9C4]">Explanation:</span> {{ getCorrectAnswer(question)?.explanation }}
            </p>
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
  margin: 1.5rem auto;
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
  margin: 1.5rem auto;
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

/* Smooth transitions */
a, button, .transition-all {
  transition-property: color, background-color, border-color, transform, opacity, box-shadow;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .max-w-7xl {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>