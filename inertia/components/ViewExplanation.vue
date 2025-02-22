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
  <div 
    class="markdown-content prose prose-sm max-w-none"
    v-html="html"
  />
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
}
</style>