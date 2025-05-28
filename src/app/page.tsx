import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, BarChart3, Calendar, Heart, Target, Users } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-brand-pink/10">
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Image src="/docs/nwc-icon.png" alt="Nine Week Challenge" width={40} height={40} />
            <span className="text-xl font-bold">Nine Week Challenge</span>
          </div>
          <div className="space-x-4">
            <Link href="/login">
              <Button variant="outline">Log In</Button>
            </Link>
            <Link href="/signup">
              <Button variant="brand">Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      <main>
        <section className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-5xl font-bold tracking-tight mb-6">
            Transform Your Habits in <span className="text-brand-pink">9 Weeks</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Track body measurements, build healthy habits, and develop a mindful relationship with food through our proven 9-week program.
          </p>
          <Link href="/signup">
            <Button size="lg" variant="brand" className="text-lg px-8">
              Start Your Journey Today
            </Button>
          </Link>
        </section>

        <section className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-brand-pink" />
                  Structured Program
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Three distinct phases designed to build habits progressively: basic habits (weeks 1-3), hunger awareness (weeks 4-6), and mindful satisfaction (weeks 7-9).
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-brand-mint" />
                  Track Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Monitor body measurements every two weeks, daily habits, water intake, sleep, and steps. Visual charts show your transformation over time.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-brand-blue" />
                  Mindful Eating
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Learn to recognize hunger and fullness cues, eat without distractions, and develop a healthy relationship with food that lasts beyond the program.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-brand-pink/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-brand-pink" />
                </div>
                <h3 className="font-semibold mb-2">1. Sign Up</h3>
                <p className="text-sm text-muted-foreground">Create your account and set your starting date</p>
              </div>
              <div className="text-center">
                <div className="bg-brand-mint/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-brand-mint" />
                </div>
                <h3 className="font-semibold mb-2">2. Set Baseline</h3>
                <p className="text-sm text-muted-foreground">Record initial measurements and profile details</p>
              </div>
              <div className="text-center">
                <div className="bg-brand-blue/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Activity className="h-8 w-8 text-brand-blue" />
                </div>
                <h3 className="font-semibold mb-2">3. Track Daily</h3>
                <p className="text-sm text-muted-foreground">Log meals, habits, and wins each day</p>
              </div>
              <div className="text-center">
                <div className="bg-brand-yellow/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-brand-yellow" />
                </div>
                <h3 className="font-semibold mb-2">4. See Results</h3>
                <p className="text-sm text-muted-foreground">Watch your progress through visual charts</p>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Habits?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands who have completed the Nine Week Challenge and developed lasting healthy habits.
          </p>
          <Link href="/signup">
            <Button size="lg" variant="brand">Start Free Today</Button>
          </Link>
        </section>
      </main>

      <footer className="bg-muted py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Nine Week Challenge. Transform Your Habits in 9 Weeks.</p>
        </div>
      </footer>
    </div>
  )
}