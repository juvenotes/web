<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'

interface WebsiteForm {
  url: string
  title: string
  author?: string
  year?: string
  publisher?: string
  accessDate: string
}

interface BookForm {
  title: string
  author: string
  year: string
  publisher: string
  isbn?: string
  edition?: string
}

const type = ref<'doi' | 'website' | 'book'>('doi')
const doiSource = ref('')
const websiteForm = ref<WebsiteForm>({
  url: '',
  title: '',
  author: '',
  year: '',
  publisher: '',
  accessDate: new Date().toISOString().split('T')[0],
})
const bookForm = ref<BookForm>({
  title: '',
  author: '',
  year: new Date().getFullYear().toString(),
  publisher: '',
  isbn: '',
  edition: '',
})
const loading = ref(false)
const citations = ref<{ inText: string; bibliography: string } | null>(null)
const error = ref<string | null>(null)

async function handleSubmit() {
  loading.value = true
  error.value = null

  try {
    const payload = {
      type: type.value,
      source:
        type.value === 'doi'
          ? doiSource.value
          : type.value === 'website'
            ? websiteForm.value
            : bookForm.value,
    }

    const { data } = await axios.post('/api/cite', payload)
    citations.value = data
  } catch (err) {
    error.value = 'Failed to generate citation'
    console.error('Citation error:', err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto p-6 space-y-8">
    <div class="space-y-4">
      <h1 class="text-2xl font-bold">Citation Test</h1>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Citation Type -->
        <div class="space-y-2">
          <Label>Citation Type</Label>
          <Select v-model="type">
            <SelectTrigger>
              <SelectValue placeholder="Select citation type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="doi">DOI</SelectItem>
              <SelectItem value="website">Website</SelectItem>
              <SelectItem value="book">Book</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Source Input -->
        <div class="space-y-4">
          <!-- DOI Input -->
          <div v-if="type === 'doi'" class="space-y-2">
            <Label>DOI</Label>
            <Input v-model="doiSource" placeholder="Enter DOI (e.g. 10.1000/xyz123)" />
          </div>

          <!-- Website Form -->
          <template v-if="type === 'website'">
            <div class="space-y-2">
              <Label>Website URL</Label>
              <Input v-model="websiteForm.url" placeholder="https://example.com" />
            </div>
            <div class="space-y-2">
              <Label>Page Title</Label>
              <Input v-model="websiteForm.title" placeholder="Page title" />
            </div>
            <div class="space-y-2">
              <Label>Author (if available)</Label>
              <Input v-model="websiteForm.author" placeholder="Author name" />
            </div>
            <div class="space-y-2">
              <Label>Year Published (if available)</Label>
              <Input v-model="websiteForm.year" placeholder="YYYY" />
            </div>
            <div class="space-y-2">
              <Label>Publisher/Organization</Label>
              <Input v-model="websiteForm.publisher" placeholder="Publisher or organization name" />
            </div>
            <div class="space-y-2">
              <Label>Access Date</Label>
              <Input v-model="websiteForm.accessDate" type="date" />
            </div>
          </template>

          <!-- Book Form -->
          <template v-if="type === 'book'">
            <div class="space-y-2">
              <Label>Book Title</Label>
              <Input v-model="bookForm.title" placeholder="Book title" />
            </div>
            <div class="space-y-2">
              <Label>Author</Label>
              <Input v-model="bookForm.author" placeholder="Author name" />
            </div>
            <div class="space-y-2">
              <Label>Year Published</Label>
              <Input v-model="bookForm.year" placeholder="YYYY" />
            </div>
            <div class="space-y-2">
              <Label>Publisher</Label>
              <Input v-model="bookForm.publisher" placeholder="Publisher name" />
            </div>
            <div class="space-y-2">
              <Label>ISBN (optional)</Label>
              <Input v-model="bookForm.isbn" placeholder="ISBN" />
            </div>
            <div class="space-y-2">
              <Label>Edition (optional)</Label>
              <Input v-model="bookForm.edition" placeholder="e.g. 2nd Edition" />
            </div>
          </template>
        </div>

        <Button type="submit" :disabled="loading">
          {{ loading ? 'Generating...' : 'Generate Citation' }}
        </Button>
      </form>

      <!-- Error Message -->
      <p v-if="error" class="text-sm text-red-500">{{ error }}</p>

      <!-- Citations Output -->
      <div v-if="citations" class="space-y-6 mt-8">
        <!-- In-text Citation -->
        <div class="space-y-2">
          <h2 class="text-lg font-semibold">In-text Citation</h2>
          <div class="p-4 bg-muted rounded-lg">
            <p class="text-sm">{{ citations.inText }}</p>
          </div>
        </div>

        <!-- Bibliography Entry -->
        <div class="space-y-2">
          <h2 class="text-lg font-semibold">Bibliography Entry</h2>
          <div class="p-4 bg-muted rounded-lg">
            <p class="text-sm whitespace-pre-wrap">{{ citations.bibliography }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
