import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getCurrentWeek, getCompletionPercentage, getDaysUntilNextMeasurement, isMeasurementWeek, getStreakDays } from '@/lib/utils'
import { Activity, Calendar, Droplets, Footprints, Moon, Target, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = createServerClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/login')
  }

  const currentWeek = getCurrentWeek(profile.program_start_date)
  const completionPercentage = getCompletionPercentage(currentWeek)
  const daysUntilMeasurement = getDaysUntilNextMeasurement(currentWeek)
  const isMeasurementWeekNow = isMeasurementWeek(currentWeek)

  // Get today's tracking data
  const today = new Date().toISOString().split('T')[0]
  const { data: todayTracking } = await supabase
    .from('daily_tracking')
    .select('*, meals(*)')
    .eq('user_id', user.id)
    .eq('date', today)
    .single()

  // Get all tracking data for streak calculation
  const { data: allTracking } = await supabase
    .from('daily_tracking')
    .select('date')
    .eq('user_id', user.id)
    .order('date', { ascending: false })

  const currentStreak = getStreakDays(allTracking || [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {profile.name}!</h1>
        <p className="text-muted-foreground">Week {currentWeek} of your Nine Week Challenge</p>
      </div>

      {/* Progress and Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionPercentage}%</div>
            <p className="text-xs text-muted-foreground">
              Week {currentWeek} of 9
            </p>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand-primary transition-all"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Streak</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStreak} days</div>
            <p className="text-xs text-muted-foreground">
              {currentStreak > 0 ? 'Keep it up!' : 'Start tracking today!'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Measurement</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isMeasurementWeekNow ? (
              <>
                <div className="text-2xl font-bold text-brand-primary">This Week!</div>
                <p className="text-xs text-muted-foreground">
                  Time to measure
                </p>
              </>
            ) : daysUntilMeasurement ? (
              <>
                <div className="text-2xl font-bold">{daysUntilMeasurement} days</div>
                <p className="text-xs text-muted-foreground">
                  Until next measurement
                </p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">Complete!</div>
                <p className="text-xs text-muted-foreground">
                  All measurements done
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Today's Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Summary</CardTitle>
          <CardDescription>Your daily tracking progress</CardDescription>
        </CardHeader>
        <CardContent>
          {todayTracking ? (
            <div className="grid gap-4 md:grid-cols-4">
              <div className="flex items-center space-x-2">
                <Moon className="h-5 w-5 text-brand-info" />
                <div>
                  <p className="text-sm font-medium">Sleep</p>
                  <p className="text-2xl font-bold">{todayTracking.hours_sleep || '-'} hrs</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Droplets className="h-5 w-5 text-brand-info" />
                <div>
                  <p className="text-sm font-medium">Water</p>
                  <p className="text-2xl font-bold">{todayTracking.ounces_water || '-'} oz</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Footprints className="h-5 w-5 text-brand-success" />
                <div>
                  <p className="text-sm font-medium">Steps</p>
                  <p className="text-2xl font-bold">{todayTracking.steps?.toLocaleString() || '-'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-brand-primary" />
                <div>
                  <p className="text-sm font-medium">Meals</p>
                  <p className="text-2xl font-bold">{todayTracking.meals?.length || 0}/4</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No tracking data for today yet</p>
              <Link href="/tracking">
                <Button variant="brand">Start Tracking</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Link href="/tracking">
            <Button variant="outline" className="w-full">
              <Activity className="mr-2 h-4 w-4" />
              Daily Tracking
            </Button>
          </Link>
          {isMeasurementWeekNow && (
            <Link href="/measurements">
              <Button variant="brand" className="w-full">
                <TrendingUp className="mr-2 h-4 w-4" />
                Record Measurements
              </Button>
            </Link>
          )}
          <Link href="/progress">
            <Button variant="outline" className="w-full">
              <TrendingUp className="mr-2 h-4 w-4" />
              View Progress
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Version Info */}
      <div className="text-center text-xs text-muted-foreground">
        Last updated: {new Date().toLocaleString()} • v2.1 🔥
      </div>
    </div>
  )
}