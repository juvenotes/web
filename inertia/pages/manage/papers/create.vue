<!-- inertia/pages/manage/papers/create.vue -->
<script setup lang="ts">
import { useForm } from '@inertiajs/vue3'
import type ConceptDto from '#dtos/concept'
import AdminLayout from '~/layouts/AdminLayout.vue'
import { ArrowLeft } from 'lucide-vue-next'
import { ExamType, PaperType } from '#enums/exam_type'

defineOptions({ layout: AdminLayout })

interface Props {
  concept: ConceptDto
}

const props = defineProps<Props>()

const form = useForm({
  title: '',
  year: new Date().getFullYear().toString(),
  paperType: PaperType.MCQ,
  examType: ExamType.EOY,
  conceptId: props.concept.id
})

function goBack() {
  window.history.back()
}

function handleSubmit() {
  form.post('/manage/papers')
}
</script>

<template>
  <AppHead 
    title="Create Past Paper" 
    :description="`Create a new past paper for ${concept.title}`" 
  />
  
  <div class="container mx-auto px-4 py-6">
    <nav class="flex items-center gap-2 mb-6">
      <button @click="goBack" 
              class="flex items-center gap-2 text-muted-foreground hover:text-primary">
        <ArrowLeft class="h-4 w-4" />
        <span>Back</span>
      </button>
    </nav>

    <div class="max-w-2xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">Create Past Paper</h1>
      
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="space-y-2">
          <Label>Subject</Label>
          <Input :value="concept.title" disabled />
        </div>

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
          <Select v-model="form.paperType" :error="form.errors.paperType">
            <option v-for="type in Object.values(PaperType)" 
                    :key="type" 
                    :value="type">
              {{ type }}
            </option>
          </Select>
        </div>

        <div class="space-y-2">
          <Label>Exam Type</Label>
          <Select v-model="form.examType" :error="form.errors.examType">
            <option v-for="type in Object.values(ExamType)" 
                    :key="type" 
                    :value="type">
              {{ type }}
            </option>
          </Select>
        </div>

        <Button type="submit" :disabled="form.processing">
          {{ form.processing ? 'Creating...' : 'Create Paper' }}
        </Button>
      </form>
    </div>
  </div>
</template>