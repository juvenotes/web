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

          <!-- NEW MODAL/LIGHTBOX FOR TABLES -->
          <div v-if="lightboxHtmlContent" class="table-lightbox" @click.self="closeLightbox">
            <!-- The 'ref' links this div to our 'tableLightboxContentRef' variable -->
            <div class="table-lightbox-content" ref="tableLightboxContentRef">
              <!-- NEW: Draggable Header / Handle -->
              <div
                class="drag-handle flex items-center justify-center !bg-gray-200"
                ref="tableDragHandleRef"
              >
                <span class="text-center">Table</span>
              </div>

              <!-- Close button inside the content box -->
              <button class="close-button-table" @click="closeLightbox">×</button>

              <!-- The main content area -->
              <div class="table-content-area !bg-gray-100">
                <div v-if="isLoadingMedia" class="loading-spinner">Loading Table...</div>
                <div v-else v-html="lightboxHtmlContent"></div>
              </div>
            </div>
          </div>

          <div
            v-else
            class="prose prose-base sm:prose-lg dark:prose-invert max-w-none font-sans prose-medical"
          >
            <p class="text-muted-foreground"></p>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, type Ref } from 'vue'
import axios from 'axios'
import BreadcrumbTrail from '../../components/BreadcrumbTrail.vue'

const props = defineProps({
  article: Object,
})

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

// --- (Keep your existing scroll and debounce logic here) ---
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
// --- (End of scroll logic) ---

// ================================================================
// === NEW AND UPDATED MEDIA HANDLING LOGIC =======================
// ================================================================

interface HintLinkElement extends HTMLAnchorElement {
  dataset: {
    hintId: string
    [key: string]: string
  }
}

interface MediaApiResponse {
  url: string // The URL from Cloudinary
}

// --- STATE MANAGEMENT ---
const lightboxImageUrl: Ref<string | null> = ref(null) // For images
const lightboxHtmlContent: Ref<string | null> = ref(null) // NEW: For HTML tables
const isLoadingMedia: Ref<boolean> = ref(false) // NEW: For loading feedback

// --- CLICK HANDLER (This is the main change) ---
const handleContentClick = async (event: MouseEvent): Promise<void> => {
  const link = (event.target as HTMLElement).closest('a[data-hint-id]') as HintLinkElement | null
  if (!link) return
  event.preventDefault()

  const hintId: string = link.dataset.hintId
  const isTableLink = !!link.querySelector('.article-icon-table') // Check if it's a table link

  // Reset state and show loading indicator
  isLoadingMedia.value = true
  lightboxImageUrl.value = null
  lightboxHtmlContent.value = null

  try {
    // Step 1: Get the Cloudinary URL from our own backend
    const response = await axios.get<MediaApiResponse>(`/media/${hintId}`)
    const cloudinaryUrl = response.data.url

    if (isTableLink) {
      // --- HANDLE TABLE ---
      // Step 2: Fetch the actual HTML content from Cloudinary
      const tableResponse = await axios.get<string>(cloudinaryUrl)

      // Put the fetched HTML string into our new state variable
      lightboxHtmlContent.value = tableResponse.data
    } else {
      // --- HANDLE IMAGE (Original logic) ---
      // For images, we just need the URL
      lightboxImageUrl.value = cloudinaryUrl
    }
  } catch (error: any) {
    console.error(`Error fetching media for hint ${hintId}:`, error)
    // You could show a toast notification here
  } finally {
    // Hide loading indicator regardless of success or failure
    isLoadingMedia.value = false
  }
}

// --- CLOSE LIGHTBOX (Updated to reset both states) ---
const closeLightbox = () => {
  lightboxImageUrl.value = null
  lightboxHtmlContent.value = null
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

/* --- UPDATED: Styles for the Table Lightbox --- */
.table-lightbox {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  /* Remove display flex properties to allow manual positioning */
  z-index: 999;
  /* The dark overlay is still useful, but clicking it should close the modal */
}
.table-lightbox::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
}

.table-lightbox-content {
  position: absolute; /* Changed from relative to allow dragging */
  /* Centering the initial position */
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  background: hsl(var(--card));
  color: hsl(var(--card-foreground));
  border-radius: 12px;
  max-width: 900px;
  width: 90%; /* Use percentage for better responsiveness */
  max-height: 90vh;
  border: 1px solid hsl(var(--border));
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);

  /* Use flexbox to structure the header and content */
  display: flex;
  flex-direction: column;
}

/* --- NEW: Draggable Handle Styles --- */
.drag-handle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background-color: hsl(var(--muted)); /* A slightly different background for the header */
  border-bottom: 1px solid hsl(var(--border));
  border-radius: 12px 12px 0 0; /* Match top corners */
  cursor: grab; /* The 'grab' cursor indicates something is draggable */
  user-select: none; /* Prevent text selection on the handle */
  font-weight: 600;
  color: hsl(var(--foreground));
}
.drag-handle:active {
  cursor: grabbing; /* Change cursor while actively dragging */
}
.drag-handle svg {
  color: hsl(var(--muted-foreground));
}

/* --- NEW: Hover Effects on the Drag Handle --- */
.drag-handle {
  transition: background-color 0.2s ease-in-out;
}
.drag-handle:hover {
  background-color: hsl(var(--muted) / 0.8); /* Slightly lighten/change on hover */
}

/* --- NEW: Scrollable content area inside the modal --- */
.table-content-area {
  padding: 1.5rem;
  overflow-y: auto; /* This makes ONLY the content scroll, not the header */
}
/* This ensures the table itself doesn't cause overflow issues */
.table-content-area div[v-html] {
  overflow-x: auto;
}

.close-button-table {
  /* Position relative to the drag handle for consistency */
  position: absolute;
  top: 0;
  right: 0;
  padding: 0.75rem 1.25rem; /* Give it the same padding as the handle */
  color: hsl(var(--muted-foreground));
  background: none;
  border: none;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  z-index: 10;

  /* --- NEW: Hover effects for the close button --- */
  transition:
    transform 0.2s ease,
    color 0.2s ease;
  border-radius: 0 12px 0 0;
}
.close-button-table:hover {
  transform: scale(1.2);
  color: hsl(var(--foreground));
  background-color: hsl(var(--accent) / 0.1);
}
</style>
