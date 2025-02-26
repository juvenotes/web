<script setup lang="ts">
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { useForm } from '@inertiajs/vue3'
import type PastPaperDto from '#dtos/past_paper'
import type ConceptDto from '#dtos/concept'
import { ExamType, PaperType, PaperTypeLabels, ExamTypeLabels } from '#enums/exam_type'
import { StudyLevel, StudyLevelLabels } from '#enums/study_level'
import { watch, onMounted } from 'vue'

const props = defineProps<{
  open: boolean
  paper: PastPaperDto
  concept: ConceptDto
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const form = useForm({
  title: '',
  year: '',
  paperType: '',
  examType: '',
  studyLevel: '',
})

// Function to initialize/reset form
const initializeForm = () => {
  form.title = props.paper.title
  form.year = props.paper.year
  form.paperType = props.paper.paperType
  form.examType = props.paper.examType
  form.studyLevel = props.paper.studyLevel || StudyLevel.LEVEL_1
  form.clearErrors()
}

// Watch for changes to props.paper
watch(
  () => props.paper,
  () => {
    initializeForm()
  },
  { immediate: true }
)

// Watch dialog open state
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      // When dialog opens, ensure form is reset
      initializeForm()
    }
  }
)

// Initialize form on component mount
onMounted(() => {
  initializeForm()
})

function handleSubmit() {
  form.put(`/manage/papers/${props.concept.slug}/${props.paper.slug}`, {
    preserveScroll: true,
    onSuccess: () => {
      emit('update:open', false)
      initializeForm()
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
        <DialogTitle>Edit Paper</DialogTitle>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="space-y-2">
          <Label>Title</Label>
          <Input v-model="form.title" :error="form.errors.title" />
          <p class="text-sm text-muted-foreground">
            A descriptive title for the paper (e.g. "Anatomy Final Paper")
          </p>
        </div>

        <div class="space-y-2">
          <Label>Year</Label>
          <Input v-model="form.year" :error="form.errors.year" />
          <p class="text-sm text-muted-foreground">(e.g. "2024")</p>
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
            <p class="text-sm text-muted-foreground">
              Choose whether this is an MCQ, SAQ, or mixed (both)
            </p>
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
            <p class="text-sm text-muted-foreground">
              Choose whether this is an MCQ, SAQ, or mixed (both)
            </p>
          </Select>
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
          </Select>
        </div>

        <Button type="submit" :disabled="form.processing">
          {{ form.processing ? 'Saving...' : 'Save Changes' }}
        </Button>
      </form>
    </DialogContent>
  </Dialog>
</template>
