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
import { useToast } from '@/components/ui/use-toast'
import { FullnessScaleReference } from '@/components/forms/fullness-scale-reference'
import { dailyTrackingSchema, mealSchema, treatSchema, type DailyTrackingInput, type MealInput, type TreatInput } from '@/lib/validations'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Loader2, Moon, Droplets, Footprints, Trophy, Clock, Utensils, Cookie, Plus, X, Save, ChevronDown, ChevronUp, CheckCircle2, Info, AlertCircle } from 'lucide-react'
import type { Database } from '@/types/database'
import { getCurrentWeek, getWeekPhase } from '@/lib/utils'
import { TREAT_CATEGORIES, WEEKLY_HABITS, type MealType } from '@/types'

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
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    habits: true,
    basics: true,
    meals: true,
    treats: true,
    reflection: true
  })
  const [showFullnessReference, setShowFullnessReference] = useState(false)
  const [hadTreat, setHadTreat] = useState(false)

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
        setHadTreat((tracking.treats || []).length > 0)
        
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

      // Save meals
      if (data.meals && currentTrackingId) {
        for (const meal of data.meals) {
          const existingMeal = existingMeals.find(m => m.meal_type === meal.meal_type)
          
          if (existingMeal) {
            await supabase
              .from('meals')
              .update({
                ate_meal: meal.ate_meal,
                meal_time: meal.meal_time,
                distracted: meal.distracted,
                ate_slowly: meal.ate_slowly,
                hunger_minutes: meal.hunger_minutes,
                hunger_before: meal.hunger_before,
                fullness_after: meal.fullness_after,
                duration_minutes: meal.duration_minutes,
                snack_reason: meal.snack_reason,
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
      } else if (currentTrackingId) {
        // Clear treats if none
        await supabase
          .from('treats')
          .delete()
          .eq('daily_tracking_id', currentTrackingId)
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

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const getWeekRangeKey = () => {
    if (currentWeek <= 3) return '1-3'
    if (currentWeek <= 6) return '4-6'
    return '7-9'
  }

  const addOrUpdateMeal = (mealType: MealType) => {
    const existingIndex = mealFields.findIndex(f => f.meal_type === mealType)
    if (existingIndex === -1) {
      appendMeal({ 
        meal_type: mealType,
        ate_meal: true,
        meal_time: '',
        distracted: false,
        ate_slowly: false,
        hunger_minutes: 0,
        hunger_before: 5,
        fullness_after: 7,
        duration_minutes: 20,
        snack_reason: ''
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

  const weekRange = getWeekRangeKey()
  const habitInfo = WEEKLY_HABITS[weekRange as keyof typeof WEEKLY_HABITS]

  return (
    <div className="space-y-4 pb-20 md:pb-0">
      {/* Header with tracking status */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Daily Tracking</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Week {currentWeek} of 9
          </p>
        </div>
        {trackingId && (
          <div className="flex items-center gap-1 text-xs sm:text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full">
            <CheckCircle2 className="h-3 w-3" />
            <span>Saved</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
        {/* Weekly Habit Card */}
        <Card className="border-brand-pink bg-brand-pink/5">
          <CardHeader className="cursor-pointer" onClick={() => toggleSection('habits')}>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-brand-pink" />
                  This Week&apos;s Focus
                </CardTitle>
                <CardDescription className="text-sm mt-1">{habitInfo.title}</CardDescription>
              </div>
              {expandedSections.habits ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </CardHeader>
          {expandedSections.habits && (
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">Daily Goals:</h4>
                <ul className="space-y-1">
                  {habitInfo.goals.map((goal, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-brand-pink mt-0.5">•</span>
                      <span>{goal}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm mb-2">Instructions:</h4>
                <ul className="space-y-1">
                  {habitInfo.instructions.map((instruction, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-brand-blue mt-0.5">•</span>
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {'newInfo' in habitInfo && habitInfo.newInfo && (
                <div className="bg-brand-yellow/10 border border-brand-yellow/20 rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-1">{habitInfo.newInfo.title}</h4>
                  <p className="text-sm text-muted-foreground">{habitInfo.newInfo.content}</p>
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* Basic tracking */}
        <Card>
          <CardHeader className="cursor-pointer" onClick={() => toggleSection('basics')}>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Basic Tracking</CardTitle>
              {expandedSections.basics ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </CardHeader>
          {expandedSections.basics && (
            <CardContent className="space-y-6">
              {/* Sleep tracking */}
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

              {/* Water intake */}
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

              {/* Steps */}
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
          )}
        </Card>

        {/* Meals & Snacks */}
        <Card>
          <CardHeader className="cursor-pointer" onClick={() => toggleSection('meals')}>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Meals & Snacks</CardTitle>
                <CardDescription className="text-xs">Track each meal and snack</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {weekPhase === 'satisfaction' && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowFullnessReference(!showFullnessReference)
                    }}
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                )}
                {expandedSections.meals ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </div>
          </CardHeader>
          {expandedSections.meals && (
            <CardContent className="space-y-4">
              {(['meal1', 'meal2', 'meal3', 'snack'] as MealType[]).map((mealType) => {
                const mealIndex = mealFields.findIndex(f => f.meal_type === mealType)
                const existingMeal = existingMeals.find(m => m.meal_type === mealType)
                const hasMeal = mealIndex !== -1 || existingMeal
                const isSnack = mealType === 'snack'
                
                return (
                  <div key={mealType} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">
                        {isSnack ? 'Snack' : `Meal ${mealType.slice(-1)}`}
                      </h3>
                      {hasMeal && (
                        <CheckCircle2 className="h-4 w-4 text-brand-mint" />
                      )}
                    </div>

                    {/* Did you eat/have this meal/snack? */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`ate-${mealType}`}
                        checked={hasMeal}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            addOrUpdateMeal(mealType)
                          } else {
                            const idx = mealFields.findIndex(f => f.meal_type === mealType)
                            if (idx !== -1) removeMeal(idx)
                          }
                        }}
                      />
                      <Label htmlFor={`ate-${mealType}`} className="cursor-pointer">
                        {isSnack ? 'Did you have a snack?' : 'Did you eat this meal?'}
                      </Label>
                    </div>

                    {hasMeal && (
                      <div className="space-y-3 ml-6">
                        {/* Meal time */}
                        {!isSnack && (
                          <div className="space-y-2">
                            <Label className="text-xs">Time</Label>
                            <Input
                              type="time"
                              className="h-10 w-32"
                              defaultValue={existingMeal?.meal_time}
                              {...(mealIndex !== -1 && register(`meals.${mealIndex}.meal_time`))}
                            />
                          </div>
                        )}

                        {/* Week 1-3: Distracted? / Snack reason */}
                        {weekPhase === 'basic' && (
                          <>
                            {!isSnack ? (
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`distracted-${mealType}`}
                                  defaultChecked={existingMeal?.distracted}
                                  {...(mealIndex !== -1 && register(`meals.${mealIndex}.distracted`))}
                                />
                                <Label htmlFor={`distracted-${mealType}`} className="text-sm cursor-pointer">
                                  Were you distracted during this meal?
                                </Label>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <Label className="text-xs">Why did you have a snack?</Label>
                                <Input
                                  type="text"
                                  placeholder="Hunger, boredom, emotion, stress..."
                                  className="h-10"
                                  defaultValue={existingMeal?.snack_reason}
                                  {...(mealIndex !== -1 && register(`meals.${mealIndex}.snack_reason`))}
                                />
                              </div>
                            )}
                          </>
                        )}

                        {/* Week 4-6: Ate slowly? + Hunger minutes */}
                        {weekPhase === 'hunger' && !isSnack && (
                          <>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`slowly-${mealType}`}
                                defaultChecked={existingMeal?.ate_slowly}
                                {...(mealIndex !== -1 && register(`meals.${mealIndex}.ate_slowly`))}
                              />
                              <Label htmlFor={`slowly-${mealType}`} className="text-sm cursor-pointer">
                                Did you eat more slowly? (fork down between bites)
                              </Label>
                            </div>
                            
                            <div className="space-y-2">
                              <Label className="text-xs">How long were you hungry before this meal?</Label>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  inputMode="numeric"
                                  min="0"
                                  max="180"
                                  className="h-10 w-24"
                                  defaultValue={existingMeal?.hunger_minutes || 0}
                                  {...(mealIndex !== -1 && register(`meals.${mealIndex}.hunger_minutes`, { valueAsNumber: true }))}
                                />
                                <span className="text-sm text-muted-foreground">minutes</span>
                              </div>
                            </div>
                          </>
                        )}

                        {/* Week 7-9: All previous + Fullness scale */}
                        {weekPhase === 'satisfaction' && !isSnack && (
                          <>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`slowly-${mealType}`}
                                defaultChecked={existingMeal?.ate_slowly}
                                {...(mealIndex !== -1 && register(`meals.${mealIndex}.ate_slowly`))}
                              />
                              <Label htmlFor={`slowly-${mealType}`} className="text-sm cursor-pointer">
                                Did you eat more slowly? (fork down between bites)
                              </Label>
                            </div>
                            
                            <div className="space-y-2">
                              <Label className="text-xs">How long were you hungry before this meal?</Label>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  inputMode="numeric"
                                  min="0"
                                  max="180"
                                  className="h-10 w-24"
                                  defaultValue={existingMeal?.hunger_minutes || 0}
                                  {...(mealIndex !== -1 && register(`meals.${mealIndex}.hunger_minutes`, { valueAsNumber: true }))}
                                />
                                <span className="text-sm text-muted-foreground">minutes</span>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <Label className="text-xs flex items-center justify-between">
                                <span>Fullness after eating</span>
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
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Still hungry</span>
                                <span>Just right</span>
                                <span>Too full</span>
                              </div>
                            </div>
                          </>
                        )}

                        {/* Hidden fields */}
                        {mealIndex !== -1 && (
                          <>
                            <input type="hidden" {...register(`meals.${mealIndex}.meal_type`)} value={mealType} />
                            <input type="hidden" {...register(`meals.${mealIndex}.ate_meal`)} value="true" />
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </CardContent>
          )}
        </Card>

        {/* Enhanced Treat Tracker */}
        <Card>
          <CardHeader className="cursor-pointer" onClick={() => toggleSection('treats')}>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Treat Tracker</CardTitle>
              {expandedSections.treats ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </CardHeader>
          {expandedSections.treats && (
            <CardContent className="space-y-4">
              {/* Did you have a treat? */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="had-treat"
                  checked={hadTreat}
                  onCheckedChange={(checked) => {
                    setHadTreat(!!checked)
                    if (!checked) {
                      // Clear all treats
                      treatFields.forEach((_, index) => removeTreat(0))
                    } else if (treatFields.length === 0) {
                      // Add one treat entry
                      appendTreat({ treat_type: '', quantity: 1, description: '' })
                    }
                  }}
                />
                <Label htmlFor="had-treat" className="cursor-pointer">
                  Did you have any treats today?
                </Label>
              </div>

              {hadTreat && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Record what you had and how much:
                  </p>

                  {treatFields.map((field, index) => (
                    <div key={field.id} className="space-y-3 p-4 border rounded-lg">
                      <div className="flex gap-2">
                        <Select
                          value={watch(`treats.${index}.treat_type`)}
                          onValueChange={(value) => setValue(`treats.${index}.treat_type`, value)}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {TREAT_CATEGORIES.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {treatFields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeTreat(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <Input
                        type="text"
                        placeholder="Describe what you had and how much (e.g., '2 beers' or '1 cookie instead of 3')"
                        className="h-10"
                        {...register(`treats.${index}.description`)}
                      />
                    </div>
                  ))}
                  
                  {/* Existing treats display */}
                  {existingTreats.map((treat, index) => (
                    <div key={`existing-${index}`} className="p-3 bg-gray-50 rounded-lg text-sm">
                      <p className="font-medium">{treat.treat_type}</p>
                      {treat.description && (
                        <p className="text-muted-foreground">{treat.description}</p>
                      )}
                    </div>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => appendTreat({ treat_type: '', quantity: 1, description: '' })}
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Another Treat
                  </Button>
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* Daily Reflection */}
        <Card>
          <CardHeader className="cursor-pointer" onClick={() => toggleSection('reflection')}>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Daily Reflection</CardTitle>
              {expandedSections.reflection ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </CardHeader>
          {expandedSections.reflection && (
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="daily_win" className="text-sm flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-brand-yellow" />
                  Today&apos;s Win
                </Label>
                <Input
                  id="daily_win"
                  type="text"
                  placeholder="What went well today?"
                  className="h-12"
                  {...register('daily_win')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm">Notes (optional)</Label>
                <textarea
                  id="notes"
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="How you felt today, challenges, observations..."
                  {...register('notes')}
                />
              </div>
            </CardContent>
          )}
        </Card>

        {/* Save button */}
        <div className="flex justify-end">
          <Button 
            type="submit" 
            variant="brand" 
            size="lg" 
            disabled={isSaving}
            className="w-full md:w-auto"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Daily Tracking
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Fullness reference modal for mobile */}
      {showFullnessReference && weekPhase === 'satisfaction' && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end md:hidden">
          <div className="bg-white rounded-t-2xl w-full max-h-[80vh] overflow-y-auto animate-slide-up">
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h3 className="font-semibold">Fullness Scale</h3>
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

      {/* Fullness reference for desktop */}
      {weekPhase === 'satisfaction' && (
        <div className="hidden md:block fixed right-4 top-20 w-80">
          <FullnessScaleReference />
        </div>
      )}
    </div>
  )
}