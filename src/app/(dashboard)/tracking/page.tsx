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
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Loader2, Moon, Droplets, Footprints, Trophy, Clock, Utensils, Cookie, Plus, X, Save, ChevronRight, CheckCircle2, Info } from 'lucide-react'
import type { Database } from '@/types/database'
import { getCurrentWeek, getWeekPhase } from '@/lib/utils'
import { TREAT_CATEGORIES, type MealType } from '@/types'

interface ExtendedDailyTrackingInput extends DailyTrackingInput {
  meals?: MealInput[]
  treats?: TreatInput[]
}

export default function TrackingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient<Database>()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [currentWeek, setCurrentWeek] = useState(1)
  const [weekPhase, setWeekPhase] = useState<'basic' | 'hunger' | 'satisfaction'>('basic')
  const [trackingId, setTrackingId] = useState<string | null>(null)
  const [existingMeals, setExistingMeals] = useState<any[]>([])
  const [existingTreats, setExistingTreats] = useState<any[]>([])
  const [activeSection, setActiveSection] = useState<'basics' | 'meals' | 'treats' | 'reflection'>('basics')
  const [showFullnessReference, setShowFullnessReference] = useState(false)

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
      hours_sleep: 8,
      ounces_water: 64,
      steps: 5000,
      daily_win: '',
      notes: '',
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
          hours_sleep: tracking.hours_sleep || 8,
          ounces_water: tracking.ounces_water || 64,
          steps: tracking.steps || 5000,
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
      appendMeal({ 
        meal_type: mealType,
        meal_time: '',
        hunger_before: 5,
        fullness_after: 7,
        duration_minutes: 20,
        distracted: false
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-pink" />
      </div>
    )
  }

  const phaseInfo = {
    basic: { title: 'Building Basic Habits', icon: '🌱' },
    hunger: { title: 'Hunger Awareness', icon: '🎯' },
    satisfaction: { title: 'Mindful Satisfaction', icon: '✨' }
  }

  return (
    <div className="space-y-4 pb-20 md:pb-0">
      {/* Header with mobile-optimized layout */}
      <div className="sticky top-16 md:relative md:top-0 z-10 bg-gray-50 -mx-4 px-4 py-3 md:bg-transparent md:py-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Daily Tracking</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <span>{phaseInfo[weekPhase].icon}</span>
              Week {currentWeek} • {phaseInfo[weekPhase].title}
            </p>
          </div>
          {trackingId && (
            <div className="flex items-center gap-1 text-xs sm:text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <CheckCircle2 className="h-3 w-3" />
              <span className="hidden sm:inline">Saved</span>
            </div>
          )}
        </div>
      </div>

      {/* Mobile navigation tabs */}
      <div className="md:hidden -mx-4 px-4 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {[
            { id: 'basics', label: 'Basics', icon: Footprints },
            ...(weekPhase !== 'basic' ? [{ id: 'meals', label: 'Meals', icon: Utensils }] : []),
            { id: 'treats', label: 'Treats', icon: Cookie },
            { id: 'reflection', label: 'Reflection', icon: Trophy }
          ].map((section) => {
            const Icon = section.icon
            return (
              <Button
                key={section.id}
                variant={activeSection === section.id ? 'brand' : 'outline'}
                size="sm"
                onClick={() => setActiveSection(section.id as any)}
                className="flex items-center gap-1"
              >
                <Icon className="h-4 w-4" />
                {section.label}
              </Button>
            )
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
        {/* Desktop layout with sidebar */}
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-2 space-y-4 md:space-y-6">
            {/* Basic tracking - always visible on desktop, conditional on mobile */}
            <Card className={`${activeSection !== 'basics' && 'hidden md:block'}`}>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Basic Tracking</CardTitle>
                <CardDescription className="text-xs">Track your daily habits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Sleep tracking with visual feedback */}
                <div className="space-y-3">
                  <Label className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Moon className="h-4 w-4 text-brand-blue" />
                      Sleep
                    </span>
                    <span className="text-xl font-bold">{watch('hours_sleep') || 8}h</span>
                  </Label>
                  <Slider
                    value={[watch('hours_sleep') || 8]}
                    onValueChange={(value) => setValue('hours_sleep', value[0])}
                    min={0}
                    max={12}
                    step={0.5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0h</span>
                    <span className="text-center">Goal: 7-9h</span>
                    <span>12h</span>
                  </div>
                </div>

                {/* Water intake with visual glasses */}
                <div className="space-y-3">
                  <Label className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-brand-blue" />
                      Water
                    </span>
                    <span className="text-xl font-bold">{Math.round((watch('ounces_water') || 64) / 8)} cups</span>
                  </Label>
                  <div className="grid grid-cols-8 gap-1">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setValue('ounces_water', (i + 1) * 8)}
                        className={`h-8 rounded-md transition-all ${
                          (watch('ounces_water') || 64) >= (i + 1) * 8
                            ? 'bg-blue-500 hover:bg-blue-600'
                            : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                        aria-label={`${i + 1} glasses`}
                      >
                        <Droplets className="h-4 w-4 mx-auto text-white" />
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Tap to set • 1 cup = 8 oz • Goal: 8 cups (64 oz)
                  </p>
                </div>

                {/* Steps with quick add buttons */}
                <div className="space-y-3">
                  <Label className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Footprints className="h-4 w-4 text-brand-mint" />
                      Steps
                    </span>
                    <span className="text-xl font-bold">{(watch('steps') || 5000).toLocaleString()}</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      min="0"
                      max="50000"
                      className="flex-1 h-12 text-base"
                      {...register('steps', { 
                        setValueAs: (v) => v === '' ? 0 : parseInt(v, 10),
                      })}
                    />
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-12 px-3"
                        onClick={() => setValue('steps', (watch('steps') || 5000) + 1000)}
                      >
                        +1k
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-12 px-3"
                        onClick={() => setValue('steps', (watch('steps') || 5000) + 5000)}
                      >
                        +5k
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Goal: 10,000 steps
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Meal tracking - conditional based on phase and active section */}
            {weekPhase !== 'basic' && (
              <Card className={`${activeSection !== 'meals' && 'hidden md:block'}`}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Meal Tracking</CardTitle>
                      <CardDescription className="text-xs">Track hunger & fullness</CardDescription>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFullnessReference(!showFullnessReference)}
                      className="md:hidden"
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="meal1" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 h-auto">
                      {(['meal1', 'meal2', 'meal3', 'snack'] as MealType[]).map((mealType) => {
                        const hasMeal = mealFields.some(f => f.meal_type === mealType) || 
                                      existingMeals.some(m => m.meal_type === mealType)
                        return (
                          <TabsTrigger 
                            key={mealType} 
                            value={mealType}
                            className="text-xs py-2 data-[state=active]:bg-brand-pink data-[state=active]:text-white"
                          >
                            <div className="flex flex-col items-center gap-1">
                              <span>{mealType === 'snack' ? 'Snack' : `Meal ${mealType.slice(-1)}`}</span>
                              {hasMeal && <div className="w-1.5 h-1.5 bg-brand-mint rounded-full" />}
                            </div>
                          </TabsTrigger>
                        )
                      })}
                    </TabsList>
                    
                    {(['meal1', 'meal2', 'meal3', 'snack'] as MealType[]).map((mealType) => {
                      const mealIndex = mealFields.findIndex(f => f.meal_type === mealType)
                      const existingMeal = existingMeals.find(m => m.meal_type === mealType)
                      
                      return (
                        <TabsContent key={mealType} value={mealType} className="space-y-4 mt-4">
                          {mealIndex === -1 && !existingMeal ? (
                            <div className="text-center py-8">
                              <Utensils className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                              <p className="text-sm text-muted-foreground mb-4">No tracking for this meal yet</p>
                              <Button 
                                type="button" 
                                variant="brand"
                                onClick={() => addMealTracking(mealType)}
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                Track This Meal
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                  <Label className="text-xs">Time</Label>
                                  <Input
                                    type="time"
                                    className="h-10"
                                    defaultValue={existingMeal?.meal_time}
                                    {...(mealIndex !== -1 && register(`meals.${mealIndex}.meal_time`))}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs">Duration (min)</Label>
                                  <Input
                                    type="number"
                                    inputMode="numeric"
                                    min="1"
                                    max="180"
                                    className="h-10"
                                    defaultValue={existingMeal?.duration_minutes || 20}
                                    {...(mealIndex !== -1 && register(`meals.${mealIndex}.duration_minutes`, { valueAsNumber: true }))}
                                  />
                                </div>
                              </div>

                              <div className="space-y-3">
                                <div>
                                  <Label className="text-xs flex items-center justify-between mb-2">
                                    <span>Hunger Before</span>
                                    <span className="text-lg font-bold text-brand-pink">
                                      {watch(`meals.${mealIndex}.hunger_before`) || existingMeal?.hunger_before || 5}
                                    </span>
                                  </Label>
                                  <Slider
                                    min={1}
                                    max={10}
                                    step={1}
                                    defaultValue={[existingMeal?.hunger_before || 5]}
                                    onValueChange={(value) => mealIndex !== -1 && setValue(`meals.${mealIndex}.hunger_before`, value[0])}
                                    className="w-full"
                                  />
                                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                    <span>Stuffed</span>
                                    <span>Starving</span>
                                  </div>
                                </div>

                                <div>
                                  <Label className="text-xs flex items-center justify-between mb-2">
                                    <span>Fullness After</span>
                                    <span className="text-lg font-bold text-brand-mint">
                                      {watch(`meals.${mealIndex}.fullness_after`) || existingMeal?.fullness_after || 7}
                                    </span>
                                  </Label>
                                  <Slider
                                    min={1}
                                    max={10}
                                    step={1}
                                    defaultValue={[existingMeal?.fullness_after || 7]}
                                    onValueChange={(value) => mealIndex !== -1 && setValue(`meals.${mealIndex}.fullness_after`, value[0])}
                                    className="w-full"
                                  />
                                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                    <span>Still hungry</span>
                                    <span>Too full</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg">
                                <Checkbox
                                  id={`distracted-${mealType}`}
                                  defaultChecked={existingMeal?.distracted}
                                  {...(mealIndex !== -1 && register(`meals.${mealIndex}.distracted`))}
                                />
                                <Label 
                                  htmlFor={`distracted-${mealType}`}
                                  className="text-sm cursor-pointer"
                                >
                                  I was distracted while eating
                                </Label>
                              </div>

                              {mealIndex !== -1 && (
                                <input type="hidden" {...register(`meals.${mealIndex}.meal_type`)} value={mealType} />
                              )}
                            </div>
                          )}
                        </TabsContent>
                      )
                    })}
                  </Tabs>
                </CardContent>
              </Card>
            )}

            {/* Treats section */}
            <Card className={`${activeSection !== 'treats' && 'hidden md:block'}`}>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Treats</CardTitle>
                <CardDescription className="text-xs">Track treats you enjoyed today</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {treatFields.length === 0 && existingTreats.length === 0 && (
                  <div className="text-center py-6 text-sm text-muted-foreground">
                    No treats tracked today
                  </div>
                )}
                
                {treatFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <Select
                      value={watch(`treats.${index}.treat_type`)}
                      onValueChange={(value) => setValue(`treats.${index}.treat_type`, value)}
                    >
                      <SelectTrigger className="flex-1 h-10">
                        <SelectValue placeholder="Select treat" />
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
                      inputMode="numeric"
                      min="1"
                      max="10"
                      placeholder="#"
                      className="w-16 h-10"
                      {...register(`treats.${index}.quantity`, { valueAsNumber: true })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10"
                      onClick={() => removeTreat(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                {existingTreats.map((treat, index) => (
                  <div key={`existing-${index}`} className="flex gap-2 opacity-60">
                    <div className="flex-1 h-10 px-3 py-2 bg-gray-100 rounded-md text-sm">
                      {treat.treat_type}
                    </div>
                    <div className="w-16 h-10 px-3 py-2 bg-gray-100 rounded-md text-sm text-center">
                      {treat.quantity}
                    </div>
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => appendTreat({ treat_type: '', quantity: 1 })}
                  className="w-full h-10"
                >
                  <Cookie className="mr-2 h-4 w-4" />
                  Add Treat
                </Button>
              </CardContent>
            </Card>

            {/* Reflection section */}
            <Card className={`${activeSection !== 'reflection' && 'hidden md:block'}`}>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Daily Reflection</CardTitle>
                <CardDescription className="text-xs">Celebrate your wins & reflect</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="daily_win" className="text-sm flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-brand-yellow" />
                    Today's Win
                  </Label>
                  <Input
                    id="daily_win"
                    type="text"
                    placeholder="What went well today?"
                    className="h-12"
                    {...register('daily_win')}
                  />
                  {errors.daily_win && (
                    <p className="text-xs text-red-600">{errors.daily_win.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm">Notes (optional)</Label>
                  <textarea
                    id="notes"
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="How you felt today, challenges, observations..."
                    {...register('notes')}
                  />
                  {errors.notes && (
                    <p className="text-xs text-red-600">{errors.notes.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Desktop sidebar */}
          <div className="hidden md:block space-y-4">
            {weekPhase !== 'basic' && <FullnessScaleReference />}
            
            {/* Progress summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Today's Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Moon className="h-3 w-3" />
                    Sleep
                  </span>
                  <span className="font-medium">{watch('hours_sleep') || 8}h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Droplets className="h-3 w-3" />
                    Water
                  </span>
                  <span className="font-medium">{Math.round((watch('ounces_water') || 64) / 8)} cups</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Footprints className="h-3 w-3" />
                    Steps
                  </span>
                  <span className="font-medium">{(watch('steps') || 5000).toLocaleString()}</span>
                </div>
                {weekPhase !== 'basic' && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Utensils className="h-3 w-3" />
                      Meals
                    </span>
                    <span className="font-medium">
                      {mealFields.length + existingMeals.length}/4
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Mobile save button - floating */}
        <div className="md:hidden fixed bottom-20 left-4 right-4 z-20">
          <Button 
            type="submit" 
            variant="brand" 
            className="w-full h-12 shadow-lg"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" />
                Save Today's Tracking
              </>
            )}
          </Button>
        </div>

        {/* Desktop save button */}
        <div className="hidden md:flex justify-end">
          <Button 
            type="submit" 
            variant="brand" 
            size="lg" 
            disabled={isSaving}
          >
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

      {/* Mobile fullness reference modal */}
      {showFullnessReference && weekPhase !== 'basic' && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50 flex items-end">
          <div className="bg-white rounded-t-2xl w-full max-h-[80vh] overflow-y-auto animate-slide-up">
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h3 className="font-semibold">Hunger & Fullness Scale</h3>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowFullnessReference(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-4">
              <FullnessScaleReference />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}