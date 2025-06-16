// This script is executed before the app mounts to prevent flickering
// when loading the page by setting the theme class as early as possible

export function initializeTheme() {
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || !document) {
      console.log('Not in browser environment, skipping theme initialization')
      return
    }
    
    const storageKey = 'juvenotes-theme'
    
    // Function to get system preference
    function getSystemTheme() {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
  
    // Get theme from localStorage or fall back to system preference
    function getTheme() {
      try {
        const theme = localStorage.getItem(storageKey)
        return theme === 'dark' || theme === 'light' || theme === 'system' 
          ? theme 
          : 'system'
      } catch (e) {
        console.error('Failed to read theme from localStorage:', e)
        return 'system'
      }
    }
  
    // Apply the theme
    const theme = getTheme()
    const resolvedTheme = theme === 'system' ? getSystemTheme() : theme
    
    // Remove any existing theme classes first
    document.documentElement.classList.remove('light', 'dark')
    if (document.body) {
      document.body.classList.remove('light', 'dark')
    }
    
    // Add to both document element and body for maximum compatibility
    document.documentElement.classList.add(resolvedTheme)
    if (document.body) {
      document.body.classList.add(resolvedTheme)
      // Also set color-scheme to improve native element styling
      document.body.style.colorScheme = resolvedTheme
    }
    
    // Ensure the class is applied to the body when it's available
    // Add a data-theme attribute for components that might need it
    if (document.body) {
      document.body.setAttribute('data-theme', resolvedTheme)
    }
    
    // Add a style tag to prevent flashing
    const styleEl = document.createElement('style')
    styleEl.textContent = `
      :root {
        color-scheme: ${resolvedTheme};
      }
      
      @media (prefers-color-scheme: dark) {
        :root:not(.light) {
          color-scheme: dark;
        }
      }
    `
    document.head.appendChild(styleEl)
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        document.body.classList.remove('light', 'dark')
        document.body.classList.add(resolvedTheme)
        document.body.style.colorScheme = resolvedTheme
      })
    }
    
    // Create a style element to force dark mode styles
    if (resolvedTheme === 'dark') {
      const styleEl = document.createElement('style')
      styleEl.id = 'force-dark-mode'
      styleEl.textContent = `
        [class*="bg-white"], .bg-white, .bg-gray-50, .bg-slate-50 {
          background-color: hsl(var(--card)) !important;
        }
        [class*="text-gray-900"], [class*="text-gray-800"], .text-gray-900, .text-gray-800 {
          color: hsl(var(--foreground)) !important;
        }
        [class*="text-gray-"], [class*="text-slate-"], .text-gray-700, .text-gray-600, .text-gray-500 {
          color: hsl(var(--muted-foreground)) !important;
        }
      `
      document.head.appendChild(styleEl)
    } else {
      // Remove the style if it exists
      const styleEl = document.getElementById('force-dark-mode')
      if (styleEl) styleEl.remove()
    }
    
    console.log('Theme initialized to:', resolvedTheme)
  } catch (e) {
    console.error('Error initializing theme:', e)
  }
}
