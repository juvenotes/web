<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { Link } from '@tiptap/extension-link'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import { Markdown } from 'tiptap-markdown'
import {
  List,
  ListOrdered,
  Bold,
  Italic,
  Link as LinkIcon,
  Table as TableIcon,
} from 'lucide-vue-next'
import { onMounted, onUnmounted, ref } from 'vue'

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

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits(['update:modelValue'])

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

// const insertTable = () => {
//   editor.value?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
// }

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
  // {
  //   icon: TableIcon,
  //   title: 'Insert Table',
  //   action: insertTable,
  // },
]
</script>

<template>
  <div class="border rounded-lg">
    <!-- Toolbar -->
    <div class="flex items-center gap-1 p-1 border-b bg-muted/50">
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
    </div>

    <!-- Editor Content -->
    <EditorContent :editor="editor" class="p-3" />
  </div>
</template>
<style>
.ProseMirror {
  > * + * {
    margin-top: 0.75em;
  }

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

    .selectedCell:after {
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
  }
}
</style>
