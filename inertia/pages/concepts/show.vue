<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import type ConceptDto from '#dtos/concept'
import type QuestionDto from '#dtos/question'
import { computed, ref, watchEffect } from 'vue'
import MdxContent from '~/components/MdxContent.vue'

import DashLayout from '~/layouts/DashLayout.vue'
import { Home, BookOpen, ChevronRight, Network, HelpCircle, Circle, Award } from 'lucide-vue-next'

defineOptions({ layout: DashLayout })

const props = defineProps<{
  concept: ConceptDto
  children: ConceptDto[]
  questions: QuestionDto[]
  content: string | null
}>()

const children = ref(props.children)
const questions = ref(props.questions)
const content = computed(() => props.content || '')

watchEffect(() => {
  children.value = props.children
  questions.value = props.questions
})
</script>

<template>
  <AppHead :title="`${concept.title}`" description="All available concepts in Juvenotes" />
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
    <!-- Modern Breadcrumbs -->
    <nav class="flex items-center gap-3 text-sm text-muted-foreground bg-white/50 p-3 rounded-lg border">
      <Home class="h-4 w-4" />
      <Link href="/concepts" class="hover:text-primary transition-colors flex items-center gap-2">
        <BookOpen class="h-4 w-4" />
        Concepts
      </Link>
      <ChevronRight class="h-4 w-4 text-muted-foreground/50" />
      <span class="text-foreground font-medium">{{ concept.title }}</span>
    </nav>

    <div class="space-y-8">
      <!-- Enhanced Title Section -->
      <div class="relative overflow-hidden bg-gradient-to-br from-primary/5 via-primary/10 to-transparent 
                  p-6 rounded-2xl border">
        <h1 class="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          {{ concept.title }}
        </h1>
      </div>

      <!-- Modernized Child Concepts Grid -->
      <div v-if="children?.length" class="space-y-4">
        <div class="flex items-center gap-2">
          <Network class="h-5 w-5 text-primary" />
          <h2 class="text-lg font-semibold text-foreground">Related Concepts</h2>
        </div>
        
        <div class="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link
            v-for="child in children"
            :key="child.id"
            :href="`/concepts/${child.slug}`"
            class="group p-5 rounded-xl bg-white/50 backdrop-blur-sm border 
                   hover:border-primary/20 hover:shadow-lg hover:-translate-y-0.5 
                   transition-all duration-300"
          >
            <h3 class="text-base font-medium group-hover:text-primary transition-colors flex items-center gap-2">
              <BookOpen class="h-4 w-4 text-primary/70" />
              {{ child.title }}
            </h3>
          </Link>
        </div>
      </div>

      <!-- Enhanced Main Content -->
      <div v-if="content" class="prose prose-primary max-w-none 
                                prose-headings:text-foreground prose-p:text-muted-foreground">
        <MdxContent :content="content" />
      </div>

      <!-- Modern Questions Section -->
      <div v-if="questions?.length" class="space-y-6">
        <div class="flex items-center gap-2">
          <HelpCircle class="h-5 w-5 text-primary" />
          <h2 class="text-lg font-semibold text-foreground">Practice Questions</h2>
        </div>
        
        <div class="space-y-6">
          <div 
            v-for="question in questions" 
            :key="question.id" 
            class="p-6 rounded-xl bg-white/50 backdrop-blur-sm border hover:shadow-lg transition-all duration-300"
          >
            <p class="font-medium text-foreground">{{ question.questionText }}</p>

            <!-- Enhanced MCQ Choices -->
            <div v-if="question.choices?.length" class="mt-4 space-y-2">
              <div
                v-for="choice in question.choices"
                :key="choice.id"
                class="flex items-start gap-3 p-3 rounded-lg hover:bg-primary/5 
                       border border-transparent hover:border-primary/10 transition-all duration-300"
              >
                <Circle class="h-4 w-4 mt-0.5 text-muted-foreground" />
                <span class="text-muted-foreground">{{ choice.choiceText }}</span>
              </div>
            </div>

            <!-- Enhanced SAQ Parts -->
            <div v-if="question.parts?.length" class="mt-6 space-y-4">
              <div 
                v-for="part in question.parts" 
                :key="part.id" 
                class="relative pl-6 py-3"
              >
                <div class="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/40 to-primary/10 
                          rounded-full" />
                <p class="font-medium text-foreground">{{ part.partText }}</p>
                <p class="mt-2 text-muted-foreground">{{ part.expectedAnswer }}</p>
                <div class="flex items-center gap-2 mt-2">
                  <Award class="h-4 w-4 text-primary/70" />
                  <p class="text-xs text-primary/70 font-medium">
                    {{ part.marks }} marks
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>