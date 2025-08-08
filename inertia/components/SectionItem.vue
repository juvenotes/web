<script setup lang="ts">
import { ref, PropType } from 'vue'
import {
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Plus,
  Edit,
  Trash,
  ArrowUp,
  ArrowDown,
} from 'lucide-vue-next'
import type ConceptSectionDto from '#dtos/concept_section'

interface HierarchicalSection extends ConceptSectionDto {
  children?: HierarchicalSection[]
}

defineProps({
  section: {
    type: Object as PropType<HierarchicalSection>,
    required: true,
  },
  isRoot: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['edit', 'delete', 'add-child', 'move'])
const isOpen = ref(false)
</script>

<template>
  <Card :class="{ 'border-primary/50': isRoot }">
    <CardContent class="p-3">
      <div class="flex items-center justify-between">
        <!-- Section title with expand/collapse if it has children -->
        <div class="flex items-center gap-2">
          <Collapsible v-if="section.children?.length" v-model:open="isOpen">
            <CollapsibleTrigger class="p-1">
              <ChevronRight v-if="!isOpen" class="w-4 h-4" />
              <ChevronDown v-else class="w-4 h-4" />
            </CollapsibleTrigger>
          </Collapsible>

          <span class="font-medium">
            {{ section.title }}
          </span>

          <!-- Show section type indicator -->
          <span v-if="section.content" class="text-xs bg-secondary px-2 py-0.5 rounded-full">
            Content
          </span>
          <span
            v-else-if="section.children?.length"
            class="text-xs bg-primary/10 px-2 py-0.5 rounded-full"
          >
            Parent ({{ section.children.length }})
          </span>
        </div>

        <!-- Actions dropdown -->
        <DropdownMenu>
          <DropdownMenuTrigger class="p-1">
            <MoreVertical class="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem @click="emit('edit', section)">
              <Edit class="w-4 h-4 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem @click="emit('add-child', section)">
              <Plus class="w-4 h-4 mr-2" /> Add Subsection
            </DropdownMenuItem>
            <DropdownMenuItem @click="emit('move', section, 'up')">
              <ArrowUp class="w-4 h-4 mr-2" /> Move Up
            </DropdownMenuItem>
            <DropdownMenuItem @click="emit('move', section, 'down')">
              <ArrowDown class="w-4 h-4 mr-2" /> Move Down
            </DropdownMenuItem>
            <DropdownMenuItem
              @click="emit('delete', section)"
              class="text-destructive focus:text-destructive"
            >
              <Trash class="w-4 h-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <!-- Child sections (if any) -->
      <Collapsible v-if="section.children?.length" v-model:open="isOpen">
        <CollapsibleContent>
          <div class="pl-6 mt-2 space-y-2 border-l">
            <SectionItem
              v-for="child in section.children"
              :key="child.id"
              :section="child"
              @edit="$emit('edit', $event)"
              @delete="$emit('delete', $event)"
              @add-child="$emit('add-child', $event)"
              @move="(section, direction) => $emit('move', section, direction)"
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      <!-- Preview of content (if any) -->
      <div
        v-if="section.content && !section.children?.length"
        class="mt-2 pl-6 text-sm text-muted-foreground line-clamp-2"
      >
        {{ section.content.substring(0, 100) }}{{ section.content.length > 100 ? '...' : '' }}
      </div>
    </CardContent>
  </Card>
</template>
