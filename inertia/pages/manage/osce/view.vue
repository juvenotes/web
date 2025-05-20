<script setup lang="ts">
import type ConceptDto from '#dtos/concept'
import type PastPaperDto from '#dtos/past_paper'
import type QuestionDto from '#dtos/question'
import AdminLayout from '~/layouts/AdminLayout.vue'
import { FileText, Clock, Plus, Pencil, Trash2 } from 'lucide-vue-next'
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

const breadcrumbItems = computed(() => [
  { label: 'OSCEs', href: '/manage/osce' },
  { label: props.concept.title, href: `/manage/osce/${props.concept.slug}` },
  { label: props.paper.title },
])
</script>

<template>
  <AppHead :title="paper.title" :description="`View and manage ${paper.title}`" />

  <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
    <!-- Paper Header -->
    <div class="mb-4 sm:mb-8 space-y-4 sm:space-y-6">
      <!-- Navigation -->
      <BreadcrumbTrail :items="breadcrumbItems" />

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
            <span class="flex items-center gap-1">
              <Clock class="w-3.5 h-3.5" />
              Last edited: {{ lastEditDate }}
            </span>
          </div>
        </div>
        <div class="flex flex-col sm:flex-row items-stretch gap-2 sm:gap-4">
          <Button
            @click="showEditPaperDialog = true"
            variant="outline"
            class="flex items-center gap-2"
          >
            <Pencil class="h-4 w-4" /> Edit Paper
          </Button>
          <Button @click="handleDeletePaper" variant="destructive" class="flex items-center gap-2">
            <Trash2 class="h-4 w-4" /> Delete
          </Button>
          <Button @click="showAddOsceDialog = true" class="flex items-center gap-2">
            <Plus class="h-4 w-4" /> Add OSCE Question
          </Button>
        </div>
      </div>
    </div>

    <!-- Questions List -->
    <div v-if="questions.length" class="space-y-4">
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="question in questions"
          :key="question.id"
          class="group relative overflow-hidden rounded-2xl bg-white p-6 border border-slate-100 hover:border-primary/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
        >
          <div class="relative space-y-3">
            <h3 class="text-lg font-bold text-foreground">{{ question.questionText }}</h3>
            <div v-if="question.questionImagePath" class="flex justify-center mt-2">
              <img
                :src="question.questionImagePath"
                class="w-full h-auto rounded-lg border shadow-xs max-h-48 object-contain"
              />
            </div>
            <div class="mt-3 space-y-2">
              <div
                v-for="(part, partIndex) in question.stations"
                :key="part.id"
                class="p-3 bg-primary/5 rounded-lg border border-primary/10"
              >
                <div class="font-medium text-primary">Station {{ partIndex + 1 }}</div>
                <div class="text-sm text-foreground font-semibold">{{ part.partText }}</div>
                <div class="text-xs text-muted-foreground mt-1">Marks: {{ part.marks }}</div>
                <div v-if="part.imagePath" class="mt-2 flex justify-center">
                  <img
                    :src="part.imagePath"
                    class="w-full h-auto rounded border shadow-xs max-h-32 object-contain"
                  />
                </div>
                <div class="mt-2 text-xs text-muted-foreground">
                  Answer: {{ part.expectedAnswer }}
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2 mt-2">
              <Button size="sm" variant="outline" @click="handleEditQuestion(question)">
                <Pencil class="h-4 w-4" /> Edit
              </Button>
              <Button size="sm" variant="destructive" @click="handleDeleteQuestion(question)">
                <Trash2 class="h-4 w-4" /> Delete
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="text-center p-8 bg-white rounded-2xl border">
      <p class="text-muted-foreground">
        No OSCE questions added yet. Click "Add OSCE Question" to create one.
      </p>
    </div>
    <!-- Dialogs -->
    <EditOscePaperDialog v-model:open="showEditPaperDialog" :paper="paper" />
    <CreateOsceQuestionDialog v-model:open="showAddOsceDialog" :paper="paper" />
    <EditOsceQuestionDialog v-model:open="showEditOsceDialog" :question="selectedQuestion" />
  </div>
</template>
