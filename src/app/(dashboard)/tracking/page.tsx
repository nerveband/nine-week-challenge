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
import { WeekCalendar } from '@/components/tracking/week-calendar'
import { TrackingActions } from '@/components/tracking/tracking-actions'
import { dailyTrackingSchema, mealSchema, treatSchema, type DailyTrackingInput, type MealInput, type TreatInput } from '@/lib/validations'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Loader2, Moon, Droplets, Footprints, Trophy, Clock, Utensils, Cookie, Plus, X, Save, ChevronDown, ChevronUp, CheckCircle2, Info, AlertCircle, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Database } from '@/types/database'
import { getCurrentWeek, getWeekPhase, getWeekForDate, formatDateShort, formatDate, isToday, cn } from '@/lib/utils'
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
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [programStartDate, setProgramStartDate] = useState('')
  const [allTrackingData, setAllTrackingData] = useState<any[]>([])
  const [showCalendar, setShowCalendar] = useState(false)
  const [isFasting, setIsFasting] = useState(false)
  const [trackingCache, setTrackingCache] = useState<Record<string, any>>({})
  const [extraMealCounter, setExtraMealCounter] = useState(1)

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
      is_fasting: false,
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

  useEffect(() => {
    if (programStartDate) {
      loadTrackingForDate(selectedDate)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, programStartDate])

  const loadUserDataAndTracking = async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Parallel queries for better performance
      const [profileResult, allTrackingResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('program_start_date')
          .eq('id', user.id)
          .single(),
        supabase
          .from('daily_tracking')
          .select('date')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(100) // Limit to last 100 entries for performance
      ])

      if (profileResult.data) {
        setProgramStartDate(profileResult.data.program_start_date)
        const week = getCurrentWeek(profileResult.data.program_start_date)
        setCurrentWeek(week)
        const phase = getWeekPhase(week)
        setWeekPhase(phase.phase)
      }

      if (allTrackingResult.data) {
        setAllTrackingData(allTrackingResult.data)
      }

    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadTrackingForDate = async (date: Date) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const dateStr = date.toISOString().split('T')[0]
      
      // Check cache first
      if (trackingCache[dateStr]) {
        const tracking = trackingCache[dateStr]
        setTrackingId(tracking.id)
        setExistingMeals(tracking.meals || [])
        setExistingTreats(tracking.treats || [])
        setIsFasting(tracking.is_fasting || false)
        
        // Load form data from cache
        const mealsData = (tracking.meals || []).map((meal: any) => ({
          meal_type: meal.meal_type,
          meal_name: meal.meal_name || (meal.meal_type === 'snack' ? 'Snack' : 
                     meal.meal_type === 'meal1' ? 'Breakfast' :
                     meal.meal_type === 'meal2' ? 'Lunch' :
                     meal.meal_type === 'meal3' ? 'Dinner' : 'Meal'),
          ate_meal: meal.ate_meal !== false,
          meal_time: meal.meal_time || '',
          distracted: meal.distracted || false,
          ate_slowly: meal.ate_slowly || false,
          hunger_minutes: meal.hunger_minutes || 0,
          hunger_before: meal.hunger_before || 5,
          fullness_after: meal.fullness_after || 7,
          duration_minutes: meal.duration_minutes || 20,
          snack_reason: meal.snack_reason || '',
          emotion: meal.emotion || ''
        }))
        
        const treatsData = (tracking.treats || []).map((treat: any) => ({
          treat_type: treat.treat_type,
          quantity: treat.quantity || 1,
          description: treat.description || ''
        }))
        
        setHadTreat(treatsData.length > 0)
        
        reset({
          hours_sleep: tracking.hours_sleep || 8,
          ounces_water: tracking.ounces_water || 64,
          steps: tracking.steps || 5000,
          daily_win: tracking.daily_win || '',
          notes: tracking.notes || '',
          is_fasting: tracking.is_fasting || false,
          meals: mealsData,
          treats: treatsData
        })
        return
      }

      const { data: tracking } = await supabase
        .from('daily_tracking')
        .select('*, meals(*), treats(*)')
        .eq('user_id', user.id)
        .eq('date', dateStr)
        .single()

      if (tracking) {
        // Cache the data
        setTrackingCache(prev => ({ ...prev, [dateStr]: tracking }))
        
        setTrackingId(tracking.id)
        setExistingMeals(tracking.meals || [])
        setExistingTreats(tracking.treats || [])
        
        // Convert existing meals to form data
        const mealsData = (tracking.meals || []).map((meal: any) => ({
          meal_type: meal.meal_type,
          meal_name: meal.meal_name || (meal.meal_type === 'snack' ? 'Snack' : 
                     meal.meal_type === 'meal1' ? 'Breakfast' :
                     meal.meal_type === 'meal2' ? 'Lunch' :
                     meal.meal_type === 'meal3' ? 'Dinner' : 'Meal'),
          ate_meal: meal.ate_meal !== false,
          meal_time: meal.meal_time || '',
          distracted: meal.distracted || false,
          ate_slowly: meal.ate_slowly || false,
          hunger_minutes: meal.hunger_minutes || 0,
          hunger_before: meal.hunger_before || 5,
          fullness_after: meal.fullness_after || 7,
          duration_minutes: meal.duration_minutes || 20,
          snack_reason: meal.snack_reason || '',
          emotion: meal.emotion || ''
        }))
        
        // Convert existing treats to form data
        const treatsData = (tracking.treats || []).map((treat: any) => ({
          treat_type: treat.treat_type,
          quantity: treat.quantity || 1,
          description: treat.description || ''
        }))
        
        // Update hadTreat state based on existing treats
        setHadTreat(treatsData.length > 0)
        
        // Update fasting state
        setIsFasting(tracking.is_fasting || false)
        
        reset({
          hours_sleep: tracking.hours_sleep || 8,
          ounces_water: tracking.ounces_water || 64,
          steps: tracking.steps || 5000,
          daily_win: tracking.daily_win || '',
          notes: tracking.notes || '',
          is_fasting: tracking.is_fasting || false,
          meals: mealsData,
          treats: treatsData
        })
      } else {
        // Clear form for new date
        setTrackingId(null)
        setExistingMeals([])
        setExistingTreats([])
        setHadTreat(false)
        setIsFasting(false)
        
        reset({
          hours_sleep: 8,
          ounces_water: 64,
          steps: 5000,
          daily_win: '',
          notes: '',
          is_fasting: false,
          meals: [],
          treats: []
        })
      }

      // Update current week based on selected date
      if (programStartDate) {
        const week = getWeekForDate(programStartDate, date)
        setCurrentWeek(week)
        const phase = getWeekPhase(week)
        setWeekPhase(phase.phase)
      }
    } catch (error) {
      console.error('Error loading tracking for date:', error)
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

      const dateStr = selectedDate.toISOString().split('T')[0]
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
            is_fasting: data.is_fasting,
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentTrackingId)

        if (error) throw error
      } else {
        const { data: newTracking, error } = await supabase
          .from('daily_tracking')
          .insert({
            user_id: user.id,
            date: dateStr,
            hours_sleep: data.hours_sleep,
            ounces_water: data.ounces_water,
            steps: data.steps,
            daily_win: data.daily_win,
            notes: data.notes,
            is_fasting: data.is_fasting,
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
                meal_name: meal.meal_name,
                meal_time: meal.meal_time,
                distracted: meal.distracted,
                ate_slowly: meal.ate_slowly,
                hunger_minutes: meal.hunger_minutes,
                hunger_before: meal.hunger_before,
                fullness_after: meal.fullness_after,
                duration_minutes: meal.duration_minutes,
                snack_reason: meal.snack_reason,
                emotion: meal.emotion,
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
      
      // Clear cache for current date since data changed
      const currentDateStr = selectedDate.toISOString().split('T')[0]
      setTrackingCache(prev => {
        const newCache = { ...prev }
        delete newCache[currentDateStr]
        return newCache
      })
      
      // Reload data
      await loadUserDataAndTracking()
      await loadTrackingForDate(selectedDate)
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

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
  }

  const handlePreviousDay = () => {
    const previousDay = new Date(selectedDate)
    previousDay.setDate(selectedDate.getDate() - 1)
    setSelectedDate(previousDay)
  }

  const handleNextDay = () => {
    const nextDay = new Date(selectedDate)
    nextDay.setDate(selectedDate.getDate() + 1)
    setSelectedDate(nextDay)
  }

  const handleTodayClick = () => {
    setSelectedDate(new Date())
  }

  const handleWeekChange = (week: number) => {
    // Navigate to the first day of the selected week
    if (programStartDate) {
      const { getWeekDateRange } = require('@/lib/utils')
      const { start } = getWeekDateRange(programStartDate, week)
      setSelectedDate(start)
    }
  }

  const handleDeleteTracking = async () => {
    await loadUserDataAndTracking()
    await loadTrackingForDate(selectedDate)
  }

  const handleProgramRestart = async () => {
    await loadUserDataAndTracking()
    setSelectedDate(new Date()) // Reset to today
  }

  const addOrUpdateMeal = (mealType: MealType) => {
    const existingIndex = mealFields.findIndex(f => f.meal_type === mealType)
    if (existingIndex === -1) {
      const defaultMealName = mealType === 'meal1' ? (isFasting ? 'Predawn Meal' : 'Breakfast') :
                               mealType === 'meal2' ? (isFasting ? 'Fast Breaking Meal' : 'Lunch') :
                               mealType === 'meal3' ? 'Dinner' :
                               'Snack'
      
      appendMeal({ 
        meal_type: mealType as MealType,
        meal_name: defaultMealName,
        ate_meal: true,
        meal_time: '',
        distracted: false,
        ate_slowly: false,
        hunger_minutes: 0,
        hunger_before: 5,
        fullness_after: 7,
        duration_minutes: 20,
        snack_reason: '',
        emotion: ''
      })
    }
  }

  const addExtraMeal = () => {
    const extraMealType = `extra_meal_${extraMealCounter}`
    setExtraMealCounter(prev => prev + 1)
    
    appendMeal({ 
      meal_type: extraMealType as MealType,
      meal_name: 'Extra Meal',
      ate_meal: true,
      meal_time: '',
      distracted: false,
      ate_slowly: false,
      hunger_before: 5,
      fullness_after: 7,
      duration_minutes: 20,
      snack_reason: '',
      emotion: ''
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
      </div>
    )
  }

  const weekRange = getWeekRangeKey()
  const habitInfo = WEEKLY_HABITS[weekRange as keyof typeof WEEKLY_HABITS]

  return (
    <div className="space-y-4 pb-20 md:pb-0">
      {/* Header with date and calendar toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Daily Tracking</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-muted-foreground">
              {isToday(selectedDate) ? `Today, ${formatDate(selectedDate)}` : formatDate(selectedDate)} • Week {currentWeek}
              {currentWeek > 9 && ' (Extended)'}
            </p>
            {trackingId && (
              <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <CheckCircle2 className="h-3 w-3" />
                <span>Saved</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCalendar(!showCalendar)}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            {showCalendar ? 'Hide' : 'Calendar'}
          </Button>
          <TrackingActions
            trackingId={trackingId}
            selectedDate={selectedDate}
            onDeleted={handleDeleteTracking}
            onProgramRestart={handleProgramRestart}
            showRestartOption={currentWeek > 9}
          />
        </div>
      </div>

      {/* Date Navigation Controls */}
      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousDay}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextDay}
            className="flex items-center gap-1"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="text-center">
          <h2 className="text-lg font-semibold">
            {formatDate(selectedDate)}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isToday(selectedDate) ? 'Today' : `${Math.abs(Math.round((new Date().getTime() - selectedDate.getTime()) / (1000 * 60 * 60 * 24)))} day${Math.abs(Math.round((new Date().getTime() - selectedDate.getTime()) / (1000 * 60 * 60 * 24))) !== 1 ? 's' : ''} ${selectedDate < new Date() ? 'ago' : 'from now'}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isToday(selectedDate) && (
            <Button
              variant="default"
              size="sm"
              onClick={handleTodayClick}
              className="bg-brand-orange hover:bg-brand-orange/90"
            >
              Today
            </Button>
          )}
        </div>
      </div>

      {/* Calendar view */}
      {showCalendar && programStartDate && (
        <WeekCalendar
          programStartDate={programStartDate}
          currentWeek={currentWeek}
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          onWeekChange={handleWeekChange}
          onRestartProgram={handleProgramRestart}
          trackingData={allTrackingData}
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
        {/* Weekly Habit Card */}
        <Card className="border-brand-orange bg-brand-orange/5">
          <CardHeader className="cursor-pointer" onClick={() => toggleSection('habits')}>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-brand-orange" />
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
                      <span className="text-brand-orange mt-0.5">•</span>
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
                <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-10 gap-1 sm:gap-2">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setValue('ounces_water', (i + 1) * 8)}
                      className={`h-8 sm:h-10 rounded-md transition-all ${
                        (watch('ounces_water') || 64) >= (i + 1) * 8
                          ? 'bg-blue-500 hover:bg-blue-600'
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                      aria-label={`${i + 1} glasses`}
                    >
                      <Droplets className="h-3 w-3 sm:h-4 sm:w-4 mx-auto text-white" />
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Tap to set • 1 cup = 8 oz</span>
                  <span>Goal: 8+ cups (64+ oz)</span>
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-3">
                <Label className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Footprints className="h-4 w-4 text-brand-green" />
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

        {/* Fasting Mode Toggle */}
        <Card className={cn("transition-all duration-200", isFasting && "border-yellow-300 bg-yellow-50/50")}>
          <CardHeader>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="fasting-mode"
                  checked={isFasting}
                  onCheckedChange={(checked) => {
                    const fastingValue = !!checked
                    setIsFasting(fastingValue)
                    setValue('is_fasting', fastingValue)
                    
                    // Clear meals when switching to fasting mode
                    if (fastingValue) {
                      // Remove all meals except first two (meal1, meal2)
                      while (mealFields.length > 2) {
                        removeMeal(mealFields.length - 1)
                      }
                      // Remove snack meals
                      const snackIndex = mealFields.findIndex(f => f.meal_type === 'snack')
                      if (snackIndex !== -1) {
                        removeMeal(snackIndex)
                      }
                      // Remove meal3
                      const meal3Index = mealFields.findIndex(f => f.meal_type === 'meal3')
                      if (meal3Index !== -1) {
                        removeMeal(meal3Index)
                      }
                    }
                  }}
                  className="h-5 w-5"
                />
                <div>
                  <Label htmlFor="fasting-mode" className="text-lg font-semibold cursor-pointer">
                    Fasting Today
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {isFasting ? 'Track up to 2 optional meals' : 'Normal eating day'}
                  </p>
                </div>
              </div>
              
              {isFasting && (
                <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    🌙 <strong>Fasting Mode:</strong> You can still track up to 2 meals if you break your fast. All meals are optional.
                  </p>
                </div>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Meals & Snacks */}
        <Card>
          <CardHeader className="cursor-pointer" onClick={() => toggleSection('meals')}>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  {isFasting ? 'Meals (Optional)' : 'Meals & Snacks'}
                </CardTitle>
                <CardDescription className="text-xs">
                  {isFasting ? 'Track meals if you break your fast today' : 'Track each meal and snack'}
                </CardDescription>
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
              {(isFasting ? ['meal1', 'meal2'] as const : ['meal1', 'meal2', 'meal3', 'snack'] as const).map((mealType) => {
                const mealIndex = mealFields.findIndex(f => f.meal_type === mealType)
                const existingMeal = existingMeals.find(m => m.meal_type === mealType)
                const hasMeal = mealIndex !== -1 || existingMeal
                const isSnack = mealType === 'snack'
                
                return (
                  <div key={mealType} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        {hasMeal ? (
                          <Input
                            type="text"
                            placeholder={isSnack ? 'Snack' : 
                              isFasting && mealType === 'meal1' ? 'Predawn Meal (Optional)' :
                              isFasting && mealType === 'meal2' ? 'Fast Breaking Meal' :
                              `Meal ${mealType.slice(-1)}`}
                            className="font-semibold border-none bg-transparent p-0 h-auto focus:bg-gray-50 focus:border focus:p-2 focus:h-8"
                            {...register(`meals.${mealIndex !== -1 ? mealIndex : mealFields.length}.meal_name`)}
                          />
                        ) : (
                          <h3 className="font-semibold">
                            {isSnack ? 'Snack' : 
                              isFasting && mealType === 'meal1' ? 'Predawn Meal (Optional)' :
                              isFasting && mealType === 'meal2' ? 'Fast Breaking Meal' :
                              `Meal ${mealType.slice(-1)}`}
                          </h3>
                        )}
                      </div>
                      {hasMeal && (
                        <CheckCircle2 className="h-4 w-4 text-brand-green ml-2" />
                      )}
                    </div>

                    {/* Did you eat/have this meal/snack? */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`ate-${mealType}`}
                        checked={hasMeal}
                        onCheckedChange={(checked: boolean) => {
                          if (checked) {
                            if (mealIndex === -1) {
                              addOrUpdateMeal(mealType)
                            }
                          } else {
                            // Remove meal from field array if exists
                            const idx = mealFields.findIndex(f => f.meal_type === mealType)
                            if (idx !== -1) {
                              removeMeal(idx)
                            }
                          }
                        }}
                      />
                      <Label htmlFor={`ate-${mealType}`} className="cursor-pointer select-none">
                        {isSnack ? 'Did you have a snack?' : 
                          isFasting ? 'Did you break your fast with this meal?' : 
                          'Did you eat this meal?'}
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
                              {...register(`meals.${mealIndex !== -1 ? mealIndex : mealFields.length}.meal_time`)}
                            />
                          </div>
                        )}

                        {/* Was I distracted while eating? - All weeks, all meals */}
                        {!isSnack && (
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`distracted-${mealType}`}
                              {...register(`meals.${mealIndex !== -1 ? mealIndex : mealFields.length}.distracted`)}
                            />
                            <Label htmlFor={`distracted-${mealType}`} className="text-sm cursor-pointer select-none">
                              Was I distracted while eating?
                            </Label>
                          </div>
                        )}

                        {/* Snack reason - All weeks for snacks */}
                        {isSnack && (
                          <div className="space-y-2">
                            <Label className="text-xs">Why did you have a snack?</Label>
                            <Select
                              value={watch(`meals.${mealIndex !== -1 ? mealIndex : mealFields.length}.snack_reason`) || ''}
                              onValueChange={(value) => setValue(`meals.${mealIndex !== -1 ? mealIndex : mealFields.length}.snack_reason`, value)}
                            >
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Select or enter a reason" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="hunger">Hunger</SelectItem>
                                <SelectItem value="boredom">Boredom</SelectItem>
                                <SelectItem value="stress">Stress</SelectItem>
                                <SelectItem value="anxiety">Anxiety</SelectItem>
                                <SelectItem value="social">Social pressure</SelectItem>
                                <SelectItem value="convenience">Convenience</SelectItem>
                                <SelectItem value="emotion">Emotional</SelectItem>
                                <SelectItem value="craving">Craving</SelectItem>
                                <SelectItem value="habit">Habit</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              type="text"
                              placeholder="Or enter your own reason..."
                              className="h-10"
                              {...register(`meals.${mealIndex !== -1 ? mealIndex : mealFields.length}.snack_reason`)}
                            />
                          </div>
                        )}

                        {/* Emotion tracking for snacks */}
                        {isSnack && (
                          <div className="space-y-2">
                            <Label className="text-xs">Was there any emotion associated with this snack?</Label>
                            <Input
                              type="text"
                              placeholder="Happy, sad, anxious, celebrating..."
                              className="h-10"
                              {...register(`meals.${mealIndex !== -1 ? mealIndex : mealFields.length}.emotion`)}
                            />
                          </div>
                        )}

                        {/* Did you eat more slowly? - All weeks except week 1-3 */}
                        {!isSnack && weekPhase !== 'basic' && (
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`slowly-${mealType}`}
                              {...register(`meals.${mealIndex !== -1 ? mealIndex : mealFields.length}.ate_slowly`)}
                            />
                            <div className="flex items-center gap-2">
                              <Label htmlFor={`slowly-${mealType}`} className="text-sm cursor-pointer select-none">
                                Did you eat more slowly?
                              </Label>
                              <button
                                type="button"
                                className="text-brand-blue hover:text-brand-blue/80"
                                onClick={(e) => {
                                  e.preventDefault()
                                  toast({
                                    title: 'Eating Slowly',
                                    description: 'Put your fork/food down after each bite, don\'t pick it back up until you have swallowed. Take smaller bites and be aware of how fast you\'re chewing.',
                                  })
                                }}
                              >
                                <Info className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Hunger tracking - Week 4+ for non-snacks */}
                        {weekPhase !== 'basic' && !isSnack && (
                          <>
                            <div className="space-y-2">
                              <Label className="text-xs flex items-center gap-2">
                                How long were you hungry before this meal?
                                {weekPhase === 'hunger' && (
                                  <button
                                    type="button"
                                    className="text-brand-blue hover:text-brand-blue/80"
                                    onClick={(e) => {
                                      e.preventDefault()
                                      toast({
                                        title: 'Hunger Awareness',
                                        description: 'Hunger feels like an "empty hollow sensation" in your stomach. It may come and go in waves. Goal: feel hunger for 30-60 minutes before each meal.',
                                      })
                                    }}
                                  >
                                    <Info className="h-4 w-4" />
                                  </button>
                                )}
                              </Label>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  inputMode="numeric"
                                  min="0"
                                  max="180"
                                  className="h-10 w-24"
                                  {...register(`meals.${mealIndex !== -1 ? mealIndex : mealFields.length}.hunger_minutes`, { valueAsNumber: true })}
                                />
                                <span className="text-sm text-muted-foreground">minutes</span>
                              </div>
                            </div>
                          </>
                        )}

                        {/* Fullness scale - Week 7-9 for non-snacks */}
                        {weekPhase === 'satisfaction' && !isSnack && (
                          <>
                            <div className="space-y-3">
                              <Label className="text-xs flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                  Fullness immediately after eating
                                  <button
                                    type="button"
                                    className="text-brand-blue hover:text-brand-blue/80"
                                    onClick={(e) => {
                                      e.preventDefault()
                                      setShowFullnessReference(true)
                                    }}
                                  >
                                    <Info className="h-4 w-4" />
                                  </button>
                                </span>
                                <span className="text-lg font-bold text-brand-green">
                                  {watch(`meals.${mealIndex !== -1 ? mealIndex : mealFields.length}.fullness_after`) || 7}
                                </span>
                              </Label>
                              <Slider
                                min={1}
                                max={10}
                                step={1}
                                value={[watch(`meals.${mealIndex !== -1 ? mealIndex : mealFields.length}.fullness_after`) || 7]}
                                onValueChange={(value) => setValue(`meals.${mealIndex !== -1 ? mealIndex : mealFields.length}.fullness_after`, value[0])}
                                className="w-full"
                              />
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>1-3: Hungry</span>
                                <span>5-7: Satisfied</span>
                                <span>8-10: Too full</span>
                              </div>
                            </div>
                          </>
                        )}

                        {/* How long did fullness last */}
                        {!isSnack && (
                          <div className="space-y-2">
                            <Label className="text-xs">How long did you feel full after this meal?</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                inputMode="numeric"
                                min="0"
                                max="480"
                                className="h-10 w-24"
                                {...register(`meals.${mealIndex !== -1 ? mealIndex : mealFields.length}.duration_minutes`, { valueAsNumber: true })}
                              />
                              <span className="text-sm text-muted-foreground">minutes</span>
                            </div>
                          </div>
                        )}

                        {/* Hidden fields */}
                        <>
                          <input type="hidden" {...register(`meals.${mealIndex !== -1 ? mealIndex : mealFields.length}.meal_type`)} value={mealType} />
                          <input type="hidden" {...register(`meals.${mealIndex !== -1 ? mealIndex : mealFields.length}.ate_meal`)} value="true" />
                        </>
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Extra meals */}
              {mealFields.filter(meal => meal.meal_type.startsWith('extra_meal_')).map((meal, index) => {
                const actualMealIndex = mealFields.findIndex(f => f.meal_type === meal.meal_type)
                
                return (
                  <div key={meal.meal_type} className="border border-dashed border-brand-orange rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <Input
                          type="text"
                          placeholder="Extra Meal"
                          className="font-semibold border-none bg-transparent p-0 h-auto focus:bg-gray-50 focus:border focus:p-2 focus:h-8"
                          {...register(`meals.${actualMealIndex}.meal_name`)}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-brand-green" />
                        <button
                          type="button"
                          onClick={() => removeMeal(actualMealIndex)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* Meal Time */}
                      <div>
                        <Label className="text-sm font-medium">Time</Label>
                        <Input
                          type="time"
                          {...register(`meals.${actualMealIndex}.meal_time`)}
                          className="w-full"
                        />
                      </div>

                      {/* Distracted checkbox */}
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`distracted-${meal.meal_type}`}
                          {...register(`meals.${actualMealIndex}.distracted`)}
                        />
                        <Label htmlFor={`distracted-${meal.meal_type}`} className="text-sm cursor-pointer select-none">
                          Was I distracted while eating?
                        </Label>
                      </div>

                      {/* Hunger level before eating */}
                      {weekPhase !== 'basic' && (
                        <div>
                          <Label className="text-sm font-medium">How hungry were you before eating? (1-10)</Label>
                          <Slider
                            min={1}
                            max={10}
                            step={1}
                            className="mt-2"
                            defaultValue={[5]}
                            onValueChange={(value) => setValue(`meals.${actualMealIndex}.hunger_before`, value[0])}
                          />
                        </div>
                      )}

                      {/* Ate slowly checkbox */}
                      {weekPhase !== 'basic' && (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`slowly-${meal.meal_type}`}
                            {...register(`meals.${actualMealIndex}.ate_slowly`)}
                          />
                          <Label htmlFor={`slowly-${meal.meal_type}`} className="text-sm cursor-pointer select-none">
                            Did you eat more slowly?
                          </Label>
                        </div>
                      )}

                      {/* Duration */}
                      <div>
                        <Label className="text-sm font-medium">How long did you eat for? (minutes)</Label>
                        <Input
                          type="number"
                          min="1"
                          max="120"
                          {...register(`meals.${actualMealIndex}.duration_minutes`, { valueAsNumber: true })}
                          className="w-full"
                        />
                      </div>

                      {/* Fullness after eating */}
                      {weekPhase === 'satisfaction' && (
                        <div>
                          <Label className="text-sm font-medium">How full were you after eating? (1-10)</Label>
                          <Slider
                            min={1}
                            max={10}
                            step={1}
                            className="mt-2"
                            defaultValue={[7]}
                            onValueChange={(value) => setValue(`meals.${actualMealIndex}.fullness_after`, value[0])}
                          />
                        </div>
                      )}

                      {/* Emotion after eating */}
                      <div>
                        <Label className="text-sm font-medium">How did you feel after eating?</Label>
                        <Select onValueChange={(value) => setValue(`meals.${actualMealIndex}.emotion`, value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select emotion" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="satisfied">Satisfied</SelectItem>
                            <SelectItem value="happy">Happy</SelectItem>
                            <SelectItem value="neutral">Neutral</SelectItem>
                            <SelectItem value="guilty">Guilty</SelectItem>
                            <SelectItem value="overfull">Too full</SelectItem>
                            <SelectItem value="disappointed">Disappointed</SelectItem>
                            <SelectItem value="energized">Energized</SelectItem>
                            <SelectItem value="sluggish">Sluggish</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Hidden fields */}
                      <>
                        <input type="hidden" {...register(`meals.${actualMealIndex}.meal_type`)} value={meal.meal_type} />
                        <input type="hidden" {...register(`meals.${actualMealIndex}.ate_meal`)} value="true" />
                      </>
                    </div>
                  </div>
                )
              })}

              {/* Add Extra Meal Button */}
              <button
                type="button"
                onClick={addExtraMeal}
                className="w-full border-2 border-dashed border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white transition-colors rounded-lg p-4 flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Extra Meal
              </button>

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
                      while (treatFields.length > 0) {
                        removeTreat(0)
                      }
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
                  <Trophy className="h-4 w-4 text-brand-orange" />
                  Today&apos;s Win
                  <button
                    type="button"
                    className="text-brand-blue hover:text-brand-blue/80"
                    onClick={(e) => {
                      e.preventDefault()
                      toast({
                        title: 'Daily Win Examples',
                        description: 'Examples: "Drank all my water", "Took a walk instead of snacking", "Ate slowly at dinner", "Recognized hunger vs craving", "Stopped eating when satisfied"',
                      })
                    }}
                  >
                    <Info className="h-4 w-4" />
                  </button>
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