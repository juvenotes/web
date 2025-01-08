<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import type ConceptDto from '#dtos/concept'
import AppLayout from '~/layouts/AppLayout.vue'

defineOptions({ layout: AppLayout })

interface Props {
  concepts: ConceptDto[]
}

defineProps<Props>()
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Medical Concepts</h1>
    </div>

    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Link 
        v-for="concept in concepts" 
        :key="concept.id"
        :href="`/concepts/${concept.slug}`"
        class="p-4 rounded-lg border border-border hover:border-primary transition-colors"
      >
        <h2 class="text-lg font-semibold mb-2">{{ concept.title }}</h2>
        <div class="flex items-center text-sm text-muted-foreground">
          <span v-if="concept.isTerminal" class="text-green-500">Terminal Node</span>
          <!-- <span v-else>Parent Node</span> -->
        </div>
      </Link>
    </div>
  </div>
</template>