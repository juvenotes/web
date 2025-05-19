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
  <div class="max-w-3xl mx-auto py-8">
    <h1 class="text-2xl font-bold mb-6">Latest Feedback</h1>
    <div v-if="!sortedFeedback.length" class="text-center text-muted-foreground">No feedback found.</div>
    <div v-else>
      <div v-for="item in sortedFeedback" :key="item.id" class="mb-6 p-4 border rounded-lg bg-white">
        <div class="flex justify-between items-center mb-2">
          <span class="font-semibold">{{ item.user?.username || 'Anonymous' }}</span>
          <span class="text-xs text-muted-foreground">{{ new Date(item.createdAt).toLocaleString() }}</span>
        </div>
        <div class="mb-2">
          <span class="text-sm text-muted-foreground">Target: {{ item.feedbackTarget }}</span>
        </div>
        <div class="mb-2">
          <span class="font-medium">Feedback:</span>
          <p>{{ item.feedbackText }}</p>
        </div>
        <div v-if="item.isResolved" class="text-green-600 text-xs">Resolved</div>
      </div>
    </div>
  </div>
</template>
