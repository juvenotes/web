<script setup lang="ts">
import AppLayout from '~/layouts/AppLayout.vue'
import { ref } from 'vue'
import { useForm } from '@inertiajs/vue3'
import { Button } from '~/components/ui/button'

defineOptions({ layout: AppLayout })

const form = useForm({
  image: null as File | null,
})

const result = ref('')
const error = ref('')
const isUploading = ref(false)

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    form.image = input.files[0]
    error.value = '' // Clear any previous errors
  }
}

async function handleSubmit(e: Event) {
  e.preventDefault()

  if (!form.image) {
    error.value = 'Please select an image'
    return
  }

  const formData = new FormData()
  formData.append('image', form.image)
  
  isUploading.value = true
  error.value = ''

  try {
    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
      headers: {
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
      }
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Upload failed')
    }

    result.value = `<img src="${data.url}" class="max-w-sm rounded-lg shadow-md">`
    form.reset()

  } catch (err) {
    console.error('Upload error:', err)
    error.value = err instanceof Error ? err.message : 'Upload failed'
  } finally {
    isUploading.value = false
  }
}
</script>

<template>
  <AppHead title="Test Upload" description="Test image uploads" />

  <div class="max-w-xl mx-auto space-y-8">
    <div class="bg-card p-6 rounded-lg border space-y-4">
      <h1 class="text-2xl font-bold">Test Image Upload</h1>

      <form @submit="handleSubmit" class="space-y-4" enctype="multipart/form-data">
        <input
          type="file"
          name="image"
          accept="image/*"
          required
          @change="handleFileChange"
          class="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
        />

        <Button type="submit" :disabled="isUploading || !form.image">
          {{ isUploading ? 'Uploading...' : 'Upload' }}
        </Button>
      </form>

      <div v-if="error" class="p-4 bg-destructive/10 text-destructive rounded-lg">
        {{ error }}
      </div>

      <div v-if="result" v-html="result" class="mt-4" />
    </div>
  </div>
</template>