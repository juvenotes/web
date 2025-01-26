<script setup lang="ts">
import type ConceptDto from '#dtos/concept'
import type PastPaperDto from '#dtos/past_paper'
import type QuestionDto from '#dtos/question'
import AdminLayout from '~/layouts/AdminLayout.vue'
import { FileText, ArrowLeft, Plus, Upload, Clock } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import AddQuestionDialog from '~/components/AddQuestionDialog.vue'
import UploadQuestionsDialog from '~/components/UploadQuestionsDialog.vue'
import { ref, computed } from 'vue'

defineOptions({ layout: AdminLayout })

interface Props {
  paper: PastPaperDto
  concept: ConceptDto
  questions: QuestionDto[]
}

const props = defineProps<Props>()

const isAddDialogOpen = ref(false)
const isUploadDialogOpen = ref(false)

function goBack() {
  window.history.back()
}

const lastEditDate = computed(() => {
  return new Date(
    props.paper.metadata?.lastEditedBy?.timestamp ?? props.paper.createdAt
  ).toLocaleDateString()
})
</script>

<template>
  <AppHead :title="paper.title" :description="`View and manage ${paper.title}`" />

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <!-- Paper Header -->
    <div class="mb-8 space-y-6">
      <!-- Navigation -->
      <nav class="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          @click="goBack"
          class="flex items-center gap-2 text-primary hover:text-primary/70 transition-colors"
        >
          <ArrowLeft class="h-4 w-4" />
          Back to Papers
        </button>
        <span>/</span>
        <span>{{ paper.title }}</span>
      </nav>

      <!-- Paper Info -->
      <div class="flex flex-col gap-6 sm:flex-row sm:justify-between sm:items-start">
        <div class="space-y-1">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg bg-primary/5">
              <FileText class="h-5 w-5 text-primary" />
            </div>
            <h1 class="text-2xl font-bold">{{ paper.title }}</h1>
          </div>
          <div class="flex items-center gap-3 text-sm text-muted-foreground ml-10">
            <span>{{ concept.title }}</span>
            <span class="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
              {{ paper.examType }}
            </span>
            <span>{{ paper.year }}</span>
          </div>
          <div class="flex items-center gap-2 ml-10 mt-2 text-xs text-muted-foreground">
            <Clock class="h-3 w-3" />
            <span>Last edited {{ lastEditDate }}</span>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-3">
          <Button @click="isAddDialogOpen = true" class="w-full sm:w-auto">
            <Plus class="h-4 w-4 mr-2" />
            Add Question
          </Button>
          <Button variant="outline" @click="isUploadDialogOpen = true" class="w-full sm:w-auto">
            <Upload class="h-4 w-4 mr-2" />
            Upload Questions
          </Button>
        </div>
      </div>
    </div>

    <!-- Questions List -->
    <div class="space-y-6">
      <template v-if="questions.length">
        <div
          v-for="(question, index) in questions"
          :key="question.id"
          class="p-6 bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow"
        >
          <div class="space-y-4">
            <!-- Question Header -->
            <div class="flex gap-3">
              <span class="px-2 py-1 bg-primary/10 text-primary rounded text-sm font-medium">
                Q{{ index + 1 }}
              </span>
              <p class="text-foreground">{{ question.questionText }}</p>
            </div>

            <!-- MCQ Choices -->
            <div v-if="question.isMcq" class="pl-10 space-y-3">
              <div
                v-for="choice in question.choices"
                :key="choice.id"
                class="flex items-start gap-3 p-3 rounded-lg border"
              >
                <div
                  class="h-4 w-4 mt-1 rounded-full border"
                  :class="{ 'bg-primary border-primary': choice.isCorrect }"
                />
                <span class="text-muted-foreground">{{ choice.choiceText }}</span>
              </div>
            </div>

            <!-- SAQ Parts -->
            <div v-if="question.isSaq" class="pl-10 space-y-4">
              <div
                v-for="part in question.parts"
                :key="part.id"
                class="relative pl-4 border-l-2 border-primary/20"
              >
                <p class="font-medium">{{ part.partText }}</p>
                <p class="text-muted-foreground mt-1">{{ part.expectedAnswer }}</p>
                <p class="text-xs text-primary mt-2">{{ part.marks }} marks</p>
              </div>
            </div>
          </div>
        </div>
      </template>
      <div v-else class="text-center py-12 bg-white rounded-xl border">
        <p class="text-muted-foreground">
          No questions added yet. Click "Add Question" to start building your paper.
        </p>
      </div>
    </div>
  </div>

  <!-- Dialogs -->
  <AddQuestionDialog v-model:open="isAddDialogOpen" :paper="paper" :concept="concept" />
  <UploadQuestionsDialog v-model:open="isUploadDialogOpen" :paper="paper" :concept="concept" />
</template>