<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import { computed } from 'vue'
import type ConceptDto from '#dtos/concept'
import type PastPaperDto from '#dtos/past_paper'
import DashLayout from '~/layouts/DashLayout.vue'
import { FileText, Calendar, AlertCircle, Settings } from 'lucide-vue-next'
import { PaperType } from '#enums/exam_type'

defineOptions({ layout: DashLayout })

interface Props {
  concept: ConceptDto
  papers: PastPaperDto[]
  canManage: boolean
}

const props = defineProps<Props>()

const spotPapers = computed(() =>
  props.papers.filter((paper) => paper.paperType === PaperType.SPOT)
)
const hasPapers = computed(() => spotPapers.value.length > 0)

const papersByYear = computed(() => {
  return spotPapers.value.reduce(
    (acc, paper) => {
      const year = paper.year
      if (!acc[year]) acc[year] = []
      acc[year].push(paper)
      return acc
    },
    {} as Record<string, PastPaperDto[]>
  )
})

const breadcrumbItems = computed(() => [
  { label: 'SPOT Papers', href: '/spot' },
  { label: props.concept.title },
])
</script>

<template>
  <AppHead :title="`${concept.title} SPOT Papers`" :description="`SPOT papers for ${concept.title}`" />

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
    <!-- Header -->
    <div class="relative p-6 sm:p-8 bg-white/50 rounded-2xl border shadow-sm">
      <div
        class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-primary/50 to-transparent"
      />

      <BreadcrumbTrail :items="breadcrumbItems" />

      <div class="mt-4 flex flex-col sm:flex-row gap-4 sm:items-start justify-between">
        <div class="flex items-start gap-4">
          <div class="p-3 rounded-xl bg-primary/5 border border-primary/10 shrink-0">
            <FileText class="h-6 w-6 text-primary" />
          </div>
          <div class="min-w-0 flex-1">
            <h1 class="text-xl sm:text-2xl font-bold text-foreground truncate">
              {{ concept.title }}
            </h1>
            <p class="text-sm text-muted-foreground">SPOT Practice Papers</p>
          </div>
        </div>

        <!-- Manage button -->
        <Link
          v-if="canManage"
          :href="`/manage/spot/${concept.slug}`"
          class="flex items-center justify-center gap-2 px-4 py-2 rounded-lg hover:bg-primary/5 transition-colors text-primary border border-primary/10 w-full sm:w-auto"
        >
          <Settings class="h-4 w-4" />
          <span class="text-sm font-medium">Edit</span>
        </Link>
      </div>
    </div>

    <!-- Papers by Year -->
    <template v-if="hasPapers">
      <div v-for="(yearPapers, year) in papersByYear" :key="year" class="space-y-4">
        <div class="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Calendar class="h-5 w-5" />
          <h2>{{ year }}</h2>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            v-for="paper in yearPapers"
            :key="paper.id"
            :href="`/spot/${concept.slug}/${paper.slug}`"
            class="group relative overflow-hidden rounded-xl bg-white p-5 border hover:border-primary/20 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
          >
            <div
              class="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
            />

            <div class="relative space-y-3">
              <h3 class="text-lg font-semibold text-foreground">{{ paper.title }}</h3>

              <div class="flex items-center gap-3 text-sm">
                <span class="px-2 py-1 rounded-md bg-primary/10 text-primary font-medium">
                  SPOT
                </span>
                <span class="text-muted-foreground">Multiple stations</span>
              </div>
              <div
                class="flex items-center text-sm text-primary font-medium transform translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300"
              >
                <span>Practice SPOT</span>
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
    <div v-else class="relative p-8 bg-white/50 rounded-2xl border shadow-sm">
      <div class="flex items-start gap-4">
        <div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <AlertCircle class="h-6 w-6 text-amber-500" />
        </div>
        <div class="space-y-2">
          <h2 class="text-lg font-semibold text-foreground">No SPOT Papers Available Yet</h2>
          <p class="text-base text-muted-foreground/90 max-w-2xl">
            We're currently adding SPOT papers for {{ concept.title }}. Please check back later.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>