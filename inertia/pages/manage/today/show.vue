<script setup lang="ts">
import { Link, useForm } from '@inertiajs/vue3'
import type TodayDto from '#dtos/today'
import type QuestionDto from '#dtos/question'
import AdminLayout from '~/layouts/AdminLayout.vue'
import {
  Calendar,
  Plus,
  ArrowLeft,
  Pencil,
  Trash2,
  CheckCircle,
  Circle,
  ChevronDown,
  Archive,
} from 'lucide-vue-next'
import { TodayStatus } from '#enums/today_status'
import { computed, ref } from 'vue'
import { DateTime } from 'luxon'

defineOptions({ layout: AdminLayout })

interface Props {
  today: TodayDto
  questions: QuestionDto[]
  canManage: boolean
}

const props = defineProps<Props>()
const showAddQuestionDialog = ref(false)
const showEditTodayDialog = ref(false)
const showEditQuestionDialog = ref(false)
const selectedQuestion = ref<QuestionDto | null>(null)

// Format the scheduled date for display
const formattedDate = computed(() => {
  try {
    return DateTime.fromISO(props.today.scheduledFor).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)
  } catch (e) {
    return props.today.scheduledFor
  }
})

const statusColors = {
  [TodayStatus.ACTIVE]: 'bg-green-100 text-green-700',
  [TodayStatus.SCHEDULED]: 'bg-blue-100 text-blue-700',
  [TodayStatus.ARCHIVED]: 'bg-gray-100 text-gray-600',
}

// Delete form
const deleteForm = useForm({})

const handleDelete = () => {
  if (confirm('Are you sure you want to delete this item?')) {
    deleteForm.delete(`/manage/today/${props.today.slug}`, {
      onSuccess: () => {
        // Will redirect to index
      },
    })
  }
}

// Delete question form
const deleteQuestionForm = useForm({})

const handleDeleteQuestion = (questionId: number) => {
  if (confirm('Are you sure you want to delete this question?')) {
    deleteQuestionForm.delete(`/manage/today/${props.today.slug}/questions/${questionId}`, {
      preserveScroll: true,
    })
  }
}

// Activate form
const activateForm = useForm({
  status: TodayStatus.ACTIVE,
})

const handleActivate = () => {
  activateForm.put(`/manage/today/${props.today.slug}`, {
    preserveScroll: true,
  })
}

// Archive form
const archiveForm = useForm({
  status: TodayStatus.ARCHIVED,
})

const handleArchive = () => {
  archiveForm.put(`/manage/today/${props.today.slug}`, {
    preserveScroll: true,
  })
}

const handleEditQuestion = (question: QuestionDto) => {
  selectedQuestion.value = question
  showEditQuestionDialog.value = true
}

const breadcrumbItems = computed(() => [
  { label: 'Today', href: '/manage/today' },
  { label: props.today.title },
])
</script>

<template>
  <AppHead :title="today.title" :description="`Manage question of the day: ${today.title}`" />
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
    <!-- Header Section -->
    <div class="relative p-6 sm:p-8 bg-white/50 rounded-2xl border shadow-sm">
      <div
        class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-primary/50 to-transparent"
      />

      <BreadcrumbTrail :items="breadcrumbItems" />

      <!-- Back Button -->
      <Link
        href="/manage/today"
        class="flex items-center gap-2 text-primary hover:text-primary/70 mt-4"
      >
        <ArrowLeft class="h-4 w-4" />
        <span class="text-sm font-medium">Back to List</span>
      </Link>

      <!-- Title and Metadata -->
      <div class="mt-4 flex flex-col sm:flex-row sm:items-start gap-4 justify-between">
        <div class="flex items-start gap-4">
          <div class="p-3 rounded-xl bg-primary/5 border border-primary/10">
            <Calendar class="h-6 w-6 text-primary" />
          </div>
          <div class="space-y-2">
            <div class="flex items-center gap-3">
              <h1 class="text-2xl font-bold text-foreground">{{ today.title }}</h1>
            </div>

            <div class="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <div class="flex items-center gap-1">
                <Calendar class="h-4 w-4" />
                <span>{{ formattedDate }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons with Dropdown -->
        <div class="flex flex-wrap gap-2">
          <!-- Make Active Button - Most important action when available -->
          <Button
            v-if="today.status === TodayStatus.SCHEDULED"
            @click="handleActivate"
            variant="success"
            class="flex items-center gap-2"
            :disabled="activateForm.processing"
          >
            <CheckCircle class="h-4 w-4 mr-1" />
            <span>Make Active</span>
          </Button>

          <!-- Add Question Button - Secondary when Make Active is available -->
          <Button
            @click="showAddQuestionDialog = true"
            class="flex items-center gap-2"
          >
            <Plus class="h-4 w-4 mr-1" />
            <span>Add Question</span>
          </Button>

          <!-- More actions dropdown -->
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline"> Actions <ChevronDown class="ml-2 h-4 w-4" /> </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class="w-48">
              <!-- Status change option for archive -->
              <DropdownMenuItem
                v-if="today.status === TodayStatus.ACTIVE"
                @click="handleArchive"
                :disabled="archiveForm.processing"
              >
                <Archive class="h-4 w-4 mr-2" />
                Archive
              </DropdownMenuItem>

              <!-- Edit option -->
              <DropdownMenuItem @click="showEditTodayDialog = true">
                <Pencil class="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <!-- Delete option -->
              <DropdownMenuItem @click="handleDelete" class="text-destructive">
                <Trash2 class="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>

    <span class="px-2.5 py-0.5 rounded-md text-xs font-medium" :class="statusColors[today.status]">
      {{ today.status.charAt(0).toUpperCase() + today.status.slice(1) }}
    </span>

    <!-- Questions Section -->
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold">Questions</h2>
      </div>

      <!-- Questions List -->
      <div v-if="questions.length" class="space-y-4">
        <div
          v-for="question in questions"
          :key="question.id"
          class="p-6 bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow"
        >
          <!-- Question Content -->
          <div class="space-y-4">
            <!-- Question Text -->
            <div>
              <h3 class="text-lg font-medium text-foreground">{{ question.questionText }}</h3>

              <!-- Question type badge -->
              <div class="mt-1.5 flex items-center gap-2">
                <span class="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                  {{ question.isMcq ? 'MCQ' : question.isSaq ? 'SAQ' : 'Question' }}
                </span>
              </div>
            </div>

            <!-- MCQ Choices -->
            <div v-if="question.choices?.length" class="pl-4 space-y-2">
              <div
                v-for="choice in question.choices"
                :key="choice.id"
                class="flex items-start gap-3 p-3 rounded-lg border"
                :class="{ 'border-green-500 bg-green-50': choice.isCorrect }"
              >
                <div class="flex-shrink-0 w-5 h-5 flex items-center justify-center mt-0.5">
                  <CheckCircle v-if="choice.isCorrect" class="h-4 w-4 text-green-500" />
                  <Circle v-else class="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <span class="text-sm text-muted-foreground">{{ choice.choiceText }}</span>
                  <p
                    v-if="choice.isCorrect && choice.explanation"
                    class="text-sm text-muted-foreground mt-1"
                  >
                    <span class="font-medium">Explanation:</span>
                    <ViewExplanation :content="choice.explanation" />
                  </p>
                </div>
              </div>
            </div>

            <!-- Action buttons for each question -->
            <div class="flex items-center gap-3 justify-end">
              <Button @click="handleEditQuestion(question)" variant="outline" size="sm">
                <Pencil class="h-3.5 w-3.5 mr-2" />Edit
              </Button>

              <Button
                variant="outline"
                size="sm"
                class="text-red-600 hover:bg-red-50"
                @click="handleDeleteQuestion(question.id)"
              >
                <Trash2 class="h-3.5 w-3.5 mr-2" />Remove
              </Button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12 bg-white rounded-xl border">
        <Calendar class="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <h3 class="text-xl font-medium text-foreground mb-2">No questions added yet</h3>
        <p class="text-muted-foreground mb-6">Add your first question to this item</p>
        <Button @click="showAddQuestionDialog = true">
          <Plus class="h-4 w-4 mr-2" />Add First Question
        </Button>
      </div>
    </div>

    <!-- Dialogs -->
    <AddMcqToTodayDialog v-model:open="showAddQuestionDialog" :today="today" />

    <EditMcqToTodayDialog
      v-if="selectedQuestion"
      v-model:open="showEditQuestionDialog"
      :today="today"
      :question="selectedQuestion"
    />

    <EditTodayDialog v-model:open="showEditTodayDialog" :today="today" />
  </div>
</template>
