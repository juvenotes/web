<script setup lang="ts">
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { useForm } from '@inertiajs/vue3'
import { Upload } from 'lucide-vue-next'
import type PastPaperDto from '#dtos/past_paper'

const props = defineProps<{
  open: boolean
  paper: PastPaperDto
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

function handleSubmit() {
  form.post(`/manage/papers/${props.paper.id}/upload-questions`, {
    preserveScroll: true,
    onSuccess: () => {
      emit('update:open', false)
      form.reset()
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
        <div class="space-y-2">
          <label
            class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50"
          >
            <div class="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload class="w-8 h-8 mb-2 text-muted-foreground" />
              <p class="text-sm text-muted-foreground">Click to upload MCQ file</p>
            </div>
            <input type="file" class="hidden" accept=".txt" @change="handleFileChange" />
          </label>
          <span v-if="form.errors.file" class="text-sm text-destructive">
            {{ form.errors.file }}
          </span>
        </div>

        <Button type="submit" :disabled="form.processing || !form.file">
          {{ form.processing ? 'Uploading...' : 'Upload Questions' }}
        </Button>
      </form>
    </DialogContent>
  </Dialog>
</template>
