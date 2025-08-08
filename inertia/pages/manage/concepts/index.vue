<script setup lang="ts">
import { Link, useForm } from '@inertiajs/vue3'
import type ConceptDto from '#dtos/concept'
import AdminLayout from '~/layouts/AdminLayout.vue'
import { TrainingLevel, TrainingLevelLabels } from '#enums/training_level'
import { ref, computed } from 'vue'
import { toast } from 'vue-sonner'
import { Plus, FileText } from 'lucide-vue-next'

defineOptions({ layout: AdminLayout })

const selectedLevel = ref<TrainingLevel | null>(null)

const filteredConcepts = computed(() => {
  if (!selectedLevel.value) return props.concepts
  return props.concepts.filter((c) => c.trainingLevel === selectedLevel.value)
})

interface Props {
  concepts: ConceptDto[]
}

const props = defineProps<Props>()

const showNewParentDialog = ref(false)

const newParentForm = useForm({
  title: '',
  parentId: null,
  isTerminal: false,
})

const handleNewParent = () => {
  newParentForm.post('/manage/concepts', {
    onSuccess: () => {
      showNewParentDialog.value = false
      newParentForm.reset()
    },
    onError: (errors) => {
      toast.error('Failed to create concept')
      console.error('Form errors:', errors)
    },
  })
}
</script>

<template>
  <AppHead title="Manage concepts" description="Manage concepts in Juvenotes" />
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
    <!-- Header with Breadcrumb -->
    <div
      class="relative p-6 sm:p-8 bg-white/50 dark:bg-card rounded-2xl border shadow-sm dark:border-border"
    >
      <div
        class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-primary/50 to-transparent"
      />
      <div class="mt-4 flex flex-col sm:flex-row gap-4 sm:items-start justify-between">
        <div class="flex items-start gap-4 mt-4">
          <div class="p-3 rounded-xl bg-primary/5 border border-primary/10">
            <FileText class="h-6 w-6 text-primary" />
          </div>

          <div class="space-y-2">
            <h1 class="text-2xl font-bold text-foreground">Manage Concepts</h1>
            <p class="text-base text-muted-foreground/90 max-w-2xl">
              Create and manage concepts for different subjects
            </p>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <Button variant="outline" @click="showNewParentDialog = true" class="w-full sm:w-auto">
            <Plus class="h-4 w-4 mr-2" />
            Add Root Concept
          </Button>
          <ToggleUrl />
        </div>
      </div>
    </div>

    <!-- Filter Section -->
    <div class="flex justify-end">
      <ToggleTrainingLevel v-model="selectedLevel" />
    </div>

    <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      <Link
        v-for="concept in filteredConcepts"
        :key="concept.id"
        :href="`/manage/concepts/${concept.slug}`"
        class="group relative overflow-hidden rounded-2xl bg-white dark:bg-card p-6 border border-slate-100 dark:border-border hover:border-primary/30 dark:hover:border-primary/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
      >
        <div class="relative space-y-3">
          <h2
            class="text-lg font-bold bg-gradient-to-r from-primary/90 to-primary/70 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary transition-all duration-300"
          >
            {{ concept.title }}
          </h2>
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            <span
              v-if="concept.trainingLevel"
              class="px-2 py-1 rounded-md bg-primary/10 text-primary font-medium"
            >
              {{ TrainingLevelLabels[concept.trainingLevel] }}
            </span>
          </div>
          <div
            class="flex items-center text-sm text-primary font-medium transform translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300"
          >
            <span>Manage concept</span>
            <svg
              class="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
        </div>
      </Link>
    </div>

    <Dialog :open="showNewParentDialog" @update:open="showNewParentDialog = $event">
      <DialogContent class="w-[95vw] max-w-[800px] sm:w-[90vw]">
        <DialogHeader>
          <DialogTitle>Add Root Concept</DialogTitle>
        </DialogHeader>

        <form @submit.prevent="handleNewParent" class="space-y-4">
          <div class="space-y-2">
            <Label for="parent-title">Title</Label>
            <Input
              id="parent-title"
              v-model="newParentForm.title"
              :class="{ 'border-destructive': newParentForm.errors.title }"
            />
            <p v-if="newParentForm.errors.title" class="text-sm text-destructive">
              {{ newParentForm.errors.title }}
            </p>
          </div>

          <div class="flex items-center space-x-2">
            <Checkbox v-model="newParentForm.isTerminal" id="parent-terminal" />
            <Label for="parent-terminal">Is Terminal Concept</Label>
          </div>

          <Button type="submit" :disabled="newParentForm.processing">
            {{ newParentForm.processing ? 'Creating...' : 'Create Concept' }}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>
