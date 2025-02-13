<script setup lang="ts">
import type ConceptDto from '#dtos/concept'
import type PastPaperDto from '#dtos/past_paper'
import type QuestionDto from '#dtos/question'
import DashLayout from '~/layouts/DashLayout.vue'
import { FileText, ArrowLeft, Clock } from 'lucide-vue-next'
import { computed } from 'vue'

defineOptions({ layout: DashLayout })

interface Props {
  paper: PastPaperDto
  concept: ConceptDto
  questions: QuestionDto[]
}

const props = defineProps<Props>()

const lastEditDate = computed(() => {
  return new Date(
    props.paper.metadata?.lastEditedBy?.timestamp ?? props.paper.createdAt
  ).toLocaleDateString()
})

function goBack() {
  window.history.back()
}
</script>

<template>
  <AppHead :title="paper.title" :description="`Practice ${paper.title}`" />

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
    <!-- Header Section -->
    <div class="relative p-6 sm:p-8 bg-white/50 rounded-2xl border shadow-sm">
      <div
        class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-primary/50 to-transparent"
      />

      <!-- Navigation -->
      <nav class="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground">
        <button
          @click="goBack"
          class="flex items-center gap-2 text-primary hover:text-primary/70 transition-colors"
        >
          <ArrowLeft class="h-5 w-5" />
          <span class="text-sm font-medium">Back to OSCEs</span>
        </button>
      </nav>

      <div class="flex items-start gap-4 mt-4">
        <div class="p-3 rounded-xl bg-primary/5 border border-primary/10">
          <FileText class="h-6 w-6 text-primary" />
        </div>
        <div class="space-y-1">
          <h1 class="text-2xl font-bold text-foreground">{{ paper.title }}</h1>
          <div class="flex flex-wrap items-center gap-2 sm:gap-3 text-sm text-muted-foreground">
            <span class="truncate max-w-[150px] sm:max-w-none">{{ concept.title }}</span>
            <span class="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
              OSCE
            </span>
            <span>{{ paper.year }}</span>
          </div>
          <div class="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock class="h-3 w-3" />
            <span>Last edited {{ lastEditDate }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Questions List -->
    <div class="space-y-4">
      <template v-if="questions.length">
        <div
          v-for="(question, index) in questions"
          :key="question.id"
          class="p-6 bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow"
        >
          <div class="space-y-4">
            <!-- Question Header -->
            <div class="flex gap-3">
              <span
                class="shrink-0 px-2 py-1 bg-primary/10 text-primary rounded text-sm font-medium"
              >
                Q{{ index + 1 }}
              </span>
              <p class="text-base text-foreground">{{ question.questionText }}</p>
            </div>

            <!-- Question Image if present -->
            <div v-if="question.questionImagePath" class="flex justify-center">
              <img
                :src="question.questionImagePath"
                :alt="`Question ${index + 1} image`"
                class="max-w-full h-auto rounded-lg border shadow-sm max-h-[400px] object-contain"
              />
            </div>

            <!-- OSCE Parts -->
            <div class="pl-10 space-y-4">
              <div
                v-for="(part, partIndex) in question.stations"
                :key="part.id"
                class="relative pl-4 border-l-2 border-primary/20 py-3"
              >
                <!-- Part Text -->
                <div class="flex justify-between items-start">
                  <div class="space-y-2">
                    <div class="flex items-center gap-2">
                      <span class="font-medium text-base">Part {{ partIndex + 1 }}</span>
                      <span
                        class="text-sm px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium"
                      >
                        {{ part.marks }} marks
                      </span>
                    </div>
                    <p class="text-base">{{ part.partText }}</p>
                  </div>
                </div>

                <!-- Expected Answer -->
                <div class="mt-3 bg-muted/50 rounded-lg p-4">
                  <p class="text-sm font-medium text-muted-foreground">Expected Answer:</p>
                  <div class="mt-2 text-base whitespace-pre-wrap">{{ part.expectedAnswer }}</div>
                </div>

                <!-- Part Image if present -->
                <div v-if="part.imagePath" class="mt-3 flex justify-center">
                  <img
                    :src="part.imagePath"
                    :alt="`Part ${partIndex + 1} image`"
                    class="max-w-full h-auto rounded-lg border shadow-sm max-h-[300px] object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      <div v-else class="text-center py-12 bg-white rounded-xl border">
        <p class="text-muted-foreground">This OSCE paper has no questions yet.</p>
      </div>
    </div>
  </div>
</template>
