<script setup lang="ts">
import { onMounted, ref, watch, provide } from 'vue'

// Theme options
type Theme = 'dark' | 'light' | 'system'

// Props
const props = defineProps<{
  defaultTheme?: Theme
  storageKey?: string
}>()

// Default values
const storageKey = props.storageKey || 'vite-ui-theme'
const defaultTheme = props.defaultTheme || 'system'

// State
const theme = ref<Theme>(defaultTheme)

// Get the system preference
const getSystemTheme = (): 'dark' | 'light' => {
  try {
    if (typeof window === 'undefined') {
      return 'light' // Default for SSR
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  } catch (e) {
    console.error('Error getting system theme:', e)
    return 'light' // Fallback to light
  }
}

// Update the theme
const updateTheme = (newTheme: Theme) => {
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || !window.document) {
      console.log('Not in browser environment, skipping theme update')
      return
    }
    
    const root = window.document.documentElement
    
    // Remove both classes first
    root.classList.remove('light', 'dark')
    
    // Set the appropriate class based on the theme
    const resolvedTheme = newTheme === 'system' ? getSystemTheme() : newTheme
    
    // Apply to document element
    root.classList.add(resolvedTheme)
    
    // Apply to body as well for maximum compatibility
    if (document.body) {
      document.body.classList.remove('light', 'dark')
      document.body.classList.add(resolvedTheme)
      // Also set color-scheme to improve native element styling
      document.body.style.colorScheme = resolvedTheme
      // Add a data-theme attribute for components that might need it
      document.body.setAttribute('data-theme', resolvedTheme)
    }
    
    // Handle the dynamic style element for forcing dark mode
    if (resolvedTheme === 'dark') {
      let styleEl = document.getElementById('force-dark-mode')
      if (!styleEl) {
        styleEl = document.createElement('style')
        styleEl.id = 'force-dark-mode'
        document.head.appendChild(styleEl)
      }
      styleEl.textContent = `
        /* Force background colors in dark mode - aggressively target all gray backgrounds */
        [class*="bg-white"], .bg-white, 
        [class*="bg-gray-"], .bg-gray-50, .bg-gray-100, .bg-gray-50\\/50, .bg-gray-100\\/50,
        [class*="bg-slate-"], .bg-slate-50, .bg-slate-100 {
          background-color: hsl(var(--card)) !important;
        }
        
        /* Force main page containers to have correct background */
        .min-h-screen, main, body > div, div[data-page], #app, #app > div {
          background-color: hsl(var(--background)) !important;
        }
        
        /* Fix text colors */
        [class*="text-gray-900"], [class*="text-gray-800"], .text-gray-900, .text-gray-800 {
          color: hsl(var(--foreground)) !important;
        }
        
        [class*="text-gray-"], [class*="text-slate-"], .text-gray-700, .text-gray-600, .text-gray-500 {
          color: hsl(var(--muted-foreground)) !important;
        }
        
        /* Specific targets for content pages */
        .min-h-screen.bg-gray-50\\/50, div.bg-gray-50\\/50 {
          background-color: hsl(var(--background)) !important;
        }
        
        /* Force container transparency */
        .max-w-7xl, .mx-auto, .container, .px-4, .sm\\:px-6, .lg\\:px-8 {
          background-color: transparent !important;
        }
      `
    } else {
      // Remove the style if it exists
      const styleEl = document.getElementById('force-dark-mode')
      if (styleEl) styleEl.remove()
    }
    
    // Save to localStorage
    try {
      localStorage.setItem(storageKey, newTheme)
    } catch (e) {
      console.error('Failed to save theme to localStorage:', e)
    }
    
    // Force a reflow to ensure all components update
    document.body.offsetHeight;
    
    // Event to notify components that the theme has changed
    window.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme: resolvedTheme } }))
  } catch (e) {
    console.error('Error updating theme:', e)
  }
}

// Initialize theme
onMounted(() => {
  try {
    console.log('ThemeProvider mounted, initializing theme')
    
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      console.log('Not in browser environment, skipping theme initialization in component')
      return
    }
    
    // Check localStorage first
    let savedTheme: Theme | null = null
    
    try {
      savedTheme = localStorage.getItem(storageKey) as Theme | null
    } catch (e) {
      console.error('Failed to read theme from localStorage:', e)
    }
    
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system')) {
      theme.value = savedTheme
      console.log('Using saved theme from localStorage:', savedTheme)
    } else {
      theme.value = defaultTheme
      console.log('Using default theme:', defaultTheme)
    }
    
    // Set initial theme
    updateTheme(theme.value)
    console.log('Theme updated to:', theme.value, 'system resolved to:', getSystemTheme())
    
    // Listen for system theme changes
    try {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      
      const handleChange = () => {
        if (theme.value === 'system') {
          updateTheme('system')
          console.log('System theme changed, updating to:', getSystemTheme())
        }
      }
      
      // Use the appropriate event listener method
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange)
      } else if ('addListener' in mediaQuery) {
        // For older browsers
        // @ts-ignore
        mediaQuery.addListener(handleChange)
      }
    } catch (e) {
      console.error('Failed to add media query listener:', e)
    }
  } catch (e) {
    console.error('Error in ThemeProvider onMounted:', e)
  }
})

// Watch for theme changes
watch(theme, (newTheme) => {
  updateTheme(newTheme)
})

// Expose the theme and a setter
const setTheme = (newTheme: Theme) => {
  theme.value = newTheme
}

// Provide the theme context to child components
provide('theme', {
  theme,
  setTheme
})
</script>

<template>
  <slot />
</template>
