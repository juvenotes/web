<script setup lang="ts">
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { useForm } from '@inertiajs/vue3'
import type PastPaperDto from '#dtos/past_paper'
import type ConceptDto from '#dtos/concept'
import { ExamType, PaperType, PaperTypeLabels, ExamTypeLabels } from '#enums/exam_type'

const props = defineProps<{
  open: boolean
  paper: PastPaperDto
  concept: ConceptDto
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const form = useForm({
  title: props.paper.title,
  year: props.paper.year,
  paperType: props.paper.paperType,
  examType: props.paper.examType,
})

function handleSubmit() {
  form.put(`/manage/papers/${props.concept.slug}/${props.paper.slug}`, {
    preserveScroll: true,
    onSuccess: () => {
      emit('update:open', false)
    },
  })
}
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Edit Paper</DialogTitle>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="space-y-2">
          <Label>Title</Label>
          <Input v-model="form.title" :error="form.errors.title" />
        </div>

        <div class="space-y-2">
          <Label>Year</Label>
          <Input v-model="form.year" :error="form.errors.year" />
        </div>

        <div class="space-y-2">
          <Label>Paper Type</Label>
          <Select v-model="form.paperType">
            <SelectTrigger :class="{ 'border-red-500': form.errors.paperType }">
              <SelectValue placeholder="Select paper type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="type in Object.values(PaperType)" :key="type" :value="type">
                {{ PaperTypeLabels[type] }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <Label>Exam Type</Label>
          <Select v-model="form.examType">
            <SelectTrigger :class="{ 'border-red-500': form.errors.examType }">
              <SelectValue placeholder="Select exam type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="type in Object.values(ExamType)" :key="type" :value="type">
                {{ ExamTypeLabels[type] }}
              </SelectItem>  
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" :disabled="form.processing">
          {{ form.processing ? 'Saving...' : 'Save Changes' }}
        </Button>
      </form>
    </DialogContent>
  </Dialog>
</template>