<script setup lang="ts">
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Label } from '~/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useForm } from '@inertiajs/vue3'
import { ref, watch } from 'vue'
import type QuestionDto from '#dtos/question'

interface AvailableQuiz {
  id: number
  title: string
}

const props = defineProps<{
  open: boolean
  question: QuestionDto | null
  availableQuizzes: AvailableQuiz[]
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const selectedQuizId = ref<string>('')

const form = useForm({
  questionId: 0,
  targetQuizId: 0,
})

// Reset form when dialog opens/closes
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen && props.question) {
      form.questionId = props.question.id
      selectedQuizId.value = ''
    } else {
      form.reset()
      selectedQuizId.value = ''
    }
  }
)

function handleSubmit() {
  if (!selectedQuizId.value) return

  form.targetQuizId = parseInt(selectedQuizId.value)

  form.post('/manage/papers/questions/copy-to-quiz', {
    preserveScroll: true,
    onSuccess: () => {
      emit('update:open', false)
      selectedQuizId.value = ''
      form.reset()
    },
    onError: (errors) => {
      console.error('Copy failed:', errors)
    },
  })
}

function handleCancel() {
  emit('update:open', false)
  selectedQuizId.value = ''
  form.reset()
}
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Copy MCQ to Quiz</DialogTitle>
      </DialogHeader>

      <div v-if="question" class="space-y-6">
        <!-- Question Preview -->
        <div class="p-4 bg-gray-50 rounded-lg border">
          <h4 class="font-medium text-sm text-gray-700 mb-2">MCQ question to copy:</h4>
          <p class="text-sm">{{ question.questionText }}</p>
          <div class="mt-2 flex items-center gap-2">
            <span class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
              MCQ
            </span>
            <span class="text-xs text-gray-500"> {{ question.choices?.length || 0 }} choices </span>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div class="space-y-2">
            <Label for="quiz-select">Select Target Quiz</Label>
            <Select v-model="selectedQuizId" :disabled="form.processing">
              <SelectTrigger id="quiz-select">
                <SelectValue placeholder="Choose a quiz..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="quiz in availableQuizzes"
                  :key="quiz.id"
                  :value="quiz.id.toString()"
                >
                  {{ quiz.title }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p class="text-sm text-muted-foreground">
              The MCQ question with all its choices and explanations will be copied to the selected
              quiz.
            </p>
          </div>

          <div
            v-if="availableQuizzes.length === 0"
            class="p-4 bg-amber-50 border border-amber-200 rounded-lg"
          >
            <p class="text-sm text-amber-800">
              No event quizzes found. Create an event quiz first to copy MCQ questions to it.
            </p>
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              @click="handleCancel"
              variant="outline"
              :disabled="form.processing"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              :disabled="form.processing || !selectedQuizId || availableQuizzes.length === 0"
              class="bg-primary hover:bg-primary/90"
            >
              {{ form.processing ? 'Copying...' : 'Copy MCQ' }}
            </Button>
          </div>
        </form>
      </div>
    </DialogContent>
  </Dialog>
</template>
