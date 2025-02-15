<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import type ConceptDto from '#dtos/concept'
import type PastPaperDto from '#dtos/past_paper'
import AdminLayout from '~/layouts/AdminLayout.vue'
import { ArrowLeft, FileText, Plus } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import CreateOscePaperDialog from '~/components/CreateOscePaperDialog.vue'
import { ref } from 'vue'

defineOptions({ layout: AdminLayout })

interface Props {
  concept: ConceptDto
  papers: PastPaperDto[]
}
defineProps<Props>()
const isCreateDialogOpen = ref(false)

function goBack() {
  window.history.back()
}
</script>

<template>
  <AppHead
    :title="`Manage ${concept.title} OSCEs`"
    :description="`Manage OSCE papers for ${concept.title}`"
  />

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
    <!-- Header -->
    <div class="relative p-6 sm:p-8 bg-white/50 rounded-2xl border shadow-sm">
      <div
        class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-primary/50 to-transparent"
      />

      <button @click="goBack" class="flex items-center gap-2 text-primary hover:text-primary/70">
        <ArrowLeft class="h-5 w-5" />
        <span class="text-sm font-medium">Back to OSCEs</span>
      </button>

      <div class="flex items-start justify-between mt-4">
        <div class="flex items-start gap-4">
          <div class="p-3 rounded-xl bg-primary/5 border border-primary/10">
            <FileText class="h-6 w-6 text-primary" />
          </div>
          <div class="space-y-1">
            <h1 class="text-2xl font-bold text-foreground">{{ concept.title }}</h1>
            <p class="text-sm text-muted-foreground">Manage OSCE Papers</p>
          </div>
        </div>
        <ToggleUrl />
        <Button @click="isCreateDialogOpen = true" class="flex items-center gap-2">
          <Plus class="h-4 w-4" />
          Add OSCE Paper
        </Button>
      </div>
    </div>

    <!-- Papers List -->
    <div v-if="papers.length" class="space-y-4">
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          v-for="paper in papers"
          :key="paper.id"
          :href="`/manage/osce/${concept.slug}/${paper.slug}`"
          class="group relative overflow-hidden rounded-xl bg-white p-5 border hover:border-primary/20 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
        >
          <div class="relative space-y-3">
            <h3 class="text-lg font-semibold text-foreground">
              {{ paper.title || `${concept.title} OSCE paper from ${paper.year}` }}
            </h3>
            <div class="flex items-center gap-3 text-sm">
              <span class="px-2 py-1 rounded-md bg-primary/10 text-primary font-medium">
                OSCE
              </span>
              <span class="text-muted-foreground">{{ paper.year }}</span>
            </div>
          </div>
        </Link>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center p-8 bg-white rounded-xl border">
      <p class="text-muted-foreground">No OSCE papers added yet. Click "Add OSCE" to create one.</p>
    </div>
    <CreateOscePaperDialog v-model:open="isCreateDialogOpen" :concept="concept" />
  </div>
</template>
