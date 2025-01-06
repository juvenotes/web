import { router } from '@inertiajs/react'
import { Button } from '~/components/ui/button'
import { ModeToggle } from '~/components/ui/mode-toggle'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuList,
} from '~/components/ui/navigation-menu'
import { Twitter, Instagram, Linkedin } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden flex flex-col">
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-4 container mx-auto justify-between">
          {/* Logo Area */}
          <div className="flex items-center">
            <div
              onClick={() => router.visit('/')}
              className="cursor-pointer hover:opacity-80 transition-opacity"
            >
              <img src="/images/logo.png" alt="Logo" className="h-14 w-28" />
            </div>
          </div>

          {/* Right Side Navigation */}
          <div className="flex items-center gap-4">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>About Us</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="p-4 w-[200px]">
                      <p className="text-sm text-muted-foreground">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
                        tempor incididunt ut labore.
                      </p>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                    onClick={() => router.visit('/pricing')}
                  >
                    Pricing
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <ModeToggle />

            <Button
              variant="default"
              onClick={() => router.visit('/dashboard')}
              className="bg-[#55A9C4] text-white hover:bg-[#55A9C4]/90 text-primary-foreground"
            >
              Login
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full overflow-y-auto">
        {/* Hero Section */}
        <section className="bg-gray-50 py-8 flex-none">
          <div className="container mx-auto px-6 text-center">
            <div className="flex items-center justify-center gap-4">
              <h1 className="text-3xl font-bold text-gray-800">WELCOME TO JUVENOTES</h1>
              <img src="/images/pen.png" alt="Study Resources" className="w-16 h-16" />
            </div>

            <h2 className="text-xl font-semibold text-[#55A9C4] mb-4">Study Smart, Excel Easy!</h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Welcome to Juvenotes, your premier destination for a transformative medical education
              experience. 🚀 Here's why you should sign up:
            </p>
            <Button
              className="bg-[#55A9C4] text-white px-6 py-2 text-lg font-medium rounded-lg shadow-lg hover:bg-[#55A9C4]/90"
              onClick={() => router.visit('/dashboard')}
            >
              START LEARNING NOW
            </Button>
          </div>
        </section>

        {/* Features Grid */}
        <section className="flex-none py-8 bg-white">
          <div className="container mx-auto px-6">
            <h2 className="text-2xl font-bold text-center mb-6">Why Choose Juvenotes?</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="bg-gray-50 rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
                <img
                  src="/images/bookpile.png"
                  alt="Study Resources"
                  className="w-16 h-16 mx-auto mb-4"
                />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Comprehensive Resources
                </h3>
                <p className="text-gray-600">Access a wide range of study materials</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
                <img
                  src="/images/papers.png"
                  alt="Past Papers"
                  className="w-16 h-18 mx-auto mb-4"
                />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Past Papers</h3>
                <p className="text-gray-600">Practice with previous exam papers</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
                <img
                  src="/images/path.png"
                  alt="Learning Paths"
                  className="w-16 h-16 mx-auto mb-4"
                />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Custom Learning Paths</h3>
                <p className="text-gray-600">Personalized study journey</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
                <img
                  src="/images/handshake.png"
                  alt="Community"
                  className="w-16 h-16 mx-auto mb-4"
                />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Active Community</h3>
                <p className="text-gray-600">Learn together with peers</p>
              </div>
            </div>
          </div>
        </section>

        <section
          className="py-16 relative bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("/images/dashboard.png")',
          }}
        >
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-black/50"></div>

          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6 text-white">Our Mission</h2>
              <p className="text-lg leading-relaxed text-white/90">
                At Juvenotes, we believe every medical student deserves access to affordable,
                high-quality, and locally-tailored educational resources. Our mission is to bridge
                the gap in medical education by providing study tools designed to empower students
                to excel in their academic and professional journeys. Join us today and take the
                first step toward transforming your learning experience!
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-[#55A9C4]/5 py-16">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg p-8 text-center shadow-sm">
                <h3 className="text-4xl font-bold text-[#55A9C4] mb-2">636+</h3>
                <p className="text-gray-600">Active Students</p>
              </div>
              <div className="bg-white rounded-lg p-8 text-center shadow-sm">
                <h3 className="text-4xl font-bold text-[#55A9C4] mb-2">1200+</h3>
                <p className="text-gray-600">Practice Questions</p>
              </div>
              <div className="bg-white rounded-lg p-8 text-center shadow-sm">
                <h3 className="text-4xl font-bold text-[#55A9C4] mb-2">98%</h3>
                <p className="text-gray-600">Success Rate</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-8">Ready to Start Your Journey?</h2>
            <Button
              className="bg-[#55A9C4] text-white px-8 py-4 text-lg font-medium rounded-lg shadow-lg hover:bg-[#55A9C4]/90"
              onClick={() => router.visit('/register')}
            >
              Join Juvenotes Today
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background/95 w-full">
        <div className="container mx-auto py-6 px-4">
          <div className="flex justify-between items-center">
            {/* Company Info */}
            <div className="flex items-center gap-4">
              <img src="/images/logo.png" alt="Logo" className="h-12 w-auto" />
              <p className="text-sm text-muted-foreground">
                © 2025 Juvenotes. All rights reserved.
              </p>
            </div>

            {/* Contact & Social */}
            <div className="flex  gap-4">
              <h4 className="font-semibold">Contact Us:</h4>
              <div className="flex gap-4">
                <a href="#" className="text-[#55A9C4] hover:text-[#55A9C4]/80 transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-[#55A9C4] hover:text-[#55A9C4]/80 transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="text-[#55A9C4] hover:text-[#55A9C4]/80 transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
