import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, BarChart3, Calendar, Heart, Target, Users } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-brand-pink/10">
      {/* Sticky header for mobile with safe area padding */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between safe-area-padding-x">
          <div className="flex items-center space-x-2">
            <Image 
              src="/docs/nwc-icon.png" 
              alt="Nine Week Challenge" 
              width={36} 
              height={36}
              className="rounded-lg"
            />
            <span className="text-lg sm:text-xl font-bold hidden sm:block">Nine Week Challenge</span>
            <span className="text-lg font-bold sm:hidden">9WC</span>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link href="/login">
              <Button 
                variant="outline" 
                size="sm"
                className="min-h-[44px] px-4 text-sm"
              >
                Log In
              </Button>
            </Link>
            <Link href="/signup">
              <Button 
                variant="brand" 
                size="sm"
                className="min-h-[44px] px-4 text-sm"
              >
                Start Free
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero section with mobile-first design */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 sm:mb-6 animate-fade-in">
            Transform Your Habits in <span className="text-brand-pink bg-brand-pink/10 px-2 py-1 rounded-lg">9 Weeks</span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 px-4 animate-fade-in-delay">
            Track body measurements, build healthy habits, and develop a mindful relationship with food through our proven 9-week program.
          </p>
          <div className="animate-fade-in-delay-2">
            <Link href="/signup">
              <Button 
                size="lg" 
                variant="brand" 
                className="text-base sm:text-lg px-6 sm:px-8 py-6 min-h-[56px] w-full sm:w-auto max-w-sm mx-auto shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Start Your Journey Today
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-4">No credit card required • Free for 9 weeks</p>
          </div>
        </section>

        {/* Features section with horizontal scroll on mobile */}
        <section className="py-12 sm:py-16 overflow-x-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">What You'll Get</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              <Card className="hover:shadow-lg transition-shadow duration-300 touch-manipulation">
                <CardHeader>
                  <div className="bg-brand-pink/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <Calendar className="h-6 w-6 text-brand-pink" />
                  </div>
                  <CardTitle className="text-lg">Structured Program</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    Three distinct phases designed to build habits progressively: basic habits (weeks 1-3), hunger awareness (weeks 4-6), and mindful satisfaction (weeks 7-9).
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow duration-300 touch-manipulation">
                <CardHeader>
                  <div className="bg-brand-mint/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <BarChart3 className="h-6 w-6 text-brand-mint" />
                  </div>
                  <CardTitle className="text-lg">Track Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    Monitor body measurements every two weeks, daily habits, water intake, sleep, and steps. Visual charts show your transformation over time.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow duration-300 touch-manipulation sm:col-span-2 lg:col-span-1">
                <CardHeader>
                  <div className="bg-brand-blue/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <Heart className="h-6 w-6 text-brand-blue" />
                  </div>
                  <CardTitle className="text-lg">Mindful Eating</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    Learn to recognize hunger and fullness cues, eat without distractions, and develop a healthy relationship with food that lasts beyond the program.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How it works - mobile optimized with timeline */}
        <section className="bg-white py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">How It Works</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 relative">
              {/* Mobile timeline connector */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 sm:hidden"></div>
              
              <div className="relative pl-16 sm:pl-0 sm:text-center">
                <div className="absolute left-0 sm:relative sm:left-auto bg-brand-pink/20 rounded-full w-16 h-16 flex items-center justify-center sm:mx-auto mb-4">
                  <Users className="h-8 w-8 text-brand-pink" />
                </div>
                <div className="sm:text-center">
                  <h3 className="font-semibold mb-2 text-lg">1. Sign Up</h3>
                  <p className="text-sm text-muted-foreground">Create your account and set your starting date</p>
                </div>
              </div>
              
              <div className="relative pl-16 sm:pl-0 sm:text-center">
                <div className="absolute left-0 sm:relative sm:left-auto bg-brand-mint/20 rounded-full w-16 h-16 flex items-center justify-center sm:mx-auto mb-4">
                  <Target className="h-8 w-8 text-brand-mint" />
                </div>
                <div className="sm:text-center">
                  <h3 className="font-semibold mb-2 text-lg">2. Set Baseline</h3>
                  <p className="text-sm text-muted-foreground">Record initial measurements and profile details</p>
                </div>
              </div>
              
              <div className="relative pl-16 sm:pl-0 sm:text-center">
                <div className="absolute left-0 sm:relative sm:left-auto bg-brand-blue/20 rounded-full w-16 h-16 flex items-center justify-center sm:mx-auto mb-4">
                  <Activity className="h-8 w-8 text-brand-blue" />
                </div>
                <div className="sm:text-center">
                  <h3 className="font-semibold mb-2 text-lg">3. Track Daily</h3>
                  <p className="text-sm text-muted-foreground">Log meals, habits, and wins each day</p>
                </div>
              </div>
              
              <div className="relative pl-16 sm:pl-0 sm:text-center">
                <div className="absolute left-0 sm:relative sm:left-auto bg-brand-yellow/20 rounded-full w-16 h-16 flex items-center justify-center sm:mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-brand-yellow" />
                </div>
                <div className="sm:text-center">
                  <h3 className="font-semibold mb-2 text-lg">4. See Results</h3>
                  <p className="text-sm text-muted-foreground">Watch your progress through visual charts</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA section with floating button on mobile */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
          <div className="bg-gradient-to-r from-brand-pink/20 to-brand-mint/20 rounded-2xl p-8 sm:p-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Ready to Transform Your Habits?</h2>
            <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
              Join thousands who have completed the Nine Week Challenge and developed lasting healthy habits.
            </p>
            <Link href="/signup">
              <Button 
                size="lg" 
                variant="brand"
                className="text-base sm:text-lg px-8 py-6 min-h-[56px] shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Start Free Today
              </Button>
            </Link>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-brand-mint" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                No credit card required
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-brand-mint" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Works offline
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-brand-mint" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Mobile friendly
              </span>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-muted py-8 safe-area-padding-x">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Nine Week Challenge. Transform Your Habits in 9 Weeks.</p>
          <p className="mt-2">
            <Link href="/privacy" className="hover:text-brand-pink transition-colors">Privacy</Link>
            {' • '}
            <Link href="/terms" className="hover:text-brand-pink transition-colors">Terms</Link>
            {' • '}
            <Link href="/support" className="hover:text-brand-pink transition-colors">Support</Link>
          </p>
        </div>
      </footer>

      {/* Mobile install prompt banner */}
      <div className="fixed bottom-0 left-0 right-0 sm:hidden safe-area-padding-x z-40" id="install-banner" style={{ display: 'none' }}>
        <div className="bg-white border-t border-gray-200 shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">Install Nine Week Challenge</p>
              <p className="text-xs text-muted-foreground">Add to home screen for best experience</p>
            </div>
            <Button size="sm" variant="brand">Install</Button>
          </div>
        </div>
      </div>
    </div>
  )
}