<script setup lang="ts">
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeRaw from 'rehype-raw' 
import rehypeStringify from 'rehype-stringify'
import { ref, watchEffect } from 'vue'

const props = defineProps<{
  content: string
}>()

const html = ref('')

watchEffect(async () => {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw) 
    .use(rehypeStringify)
    .process(props.content)

  html.value = String(result)
})
</script>

<template>
  <div class="markdown-content prose prose-sm max-w-none" v-html="html" />
</template>

<style scoped>
.markdown-content {
  /* Existing styles */
  :deep(ul) {
    list-style-type: disc;
    margin-left: 1.5rem;
  }

  :deep(ol) {
    list-style-type: decimal;
    margin-left: 1.5rem;
  }

  /* Add these styles for images and YouTube embeds */
  :deep(img) {
    display: block;
    max-width: 640px; /* Match YouTube width */
    width: 100%;
    height: auto;
    margin: 1.5rem auto;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  :deep(iframe) {
    display: block;
    max-width: 640px;
    width: 100%;
    height: auto;
    margin: 1.5rem auto;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  /* Link styles */
  :deep(a) {
    color: #3b82f6;
    text-decoration: underline;
    text-underline-offset: 0.2em;
    transition: color 0.2s ease-in-out;

    &:hover {
      color: #2563eb;
    }
  }

  /* Tables */
  :deep(table) {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    margin: 1rem 0;
    font-size: 0.95em;
    border: 2px solid hsl(var(--border));
    border-radius: 0.5rem;
    overflow: hidden;
    display: block;
    max-width: 100%;
    overflow-x: auto;
  }

  :deep(th),
  :deep(td) {
    border: 1px solid hsl(var(--border));
    padding: 0.8em;
    text-align: left;
    position: relative;
  }

  :deep(th) {
    background-color: hsl(var(--muted));
    font-weight: 600;
  }

  :deep(tr:nth-child(even)) {
    background: hsl(var(--muted) / 0.2);
  }
}
</style>
