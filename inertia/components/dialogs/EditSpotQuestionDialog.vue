<script setup lang="ts">
import { Trash, Plus, Loader } from 'lucide-vue-next'
import { useForm } from '@inertiajs/vue3'
import { QuestionType } from '#enums/question_types'
import type PastPaperDto from '#dtos/past_paper'
import type ConceptDto from '#dtos/concept'
import type QuestionDto from '#dtos/question'
import { ref, watch, onMounted } from 'vue'
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
const uploadingPartImage = ref<number | null>(null)

// Function to initialize/reset form
const initializeForm = () => {
  form.questionText = props.question.questionText
  form.type = QuestionType.SPOT
  form.questionImagePath = props.question.questionImagePath || ''
  form.parts = props.question.spotStations.map((part) => ({
    partText: part.partText,
    expectedAnswer: part.expectedAnswer,
    marks: part.marks,
    imagePath: part.imagePath || '',
  }))
  form.clearErrors()
}

const form = useForm({
  questionText: '',
  type: QuestionType.SPOT as const,
  questionImagePath: '',
  parts: [
    {
      partText: '',
      expectedAnswer: '',
      marks: 1,
      imagePath: '',
    },
  ],
})

// Watch dialog open state
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen && props.question) {
      // When dialog opens, ensure form is reset with question data
      initializeForm()
    }
  }
)

// Initialize form on component mount
onMounted(() => {
  if (props.question) {
    initializeForm()
  }
})

async function handleImageUpload(file: File, type: 'question' | 'part', index?: number) {
  const formData = new FormData()
  formData.append('image', file)

  formData.append('context[folder]', 'spot')
  formData.append(
    'context[subFolder]',
    `paper-${props.paper.id}${type === 'part' ? `/question-${props.question.id}` : ''}`
  )

  try {
    if (type === 'question') {
      isUploadingQuestionImage.value = true
    } else if (typeof index === 'number') {
      uploadingPartImage.value = index
    }

    const { data } = await axios.post('/api/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    if (type === 'question') {
      form.questionImagePath = data
    } else if (typeof index === 'number') {
      form.parts[index].imagePath = data
    }
  } catch (error) {
    console.error('Failed to upload image:', error)
  } finally {
    if (type === 'question') {
      isUploadingQuestionImage.value = false
    } else if (typeof index === 'number') {
      uploadingPartImage.value = null
    }
  }
}

function removeImage(type: 'question' | 'part', index?: number) {
  if (type === 'question') {
    form.questionImagePath = ''
  } else if (typeof index === 'number') {
    form.parts[index].imagePath = ''
  }
}

function addPart() {
  if (form.parts.length < 5) {
    form.parts.push({
      partText: '',
      expectedAnswer: '',
      marks: 1,
      imagePath: '',
    })
  }
}

const removePart = (index: number) => {
  if (form.parts.length > 1) {
    form.parts.splice(index, 1)
  }
}

const handleSubmit = () => {
  form.put(
    `/manage/spot/${props.concept.slug}/${props.paper.slug}/questions/${props.question.slug}/spot`,
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
        <DialogTitle class="text-lg sm:text-xl">Edit SPOT Question</DialogTitle>
      </DialogHeader>

      <div class="p-3 sm:p-6">
        <form @submit.prevent="handleSubmit" class="space-y-4 sm:space-y-6">
          <!-- Question Text & Image -->
          <div class="space-y-2 sm:space-y-3">
            <Label class="text-sm sm:text-base">Question Text</Label>
            <Input
              v-model="form.questionText"
              class="min-h-[44px] sm:min-h-[48px]"
              :class="{ 'border-destructive': form.errors.questionText }"
            />

            <Label class="text-sm sm:text-base">Question Image (Optional)</Label>
            <div class="space-y-2">
              <Input
                type="file"
                accept="image/*"
                :disabled="isUploadingQuestionImage"
                @input="
                  (e: ImageInputEvent) => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload(file, 'question')
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
                  @click="removeImage('question')"
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

          <!-- SPOT Stations -->
          <div class="space-y-3 sm:space-y-4">
            <div class="flex items-center justify-between">
              <Label class="text-sm sm:text-base">Stations ({{ form.parts.length }}/5)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                class="h-8 sm:h-9"
                @click="addPart"
                :disabled="form.parts.length >= 5"
              >
                <Plus class="h-4 w-4 mr-2" />Add Station
              </Button>
            </div>

            <div
              v-for="(part, index) in form.parts"
              :key="`part-${index}`"
              class="p-3 sm:p-4 border rounded-lg space-y-3"
            >
              <div class="flex items-center justify-between">
                <Label>Station {{ index + 1 }}</Label>
                <Button
                  v-if="form.parts.length > 1"
                  type="button"
                  variant="ghost"
                  size="sm"
                  @click="removePart(index)"
                >
                  <Trash class="h-4 w-4 text-destructive" />
                </Button>
              </div>

              <div class="space-y-2">
                <Label>Station Description</Label>
                <Textarea
                  v-model="part.partText"
                  placeholder="Describe what the student should do"
                  rows="3"
                />
              </div>

              <div class="space-y-2">
                <Label>Expected Answer</Label>
                <ExplanationEditor
                  v-model="part.expectedAnswer"
                  placeholder="Enter the model answer"
                />
              </div>

              <div class="space-y-2">
                <Label>Marks</Label>
                <Input v-model="part.marks" type="number" min="1" />
              </div>

              <div class="space-y-2">
                <Label>Station Image (Optional)</Label>
                <Input
                  type="file"
                  accept="image/*"
                  :disabled="uploadingPartImage === index"
                  @input="
                    (e: ImageInputEvent) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(file, 'part', index)
                    }
                  "
                />

                <!-- Station Image Preview -->
                <div v-if="part.imagePath" class="relative w-full">
                  <img
                    :src="part.imagePath"
                    class="max-h-40 rounded-lg object-cover"
                    :alt="`Station ${index + 1} image preview`"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    class="absolute top-2 right-2"
                    @click="removeImage('part', index)"
                  >
                    <Trash class="h-4 w-4" />
                  </Button>
                </div>

                <!-- Upload Loading State -->
                <div
                  v-if="uploadingPartImage === index"
                  class="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <Loader class="h-4 w-4 animate-spin" />
                  <span>Uploading image...</span>
                </div>
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
