<script setup lang="ts">
import type ConceptDto from '#dtos/concept'
import type PastPaperDto from '#dtos/past_paper'
import type QuestionDto from '#dtos/question'
import AdminLayout from '~/layouts/AdminLayout.vue'
import { FileText, ArrowLeft, Plus, Circle, Upload } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import UploadQuestionsDialog from '~/components/UploadQuestionsDialog.vue'
import AddQuestionDialog from '~/components/AddQuestionDialog.vue'
import { ref } from 'vue'

defineOptions({ layout: AdminLayout })

interface Props {
  paper: PastPaperDto
  concept: ConceptDto
  questions: QuestionDto[]
}

defineProps<Props>()

const goBack = () => {
  window.history.back()
}
const isUploadDialogOpen = ref(false)
const isAddDialogOpen = ref(false)
</script>

<template>
  <AppHead :title="paper.title" :description="`Manage ${paper.title}`" />

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
    <!-- Header -->
    <div class="relative p-6 sm:p-8 bg-white/50 rounded-2xl border shadow-sm">
      <div
        class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-primary/50 to-transparent"
      />

      <button @click="goBack" class="flex items-center gap-2 text-primary hover:text-primary/70">
        <ArrowLeft class="h-5 w-5" />
        <span class="text-sm font-medium">Back to Papers</span>
      </button>

      <div class="flex items-start justify-between mt-4">
        <div class="flex items-start gap-4">
          <div class="p-3 rounded-xl bg-primary/5 border border-primary/10">
            <FileText class="h-6 w-6 text-primary" />
          </div>
          <div class="space-y-1">
            <h1 class="text-2xl font-bold text-foreground">{{ paper.title }}</h1>
            <div class="flex items-center gap-3">
              <span class="text-sm text-muted-foreground">{{ concept.title }}</span>
              <span class="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                {{ paper.examType }}
              </span>
              <span class="text-sm text-muted-foreground">{{ paper.year }}</span>
            </div>
          </div>
        </div>

        <Button @click="isAddDialogOpen = true" class="flex items-center gap-2">
          <Plus class="h-4 w-4" />
          Add Question
        </Button>
        <Button
          variant="outline"
          @click="isUploadDialogOpen = true"
          class="flex items-center gap-2"
        >
          <Upload class="h-4 w-4" />
          Upload Questions
        </Button>
      </div>
    </div>

    <!-- Questions Section -->
    <template v-if="questions.length">
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
                class="flex items-start gap-3 p-3 rounded-lg border"
              >
                <Circle class="h-4 w-4 mt-1 text-muted-foreground" />
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
        </div>
      </div>
    </template>
    <template v-else>
      <div class="p-6 sm:p-8 bg-white/50 rounded-2xl border shadow-sm text-center">
        <p class="text-muted-foreground">
          No questions added yet. Click "Add Question" to start building your paper.
        </p>
      </div>
    </template>
    <AddQuestionDialog v-model:open="isAddDialogOpen" :paper="paper" :concept="concept" />
    <UploadQuestionsDialog
      v-model:open="isUploadDialogOpen"
      :paper="paper"
      :concept="concept"
      @uploaded="(data: any) => console.log('Questions uploaded:', data)"
    />
  </div>
</template>
