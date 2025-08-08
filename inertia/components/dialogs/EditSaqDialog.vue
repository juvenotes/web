<script setup lang="ts">
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Label } from '~/components/ui/label'
import { Input } from '~/components/ui/input'
import { Trash, Plus, Loader } from 'lucide-vue-next'
import { useForm } from '@inertiajs/vue3'
import { QuestionType } from '#enums/question_types'
import type PastPaperDto from '#dtos/past_paper'
import type ConceptDto from '#dtos/concept'
import type QuestionDto from '#dtos/question'
import { watch, onMounted, ref } from 'vue'
import axios from 'axios'

interface ImageInputEvent extends Event {
  target: HTMLInputElement
}

const props = defineProps<{
  open: boolean
  paper: PastPaperDto
  concept: ConceptDto
  question: QuestionDto
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const isUploadingQuestionImage = ref(false)

const form = useForm({
  questionText: props.question.questionText,
  questionImagePath: props.question.questionImagePath || '',
  type: QuestionType.SAQ as const,
  parts: props.question.parts.map((part) => ({
    id: part.id,
    partText: part.partText,
    expectedAnswer: part.expectedAnswer,
    marks: part.marks,
  })),
})

// Function to reset/initialize form with current question data
const initializeForm = () => {
  form.questionText = props.question.questionText
  form.questionImagePath = props.question.questionImagePath || ''
  form.type = QuestionType.SAQ
  form.parts = props.question.parts.map((part) => ({
    id: part.id,
    partText: part.partText,
    expectedAnswer: part.expectedAnswer,
    marks: part.marks,
  }))
  form.clearErrors()
}

// Watch for changes to the question prop
watch(
  () => props.question,
  (newQuestion) => {
    if (newQuestion) {
      initializeForm()
    }
  },
  { deep: true }
)

// Watch dialog open state
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      // When dialog opens, ensure form has latest question data
      initializeForm()
    }
  }
)

// Initialize form on component mount
onMounted(() => {
  initializeForm()
})

async function handleImageUpload(file: File) {
  const formData = new FormData()
  formData.append('image', file)

  formData.append('context[folder]', 'saq')
  formData.append('context[subFolder]', `paper-${props.paper.id}`)

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

const addPart = () => {
  if (form.parts.length < 5) {
    form.parts.push({ id: 0, partText: '', expectedAnswer: '', marks: 1 })
  }
}

const removePart = (index: number) => {
  if (form.parts.length > 1) {
    form.parts.splice(index, 1)
  }
}

const handleSubmit = () => {
  form.put(
    `/manage/papers/${props.concept.slug}/${props.paper.slug}/questions/${props.question.slug}/saq`,
    {
      preserveScroll: true,
      onSuccess: () => {
        emit('update:open', false)
      },
    }
  )
}
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
      <DialogHeader
        class="bg-background/95 backdrop-blur-sm z-20 p-4 sm:pb-4 border-b max-w-screen-lg mx-auto"
      >
        <DialogTitle class="text-lg sm:text-xl">Edit SAQ</DialogTitle>
      </DialogHeader>

      <div class="p-3 sm:p-6">
        <form @submit.prevent="handleSubmit" class="space-y-4 sm:space-y-6">
          <!-- Question Text -->
          <div class="space-y-2 sm:space-y-3">
            <Label class="text-sm sm:text-base">Question Text</Label>
            <Input
              v-model="form.questionText"
              class="min-h-[44px] sm:min-h-[48px]"
              :class="{ 'border-destructive': form.errors.questionText }"
            />
          </div>

          <!-- Question Image (Optional) -->
          <div class="space-y-2 sm:space-y-3">
            <Label class="text-sm sm:text-base">Question Image (Optional)</Label>
            <div class="space-y-2">
              <Input
                type="file"
                accept="image/*"
                :disabled="isUploadingQuestionImage"
                @input="
                  (e: ImageInputEvent) => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload(file)
                  }
                "
              />

              <!-- Question Image Preview -->
              <div v-if="form.questionImagePath" class="relative w-full">
                <img
                  :src="form.questionImagePath"
                  class="max-h-40 rounded-lg object-cover"
                  alt="Question image preview"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  class="absolute top-2 right-2"
                  @click="removeImage"
                >
                  <Trash class="h-4 w-4" />
                </Button>
              </div>

              <!-- Upload Loading State -->
              <div
                v-if="isUploadingQuestionImage"
                class="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <Loader class="h-4 w-4 animate-spin" />
                <span>Uploading image...</span>
              </div>
            </div>
          </div>

          <!-- Parts -->
          <div class="space-y-3 sm:space-y-4">
            <div class="flex items-center justify-between">
              <Label class="text-sm sm:text-base">Parts ({{ form.parts.length }}/5)</Label>
              <Button type="button" variant="outline" size="sm" class="h-8 sm:h-9" @click="addPart">
                <Plus class="h-4 w-4 mr-2" />Add Part
              </Button>
            </div>

            <div
              v-for="(part, index) in form.parts"
              :key="`part-${index}-${props.question.id}`"
              class="p-3 sm:p-4 border rounded-lg space-y-3"
            >
              <div class="flex items-center justify-between">
                <Label>Part {{ index + 1 }}</Label>
                <Button
                  v-if="form.parts.length > 1"
                  type="button"
                  variant="ghost"
                  size="sm"
                  @click="removePart(index)"
                >
                  <Trash class="h-4 w-4" />
                </Button>
              </div>

              <div class="space-y-2">
                <Input v-model="part.partText" placeholder="Question part" />
              </div>

              <div class="space-y-2">
                <Label>Expected Answer</Label>
                <ExplanationEditor
                  v-model="part.expectedAnswer"
                  placeholder="Enter expected answer"
                />
              </div>

              <div class="space-y-2">
                <Input v-model="part.marks" type="number" min="1" placeholder="Marks" />
              </div>
            </div>
          </div>

          <Button type="submit" :disabled="form.processing" class="w-full h-10 sm:h-11">
            {{ form.processing ? 'Saving...' : 'Save Changes' }}
          </Button>
        </form>
      </div>
    </DialogContent>
  </Dialog>
</template>
