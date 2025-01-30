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
import { Link } from '@tiptap/extension-link'
import { Image } from '@tiptap/extension-image'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import { Youtube } from '@tiptap/extension-youtube'
import {
  Bold, Italic, List, ListOrdered, Code, Quote, ImageIcon,Link as LinkIcon, Youtube as YoutubeIcon,
  Heading1, Heading2, Clock
} from 'lucide-vue-next'
import debounce from 'lodash/debounce'
import { ref, computed } from 'vue'

const props = defineProps<{ 
  modelValue: string
  metadata?: any 
}>()

const emit = defineEmits(['update:modelValue', 'update:metadata'])

const AUTOSAVE_DELAY = 2000
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
    TaskItem,
    Link.configure({ openOnClick: true, HTMLAttributes: { target: '_blank', rel: 'noopener' } }),
    Image.configure({
      HTMLAttributes: {
        class: 'editor-image',
        width: '100%',
        height: 'auto',
      }
    }),
    Table.configure({ resizable: true }),
    TableRow,
    TableCell,
    TableHeader,
    Youtube.configure({ width: 640, height: 360 })
  ],
  onUpdate: ({ editor }) => {
    const markdown = editor.storage.markdown.getMarkdown()
    emitUpdate(markdown)
  }
})

const toolbar = [
  { icon: Bold, title: 'Bold', action: () => editor.value?.chain().focus().toggleBold().run() },
  { icon: Italic, title: 'Italic', action: () => editor.value?.chain().focus().toggleItalic().run() },
  { icon: Heading1, title: 'H1', action: () => editor.value?.chain().focus().toggleHeading({ level: 1 }).run() },
  { icon: Heading2, title: 'H2', action: () => editor.value?.chain().focus().toggleHeading({ level: 2 }).run() },
  { icon: List, title: 'Bullet List', action: () => editor.value?.chain().focus().toggleBulletList().run() },
  { icon: ListOrdered, title: 'Ordered List', action: () => editor.value?.chain().focus().toggleOrderedList().run() },
  { icon: Code, title: 'Code', action: () => editor.value?.chain().focus().toggleCode().run() },
  { icon: Quote, title: 'Quote', action: () => editor.value?.chain().focus().toggleBlockquote().run() }
]

const addImage = () => {
 const url = prompt('Enter Image URL:')
  if (url) {
    editor.value?.chain().focus().setImage({ src: url }).run()
  }
}

const addLink = () => {
  const url = prompt('Enter URL:')
  if (url) {
    editor.value?.chain().focus().setLink({ href: url, target: '_blank', rel: 'noopener noreferrer' }).run()
  }
}


const addYoutubeVideo = () => {
  const url = prompt('Enter YouTube URL:')
  if (url) {
    editor.value?.chain().focus().setYoutubeVideo({ src: url }).run()
  }
}
</script>

<template>
  <div class="border rounded-lg shadow-sm bg-card">
    <!-- Status Bar -->
    <div class="flex items-center justify-between px-4 py-2 border-b bg-muted/50">
      <div class="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock class="h-4 w-4" :class="{ 'animate-spin': isSaving }" />
        <span>{{ saveStatus }}</span>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/50">
      <button
        v-for="item in toolbar"
        :key="item.title"
        @click="item.action"
        class="p-2 rounded-lg hover:bg-accent transition-colors"
        :title="item.title"
      >
        <component :is="item.icon" class="h-4 w-4" />
      </button>

      <div class="h-4 w-px bg-border mx-2"></div>

      <button @click="addImage" class="p-2 rounded-lg hover:bg-accent transition-colors" title="Add Image">
        <ImageIcon class="h-4 w-4" />
      </button>
      <button @click="addLink" class="p-2 rounded-lg hover:bg-accent transition-colors" title="Add Link">
        <LinkIcon class="h-4 w-4" />
      </button>
      <button @click="addYoutubeVideo" class="p-2 rounded-lg hover:bg-accent transition-colors" title="Add YouTube Video">
        <YoutubeIcon class="h-4 w-4" />
      </button>
    </div>

    <!-- Editor Content -->
    <EditorContent 
      v-if="editor" 
      :editor="editor" 
      class="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none p-4" 
    />
    <p v-else class="text-center text-muted-foreground p-4">Loading editor...</p>
  </div>
</template>

<style>
.ProseMirror {
  outline: none;
  min-height: 300px;
}

.ProseMirror p.is-editor-empty:first-child::before {
  content: "Start typing...";
  float: left;
  color: #adb5bd;
  pointer-events: none;
  height: 0;
}

.editor-image {
  display: block;
  margin: 1rem auto;
  border-radius: 0.5rem;
  max-width: 100%;
  height: auto;
}

.ProseMirror table {
  border-collapse: collapse;
  margin: 0;
  overflow: hidden;
  table-layout: fixed;
  width: 100%;
}

.ProseMirror td,
.ProseMirror th {
  border: 2px solid #ced4da;
  box-sizing: border-box;
  min-width: 1em;
  padding: 3px 5px;
  position: relative;
  vertical-align: top;
}

.ProseMirror th {
  background-color: #f8f9fa;
  font-weight: bold;
  text-align: left;
}

.ProseMirror .selectedCell:after {
  background: rgba(200, 200, 255, 0.4);
  content: "";
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  pointer-events: none;
  position: absolute;
  z-index: 2;
}

.prose {
  max-width: none;
}

.prose img {
  margin: 1rem auto;
}

.prose iframe {
  margin: 1rem auto;
  border-radius: 0.5rem;
}
</style>