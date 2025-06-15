<template>
  <div class="bg-background text-foreground font-sans">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <!-- Header Section -->
      <!-- FIX: Added `overflow-hidden` to contain the absolute child -->
      <div
        class="relative overflow-hidden p-6 sm:p-8 bg-card rounded-2xl border border-border shadow-md"
      >
        <!-- FIX: Refined the gradient line to be a subtle, cleaner accent -->
        <div
          class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-primary/20"
        ></div>
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
                {{ props.article?.article_name }}
              </h1>
              <p class="text-base text-muted-foreground">Medical Library Article</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Rest of your template remains the same... -->
      <div class="lg:grid lg:grid-cols-12 lg:gap-12">
        <aside
          class="hidden lg:block lg:col-span-3 sticky top-24 self-start max-h-[calc(100vh-140px)] overflow-y-auto toc-scrollbar"
        >
          <div class="p-4 bg-muted/50 rounded-lg border border-border">
            <h2 class="text-base font-semibold mb-3 pb-2 border-b border-border text-foreground">
              On this page
            </h2>
            <nav class="space-y-0.5">
              <a
                v-for="header in headers"
                :key="header.id"
                :href="`#${header.id}`"
                class="block py-1 px-2.5 text-sm transition-colors duration-200 rounded-md font-medium"
                :class="
                  activeHeaderId === header.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground/90 hover:bg-primary/5 hover:text-primary'
                "
                :style="{ paddingLeft: `${header.level === 1 ? 0.625 : 1.5}rem` }"
              >
                {{ header.name }}
              </a>
            </nav>
          </div>
        </aside>

        <article class="lg:col-span-9">
          <details class="lg:hidden bg-muted/50 p-4 rounded-lg mb-8 border border-border">
            <summary
              class="text-base font-semibold cursor-pointer list-none flex justify-between items-center text-foreground"
            >
              On this page
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="details-arrow"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </summary>
            <nav class="mt-3 pt-3 border-t border-border space-y-0.5">
              <a
                v-for="header in headers"
                :key="header.id"
                :href="`#${header.id}`"
                class="block py-1 px-2.5 text-sm transition-colors duration-200 rounded-md font-medium"
                :class="
                  activeHeaderId === header.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground/90 hover:bg-primary/5 hover:text-primary'
                "
                :style="{ paddingLeft: `${header.level === 1 ? 0.625 : 1.5}rem` }"
              >
                {{ header.name }}
              </a>
            </nav>
          </details>
          <!-- property hydration fix, ssr access content using snake_case, while client-side uses camelCase -->
          <div
            data-allow-mismatch="true"
            class="prose prose-lg dark:prose-invert max-w-none font-sans prose-medical"
            v-if="
              props.article?.fullDataContent?.content || props.article?.full_data_content?.content
            "
            v-html="
              props.article?.fullDataContent?.content || props.article?.full_data_content?.content
            "
            @click="handleContentClick"
          ></div>

          <!-- Modal/Lightbox for displaying the image -->
          <div v-if="lightboxImageUrl" class="lightbox" @click.self="closeLightbox">
            <!-- The .self modifier on the click event ensures this only triggers
           when clicking the dark background, not the image or button. -->

            <!-- Close button in the corner -->
            <button class="close-button" @click="closeLightbox">×</button>
            <img :src="lightboxImageUrl" alt="Hint media" />
          </div>

          <div v-else class="prose prose-lg dark:prose-invert max-w-none font-sans prose-medical">
            <p>No content available for this article.</p>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import axios from 'axios' // Using axios for clean API requests

const props = defineProps({
  article: Object,
})
import type { Ref } from 'vue'
const activeHeaderId: Ref<string | null> = ref(null)
const headers =
  props.article?.fullDataContent?.headers || props.article?.full_data_content?.headers || []

function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<F>): void => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), waitFor)
  }
}

function handleScroll() {
  const scrollOffset = window.scrollY + 100

  interface HeaderElement {
    id: string
    name: string
    level: number
  }

  interface VisibleHeader extends HTMLElement {
    id: string
    offsetTop: number
  }

  interface HeaderElement {
    id: string
    name: string
    level: number
  }

  interface VisibleHeader extends HTMLElement {
    id: string
    offsetTop: number
  }

  const visibleHeaders: VisibleHeader[] = headers
    .map((h: HeaderElement): VisibleHeader | null => {
      const el: HTMLElement | null = document.getElementById(h.id)
      return el && 'offsetTop' in el ? (el as VisibleHeader) : null
    })
    .filter(
      (el: VisibleHeader | null): el is VisibleHeader => el !== null && el.offsetTop <= scrollOffset
    )
  if (visibleHeaders.length > 0) {
    interface LastVisibleHeader extends HTMLElement {
      id: string
    }
    activeHeaderId.value = (visibleHeaders[visibleHeaders.length - 1] as LastVisibleHeader).id
  } else {
    activeHeaderId.value = null
  }
}

const debouncedScrollHandler = debounce(handleScroll, 50)
onMounted(() => {
  window.addEventListener('scroll', debouncedScrollHandler)
  handleScroll()
})
onUnmounted(() => {
  window.removeEventListener('scroll', debouncedScrollHandler)
})

// images functionality
// A reactive ref to hold the URL for our lightbox
const lightboxImageUrl: Ref<string | null> = ref(null)

// The method that will handle all clicks inside the article content
interface HintLinkElement extends HTMLAnchorElement {
  dataset: {
    hintId: string
    [key: string]: string
  }
}

interface MediaApiResponse {
  url: string
}

const handleContentClick = async (event: MouseEvent): Promise<void> => {
  // Find the clicked link or its parent link with a 'data-hint-id'
  const link = (event.target as HTMLElement).closest('a[data-hint-id]') as HintLinkElement | null

  // If the click was not on one of our special links, do nothing.
  if (!link) {
    return
  }

  // Prevent the browser from trying to navigate
  event.preventDefault()

  const hintId: string = link.dataset.hintId

  try {
    // Make an API call to our new AdonisJS endpoint
    const response = await axios.get<MediaApiResponse>(`/media/${hintId}`)

    // Set the reactive ref to the URL from the API response
    // This will cause the lightbox to appear
    lightboxImageUrl.value = response.data.url
  } catch (error: any) {
    // Handle errors (e.g., 404 Not Found)
    if (error.response && error.response.status === 404) {
      console.warn(`Media not found for hint: ${hintId}`)
      // Optionally, show a "not found" toast notification to the user
    } else {
      console.error('An error occurred while fetching media:', error)
    }
  }
}

// A simple method to close the lightbox
const closeLightbox = () => {
  lightboxImageUrl.value = null
}
</script>

<style>
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
  /* Dark mode overrides */
  --tw-prose-invert-body: #e7e5e4;
  --tw-prose-invert-headings: #ffffff;
  --tw-prose-invert-bold: #ffffff;
}

/* --- Readable Headings --- */
.prose-medical h1,
.prose-medical h2,
.prose-medical h3 {
  font-weight: 700 !important;
  letter-spacing: -0.02em;
  scroll-margin-top: 80px;
}

/* --- Appealing TEAL `<a>` Tags with NO Underline --- */
.prose-medical a {
  font-weight: 600 !important;
  text-decoration: none !important;
  color: #0d9488 !important;
  transition: background-color 0.2s ease-in-out;
  /* FIX: Increased border-radius for a more rounded hover effect */
  border-radius: 6px;
  padding: 2px 5px;
  margin: -2px -5px;
}

/* On hover, add a very light teal background for interaction feedback */
.prose-medical a:hover {
  background-color: #ccfbf1; /* A very light teal */
  text-decoration: none !important;
}

.prose-medical a code {
  color: inherit !important;
}

/* --- Cleaner Tables --- */
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

/* image functionality css */
/* A very basic lightbox style */
.lightbox {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  cursor: pointer;
}

.lightbox img {
  max-width: 90%;
  max-height: 90%;
  border-radius: 4px;
}

/* --- NEW: Close button styles --- */
.close-button {
  position: absolute;
  top: 20px;
  right: 30px;

  /* Styling the button */
  background: none;
  border: none;
  color: white;
  font-size: 40px; /* Makes the '×' bigger */
  font-weight: bold;
  line-height: 1;
  cursor: pointer;

  /* Improve accessibility and appearance */
  padding: 0;
  text-shadow: 0 1px 0 #000;
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

.close-button:hover {
  opacity: 1;
}
</style>
