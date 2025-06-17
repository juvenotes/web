<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import { Button } from '~/components/ui/button'
import type UserDto from '#dtos/user'
import { Twitter, Instagram, Linkedin } from 'lucide-vue-next'
import { onMounted } from 'vue'
import { ThemeProvider, ThemeSwitcher } from '~/components/ui/theme'

declare global {
  interface Window {
    cookieconsent: any
  }
}

onMounted(() => {
  // Only initialize if not already initialized
  if (document.querySelector('script[src*="cookie-consent.js"]')) return

  const script = document.createElement('script')
  script.src = '//www.freeprivacypolicy.com/public/cookie-consent/4.2.0/cookie-consent.js'
  script.charset = 'UTF-8'

  script.onload = () => {
    window.cookieconsent.run({
      notice_banner_type: 'interstitial',
      website_name: 'Juvenotes',
      website_privacy_policy_url: 'https://juvenotes.com/privacy',
      consent_type: 'express',
      palette: {
        popup: {
          background: '#ffffff',
          text: '#1a1b1f',
          border: '1px solid rgba(205, 229, 237, 0.2)',
        },
        button: {
          background: '#CDE5ED',
          text: '#1a1b1f',
        },
      },
      theme: 'clean',
      position: 'center',
      transition: 'slide',
      layout: 'basic-header',
      layouts: {
        'basic-header': '{{header}}{{message}}{{link}}{{compliance}}',
      },
      layouts_message: {
        'basic-header': 'We care about your privacy and use cookies to enhance your experience.',
      },
      button: {
        accept: {
          background: '#CDE5ED',
          text: '#1a1b1f',
          padding: '12px 24px',
          borderRadius: '8px',
        },
        reject: {
          background: 'transparent',
          text: '#64748b',
          padding: '12px 24px',
          borderRadius: '8px',
        },
      },
      language: {
        header: {
          title: 'Cookie Settings 🍪',
          text: '',
        },
      },
    })
  }

  document.head.appendChild(script)
})

defineProps<{
  messages: Record<string, string | Record<string, string>>
  user: UserDto | null | undefined
}>()

const logoPath = '/images/logo.webp'
</script>

<template>
  <ThemeProvider default-theme="system" storage-key="juvenotes-theme">
    <div class="min-h-screen flex flex-col bg-background">
      <!-- Navigation -->
      <nav
        class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        <div class="container mx-auto px-4 h-16 flex items-center justify-between">
          <div class="flex items-center">
            <Link href="/">
              <img :src="logoPath" alt="Juvenotes Logo" class="h-12 w-auto" />
            </Link>
          </div>

          <div class="flex items-center gap-4">
            <ThemeSwitcher />
            <template v-if="user">
              <span class="text-sm text-muted-foreground"> Welcome, {{ user?.fullName }} </span>
              <Button variant="ghost" @click="() => $inertia.post('/logout')"> Logout </Button>
            </template>
          <template v-else>
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Register</Link>
            </Button>
          </template>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="flex-grow container mx-auto px-4 py-8">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="w-screen border-t bg-background/95">
      <div class="container mx-auto px-4 sm:px-6 py-2">
        <div class="flex flex-col md:flex-row items-center justify-between gap-6">
          <!-- Company Info -->
          <div class="flex items-center gap-4">
            <img :src="logoPath" alt="Logo" class="h-10 w-auto" />
            <p class="text-sm text-muted-foreground">© 2025 Juvenotes. All rights reserved.</p>
          </div>

          <!-- Links and Social -->
          <div class="flex items-center gap-8">
            <!-- Legal Links -->
            <div class="flex items-center gap-6">
              <Link
                href="/terms"
                class="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Terms
              </Link>
              <Link
                href="/privacy"
                class="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Privacy
              </Link>
              <!-- Button to open cookie preferences -->
              <a
                href="#"
                class="text-sm text-muted-foreground hover:text-primary transition-colors"
                id="open_preferences_center"
                >Update cookies preferences</a
              >
            </div>

            <!-- Social Links -->
            <div class="flex items-center gap-3">
              <span class="text-sm font-medium text-muted-foreground">Contact us:</span>
              <div class="flex gap-2">
                <a
                  href="https://x.com/juvenotes"
                  class="p-2 rounded-full bg-[#55A9C4]/10 hover:bg-[#55A9C4]/20 transition-colors group"
                  aria-label="Twitter"
                >
                  <Twitter
                    class="h-4 w-4 text-[#55A9C4] group-hover:scale-110 transition-transform"
                  />
                </a>
                <a
                  href="https://www.instagram.com/juvenotes/"
                  class="p-2 rounded-full bg-[#55A9C4]/10 hover:bg-[#55A9C4]/20 transition-colors group"
                  aria-label="Instagram"
                >
                  <Instagram
                    class="h-4 w-4 text-[#55A9C4] group-hover:scale-110 transition-transform"
                  />
                </a>
                <a
                  href="https://www.linkedin.com/company/juvenotes"
                  class="p-2 rounded-full bg-[#55A9C4]/10 hover:bg-[#55A9C4]/20 transition-colors group"
                  aria-label="LinkedIn"
                >
                  <Linkedin
                    class="h-4 w-4 text-[#55A9C4] group-hover:scale-110 transition-transform"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>

    <ToastManager :messages="messages" />
  </div>
  </ThemeProvider>
</template>
<style>
.cc-window {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10000;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  border-radius: 16px;
  padding: 2rem;
  width: 90%;
  max-width: 600px;
  text-align: center;
  animation: modalFade 0.3s ease-in-out;
}

.cc-header {
  text-align: center !important;
  margin-bottom: 1.5rem !important;
}

.cc-header h1 {
  font-size: 1.75rem !important;
  font-weight: 700 !important;
  color: #333333 !important;
  margin-bottom: 1rem;
}

.cc-message {
  font-size: 1.125rem !important;
  line-height: 1.6 !important;
  color: #4b5563 !important;
  text-align: center !important;
  margin-bottom: 1.5rem !important;
}

.cc-compliance {
  display: flex !important;
  gap: 1.5rem !important;
  justify-content: center !important;
  align-items: center !important;
  flex-wrap: wrap;
}

.cc-btn {
  font-weight: 600 !important;
  background-color: #55a9c4;
  color: #ffffff;
  padding: 12px 24px;
  border-radius: 8px;
  transition:
    transform 0.2s ease,
    background-color 0.2s ease;
  border: none;
  cursor: pointer;
  flex: 1;
  margin: 0.5rem;
  font-size: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.cc-btn:hover {
  background-color: #3c92a0;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.cc-btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(85, 169, 196, 0.4);
}

.cc-link {
  color: #55a9c4 !important;
  text-decoration: none !important;
  display: block !important;
  text-align: center !important;
  margin-top: 1rem !important;
  font-size: 0.875rem !important;
}

.cc-link:hover {
  text-decoration: underline;
}

@keyframes modalFade {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.freeprivacypolicy-com---palette-dark .cc-nb-okagree {
  background-color: #55a9c4 !important;
}

.freeprivacypolicy-com---palette-dark .cc-nb-reject {
  background-color: #e2e8f0 !important;
  color: #333333;
}

.freeprivacypolicy-com---palette-dark .cc-cp-foot-save {
  background-color: #55a9c4 !important;
}

.freeprivacypolicy-com---palette-dark.freeprivacypolicy-com---nb {
  background-color: #f1f5f9 !important;
}

.freeprivacypolicy-com---palette-dark .cc-nb-title {
  color: #1a1b1f !important;
}

.cc-nb-text-content {
  color: #4b5563 !important;
}

.freeprivacypolicy-com---palette-dark .cc-nb-changep {
  background-color: #ffffff !important;
}
</style>
