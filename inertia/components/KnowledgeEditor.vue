<script setup lang="ts">
import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/vue-3'
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
  Strikethrough,
} from 'lucide-vue-next'
import debounce from 'lodash/debounce'
import { ref, computed, onUnmounted, onMounted } from 'vue'
import axios from 'axios'

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
    formData.append('context[folder]', 'knowledge')
    formData.append('context[subFolder]', 'content')

    const { data } = await axios.post('/api/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    // The API returns the URL directly as data
    return data
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
        width: '640px',
        height: 'auto',
      },
      allowBase64: true,
      inline: false,
    } as any),
    Table.configure({ resizable: true }),
    TableRow,
    TableCell,
    TableHeader,
    Youtube.configure({ width: 640, height: 360 }),
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

    isUploading.value = true

    // Create a temporary object URL for immediate feedback
    const tempUrl = URL.createObjectURL(file)

    // Insert temporary image with loading attribute
    const tempImageTransaction = editor.value?.chain().focus()
      .setImage({ 
        src: tempUrl, 
        'data-loading': 'true'  // Add loading attribute
      } as any)
      .run()

    try {
      // Upload the real image in the background
      const url = await handleFileUpload(file)

      if (url && tempImageTransaction) {
        // Replace with the real image URL
        editor.value?.chain().focus().setImage({ 
          src: url, 
          alt: file.name,
          width: '640px', // Standard size matching YouTube
          height: 'auto'
        } as any).run()
      }
    } catch (error) {
      console.error('Error adding image:', error)
      if (tempImageTransaction) {
        editor.value?.chain().focus().deleteSelection().run()
      }
    } finally {
      URL.revokeObjectURL(tempUrl)
      isUploading.value = false
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

    <!-- Bubble-menu -->
    <!-- <BubbleMenu :editor="editor" v-if="editor">
      <div class="bubble-menu">
        <button
          type="button"
          @click="editor.chain().focus().toggleBold().run()"
          :class="{ 'is-active': editor.isActive('bold') }"
        >
          Bold
        </button>
        <button
          type="button"
          @click="editor.chain().focus().toggleItalic().run()"
          :class="{ 'is-active': editor.isActive('italic') }"
        >
          Italic
        </button>
        <button
          type="button"
          @click="editor.chain().focus().toggleStrike().run()"
          :class="{ 'is-active': editor.isActive('strike') }"
        >
          Strikethrough
        </button>
      </div>
    </BubbleMenu> -->

    <!-- Bubble-menu for text selection -->
    <BubbleMenu
      :editor="editor"
      :tippy-options="{ duration: 100 }"
      v-if="editor"
      :shouldShow="
        ({ editor }) => {
          return !editor.isActive('image') && editor.state.selection.content().size > 0
        }
      "
    >
      <div class="bubble-menu bg-white rounded-md shadow-md border flex p-1 gap-1">
        <button
          type="button"
          @click="editor.chain().focus().toggleBold().run()"
          :class="{ 'bg-accent': editor.isActive('bold') }"
          class="p-1.5 rounded hover:bg-muted transition-colors"
          title="Bold"
        >
          <Bold class="h-4 w-4" />
        </button>
        <button
          type="button"
          @click="editor.chain().focus().toggleItalic().run()"
          :class="{ 'bg-accent': editor.isActive('italic') }"
          class="p-1.5 rounded hover:bg-muted transition-colors"
          title="Italic"
        >
          <Italic class="h-4 w-4" />
        </button>
        <button
          type="button"
          @click="editor.chain().focus().toggleStrike().run()"
          :class="{ 'bg-accent': editor.isActive('strike') }"
          class="p-1.5 rounded hover:bg-muted transition-colors"
          title="Strike"
        >
          <Strikethrough class="h-4 w-4" />
        </button>
        <button
          type="button"
          @click="addLink"
          :class="{ 'bg-accent': editor.isActive('link') }"
          class="p-1.5 rounded hover:bg-muted transition-colors"
          title="Add Link"
        >
          <LinkIcon class="h-4 w-4" />
        </button>
      </div>
    </BubbleMenu>

    <!-- Floating menu -->
    <FloatingMenu
      :editor="editor"
      :shouldShow="
        ({ editor, state }) => {
          // Don't show floating menu when on an image node
          const isImage = editor.isActive('image')
          // Get cursor position from the selection
          const { from } = state.selection
          // Check if we're at an empty paragraph
          const isEmptyParagraph = !state.doc.textBetween(from, from + 1).length
          return !isImage && isEmptyParagraph
        }
      "
      :tippy-options="{
        duration: 100,
        placement: 'top-start',
        offset: [0, 8],
      }"
      v-if="editor"
    >
      <div class="floating-menu bg-white rounded-md shadow-md border flex p-1">
        <button
          type="button"
          @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
          :class="{ 'bg-accent': editor.isActive('heading', { level: 1 }) }"
          class="p-1.5 rounded hover:bg-muted text-sm font-medium transition-colors"
        >
          H1
        </button>
        <button
          type="button"
          @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
          :class="{ 'bg-accent': editor.isActive('heading', { level: 2 }) }"
          class="p-1.5 rounded hover:bg-muted text-sm font-medium transition-colors"
        >
          H2
        </button>
        <button
          type="button"
          @click="editor.chain().focus().toggleBulletList().run()"
          :class="{ 'bg-accent': editor.isActive('bulletList') }"
          class="p-1.5 rounded hover:bg-muted text-sm flex items-center transition-colors"
        >
          <List class="h-4 w-4" />
        </button>
        <!-- Add Image Button -->
        <button
          type="button"
          @click="addImage"
          class="p-1.5 rounded hover:bg-muted text-sm flex items-center transition-colors"
          title="Insert Image"
        >
          <ImageIcon class="h-4 w-4" />
        </button>
      </div>
    </FloatingMenu>

    <!-- Image-specific bubble menu -->
    <BubbleMenu
      :editor="editor"
      :tippy-options="{ duration: 100 }"
      v-if="editor"
      :shouldShow="({ editor }) => editor.isActive('image')"
    >
      <div class="image-bubble-menu bg-white rounded-md shadow-md border flex p-1 gap-1">
        <!-- <button
          type="button"
          @click="
            editor
              .chain()
              .focus()
              .updateAttributes('image', {
                width: '320px',
              } as any)
              .run()
          "
          class="p-1.5 rounded hover:bg-muted transition-colors"
          title="Small size"
        >
          Small
        </button>
        <button
          type="button"
          @click="
            editor
              .chain()
              .focus()
              .updateAttributes('image', {
                width: '480px',
              } as any)
              .run()
          "
          class="p-1.5 rounded hover:bg-muted transition-colors"
          title="Medium size"
        >
          Medium
        </button>
        <button
          type="button"
          @click="
            editor
              .chain()
              .focus()
              .updateAttributes('image', {
                width: '640px',
              } as any)
              .run()
          "
          class="p-1.5 rounded hover:bg-muted transition-colors"
          title="Full width"
        >
          Full
        </button> -->
        <button
          type="button"
          @click="editor.chain().focus().deleteSelection().run()"
          class="p-1.5 rounded hover:bg-destructive/20 text-destructive transition-colors"
          title="Delete image"
        >
          Remove
        </button>
      </div>
    </BubbleMenu>

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

/* Add these styles for links */
.ProseMirror a {
  color: #3b82f6;
  text-decoration: underline;
}

.prose a {
  color: #3b82f6;
  text-decoration: underline;
}

/* Optional: add hover effect */
.ProseMirror a:hover,
.prose a:hover {
  color: #2563eb;
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
/* .editor-image[data-uploading] {
  opacity: 0.5;
  cursor: wait;
} */
/* Add to your existing styles */
.editor-image[data-loading="true"] {
  position: relative;
  opacity: 0.7;
  animation: pulse 1.5s infinite;
  min-height: 200px;
  background-color: #f0f0f0;
  border-radius: 0.5rem;
}

.editor-image[data-loading="true"]::before {
  content: "Uploading...";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

@keyframes pulse {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    opacity: 0.6;
  }
}
/* Better styling for bubble and floating menus */
.bubble-menu,
.floating-menu,
.image-bubble-menu {
  z-index: 10;
}

/* Selected image styling */
.ProseMirror img.ProseMirror-selectednode {
  outline: 2px solid #3b82f6;
  border-radius: 0.5rem;
}

/* Add resize handles */
.ProseMirror img:hover {
  cursor: pointer;
}
</style>
