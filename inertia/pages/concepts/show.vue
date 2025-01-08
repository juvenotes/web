<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import type ConceptDto from '#dtos/concept'
import type QuestionDto from '#dtos/question'
import { computed, ref, watchEffect } from 'vue'

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
    <div class="container mx-auto px-4 py-8">
        <nav class="flex items-center gap-2 mb-6 text-sm">
            <Link href="/concepts">Concepts</Link>
            <span>/</span>
            <span>{{ concept.title }}</span>
        </nav>

        <div class="space-y-8">
            <div>
                <h1 class="text-3xl font-bold">{{ concept.title }}</h1>
            </div>

            <!-- Child Concepts Grid -->
            <div v-if="children?.length" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Link v-for="child in children" :key="child.id" :href="`/concepts/${child.slug}`"
                    class="p-4 rounded-lg border hover:border-primary transition-colors">
                <h3 class="text-lg font-semibold">{{ child.title }}</h3>
                </Link>
            </div>

            <!-- Content -->
            <div v-if="content" class="prose max-w-none" v-html="content" />

            <!-- Questions -->
            <div v-if="questions?.length" class="mt-8 space-y-8">
                <h2 class="text-2xl font-bold">Practice Questions</h2>
                <div v-for="question in questions" :key="question.id" class="space-y-4">
                    <div class="p-4 rounded-lg border">
                        <p class="font-medium">{{ question.questionText }}</p>

                        <!-- MCQ Choices -->
                        <div v-if="question.choices?.length" class="mt-4 space-y-2">
                            <div v-for="choice in question.choices" :key="choice.id" class="flex items-start gap-2">
                                <span>{{ choice.choiceText }}</span>
                            </div>
                        </div>

                        <!-- SAQ Parts -->
                        <!-- SAQ Parts -->
                        <div v-if="question.parts?.length" class="mt-4 space-y-4">
                            <div v-for="part in question.parts" :key="part.id" class="border-l-2 pl-4">
                                <p class="font-medium">{{ part.partText }}</p>
                                <p class="font-medium">{{ part.expectedAnswer }}</p>
                                <p class="text-sm text-muted-foreground mt-2">
                                    Marks: {{ part.marks }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>