<script setup lang="ts">
import type QuestionFeedbackDto from '#dtos/question_feedback'
import AdminLayout from '~/layouts/AdminLayout.vue'
import { ref, watch } from 'vue'
import { useForm, router } from '@inertiajs/vue3'
import { toast } from 'vue-sonner'
import { MessageSquare, ArrowUpRight, AlertCircle, Check } from 'lucide-vue-next'
import axios from 'axios'

defineOptions({ layout: AdminLayout })

interface Props {
  feedbackItems: QuestionFeedbackDto[]
  pagination: {
    total: number
    perPage: number
    currentPage: number
    lastPage: number
  }
  filters: {
    isResolved: boolean
    target: string | null
    questionId: number | null
  }
}

const props = defineProps<Props>()

const activeTab = ref(props.filters.isResolved ? 'resolved' : 'unresolved')

// Local reactive copy of feedbackItems
const feedbackList = ref<QuestionFeedbackDto[]>([...props.feedbackItems])

watch(
  () => props.feedbackItems,
  (newVal) => {
    feedbackList.value = [...newVal]
  }
)

// Filter functions
const filterForm = useForm({
  isResolved: props.filters.isResolved,
  target: props.filters.target || '',
  questionId: props.filters.questionId || '',
  page: props.pagination?.currentPage || 1,
})

function applyFilters() {
  filterForm.get('/manage/feedback', {
    preserveScroll: true,
    preserveState: true,
  })
}

function goToPage(page: number) {
  filterForm.page = page
  applyFilters()
}

function viewQuestion(item: QuestionFeedbackDto) {
  // Navigate to the specific paper with question context
  if (item.question?.pastPaper?.concept) {
    // Construct the URL to the paper view page
    const url = `/manage/papers/${item.question.pastPaper.concept.slug}/${item.question.pastPaper.slug}`

    // Use router.visit instead of Link for programmatic navigation
    router.visit(url, {
      data: {
        highlightQuestionId: item.questionId, // Pass this to highlight the specific question
      },
    })
  }
}

const resolvingIds = ref<number[]>([])

function markAsResolved(feedbackId: number) {
  if (resolvingIds.value.includes(feedbackId)) return
  resolvingIds.value.push(feedbackId)
  axios
    .post(`/api/feedback/${feedbackId}/resolve`)
    .then((response) => {
      toast.success('Feedback marked as resolved')
      const updated = response.data?.feedback
      if (updated) {
        const idx = feedbackList.value.findIndex((f) => f.id === feedbackId)
        if (idx !== -1) {
          feedbackList.value.splice(idx, 1, updated)
        }
      } else {
        applyFilters()
      }
    })
    .catch((error) => {
      console.error('Failed to mark feedback as resolved:', error)
      toast.error('Failed to mark feedback as resolved')
    })
    .finally(() => {
      const i = resolvingIds.value.indexOf(feedbackId)
      if (i !== -1) resolvingIds.value.splice(i, 1)
    })
}
</script>

<template>
  <AppHead title="Manage feedback" description="Manage feedback for all questions" />
  <!-- Header and filter controls -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <MessageSquare class="h-6 w-6 text-primary" />
        <h1 class="text-2xl font-bold">Question Feedback</h1>
      </div>

      <div class="flex gap-2">
        <Button
          :variant="activeTab === 'unresolved' ? 'default' : 'outline'"
          @click="
            () => {
              activeTab = 'unresolved'
              filterForm.isResolved = false
              applyFilters()
            }
          "
        >
          <AlertCircle class="h-4 w-4 mr-2" />
          Unresolved
        </Button>
        <Button
          :variant="activeTab === 'resolved' ? 'default' : 'outline'"
          @click="
            () => {
              activeTab = 'resolved'
              filterForm.isResolved = true
              applyFilters()
            }
          "
        >
          <Check class="h-4 w-4 mr-2" />
          Resolved
        </Button>
      </div>
    </div>

    <!-- Filter section -->
    <Card>
      <CardContent class="pt-6">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1">
            <Label>Filter by target</Label>
            <Select v-model="filterForm.target">
              <SelectTrigger>
                <SelectValue placeholder="All targets" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All targets</SelectItem>
                <SelectItem value="content">Question Content</SelectItem>
                <SelectItem value="explanation">Answer Explanation</SelectItem>
                <SelectItem value="choices">Answer Choices</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button class="self-end" @click="applyFilters">Apply Filters</Button>
        </div>
      </CardContent>
    </Card>

    <!-- Feedback Items -->
    <div class="space-y-4">
      <div v-if="!feedbackList.length" class="text-center py-12">
        <p class="text-muted-foreground">No feedback items found</p>
      </div>

      <Card v-for="item in feedbackList" :key="item.id" class="overflow-hidden">
        <CardHeader class="bg-muted/30">
          <div class="flex justify-between">
            <div>
              <Link
                :href="
                  item.question?.pastPaper?.concept
                    ? `/manage/papers/${item.question.pastPaper.concept.slug}/${item.question.pastPaper.slug}`
                    : '#'
                "
                class="font-medium text-primary hover:underline"
              >
                {{ item.question?.pastPaper?.title || 'Unknown Paper' }}
              </Link>
              <span class="text-sm text-muted-foreground ml-2">
                {{ new Date(item.createdAt).toLocaleDateString() }}
              </span>
            </div>
            <Badge>{{ item.feedbackTarget }}</Badge>
          </div>
        </CardHeader>
        <CardContent class="pt-4">
          <!-- Question preview -->
          <div
            class="mb-4 p-3 rounded-md bg-muted/30 text-sm cursor-pointer hover:bg-muted/50 transition-colors"
            @click="viewQuestion(item)"
          >
            <div class="flex justify-between">
              <p class="line-clamp-2">{{ item.question?.questionText }}</p>
              <Button variant="ghost" size="sm" class="shrink-0">
                <ArrowUpRight class="h-4 w-4" />
              </Button>
            </div>
          </div>

          <!-- Feedback content -->
          <div class="space-y-2">
            <h3 class="font-semibold">Feedback</h3>
            <p>{{ item.feedbackText }}</p>

            <div class="mt-2">
              <h4 class="text-sm font-medium">Source</h4>
              <p class="text-sm text-muted-foreground">{{ item.feedbackSource }}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter class="bg-muted/20 flex justify-between">
          <div class="text-sm text-muted-foreground">
            By {{ item.user?.username || 'Anonymous' }}
          </div>
          <Button
            v-if="!item.isResolved"
            :disabled="resolvingIds.includes(item.id)"
            @click="markAsResolved(item.id)"
            variant="outline"
            size="sm"
          >
            <span v-if="resolvingIds.includes(item.id)">Marking...</span>
            <span v-else>Mark as Resolved</span>
          </Button>
          <Badge v-else variant="outline" class="bg-green-50 text-green-600">
            Resolved on
            {{ item.resolvedAt ? new Date(item.resolvedAt).toLocaleDateString() : 'Unknown' }}
          </Badge>
        </CardFooter>
      </Card>
    </div>

    <!-- Pagination -->
    <div v-if="pagination && pagination.lastPage > 1" class="flex justify-center mt-8">
      <div class="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="pagination.currentPage === 1"
          @click="goToPage(1)"
        >
          First
        </Button>
        <Button
          variant="outline"
          size="sm"
          :disabled="pagination.currentPage === 1"
          @click="goToPage(pagination.currentPage - 1)"
        >
          Previous
        </Button>

        <div class="flex items-center gap-1">
          <Button
            v-for="page in pagination.lastPage"
            :key="page"
            :variant="pagination.currentPage === page ? 'default' : 'outline'"
            size="sm"
            class="w-8 h-8 p-0"
            @click="goToPage(page)"
            v-show="
              page === 1 ||
              page === pagination.lastPage ||
              (page >= pagination.currentPage - 1 && page <= pagination.currentPage + 1)
            "
          >
            {{ page }}
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          :disabled="pagination.currentPage === pagination.lastPage"
          @click="goToPage(pagination.currentPage + 1)"
        >
          Next
        </Button>
        <Button
          variant="outline"
          size="sm"
          :disabled="pagination.currentPage === pagination.lastPage"
          @click="goToPage(pagination.lastPage)"
        >
          Last
        </Button>
      </div>
    </div>
  </div>
</template>
