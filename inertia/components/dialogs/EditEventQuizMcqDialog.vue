<script setup lang="ts">
import { useForm } from '@inertiajs/vue3'
import { QuestionType } from '#enums/question_types'
import type EventDto from '#dtos/event'
import type EventQuizDto from '#dtos/event_quiz'
import type QuestionDto from '#dtos/question'
import { Plus, Trash, Loader } from 'lucide-vue-next'
import { watch, onMounted, ref } from 'vue'
import axios from 'axios'

interface ImageInputEvent extends Event {
  target: HTMLInputElement
}

const props = defineProps<{
  open: boolean
  event: EventDto
  quiz: EventQuizDto
  question: QuestionDto
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const isUploadingQuestionImage = ref(false)

const form = useForm({
  questionText: '',
  questionImagePath: '',
  choices: [] as Array<{ 
    id?: number
    choiceText: string
    isCorrect: boolean
    explanation: string 
  }>,
})

// Function to initialize form with question data
const initializeForm = () => {
  if (props.question) {
    form.questionText = props.question.questionText
    form.questionImagePath = props.question.questionImagePath || ''
    form.choices = props.question.choices?.map(choice => ({
      id: choice.id,
      choiceText: choice.choiceText,
      isCorrect: choice.isCorrect,
      explanation: choice.explanation || ''
    })) || []
  }
  form.clearErrors()
}

// Watch dialog open state and question changes
watch(
  () => [props.open, props.question],
  ([isOpen, question]) => {
    if (isOpen && question) {
      initializeForm()
    }
  },
  { immediate: true }
)

// Initialize form on component mount
onMounted(() => {
  if (props.question) {
    initializeForm()
  }
})

async function handleImageUpload(file: File) {
  const formData = new FormData()
  formData.append('image', file)

  formData.append('context[folder]', 'quiz')
  formData.append('context[subFolder]', `quiz-${props.quiz.id}`)

  try {
    isUploadingQuestionImage.value = true

    const { data } = await axios.post('/api/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    form.questionImagePath = data
  } catch (error) {
    console.error('Failed to upload image:', error)
  } finally {
    isUploadingQuestionImage.value = false
  }
}

function removeImage() {
  form.questionImagePath = ''
}

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
  form.choices.forEach((choice, i) => {
    choice.isCorrect = i === index
  })
}

const handleSubmit = () => {
  form.put(`/manage/events/${props.event.slug}/quiz/${props.quiz.id}/questions/${props.question.slug}`, {
    preserveScroll: true,
    onSuccess: () => {
      emit('update:open', false)
    },
  })
}

const handleImageInputChange = (event: ImageInputEvent) => {
  const file = event.target?.files?.[0]
  if (file) {
    handleImageUpload(file)
  }
}

const getChoiceLetter = (index: number) => String.fromCharCode(65 + index)
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="max-w-3xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Edit MCQ Question</DialogTitle>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Question Text -->
        <div class="space-y-2">
          <Label for="questionText">Question Text</Label>
          <Textarea
            id="questionText"
            v-model="form.questionText"
            placeholder="Enter your question here..."
            :error="form.errors.questionText"
            rows="3"
          />
        </div>

        <!-- Image Upload -->
        <div class="space-y-2">
          <Label>Question Image (Optional)</Label>
          <div v-if="form.questionImagePath" class="space-y-2">
            <img
              :src="form.questionImagePath"
              alt="Question image"
              class="max-w-xs rounded-lg border"
            />
            <Button type="button" @click="removeImage" variant="outline" size="sm">
              Remove Image
            </Button>
          </div>
          <div v-else class="flex items-center gap-4">
            <input
              type="file"
              accept="image/*"
              @change="handleImageInputChange"
              class="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              :disabled="isUploadingQuestionImage"
            />
            <Loader v-if="isUploadingQuestionImage" class="h-4 w-4 animate-spin" />
          </div>
        </div>

        <!-- Choices -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <Label>Answer Choices</Label>
            <Button
              type="button"
              @click="addChoice"
              variant="outline"
              size="sm"
              :disabled="form.choices.length >= 5"
            >
              <Plus class="h-4 w-4 mr-2" />
              Add Choice
            </Button>
          </div>

          <div class="space-y-3">
            <div
              v-for="(choice, index) in form.choices"
              :key="choice.id || index"
              class="flex items-start gap-3 p-3 border rounded-lg"
              :class="choice.isCorrect ? 'border-green-500 bg-green-50' : 'border-gray-200'"
            >
              <div class="flex items-center gap-2 pt-1">
                <input
                  :id="`choice-${index}`"
                  type="radio"
                  :name="'correct-choice'"
                  :checked="choice.isCorrect"
                  @change="setCorrectChoice(index)"
                  class="text-primary focus:ring-primary"
                />
                <Label :for="`choice-${index}`" class="text-sm font-medium">
                  {{ getChoiceLetter(index) }}
                </Label>
              </div>

              <div class="flex-1 space-y-2">
                <Textarea
                  v-model="choice.choiceText"
                  :placeholder="`Choice ${getChoiceLetter(index)}`"
                  rows="2"
                  :error="form.errors[`choices.${index}.choiceText`]"
                />
                
                <div v-if="choice.isCorrect">
                  <Label class="text-xs text-green-700">Explanation (Optional)</Label>
                  <Textarea
                    v-model="choice.explanation"
                    placeholder="Explain why this is correct..."
                    rows="2"
                    class="text-sm"
                  />
                </div>
              </div>

              <Button
                type="button"
                @click="removeChoice(index)"
                variant="ghost"
                size="sm"
                :disabled="form.choices.length <= 1"
                class="text-destructive hover:text-destructive/90"
              >
                <Trash class="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <p class="text-xs text-muted-foreground">
            Select the radio button to mark the correct answer. You can add up to 5 choices.
          </p>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end gap-3 pt-4 border-t">
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
          >
            {{ form.processing ? 'Updating...' : 'Update Question' }}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>
