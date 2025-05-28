'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { FullnessScaleReference } from '@/components/forms/fullness-scale-reference'
import { dailyTrackingSchema, mealSchema, treatSchema, type DailyTrackingInput, type MealInput, type TreatInput } from '@/lib/validations'
import { supabase } from '@/lib/supabase/client'
import { Loader2, Moon, Droplets, Footprints, Trophy, Clock, Utensils, Cookie, Plus, X } from 'lucide-react'
import { getCurrentWeek, getWeekPhase } from '@/lib/utils'
import { TREAT_CATEGORIES, type MealType } from '@/types'

interface ExtendedDailyTrackingInput extends DailyTrackingInput {
  meals?: MealInput[]
  treats?: TreatInput[]
}

export default function TrackingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [currentWeek, setCurrentWeek] = useState(1)
  const [weekPhase, setWeekPhase] = useState<'basic' | 'hunger' | 'satisfaction'>('basic')
  const [trackingId, setTrackingId] = useState<string | null>(null)
  const [existingMeals, setExistingMeals] = useState<any[]>([])
  const [existingTreats, setExistingTreats] = useState<any[]>([])

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<ExtendedDailyTrackingInput>({
    resolver: zodResolver(dailyTrackingSchema),
    defaultValues: {
      meals: [],
      treats: [],
    }
  })

  const { fields: mealFields, append: appendMeal, remove: removeMeal } = useFieldArray({
    control,
    name: 'meals',
  })

  const { fields: treatFields, append: appendTreat, remove: removeTreat } = useFieldArray({
    control,
    name: 'treats',
  })

  useEffect(() => {
    loadUserDataAndTracking()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        .select('*, meals(*), treats(*)')
        .eq('user_id', user.id)
        .eq('date', today)
        .single()

      if (tracking) {
        setTrackingId(tracking.id)
        setExistingMeals(tracking.meals || [])
        setExistingTreats(tracking.treats || [])
        
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

  const onSubmit = async (data: ExtendedDailyTrackingInput) => {
    setIsSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const today = new Date().toISOString().split('T')[0]
      let currentTrackingId = trackingId
      
      // Save or update daily tracking
      if (currentTrackingId) {
        const { error } = await supabase
          .from('daily_tracking')
          .update({
            hours_sleep: data.hours_sleep,
            ounces_water: data.ounces_water,
            steps: data.steps,
            daily_win: data.daily_win,
            notes: data.notes,
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentTrackingId)

        if (error) throw error
      } else {
        const { data: newTracking, error } = await supabase
          .from('daily_tracking')
          .insert({
            user_id: user.id,
            date: today,
            hours_sleep: data.hours_sleep,
            ounces_water: data.ounces_water,
            steps: data.steps,
            daily_win: data.daily_win,
            notes: data.notes,
          })
          .select()
          .single()

        if (error) throw error
        if (newTracking) {
          currentTrackingId = newTracking.id
          setTrackingId(newTracking.id)
        }
      }

      // Save meals if in appropriate phase
      if (weekPhase !== 'basic' && data.meals && currentTrackingId) {
        for (const meal of data.meals) {
          const existingMeal = existingMeals.find(m => m.meal_type === meal.meal_type)
          
          if (existingMeal) {
            await supabase
              .from('meals')
              .update({
                meal_time: meal.meal_time,
                hunger_before: meal.hunger_before,
                fullness_after: meal.fullness_after,
                duration_minutes: meal.duration_minutes,
                distracted: meal.distracted,
              })
              .eq('id', existingMeal.id)
          } else {
            await supabase
              .from('meals')
              .insert({
                daily_tracking_id: currentTrackingId,
                ...meal,
              })
          }
        }
      }

      // Save treats
      if (data.treats && currentTrackingId) {
        // Delete existing treats
        await supabase
          .from('treats')
          .delete()
          .eq('daily_tracking_id', currentTrackingId)

        // Insert new treats
        for (const treat of data.treats) {
          await supabase
            .from('treats')
            .insert({
              daily_tracking_id: currentTrackingId,
              ...treat,
            })
        }
      }

      toast({
        title: 'Success',
        description: 'Daily tracking saved!',
      })
      
      // Reload data
      await loadUserDataAndTracking()
    } catch (error) {
      console.error('Error saving:', error)
      toast({
        title: 'Error',
        description: 'Failed to save tracking data',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const addMealTracking = (mealType: MealType) => {
    const existing = mealFields.find(f => f.meal_type === mealType)
    if (!existing) {
      appendMeal({ meal_type: mealType })
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

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
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

            {weekPhase !== 'basic' && (
              <Card>
                <CardHeader>
                  <CardTitle>Meal Tracking</CardTitle>
                  <CardDescription>Track hunger, fullness, and meal details</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="meal1">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="meal1">Meal 1</TabsTrigger>
                      <TabsTrigger value="meal2">Meal 2</TabsTrigger>
                      <TabsTrigger value="meal3">Meal 3</TabsTrigger>
                      <TabsTrigger value="snack">Snack</TabsTrigger>
                    </TabsList>
                    
                    {(['meal1', 'meal2', 'meal3', 'snack'] as MealType[]).map((mealType) => {
                      const mealIndex = mealFields.findIndex(f => f.meal_type === mealType)
                      const existingMeal = existingMeals.find(m => m.meal_type === mealType)
                      
                      return (
                        <TabsContent key={mealType} value={mealType} className="space-y-4">
                          {mealIndex === -1 && !existingMeal ? (
                            <div className="text-center py-8">
                              <p className="text-muted-foreground mb-4">No tracking for this meal yet</p>
                              <Button type="button" onClick={() => addMealTracking(mealType)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Track This Meal
                              </Button>
                            </div>
                          ) : (
                            <>
                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                  <Label>Meal Time</Label>
                                  <Input
                                    type="time"
                                    defaultValue={existingMeal?.meal_time}
                                    {...(mealIndex !== -1 && register(`meals.${mealIndex}.meal_time`))}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Duration (minutes)</Label>
                                  <Input
                                    type="number"
                                    min="1"
                                    max="180"
                                    defaultValue={existingMeal?.duration_minutes}
                                    {...(mealIndex !== -1 && register(`meals.${mealIndex}.duration_minutes`, { valueAsNumber: true }))}
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label>Hunger Before (1-10)</Label>
                                <div className="flex items-center space-x-4">
                                  <Slider
                                    min={1}
                                    max={10}
                                    step={1}
                                    defaultValue={[existingMeal?.hunger_before || 5]}
                                    onValueChange={(value) => mealIndex !== -1 && setValue(`meals.${mealIndex}.hunger_before`, value[0])}
                                    className="flex-1"
                                  />
                                  <span className="w-12 text-center font-semibold">
                                    {watch(`meals.${mealIndex}.hunger_before`) || existingMeal?.hunger_before || 5}
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label>Fullness After (1-10)</Label>
                                <div className="flex items-center space-x-4">
                                  <Slider
                                    min={1}
                                    max={10}
                                    step={1}
                                    defaultValue={[existingMeal?.fullness_after || 7]}
                                    onValueChange={(value) => mealIndex !== -1 && setValue(`meals.${mealIndex}.fullness_after`, value[0])}
                                    className="flex-1"
                                  />
                                  <span className="w-12 text-center font-semibold">
                                    {watch(`meals.${mealIndex}.fullness_after`) || existingMeal?.fullness_after || 7}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`distracted-${mealType}`}
                                  defaultChecked={existingMeal?.distracted}
                                  {...(mealIndex !== -1 && register(`meals.${mealIndex}.distracted`))}
                                />
                                <Label htmlFor={`distracted-${mealType}`}>
                                  I was distracted while eating (TV, phone, etc.)
                                </Label>
                              </div>

                              {mealIndex !== -1 && (
                                <input type="hidden" {...register(`meals.${mealIndex}.meal_type`)} value={mealType} />
                              )}
                            </>
                          )}
                        </TabsContent>
                      )
                    })}
                  </Tabs>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Treats</CardTitle>
                <CardDescription>Track any treats you enjoyed today</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {treatFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <Select
                      value={field.treat_type}
                      onValueChange={(value) => setValue(`treats.${index}.treat_type`, value)}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select treat type" />
                      </SelectTrigger>
                      <SelectContent>
                        {TREAT_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      placeholder="Qty"
                      className="w-20"
                      {...register(`treats.${index}.quantity`, { valueAsNumber: true })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTreat(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                {existingTreats.map((treat, index) => (
                  <div key={`existing-${index}`} className="flex gap-2 opacity-60">
                    <Input value={treat.treat_type} disabled className="flex-1" />
                    <Input value={treat.quantity} disabled className="w-20" />
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => appendTreat({ treat_type: '', quantity: 1 })}
                  className="w-full"
                >
                  <Cookie className="mr-2 h-4 w-4" />
                  Add Treat
                </Button>
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
              <Button type="submit" variant="brand" size="lg" disabled={isSaving}>
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

        <div className="lg:sticky lg:top-6 h-fit">
          {weekPhase !== 'basic' && <FullnessScaleReference />}
        </div>
      </div>
    </div>
  )
}