<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
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
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .process(props.content)

  html.value = String(result)
})
</script>
<template>
  <div
    class="prose dark:prose-invert max-w-none notion-like prose-headings:font-medium prose-headings:text-foreground/90 prose-p:text-muted-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground/90 prose-code:text-primary/90 prose-code:bg-primary/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-white/10"
    v-html="html"
  />
</template>

<style>
.notion-like {
  /* Base styles */
  --notion-spacing: 1.5em;
  --notion-font: 'Inter', system-ui, -apple-system, sans-serif;
  --notion-transition: all 0.2s ease;
  font-family: var(--notion-font);
  line-height: 1.8;

  /* Block spacing */
  & > * + * {
    margin-top: var(--notion-spacing);
  }

  /* Headings */
  & h1,
  & h2,
  & h3,
  & h4 {
    font-weight: 600;
    line-height: 1.3;
    margin-top: calc(var(--notion-spacing) * 2);
    margin-bottom: calc(var(--notion-spacing) * 0.5);
    transition: var(--notion-transition);

    &:hover {
      color: hsl(var(--primary));
      transform: translateX(4px);
    }
  }

  & h1 {
    font-size: 2.5em;
  }
  & h2 {
    font-size: 1.75em;
  }
  & h3 {
    font-size: 1.35em;
  }

  /* Lists */
  & ul,
  & ol {
    padding-left: 1.5em;
    margin: var(--notion-spacing) 0;
  }

  & li {
    margin: calc(var(--notion-spacing) * 0.3) 0;
    transition: var(--notion-transition);
    padding-left: 0.5em;
    position: relative;

    &:hover {
      transform: translateX(4px);
      color: hsl(var(--foreground));
    }

    &::before {
      content: '';
      position: absolute;
      left: -1em;
      top: 0.7em;
      width: 4px;
      height: 4px;
      background: hsl(var(--primary));
      border-radius: 50%;
      opacity: 0.7;
    }
  }

  /* Blockquotes */
  & blockquote {
    border-left: 3px solid hsl(var(--primary));
    padding: 1em 1.2em;
    background: hsl(var(--primary) / 0.05);
    border-radius: 0.8em;
    margin: var(--notion-spacing) 0;
    transition: var(--notion-transition);

    &:hover {
      background: hsl(var(--primary) / 0.08);
      transform: translateX(4px);
    }
  }

  /* Code blocks */
  & pre {
    padding: 1.2em;
    border-radius: 1em;
    margin: var(--notion-spacing) 0;
    font-size: 0.95em;
    transition: var(--notion-transition);
    border: 1px solid hsl(var(--border));

    &:hover {
      border-color: hsl(var(--primary) / 0.3);
      box-shadow: 0 4px 20px -4px hsl(var(--primary) / 0.1);
    }
  }

  /* Links */
  & a {
    position: relative;
    text-decoration: none;
    color: hsl(var(--primary));
    transition: var(--notion-transition);

    &::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 100%;
      height: 1px;
      background: currentColor;
      transform: scaleX(0);
      transition: transform 0.2s ease;
    }

    &:hover::after {
      transform: scaleX(1);
    }
  }

  /* Images */
  & img {
    border-radius: 1em;
    margin: var(--notion-spacing) 0;
    transition: var(--notion-transition);
    border: 1px solid transparent;

    &:hover {
      transform: scale(1.01);
      border-color: hsl(var(--primary) / 0.2);
      box-shadow: 0 4px 20px -4px hsl(var(--primary) / 0.15);
    }
  }
}
</style>
