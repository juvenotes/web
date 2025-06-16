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
    if (newTheme === 'system') {
      const systemTheme = getSystemTheme()
      root.classList.add(systemTheme)
    } else {
      root.classList.add(newTheme)
    }
    
    // Save to localStorage
    try {
      localStorage.setItem(storageKey, newTheme)
    } catch (e) {
      console.error('Failed to save theme to localStorage:', e)
    }
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
