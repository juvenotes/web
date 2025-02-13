<script setup lang="ts">
import type ConceptDto from '#dtos/concept'
import type PastPaperDto from '#dtos/past_paper'
import type QuestionDto from '#dtos/question'
import AdminLayout from '~/layouts/AdminLayout.vue'
import { FileText, ArrowLeft, Clock, Plus, Pencil, Trash2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { useForm } from '@inertiajs/vue3'
import { computed, ref } from 'vue'

defineOptions({ layout: AdminLayout })

interface Props {
  paper: PastPaperDto
  concept: ConceptDto
  questions: QuestionDto[]
}

const props = defineProps<Props>()
const showEditPaperDialog = ref(false)
const showAddOsceDialog = ref(false)
const showEditOsceDialog = ref(false)
const selectedQuestion = ref<QuestionDto | null>(null)

const lastEditDate = computed(() => {
  return new Date(
    props.paper.metadata?.lastEditedBy?.timestamp ?? props.paper.createdAt
  ).toLocaleDateString()
})

function handleDeletePaper() {
  if (!confirm('Are you sure you want to delete this OSCE paper?')) return

  const form = useForm({})

  form.delete(`/manage/osce/${props.concept.slug}/${props.paper.slug}`, {
    onSuccess: () => {
      toast.success('OSCE paper deleted successfully')
      window.location.href = `/manage/osce/${props.concept.slug}`
    },
    onError: () => {
      toast.error('Failed to delete OSCE paper')
    },
  })
}

function handleEditQuestion(question: QuestionDto) {
  showEditOsceDialog.value = true
  selectedQuestion.value = question
}

async function handleDeleteQuestion(question: QuestionDto) {
  if (!confirm('Are you sure you want to delete this question?')) return

  const form = useForm({})

  form.delete(`/manage/osce/${props.concept.slug}/${props.paper.slug}/questions/${question.slug}`, {
    preserveScroll: true,
    onSuccess: () => {
      toast.success('Question deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete question')
    },
  })
}

function goBack() {
  window.history.back()
}
</script>

<template>
  <AppHead :title="paper.title" :description="`View and manage ${paper.title}`" />

  <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
    <!-- Paper Header -->
    <div class="mb-4 sm:mb-8 space-y-4 sm:space-y-6">
      <!-- Navigation -->
      <nav class="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground">
        <button
          @click="goBack"
          class="flex items-center gap-1 sm:gap-2 text-primary hover:text-primary/70"
        >
          <ArrowLeft class="h-4 w-4" />
          Back to OSCEs
        </button>
        <span>/</span>
        <span class="truncate max-w-[200px] sm:max-w-none">{{ paper.title }}</span>
      </nav>

      <!-- Paper Info -->
      <div class="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
        <div class="space-y-1">
          <!-- Title section -->
          <div class="flex items-center gap-2 sm:gap-3">
            <div class="p-1.5 sm:p-2 rounded-lg bg-primary/5">
              <FileText class="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <h1 class="text-xl sm:text-2xl font-bold truncate">{{ paper.title }}</h1>
          </div>
          <!-- Metadata -->
          <div
            class="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground"
          >
            <span class="truncate max-w-[150px] sm:max-w-none">{{ concept.title }}</span>
            <span class="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
              OSCE
            </span>
            <span>{{ paper.year }}</span>
          </div>
          <div class="flex items-center gap-1 sm:gap-2 text-xs text-muted-foreground">
            <Clock class="h-3 w-3" />
            <span>Last edited {{ lastEditDate }}</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-2">
          <Button @click="showAddOsceDialog = true" class="flex items-center gap-2">
            <Plus class="h-4 w-4" />
            Add OSCE Question
          </Button>
          <Button variant="outline" @click="showEditPaperDialog = true">
            <Pencil class="h-4 w-4 mr-2" />Edit Paper
          </Button>
          <Button variant="destructive" @click="handleDeletePaper">
            <Trash2 class="h-4 w-4 mr-2" />Delete Paper
          </Button>
        </div>
      </div>
    </div>

    <!-- Questions List -->
    <div class="space-y-4">
      <template v-if="questions.length">
        <div
          v-for="(question, index) in questions"
          :key="question.id"
          class="p-4 sm:p-6 bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow"
        >
          <div class="space-y-3 sm:space-y-4">
            <!-- Question Header -->
            <div class="flex gap-2 sm:gap-3">
              <span
                class="shrink-0 px-2 py-1 bg-primary/10 text-primary rounded text-xs sm:text-sm font-medium"
              >
                Q{{ index + 1 }}
              </span>
              <p class="text-sm sm:text-base text-foreground">{{ question.questionText }}</p>
            </div>

            <!-- Question Image if present -->
            <img
              v-if="question.questionImagePath"
              :src="question.questionImagePath"
              :alt="`Question ${index + 1} image`"
              class="max-w-full h-auto rounded-lg"
            />

            <!-- Actions -->
            <div class="flex items-center gap-2">
              <Button variant="ghost" size="sm" @click="handleEditQuestion(question)">
                <Pencil class="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" @click="handleDeleteQuestion(question)">
                <Trash2 class="h-4 w-4 text-destructive" />
              </Button>
            </div>

                        <!-- OSCE Parts -->
            <div class="pl-6 sm:pl-10 space-y-3 sm:space-y-4">
              <div
                v-for="(part, index) in question.osceParts"
                :key="part.id"
                class="relative pl-4 border-l-2 border-primary/20 py-3"
              >
                <!-- Part Text -->
                <div class="flex justify-between items-start">
                  <div class="space-y-2">
                    <div class="flex items-center gap-2">
                      <span class="font-medium text-sm sm:text-base">Part {{ index + 1 }}</span>
                      <span class="text-xs sm:text-sm px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {{ part.marks }} marks
                      </span>
                    </div>
                    <p class="text-sm sm:text-base">{{ part.partText }}</p>
                  </div>
                </div>
            
                <!-- Expected Answer -->
                <div class="mt-3 bg-muted/50 rounded-lg p-3">
                  <p class="text-sm font-medium text-muted-foreground">Expected Answer:</p>
                  <div class="mt-2 text-sm sm:text-base whitespace-pre-wrap">{{ part.expectedAnswer }}</div>
                </div>
            
                <!-- Part Image if present -->
                <div v-if="part.imagePath" class="mt-3">
                  <img
                    :src="part.imagePath"
                    :alt="`Part ${index + 1} image`"
                    class="max-w-full h-auto rounded-lg border"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      <div v-else class="text-center py-12 bg-white rounded-xl border">
        <p class="text-muted-foreground">
          No questions added yet. Click "Add Question" to start building your OSCE paper.
        </p>
      </div>
    </div>
  </div>

  <!-- Dialogs -->
  <EditPaperDialog v-model:open="showEditPaperDialog" :paper="paper" :concept="concept" />
  <AddOsceDialog v-model:open="showAddOsceDialog" :paper="paper" :concept="concept" />
  <EditOsceDialog
    v-if="selectedQuestion"
    v-model:open="showEditOsceDialog"
    :concept="concept"
    :paper="paper"
    :question="selectedQuestion"
  />
</template>
