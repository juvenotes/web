<template>
  <div class="bg-background text-foreground font-sans min-h-screen">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 sm:space-y-10">
      <!-- Enhanced Header Section -->
      <div
        class="relative overflow-hidden p-6 sm:p-8 bg-card rounded-xl sm:rounded-2xl border border-border shadow-sm"
      >
        <!-- Theme color gradient accent -->
        <div
          class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#55A9C4]/80 to-[#55A9C4]/10"
        ></div>

        <div class="flex flex-col sm:flex-row gap-6 sm:items-center justify-between">
          <div class="flex items-center gap-4 sm:gap-5">
            <div
              class="p-3 rounded-lg sm:rounded-xl bg-[#55A9C4]/10 border border-[#55A9C4]/20 shrink-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 sm:h-7 sm:w-7 text-[#55A9C4]"
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
              <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
                {{ props.article?.article_name }}
              </h1>
              <p class="text-sm sm:text-base text-muted-foreground">Medical Library Article</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Breadcrumb Navigation -->
      <div class="bg-muted/50 rounded-lg p-4 border border-border">
        <BreadcrumbTrail :items="breadcrumbItems" />
      </div>

      <!-- Main Content Grid -->
      <div class="lg:grid lg:grid-cols-12 lg:gap-8">
        <!-- Table of Contents (Desktop) -->
        <aside
          class="hidden lg:block lg:col-span-3 sticky top-24 self-start max-h-[calc(100vh-140px)] overflow-y-auto toc-scrollbar"
        >
          <div class="p-4 bg-muted/50 rounded-lg border border-border">
            <h2 class="text-base font-semibold mb-3 pb-2 border-b border-border text-foreground">
              On this page
            </h2>
            <nav class="space-y-1.5">
              <a
                v-for="header in headers"
                :key="header.id"
                :href="`#${header.id}`"
                class="block py-1.5 px-3 text-sm transition-colors duration-200 rounded-md font-medium"
                :class="
                  activeHeaderId === header.id
                    ? 'bg-[#55A9C4]/10 text-[#55A9C4]'
                    : 'text-foreground/90 hover:bg-[#55A9C4]/5 hover:text-[#55A9C4]'
                "
                :style="{ paddingLeft: `${header.level === 1 ? 0.75 : 1.75}rem` }"
              >
                {{ header.name }}
              </a>
            </nav>
          </div>
        </aside>

        <!-- Article Content -->
        <article class="lg:col-span-9">
          <!-- Table of Contents (Mobile) -->
          <details class="lg:hidden bg-muted/50 p-4 rounded-lg mb-6 border border-border">
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
                class="details-arrow transition-transform duration-200"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </summary>
            <nav class="mt-3 pt-3 border-t border-border space-y-1.5">
              <a
                v-for="header in headers"
                :key="header.id"
                :href="`#${header.id}`"
                class="block py-1.5 px-3 text-sm transition-colors duration-200 rounded-md font-medium"
                :class="
                  activeHeaderId === header.id
                    ? 'bg-[#55A9C4]/10 text-[#55A9C4]'
                    : 'text-foreground/90 hover:bg-[#55A9C4]/5 hover:text-[#55A9C4]'
                "
                :style="{ paddingLeft: `${header.level === 1 ? 0.75 : 1.75}rem` }"
              >
                {{ header.name }}
              </a>
            </nav>
          </details>

          <!-- Article Content -->
          <div
            data-allow-mismatch="true"
            class="prose prose-base sm:prose-lg dark:prose-invert max-w-none font-sans prose-medical"
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

          <div
            v-else
            class="prose prose-base sm:prose-lg dark:prose-invert max-w-none font-sans prose-medical"
          >
            <p class="text-muted-foreground">No content available for this article.</p>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, type Ref } from 'vue'
import axios from 'axios' // Using axios for clean API requests
import BreadcrumbTrail from '../../components/BreadcrumbTrail.vue'

const props = defineProps({
  article: Object,
})

// Define breadcrumb items with Learn/Library/Article structure
const breadcrumbItems = computed(() => [
  { label: 'Library', href: '/library' },
  { label: props.article?.article_name || 'Article' },
])

interface Header {
  id: string
  name: string
  level: number
}

const activeHeaderId = ref<string | null>(null)
const headers: Header[] =
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
  const headerElements = headers
    .map((header) => {
      const el = document.getElementById(header.id)
      return el ? { id: header.id, offsetTop: el.offsetTop } : null
    })
    .filter(Boolean)
    .filter((el) => el!.offsetTop <= scrollOffset) as { id: string; offsetTop: number }[]

  activeHeaderId.value =
    headerElements.length > 0 ? headerElements[headerElements.length - 1].id : null
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
/* --- Scrollbar Styles --- */
.toc-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: hsl(var(--border)) transparent;
}
.toc-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.toc-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.toc-scrollbar::-webkit-scrollbar-thumb {
  background-color: hsl(var(--border));
  border-radius: 20px;
}

/* --- Details Arrow Animation --- */
details[open] .details-arrow {
  transform: rotate(180deg);
}

/* --- Prose Overrides --- */
.prose-medical {
  --tw-prose-body: hsl(var(--foreground));
  --tw-prose-headings: hsl(var(--foreground));
  --tw-prose-bold: hsl(var(--foreground));
  --tw-prose-links: #55a9c4;
  --tw-prose-invert-body: hsl(var(--foreground));
  --tw-prose-invert-headings: hsl(var(--foreground));
  --tw-prose-invert-bold: hsl(var(--foreground));
  --tw-prose-invert-links: #55a9c4;
}

.prose-medical h1,
.prose-medical h2,
.prose-medical h3 {
  font-weight: 700;
  letter-spacing: -0.02em;
  scroll-margin-top: 100px;
}

/* --- Link Styles --- */
.prose-medical a {
  font-weight: 600;
  text-decoration: none;
  color: #55a9c4 !important;
  transition: background-color 0.2s ease;
  border-radius: 4px;
  padding: 1px 4px;
  margin: -1px -4px;
}

.prose-medical a:hover {
  background-color: rgba(85, 169, 196, 0.1);
}

/* --- Table Styles --- */
.prose-medical table {
  font-size: 0.9em;
  width: 100%;
}

.prose-medical th {
  background-color: hsl(var(--muted));
  font-weight: 600;
  padding: 0.75rem 1rem;
  text-align: left;
}

.prose-medical td {
  padding: 0.75rem 1rem;
  border-top: 1px solid hsl(var(--border));
}

.prose-medical tr:last-child td {
  border-bottom: 1px solid hsl(var(--border));
}

/* --- Responsive Adjustments --- */
@media (max-width: 768px) {
  .prose-medical {
    font-size: 1rem;
    line-height: 1.75;
  }

  .prose-medical h1 {
    font-size: 1.8em;
  }

  .prose-medical h2 {
    font-size: 1.5em;
  }

  .prose-medical table {
    font-size: 0.85em;
  }
}

@media (max-width: 640px) {
  .prose-medical {
    font-size: 0.95rem;
  }

  .prose-medical h1 {
    font-size: 1.6em;
  }

  .prose-medical h2 {
    font-size: 1.35em;
  }

  .prose-medical table {
    display: block;
    overflow-x: auto;
  }
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
