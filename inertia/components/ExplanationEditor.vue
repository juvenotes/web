<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { Link } from '@tiptap/extension-link'
import { Markdown } from 'tiptap-markdown'
import { List, ListOrdered, Bold, Italic, Link as LinkIcon } from 'lucide-vue-next'

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
    </div>

    <!-- Editor Content -->
    <EditorContent :editor="editor" class="p-3" />
  </div>
</template>
