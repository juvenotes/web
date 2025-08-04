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
  <div
    class="markdown-content prose prose-sm dark:prose-invert dark:text-foreground max-w-none"
    v-html="html"
  />
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
    margin: 1rem auto;
    border-radius: 0.5rem;
  }

  :deep(iframe[src*='youtube.com']) {
    max-width: 100%;
    width: 640px;
    height: 360px;
    margin: 1rem auto;
    display: block;
    border-radius: 0.5rem;
  }

  /* Dark Mode Enhancements */
  :deep(a) {
    color: hsl(var(--primary));
    text-decoration: underline;
    transition: color 0.2s ease;
  }

  :deep(a:hover) {
    color: hsl(var(--primary) / 0.8);
  }

  :deep(pre) {
    background: hsl(var(--muted) / 0.5);
    border-radius: 0.5rem;
    padding: 1rem;
    overflow-x: auto;
  }

  :deep(code) {
    background: hsl(var(--primary) / 0.1);
    border-radius: 0.25rem;
    padding: 0.2rem 0.4rem;
    font-family: monospace;
  }

  :deep(blockquote) {
    border-left: 4px solid hsl(var(--primary));
    padding-left: 1rem;
    font-style: italic;
    margin-left: 0;
    margin-right: 0;
  }

  :deep(hr) {
    border-color: hsl(var(--border));
    margin: 2rem 0;
  }

  :deep(table) {
    border-collapse: collapse;
    width: 100%;
    margin: 1rem 0;
  }

  :deep(th, td) {
    border: 1px solid hsl(var(--border));
    padding: 0.5rem;
    text-align: left;
  }

  :deep(th) {
    background: hsl(var(--muted) / 0.5);
  }

  :deep(tr:nth-child(even)) {
    background: hsl(var(--muted) / 0.2);
  }
}
</style>
