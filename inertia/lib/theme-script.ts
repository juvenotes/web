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
    document.documentElement.classList.add(resolvedTheme)
    console.log('Theme initialized to:', resolvedTheme)
  } catch (e) {
    console.error('Error initializing theme:', e)
  }
}
