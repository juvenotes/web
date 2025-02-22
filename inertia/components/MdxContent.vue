<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeRaw from 'rehype-raw'
import rehypeHighlight from 'rehype-highlight'
import rehypeStringify from 'rehype-stringify'

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
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .process(props.content)

  html.value = String(result)
})
</script>
<template>
  <div class="prose dark:prose-invert max-w-none notion-like" v-html="html" />
</template>

<style>
.notion-like {
  --notion-spacing: 1.75em;
  --notion-font: 'Inter', sans-serif;
  --notion-transition: all 0.2s ease-in-out;
  font-family: var(--notion-font);
  line-height: 1.9;
  font-size: 1.05em;

  /* Block spacing */
  & > * + * {
    margin-top: var(--notion-spacing);
  }

  /* Headings */
  & h1,
  & h2,
  & h3,
  & h4 {
    font-weight: 700;
    line-height: 1.3;
    transition: var(--notion-transition);
    position: relative;
    padding-bottom: 0.3em;
  }

  & h1 {
    font-size: 2.3em;
    border-bottom: 2px solid hsl(var(--primary) / 0.4);
  }
  & h2 {
    font-size: 1.8em;
    border-bottom: 1px solid hsl(var(--primary) / 0.3);
  }
  & h3 {
    font-size: 1.5em;
  }
  & h4 {
    font-size: 1.3em;
  }

  /* Lists */
  & ul,
  & ol {
    padding-left: 1.75em;
  }

  & li {
    margin: calc(var(--notion-spacing) * 0.4) 0;
    transition: var(--notion-transition);
    position: relative;
    padding-left: 0.6em;

    &::before {
      content: '•';
      position: absolute;
      left: -1em;
      font-size: 1.2em;
      color: hsl(var(--primary));
    }
  }

  /* Blockquotes */
  & blockquote {
    border-left: 4px solid hsl(var(--primary));
    padding: 1.2em;
    background: hsl(var(--primary) / 0.08);
    border-radius: 0.8em;
    font-style: italic;
    transition: var(--notion-transition);
  }

  /* Code Blocks */
  & pre {
    padding: 1.4em;
    border-radius: 1em;
    font-size: 1em;
    transition: var(--notion-transition);
    border: 1px solid hsl(var(--border));
    background: hsl(var(--muted) / 0.1);
    overflow-x: auto;
  }

  & code {
    font-family: 'Fira Code', monospace;
    padding: 0.2em 0.4em;
    border-radius: 5px;
    background: hsl(var(--primary) / 0.1);
    font-size: 0.95em;
  }

  /* Links */
  :deep(a:not([class])) {
    color: hsl(var(--primary));
    text-decoration: underline;
    text-decoration-thickness: 0.1em;
    text-underline-offset: 0.2em;
    transition: color 0.2s ease-in-out;
    font-weight: 500;

    &:hover {
      color: hsl(var(--primary) / 0.8);
    }
  }

  /* Images */
  & img {
    border-radius: 0.8em;
    margin: var(--notion-spacing) 0;
    transition: var(--notion-transition);
    box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.1);
  }

  /* Tables */
  & table {
    width: 100%;
    border-collapse: collapse;
    margin: var(--notion-spacing) 0;
    font-size: 0.95em;
  }

  & th,
  & td {
    border: 1px solid hsl(var(--border));
    padding: 0.8em;
    text-align: left;
  }

  & th {
    background: hsl(var(--muted));
    font-weight: 600;
  }

  & tr:nth-child(even) {
    background: hsl(var(--muted) / 0.2);
  }

  & tr:hover {
    background: hsl(var(--accent));
  }

   /* Make tables responsive */
   & .table-wrapper {
    overflow-x: auto;
    max-width: 100%;
  }
}
</style>
