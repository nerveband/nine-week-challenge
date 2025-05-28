'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import { Loader2, Download, TrendingDown, Droplets, Moon, Footprints, Cookie, Calendar } from 'lucide-react'
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
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Progress</h1>
          <p className="text-muted-foreground">
            Week {currentWeek} - Your transformation journey
          </p>
        </div>
        <Button onClick={exportData} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Water</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-brand-info" />
              <span className="text-2xl font-bold">{stats.averageWater} oz</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Sleep</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4 text-brand-info" />
              <span className="text-2xl font-bold">{stats.averageSleep} hrs</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Footprints className="h-4 w-4 text-brand-success" />
              <span className="text-2xl font-bold">{stats.averageSteps.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Days Tracked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-brand-neutral" />
              <span className="text-2xl font-bold">{stats.totalDaysTracked}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-brand-primary rotate-180" />
              <span className="text-2xl font-bold">{stats.currentStreak} days</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Treat Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Cookie className="h-4 w-4 text-brand-warning" />
              <span className="text-2xl font-bold">{stats.treatFrequency}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="measurements" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="measurements">Measurements</TabsTrigger>
          <TabsTrigger value="habits">Daily Habits</TabsTrigger>
          <TabsTrigger value="hunger">Hunger/Fullness</TabsTrigger>
          <TabsTrigger value="treats">Treats</TabsTrigger>
        </TabsList>

        <TabsContent value="measurements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Body Measurements Over Time</CardTitle>
              <CardDescription>Track your physical transformation</CardDescription>
            </CardHeader>
            <CardContent>
              {progressData.measurements.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={getMeasurementChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Hip" stroke={COLORS.primary} strokeWidth={2} />
                    <Line type="monotone" dataKey="Waist" stroke={COLORS.secondary} strokeWidth={2} />
                    <Line type="monotone" dataKey="Chest" stroke={COLORS.tertiary} strokeWidth={2} />
                    <Line type="monotone" dataKey="Thigh" stroke={COLORS.quaternary} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No measurement data yet. Measurements are taken on weeks 1, 3, 5, 7, and 9.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="habits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Habits Trend</CardTitle>
              <CardDescription>Water (oz), Sleep (hrs x10), Steps (/100)</CardDescription>
            </CardHeader>
            <CardContent>
              {progressData.dailyTracking.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={getDailyHabitsChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Water" fill={COLORS.secondary} />
                    <Bar dataKey="Sleep" fill={COLORS.tertiary} />
                    <Bar dataKey="Steps" fill={COLORS.primary} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No tracking data yet. Start tracking your daily habits!
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hunger" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hunger & Fullness Patterns</CardTitle>
              <CardDescription>Average levels throughout your journey</CardDescription>
            </CardHeader>
            <CardContent>
              {progressData.meals.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={getHungerFullnessData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Avg Hunger" stroke={COLORS.primary} strokeWidth={2} />
                    <Line type="monotone" dataKey="Avg Fullness" stroke={COLORS.secondary} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No meal tracking data yet. Meal tracking starts in week 4.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="treats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Treat Distribution</CardTitle>
              <CardDescription>Types of treats enjoyed during your journey</CardDescription>
            </CardHeader>
            <CardContent>
              {progressData.treats.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={getTreatData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getTreatData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index % Object.values(COLORS).length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No treats tracked yet. It&apos;s okay to enjoy treats mindfully!
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}