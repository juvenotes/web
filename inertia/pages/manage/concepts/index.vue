<script setup lang="ts">
import { Link, useForm } from '@inertiajs/vue3'
import type ConceptDto from '#dtos/concept'
import AdminLayout from '~/layouts/AdminLayout.vue'
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import { Plus } from 'lucide-vue-next'

defineOptions({ layout: AdminLayout })

interface Props {
  concepts: ConceptDto[]
}

defineProps<Props>()

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
  <div class="container mx-auto px-4 py-8">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <h1 class="text-2xl font-bold">Concepts In MBHCB</h1>
      <Button variant="outline" @click="showNewParentDialog = true" class="w-full sm:w-auto">
        <Plus class="h-4 w-4 mr-2" />
        Add Root Concept
      </Button>
      <ToggleUrl />
    </div>

    <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      <Link
        v-for="concept in concepts"
        :key="concept.id"
        :href="`/manage/concepts/${concept.slug}`"
        class="p-4 rounded-lg border border-border hover:border-primary transition-colors"
      >
        <h2 class="text-lg font-semibold mb-2">{{ concept.title }}</h2>
        <div class="flex items-center text-sm text-muted-foreground"></div>
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
