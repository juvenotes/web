<script setup lang="ts">
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { useForm } from '@inertiajs/vue3'
import type ConceptDto from '#dtos/concept'
import { ExamType, PaperType, PaperTypeLabels, ExamTypeLabels } from '#enums/exam_type'
import { StudyLevel, StudyLevelLabels } from '#enums/study_level'

const props = defineProps<{
  open: boolean
  concept: ConceptDto
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const form = useForm({
  title: '',
  year: new Date().getFullYear().toString(),
  paperType: PaperType.MCQ,
  examType: ExamType.EOY,
  conceptId: props.concept.id,
  studyLevel: StudyLevel.LEVEL_1,
})

function handleSubmit() {
  form.post('/manage/papers', {
    preserveScroll: true,
    onSuccess: () => {
      emit('update:open', false)
      form.reset()
    },
    onError: (errors) => {
      console.error('Form errors:', errors)
    },
  })
}
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Add Paper to {{ concept.title }}</DialogTitle>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="space-y-2">
          <Label>Title</Label>
          <Input v-model="form.title" :error="form.errors.title" />
          <p class="text-sm text-muted-foreground">
            Enter a descriptive title for the paper (e.g. "Anatomy Final Paper")
          </p>
        </div>

        <div class="space-y-2">
          <Label>Year</Label>
          <Input v-model="form.year" :error="form.errors.year" />
          <p class="text-sm text-muted-foreground">
            Enter the year this paper was administered (e.g. "2024")
          </p>
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
          <p class="text-sm text-muted-foreground">
            Choose whether this is an MCQ, SAQ, or mixed (both)
          </p>
          <span v-if="form.errors.paperType" class="text-sm text-red-500">
            {{ form.errors.paperType }}
          </span>
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
          <p class="text-sm text-muted-foreground">
            Specify if this is a CAT or End of Year examination
          </p>
          <span v-if="form.errors.examType" class="text-sm text-red-500">
            {{ form.errors.examType }}
          </span>
        </div>

        <div class="space-y-2">
          <Label>Study Level</Label>
          <Select v-model="form.studyLevel">
            <SelectTrigger :class="{ 'border-red-500': form.errors.studyLevel }">
              <SelectValue placeholder="Select study level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="type in Object.values(StudyLevel)" :key="type" :value="type">
                {{ StudyLevelLabels[type] }}
              </SelectItem>
            </SelectContent>
            <p class="text-sm text-muted-foreground">
              Select the academic level this paper is intended for
            </p>
            <span v-if="form.errors.studyLevel" class="text-sm text-red-500">
              {{ form.errors.studyLevel }}
            </span>
          </Select>
        </div>

        <Button type="submit" :disabled="form.processing">
          {{ form.processing ? 'Creating...' : 'Create Paper' }}
        </Button>
      </form>
    </DialogContent>
  </Dialog>
</template>
