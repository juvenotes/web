<script setup lang="ts">
import { computed } from 'vue'
import type QuestionFeedbackDto from '#dtos/question_feedback'
import AdminLayout from '~/layouts/AdminLayout.vue'

defineOptions({ layout: AdminLayout })

interface Props {
  feedbackItems: QuestionFeedbackDto[]
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
      <!-- Add filter/search here if needed -->
    </div>
    <div class="bg-white rounded-2xl border shadow-sm p-0 sm:p-2">
      <FeedbackTable :items="sortedFeedback" />
    </div>
  </div>
</template>
