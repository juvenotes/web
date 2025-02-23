<script setup lang="ts">
import { useForm } from '@inertiajs/vue3'
import { MessageSquare } from 'lucide-vue-next'

const props = defineProps<{
  questionId: number
}>()

const form = useForm({
  feedbackText: '',
})

const submitFeedback = () => {
  form.post(`/questions/${props.questionId}/feedback`, {
    preserveScroll: true,
    onSuccess: () => {
      form.reset()
    },
  })
}
</script>

<template>
  <div class="mt-4 space-y-2">
    <button
      type="button"
      class="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80"
    >
      <MessageSquare class="h-4 w-4" />
      <span>Provide Feedback</span>
    </button>

    <form @submit.prevent="submitFeedback" class="space-y-2">
      <textarea
        v-model="form.feedbackText"
        rows="3"
        class="w-full resize-none rounded-md border p-2"
        placeholder="Share your thoughts about this question..."
      />
      <button
        type="submit"
        class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        :disabled="form.processing"
      >
        {{ form.processing ? 'Submitting...' : 'Submit Feedback' }}
      </button>
    </form>
  </div>
</template>