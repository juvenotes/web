<script setup lang="ts">
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
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
  :deep(ul) {
    list-style-type: disc;
    margin-left: 1.5rem;
  }

  :deep(ol) {
    list-style-type: decimal;
    margin-left: 1.5rem;
  }

  :deep(li) {
    margin-bottom: 0.25rem;
  }

  :deep(a) {
    color: hsl(var(--primary));
    text-decoration: underline;
    text-underline-offset: 0.2em;
    transition: color 0.2s ease-in-out;

    &:hover {
      color: hsl(var(--primary) / 0.8);
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
  }

  :deep(th),
  :deep(td) {
    border: 1px solid hsl(var(--border));
    padding: 0.8em;
    text-align: left;
    position: relative;
  }

  :deep(th) {
    background: hsl(var(--muted));
    font-weight: 600;
    border-bottom: 2px solid hsl(var(--border));
  }

  :deep(tr:not(:last-child) td) {
    border-bottom: 1px solid hsl(var(--border));
  }

  :deep(td:not(:last-child)),
  :deep(th:not(:last-child)) {
    border-right: 1px solid hsl(var(--border));
  }

  :deep(tr:nth-child(even)) {
    background: hsl(var(--muted) / 0.2);
  }

  :deep(tr:hover) {
    background: hsl(var(--accent) / 0.1);
  }

  /* Table responsiveness */
  :deep(.table-wrapper) {
    overflow-x: auto;
    max-width: 100%;
    margin: 1rem 0;
    border-radius: 0.5rem;
  }
}
</style>
