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
  <AppHead title="All available concepts" description="All available concepts in Juvenotes" />
  <div class="container mx-auto px-4 py-6">
    <!-- Header Section with subtle gradient background -->
    <div class="relative mb-10 p-8 rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-transparent">
      <h1 class="text-3xl font-bold text-primary/90">Medical Concepts</h1>
      <p class="mt-2 text-muted-foreground/90 max-w-2xl">
        Explore our comprehensive collection of medical concepts organized by topics
      </p>
    </div>

    <!-- Concepts Grid with improved card design -->
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Link 
        v-for="concept in concepts" 
        :key="concept.id"
        :href="`/concepts/${concept.slug}`"
        class="group relative overflow-hidden rounded-xl bg-card p-6 border border-border/40 
               hover:border-primary/20 hover:shadow-lg hover:-translate-y-1 
               transition-all duration-300"
      >
        <!-- Gradient overlay on hover -->
        <div class="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
        />

        <!-- Content -->
        <div class="relative space-y-3">
          <h2 class="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
            {{ concept.title }}
          </h2>
          
          <div class="flex items-center gap-2">
            <span 
              v-if="concept.isTerminal" 
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                     bg-green-50 text-green-700 border border-green-100"
            >
              Terminal Node
            </span>
            <span 
              v-else 
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                     bg-primary/10 text-primary border border-primary/20"
            >
              Parent Node
            </span>
          </div>

          <!-- Hover indicator -->
          <div class="flex items-center text-sm text-primary font-medium opacity-0 
                      group-hover:opacity-100 transition-opacity">
            <span>Explore concept</span>
            <svg 
              class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" 
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
  </div>
</template>