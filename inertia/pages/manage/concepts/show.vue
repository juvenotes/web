<script setup lang="ts">
import { Link, useForm } from '@inertiajs/vue3'
import type ConceptDto from '#dtos/concept'
import type QuestionDto from '#dtos/question'
import { computed, ref, watchEffect } from 'vue'
import AdminLayout from '~/layouts/AdminLayout.vue'
import MdxContent from '~/components/MdxContent.vue'
import KnowledgeEditor from '~/components/KnowledgeEditor.vue'
import { toast } from 'vue-sonner'
import { Plus, ArrowLeft } from 'lucide-vue-next'

defineOptions({ layout: AdminLayout })

const props = defineProps<{
  concept: ConceptDto
  children: ConceptDto[]
  questions: QuestionDto[]
  content: string | null
}>()

const children = ref(props.children)
const questions = ref(props.questions)
const content = computed(() => props.content || '')
const showContentEditor = ref(false)

const toggleContentEditor = () => {
  showContentEditor.value = !showContentEditor.value
}

const goBack = () => {
  window.history.back()
}

watchEffect(() => {
  children.value = props.children
  questions.value = props.questions
})

const showEditDialog = ref(false)
const showNewChildDialog = ref(false)

const form = useForm({
  title: props.concept.title,
  isTerminal: props.concept.isTerminal,
})

const contentForm = useForm({
  knowledgeBlock: typeof props.content === 'string' ? props.content : '',
})

const newChildForm = useForm({
  title: '',
  parentId: props.concept.slug,
  isTerminal: false,
})

const updateContent = (value: string) => {
  console.log('Content updated:', value)
  contentForm.knowledgeBlock = value
}

const handleSubmit = () => {
  form.put(`/manage/concepts/${props.concept.slug}`, {
    onSuccess: () => {
      showEditDialog.value = false
    },
    onError: (errors) => {
      console.error('Form errors:', errors)
    },
  })
}

const handleNewChild = () => {
  newChildForm.post('/manage/concepts', {
    onSuccess: () => {
      showNewChildDialog.value = false
      newChildForm.reset()
    },
    onError: (errors) => {
      toast.error('Failed to create child concept')
      console.error('Form errors:', errors)
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
    <nav class="flex flex-wrap items-center gap-2 mb-4 sm:mb-6 text-sm">
      <button
        @click="goBack"
        class="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft class="h-4 w-4" />
        <span class="hidden sm:inline">Back</span>
      </button>
      <Link href="/manage/concepts">Concepts</Link>
      <span>/</span>
      <span class="truncate max-w-[200px]">{{ concept.title }}</span>
    </nav>

    <div class="space-y-6 sm:space-y-8">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 class="text-2xl sm:text-3xl font-bold truncate">{{ concept.title }}</h1>
        <div class="flex flex-wrap gap-2">
          <!-- Only show Add buttons for non-terminal concepts -->
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

      <!-- edit dialog -->
      <Dialog :open="showEditDialog" @update:open="showEditDialog = $event">
        <DialogContent class="w-[95vw] max-w-[800px] sm:w-[90vw]">
          <DialogHeader>
            <DialogTitle>Edit Concept</DialogTitle>
          </DialogHeader>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div class="space-y-2">
              <Label>Title</Label>
              <Input v-model="form.title" />
              <p v-if="form.errors.title" class="text-sm text-destructive">
                {{ form.errors.title }}
              </p>
            </div>

            <Button type="submit" :disabled="form.processing">
              {{ form.processing ? 'Saving...' : 'Save Changes' }}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <!-- New Child Dialog -->
      <Dialog :open="showNewChildDialog" @update:open="showNewChildDialog = $event">
        <DialogContent class="w-[95vw] max-w-[800px] sm:w-[90vw]">
          <DialogHeader>
            <DialogTitle>Add Child Concept</DialogTitle>
          </DialogHeader>

          <form @submit.prevent="handleNewChild" class="space-y-4">
            <div class="space-y-2">
              <Label for="child-title">Title</Label>
              <Input
                id="child-title"
                v-model="newChildForm.title"
                :class="{ 'border-destructive': newChildForm.errors.title }"
              />
              <p v-if="newChildForm.errors.title" class="text-sm text-destructive">
                {{ newChildForm.errors.title }}
              </p>
            </div>

            <div class="flex items-center space-x-2">
              <Checkbox v-model="newChildForm.isTerminal" id="child-terminal" />
              <Label for="child-terminal">Is Terminal Concept</Label>
            </div>

            <Button type="submit" :disabled="newChildForm.processing">
              {{ newChildForm.processing ? 'Creating...' : 'Create Concept' }}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <!-- Terminal Content Section -->
      <div v-if="concept.isTerminal" class="space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 class="text-xl sm:text-2xl font-bold">Content</h2>
          <Button variant="outline" @click="toggleContentEditor" class="w-full sm:w-auto">
            {{ showContentEditor ? 'Hide Editor' : 'Edit Content' }}
          </Button>
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
        <div v-for="question in questions" :key="question.id" class="space-y-4">
          <div class="p-4 rounded-lg border">
            <p class="font-medium">{{ question.questionText }}</p>

            <!-- MCQ Choices -->
            <div v-if="question.choices?.length" class="mt-4 space-y-2">
              <div
                v-for="choice in question.choices"
                :key="choice.id"
                class="flex items-start gap-2"
              >
                <span>{{ choice.choiceText }}</span>
              </div>
            </div>

            <!-- SAQ Parts -->
            <div v-if="question.parts?.length" class="mt-4 space-y-4">
              <div v-for="part in question.parts" :key="part.id" class="border-l-2 pl-4">
                <p class="font-medium">{{ part.partText }}</p>
                <p class="font-medium">{{ part.expectedAnswer }}</p>
                <p class="text-sm text-muted-foreground mt-2">Marks: {{ part.marks }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
