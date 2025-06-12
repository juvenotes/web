<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Header {
  id: string;
  name: string;
  level: number;
}

interface FullDataContent {
  content: string;
  headers: Header[];
}

interface RawArticleRow {
  article_name: string;
  full_data_content: FullDataContent;
}

const props = defineProps<{ article: RawArticleRow }>()

const activeHeaderId = ref<string | null>(null)
const headers = props.article.full_data_content.headers ?? []

/** Debounce utility with proper type safety */
function debounce<T extends (...args: any[]) => void>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: number | undefined
  return (...args: Parameters<T>) => {
    if (timeout !== undefined) {
      clearTimeout(timeout)
    }
    timeout = window.setTimeout(() => func(...args), wait)
  }
}

/** Scroll handler to track active heading */
function handleScroll() {
  const scrollOffset = window.scrollY + 100
  const visibleHeaders = headers
    .map(header => document.getElementById(header.id))
    .filter((el): el is HTMLElement => el !== null && el.offsetTop <= scrollOffset)

  activeHeaderId.value = visibleHeaders.length > 0 ? visibleHeaders[visibleHeaders.length - 1].id : null
}

const debouncedScrollHandler = debounce(handleScroll, 50)

onMounted(() => {
  window.addEventListener('scroll', debouncedScrollHandler)
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', debouncedScrollHandler)
})
</script>

<template>
  <div class="bg-background text-foreground font-sans">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <!-- Header Section -->
      <div class="relative p-6 sm:p-8 bg-card rounded-2xl border border-border shadow-md">
        <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/70 to-transparent rounded-t-2xl" />
        <div class="flex flex-col sm:flex-row gap-6 sm:items-center justify-between">
          <div class="flex items-center gap-5">
            <div class="p-3 rounded-xl bg-primary/10 border border-primary/20 shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-7 w-7 text-primary"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
            </div>
            <div class="space-y-1">
              <h1 class="text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
                {{ props.article.article_name }}
              </h1>
              <p class="text-base text-muted-foreground">Medical Library Article</p>
            </div>
          </div>
        </div>
      </div>

      <div class="lg:grid lg:grid-cols-12 lg:gap-12">
        <!-- Table of Contents - Desktop -->
        <aside class="hidden lg:block lg:col-span-3 sticky top-24 self-start max-h-[calc(100vh-140px)] overflow-y-auto toc-scrollbar">
          <div class="p-4 bg-muted/50 rounded-lg border border-border">
            <h2 class="text-base font-semibold mb-3 pb-2 border-b border-border text-foreground">On this page</h2>
            <nav class="space-y-0.5">
              <a
                v-for="header in headers"
                :key="header.id"
                :href="`#${header.id}`"
                class="block py-1 px-2.5 text-sm transition-colors duration-200 rounded-md font-medium"
                :class="activeHeaderId === header.id ? 'bg-primary/10 text-primary' : 'text-foreground/90 hover:bg-primary/5 hover:text-primary'"
                :style="{ paddingLeft: `${header.level === 1 ? 0.625 : 1.5}rem` }"
              >
                {{ header.name }}
              </a>
            </nav>
          </div>
        </aside>

        <!-- Article content and Mobile TOC -->
        <article class="lg:col-span-9">
          <!-- Table of Contents - Mobile -->
          <details class="lg:hidden bg-muted/50 p-4 rounded-lg mb-8 border border-border">
            <summary class="text-base font-semibold cursor-pointer list-none flex justify-between items-center text-foreground">
              On this page
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="details-arrow">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </summary>
            <nav class="mt-3 pt-3 border-t border-border space-y-0.5">
              <a
                v-for="header in headers"
                :key="header.id"
                :href="`#${header.id}`"
                class="block py-1 px-2.5 text-sm transition-colors duration-200 rounded-md font-medium"
                :class="activeHeaderId === header.id ? 'bg-primary/10 text-primary' : 'text-foreground/90 hover:bg-primary/5 hover:text-primary'"
                :style="{ paddingLeft: `${header.level === 1 ? 0.625 : 1.5}rem` }"
              >
                {{ header.name }}
              </a>
            </nav>
          </details>

          <!-- Article content -->
          <div
            data-allow-mismatch="true"
            class="prose prose-lg dark:prose-invert max-w-none font-sans prose-medical"
            v-html="props.article.full_data_content.content"
          />
        </article>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* --- General Scaffolding & Utility Styles --- */
.toc-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}
.toc-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.toc-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.toc-scrollbar::-webkit-scrollbar-thumb {
  background-color: var(--border);
  border-radius: 20px;
}
details[open] .details-arrow {
  transform: rotate(180deg);
}
.details-arrow {
  transition: transform 0.2s ease-in-out;
}

/* --- Tailwind Prose Overrides for the Article --- */
.prose-medical {
  --tw-prose-body: #0c0a09;
  --tw-prose-headings: #0c0a09;
  --tw-prose-bold: #0c0a09;
  --tw-prose-links: #0d9488;
  --tw-prose-invert-body: #e7e5e4;
  --tw-prose-invert-headings: #ffffff;
  --tw-prose-invert-bold: #ffffff;
}
.prose-medical h1,
.prose-medical h2,
.prose-medical h3 {
  font-weight: 700 !important;
  letter-spacing: -0.02em;
  scroll-margin-top: 80px;
}
.prose-medical a {
  font-weight: 600 !important;
  text-decoration: none !important;
  color: #0d9488 !important;
  transition: background-color 0.2s ease-in-out;
  border-radius: 6px;
  padding: 2px 5px;
  margin: -2px -5px;
}
.prose-medical a:hover {
  background-color: #ccfbf1;
  text-decoration: none !important;
}
.prose-medical a code {
  color: inherit !important;
}
.prose-medical table {
  font-size: 0.9em;
}
.prose-medical th {
  background-color: var(--muted);
  font-weight: 600;
  padding: 0.6rem 0.8rem;
}
.prose-medical td {
  padding: 0.6rem 0.8rem;
}
</style>
