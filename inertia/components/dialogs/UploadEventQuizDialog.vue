<script setup lang="ts">
import { useForm } from '@inertiajs/vue3'
import type EventDto from '#dtos/event'
import type EventQuizDto from '#dtos/event_quiz'
import { Upload, FileText, AlertCircle } from 'lucide-vue-next'
import { ref } from 'vue'

const props = defineProps<{
  open: boolean
  event: EventDto
  quiz: EventQuizDto
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const form = useForm({
  file: null as File | null,
})

const dragActive = ref(false)
const fileInputRef = ref<HTMLInputElement>()

function handleFileSelect(file: File) {
  if (file && (file.type === 'text/plain' || file.name.endsWith('.txt'))) {
    form.file = file
  } else {
    alert('Please select a valid .txt file')
  }
}

function handleFileInput(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    handleFileSelect(file)
  }
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  dragActive.value = false

  const file = event.dataTransfer?.files[0]
  if (file) {
    handleFileSelect(file)
  }
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
  dragActive.value = true
}

function handleDragLeave() {
  dragActive.value = false
}

function triggerFileInput() {
  fileInputRef.value?.click()
}

function removeFile() {
  form.file = null
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

function handleSubmit() {
  if (!form.file) return

  const formData = new FormData()
  formData.append('file', form.file)

  form.post(`/manage/events/${props.event.slug}/quiz/${props.quiz.id}/upload`, {
    preserveScroll: true,
    onSuccess: () => {
      emit('update:open', false)
      form.file = null
      if (fileInputRef.value) {
        fileInputRef.value.value = ''
      }
    },
    forceFormData: true,
  })
}
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Upload MCQ Questions</DialogTitle>
      </DialogHeader>

      <div class="space-y-6">
        <!-- Instructions -->
        <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div class="flex items-start gap-3">
            <AlertCircle class="h-5 w-5 text-blue-600 mt-0.5" />
            <div class="space-y-2 text-sm">
              <p class="font-medium text-blue-900">File Format Requirements:</p>
              <ul class="list-disc list-inside space-y-1 text-blue-800">
                <li>Plain text file (.txt)</li>
                <li>Each question should start with a number (e.g., "1.", "2.")</li>
                <li>Choices should be labeled A, B, C, D, E</li>
                <li>Correct answer should be indicated with "*" (e.g., "*A. Correct choice")</li>
                <li>Optional explanation can follow after "Explanation:"</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- File Upload Area -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div
            class="relative border-2 border-dashed rounded-lg p-8 text-center transition-colors"
            :class="dragActive ? 'border-primary bg-primary/5' : 'border-gray-300'"
            @drop="handleDrop"
            @dragover="handleDragOver"
            @dragleave="handleDragLeave"
          >
            <input
              ref="fileInputRef"
              type="file"
              accept=".txt,text/plain"
              @change="handleFileInput"
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            <div v-if="!form.file" class="space-y-4">
              <div class="flex justify-center">
                <Upload class="h-12 w-12 text-gray-400" />
              </div>
              <div>
                <p class="text-lg font-medium text-gray-900">
                  Drop your file here, or
                  <button
                    type="button"
                    @click="triggerFileInput"
                    class="text-primary hover:text-primary/80 underline"
                  >
                    browse
                  </button>
                </p>
                <p class="text-sm text-gray-500 mt-1">Supports: .txt files only</p>
              </div>
            </div>

            <div v-else class="space-y-4">
              <div class="flex justify-center">
                <FileText class="h-12 w-12 text-green-600" />
              </div>
              <div>
                <p class="text-lg font-medium text-gray-900">{{ form.file.name }}</p>
                <p class="text-sm text-gray-500">{{ (form.file.size / 1024).toFixed(1) }} KB</p>
              </div>
              <Button type="button" @click="removeFile" variant="outline" size="sm">
                Remove File
              </Button>
            </div>
          </div>

          <div v-if="form.errors.file" class="text-sm text-red-600">
            {{ form.errors.file }}
          </div>

          <!-- Form Actions -->
          <div class="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" @click="$emit('update:open', false)" variant="outline">
              Cancel
            </Button>
            <Button type="submit" :disabled="!form.file || form.processing">
              {{ form.processing ? 'Uploading...' : 'Upload Questions' }}
            </Button>
          </div>
        </form>

        <!-- Example Format -->
        <div class="space-y-3">
          <h4 class="font-medium text-gray-900">Example Format:</h4>
          <div class="bg-gray-50 border rounded-lg p-4 text-sm font-mono whitespace-pre-line">
            {`1. What is the capital of France? A. London B. Berlin *C. Paris D. Madrid Explanation:
            Paris is the capital and largest city of France. 2. Which planet is known as the Red
            Planet? A. Venus B. Jupiter *C. Mars D. Saturn`}
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
