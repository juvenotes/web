// import { router } from '@inertiajs/react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '~/components/ui/navigation-menu'
import { Sheet, SheetContent, SheetTrigger } from '~/components/ui/sheet'
import {
  Bell,
  Search,
  Menu,
  User,
  Home,
  BookOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Trash2,
  GraduationCap,
  Clock,
  Flame,
  FileText,
} from 'lucide-react'

import { useState, useEffect } from 'react'
import { router } from '@inertiajs/react'
import { Card, CardContent } from '~/components/ui/card'

// Add types
interface User {
  id: number
  name: string
  streak_count: number
  last_login: string
}

// Update interface
interface Props {
  auth: {
    user: User | null
  }
}

export default function Dashboard({ auth }: Props) {
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [studyTime, setStudyTime] = useState(0)
  // const [streak] = useState(auth.user ? auth.user.streak_count : 0)
  const [startTime] = useState(Date.now())

  // Replace hardcoded user with auth user
  const user = auth?.user || { name: 'Guest' }
  const streak = auth?.user?.streak_count || 0
  // const user = { name: 'User' } // Replace this with actual user data fetching logic

  useEffect(() => {
    // Start timer when component mounts
    const timer = setInterval(() => {
      const elapsedTime = Math.floor((Date.now() - startTime) / 1000)
      setStudyTime(elapsedTime)
    }, 1000)

    // Save study time when component unmounts
    return () => {
      clearInterval(timer)
      if (auth?.user?.id && studyTime > 0) {
        router.post('/api/study-time', {
          time: studyTime,
          userId: auth.user.id,
        })
      }
    }
  }, [auth?.user, startTime, studyTime])

  // Format time for display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  return (
    <div className="h-screen bg-background flex flex-col ">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur shrink-0">
        <div className="flex h-16 items-center px-4 container mx-auto">
          {/* Mobile Menu Toggle */}
          <Sheet open={isSidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <Sidebar />
            </SheetContent>
          </Sheet>

          {/* Logo */}
          {/* <div onClick={() => router.visit('/')} className="flex items-center gap-2 font-semibold">
            <img src="/images/logo.png" alt="Logo" className="h-14 w-28" />
          </div> */}
          <div
            onClick={() => router.visit('/')}
            className="cursor-pointer hover:opacity-80 transition-opacity"
          >
            <img src="/images/logo.png" alt="Logo" className="h-14 w-28" />
          </div>

          {/* Search */}
          <div className="flex-1 px-4">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-8 w-full" />
            </div>
          </div>

          {/* Notifications & Profile */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <div className="relative">
              <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <User className="h-5 w-5" />
              </Button>
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-popover border">
                  <div className="p-3">
                    <h4 className="font-medium mb-2">Account Settings</h4>
                    <button
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-accent w-full"
                      onClick={() => router.visit('/settings/email')}
                    >
                      <Mail className="h-4 w-4" />
                      Update Email
                    </button>
                    <button
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-accent w-full text-red-600"
                      onClick={() => router.visit('/settings/account')}
                    >
                      <Trash2 className="h-4 w-4 shrink-0" />
                      <span className="truncate">Delete Account</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Layout */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar - Desktop */}
        <aside
          className={`hidden md:flex flex-col border-r transition-all duration-300 shrink-0 ${
            isCollapsed ? 'w-16' : 'w-64'
          }`}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b flex justify-end">
            <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)}>
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Sidebar Content */}
          <div className="p-4 space-y-4">
            <NavigationMenu orientation="vertical" className="block">
              <NavigationMenuList className="flex flex-col space-y-2">
                <NavigationMenuItem>
                  <NavigationMenuLink
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-accent"
                    href="/dashboard"
                  >
                    <Home className="h-4 w-4" />
                    {!isCollapsed && <span>Dashboard</span>}
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-accent"
                    href="/courses"
                  >
                    <BookOpen className="h-4 w-4" />
                    {!isCollapsed && <span>Courses</span>}
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-accent"
                    href="/settings"
                  >
                    <Settings className="h-4 w-4" />
                    {!isCollapsed && <span>Settings</span>}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-primary/10 to-transparent p-6 rounded-lg">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
                    Hey {user?.name}! <GraduationCap className="h-8 w-8" />
                  </h1>
                  <p className="text-muted-foreground">Ready to continue your learning journey?</p>
                </div>

                <div className="flex gap-6">
                  <div className="flex items-center gap-3 bg-white/50 backdrop-blur p-3 rounded-lg">
                    <div className="rounded-full bg-blue-100 p-2.5">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Study Time</p>
                      <p className="text-2xl font-bold">{formatTime(studyTime)}</p>
                      {/* <p className="text-2xl font-bold">4h 30m</p> */}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-white/50 backdrop-blur p-3 rounded-lg">
                    <div className="rounded-full bg-orange-100 p-2.5">
                      <Flame className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Streak</p>
                      {/* <p className="text-2xl font-bold">7 days</p> */}
                      <p className="text-2xl font-bold">{streak} days</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden"
                onClick={() => router.visit('/pastpapers')}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">Past Papers</h3>
                      <p className="text-muted-foreground">
                        Practice with previous examination papers to enhance your preparation
                      </p>
                      <div className="flex items-center text-sm text-primary pt-2">
                        <span className="font-medium">25 Papers Available</span>
                        <span className="mx-2">•</span>
                        <span>Updated Weekly</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden"
                onClick={() => router.visit('/concepts')}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">Concepts</h3>
                      <p className="text-muted-foreground">
                        Master comprehensive study materials organized by topics
                      </p>
                      <div className="flex items-center text-sm text-primary pt-2">
                        <span className="font-medium">12 Units</span>
                        <span className="mx-2">•</span>
                        <span>200+ Topics</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      {/* Footer */}
      <footer className="shrink-0 border-t bg-background/95 w-full">
        <div className="container mx-auto py-4 px-4">
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

function Sidebar() {
  return (
    <div className="p-4 space-y-4">
      <NavigationMenu orientation="vertical" className="block">
        <NavigationMenuList className="flex flex-col space-y-2">
          <NavigationMenuItem>
            <NavigationMenuLink
              className="flex items-center gap-2 p-2 rounded-md hover:bg-accent"
              href="/dashboard"
            >
              <Home className="h-4 w-4" />
              Dashboard
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              className="flex items-center gap-2 p-2 rounded-md hover:bg-accent"
              href="/pastpapers"
            >
              <BookOpen className="h-4 w-4" />
              Courses
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              className="flex items-center gap-2 p-2 rounded-md hover:bg-accent"
              href="/settings"
            >
              <Settings className="h-4 w-4" />
              Settings
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  )
}
