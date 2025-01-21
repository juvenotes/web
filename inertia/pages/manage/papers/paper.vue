<script setup lang="ts">
import type ConceptDto from '#dtos/concept'
import type PastPaperDto from '#dtos/past_paper'
import AdminLayout from '~/layouts/AdminLayout.vue'
import { FileText, ArrowLeft, Plus } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'

defineOptions({ layout: AdminLayout })

interface Props {
  paper: PastPaperDto
  concept: ConceptDto
}

defineProps<Props>()

function goBack() {
  window.history.back()
}
</script>

<template>
  <AppHead :title="paper.title" :description="`Manage ${paper.title}`" />
  
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
    <!-- Header -->
    <div class="relative p-6 sm:p-8 bg-white/50 rounded-2xl border shadow-sm">
      <div class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-primary/50 to-transparent" />

      <button @click="goBack" class="flex items-center gap-2 text-primary hover:text-primary/70">
        <ArrowLeft class="h-5 w-5" />
        <span class="text-sm font-medium">Back to Papers</span>
      </button>

      <div class="flex items-start justify-between mt-4">
        <div class="flex items-start gap-4">
          <div class="p-3 rounded-xl bg-primary/5 border border-primary/10">
            <FileText class="h-6 w-6 text-primary" />
          </div>
          <div class="space-y-1">
            <h1 class="text-2xl font-bold text-foreground">{{ paper.title }}</h1>
            <div class="flex items-center gap-3">
              <span class="text-sm text-muted-foreground">{{ concept.title }}</span>
              <span class="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                {{ paper.examType }}
              </span>
              <span class="text-sm text-muted-foreground">{{ paper.year }}</span>
            </div>
          </div>
        </div>

        <Button class="flex items-center gap-2">
          <Plus class="h-4 w-4" />
          Add Question
        </Button>
      </div>
    </div>

    <!-- Questions Section (Empty State) -->
    <div class="p-6 sm:p-8 bg-white/50 rounded-2xl border shadow-sm text-center">
      <p class="text-muted-foreground">
        No questions added yet. Click "Add Question" to start building your paper.
      </p>
    </div>
  </div>
</template>