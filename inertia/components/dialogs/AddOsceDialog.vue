<script setup lang="ts">
import { useForm } from '@inertiajs/vue3'
import type PastPaperDto from '#dtos/past_paper'
import type ConceptDto from '#dtos/concept'
import { Plus, Trash2, Loader2 } from 'lucide-vue-next'
import axios from 'axios'
import { ref } from 'vue'
import { QuestionType } from '#enums/question_types'

const props = defineProps<{
  open: boolean
  concept: ConceptDto
  paper: PastPaperDto
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

interface ImageInputEvent extends Event {
  target: HTMLInputElement
}

const isUploadingQuestionImage = ref(false)
const uploadingPartImage = ref<number | null>(null)

const form = useForm({
  questionText: '',
  type: QuestionType.OSCE as const,
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

async function handleImageUpload(file: File, type: 'question' | 'part', index?: number) {
  const formData = new FormData()
  formData.append('image', file)

  formData.append('context[folder]', 'osce')
  formData.append('context[subFolder]', `paper-${props.paper.id}`)

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
  form.parts.push({
    partText: '',
    expectedAnswer: '',
    marks: 1,
    imagePath: '',
  })
}

function removePart(index: number) {
  if (form.parts.length > 1) {
    form.parts.splice(index, 1)
  }
}

function handleSubmit() {
  form.post(`/manage/osce/${props.concept.slug}/${props.paper.slug}/questions`, {
    preserveScroll: true,
    // forceFormData: true,
    onSuccess: () => {
      emit('update:open', false)
      form.reset()
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
        <DialogTitle>Add OSCE Question</DialogTitle>
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
                  <Trash2 class="h-4 w-4" />
                </Button>
              </div>

              <!-- Upload Loading State -->
              <div
                v-if="isUploadingQuestionImage"
                class="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <Loader2 class="h-4 w-4 animate-spin" />
                <span>Uploading image...</span>
              </div>
            </div>
          </div>

          <!-- OSCE Parts -->
          <div class="space-y-3 sm:space-y-4">
            <div class="flex items-center justify-between">
              <Label class="text-sm sm:text-base">Parts ({{ form.parts.length }}/5)</Label>
              <Button
                type="button"
                variant="outline"
                @click="addPart"
                :disabled="form.parts.length >= 5"
              >
                <Plus class="h-4 w-4 mr-2" />Add Part
              </Button>
            </div>

            <div
              v-for="(part, index) in form.parts"
              :key="index"
              class="p-3 sm:p-4 border rounded-lg space-y-3"
            >
              <!-- Part content -->
              <div class="flex justify-end">
                <Button
                  v-if="form.parts.length > 1"
                  type="button"
                  variant="ghost"
                  size="icon"
                  @click="removePart(index)"
                >
                  <Trash2 class="h-4 w-4 text-destructive" />
                </Button>
              </div>

              <div class="space-y-2">
                <Label>Part {{ index + 1 }} Text</Label>
                <Input v-model="part.partText" />
              </div>

              <div class="space-y-2">
                <!-- <Textarea
                  v-model="part.expectedAnswer"
                  :placeholder="'Expected answer can include lists:\n- Point 1\n- Point 2\n- Point 3'"
                  rows="4"
                  class="resize-y min-h-[100px]"
                /> -->
                <Label>Expected Answer</Label>
                <ExplanationEditor
                  v-model="part.expectedAnswer"
                  placeholder="Enter expected answer"
                />
              </div>

              <div class="space-y-2">
                <Label>Marks</Label>
                <Input type="number" v-model="part.marks" min="1" />
              </div>

              <div class="space-y-2">
                <Label>Image (Optional)</Label>
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

                <!-- Part Image Preview -->
                <div v-if="part.imagePath" class="relative w-full">
                  <img
                    :src="part.imagePath"
                    class="max-h-40 rounded-lg object-cover"
                    :alt="`Part ${index + 1} image preview`"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    class="absolute top-2 right-2"
                    @click="removeImage('part', index)"
                  >
                    <Trash2 class="h-4 w-4" />
                  </Button>
                </div>

                <!-- Upload Loading State -->
                <div
                  v-if="uploadingPartImage === index"
                  class="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <Loader2 class="h-4 w-4 animate-spin" />
                  <span>Uploading image...</span>
                </div>
              </div>
            </div>
          </div>

          <div class="sticky bottom-0 pt-4 bg-background">
            <Button type="submit" class="w-full" :disabled="form.processing">
              {{ form.processing ? 'Adding...' : 'Add Question' }}
            </Button>
          </div>
        </form>
      </div>
    </DialogContent>
  </Dialog>
</template>
