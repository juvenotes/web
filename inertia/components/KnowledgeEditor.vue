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
import { FileHandler } from '@tiptap-pro/extension-file-handler'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  ImageIcon,
  Link as LinkIcon,
  Youtube as YoutubeIcon,
  Table as TableIcon,
  Heading1,
  Heading2,
  Heading3,
  Clock,
} from 'lucide-vue-next'
import debounce from 'lodash/debounce'
import { ref, computed, onUnmounted, onMounted } from 'vue'

const props = defineProps<{
  modelValue: string
  metadata?: any
}>()

const emit = defineEmits(['update:modelValue', 'update:metadata'])

const AUTOSAVE_DELAY = 1000
const isSaving = ref(false)
const isUploading = ref(false)
const isTableMenuOpen = ref(false)

const closeTableMenu = (event: Event) => {
  if (!(event.target as HTMLElement).closest('.table-menu')) {
    isTableMenuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeTableMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', closeTableMenu)
})

const saveStatus = computed(() => {
  if (isSaving.value) return 'Saving...'
  return props.metadata?.lastEditedBy?.status === 'draft' ? 'Draft saved' : 'All changes saved'
})

const emitUpdate = debounce((markdown: string, status: 'draft' | 'edited' = 'draft') => {
  isSaving.value = true
  emit('update:modelValue', markdown)
  emit('update:metadata', {
    ...props.metadata,
    lastEditedBy: {
      fullName: props.metadata?.lastEditedBy?.fullName,
      timestamp: new Date(),
      status,
    },
  })
  setTimeout(() => {
    isSaving.value = false
  }, 500)
}, AUTOSAVE_DELAY)

const handleFileUpload = async (file: File) => {
  isUploading.value = true

  try {
    const formData = new FormData()
    formData.append('image', file)

    const response = await fetch('/api/upload-image', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'X-CSRF-TOKEN':
          document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
      },
      body: formData,
    })

    const text = await response.text()
    console.log('Raw response:', text)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    try {
      const data = JSON.parse(text)
      if (data.error) throw new Error(data.error)
      return data.url
    } catch (e) {
      console.error('JSON parse error:', e)
      throw e
    }
  } catch (error) {
    console.error('Upload failed:', error)
    return null
  } finally {
    isUploading.value = false
  }
}

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Markdown.configure({
      html: true,
      tightLists: true,
      bulletListMarker: '-',
      transformPastedText: true,
      linkify: false, 
    }),
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
      },
    }),
    Table.configure({ resizable: true }),
    TableRow,
    TableCell,
    TableHeader,
    Youtube.configure({ width: 640, height: 360 }),
    FileHandler.configure({
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      onDrop: async (editor, files, pos) => {
        console.info('File drop detected', {
          action: 'file_drop',
          fileCount: files.length,
          position: pos,
        })
        for (const file of files) {
          const url = await handleFileUpload(file)
          if (url) {
            console.info('Inserting dropped image', {
              action: 'insert_dropped_image',
              url,
            })
            editor.chain().focus().setTextSelection(pos).setImage({ src: url }).run()
          }
        }
      },
      onPaste: async (editor, files, _htmlContent) => {
        console.info('File paste detected', {
          action: 'file_paste',
          fileCount: files.length,
        })
        for (const file of files) {
          const url = await handleFileUpload(file)
          if (url) {
            console.info('Inserting pasted image', {
              action: 'insert_pasted_image',
              url,
            })
            editor.chain().focus().setImage({ src: url }).run()
          }
        }
      },
    }),
  ],
  onUpdate: ({ editor }) => {
    const markdown = editor.storage.markdown.getMarkdown()
    emitUpdate(markdown)
  },
})

const tableControls = [
  {
    title: 'Insert Table',
    action: () =>
      editor.value?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
  },
  {
    title: 'Add Column Before',
    action: () => editor.value?.chain().focus().addColumnBefore().run(),
  },
  {
    title: 'Add Column After',
    action: () => editor.value?.chain().focus().addColumnAfter().run(),
  },
  {
    title: 'Delete Column',
    action: () => editor.value?.chain().focus().deleteColumn().run(),
  },
  {
    title: 'Add Row Before',
    action: () => editor.value?.chain().focus().addRowBefore().run(),
  },
  {
    title: 'Add Row After',
    action: () => editor.value?.chain().focus().addRowAfter().run(),
  },
  {
    title: 'Delete Row',
    action: () => editor.value?.chain().focus().deleteRow().run(),
  },
  {
    title: 'Delete Table',
    action: () => editor.value?.chain().focus().deleteTable().run(),
  },
]

const toolbar = [
  {
    icon: Bold,
    title: 'Bold',
    action: () => editor.value?.chain().focus().toggleBold().run(),
    isActive: () => editor.value?.isActive('bold'),
  },
  {
    icon: Italic,
    title: 'Italic',
    action: () => editor.value?.chain().focus().toggleItalic().run(),
    isActive: () => editor.value?.isActive('italic'),
  },
  {
    icon: Heading1,
    title: 'Heading 1',
    action: () => editor.value?.chain().focus().toggleHeading({ level: 1 }).run(),
    isActive: () => editor.value?.isActive('heading', { level: 1 }),
  },
  {
    icon: Heading2,
    title: 'Heading 2',
    action: () => editor.value?.chain().focus().toggleHeading({ level: 2 }).run(),
    isActive: () => editor.value?.isActive('heading', { level: 2 }),
  },
  {
    icon: Heading3,
    title: 'Heading 3',
    action: () => editor.value?.chain().focus().toggleHeading({ level: 2 }).run(),
    isActive: () => editor.value?.isActive('heading', { level: 2 }),
  },
  {
    icon: Quote,
    title: 'Quote',
    action: () => editor.value?.chain().focus().toggleBlockquote().run(),
    isActive: () => editor.value?.isActive('bold'),
  },
  {
    icon: List,
    title: 'Bullet List',
    action: () => editor.value?.chain().focus().toggleBulletList().run(),
    isActive: () => editor.value?.isActive('bulletList'),
  },
  {
    icon: ListOrdered,
    title: 'Ordered List',
    action: () => editor.value?.chain().focus().toggleOrderedList().run(),
    isActive: () => editor.value?.isActive('bold'),
  },
]

const addImage = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'

  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return

    const url = await handleFileUpload(file)
    if (url) {
      editor.value?.chain().focus().setImage({ src: url }).run()
    }
  }

  input.click()
}

const addLink = () => {
  const url = prompt('Enter URL:')
  if (url) {
    editor.value
      ?.chain()
      .focus()
      .setLink({ href: url, target: '_blank', rel: 'noopener noreferrer' })
      .run()
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
        <Clock class="h-4 w-4" :class="{ 'animate-spin': isSaving || isUploading }" />
        <span>{{ isUploading ? 'Uploading image...' : saveStatus }}</span>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/50">
      <button
        v-for="item in toolbar"
        :key="item.title"
        type="button"
        @click="item.action"
        class="p-2 rounded-lg hover:bg-accent transition-colors"
        :title="item.title"
      >
        <component :is="item.icon" class="h-4 w-4" />
      </button>

      <div class="h-4 w-px bg-border mx-2"></div>
      <div class="relative group table-menu">
        <button
          type="button"
          class="p-2 rounded-lg hover:bg-accent transition-colors"
          title="Table Controls"
          @click.stop="isTableMenuOpen = !isTableMenuOpen"
        >
          <TableIcon class="h-4 w-4" />
        </button>
        <div
          v-show="isTableMenuOpen"
          class="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-card z-10"
        >
          <div class="py-1">
            <button
              v-for="control in tableControls"
              :key="control.title"
              @click="control.action"
              type="button"
              class="block px-4 py-2 text-sm w-full text-left hover:bg-accent"
            >
              {{ control.title }}
            </button>
          </div>
        </div>
      </div>
      <button
        @click="addImage"
        type="button"
        class="p-2 rounded-lg hover:bg-accent transition-colors"
        title="Add Image"
      >
        <ImageIcon class="h-4 w-4" />
      </button>
      <button
        @click="addLink"
        type="button"
        class="p-2 rounded-lg hover:bg-accent transition-colors"
        title="Add Link"
      >
        <LinkIcon class="h-4 w-4" />
      </button>
      <button
        @click="addYoutubeVideo"
        type="button"
        class="p-2 rounded-lg hover:bg-accent transition-colors"
        title="Add YouTube Video"
      >
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
  content: 'Start typing...';
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
  content: '';
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
.editor-image[data-uploading] {
  opacity: 0.5;
  cursor: wait;
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
  content: '';
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  pointer-events: none;
  position: absolute;
  z-index: 2;
}

.ProseMirror .column-resize-handle {
  background-color: #adb5bd;
  bottom: -2px;
  position: absolute;
  right: -2px;
  pointer-events: none;
  top: 0;
  width: 4px;
}

.ProseMirror.resize-cursor {
  cursor: ew-resize;
  cursor: col-resize;
}
</style>
