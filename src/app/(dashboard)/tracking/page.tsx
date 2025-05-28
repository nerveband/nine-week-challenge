'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { dailyTrackingSchema, type DailyTrackingInput } from '@/lib/validations'
import { supabase } from '@/lib/supabase/client'
import { Loader2, Moon, Droplets, Footprints, Trophy } from 'lucide-react'
import { getCurrentWeek, getWeekPhase } from '@/lib/utils'

export default function TrackingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [currentWeek, setCurrentWeek] = useState(1)
  const [weekPhase, setWeekPhase] = useState<'basic' | 'hunger' | 'satisfaction'>('basic')
  const [trackingId, setTrackingId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DailyTrackingInput>({
    resolver: zodResolver(dailyTrackingSchema),
  })

  useEffect(() => {
    loadUserDataAndTracking()
  }, [])

  const loadUserDataAndTracking = async () => {
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
        const phase = getWeekPhase(week)
        setWeekPhase(phase.phase)
      }

      // Get today's tracking
      const today = new Date().toISOString().split('T')[0]
      const { data: tracking } = await supabase
        .from('daily_tracking')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single()

      if (tracking) {
        setTrackingId(tracking.id)
        reset({
          hours_sleep: tracking.hours_sleep || undefined,
          ounces_water: tracking.ounces_water || undefined,
          steps: tracking.steps || undefined,
          daily_win: tracking.daily_win || '',
          notes: tracking.notes || '',
        })
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: DailyTrackingInput) => {
    setIsSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const today = new Date().toISOString().split('T')[0]
      
      if (trackingId) {
        // Update existing tracking
        const { error } = await supabase
          .from('daily_tracking')
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq('id', trackingId)

        if (error) throw error
      } else {
        // Create new tracking
        const { data: newTracking, error } = await supabase
          .from('daily_tracking')
          .insert({
            user_id: user.id,
            date: today,
            ...data,
          })
          .select()
          .single()

        if (error) throw error
        if (newTracking) setTrackingId(newTracking.id)
      }

      toast({
        title: 'Success',
        description: 'Daily tracking saved!',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save tracking data',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Daily Tracking</h1>
        <p className="text-muted-foreground">
          Week {currentWeek} - {weekPhase === 'basic' ? 'Building Basic Habits' : weekPhase === 'hunger' ? 'Hunger Awareness' : 'Mindful Satisfaction'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Tracking</CardTitle>
            <CardDescription>Track your daily habits</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="hours_sleep" className="flex items-center gap-2">
                <Moon className="h-4 w-4" />
                Hours of Sleep
              </Label>
              <Input
                id="hours_sleep"
                type="number"
                step="0.5"
                min="0"
                max="24"
                placeholder="8"
                {...register('hours_sleep', { valueAsNumber: true })}
              />
              {errors.hours_sleep && (
                <p className="text-sm text-red-600">{errors.hours_sleep.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ounces_water" className="flex items-center gap-2">
                <Droplets className="h-4 w-4" />
                Ounces of Water
              </Label>
              <Input
                id="ounces_water"
                type="number"
                min="0"
                max="300"
                placeholder="64"
                {...register('ounces_water', { valueAsNumber: true })}
              />
              {errors.ounces_water && (
                <p className="text-sm text-red-600">{errors.ounces_water.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="steps" className="flex items-center gap-2">
                <Footprints className="h-4 w-4" />
                Number of Steps
              </Label>
              <Input
                id="steps"
                type="number"
                min="0"
                max="100000"
                placeholder="10000"
                {...register('steps', { valueAsNumber: true })}
              />
              {errors.steps && (
                <p className="text-sm text-red-600">{errors.steps.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Win</CardTitle>
            <CardDescription>What went well today?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="daily_win" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Your Win
              </Label>
              <Input
                id="daily_win"
                type="text"
                placeholder="I drank water before each meal..."
                {...register('daily_win')}
              />
              {errors.daily_win && (
                <p className="text-sm text-red-600">{errors.daily_win.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
            <CardDescription>Any additional thoughts or reflections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <textarea
                id="notes"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="How you felt today, challenges, observations..."
                {...register('notes')}
              />
              {errors.notes && (
                <p className="text-sm text-red-600">{errors.notes.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="brand" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Daily Tracking'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}