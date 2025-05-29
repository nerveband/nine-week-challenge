'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { measurementSchema, type MeasurementInput } from '@/lib/validations'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Loader2, Ruler, TrendingDown, Calendar, Camera } from 'lucide-react'
import type { Database } from '@/types/database'
import { getCurrentWeek, isMeasurementWeek, MEASUREMENT_WEEKS } from '@/lib/utils'

interface MeasurementAverage {
  hip?: number
  waist?: number
  chest?: number
  chest_2?: number
  thigh?: number
  bicep?: number
}

interface MeasurementReading {
  hip1?: number
  hip2?: number
  hip3?: number
  waist1?: number
  waist2?: number
  waist3?: number
  chest1?: number
  chest2?: number
  chest3?: number
  chest_21?: number
  chest_22?: number
  chest_23?: number
  thigh1?: number
  thigh2?: number
  thigh3?: number
  bicep1?: number
  bicep2?: number
  bicep3?: number
}

export default function MeasurementsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient<Database>()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [currentWeek, setCurrentWeek] = useState(1)
  const [canMeasure, setCanMeasure] = useState(false)
  const [previousMeasurements, setPreviousMeasurements] = useState<any[]>([])
  const [readings, setReadings] = useState<MeasurementReading>({})
  const [averages, setAverages] = useState<MeasurementAverage>({})

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<MeasurementInput>({
    resolver: zodResolver(measurementSchema),
  })

  useEffect(() => {
    loadUserDataAndMeasurements()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    calculateAverages()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readings])

  const loadUserDataAndMeasurements = async () => {
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
        setCanMeasure(isMeasurementWeek(week))
      }

      // Get all measurements
      const { data: measurements } = await supabase
        .from('measurements')
        .select('*')
        .eq('user_id', user.id)
        .order('week_number', { ascending: true })

      if (measurements) {
        setPreviousMeasurements(measurements)
        
        // If current week has measurements, load them
        const currentWeekMeasurement = measurements.find(m => m.week_number === currentWeek)
        if (currentWeekMeasurement) {
          reset({
            hip: currentWeekMeasurement.hip,
            waist: currentWeekMeasurement.waist,
            chest: currentWeekMeasurement.chest,
            chest_2: currentWeekMeasurement.chest_2,
            thigh: currentWeekMeasurement.thigh,
            bicep: currentWeekMeasurement.bicep,
          })
        }
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateAverages = () => {
    const newAverages: MeasurementAverage = {}
    
    // Calculate average for each measurement type
    const measurementTypes = ['hip', 'waist', 'chest', 'chest_2', 'thigh', 'bicep'] as const
    
    measurementTypes.forEach(type => {
      const key1 = `${type}1` as keyof MeasurementReading
      const key2 = `${type}2` as keyof MeasurementReading
      const key3 = `${type}3` as keyof MeasurementReading
      
      const values = [readings[key1], readings[key2], readings[key3]].filter((v): v is number => v !== undefined && v !== null && v > 0)
      
      if (values.length > 0) {
        const average = values.reduce((sum, val) => sum + val, 0) / values.length
        newAverages[type] = Math.round(average * 10) / 10 // Round to 1 decimal place
      }
    })
    
    setAverages(newAverages)
    
    // Update form values with averages
    Object.entries(newAverages).forEach(([key, value]) => {
      setValue(key as keyof MeasurementInput, value)
    })
  }

  const updateReading = (measurement: string, reading: number, value: string) => {
    const numValue = parseFloat(value)
    if (!isNaN(numValue) && numValue > 0) {
      setReadings(prev => ({
        ...prev,
        [`${measurement}${reading}`]: numValue
      }))
    } else {
      setReadings(prev => {
        const updated = { ...prev }
        delete updated[`${measurement}${reading}` as keyof MeasurementReading]
        return updated
      })
    }
  }

  const onSubmit = async (data: MeasurementInput) => {
    if (!canMeasure) {
      toast({
        title: 'Not a measurement week',
        description: `Measurements are only taken on weeks ${MEASUREMENT_WEEKS.join(', ')}`,
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Check if measurement exists for this week
      const { data: existing } = await supabase
        .from('measurements')
        .select('id')
        .eq('user_id', user.id)
        .eq('week_number', currentWeek)
        .single()

      if (existing) {
        // Update existing measurement
        const { error } = await supabase
          .from('measurements')
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)

        if (error) throw error
      } else {
        // Create new measurement
        const { error } = await supabase
          .from('measurements')
          .insert({
            user_id: user.id,
            week_number: currentWeek,
            ...data,
          })

        if (error) throw error
      }

      toast({
        title: 'Success',
        description: 'Measurements saved!',
      })
      
      // Reload data
      await loadUserDataAndMeasurements()
    } catch (error) {
      console.error('Error saving:', error)
      toast({
        title: 'Error',
        description: 'Failed to save measurements',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const getProgress = (measurement: keyof MeasurementAverage) => {
    if (previousMeasurements.length < 2) return null
    
    const sorted = [...previousMeasurements].sort((a, b) => b.week_number - a.week_number)
    const latest = sorted[0]?.[measurement]
    const previous = sorted[1]?.[measurement]
    
    if (!latest || !previous) return null
    
    const difference = latest - previous
    const percentage = Math.round((difference / previous) * 100)
    
    return { difference, percentage }
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
      <div className="animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Body Measurements</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Week {currentWeek} • {canMeasure ? '📏 Measurement Week!' : `Next measurement in week ${MEASUREMENT_WEEKS.find(w => w > currentWeek) || 9}`}
        </p>
      </div>

      {!canMeasure && (
        <Card className="border-brand-yellow bg-brand-yellow/10 animate-fade-in-delay">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-brand-yellow" />
              Not a Measurement Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm sm:text-base">
              Measurements are taken on weeks {MEASUREMENT_WEEKS.join(', ')}. 
              <br className="sm:hidden" />
              <span className="font-medium">Check back in week {MEASUREMENT_WEEKS.find(w => w > currentWeek) || 9}!</span>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Previous Measurements Summary - Mobile optimized */}
      {previousMeasurements.length > 0 && (
        <Card className="animate-fade-in-delay">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Your Progress</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Measurements from previous weeks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3">
              {(['hip', 'waist', 'chest', 'chest_2', 'thigh', 'bicep'] as const).map(measurement => {
                const progress = getProgress(measurement)
                const latest = previousMeasurements[previousMeasurements.length - 1]?.[measurement]
                
                return (
                  <div key={measurement} className="bg-gray-50 rounded-lg p-3 space-y-1 hover:bg-gray-100 transition-colors">
                    <p className="text-xs sm:text-sm font-medium capitalize">
                      {measurement === 'chest_2' ? 'Chest 2' : measurement}
                    </p>
                    <p className="text-lg sm:text-2xl font-bold">{latest || '-'}&quot;</p>
                    {progress && (
                      <p className={`text-xs flex items-center gap-1 ${progress.difference < 0 ? 'text-green-600' : 'text-orange-600'}`}>
                        <TrendingDown className={`h-3 w-3 ${progress.difference > 0 ? 'rotate-180' : ''}`} />
                        {Math.abs(progress.difference)}&quot;
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {canMeasure && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6 animate-fade-in-delay-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Take Measurements</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Take 3 measurements for each body part and we&apos;ll calculate the average
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="hip" className="space-y-4">
                {/* Mobile scrollable tabs */}
                <div className="-mx-4 px-4 overflow-x-auto">
                  <TabsList className="grid w-max grid-cols-6 gap-1 min-w-full">
                    <TabsTrigger value="hip" className="text-xs">Hip</TabsTrigger>
                    <TabsTrigger value="waist" className="text-xs">Waist</TabsTrigger>
                    <TabsTrigger value="chest" className="text-xs">Chest</TabsTrigger>
                    <TabsTrigger value="chest_2" className="text-xs">Chest 2</TabsTrigger>
                    <TabsTrigger value="thigh" className="text-xs">Thigh</TabsTrigger>
                    <TabsTrigger value="bicep" className="text-xs">Bicep</TabsTrigger>
                  </TabsList>
                </div>

                {(['hip', 'waist', 'chest', 'chest_2', 'thigh', 'bicep'] as const).map(measurement => (
                  <TabsContent key={measurement} value={measurement} className="space-y-4">
                    <div className="bg-brand-pink/5 rounded-lg p-4">
                      <h3 className="text-base sm:text-lg font-semibold capitalize mb-1">
                        {measurement === 'chest_2' ? 'Chest 2 (Under Breast)' : measurement} Measurements
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Take 3 measurements and we&apos;ll calculate the average
                      </p>
                    </div>

                    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
                      {[1, 2, 3].map(num => (
                        <div key={num} className="space-y-2">
                          <Label htmlFor={`${measurement}${num}`} className="text-sm font-medium">
                            Reading {num}
                          </Label>
                          <Input
                            id={`${measurement}${num}`}
                            type="number"
                            inputMode="decimal"
                            step="0.1"
                            min="0"
                            max="100"
                            placeholder="0.0"
                            className="h-12 text-base"
                            onChange={(e) => updateReading(measurement, num, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="bg-gradient-to-r from-brand-mint/10 to-brand-blue/10 p-4 rounded-lg border border-brand-mint/20">
                      <div className="flex items-center justify-between">
                        <span className="font-medium flex items-center gap-2">
                          <Ruler className="h-4 w-4 text-brand-mint" />
                          Average:
                        </span>
                        <span className="text-xl sm:text-2xl font-bold text-brand-mint">
                          {averages[measurement] ? `${averages[measurement]}"` : '—'}
                        </span>
                      </div>
                    </div>

                    <input
                      type="hidden"
                      {...register(measurement, { valueAsNumber: true })}
                      value={averages[measurement] || ''}
                    />
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          <Card className="bg-gray-50 border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Camera className="h-5 w-5 text-brand-blue" />
                Progress Photo
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Optional: Take a photo to track visual progress</CardDescription>
            </CardHeader>
            <CardContent>
              <Button type="button" variant="outline" className="w-full h-12" disabled>
                <Camera className="mr-2 h-4 w-4" />
                Take Photo (Coming Soon)
              </Button>
            </CardContent>
          </Card>

          {/* Mobile floating save button */}
          <div className="md:hidden fixed bottom-20 left-4 right-4 z-20">
            <Button 
              type="submit" 
              variant="brand" 
              className="w-full h-12 shadow-lg"
              disabled={isSaving || !canMeasure}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Measurements'
              )}
            </Button>
          </div>

          {/* Desktop save button */}
          <div className="hidden md:flex justify-end">
            <Button type="submit" variant="brand" size="lg" disabled={isSaving || !canMeasure}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Measurements'
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}