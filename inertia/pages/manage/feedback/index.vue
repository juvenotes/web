<script setup lang="ts">
import { computed } from 'vue'
import type QuestionFeedbackDto from '#dtos/question_feedback'
import AdminLayout from '~/layouts/AdminLayout.vue'

defineOptions({ layout: AdminLayout })

interface Props {
  feedbackItems: QuestionFeedbackDto[]
  totalFeedback: number
  meta: {
    current_page: number
    last_page: number
    first_page: number
    per_page: number
  }
  filters?: {
    search?: string
  }
}

const props = defineProps<Props>()

const sortedFeedback = computed(() =>
  [...props.feedbackItems].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
)
</script>

<template>
  <AppHead :title="`Manage feedback`" :description="`Make changes based on user feedback`" />
  <div class="max-w-5xl mx-auto py-10 px-4">
    <div class="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <h1 class="text-3xl font-bold text-foreground">Latest Feedback</h1>
      <div class="px-4 py-2 bg-primary/10 rounded-lg self-start sm:self-auto">
        <span class="text-primary font-medium">
          {{ totalFeedback }} total feedback item{{ totalFeedback === 1 ? '' : 's' }}
        </span>
      </div>
    </div>
    <div class="bg-white rounded-2xl border shadow-sm p-0 sm:p-2">
      <FeedbackTable :items="sortedFeedback" />
    </div>
    <div
      v-if="meta && meta.last_page > 1"
      class="mt-6 flex flex-wrap justify-center items-center gap-2"
    >
      <!-- Previous button -->
      <Link
        :href="`/manage/feedback?page=${meta.current_page > 1 ? meta.current_page - 1 : 1}&search=${filters?.search || ''}`"
        class="px-3 py-2 text-sm rounded-md bg-gray-100 hover:bg-gray-200 flex items-center"
        :class="{ 'opacity-50 pointer-events-none': meta.current_page === 1 }"
      >
        <span class="sr-only">Previous</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-chevron-left"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
      </Link>

      <!-- First page -->
      <Link
        :href="`/manage/feedback?page=1&search=${filters?.search || ''}`"
        class="px-3 py-2 text-sm rounded-md hidden sm:block"
        :class="{
          'bg-primary text-white': 1 === meta.current_page,
          'bg-gray-100 hover:bg-gray-200': 1 !== meta.current_page,
        }"
      >
        1
      </Link>

      <!-- Ellipsis if needed -->
      <span v-if="meta.current_page > 3" class="px-2 text-gray-500 hidden sm:block">...</span>

      <!-- Pages around current page -->
      <template v-for="page in meta.last_page" :key="page">
        <Link
          v-if="
            page !== 1 &&
            page !== meta.last_page &&
            (page === meta.current_page ||
              page === meta.current_page - 1 ||
              page === meta.current_page + 1 ||
              (page === 2 && meta.current_page === 1) ||
              (page === meta.last_page - 1 && meta.current_page === meta.last_page))
          "
          :href="`/manage/feedback?page=${page}&search=${filters?.search || ''}`"
          class="px-3 py-2 text-sm rounded-md"
          :class="{
            'bg-primary text-white': page === meta.current_page,
            'bg-gray-100 hover:bg-gray-200': page !== meta.current_page,
          }"
        >
          {{ page }}
        </Link>
      </template>

      <!-- Ellipsis if needed -->
      <span v-if="meta.current_page < meta.last_page - 2" class="px-2 text-gray-500 hidden sm:block"
        >...</span
      >

      <!-- Last page -->
      <Link
        v-if="meta.last_page > 1"
        :href="`/manage/feedback?page=${meta.last_page}&search=${filters?.search || ''}`"
        class="px-3 py-2 text-sm rounded-md hidden sm:block"
        :class="{
          'bg-primary text-white': meta.last_page === meta.current_page,
          'bg-gray-100 hover:bg-gray-200': meta.last_page !== meta.current_page,
        }"
      >
        {{ meta.last_page }}
      </Link>

      <!-- Mobile current page indicator -->
      <span class="px-3 py-2 text-sm sm:hidden">
        {{ meta.current_page }} of {{ meta.last_page }}
      </span>

      <!-- Next button -->
      <Link
        :href="`/manage/feedback?page=${meta.current_page < meta.last_page ? meta.current_page + 1 : meta.last_page}&search=${filters?.search || ''}`"
        class="px-3 py-2 text-sm rounded-md bg-gray-100 hover:bg-gray-200 flex items-center"
        :class="{ 'opacity-50 pointer-events-none': meta.current_page === meta.last_page }"
      >
        <span class="sr-only">Next</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-chevron-right"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </Link>
    </div>
  </div>
</template>
