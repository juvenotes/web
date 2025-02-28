<script setup lang="ts">
import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { Link } from '@tiptap/extension-link'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import { Image } from '@tiptap/extension-image' // Add this
import { Youtube } from '@tiptap/extension-youtube' // Add this
import { Markdown } from 'tiptap-markdown'
import {
  List,
  ListOrdered,
  Bold,
  Italic,
  Link as LinkIcon,
  Table as TableIcon,
  ImageIcon, // Add this
  Youtube as YoutubeIcon, // Add this
  Loader2, // Add this for loading icon
} from 'lucide-vue-next'
import { onMounted, onUnmounted, ref } from 'vue'
import axios from 'axios' // Add this for image upload

const isTableMenuOpen = ref(false)
const isUploading = ref(false) // Add this for tracking upload state

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

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits(['update:modelValue'])

// Add image upload handler
const handleFileUpload = async (file: File) => {
  isUploading.value = true

  try {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('context[folder]', 'knowledge')
    formData.append('context[subFolder]', 'explanation')

    const { data } = await axios.post('/api/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return data
  } catch (error) {
    console.error('Upload failed:', error)
    return null
  } finally {
    isUploading.value = false
  }
}

// Add image adding function
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

// Add YouTube function
const addYoutubeVideo = () => {
  const url = prompt('Enter YouTube URL:')
  if (url) {
    editor.value?.chain().focus().setYoutubeVideo({ src: url }).run()
  }
}

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Link.configure({
      openOnClick: true,
      HTMLAttributes: {
        target: '_blank',
        rel: 'noopener noreferrer',
      },
    }),
    Markdown.configure({
      html: true,
      tightLists: true,
      bulletListMarker: '-',
    }),
    Table.configure({
      resizable: true,
    }),
    TableRow,
    TableHeader,
    TableCell,
    // Add these new extensions
    Image.configure({
      HTMLAttributes: {
        class: 'editor-image',
        width: '640px',
        height: 'auto',
      },
      allowBase64: true,
      inline: false,
    } as any),
    Youtube.configure({ width: 640, height: 360 }),
  ],
  editorProps: {
    attributes: {
      class: 'prose prose-sm max-w-none min-h-[100px] focus:outline-none',
    },
  },
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.storage.markdown.getMarkdown())
  },
})

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
  },
  {
    icon: Italic,
    title: 'Italic',
    action: () => editor.value?.chain().focus().toggleItalic().run(),
  },
  {
    icon: List,
    title: 'Bullet List',
    action: () => editor.value?.chain().focus().toggleBulletList().run(),
  },
  {
    icon: ListOrdered,
    title: 'Numbered List',
    action: () => editor.value?.chain().focus().toggleOrderedList().run(),
  },
  {
    icon: LinkIcon,
    title: 'Add Link',
    action: addLink,
  },
  {
    icon: ImageIcon,
    title: 'Add Image',
    action: addImage,
  },
  {
    icon: YoutubeIcon,
    title: 'Add YouTube Video',
    action: addYoutubeVideo,
  },
]
</script>

<template>
  <div class="border rounded-lg">
    <!-- Toolbar with status indicator -->
    <div class="flex items-center justify-between px-2 py-1 border-b bg-muted/50">
      <div class="flex items-center gap-1">
        <button
          v-for="item in toolbar"
          :key="item.title"
          type="button"
          @click="item.action"
          class="p-1.5 rounded-lg hover:bg-accent transition-colors"
          :title="item.title"
        >
          <component :is="item.icon" class="h-4 w-4" />
        </button>

        <div class="h-4 w-px bg-border mx-2"></div>
        <div class="relative group table-menu">
          <button
            type="button"
            class="p-1.5 rounded-lg hover:bg-accent transition-colors"
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
      </div>
      
      <!-- Upload Status Indicator -->
      <div v-if="isUploading" class="flex items-center gap-2 text-xs text-muted-foreground px-2">
        <Loader2 class="h-3 w-3 animate-spin" />
        <span>Uploading image...</span>
      </div>
    </div>

    <!-- Bubble Menu for text selection -->
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
          @click="addLink"
          :class="{ 'bg-accent': editor.isActive('link') }"
          class="p-1.5 rounded hover:bg-muted transition-colors"
          title="Add Link"
        >
          <LinkIcon class="h-4 w-4" />
        </button>
      </div>
    </BubbleMenu>

    <!-- Floating Menu for empty paragraphs -->
    <FloatingMenu
      :editor="editor"
      :shouldShow="
        ({ editor, state }) => {
          const isImage = editor.isActive('image')
          const { from } = state.selection
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
          @click="editor.chain().focus().toggleBulletList().run()"
          :class="{ 'bg-accent': editor.isActive('bulletList') }"
          class="p-1.5 rounded hover:bg-muted text-sm flex items-center transition-colors"
        >
          <List class="h-4 w-4" />
        </button>
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
    <EditorContent :editor="editor" class="p-3" />
  </div>
</template>
<style>
.ProseMirror {
  > * + * {
    margin-top: 0.75em;
  }
  
  /* Add these new styles for image support */
  .editor-image {
    display: block;
    margin: 1rem auto;
    border-radius: 0.5rem;
    max-width: 100%;
    height: auto;
  }
  
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
  
  /* Selected image styling */
  img.ProseMirror-selectednode {
    outline: 2px solid #3b82f6;
    border-radius: 0.5rem;
  }
  
  img:hover {
    cursor: pointer;
  }

  /* Rest of your existing styles... */
  table {
    border-collapse: collapse;
    margin: 0;
    overflow: hidden;
    table-layout: fixed;
    width: 100%;
    margin: 1rem 0;
    font-size: 0.95em;

    td,
    th {
      border: 2px solid hsl(var(--border));
      box-sizing: border-box;
      min-width: 1em;
      padding: 0.8em;
      position: relative;
      vertical-align: top;
      text-align: left;

      > * {
        margin-bottom: 0;
      }
    }

    th {
      background-color: hsl(var(--muted));
      font-weight: 600;
    }

    tr:nth-child(even) {
      background: hsl(var(--muted) / 0.2);
    }

    tr:hover {
      background: hsl(var(--accent));
    }
  }
  
  /* Add this for links */
  a {
    color: #3b82f6;
    text-decoration: underline;
  }
  
  a:hover {
    color: #2563eb;
  }
}

/* Add keyframe animation for loading state */
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
</style>
