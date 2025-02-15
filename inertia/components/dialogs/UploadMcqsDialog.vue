<script setup lang="ts">
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { useForm } from '@inertiajs/vue3'
import { Upload } from 'lucide-vue-next'
import type PastPaperDto from '#dtos/past_paper'
import type ConceptDto from '#dtos/concept'
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

const error = ref<string | null>(null)

function handleFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.length) {
    form.file = input.files[0]
  }
}

function handleSubmit() {
  error.value = null

  if (!form.file) {
    error.value = 'Please select a file'
    return
  }

  form.post(`/manage/papers/${props.concept.slug}/${props.paper.slug}/questions/mcq/upload`, {
    preserveScroll: true,
    forceFormData: true,
    onSuccess: () => {
      emit('update:open', false)
      form.reset()
    },
    onError: (errors) => {
      error.value = errors.message || 'Failed to upload questions'
    },
  })
}
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Upload MCQs from File</DialogTitle>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-6">
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
          {{ form.processing ? 'Uploading...' : 'Upload MCQs' }}
        </Button>
      </form>
    </DialogContent>
  </Dialog>
</template>
