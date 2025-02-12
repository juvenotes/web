<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import type ConceptDto from '#dtos/concept'
import DashLayout from '~/layouts/DashLayout.vue'
import { ArrowLeft, FileText } from 'lucide-vue-next'

defineOptions({ layout: DashLayout })

interface Props {
  concept: ConceptDto
}

defineProps<Props>()

function goBack() {
  window.history.back()
}
</script>

<template>
  <AppHead :title="`${concept.title} OSCEs`" :description="`OSCE papers for ${concept.title}`" />
  
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <button
        @click="goBack"
        class="flex items-center gap-2 text-primary hover:text-primary/70 transition-colors"
      >
        <ArrowLeft class="h-5 w-5" />
        <span class="text-sm font-medium">Back to OSCEs</span>
      </button>
    </div>

    <!-- Title Section -->
    <div class="space-y-4">
      <h1 class="text-3xl font-bold">{{ concept.title }} OSCEs</h1>
      <p class="text-lg text-muted-foreground">
        Practice OSCE papers from previous years
      </p>
    </div>

    <!-- Papers Grid -->
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <template v-for="paper in concept.pastPapers" :key="paper.id">
        <Link
          :href="`/papers/${paper.id}`"
          class="group relative p-4 rounded-lg border bg-card hover:shadow-md transition-all"
        >
          <div class="flex items-start justify-between">
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <FileText class="h-5 w-5 text-primary" />
                <span class="font-medium">{{ paper.year }} OSCE</span>
              </div>
              <p class="text-sm text-muted-foreground">
                {{`${concept.title} OSCE paper from ${paper.year}` }}
              </p>
            </div>
          </div>
        </Link>
      </template>
    </div>
  </div>
</template>
