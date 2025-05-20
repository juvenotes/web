<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import { computed, ref } from 'vue'
import type ConceptDto from '#dtos/concept'
import type PastPaperDto from '#dtos/past_paper'
import AdminLayout from '~/layouts/AdminLayout.vue'
import { FileText, Plus } from 'lucide-vue-next'
import { StudyLevel } from '#enums/study_level'

defineOptions({ layout: AdminLayout })

interface Props {
  concept: ConceptDto
  papers: PastPaperDto[]
}

const props = defineProps<Props>()
const isCreateDialogOpen = ref(false)

const selectedStudyLevel = ref<StudyLevel | null>(null)

const filteredPapers = computed(() => {
  if (!selectedStudyLevel.value) return props.papers
  return props.papers.filter((p) => p.studyLevel === selectedStudyLevel.value)
})

const breadcrumbItems = computed(() => [
  { label: 'Papers', href: '/manage/papers' },
  { label: props.concept.title },
])
</script>

<template>
  <AppHead :title="`${concept.title} Papers`" :description="`Past papers for ${concept.title}`" />

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
    <!-- Header -->
    <div class="relative p-6 sm:p-8 bg-white/50 rounded-2xl border shadow-sm">
      <div
        class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-primary/50 to-transparent"
      />

      <BreadcrumbTrail :items="breadcrumbItems" />

      <div class="mt-4 flex flex-col sm:flex-row gap-4">
        <!-- Title section -->
        <div class="flex items-start gap-4 flex-1">
          <div class="p-3 rounded-xl bg-primary/5 border border-primary/10 shrink-0">
            <FileText class="h-6 w-6 text-primary" />
          </div>
          <div class="space-y-1">
            <h1 class="text-2xl font-bold text-foreground">{{ concept.title }}</h1>
            <p class="text-sm text-muted-foreground">Manage Past Papers</p>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="flex flex-col sm:flex-row items-stretch gap-2 sm:gap-4">
          <ToggleUrl />
          <Button
            @click="isCreateDialogOpen = true"
            class="flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Plus class="h-4 w-4" />
            Add Paper
          </Button>
        </div>
      </div>
    </div>

    <div class="flex justify-end mb-4">
      <ToggleStudyLevel v-model="selectedStudyLevel" :papers="papers" />
    </div>

    <!-- Papers List -->
    <div v-if="filteredPapers.length" class="space-y-4">
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          v-for="paper in filteredPapers"
          :key="paper.id"
          :href="`/manage/papers/${concept.slug}/${paper.slug}`"
          class="group relative overflow-hidden rounded-2xl bg-white p-6 border border-slate-100 hover:border-primary/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
        >
          <div class="relative space-y-3">
            <h3
              class="text-lg font-bold text-foreground group-hover:text-primary transition-colors"
            >
              {{ paper.title }}
            </h3>
            <div class="flex items-center gap-3 text-sm">
              <span class="px-2 py-1 rounded-md bg-primary/10 text-primary font-medium">
                {{ paper.examType.toUpperCase() }}
              </span>
              <span class="text-muted-foreground">
                {{ paper.questions?.length ?? 0 }} questions
              </span>
              <span class="text-muted-foreground">{{ paper.year }}</span>
            </div>
          </div>
        </Link>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center p-8 bg-white rounded-2xl border border-slate-100">
      <p class="text-muted-foreground">No papers added yet. Click "Add Paper" to create one.</p>
    </div>

    <!-- Create Paper Dialog -->
    <CreatePaperDialog v-model:open="isCreateDialogOpen" :concept="concept" />
  </div>
</template>
