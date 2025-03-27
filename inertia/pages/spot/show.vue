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

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
    <!-- Header Section -->
    <div class="relative p-6 sm:p-8 bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#55A9C4] via-[#55A9C4]/50 to-transparent" />

      <BreadcrumbTrail :items="breadcrumbItems" />

      <div class="mt-6 flex flex-col sm:flex-row sm:items-start gap-6">
        <!-- Icon and Title -->
        <div class="flex items-start gap-4 flex-1">
          <div class="p-3 rounded-xl bg-[#55A9C4]/10 border border-[#55A9C4]/20 hover:bg-[#55A9C4]/20 transition-colors duration-200">
            <FileText class="h-5 w-5 text-[#55A9C4]" />
          </div>
          <div class="space-y-1 min-w-0">
            <h1 class="text-xl sm:text-2xl font-semibold text-gray-900 truncate">
              {{ concept.title }}
            </h1>
            <p class="text-sm text-gray-500">
              SPOT Practice Papers
            </p>
          </div>
        </div>

        <!-- Manage Button -->
        <div class="w-full sm:w-auto mt-4 sm:mt-0">
          <Link
            v-if="canManage"
            :href="`/manage/spot/${concept.slug}`"
            class="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#55A9C4] hover:bg-[#55A9C4]/90 transition-colors text-white border border-[#55A9C4] text-sm font-medium hover:shadow-md transition-all duration-200 group"
          >
            <Settings class="h-4 w-4 transition-transform duration-500 group-hover:rotate-180" />
            <span>Edit</span>
          </Link>
        </div>
      </div>
    </div>

    <!-- Papers by Year -->
    <template v-if="hasPapers">
      <div v-for="(yearPapers, year) in papersByYear" :key="year" class="space-y-6">
        <div class="flex items-center gap-3 text-lg font-semibold text-gray-900">
          <Calendar class="h-5 w-5 text-[#55A9C4]" />
          <h2>{{ year }}</h2>
        </div>

        <div class="grid gap-6 sm:gap-8 lg:gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <Link
            v-for="paper in yearPapers"
            :key="paper.id"
            :href="`/spot/${concept.slug}/${paper.slug}`"
            class="group relative overflow-hidden rounded-2xl bg-white p-6 border border-gray-100 hover:border-[#55A9C4]/20 hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-2"
          >
            <div class="absolute inset-0 bg-gradient-to-br from-[#55A9C4]/10 via-[#55A9C4]/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out" />

            <div class="relative space-y-4">
              <h3 class="text-lg font-semibold text-gray-900 group-hover:text-[#55A9C4] transition-colors duration-300">
                {{ paper.title }}
              </h3>

              <div class="flex items-center gap-3 text-sm">
                <span class="px-2 py-1 rounded-md bg-[#55A9C4]/10 text-[#55A9C4] font-medium">
                  SPOT
                </span>
                <span class="text-gray-500">Multiple stations</span>
              </div>
              <div class="flex items-center text-sm text-[#55A9C4] font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out">
                <span>Practice SPOT</span>
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

    <!-- Empty State -->
    <div v-else class="relative p-8 bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div class="flex items-start gap-4">
        <div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors duration-200">
          <AlertCircle class="h-5 w-5 text-amber-500" />
        </div>
        <div class="space-y-2">
          <h2 class="text-lg font-semibold text-gray-900">No SPOT Papers Available Yet</h2>
          <p class="text-sm text-gray-500 max-w-2xl">
            We're currently adding SPOT papers for {{ concept.title }}. Please check back later.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>