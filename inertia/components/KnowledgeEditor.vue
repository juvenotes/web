<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { watch } from 'vue'
import { Markdown } from 'tiptap-markdown'
import { Bold, Italic, Code, Heading1, Heading2, List, ListOrdered } from 'lucide-vue-next'
import debounce from 'lodash/debounce'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits(['update:modelValue'])

const emitUpdate = debounce((markdown: string) => {
  emit('update:modelValue', markdown)
}, 500)

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Markdown.configure({
      html: true,
      tightLists: true,
      bulletListMarker: '-',
      // transformPastedText: true,
    }),
  ],
  onUpdate: ({ editor }) => {
    // Get markdown directly
    const markdown = editor.storage.markdown.getMarkdown()
    console.log(markdown)
    emitUpdate(markdown)
  },
})

// Watch for external changes
watch(
  () => props.modelValue,
  (newContent) => {
    if (editor.value && newContent !== editor.value.storage.markdown.getMarkdown()) {
      editor.value.commands.setContent(newContent, false)
    }
  }
)
</script>

<template>
  <div class="border rounded-lg">
    <!-- Toolbar -->
    <div class="border-b p-2 flex gap-2">
      <Button
        variant="ghost"
        size="sm"
        @click="editor?.chain().focus().toggleBold().run()"
        :class="{ 'bg-muted': editor?.isActive('bold') }"
      >
        <Bold class="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        @click="editor?.chain().focus().toggleItalic().run()"
        :class="{ 'bg-muted': editor?.isActive('italic') }"
      >
        <Italic class="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        @click="editor?.chain().focus().toggleCode().run()"
        :class="{ 'bg-muted': editor?.isActive('code') }"
      >
        <Code class="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()"
        :class="{ 'bg-muted': editor?.isActive('heading', { level: 1 }) }"
      >
        <Heading1 class="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
        :class="{ 'bg-muted': editor?.isActive('heading', { level: 2 }) }"
      >
        <Heading2 class="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        @click="editor?.chain().focus().toggleBulletList().run()"
        :class="{ 'bg-muted': editor?.isActive('bulletList') }"
      >
        <List class="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        @click="editor?.chain().focus().toggleOrderedList().run()"
        :class="{ 'bg-muted': editor?.isActive('orderedList') }"
      >
        <ListOrdered class="h-4 w-4" />
      </Button>
    </div>
    <editor-content :editor="editor" class="prose max-w-none p-4" />
  </div>
</template>
