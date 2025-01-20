<!-- inertia/pages/manage/papers/index.vue -->
<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import type ConceptDto from '#dtos/concept'
import AdminLayout from '~/layouts/AdminLayout.vue'
import { FileText, Plus, ArrowLeft } from 'lucide-vue-next'

defineOptions({ layout: AdminLayout })

interface Props {
  concepts: ConceptDto[]
}

defineProps<Props>()

function goBack() {
  window.history.back()
}
</script>

<template>
  <AppHead title="Manage Past Papers" description="Manage examination papers" />
  
  <div class="container mx-auto px-4 py-6">
    <nav class="flex items-center gap-2 mb-6">
      <button @click="goBack" 
              class="flex items-center gap-2 text-muted-foreground hover:text-primary">
        <ArrowLeft class="h-4 w-4" />
        <span>Back</span>
      </button>
    </nav>

    <div class="space-y-8">
      <div v-for="concept in concepts" :key="concept.id" class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">{{ concept.title }}</h2>
          <Link 
            :href="`/manage/papers/create/${concept.slug}`"
            class="flex items-center gap-2 text-sm px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            <Plus class="h-4 w-4" />
            Add Paper
          </Link>
        </div>

        <div v-if="concept.pastPapers?.length" 
             class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            v-for="paper in concept.pastPapers"
            :key="paper.id"
            :href="`/manage/papers/${paper.slug}`"
            class="p-4 rounded-lg border hover:border-primary transition-all"
          >
            <div class="flex items-start gap-3">
              <FileText class="h-5 w-5 text-primary" />
              <div>
                <h3 class="font-medium">{{ paper.title }}</h3>
                <p class="text-sm text-muted-foreground">{{ paper.year }}</p>
              </div>
            </div>
          </Link>
        </div>
        <p v-else class="text-sm text-muted-foreground">No papers added yet</p>
      </div>
    </div>
  </div>
</template>