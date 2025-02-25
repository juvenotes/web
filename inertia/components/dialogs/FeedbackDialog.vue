<script setup lang="ts">
import { useForm } from '@inertiajs/vue3'
import type QuestionDto from '#dtos/question'
import { toast } from 'vue-sonner'
import { watch, onMounted } from 'vue'

const props = defineProps<{
  open: boolean
  question: QuestionDto | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const feedbackTargets = [
  { value: 'content', label: 'Question Content' },
  { value: 'explanation', label: 'Answer Explanation' },
  { value: 'choices', label: 'Answer Choices' },
  { value: 'other', label: 'Other' },
]

const form = useForm({
  questionId: '',
  feedbackText: '',
  feedbackTarget: '',
  feedbackSource: '',
})

// Function to initialize/reset form
const initializeForm = () => {
  form.questionId = props.question ? String(props.question.id) : ''
  form.feedbackText = ''
  form.feedbackTarget = ''
  form.feedbackSource = ''
  form.clearErrors()
}

// Watch for changes to props.question and update questionId
watch(() => props.question, (newQuestion) => {
  if (newQuestion) {
    form.questionId = String(newQuestion.id)
  }
}, { immediate: true })

// Watch dialog open state
watch(() => props.open, (isOpen) => {
  if (isOpen && props.question) {
    // When dialog opens, ensure form is reset
    initializeForm()
  }
})

// Initialize form on component mount
onMounted(() => {
  if (props.question) {
    initializeForm()
  }
})

const handleSubmit = () => {
  if (!props.question) return

  if (!form.feedbackText || !form.feedbackTarget || !form.feedbackSource) {
    toast.error('Please fill in all required fields')
    return
  }

  form.post(`/questions/${props.question.id}/feedback`, {
    preserveScroll: true,
    onSuccess: () => {
      emit('update:open', false)
      initializeForm()
      toast.success('Feedback submitted successfully')
    },
    onError: (errors) => {
      console.error(errors)
      toast.error('Failed to submit feedback')
    },
  })
}
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
      <DialogHeader class="bg-background/95 backdrop-blur-sm p-4 sm:pb-4 border-b sticky top-0">
        <DialogTitle class="text-lg sm:text-xl">Provide Feedback</DialogTitle>
      </DialogHeader>

      <div class="p-3 sm:p-6">
        <form @submit.prevent="handleSubmit" class="space-y-4 sm:space-y-6">
          <!-- Question Preview -->
          <div class="space-y-2 sm:space-y-3">
            <Label class="text-sm sm:text-base">Question</Label>
            <Card class="p-4">
              <CardContent class="p-0">
                <p class="text-foreground">{{ question?.questionText }}</p>

                <!-- MCQ Choices -->
                <div v-if="question?.choices?.length" class="mt-4 space-y-2">
                  <div
                    v-for="choice in question.choices"
                    :key="choice.id"
                    class="flex items-center gap-2 pl-4"
                  >
                    <div
                      class="h-3 w-3 rounded-full border"
                      :class="{ 'bg-primary border-primary': choice.isCorrect }"
                    />
                    <span class="text-sm text-muted-foreground">{{ choice.choiceText }}</span>
                  </div>
                </div>

                <!-- SAQ Parts -->
                <div v-if="question?.parts?.length" class="mt-4 space-y-3">
                  <div
                    v-for="part in question.parts"
                    :key="part.id"
                    class="border-l-2 border-primary/20 pl-4"
                  >
                    <p class="text-sm text-muted-foreground">{{ part.partText }}</p>
                    <p class="text-xs text-primary mt-1">{{ part.marks }} marks</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <!-- Feedback Target Area -->
          <div class="space-y-2">
            <Label>Which part needs improvement?</Label>
            <Select v-model="form.feedbackTarget">
              <SelectTrigger :class="{ 'border-destructive': form.errors.feedbackTarget }">
                <SelectValue placeholder="Select area to improve" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="target in feedbackTargets"
                  :key="target.value"
                  :value="target.value"
                >
                  {{ target.label }}
                </SelectItem>
              </SelectContent>
            </Select>
            <span v-if="form.errors.feedbackTarget" class="text-sm text-destructive">
              {{ form.errors.feedbackTarget }}
            </span>
          </div>

          <!-- Feedback Source Citation -->
          <div class="space-y-2">
            <Label>Source Reference</Label>
            <Textarea
              v-model="form.feedbackSource"
              placeholder="Please provide references or citations to support your feedback (e.g., textbook name and page number, journal article, clinical guidelines, etc.)"
              :class="{ 'border-destructive': form.errors.feedbackSource }"
              rows="4"
            />
            <span v-if="form.errors.feedbackSource" class="text-sm text-destructive">
              {{ form.errors.feedbackSource }}
            </span>
          </div>

          <!-- Feedback Text -->
          <div class="space-y-2">
            <Label>Feedback Details</Label>
            <Textarea
              v-model="form.feedbackText"
              placeholder="Please provide your detailed feedback..."
              :class="{ 'border-destructive': form.errors.feedbackText }"
              rows="6"
            />
            <span v-if="form.errors.feedbackText" class="text-sm text-destructive">
              {{ form.errors.feedbackText }}
            </span>
          </div>

          <Button type="submit" :disabled="form.processing" class="w-full h-10 sm:h-11">
            {{ form.processing ? 'Submitting...' : 'Submit Feedback' }}
          </Button>
        </form>
      </div>
    </DialogContent>
  </Dialog>
</template>