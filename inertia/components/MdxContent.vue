<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import rehypeRaw from 'rehype-raw'
import rehypeHighlight from 'rehype-highlight'
import remarkBreaks from 'remark-breaks'
import { unified } from 'unified'

const props = defineProps<{
  content: string
}>()

const html = ref('')

watchEffect(async () => {
  const result = await unified()
    .use(remarkParse)
    .use(remarkBreaks) // Preserve line breaks
    .use(remarkGfm, {
      singleTilde: false,
      tablePipeAlign: true,
      tableCellPadding: true
    })
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw) // Parse HTML in markdown
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .process(props.content)
  
  html.value = String(result)
})
</script>

<template>
  <div 
    class="prose dark:prose-invert max-w-none notion-like"
    v-html="html" 
  />
</template>

<style>
.notion-like {
  /* Notion-like spacing */
  --notion-spacing: 1em;
  
  & p {
    margin-bottom: var(--notion-spacing);
    white-space: pre-wrap;
  }
  
  & h1, & h2, & h3 {
    margin-top: 2em;
    margin-bottom: 1em;
  }
  
  & ul, & ol {
    padding-left: 1.5em;
    margin-bottom: var(--notion-spacing);
  }
}
</style>