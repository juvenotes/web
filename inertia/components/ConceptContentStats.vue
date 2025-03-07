<script setup lang="ts">
import type ConceptDto from '#dtos/concept'
import { computed } from 'vue'
import { Progress } from '~/components/ui/progress'
import { Badge } from '~/components/ui/badge'

interface Props {
  concepts: ConceptDto | ConceptDto[]
  showForNonTerminal?: boolean
}

const props = defineProps<Props>()

// Check if a knowledge block is effectively empty (null or contains default seeded content)
function isEmptyKnowledgeBlock(knowledgeBlock: string | null, title: string): boolean {
  if (!knowledgeBlock) return true

  // Check for default seeded content pattern
  const defaultPattern = `# ${title}\n\nDetailed content for ${title} goes here.`
  return knowledgeBlock.trim() === defaultPattern.trim()
}

// Get root concepts to start traversal
const rootConcepts = computed(() => {
  const conceptsList = Array.isArray(props.concepts) ? props.concepts : [props.concepts]
  return conceptsList
})

// Find all terminal concepts by recursively traversing the concept tree
const allTerminalConcepts = computed(() => {
  const terminalConcepts: ConceptDto[] = []

  // Recursive function to traverse the tree and collect terminal concepts
  function collectTerminalConcepts(concept: ConceptDto) {
    // If this concept is a terminal node, add it
    if (concept.isTerminal) {
      terminalConcepts.push(concept)
    }
    // Otherwise if it has children, check each child
    else if (concept.children && concept.children.length > 0) {
      concept.children.forEach((child) => collectTerminalConcepts(child))
    }
  }

  // Start traversal from each root concept
  rootConcepts.value.forEach((concept) => collectTerminalConcepts(concept))

  return terminalConcepts
})

// Split terminal concepts into empty vs filled
const emptyContent = computed(() => {
  return allTerminalConcepts.value.filter((concept) =>
    isEmptyKnowledgeBlock(concept.knowledgeBlock, concept.title)
  )
})

const filledContent = computed(() => {
  return allTerminalConcepts.value.filter(
    (concept) => !isEmptyKnowledgeBlock(concept.knowledgeBlock, concept.title)
  )
})

const totalTerminalConcepts = computed(() => allTerminalConcepts.value.length)

const percentageFilled = computed(() => {
  if (totalTerminalConcepts.value === 0) return 0
  return Math.round((filledContent.value.length / totalTerminalConcepts.value) * 100)
})
</script>

<template>
  <div v-if="totalTerminalConcepts > 0" class="space-y-2 p-4 border rounded-lg bg-card/50 mt-4">
    <div class="flex justify-between items-center mb-2">
      <div class="space-y-1">
        <h3 class="text-sm font-medium">Content Status</h3>
        <p class="text-sm text-muted-foreground">
          {{ filledContent.length }} of {{ totalTerminalConcepts }} terminal concepts have content
          ({{ emptyContent.length }} empty)
        </p>
      </div>
      <Badge :variant="percentageFilled > 50 ? 'default' : 'outline'" class="ml-2">
        {{ percentageFilled }}% Complete
      </Badge>
    </div>

    <Progress :value="percentageFilled" class="h-2" />
  </div>
</template>
