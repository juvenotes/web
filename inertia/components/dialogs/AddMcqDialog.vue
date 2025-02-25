<script setup lang="ts">
import { useForm } from '@inertiajs/vue3'
import { QuestionType } from '#enums/question_types'
import type PastPaperDto from '#dtos/past_paper'
import type ConceptDto from '#dtos/concept'
import { Plus, Trash2 } from 'lucide-vue-next'
import { watch, onMounted } from 'vue'

const props = defineProps<{
  open: boolean
  paper: PastPaperDto
  concept: ConceptDto
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const form = useForm({
  questionText: '',
  type: QuestionType.MCQ as const,
  choices: [{ choiceText: '', isCorrect: true, explanation: '' }],
})

// Function to reset/initialize form
const initializeForm = () => {
  form.questionText = ''
  form.type = QuestionType.MCQ
  form.choices = [{ choiceText: '', isCorrect: true, explanation: '' }]
  form.clearErrors()
}

// Watch dialog open state
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    // When dialog opens, ensure form is reset
    initializeForm()
  }
})

// Initialize form on component mount
onMounted(() => {
  initializeForm()
})

const addChoice = () => {
  if (form.choices.length < 5) {
    form.choices.push({ choiceText: '', isCorrect: false, explanation: '' })
  }
}

const removeChoice = (index: number) => {
  if (form.choices.length > 1) {
    const wasCorrect = form.choices[index].isCorrect
    form.choices.splice(index, 1)
    if (wasCorrect && form.choices.length > 0) {
      form.choices[0].isCorrect = true
    }
  }
}

const setCorrectChoice = (index: number) => {
  form.choices = form.choices.map((choice, i) => ({
    ...choice,
    isCorrect: i === index,
  }))
}

const handleSubmit = () => {
  if (!form.choices.some((choice) => choice.isCorrect)) {
    return
  }

  form.post(`/manage/papers/${props.concept.slug}/${props.paper.slug}/questions/mcq`, {
    preserveScroll: true,
    onSuccess: () => {
      emit('update:open', false)
      initializeForm() // Use initialize instead of form.reset()
    },
  })
}
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
      <DialogHeader
        class="bg-background/95 backdrop-blur-sm z-20 p-4 sm:pb-4 border-b max-w-screen-lg mx-auto"
      >
        <DialogTitle class="text-lg sm:text-xl">Add MCQ to {{ paper.title }}</DialogTitle>
      </DialogHeader>

      <div class="p-3 sm:p-6">
        <form @submit.prevent="handleSubmit" class="space-y-4 sm:space-y-6">
          <div class="space-y-2 sm:space-y-3">
            <Label class="text-sm sm:text-base">Question Text</Label>
            <Input
              v-model="form.questionText"
              class="min-h-[44px] sm:min-h-[48px]"
              :class="{ 'border-destructive': form.errors.questionText }"
            />
          </div>

          <div class="space-y-3 sm:space-y-4">
            <div class="flex items-center justify-between">
              <Label class="text-sm sm:text-base">Choices ({{ form.choices.length }}/5)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                class="h-8 sm:h-9"
                @click="addChoice"
              >
                <Plus class="h-4 w-4 mr-2" />Add Choice
              </Button>
            </div>

            <div
              v-for="(choice, index) in form.choices"
              :key="`choice-${index}`"
              class="p-3 sm:p-4 border rounded-lg space-y-3"
            >
              <div class="flex items-center justify-between">
                <Label>Choice {{ String.fromCharCode(65 + index) }}</Label>
                <Button
                  v-if="form.choices.length > 1"
                  type="button"
                  variant="ghost"
                  size="sm"
                  @click="removeChoice(index)"
                >
                  <Trash2 class="h-4 w-4" />
                </Button>
              </div>

              <div class="space-y-2">
                <Input
                  v-model="choice.choiceText"
                  :placeholder="`Choice ${String.fromCharCode(65 + index)}`"
                />
              </div>

              <div class="flex items-center gap-2">
                <input
                  type="radio"
                  name="correct-choice"
                  :checked="choice.isCorrect"
                  @change="setCorrectChoice(index)"
                />
                <Label>Correct Answer</Label>
              </div>

              <div class="space-y-2">
                <Label>Expected Answer</Label>
                <ExplanationEditor
                  v-model="choice.explanation"
                  placeholder="Explanation (optional)"
                />
              </div>
            </div>
          </div>

          <Button type="submit" :disabled="form.processing" class="w-full h-10 sm:h-11">
            {{ form.processing ? 'Adding...' : 'Add MCQ' }}
          </Button>
        </form>
      </div>
    </DialogContent>
  </Dialog>
</template>