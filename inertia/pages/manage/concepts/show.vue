<script setup lang="ts">
import { Link, useForm } from '@inertiajs/vue3'
import type ConceptDto from '#dtos/concept'
import type QuestionDto from '#dtos/question'
import { computed, ref, watchEffect } from 'vue'
import AdminLayout from '~/layouts/AdminLayout.vue'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { AlertCircle } from 'lucide-vue-next'
import MdxContent from '~/components/MdxContent.vue'
import KnowledgeEditor from '~/components/KnowledgeEditor.vue'
import { toast } from 'vue-sonner'

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

watchEffect(() => {
  children.value = props.children
  questions.value = props.questions
})

const showEditDialog = ref(false)

const form = useForm({
  title: props.concept.title,
  isTerminal: props.concept.isTerminal,
})

const contentForm = useForm({
  knowledgeBlock: props.content || '',
})

const updateContent = (value: string) => {
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
  <div class="container mx-auto px-4 py-8">
    <nav class="flex items-center gap-2 mb-6 text-sm">
      <Link href="/manage/concepts">Concepts</Link>
      <span>/</span>
      <span>{{ concept.title }}</span>
    </nav>

    <div class="space-y-8">
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold">{{ concept.title }}</h1>
        <div class="flex gap-2">
          <Button variant="outline" @click="showEditDialog = true"> Edit </Button>
          <Button variant="destructive" @click="handleDelete"> Delete </Button>
        </div>
      </div>

      <!-- Child Concepts Grid -->
      <div v-if="children?.length" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link
          v-for="child in children"
          :key="child.id"
          :href="`/manage/concepts/${child.slug}`"
          class="p-4 rounded-lg border hover:border-primary transition-colors"
        >
          <h3 class="text-lg font-semibold">{{ child.title }}</h3>
        </Link>
      </div>

      <Dialog :open="showEditDialog" @update:open="showEditDialog = $event">
        <DialogContent class="sm:max-w-[800px]">
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

      <!-- Content Editor -->
      <div v-if="concept.isTerminal" class="space-y-4">
        <h2 class="text-2xl font-bold">Content</h2>
        <form @submit.prevent="handleContentSubmit" class="space-y-4">
          <!-- Error Alert -->
          <Alert v-if="contentForm.errors.knowledgeBlock" variant="destructive">
            <AlertCircle class="h-4 w-4" />
            <AlertDescription>
              {{ contentForm.errors.knowledgeBlock }}
            </AlertDescription>
          </Alert>

          <KnowledgeEditor
            :modelValue="contentForm.knowledgeBlock"
            @update:modelValue="updateContent"
          />

          <Button type="submit" :disabled="contentForm.processing">
            {{ contentForm.processing ? 'Saving...' : 'Save Content' }}
          </Button>
        </form>
      </div>

      <!-- Content Display -->
      <div v-if="content">
        <MdxContent :content="content" />
      </div>

      <!-- Questions -->
      <div v-if="questions?.length" class="mt-8 space-y-8">
        <h2 class="text-2xl font-bold">Practice Questions</h2>
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
