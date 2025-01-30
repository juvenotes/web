<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { Markdown } from 'tiptap-markdown'
import { FontFamily } from '@tiptap/extension-font-family'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Highlight } from '@tiptap/extension-highlight'
import { TaskList } from '@tiptap/extension-task-list'
import { TaskItem } from '@tiptap/extension-task-item'
import { Save, Clock, Link, Youtube } from 'lucide-vue-next'
import debounce from 'lodash/debounce'
import { ref, computed } from 'vue'

const AUTOSAVE_DELAY = 2000 // 2 seconds

const props = defineProps<{
  modelValue: string
  metadata?: any 
}>()

const emit = defineEmits(['update:modelValue', 'update:metadata'])
const isSaving = ref(false)

const saveStatus = computed(() => {
  if (isSaving.value) return 'Saving...'
  return props.metadata?.lastEditedBy?.status === 'draft' 
    ? 'Draft saved'
    : 'All changes saved'
})

const emitUpdate = debounce((markdown: string, status: 'draft' | 'edited' = 'draft') => {
  isSaving.value = true
  emit('update:modelValue', markdown)
  emit('update:metadata', {
    ...props.metadata,
    lastEditedBy: {
      fullName: props.metadata?.lastEditedBy?.fullName,
      timestamp: new Date(),
      status
    }
  })
  setTimeout(() => {
    isSaving.value = false
  }, 500)
}, AUTOSAVE_DELAY)

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Markdown,
    FontFamily,
    TextStyle,
    Color,
    Highlight,
    TaskList,
    TaskItem
  ],
  onUpdate: ({ editor }) => {
    const markdown = editor.storage.markdown.getMarkdown()
    emitUpdate(markdown)
  },
  onFocus: () => {
    // Track focus state if needed
  },
  onBlur: () => {
    // Trigger final save on blur if needed
  }
})
</script>

<template>
  <div class="border rounded-lg">
    <!-- Status Bar -->
    <div class="flex items-center justify-between px-4 py-2 border-b bg-muted/50">
      <div class="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock class="h-4 w-4" :class="{ 'animate-spin': isSaving }" />
        <span>{{ saveStatus }}</span>
      </div>
      
      <!-- Toolbar -->
      <div class="flex items-center gap-2">
        <button
          v-if="editor"
          @click="editor.chain().focus().toggleBold().run()"
          :class="{ 'bg-muted': editor.isActive('bold') }"
          class="p-2 rounded hover:bg-muted/80 transition-colors"
        >
          <span class="font-bold">B</span>
        </button>
        <button
          v-if="editor"
          @click="editor.chain().focus().toggleItalic().run()"
          :class="{ 'bg-muted': editor.isActive('italic') }"
          class="p-2 rounded hover:bg-muted/80 transition-colors"
        >
          <span class="italic">I</span>
        </button>
        <!-- Add more toolbar buttons as needed -->
      </div>
    </div>
    
    <EditorContent :editor="editor" class="prose max-w-none p-4" />
  </div>
</template>

<style>
.ProseMirror {
  outline: none;
  min-height: 200px;
}

.ProseMirror p.is-editor-empty:first-child::before {
  content: "Start typing...";
  float: left;
  color: #adb5bd;
  pointer-events: none;
  height: 0;
}

/* Notion-like styling */
.prose {
  font-size: 1rem;
  line-height: 1.75;
}

.prose p {
  margin-bottom: 0.75em;
}

.prose h1 {
  font-size: 2em;
  margin-top: 1em;
  margin-bottom: 0.5em;
  font-weight: 600;
}

.prose h2 {
  font-size: 1.5em;
  margin-top: 1em;
  margin-bottom: 0.5em;
  font-weight: 600;
}

.prose ul, .prose ol {
  padding-left: 1.5em;
  margin: 0.5em 0;
}
</style>