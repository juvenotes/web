<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus } from 'lucide-vue-next'
import axios from 'axios'
import { toast } from 'vue-sonner'
import type ConceptSectionDto from '#dtos/concept_section'
import type ConceptDto from '#dtos/concept'

interface Props {
  concept: ConceptDto
}

const props = defineProps<Props>()

// Section editor dialog state
const showSectionEditor = ref(false)
const editingSection = ref<Partial<ConceptSectionDto> | null>(null)
const isCreatingNew = ref(false)
const parentSectionId = ref<number | null>(null)

// Sections data with proper typing
interface HierarchicalSection extends ConceptSectionDto {
  children?: HierarchicalSection[]
}

const sections = ref<HierarchicalSection[]>([])

// Fetch sections
const fetchSections = async () => {
  try {
    const response = await axios.get(`/manage/concepts/${props.concept.id}/sections`)
    sections.value = buildHierarchy(response.data)
  } catch (error) {
    toast.error('Failed to load sections')
    console.error(error)
  }
}

// Build hierarchy from flat list
const buildHierarchy = (flatSections: ConceptSectionDto[]): HierarchicalSection[] => {
  const rootSections = flatSections.filter((s) => !s.parentSectionId)

  const addChildren = (section: ConceptSectionDto): HierarchicalSection => {
    const sectionWithChildren = section as HierarchicalSection
    const children = flatSections.filter((s) => s.parentSectionId === section.id)

    if (children.length) {
      sectionWithChildren.children = children
        .sort((a, b) => a.position - b.position)
        .map(addChildren)
    }

    return sectionWithChildren
  }

  return rootSections.map(addChildren).sort((a, b) => a.position - b.position)
}

// Action handlers
const handleAddSection = (parent: HierarchicalSection | null = null) => {
  isCreatingNew.value = true
  parentSectionId.value = parent?.id || null
  editingSection.value = {
    conceptId: props.concept.id,
    title: '',
    content: null,
    position: 0,
    parentSectionId: parent?.id || null,
  }
  showSectionEditor.value = true
}

const handleEditSection = (section: HierarchicalSection) => {
  isCreatingNew.value = false
  editingSection.value = { ...section }
  showSectionEditor.value = true
}

const handleDeleteSection = async (section: HierarchicalSection) => {
  if (!confirm('Are you sure you want to delete this section?')) {
    return
  }

  try {
    await axios.delete(`/manage/concepts/sections/${section.id}`)
    toast.success('Section deleted')
    fetchSections()
  } catch (error) {
    toast.error('Failed to delete section')
    console.error(error)
  }
}

const handleMoveSection = async (section: HierarchicalSection, direction: 'up' | 'down') => {
  const newPosition = direction === 'up' ? section.position - 1 : section.position + 1
  try {
    await axios.put(`/manage/concepts/sections/${section.id}`, {
      position: newPosition,
    })
    toast.success('Section moved')
    fetchSections()
  } catch (error) {
    toast.error('Failed to move section')
    console.error(error)
  }
}

// Save section
const saveSection = async () => {
  if (!editingSection.value || !editingSection.value.title) {
    toast.error('Title is required')
    return
  }

  try {
    if (isCreatingNew.value) {
      await axios.post('/manage/concepts/sections', {
        conceptId: props.concept.id,
        parentSectionId: parentSectionId.value,
        title: editingSection.value.title,
        content: editingSection.value.content,
        position: editingSection.value.position,
      })
      toast.success('Section created')
    } else {
      await axios.put(`/manage/concepts/sections/${editingSection.value.id}`, {
        title: editingSection.value.title,
        content: editingSection.value.content,
        position: editingSection.value.position,
      })
      toast.success('Section updated')
    }

    showSectionEditor.value = false
    fetchSections()
  } catch (error) {
    toast.error('Failed to save section')
    console.error(error)
  }
}

onMounted(() => {
  fetchSections()
})
</script>

<template>
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="outline" class="ml-4">Manage Sections</Button>
    </DialogTrigger>
    <DialogContent class="w-full max-w-3xl max-h-[80vh] overflow-y-auto">
      <DialogTitle>Manage Concept Sections</DialogTitle>

      <div class="flex justify-between mb-4">
        <Button @click="handleAddSection()" size="sm" class="flex items-center gap-1">
          <Plus class="w-4 h-4" /> Add Top-Level Section
        </Button>
      </div>

      <!-- Sections hierarchy -->
      <div class="space-y-2">
        <template v-if="sections.length === 0">
          <div class="text-center py-8 text-muted-foreground">
            No sections yet. Add one to get started.
          </div>
        </template>

        <template v-for="section in sections" :key="section.id">
          <SectionItem
            :section="section"
            :is-root="true"
            @edit="handleEditSection"
            @delete="handleDeleteSection"
            @add-child="handleAddSection"
            @move="handleMoveSection"
          />
        </template>
      </div>
    </DialogContent>
  </Dialog>

  <!-- Section editor dialog -->
  <Dialog v-model:open="showSectionEditor">
    <DialogContent>
      <DialogTitle>{{ isCreatingNew ? 'Add Section' : 'Edit Section' }}</DialogTitle>

      <div class="space-y-4" v-if="editingSection">
        <div>
          <label for="title" class="block text-sm font-medium mb-1">Title</label>
          <input
            id="title"
            v-model="editingSection.title"
            class="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label for="content" class="block text-sm font-medium mb-1">
            Content
            <span class="text-xs text-muted-foreground"
              >(Leave empty to create a section with subsections)</span
            >
          </label>
          <textarea
            id="content"
            v-model="editingSection.content"
            class="w-full px-3 py-2 border rounded-md min-h-[200px]"
          ></textarea>
        </div>

        <div class="flex justify-end gap-2">
          <Button variant="outline" @click="showSectionEditor = false">Cancel</Button>
          <Button @click="saveSection">Save</Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
