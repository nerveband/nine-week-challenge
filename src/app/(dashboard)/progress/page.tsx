'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Loader2, Download, TrendingDown, Droplets, Moon, Footprints, Cookie, Calendar, Utensils } from 'lucide-react'
import type { Database } from '@/types/database'
import { getCurrentWeek, getStreakDays } from '@/lib/utils'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

interface ProgressData {
  measurements: any[]
  dailyTracking: any[]
  meals: any[]
  treats: any[]
}

const COLORS = {
  primary: '#FF4500',        // Vibrant orange-red
  secondary: '#FF8C42',      // Warm orange
  tertiary: '#3B82F6',       // Bright blue
  quaternary: '#10B981',     // Success green
  accent: '#F59E0B',         // Bold amber
}

export default function ProgressPage() {
  const router = useRouter()
  const supabase = createClientComponentClient<Database>()
  const [isLoading, setIsLoading] = useState(false)
  const [currentWeek, setCurrentWeek] = useState(1)
  const [progressData, setProgressData] = useState<ProgressData>({
    measurements: [],
    dailyTracking: [],
    meals: [],
    treats: [],
  })
  const [stats, setStats] = useState({
    averageWater: 0,
    averageSleep: 0,
    averageSteps: 0,
    totalDaysTracked: 0,
    currentStreak: 0,
    treatFrequency: 0,
  })

  useEffect(() => {
    loadProgressData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadProgressData = async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('program_start_date')
        .eq('id', user.id)
        .single()

      if (profile) {
        const week = getCurrentWeek(profile.program_start_date)
        setCurrentWeek(week)
      }

      // Get all data
      const [measurementsRes, trackingRes, mealsRes, treatsRes] = await Promise.all([
        supabase
          .from('measurements')
          .select('*')
          .eq('user_id', user.id)
          .order('week_number', { ascending: true }),
        supabase
          .from('daily_tracking')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: true }),
        supabase
          .from('meals')
          .select('*, daily_tracking!inner(date, user_id)')
          .eq('daily_tracking.user_id', user.id)
          .order('daily_tracking.date', { ascending: true }),
        supabase
          .from('treats')
          .select('*, daily_tracking!inner(date, user_id)')
          .eq('daily_tracking.user_id', user.id)
          .order('daily_tracking.date', { ascending: true }),
      ])

      const progressData = {
        measurements: measurementsRes.data || [],
        dailyTracking: trackingRes.data || [],
        meals: mealsRes.data || [],
        treats: treatsRes.data || [],
      }

      setProgressData(progressData)
      calculateStats(progressData)
    } catch (error) {
      console.error('Error loading progress data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateStats = (data: ProgressData) => {
    const { dailyTracking, treats } = data

    if (dailyTracking.length === 0) {
      return
    }

    // Calculate averages
    const waterSum = dailyTracking.reduce((sum, day) => sum + (day.ounces_water || 0), 0)
    const sleepSum = dailyTracking.reduce((sum, day) => sum + (day.hours_sleep || 0), 0)
    const stepsSum = dailyTracking.reduce((sum, day) => sum + (day.steps || 0), 0)
    
    const validWaterDays = dailyTracking.filter(day => day.ounces_water > 0).length
    const validSleepDays = dailyTracking.filter(day => day.hours_sleep > 0).length
    const validStepDays = dailyTracking.filter(day => day.steps > 0).length

    // Calculate treat frequency
    const daysWithTreats = new Set(treats.map(treat => treat.daily_tracking.date)).size
    const treatFrequency = dailyTracking.length > 0 ? (daysWithTreats / dailyTracking.length) * 100 : 0

    setStats({
      averageWater: validWaterDays > 0 ? Math.round(waterSum / validWaterDays) : 0,
      averageSleep: validSleepDays > 0 ? Math.round((sleepSum / validSleepDays) * 10) / 10 : 0,
      averageSteps: validStepDays > 0 ? Math.round(stepsSum / validStepDays) : 0,
      totalDaysTracked: dailyTracking.length,
      currentStreak: getStreakDays(dailyTracking),
      treatFrequency: Math.round(treatFrequency),
    })
  }

  const getMeasurementChartData = () => {
    return progressData.measurements.map(m => ({
      week: `Week ${m.week_number}`,
      Hip: m.hip || 0,
      Waist: m.waist || 0,
      Chest: m.chest || 0,
      'Chest 2': m.chest_2 || 0,
      Thigh: m.thigh || 0,
      Bicep: m.bicep || 0,
    }))
  }

  const getDailyHabitsChartData = () => {
    const last30Days = progressData.dailyTracking.slice(-30)
    return last30Days.map(day => ({
      date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      Water: day.ounces_water || 0,
      Sleep: (day.hours_sleep || 0) * 10, // Scale up for visibility
      Steps: Math.round((day.steps || 0) / 100), // Scale down for visibility
    }))
  }

  const getHungerFullnessData = () => {
    const mealData = progressData.meals.reduce((acc, meal) => {
      const date = meal.daily_tracking.date
      if (!acc[date]) {
        acc[date] = { hunger: [], fullness: [] }
      }
      if (meal.hunger_before) acc[date].hunger.push(meal.hunger_before)
      if (meal.fullness_after) acc[date].fullness.push(meal.fullness_after)
      return acc
    }, {} as Record<string, { hunger: number[], fullness: number[] }>)

    return (Object.entries(mealData) as [string, { hunger: number[], fullness: number[] }][])
      .slice(-14) // Last 2 weeks
      .map(([date, values]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        'Avg Hunger': values.hunger.length > 0 ? Math.round((values.hunger.reduce((a, b) => a + b, 0) / values.hunger.length) * 10) / 10 : 0,
        'Avg Fullness': values.fullness.length > 0 ? Math.round((values.fullness.reduce((a, b) => a + b, 0) / values.fullness.length) * 10) / 10 : 0,
      }))
  }

  const getTreatData = () => {
    const treatCounts = progressData.treats.reduce((acc, treat) => {
      acc[treat.treat_type] = (acc[treat.treat_type] || 0) + treat.quantity
      return acc
    }, {} as Record<string, number>)

    return Object.entries(treatCounts).map(([type, count]) => ({
      name: type,
      value: count,
    }))
  }

  const exportData = () => {
    // TODO: Implement CSV export
    console.log('Export functionality coming soon!')
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 md:pb-0">
      {/* Mobile-optimized header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Progress</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Week {currentWeek} • Your transformation journey
          </p>
        </div>
        <Button onClick={exportData} variant="outline" size="sm" className="w-full sm:w-auto">
          <Download className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </div>

      {/* Stats Overview - Mobile optimized grid */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 animate-fade-in-delay">
        <Card className="hover:shadow-md transition-shadow touch-manipulation">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Avg Water</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Droplets className="h-4 w-4 text-brand-blue" />
              <span className="text-lg sm:text-2xl font-bold">{stats.averageWater}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">ounces</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow touch-manipulation">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Avg Sleep</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Moon className="h-4 w-4 text-brand-blue" />
              <span className="text-lg sm:text-2xl font-bold">{stats.averageSleep}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">hours</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow touch-manipulation">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Avg Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Footprints className="h-4 w-4 text-brand-mint" />
              <span className="text-lg sm:text-2xl font-bold">{(stats.averageSteps / 1000).toFixed(1)}k</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">daily</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow touch-manipulation">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Days Tracked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Calendar className="h-4 w-4 text-brand-pink" />
              <span className="text-lg sm:text-2xl font-bold">{stats.totalDaysTracked}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">total</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow touch-manipulation">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Current Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <TrendingDown className="h-4 w-4 text-brand-yellow rotate-180" />
              <span className="text-lg sm:text-2xl font-bold">{stats.currentStreak}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">days</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow touch-manipulation">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Treat Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Cookie className="h-4 w-4 text-brand-yellow" />
              <span className="text-lg sm:text-2xl font-bold">{stats.treatFrequency}%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">of days</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts - Mobile optimized tabs */}
      <Tabs defaultValue="measurements" className="space-y-4 animate-fade-in-delay-2">
        {/* Mobile scrollable tabs */}
        <div className="-mx-4 px-4 overflow-x-auto">
          <TabsList className="grid w-max grid-cols-4 gap-1 min-w-full">
            <TabsTrigger value="measurements" className="text-xs sm:text-sm">Measurements</TabsTrigger>
            <TabsTrigger value="habits" className="text-xs sm:text-sm">Daily Habits</TabsTrigger>
            <TabsTrigger value="hunger" className="text-xs sm:text-sm">Hunger/Fullness</TabsTrigger>
            <TabsTrigger value="treats" className="text-xs sm:text-sm">Treats</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="measurements" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Body Measurements Over Time</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Track your physical transformation</CardDescription>
            </CardHeader>
            <CardContent>
              {progressData.measurements.length > 0 ? (
                <div className="w-full">
                  <ResponsiveContainer width="100%" height={300} className="sm:!h-[400px]">
                    <LineChart data={getMeasurementChartData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="week" 
                        tick={{ fontSize: 12 }}
                        className="text-xs"
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        className="text-xs"
                      />
                      <Tooltip 
                        contentStyle={{ 
                          background: 'white', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Line type="monotone" dataKey="Hip" stroke="#E5B5D3" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="Waist" stroke="#B8E5D5" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="Chest" stroke="#C5D5F7" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="Thigh" stroke="#F7E5B5" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="w-16 h-16 bg-brand-pink/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingDown className="h-8 w-8 text-brand-pink" />
                  </div>
                  <p className="text-sm">No measurement data yet.</p>
                  <p className="text-xs mt-1">Measurements are taken on weeks 1, 3, 5, 7, and 9.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="habits" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Daily Habits Trend</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Water (oz), Sleep (hrs x10), Steps (/100)</CardDescription>
            </CardHeader>
            <CardContent>
              {progressData.dailyTracking.length > 0 ? (
                <div className="w-full">
                  <ResponsiveContainer width="100%" height={300} className="sm:!h-[400px]">
                    <BarChart data={getDailyHabitsChartData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          background: 'white', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Bar dataKey="Water" fill="#C5D5F7" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="Sleep" fill="#B8E5D5" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="Steps" fill="#E5B5D3" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="w-16 h-16 bg-brand-mint/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Droplets className="h-8 w-8 text-brand-mint" />
                  </div>
                  <p className="text-sm">No tracking data yet.</p>
                  <p className="text-xs mt-1">Start tracking your daily habits!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hunger" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Hunger & Fullness Patterns</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Average levels throughout your journey</CardDescription>
            </CardHeader>
            <CardContent>
              {progressData.meals.length > 0 ? (
                <div className="w-full">
                  <ResponsiveContainer width="100%" height={300} className="sm:!h-[400px]">
                    <LineChart data={getHungerFullnessData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis 
                        domain={[0, 10]} 
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          background: 'white', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Line type="monotone" dataKey="Avg Hunger" stroke="#E5B5D3" strokeWidth={3} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="Avg Fullness" stroke="#B8E5D5" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="w-16 h-16 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Utensils className="h-8 w-8 text-brand-blue" />
                  </div>
                  <p className="text-sm">No meal tracking data yet.</p>
                  <p className="text-xs mt-1">Meal tracking starts in week 4.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="treats" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Treat Distribution</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Types of treats enjoyed during your journey</CardDescription>
            </CardHeader>
            <CardContent>
              {progressData.treats.length > 0 ? (
                <div className="w-full">
                  <ResponsiveContainer width="100%" height={300} className="sm:!h-[400px]">
                    <PieChart>
                      <Pie
                        data={getTreatData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={window.innerWidth < 640 ? 80 : 120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getTreatData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={[
                            '#E5B5D3', // brand-pink
                            '#B8E5D5', // brand-mint  
                            '#C5D5F7', // brand-blue
                            '#F7E5B5', // brand-yellow
                            '#F7D5E7'  // brand-pink-light
                          ][index % 5]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          background: 'white', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="w-16 h-16 bg-brand-yellow/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Cookie className="h-8 w-8 text-brand-yellow" />
                  </div>
                  <p className="text-sm">No treats tracked yet.</p>
                  <p className="text-xs mt-1">It's okay to enjoy treats mindfully!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}