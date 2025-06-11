<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { RawArticleRow, Header } from '../../../app/types/medical_article'

const props = defineProps<{ article: RawArticleRow }>()

const activeHeaderId = ref<string | null>(null)
const headers = props.article.full_data_content.headers || []

function handleScroll() {
  const headerElements = headers
    .map((h: Header) => document.getElementById(h.id))
    .filter(Boolean) as HTMLElement[]
  for (const element of headerElements) {
    const rect = element.getBoundingClientRect()
    if (rect.top <= 150) {
      activeHeaderId.value = element.id
    }
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  handleScroll()
})
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style>
/* Custom Tailwind Typography overrides for a medical library look */
.prose-medical {
  @apply prose prose-lg dark:prose-invert max-w-none font-sans text-gray-800;
}
.prose-medical h1,
.prose-medical h2,
.prose-medical h3,
.prose-medical h4 {
  font-weight: 500 !important;
  color: #1e293b !important; /* slate-800 */
  margin-top: 1.2em !important;
  margin-bottom: 0.4em !important;
  letter-spacing: -0.01em;
}
.prose-medical h1 {
  font-size: 2.1em !important;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 0.2em;
}
.prose-medical h2 {
  font-size: 1.5em !important;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 0.1em;
}
.prose-medical h3 {
  font-size: 1.2em !important;
}
.prose-medical p,
.prose-medical ul,
.prose-medical ol {
  margin-top: 0.3em !important;
  margin-bottom: 0.3em !important;
  line-height: 1.7 !important;
}
.prose-medical p {
  color: #000 !important;
}
.prose-medical ul,
.prose-medical ol {
  padding-left: 1.2em !important;
}
.prose-medical li {
  margin-bottom: 0.1em !important;
}
.prose-medical strong {
  font-weight: 500 !important;
}
.prose-medical code {
  background: #f1f5f9;
  color: #334155;
  padding: 0.15em 0.3em;
  border-radius: 0.3em;
  font-size: 0.95em;
}
.prose-medical blockquote {
  border-left: 3px solid #55a9c4;
  background: #f8fafc;
  color: #334155;
  font-style: italic;
  padding: 0.7em 1em;
  margin: 1em 0;
}
.prose-medical table {
  font-size: 0.98em;
}
</style>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="lg:flex lg:gap-8">
      <!-- Table of Contents - Desktop -->
      <aside
        class="hidden lg:block sticky top-24 self-start w-64 h-fit max-h-[calc(100vh-120px)] overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-6"
      >
        <h2 class="text-lg font-medium mb-3 pb-2 border-b">Contents</h2>
        <nav class="space-y-1">
          <a
            v-for="header in headers"
            :key="header.id"
            :href="`#${header.id}`"
            class="block py-1 px-2 text-sm transition-colors rounded"
            :class="
              activeHeaderId === header.id
                ? 'bg-primary/10 text-primary font-medium'
                : 'hover:bg-primary/5'
            "
            :style="{ paddingLeft: `${header.level === 1 ? 0.5 : 1.5}rem` }"
          >
            {{ header.name }}
          </a>
        </nav>
      </aside>

      <!-- Article content -->
      <article class="flex-1">
        <!-- Table of Contents - Mobile -->
        <details class="lg:hidden bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-6">
          <summary class="text-lg font-medium cursor-pointer">Table of Contents</summary>
          <nav class="pt-3 space-y-1">
            <a
              v-for="header in headers"
              :key="header.id"
              :href="`#${header.id}`"
              class="block py-1 px-2 text-sm transition-colors rounded"
              :class="
                activeHeaderId === header.id
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'hover:bg-primary/5'
              "
              :style="{ paddingLeft: `${header.level === 1 ? 0.5 : 1.5}rem` }"
            >
              {{ header.name }}
            </a>
          </nav>
        </details>

        <!-- Article title -->
        <h1 class="text-3xl font-bold mb-6">{{ props.article.article_name }}</h1>

        <!-- Article content using Tailwind Typography -->
        <div class="prose-medical" v-html="props.article.full_data_content.content" />
      </article>
    </div>
  </div>
</template>
