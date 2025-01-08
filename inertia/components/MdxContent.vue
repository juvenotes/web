<script setup lang="ts">
import { computed } from 'vue'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import { unified } from 'unified'
import rehypeHighlight from 'rehype-highlight'

const props = defineProps<{
    content: string
}>()

const htmlContent = computed(async () => {
    const result = await unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(rehypeHighlight)
        .process(props.content)
    return String(result)
})
</script>

<template>
    <div class="prose dark:prose-invert max-w-none" v-html="htmlContent" />
</template>