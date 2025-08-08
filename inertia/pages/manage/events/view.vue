<script setup lang="ts">
import type EventDto from '#dtos/event'
import type EventQuizDto from '#dtos/event_quiz'
import type QuestionDto from '#dtos/question'
import AdminLayout from '~/layouts/AdminLayout.vue'
import {
  Calendar,
  Clock,
  Plus,
  Upload,
  Pencil,
  Trash,
  ChevronDown,
  ArrowLeft,
} from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'
import { useForm, Link } from '@inertiajs/vue3'

defineOptions({ layout: AdminLayout })

interface Props {
  event: EventDto
  quiz: EventQuizDto
  questions: QuestionDto[]
}

const props = defineProps<Props>()

async function handleDeleteQuestion(question: QuestionDto) {
  if (!confirm('Are you sure you want to delete this question?')) return

  const form = useForm({})

  form.delete(
    `/manage/events/${props.event.slug}/quiz/${props.quiz.id}/questions/${question.slug}`,
    {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Question deleted successfully')
      },
      onError: () => {
        toast.error('Failed to delete question')
      },
    }
  )
}

function handleDeleteQuiz() {
  if (!confirm('Are you sure you want to delete this quiz?')) return

  const form = useForm({})

  form.delete(`/manage/events/${props.event.slug}/quiz/${props.quiz.id}`, {
    onSuccess: () => {
      toast.success('Quiz deleted successfully')
      window.location.href = `/manage/events/${props.event.slug}`
    },
    onError: () => {
      toast.error('Failed to delete quiz')
    },
  })
}

function handleEditQuestion(question: QuestionDto) {
  if (question.isMcq) {
    showEditMcqDialog.value = true
    selectedQuestion.value = question
  }
}

const breadcrumbItems = computed(() => [
  { label: 'Events', href: '/manage/events' },
  { label: props.event.title, href: `/manage/events/${props.event.slug}` },
  { label: props.quiz.title },
])

const getLastEditDate = computed(() => {
  const date = new Date(props.quiz.createdAt)

  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).format(date)
})

const showAddMcqDialog = ref(false)
const showUploadDialog = ref(false)
const showEditMcqDialog = ref(false)
const selectedQuestion = ref<QuestionDto | null>(null)
</script>

<template>
  <AppHead :title="`${quiz.title} - ${event.title}`" />

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
    <!-- Header -->
    <div class="relative p-6 sm:p-8 bg-white/50 dark:bg-card rounded-2xl border shadow-sm dark:border-border">
      <div class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-primary/50 to-transparent" />
      
      <BreadcrumbTrail :items="breadcrumbItems" />

      <div class="mt-4 flex flex-col sm:flex-row gap-4 sm:items-start justify-between">
        <div class="flex items-start gap-4">
          <Link 
            :href="`/manage/events/${event.slug}`"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft class="h-5 w-5 text-gray-600" />
          </Link>
          
          <div class="p-3 rounded-xl bg-primary/5 border border-primary/10">
            <Calendar class="h-6 w-6 text-primary" />
          </div>

          <div class="space-y-2">
            <h1 class="text-2xl font-bold text-foreground">{{ quiz.title }}</h1>
            <div class="flex items-center gap-4 text-sm text-muted-foreground">
              <div class="flex items-center gap-1">
                <Clock class="h-4 w-4" />
                <span>Created {{ getLastEditDate }}</span>
              </div>
              <span>{{ questions.length }} questions</span>
            </div>
          </div>
        </div>

        <div class="flex gap-3">
          <Link 
            :href="`/events/${event.slug}/quiz/${quiz.id}`" 
            class="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <Eye class="h-4 w-4" />
            View Quiz (User)
          </Link>
          <Button 
            @click="handleDeleteQuiz"
            variant="outline"
            class="text-destructive hover:bg-destructive/10"
          >
            <Trash class="h-4 w-4 mr-2" />
            Delete Quiz
          </Button>
        </div>
      </div>
    </div>

    <!-- Question Actions -->
    <div class="flex justify-end gap-4">
      <Button @click="showUploadDialog = true" variant="outline" class="flex items-center gap-2">
        <Upload class="h-4 w-4" />
        Upload MCQs
      </Button>
      <Button @click="showAddMcqDialog = true" class="flex items-center gap-2">
        <Plus class="h-4 w-4" />
        Add MCQ
      </Button>
    </div>

    <!-- Questions List -->
    <div v-if="questions.length" class="space-y-4">
      <div
        v-for="(question, index) in questions"
        :key="question.id"
        class="bg-white rounded-lg border border-gray-200 p-6"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <span class="text-sm font-medium text-gray-500">Q{{ index + 1 }}</span>
            <Badge v-if="question.isMcq" class="bg-blue-100 text-blue-800">MCQ</Badge>
          </div>
          <div class="flex items-center gap-2">
            <Button
              @click="handleEditQuestion(question)"
              variant="ghost"
              size="sm"
            >
              <Pencil class="h-4 w-4" />
            </Button>
            <Button
              @click="handleDeleteQuestion(question)"
              variant="ghost"
              size="sm"
              class="text-destructive hover:text-destructive/90"
            >
              <Trash class="h-4 w-4" />
            </Button>
          </div>
        </div>

        <!-- Question Content -->
        <div class="space-y-4">
          <div class="prose prose-sm max-w-none">
            <div v-html="question.questionText"></div>
          </div>

          <!-- Question Image -->
          <div v-if="question.questionImagePath" class="mt-4">
            <img
              :src="question.questionImagePath"
              alt="Question image"
              class="max-w-md rounded-lg border"
            />
          </div>

          <!-- MCQ Choices -->
          <div v-if="question.isMcq && question.choices?.length" class="space-y-2">
            <div
              v-for="(choice, choiceIndex) in question.choices"
              :key="choice.id"
              class="flex items-start gap-3 p-3 rounded-lg"
              :class="choice.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-gray-50'"
            >
              <span class="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium"
                :class="choice.isCorrect ? 'bg-green-600 text-white' : 'bg-gray-400 text-white'"
              >
                {{ String.fromCharCode(65 + choiceIndex) }}
              </span>
              <div class="flex-1">
                <div v-html="choice.choiceText"></div>
                <div v-if="choice.isCorrect && choice.explanation" class="mt-2 text-sm text-green-700">
                  <strong>Explanation:</strong> {{ choice.explanation }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center p-8 bg-white rounded-2xl border border-slate-100">
      <div class="flex flex-col items-center gap-4">
        <div class="p-4 rounded-full bg-muted/20">
          <Calendar class="h-8 w-8 text-muted-foreground" />
        </div>
        <div class="space-y-2">
          <h3 class="text-lg font-semibold text-foreground">No questions yet</h3>
          <p class="text-muted-foreground">Start building your quiz by adding some questions.</p>
        </div>
        <div class="flex gap-3">
          <Button @click="showAddMcqDialog = true" class="flex items-center gap-2">
            <Plus class="h-4 w-4" />
            Add MCQ
          </Button>
          <Button @click="showUploadDialog = true" variant="outline" class="flex items-center gap-2">
            <Upload class="h-4 w-4" />
            Upload MCQs
          </Button>
        </div>
      </div>
    </div>
  </div>

  <!-- Dialogs -->
  <AddEventQuizMcqDialog
    v-model:open="showAddMcqDialog"
    :event="event"
    :quiz="quiz"
  />

  <UploadEventQuizDialog
    v-model:open="showUploadDialog"
    :event="event"
    :quiz="quiz"
  />

  <EditEventQuizMcqDialog
    v-if="selectedQuestion"
    v-model:open="showEditMcqDialog"
    :event="event"
    :quiz="quiz"
    :question="selectedQuestion"
  />
</template>