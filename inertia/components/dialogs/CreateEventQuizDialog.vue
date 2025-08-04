<script setup lang="ts">
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { Label } from '~/components/ui/label'
import { useForm } from '@inertiajs/vue3'
import { Plus, Minus } from 'lucide-vue-next'
import type EventDto from '#dtos/event'
import { ref } from 'vue'

const props = defineProps<{
  open: boolean
  event: EventDto
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const form = useForm({
  title: '',
  description: '',
  mcqs: [
    {
      question: '',
      choices: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
    }
  ],
})

const errors = ref<Record<string, string>>({})

function addQuestion() {
  form.mcqs.push({
    question: '',
    choices: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
  })
}

function removeQuestion(index: number) {
  if (form.mcqs.length > 1) {
    form.mcqs.splice(index, 1)
  }
}

function addChoice(questionIndex: number) {
  if (form.mcqs[questionIndex].choices.length < 6) {
    form.mcqs[questionIndex].choices.push('')
  }
}

function removeChoice(questionIndex: number, choiceIndex: number) {
  if (form.mcqs[questionIndex].choices.length > 2) {
    form.mcqs[questionIndex].choices.splice(choiceIndex, 1)
    // Adjust correct answer if necessary
    if (form.mcqs[questionIndex].correctAnswer >= choiceIndex) {
      form.mcqs[questionIndex].correctAnswer = Math.max(0, form.mcqs[questionIndex].correctAnswer - 1)
    }
  }
}

function handleSubmit() {
  errors.value = {}

  // Basic validation
  if (!form.title.trim()) {
    errors.value.title = 'Quiz title is required'
    return
  }

  // Validate questions
  let hasErrors = false
  form.mcqs.forEach((mcq, index) => {
    if (!mcq.question.trim()) {
      errors.value[`mcq_${index}_question`] = `Question ${index + 1} is required`
      hasErrors = true
    }
    
    const validChoices = mcq.choices.filter(choice => choice.trim())
    if (validChoices.length < 2) {
      errors.value[`mcq_${index}_choices`] = `Question ${index + 1} needs at least 2 choices`
      hasErrors = true
    }

    if (mcq.correctAnswer >= validChoices.length) {
      errors.value[`mcq_${index}_correct`] = `Question ${index + 1} has invalid correct answer`
      hasErrors = true
    }
  })

  if (hasErrors) return

  form.post(`/manage/events/${props.event.slug}/quiz`, {
    preserveScroll: true,
    onSuccess: () => {
      emit('update:open', false)
      form.reset()
      errors.value = {}
    },
    onError: (formErrors) => {
      errors.value = { ...errors.value, ...formErrors }
    },
  })
}

function getChoiceLetter(index: number): string {
  return String.fromCharCode(65 + index)
}
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Create New Quiz</DialogTitle>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Quiz Details -->
        <div class="space-y-4">
          <div>
            <Label for="title">Quiz Title *</Label>
            <Input
              id="title"
              v-model="form.title"
              placeholder="Enter quiz title..."
              :class="{ 'border-red-500': errors.title }"
            />
            <p v-if="errors.title" class="text-sm text-red-600 mt-1">{{ errors.title }}</p>
          </div>

          <div>
            <Label for="description">Description</Label>
            <Textarea
              id="description"
              v-model="form.description"
              placeholder="Enter quiz description..."
              rows="3"
            />
          </div>
        </div>

        <!-- Questions -->
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">Questions</h3>
            <Button type="button" @click="addQuestion" size="sm" variant="outline">
              <Plus class="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </div>

          <div
            v-for="(mcq, questionIndex) in form.mcqs"
            :key="questionIndex"
            class="border border-gray-200 rounded-lg p-4 space-y-4"
          >
            <div class="flex items-center justify-between">
              <h4 class="font-medium">Question {{ questionIndex + 1 }}</h4>
              <Button
                v-if="form.mcqs.length > 1"
                type="button"
                @click="removeQuestion(questionIndex)"
                size="sm"
                variant="outline"
                class="text-red-600 hover:bg-red-50"
              >
                <Minus class="h-4 w-4" />
              </Button>
            </div>

            <!-- Question Text -->
            <div>
              <Label :for="`question_${questionIndex}`">Question Text *</Label>
              <Textarea
                :id="`question_${questionIndex}`"
                v-model="mcq.question"
                placeholder="Enter the question..."
                rows="2"
                :class="{ 'border-red-500': errors[`mcq_${questionIndex}_question`] }"
              />
              <p v-if="errors[`mcq_${questionIndex}_question`]" class="text-sm text-red-600 mt-1">
                {{ errors[`mcq_${questionIndex}_question`] }}
              </p>
            </div>

            <!-- Choices -->
            <div>
              <div class="flex items-center justify-between mb-3">
                <Label>Answer Choices *</Label>
                <Button
                  v-if="mcq.choices.length < 6"
                  type="button"
                  @click="addChoice(questionIndex)"
                  size="sm"
                  variant="outline"
                >
                  <Plus class="h-3 w-3 mr-1" />
                  Add Choice
                </Button>
              </div>

              <div class="space-y-2">
                <div
                  v-for="(choice, choiceIndex) in mcq.choices"
                  :key="choiceIndex"
                  class="flex items-center gap-3"
                >
                  <div class="flex-shrink-0 flex items-center gap-2">
                    <input
                      :id="`correct_${questionIndex}_${choiceIndex}`"
                      v-model="mcq.correctAnswer"
                      :value="choiceIndex"
                      type="radio"
                      :name="`correct_${questionIndex}`"
                      class="text-[#55A9C4] focus:ring-[#55A9C4]"
                    />
                    <Label 
                      :for="`correct_${questionIndex}_${choiceIndex}`"
                      class="text-sm font-medium min-w-[20px]"
                    >
                      {{ getChoiceLetter(choiceIndex) }}
                    </Label>
                  </div>
                  
                  <Input
                    v-model="mcq.choices[choiceIndex]"
                    :placeholder="`Choice ${getChoiceLetter(choiceIndex)}`"
                    class="flex-1"
                  />
                  
                  <Button
                    v-if="mcq.choices.length > 2"
                    type="button"
                    @click="removeChoice(questionIndex, choiceIndex)"
                    size="sm"
                    variant="outline"
                    class="text-red-600 hover:bg-red-50 flex-shrink-0"
                  >
                    <Minus class="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <p v-if="errors[`mcq_${questionIndex}_choices`]" class="text-sm text-red-600 mt-1">
                {{ errors[`mcq_${questionIndex}_choices`] }}
              </p>
              <p v-if="errors[`mcq_${questionIndex}_correct`]" class="text-sm text-red-600 mt-1">
                {{ errors[`mcq_${questionIndex}_correct`] }}
              </p>
              
              <p class="text-xs text-gray-500 mt-2">
                Select the radio button next to the correct answer
              </p>
            </div>

            <!-- Explanation -->
            <div>
              <Label :for="`explanation_${questionIndex}`">Explanation (Optional)</Label>
              <Textarea
                :id="`explanation_${questionIndex}`"
                v-model="mcq.explanation"
                placeholder="Explain why this is the correct answer..."
                rows="2"
              />
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            @click="$emit('update:open', false)"
            variant="outline"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            :disabled="form.processing"
            class="bg-[#55A9C4] hover:bg-[#4795af]"
          >
            {{ form.processing ? 'Creating...' : 'Create Quiz' }}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
/* Custom styles for the form */
</style>