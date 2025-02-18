<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import type ConceptDto from '#dtos/concept'
import DashLayout from '~/layouts/DashLayout.vue'
import { BookOpen, Settings } from 'lucide-vue-next'
import { TrainingLevel } from '#enums/training_level'
import { ref, computed } from 'vue'

defineOptions({ layout: DashLayout })

const selectedLevel = ref<TrainingLevel | null>(null)

const filteredConcepts = computed(() => {
  if (!selectedLevel.value) return props.concepts
  return props.concepts.filter((c) => c.trainingLevel === selectedLevel.value)
})

interface Props {
  concepts: ConceptDto[]
  canManage: boolean
}

const props = defineProps<Props>()

const breadcrumbItems = [{ label: 'Concepts' }]
</script>

<template>
  <AppHead title="All available concepts" description="All available concepts in Juvenotes" />
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
    <!-- Header Section -->
    <div class="relative p-6 sm:p-8 bg-white/50 rounded-2xl border shadow-sm">
      <div
        class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-primary/50 to-transparent"
      />

      <BreadcrumbTrail :items="breadcrumbItems" />

      <div class="mt-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <div class="flex items-start gap-4 flex-1">
          <div class="p-3 rounded-xl bg-primary/5 border border-primary/10">
            <BookOpen class="h-6 w-6 text-primary" />
          </div>

          <div class="space-y-2">
            <h1 class="text-2xl font-bold text-foreground">Medical Concepts</h1>
            <p class="text-base text-muted-foreground/90 max-w-2xl">
              Explore our comprehensive collection of medical concepts organized by topics
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <Link
            v-if="canManage"
            href="/manage/concepts"
            class="flex items-center justify-center gap-2 px-4 py-2 rounded-lg hover:bg-primary/5 transition-colors text-primary border border-primary/10 w-full sm:w-auto"
          >
            <Settings class="h-4 w-4" />
            <span class="text-sm font-medium">Edit</span>
          </Link>
        </div>
      </div>
    </div>

        <!-- Filter Section -->
        <div class="flex justify-end">
      <ToggleTrainingLevel v-model="selectedLevel" />
    </div>

    <!-- Concepts Grid -->
    <div class="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Link
        v-for="concept in filteredConcepts"
        :key="concept.id"
        :href="`/concepts/${concept.slug}`"
        class="group relative overflow-hidden rounded-xl bg-white/90 p-5 border border-white/20 hover:border-primary/20 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 outline outline-1 outline-[#d3d3d3a1]"
      >
        <div
          class="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"
        />

        <div class="relative space-y-3">
          <h2
            class="text-lg font-semibold bg-gradient-to-r from-primary/90 to-primary/70 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary transition-all duration-300"
          >
            {{ concept.title }}
          </h2>

          <div
            class="flex items-center text-sm text-primary font-medium transform translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300"
          >
            <span>Explore concept</span>
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
  </div>
</template>
