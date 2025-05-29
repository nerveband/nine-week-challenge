'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useToast } from '@/components/ui/use-toast'
import type { Database } from '@/types/database'
import {
  Activity,
  BarChart3,
  Home,
  LogOut,
  Menu,
  Ruler,
  User,
  X,
  Bell,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Daily Tracking', href: '/tracking', icon: Activity },
  { name: 'Measurements', href: '/measurements', icon: Ruler },
  { name: 'Progress', href: '/progress', icon: BarChart3 },
  { name: 'Profile', href: '/profile', icon: User },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient<Database>()

  // Check if app is installable
  useEffect(() => {
    const checkInstallable = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        return // Already installed
      }
      
      // Show prompt after 30 seconds on mobile
      if (window.innerWidth < 768) {
        setTimeout(() => {
          setShowInstallPrompt(true)
        }, 30000)
      }
    }

    checkInstallable()
  }, [])

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign out',
        variant: 'destructive',
      })
    } else {
      router.push('/login')
    }
  }

  const currentNavItem = navigation.find(item => item.href === pathname)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile/Tablet header - enhanced responsiveness */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 safe-area-padding-x">
        <div className="flex items-center justify-between h-16 px-4">
          <button
            type="button"
            className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-pink transition-colors-smooth touch-manipulation hover-lift"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex items-center space-x-2">
            <Image
              src="/docs/nwc-icon.png"
              alt="Nine Week Challenge"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="font-semibold text-lg sm:text-xl">9WC</span>
          </div>
          
          <button
            type="button"
            className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-pink transition-colors-smooth touch-manipulation hover-lift"
            aria-label="Notifications"
          >
            <Bell className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      <div className={cn(
        "md:hidden fixed inset-0 z-40 flex transition-opacity duration-300",
        sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity"
          onClick={() => setSidebarOpen(false)} 
        />
        
        <div className={cn(
          "relative flex w-72 max-w-[80%] flex-1 flex-col bg-white shadow-xl transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <div className="flex items-center">
              <Image
                src="/docs/nwc-icon.png"
                alt="Nine Week Challenge"
                width={36}
                height={36}
                className="rounded-lg"
              />
              <span className="ml-2 text-lg font-semibold">Nine Week Challenge</span>
            </div>
            <button
              type="button"
              className="p-1 rounded-md text-gray-500 hover:text-gray-900"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <nav className="flex-1 overflow-y-auto py-4">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-4 py-3 text-base font-medium transition-colors",
                    isActive
                      ? "bg-brand-pink/10 text-brand-pink border-r-4 border-brand-pink"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="mr-3 h-6 w-6" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          
          <div className="border-t border-gray-200 p-4 space-y-2">
            <button
              className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md"
              onClick={() => {
                toast({
                  title: 'Coming soon',
                  description: 'Settings will be available soon!'
                })
                setSidebarOpen(false)
              }}
            >
              <Settings className="mr-3 h-6 w-6" />
              Settings
            </button>
            <button
              className="flex items-center w-full px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-md"
              onClick={handleSignOut}
            >
              <LogOut className="mr-3 h-6 w-6" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar - Enhanced for tablet/desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-white border-r border-gray-200 shadow-sm">
          <div className="flex items-center h-16 px-4 border-b border-gray-200">
            <Image
              src="/docs/nwc-icon.png"
              alt="Nine Week Challenge"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <span className="ml-3 text-xl font-semibold">Nine Week Challenge</span>
          </div>
          
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 hover-lift",
                    isActive
                      ? "bg-gradient-to-r from-brand-pink/15 to-brand-mint/15 text-brand-pink border-l-4 border-brand-pink"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon className={cn(
                    "mr-3 h-5 w-5 transition-transform",
                    isActive && "scale-110"
                  )} />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          
          <div className="border-t border-gray-200 p-4">
            <button
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors-smooth hover-lift"
              onClick={handleSignOut}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main content - Enhanced tablet/desktop layout */}
      <div className="lg:pl-64 flex flex-col">
        <main className="flex-1 pt-16 lg:pt-0">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl">
            <div className="animate-fade-in">
              {children}
            </div>
          </div>
        </main>
        
        {/* Mobile bottom navigation - Enhanced with animations */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 safe-area-padding-x z-20">
          <div className="flex justify-around items-center h-16">
            {navigation.slice(0, 4).map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center flex-1 h-full px-2 transition-all duration-200 touch-manipulation",
                    isActive
                      ? "text-brand-pink scale-105"
                      : "text-gray-600 hover:text-gray-900 hover:scale-105"
                  )}
                >
                  <Icon className={cn(
                    "h-5 w-5 transition-transform",
                    isActive && "animate-gentle-pulse"
                  )} />
                  <span className="text-xs mt-1 font-medium">{item.name.split(' ')[0]}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>

      {/* PWA install prompt */}
      {showInstallPrompt && (
        <div className="md:hidden fixed bottom-20 left-4 right-4 bg-white rounded-lg shadow-lg p-4 z-30 animate-slide-up">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="font-medium text-sm">Install Nine Week Challenge</p>
              <p className="text-xs text-gray-600 mt-1">Add to home screen for offline access</p>
            </div>
            <button
              onClick={() => setShowInstallPrompt(false)}
              className="ml-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-3 flex space-x-2">
            <Button
              size="sm"
              variant="brand"
              className="flex-1"
              onClick={() => {
                // Trigger install prompt
                window.dispatchEvent(new Event('beforeinstallprompt'))
                setShowInstallPrompt(false)
              }}
            >
              Install
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => setShowInstallPrompt(false)}
            >
              Later
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}