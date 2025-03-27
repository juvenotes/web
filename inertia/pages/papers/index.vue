<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import type ConceptDto from '#dtos/concept'
import DashLayout from '~/layouts/DashLayout.vue'
import { FileText, Settings } from 'lucide-vue-next'
import { ref, computed } from 'vue'
import { TrainingLevel } from '#enums/training_level'

defineOptions({ layout: DashLayout })

interface Props {
  concepts: ConceptDto[]
  canManage: boolean
}

const props = defineProps<Props>()

const selectedLevel = ref<TrainingLevel | null>(null)

const filteredConcepts = computed(() => {
  if (!selectedLevel.value) return props.concepts
  return props.concepts.filter((c) => c.trainingLevel === selectedLevel.value)
})
</script>

<template>
  <AppHead title="Past Papers" description="Access past examination papers" />
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
    <!-- Header Section -->
    <div class="relative p-6 sm:p-8 bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <!-- Gradient Top Border -->
      <div
        class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#55A9C4] via-[#55A9C4]/50 to-transparent"
      />

      <BreadcrumbTrail :items="[{ label: 'Papers' }]" />

      <div class="mt-6 flex flex-col sm:flex-row sm:items-start gap-6">
        <!-- Icon and Title -->
        <div class="flex items-start gap-4 flex-1">
          <div class="p-3 rounded-xl bg-[#55A9C4]/10 border border-[#55A9C4]/20 hover:bg-[#55A9C4]/20 transition-colors duration-200">
            <FileText class="h-5 w-5 text-[#55A9C4]" />
          </div>
          <div class="space-y-1">
            <h1 class="text-xl sm:text-2xl font-semibold text-gray-900">Past Papers</h1>
            <p class="text-sm text-gray-500 max-w-2xl">
              Access and practice with previous examination papers organized by subjects.
            </p>
          </div>
        </div>

        <!-- Manage Button -->
        <div class="w-full sm:w-auto mt-4 sm:mt-0">
          <Link
            v-if="canManage"
            href="/manage/papers"
            class="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#55A9C4] hover:bg-[#55A9C4]/90 transition-colors text-white border border-[#55A9C4] text-sm font-medium hover:shadow-md transition-all duration-200 group"
          >
            <!-- Spinning Settings Icon -->
            <Settings class="h-4 w-4 transition-transform duration-500 group-hover:rotate-180" />
            <span>Edit</span>
          </Link>
        </div>
      </div>
    </div>

    <!-- Filter Section -->
    <div class="flex justify-end px-4 sm:px-0">
      <ToggleTrainingLevel v-model="selectedLevel" />
    </div>

    <!-- Papers Grid -->
    <div class="grid gap-6 sm:gap-8 lg:gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <Link
        v-for="concept in filteredConcepts"
        :key="concept.id"
        :href="`/papers/${concept.slug}`"
        class="group relative overflow-hidden rounded-2xl bg-white p-6 border border-gray-100 hover:border-[#55A9C4]/20 hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-2"
      >
        <!-- Gradient Overlay on Hover -->
        <div
          class="absolute inset-0 bg-gradient-to-br from-[#55A9C4]/10 via-[#55A9C4]/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out"
        />
        <div
    class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#55A9C4] via-[#55A9C4]/50 to-transparent"
  />

        <div class="relative space-y-4">
          <!-- Concept Title -->
          <h2
            class="text-lg font-semibold text-gray-900 group-hover:text-[#55A9C4] transition-colors duration-300 ease-in-out"
          >
            {{ concept.title }}
          </h2>

          <!-- Papers Count -->
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            <span class="px-2 py-1 rounded-md bg-[#55A9C4]/10 text-[#55A9C4] font-medium">
              {{ concept.pastPapers?.length ?? 0 }}
              {{ (concept.pastPapers?.length ?? 0) === 1 ? 'paper' : 'papers' }}
            </span>
          </div>

          <!-- View Papers Link -->
          <div
            class="flex items-center text-sm text-[#55A9C4] font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out"
          >
            <span>View papers</span>
            <svg
              class="w-4 h-4 ml-2 transform group-hover:translate-x-2 transition-transform duration-300 ease-in-out"
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

<style>
/* Import Inter font */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

/* Apply Inter font to the entire page */
body {
  font-family: 'Inter', sans-serif;
}

/* Enhance Typography */
h1, h2, h3 {
  font-weight: 600;
}

p {
  font-weight: 400;
  color: #4b5563; /* Gray-600 */
}

/* Smooth Transitions */
a, button, .transition-all {
  transition: all 0.3s ease;
}

/* Hover Effects */
.group:hover .group-hover\:text-\[\#55A9C4\] {
  color: #55A9C4;
}

.group:hover .group-hover\:opacity-100 {
  opacity: 1;
}

.group:hover .group-hover\:translate-x-1 {
  transform: translateX(0.25rem);
}
</style>