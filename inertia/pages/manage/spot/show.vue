<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import type ConceptDto from '#dtos/concept'
import type PastPaperDto from '#dtos/past_paper'
import AdminLayout from '~/layouts/AdminLayout.vue'
import { FileText, Plus } from 'lucide-vue-next'
import { computed, ref } from 'vue'

defineOptions({ layout: AdminLayout })

interface Props {
  concept: ConceptDto
  papers: PastPaperDto[]
}

const props = defineProps<Props>()
const isCreateDialogOpen = ref(false)

const breadcrumbItems = computed(() => [
  { label: 'SPOT Management', href: '/manage/spot' },
  { label: props.concept.title },
])
</script>

<template>
  <AppHead :title="`${concept.title} SPOTs`" :description="`SPOT papers for ${concept.title}`" />

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
    <!-- Header -->
    <div class="relative p-6 sm:p-8 bg-white/50 dark:bg-card rounded-2xl border shadow-sm dark:border-border">
      <div
        class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-primary/50 to-transparent"
      />

      <BreadcrumbTrail :items="breadcrumbItems" />

      <div class="mt-4 flex flex-col sm:flex-row gap-4 sm:items-start justify-between">
        <div class="flex items-start gap-4 mt-4">
          <div class="p-3 rounded-xl bg-primary/5 border border-primary/10">
            <FileText class="h-6 w-6 text-primary" />
          </div>

          <div class="space-y-2">
            <h1 class="text-2xl font-bold text-foreground">{{ concept.title }}</h1>
            <p class="text-base text-muted-foreground/90 max-w-2xl">
              Manage SPOT papers for this subject
            </p>
          </div>
        </div>
        <div class="flex flex-col sm:flex-row items-stretch gap-2 sm:gap-4">
          <ToggleUrl />
          <Button
            @click="isCreateDialogOpen = true"
            class="flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Plus class="h-4 w-4" />
            Add SPOT Paper
          </Button>
        </div>
      </div>
    </div>

    <!-- Papers List -->
    <div v-if="papers.length" class="space-y-4">
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          v-for="paper in papers"
          :key="paper.id"
          :href="`/manage/spot/${concept.slug}/${paper.slug}`"
          class="group relative overflow-hidden rounded-2xl bg-white p-6 border border-slate-100 hover:border-primary/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
        >
          <div
            class="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none"
          />
          <div class="relative space-y-3">
            <h3
              class="text-lg font-bold bg-gradient-to-r from-primary/90 to-primary/70 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary transition-all duration-300"
            >
              {{ paper.title || `${concept.title} SPOT paper from ${paper.year}` }}
            </h3>
            <div class="flex items-center gap-2 text-sm text-muted-foreground">
              <span class="px-2 py-1 rounded-md bg-primary/10 text-primary font-medium">
                SPOT
              </span>
              <span class="text-muted-foreground">{{ paper.year }}</span>
            </div>
            <div
              class="flex items-center text-sm text-primary font-medium transform translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300"
            >
              <span>Manage SPOT</span>
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

    <!-- Empty State -->
    <div v-else class="text-center p-8 bg-white rounded-2xl border">
      <p class="text-muted-foreground">No SPOT papers added yet. Click "Add SPOT" to create one.</p>
    </div>
    <CreateSpotPaperDialog v-model:open="isCreateDialogOpen" :concept="concept" />
  </div>
</template>
