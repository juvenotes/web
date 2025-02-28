<script setup lang="ts">
import { Link, useForm } from '@inertiajs/vue3'
import type ConceptDto from '#dtos/concept'
import type QuestionDto from '#dtos/question'
import { computed, ref, watchEffect } from 'vue'
import AdminLayout from '~/layouts/AdminLayout.vue'
import { toast } from 'vue-sonner'
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-vue-next'

defineOptions({ layout: AdminLayout })

const props = defineProps<{
  concept: ConceptDto
  children: ConceptDto[]
  questions: QuestionDto[]
  parentConcepts?: ConceptDto[]
  content: string | null
}>()

const children = ref(props.children)
const questions = ref(props.questions)
const content = computed(() => props.content || '')
const showContentEditor = ref(false)
const showAddMcqDialog = ref(false)

const toggleContentEditor = () => {
  showContentEditor.value = !showContentEditor.value
}

const breadcrumbItems = computed(() => {
  const items = [{ label: 'Concepts', href: '/manage/concepts' }]

  // Add parent concepts if they exist
  if (props.parentConcepts?.length) {
    props.parentConcepts.forEach((parent: ConceptDto) => {
      items.push({
        label: parent.title,
        href: `/manage/concepts/${parent.slug}`,
      })
    })
  }

  // Add current concept
  items.push({
    label: props.concept.title,
    href: '',
  })

  return items
})

watchEffect(() => {
  children.value = props.children
  questions.value = props.questions
})

const showEditMcqDialog = ref(false)
const showEditDialog = ref(false)
const showNewChildDialog = ref(false)
const selectedQuestion = ref<QuestionDto | null>(null)

const contentForm = useForm({
  knowledgeBlock: typeof props.content === 'string' ? props.content : '',
})

const updateContent = (value: string) => {
  console.log('Content updated:', value)
  contentForm.knowledgeBlock = value
}

function handleEditQuestion(question: QuestionDto) {
  showEditMcqDialog.value = true
  selectedQuestion.value = question
}

function handleDeleteQuestion(question: QuestionDto) {
  if (!confirm('Are you sure you want to delete this question?')) return

  const form = useForm({})
  form.delete(`/manage/concepts/${props.concept.slug}/questions/${question.slug}`, {
    preserveScroll: true,
    onSuccess: () => {
      toast.success('Question deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete question')
    },
  })
}

const handleContentSubmit = () => {
  contentForm.put(`/manage/concepts/${props.concept.slug}/content`, {
    preserveScroll: true,
    onSuccess: () => {
      toast.success('Content updated successfully')
    },
    onError: (errors) => {
      toast.error('Failed to update content')
      console.error('Form errors:', errors)
    },
  })
}

const handleDelete = () => {
  if (confirm('Are you sure you want to delete this concept?')) {
    const form = useForm({})
    form.delete(`/manage/concepts/${props.concept.slug}`)
  }
}
</script>

<template>
  <AppHead
    :title="`Manage ${concept.title}`"
    description="Manage a specific concept in Juvenotes"
  />
  <div class="container mx-auto px-4 py-4 sm:py-8">
    <!-- Enhanced Title Section -->
    <div class="relative p-6 sm:p-8 bg-white/50 rounded-2xl border shadow-sm">
      <div
        class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-primary/50 to-transparent"
      />

      <BreadcrumbTrail :items="breadcrumbItems" />

      <div class="mt-4 flex flex-col sm:flex-row sm:items-start gap-4 justify-between mb-8">
        <div class="flex items-start gap-4">
          <div class="p-3 rounded-xl bg-primary/5 border border-primary/10 shrink-0">
            <BookOpen class="h-6 w-6 text-primary" />
          </div>
          <div class="space-y-1">
            <h1 class="text-2xl font-bold text-foreground">{{ concept.title }}</h1>
            <p class="text-sm text-muted-foreground">Manage concept content and structure</p>
          </div>
        </div>

        <div class="flex flex-wrap gap-2">
          <ToggleUrl />
          <template v-if="!concept.isTerminal">
            <Button variant="outline" @click="showNewChildDialog = true" class="w-full sm:w-auto">
              <Plus class="h-4 w-4 mr-2" />
              Add Child Concept
            </Button>
          </template>
          <Button variant="outline" @click="showEditDialog = true" class="w-full sm:w-auto">
            Edit
          </Button>
          <Button variant="destructive" @click="handleDelete" class="w-full sm:w-auto">
            Delete
          </Button>
        </div>
      </div>

      <!-- Info Grid -->
      <div
        v-if="!concept.isTerminal"
        class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-6"
      >
        <div class="p-4 rounded-lg border">
          <span class="text-sm text-muted-foreground"
            ><b>{{ concept.title }} </b> is example of a parent concept here. All others are child
            concepts.</span
          >
        </div>
      </div>

      <!-- Child Concepts Grid -->
      <div v-if="children?.length" class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          v-for="child in children"
          :key="child.id"
          :href="`/manage/concepts/${child.slug}`"
          class="p-4 rounded-lg border hover:border-primary transition-colors"
        >
          <h3 class="text-lg font-semibold">{{ child.title }}</h3>
        </Link>
      </div>

      <!-- Terminal Content Section -->
      <div v-if="concept.isTerminal" class="space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 class="text-xl sm:text-2xl font-bold">Content</h2>
          <div class="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <Button variant="outline" @click="toggleContentEditor" class="w-full sm:w-auto">
              {{ showContentEditor ? 'Hide Editor' : 'Edit Content' }}
            </Button>
            <Button variant="outline" @click="showAddMcqDialog = true" class="w-full sm:w-auto">
              <Plus class="h-4 w-4 mr-2" />
              Add MCQ
            </Button>
          </div>
        </div>

        <form v-if="showContentEditor" @submit.prevent="handleContentSubmit" class="space-y-4">
          <KnowledgeEditor
            :modelValue="contentForm.knowledgeBlock"
            @update:modelValue="updateContent"
          />
          <Button type="submit" :disabled="contentForm.processing">
            {{ contentForm.processing ? 'Saving...' : 'Save Content' }}
          </Button>
        </form>

        <div v-if="content">
          <MdxContent :content="content" />
        </div>
      </div>

      <!-- Questions -->
      <div v-if="questions?.length" class="mt-6 sm:mt-8 space-y-6 sm:space-y-8">
        <h2 class="text-xl sm:text-2xl font-bold">Practice Questions</h2>
        <div v-for="(question, index) in questions" :key="question.id" class="space-y-4">
          <div class="p-6 bg-white rounded-xl border shadow-sm">
            <!-- Question Header -->
            <div class="flex items-start justify-between">
              <div class="flex gap-3 items-start">
                <span class="flex-none px-2 py-1 bg-primary/10 text-primary rounded-lg font-medium">
                  Q{{ index + 1 }}
                </span>
                <p class="text-foreground">{{ question.questionText }}</p>
              </div>
              <!-- Action Buttons -->
              <div class="flex items-center gap-2">
                <Button variant="ghost" size="sm" @click="handleEditQuestion(question)">
                  <Pencil class="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" @click="handleDeleteQuestion(question)">
                  <Trash2 class="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>

            <!-- MCQ Choices -->
            <div v-if="question.choices?.length" class="mt-4 pl-10 space-y-3">
              <div
                v-for="choice in question.choices"
                :key="choice.id"
                class="flex items-start gap-3 p-3 rounded-lg border"
              >
                <div
                  class="h-4 w-4 mt-1 rounded-full border"
                  :class="{ 'bg-primary border-primary': choice.isCorrect }"
                />
                <div class="space-y-2">
                  <span class="text-sm text-muted-foreground">{{ choice.choiceText }}</span>
                  <p
                    v-if="choice.isCorrect && choice.explanation"
                    class="text-sm text-muted-foreground mt-1"
                  >
                    <span class="font-medium">Explanation:</span> {{ choice.explanation }}
                  </p>
                </div>
              </div>
            </div>

            <!-- SAQ Parts -->
            <div v-if="question.parts?.length" class="mt-4 pl-10 space-y-4">
              <div
                v-for="(part, partIndex) in question.parts"
                :key="part.id"
                class="relative pl-4 border-l-2 border-primary/20 py-3"
              >
                <div class="space-y-3">
                  <!-- Part Header -->
                  <div class="flex items-center gap-2">
                    <span class="font-medium">Part {{ partIndex + 1 }}</span>
                    <span
                      class="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium"
                    >
                      {{ part.marks }} marks
                    </span>
                  </div>

                  <!-- Part Text -->
                  <p class="text-foreground">{{ part.partText }}</p>

                  <!-- Expected Answer -->
                  <div class="mt-2 bg-muted/50 rounded-lg p-3">
                    <p class="text-sm font-medium text-muted-foreground">Expected Answer:</p>
                    <div class="mt-2 text-sm whitespace-pre-wrap">{{ part.expectedAnswer }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <EditConceptDialog v-model:open="showEditDialog" :concept="concept" />
  <NewChildConceptDialog v-model:open="showNewChildDialog" :parent-id="concept.slug" />
  <AddMcqToConceptDialog v-model:open="showAddMcqDialog" :concept="concept" />
  <EditMcqInConceptDialog
    v-if="selectedQuestion"
    v-model:open="showEditMcqDialog"
    :concept="concept"
    :question="selectedQuestion"
  />
</template>
