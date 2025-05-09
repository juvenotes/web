<script setup lang="ts">
import type ConceptDto from '#dtos/concept'
import type PastPaperDto from '#dtos/past_paper'
import type QuestionDto from '#dtos/question'
import AdminLayout from '~/layouts/AdminLayout.vue'
import {
  FileText,
  Clock,
  Plus,
  Upload,
  Pencil,
  Trash2,
  ChevronDown,
  MessageSquare,
} from 'lucide-vue-next'
import { computed, ref, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { useForm } from '@inertiajs/vue3'
import QuestionFeedbackDto from '#dtos/question_feedback'
import axios from 'axios'
import { router } from '@inertiajs/vue3'

defineOptions({ layout: AdminLayout })

interface Props {
  paper: PastPaperDto
  concept: ConceptDto
  questions: QuestionDto[]
  feedbackCountMap: Record<number, number>
  questionFeedbackMap: Record<number, QuestionFeedbackDto[]>
}

const props = defineProps<Props>()

interface ParsingStatus {
  total: number
  current: number
  successCount: number
  errorCount: number
  isProcessing: boolean
  currentStem?: string
}

const parsingStatus = ref<ParsingStatus>({
  total: 0,
  current: 0,
  successCount: 0,
  errorCount: 0,
  isProcessing: false,
})

const uploadProgress = computed(() => {
  if (!parsingStatus.value.total) return 0
  return Math.round((parsingStatus.value.current / parsingStatus.value.total) * 100)
})

const onParseProgress = (status: ParsingStatus) => {
  parsingStatus.value = status
}

async function handleDeleteQuestion(question: QuestionDto) {
  if (!confirm('Are you sure you want to delete this question?')) return

  const form = useForm({})

  form.delete(
    `/manage/papers/${props.concept.slug}/${props.paper.slug}/questions/${question.slug}`,
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

function handleDeletePaper() {
  if (!confirm('Are you sure you want to delete this paper?')) return

  const form = useForm({})

  form.delete(`/manage/papers/${props.concept.slug}/${props.paper.slug}`, {
    onSuccess: () => {
      toast.success('Paper deleted successfully')
      window.location.href = `/manage/papers/${props.concept.slug}`
    },
    onError: () => {
      toast.error('Failed to delete paper')
    },
  })
}

function handleEditQuestion(question: QuestionDto) {
  if (question.isMcq) {
    showEditMcqDialog.value = true
    selectedQuestion.value = question
  } else if (question.isSaq) {
    showEditSaqDialog.value = true
    selectedQuestion.value = question
  }
}

onMounted(() => {
  // Debug image paths
  console.log(
    'Image paths in questions:',
    props.questions
      .filter((q) => q.questionImagePath)
      .map((q) => ({ id: q.id, path: q.questionImagePath }))
  )
})

function markFeedbackAsResolved(feedbackId: number) {
  axios
    .post(`/api/feedback/${feedbackId}/resolve`)
    .then(() => {
      toast.success('Feedback marked as resolved')
      // Reload just the feedback data
      router.reload({ only: ['feedbackCountMap', 'questionFeedbackMap'] })
    })
    .catch((error) => {
      console.error('Failed to mark feedback as resolved:', error)
      toast.error('Failed to mark feedback as resolved')
    })
}

const breadcrumbItems = computed(() => [
  { label: 'Papers', href: '/manage/papers' },
  { label: props.concept.title, href: `/manage/papers/${props.concept.slug}` },
  { label: props.paper.title },
])

const getLastEditDate = computed(() => {
  const date = new Date(props.paper.metadata?.lastEditedBy?.timestamp ?? props.paper.createdAt)

  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).format(date)
})
const showAddMcqDialog = ref(false)
const showAddSaqDialog = ref(false)
const showUploadDialog = ref(false)
const showUploadPdfDialog = ref(false)
const showEditMcqDialog = ref(false)
const showEditSaqDialog = ref(false)
const showEditPaperDialog = ref(false)
const selectedQuestion = ref<QuestionDto | null>(null)
// const expandedQuestions = ref<Record<number, boolean>>({})

// function toggleQuestion(id: number) {
//   expandedQuestions.value[id] = !expandedQuestions.value[id]
// }
</script>

<template>
  <AppHead :title="paper.title" :description="`View and manage ${paper.title}`" />

  <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
    <!-- Paper Header -->
    <div class="mb-4 sm:mb-8 space-y-4 sm:space-y-6">
      <!-- Navigation -->
      <BreadcrumbTrail :items="breadcrumbItems" />

      <!-- Paper Info -->
      <!-- Paper Header - Updated with consistent dropdown pattern -->
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
            class="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground ml-8 sm:ml-10"
          >
            <span class="truncate max-w-[150px] sm:max-w-none">{{ concept.title }}</span>
            <span
              class="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0"
            >
              {{ paper.examType.toUpperCase() }}
            </span>
            <span class="shrink-0">{{ paper.year }}</span>
          </div>
          <div
            class="flex items-center gap-1 sm:gap-2 ml-8 sm:ml-10 mt-2 text-xs text-muted-foreground"
          >
            <Clock class="h-3 w-3" />
            <span>Last edited {{ getLastEditDate }}</span>
          </div>
        </div>

        <!-- Actions Menu (Both mobile and desktop) -->
        <div class="flex flex-col sm:flex-row gap-2">
          <ToggleUrl class="w-full sm:w-auto" />

          <!-- Primary actions as buttons -->
          <Button class="w-full sm:w-auto" @click="showAddMcqDialog = true">
            <Plus class="h-4 w-4 mr-2" />Add MCQ
          </Button>

          <!-- Secondary actions in dropdown -->
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" class="w-full sm:w-auto">
                More Actions <ChevronDown class="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class="w-56">
              <DropdownMenuItem @click="showAddSaqDialog = true">
                <Plus class="mr-2 h-4 w-4" /> Add SAQ
              </DropdownMenuItem>
              <DropdownMenuItem @click="showUploadDialog = true">
                <Upload class="mr-2 h-4 w-4" /> Upload MCQs
              </DropdownMenuItem>
              <DropdownMenuItem @click="showUploadPdfDialog = true">
                <Upload class="mr-2 h-4 w-4" /> Upload PDF (AI)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem @click="showEditPaperDialog = true">
                <Pencil class="mr-2 h-4 w-4" /> Edit Paper
              </DropdownMenuItem>
              <DropdownMenuItem @click="handleDeletePaper" class="text-destructive">
                <Trash2 class="mr-2 h-4 w-4" /> Delete Paper
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>

    <!-- Questions List -->
    <div class="space-y-4 sm:space-y-6">
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

            <!-- Add Question Image Display -->
            <div v-if="question.questionImagePath" class="mt-3 mb-3">
              <img
                :src="question.questionImagePath"
                :alt="`Question image`"
                class="max-w-full h-auto rounded-lg border shadow-sm max-h-[300px] object-contain"
              />
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2">
              <Button variant="ghost" size="sm" @click="handleEditQuestion(question)">
                <Pencil class="h-4 w-4" /> Edit
              </Button>
              <Button variant="ghost" size="sm" @click="handleDeleteQuestion(question)">
                <Trash2 class="h-4 w-4 text-destructive" /> Remove
              </Button>
              <Badge v-if="feedbackCountMap?.[question.id]" variant="outline" class="bg-amber-50">
                <MessageSquare class="h-3.5 w-3.5 mr-1.5 text-amber-500" />
                {{ feedbackCountMap?.[question.id] }}
              </Badge>
            </div>

            <!-- MCQ Choices -->
            <div v-if="question.isMcq" class="pl-6 sm:pl-10 space-y-2 sm:space-y-3">
              <div
                v-for="choice in question.choices"
                :key="choice.id"
                class="flex items-start gap-3 p-2 sm:p-3 rounded-lg border"
              >
                <div
                  class="h-3 w-3 sm:h-4 sm:w-4 mt-1 rounded-full border"
                  :class="{ 'bg-primary border-primary': choice.isCorrect }"
                />
                <div class="space-y-2">
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

            <!-- SAQ Parts -->
            <div v-if="question.isSaq" class="pl-3 sm:pl-10 space-y-2 sm:space-y-4">
              <div
                v-for="part in question.parts"
                :key="part.id"
                class="relative pl-3 sm:pl-4 border-l-2 border-primary/20"
              >
                <p class="font-medium text-sm sm:text-base">{{ part.partText }}</p>
                <div
                  class="mt-3 sm:mt-4 p-3 sm:p-6 bg-[#CDE5ED] shadow-sm sm:shadow-md rounded-lg border border-[#A8D3E7]"
                >
                  <div
                    class="text-sm sm:text-base text-muted-foreground text-[#1F2937] font-medium"
                  >
                    <strong class="block sm:inline mb-1 sm:mb-0">Explanation:</strong>
                    <ViewExplanation :content="part.expectedAnswer" />
                  </div>
                </div>
                <p class="text-xs text-primary mt-2 flex items-center">
                  <span class="font-medium">{{ part.marks }}</span>
                  <span class="ml-1">{{ part.marks === 1 ? 'mark' : 'marks' }}</span>
                </p>
              </div>
            </div>
            <Collapsible v-if="feedbackCountMap?.[question.id]">
              <CollapsibleTrigger class="flex items-center gap-2 text-sm mt-2 text-amber-600">
                <MessageSquare class="h-4 w-4" />
                {{ feedbackCountMap[question.id] }} feedback items
                <ChevronDown class="h-4 w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div class="mt-3 space-y-3 border-t pt-3">
                  <div
                    v-for="feedback in questionFeedbackMap[question.id]"
                    :key="feedback.id"
                    class="p-3 rounded-md bg-amber-50/50 border border-amber-100"
                  >
                    <div class="flex justify-between">
                      <Badge>{{ feedback.feedbackTarget }}</Badge>
                      <Button
                        v-if="!feedback.isResolved"
                        @click="markFeedbackAsResolved(feedback.id)"
                        size="sm"
                        variant="outline"
                        class="h-7"
                      >
                        Mark Resolved
                      </Button>
                      <Badge v-else variant="outline" class="bg-green-50 text-green-600">
                        Resolved
                      </Badge>
                    </div>
                    <p class="mt-2 text-sm">{{ feedback.feedbackText }}</p>
                    <div class="mt-1 text-xs text-muted-foreground">
                      <p>Source: {{ feedback.feedbackSource }}</p>
                      <p>
                        By {{ feedback.user?.username || 'Anonymous' }} •
                        {{ new Date(feedback.createdAt).toLocaleDateString() }}
                      </p>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
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
  <!-- Progress Overlay -->
  <div
    v-if="parsingStatus.isProcessing"
    class="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
  >
    <div class="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
      <div class="space-y-4">
        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span>Processing Questions...</span>
            <span>{{ uploadProgress }}%</span>
          </div>
          <div class="h-2 bg-muted rounded-full overflow-hidden">
            <div
              class="h-full bg-primary transition-all"
              :style="{ width: `${uploadProgress}%` }"
            />
          </div>
        </div>

        <div v-if="parsingStatus.currentStem" class="text-sm text-muted-foreground">
          <p class="truncate">{{ parsingStatus.currentStem }}</p>
        </div>

        <div class="flex justify-between text-sm">
          <span>Processed: {{ parsingStatus.current }}/{{ parsingStatus.total }}</span>
          <span class="text-green-600">Success: {{ parsingStatus.successCount }}</span>
          <span class="text-red-600">Errors: {{ parsingStatus.errorCount }}</span>
        </div>
      </div>
    </div>
  </div>
  <div class="flex justify-center pt-4">
    <Button @click="showAddMcqDialog = true" class="mr-2">
      <Plus class="h-4 w-4 mr-2" />Add MCQ
    </Button>
    <Button @click="showAddSaqDialog = true"> <Plus class="h-4 w-4 mr-2" />Add SAQ </Button>
  </div>

  <!-- Dialogs -->
  <AddMcqDialog v-model:open="showAddMcqDialog" :paper="paper" :concept="concept" />
  <AddSaqDialog v-model:open="showAddSaqDialog" :paper="paper" :concept="concept" />
  <UploadMcqsDialog
    v-model:open="showUploadDialog"
    :paper="paper"
    :concept="concept"
    @parse-progress="onParseProgress"
  />
  <EditMcqDialog
    v-if="selectedQuestion?.isMcq"
    v-model:open="showEditMcqDialog"
    :paper="paper"
    :concept="concept"
    :question="selectedQuestion"
  />
  <EditSaqDialog
    v-if="selectedQuestion?.isSaq"
    v-model:open="showEditSaqDialog"
    :paper="paper"
    :concept="concept"
    :question="selectedQuestion"
  />
  <EditPaperDialog v-model:open="showEditPaperDialog" :paper="paper" :concept="concept" />
  <UploadPdfQuestionsDialog v-model:open="showUploadPdfDialog" :paper="paper" :concept="concept" />
</template>
