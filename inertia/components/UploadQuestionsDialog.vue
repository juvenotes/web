<script setup lang="ts">
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { useForm } from '@inertiajs/vue3'
import { Upload } from 'lucide-vue-next'
import type PastPaperDto from '#dtos/past_paper'
import ConceptDto from '#dtos/concept'
import { ref } from 'vue'

const props = defineProps<{
  open: boolean
  paper: PastPaperDto
  concept: ConceptDto
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const form = useForm({
  file: null as File | null,
})

function handleFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.length) {
    form.file = input.files[0]
  }
}

const error = ref<string | null>(null)

function handleSubmit() {
  console.log('Submitting form:', form.file)
  form.post(`/manage/papers/${props.concept.slug}/${props.paper.slug}/upload-questions`, {
    preserveScroll: true,
    forceFormData: true,
    onSuccess: () => {
      console.log('Upload successful')
      error.value = null
      emit('update:open', false)
      form.reset()
    },
    onError: (errors) => {
      console.error('Upload failed:', errors)
      error.value = errors.message || 'Failed to upload questions. Please check your file format.'
    },
  })
}
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Upload Questions</DialogTitle>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Add error display -->
        <div v-if="error" class="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
          {{ error }}
        </div>

        <div class="space-y-2">
          <label
            class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50"
          >
            <div class="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload
                class="w-8 h-8 mb-2"
                :class="form.processing ? 'animate-pulse' : 'text-muted-foreground'"
              />
              <p class="text-sm text-muted-foreground">
                {{ form.file ? form.file.name : 'Click to upload MCQ file' }}
              </p>
            </div>
            <input
              type="file"
              class="hidden"
              accept=".txt"
              @change="handleFileChange"
              :disabled="form.processing"
            />
          </label>
        </div>

        <Button type="submit" :disabled="form.processing || !form.file" class="w-full">
          <span class="flex items-center gap-2">
            <span v-if="form.processing" class="animate-spin">⏳</span>
            {{ form.processing ? 'Uploading...' : 'Upload Questions' }}
          </span>
        </Button>
      </form>
    </DialogContent>
  </Dialog>
</template>
