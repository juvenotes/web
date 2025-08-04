<script setup lang="ts">
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { Label } from '~/components/ui/label'
import { useForm } from '@inertiajs/vue3'
import { Upload } from 'lucide-vue-next'
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
  file: null as File | null,
})

const error = ref<string | null>(null)

function handleFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.length) {
    form.file = input.files[0]
    error.value = null
  }
}

function handleSubmit() {
  error.value = null

  if (!form.title.trim()) {
    error.value = 'Quiz title is required'
    return
  }

  if (!form.file) {
    error.value = 'Please select a file to upload'
    return
  }

  form.post(`/manage/events/${props.event.slug}/quiz/upload`, {
    preserveScroll: true,
    forceFormData: true,
    onSuccess: () => {
      emit('update:open', false)
      form.reset()
      error.value = null
    },
    onError: (errors) => {
      error.value = errors.message || 'Failed to upload quiz'
    },
  })
}
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>Upload Quiz from File</DialogTitle>
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
              required
            />
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

        <!-- File Upload -->
        <div>
          <Label for="file">Quiz File *</Label>
          <div class="mt-2">
            <input
              id="file"
              type="file"
              accept=".txt,.md"
              @change="handleFileChange"
              class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#55A9C4] file:text-white hover:file:bg-[#4795af] transition-colors"
              required
            />
          </div>
          <p class="text-xs text-gray-500 mt-2">
            Upload a text file with MCQ questions in the supported format
          </p>
        </div>

        <!-- Format Guide -->
        <div class="bg-gray-50 rounded-lg p-4">
          <h4 class="text-sm font-medium text-gray-900 mb-2">File Format Example:</h4>
          <pre class="text-xs text-gray-700 whitespace-pre-wrap">What is the capital of France?
A) London
B) Berlin
C) Paris
D) Madrid

Answer: C
Explanation: Paris is the capital and largest city of France.

What is 2 + 2?
A) 3
B) 4
C) 5
D) 6

Answer: B
Explanation: Basic arithmetic: 2 + 2 = 4.</pre>
        </div>

        <!-- Error Display -->
        <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-sm text-red-600">{{ error }}</p>
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
            <Upload class="h-4 w-4 mr-2" />
            {{ form.processing ? 'Uploading...' : 'Upload Quiz' }}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>