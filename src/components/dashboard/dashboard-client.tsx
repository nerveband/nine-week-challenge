'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProgramOverviewCalendar } from '@/components/dashboard/program-overview-calendar'
import { getCurrentWeek, getCompletionPercentage, getDaysUntilNextMeasurement, isMeasurementWeek, getStreakDays } from '@/lib/utils'
import { Activity, Calendar, Droplets, Footprints, Moon, Target, TrendingUp, ChevronRight, Award, Zap, BarChart3 } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/database'
import Link from 'next/link'

interface DashboardClientProps {
  profile: any
  todayTracking: any
  allTracking: any[]
  currentStreak: number
}

export function DashboardClient({ 
  profile, 
  todayTracking: initialTodayTracking, 
  allTracking: initialAllTracking, 
  currentStreak: initialCurrentStreak 
}: DashboardClientProps) {
  const supabase = createClientComponentClient<Database>()
  const [showOverview, setShowOverview] = useState(false)
  const [trackingData, setTrackingData] = useState(initialAllTracking)
  const [measurementData, setMeasurementData] = useState<any[]>([])
  const [todayTracking, setTodayTracking] = useState(initialTodayTracking)
  const [currentStreak, setCurrentStreak] = useState(initialCurrentStreak)
  
  const currentWeek = getCurrentWeek(profile.program_start_date)
  const completionPercentage = getCompletionPercentage(currentWeek)
  const daysUntilMeasurement = getDaysUntilNextMeasurement(currentWeek)
  const isMeasurementWeekNow = isMeasurementWeek(currentWeek)

  useEffect(() => {
    loadMeasurementData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadMeasurementData = async () => {
    try {
      const { data: measurements } = await supabase
        .from('measurements')
        .select('week_number, created_at')
        .eq('user_id', profile.id)
        .order('week_number', { ascending: true })

      if (measurements) {
        setMeasurementData(measurements)
      }
    } catch (error) {
      console.error('Error loading measurement data:', error)
    }
  }

  // Get week phase info
  const getWeekPhase = (week: number) => {
    if (week <= 3) return { phase: 'Foundation', description: 'Building basic habits' }
    if (week <= 6) return { phase: 'Awareness', description: 'Hunger & fullness focus' }
    return { phase: 'Mastery', description: 'Mindful eating & satisfaction' }
  }

  const weekPhase = getWeekPhase(currentWeek)

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 md:pb-0">
      {/* Welcome section with mobile-optimized layout */}
      <div className="animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome back, {profile.name?.split(' ')[0]}!
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Week {currentWeek} • {weekPhase.phase} Phase
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowOverview(!showOverview)}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            {showOverview ? 'Hide' : 'Overview'}
          </Button>
        </div>
      </div>

      {/* Program Overview Calendar */}
      {showOverview && (
        <ProgramOverviewCalendar
          programStartDate={profile.program_start_date}
          currentWeek={currentWeek}
          trackingData={trackingData}
          measurementData={measurementData}
          className="animate-fade-in"
        />
      )}

      {/* Progress overview - mobile optimized cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 animate-fade-in-delay">
        {/* Progress card */}
        <Card className="col-span-2 sm:col-span-1 hover:shadow-lg transition-shadow touch-manipulation">
          <CardHeader className="pb-2 sm:pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Progress</CardTitle>
              <Target className="h-4 w-4 text-brand-pink" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{completionPercentage}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Week {currentWeek} of 9
            </p>
            <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-brand-pink to-brand-mint transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Streak card */}
        <Card className="hover:shadow-lg transition-shadow touch-manipulation">
          <CardHeader className="pb-2 sm:pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Streak</CardTitle>
              <Zap className="h-4 w-4 text-brand-yellow" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">
              {currentStreak}
              <span className="text-sm font-normal text-muted-foreground ml-1">days</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {currentStreak > 0 ? '🔥 Keep going!' : 'Start today!'}
            </p>
          </CardContent>
        </Card>

        {/* Measurement reminder card */}
        <Card className="hover:shadow-lg transition-shadow touch-manipulation">
          <CardHeader className="pb-2 sm:pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Measure</CardTitle>
              <Calendar className="h-4 w-4 text-brand-blue" />
            </div>
          </CardHeader>
          <CardContent>
            {isMeasurementWeekNow ? (
              <>
                <div className="text-xl sm:text-2xl font-bold text-brand-pink animate-pulse">
                  This Week!
                </div>
                <Link href="/measurements">
                  <p className="text-xs text-brand-pink mt-1 flex items-center">
                    Tap to measure
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </p>
                </Link>
              </>
            ) : daysUntilMeasurement ? (
              <>
                <div className="text-2xl sm:text-3xl font-bold">
                  {daysUntilMeasurement}
                  <span className="text-sm font-normal text-muted-foreground ml-1">days</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Until next
                </p>
              </>
            ) : (
              <>
                <div className="text-xl sm:text-2xl font-bold text-brand-mint">
                  Complete!
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  All done ✓
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Today's tracking - mobile optimized */}
      <Card className="animate-fade-in-delay">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Today&apos;s Progress</CardTitle>
              <CardDescription className="text-xs mt-1">{weekPhase.description}</CardDescription>
            </div>
            {!todayTracking && (
              <Link href="/tracking">
                <Button size="sm" variant="brand" className="animate-pulse">
                  Track Now
                </Button>
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {todayTracking ? (
            <div className="space-y-4">
              {/* Mobile-optimized metric grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <Moon className="h-5 w-5 text-brand-blue" />
                    <span className="text-xl font-bold">{todayTracking.hours_sleep || '-'}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Hours sleep</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <Droplets className="h-5 w-5 text-brand-blue" />
                    <span className="text-xl font-bold">{todayTracking.ounces_water || '-'}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Ounces water</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <Footprints className="h-5 w-5 text-brand-mint" />
                    <span className="text-xl font-bold">
                      {todayTracking.steps ? (todayTracking.steps / 1000).toFixed(1) + 'k' : '-'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Steps today</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <Activity className="h-5 w-5 text-brand-pink" />
                    <span className="text-xl font-bold">{todayTracking.meals?.length || 0}/4</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Meals tracked</p>
                </div>
              </div>

              {/* Quick action to continue tracking */}
              <Link href="/tracking" className="block">
                <Button variant="outline" className="w-full">
                  Continue Tracking
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-brand-pink/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="h-8 w-8 text-brand-pink" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Start tracking to build your healthy habits
              </p>
              <Link href="/tracking">
                <Button variant="brand" className="w-full max-w-xs">
                  Start Today&apos;s Tracking
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick actions - mobile optimized with swipe hint */}
      <div className="space-y-3 animate-fade-in-delay-2">
        <h3 className="text-sm font-medium text-muted-foreground px-1">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href="/tracking" className="block">
            <Card className="hover:shadow-md transition-all cursor-pointer group touch-manipulation">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-brand-pink/10 rounded-full flex items-center justify-center group-hover:bg-brand-pink/20 transition-colors">
                    <Activity className="h-5 w-5 text-brand-pink" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Daily Tracking</p>
                    <p className="text-xs text-muted-foreground">Log meals & habits</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
              </CardContent>
            </Card>
          </Link>

          {isMeasurementWeekNow && (
            <Link href="/measurements" className="block">
              <Card className="hover:shadow-md transition-all cursor-pointer group touch-manipulation border-brand-pink">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-brand-mint/10 rounded-full flex items-center justify-center group-hover:bg-brand-mint/20 transition-colors">
                      <TrendingUp className="h-5 w-5 text-brand-mint" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Take Measurements</p>
                      <p className="text-xs text-brand-pink font-medium">Due this week!</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
                </CardContent>
              </Card>
            </Link>
          )}

          <Link href="/progress" className="block">
            <Card className="hover:shadow-md transition-all cursor-pointer group touch-manipulation">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-brand-blue/10 rounded-full flex items-center justify-center group-hover:bg-brand-blue/20 transition-colors">
                    <TrendingUp className="h-5 w-5 text-brand-blue" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">View Progress</p>
                    <p className="text-xs text-muted-foreground">Charts & insights</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Motivational message */}
      {currentStreak > 0 && (
        <Card className="bg-gradient-to-r from-brand-pink/10 to-brand-mint/10 border-0 animate-scale-in">
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 text-brand-pink mx-auto mb-2" />
            <p className="text-sm font-medium">
              {currentStreak >= 7 ? '🎉 Amazing work! ' : '💪 Great job! '}
              You&apos;re on a {currentStreak} day streak!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}