<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'submit': [citation: any]
}>()

const type = ref<'journal' | 'book' | 'website'>('journal')
const authors = ref('')
const title = ref('')
const year = ref('')
const source = ref('')
const doi = ref('')
const url = ref('')
const publisher = ref('')
const pages = ref('')

const handleSubmit = () => {
  emit('submit', {
    type: type.value,
    authors: authors.value.split(',').map((a) => a.trim()),
    title: title.value,
    year: year.value,
    source: source.value,
    doi: doi.value,
    url: url.value,
    publisher: publisher.value,
    pages: pages.value,
  })
  resetForm()
}

const resetForm = () => {
  type.value = 'journal'
  authors.value = ''
  title.value = ''
  year.value = ''
  source.value = ''
  doi.value = ''
  url.value = ''
  publisher.value = ''
  pages.value = ''
}
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add Citation</DialogTitle>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <Label>Type</Label>
          <Select v-model="type">
            <SelectTrigger>
              <SelectValue placeholder="Select citation type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="journal">Journal Article</SelectItem>
              <SelectItem value="book">Book</SelectItem>
              <SelectItem value="website">Website</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Authors (comma-separated)</Label>
          <Input v-model="authors" />
        </div>

        <div>
          <Label>Title</Label>
          <Input v-model="title" />
        </div>

        <!-- ... other fields based on type -->

        <Button type="submit">Add Citation</Button>
      </form>
    </DialogContent>
  </Dialog>
</template>
