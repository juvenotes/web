<script setup lang="ts">
import type ConceptDto from '#dtos/concept'
import AdminLayout from '~/layouts/AdminLayout.vue'
import { Pin } from 'lucide-vue-next'
import { PaperType } from '#enums/exam_type'
import ToggleUrl from '~/components/ToggleUrl.vue'

defineOptions({ layout: AdminLayout })

defineProps<{
  concepts: ConceptDto[]
}>()
</script>

<template>
  <AppHead title="SPOT Management" description="Manage SPOT papers" />

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
    <!-- Header -->
    <div class="relative p-6 sm:p-8 bg-white/50 dark:bg-card rounded-2xl border shadow-sm dark:border-border">
      <div
        class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-primary/50 to-transparent"
      ></div>

      <div class="mt-4 flex flex-col sm:flex-row gap-4 sm:items-start justify-between">
        <div class="flex items-start gap-4 mt-4">
          <div class="p-3 rounded-xl bg-primary/5 border border-primary/10">
            <Pin class="h-6 w-6 text-primary" />
          </div>

          <div class="space-y-2">
            <h1 class="text-2xl font-bold text-foreground">SPOT Papers</h1>
            <p class="text-base text-muted-foreground/90 max-w-2xl">
              Manage SPOT examination papers organized by subjects
            </p>
          </div>
        </div>
        <ToggleUrl />
      </div>
    </div>

    <!-- SPOT Grid -->
    <div class="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Link
        v-for="concept in concepts"
        :key="concept.id"
        :href="`/manage/spot/${concept.slug}`"
        class="group relative overflow-hidden rounded-xl bg-white/90 dark:bg-card p-5 border border-white/20 dark:border-border hover:border-primary/20 dark:hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
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

          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            <span class="px-2 py-1 rounded-md bg-primary/10 text-primary font-medium">
              {{ concept.pastPapers?.filter((p) => p.paperType === PaperType.SPOT).length ?? 0 }}
              {{
                (concept.pastPapers?.filter((p) => p.paperType === PaperType.SPOT).length ?? 0) ===
                1
                  ? 'paper'
                  : 'papers'
              }}
            </span>
          </div>

          <div
            class="flex items-center text-sm text-primary font-medium transform translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300"
          >
            <span>Manage SPOTs</span>
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
