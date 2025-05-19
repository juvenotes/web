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
  [...props.feedbackItems].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
)
</script>

<template>
  <AppHead :title="`Manage feedback`" :description="`Make changes based on user feedback`" />
  <div class="max-w-5xl mx-auto py-8 px-4">
    <h1 class="text-2xl font-bold mb-6">Latest Feedback</h1>
    <FeedbackTable :items="sortedFeedback" />
  </div>
</template>
