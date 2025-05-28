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
import { supabase } from '@/lib/supabase/client'
import { Loader2, Ruler, TrendingDown, Calendar, Camera } from 'lucide-react'
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
      
      const values = [readings[key1], readings[key2], readings[key3]].filter(v => v !== undefined && v !== null && v > 0)
      
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Body Measurements</h1>
        <p className="text-muted-foreground">
          Week {currentWeek} - {canMeasure ? 'Measurement Week!' : `Next measurement in week ${MEASUREMENT_WEEKS.find(w => w > currentWeek) || 9}`}
        </p>
      </div>

      {!canMeasure && (
        <Card className="border-brand-warning bg-brand-warning/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Not a Measurement Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Measurements are taken on weeks {MEASUREMENT_WEEKS.join(', ')}. Check back in week {MEASUREMENT_WEEKS.find(w => w > currentWeek) || 9}!</p>
          </CardContent>
        </Card>
      )}

      {/* Previous Measurements Summary */}
      {previousMeasurements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Progress</CardTitle>
            <CardDescription>Measurements from previous weeks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {(['hip', 'waist', 'chest', 'chest_2', 'thigh', 'bicep'] as const).map(measurement => {
                const progress = getProgress(measurement)
                const latest = previousMeasurements[previousMeasurements.length - 1]?.[measurement]
                
                return (
                  <div key={measurement} className="space-y-1">
                    <p className="text-sm font-medium capitalize">
                      {measurement === 'chest_2' ? 'Chest 2 (Under Breast)' : measurement}
                    </p>
                    <p className="text-2xl font-bold">{latest || '-'}"</p>
                    {progress && (
                      <p className={`text-sm flex items-center gap-1 ${progress.difference < 0 ? 'text-green-600' : 'text-orange-600'}`}>
                        <TrendingDown className={`h-3 w-3 ${progress.difference > 0 ? 'rotate-180' : ''}`} />
                        {Math.abs(progress.difference)}" ({Math.abs(progress.percentage)}%)
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Take Measurements</CardTitle>
              <CardDescription>
                Take 3 measurements for each body part and we'll calculate the average for you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="hip" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
                  <TabsTrigger value="hip">Hip</TabsTrigger>
                  <TabsTrigger value="waist">Waist</TabsTrigger>
                  <TabsTrigger value="chest">Chest</TabsTrigger>
                  <TabsTrigger value="chest_2">Chest 2</TabsTrigger>
                  <TabsTrigger value="thigh">Thigh</TabsTrigger>
                  <TabsTrigger value="bicep">Bicep</TabsTrigger>
                </TabsList>

                {(['hip', 'waist', 'chest', 'chest_2', 'thigh', 'bicep'] as const).map(measurement => (
                  <TabsContent key={measurement} value={measurement} className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold capitalize mb-2">
                        {measurement === 'chest_2' ? 'Chest 2 (Under Breast)' : measurement} Measurements
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Take 3 measurements and we'll calculate the average
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      {[1, 2, 3].map(num => (
                        <div key={num} className="space-y-2">
                          <Label htmlFor={`${measurement}${num}`}>Reading {num}</Label>
                          <Input
                            id={`${measurement}${num}`}
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            placeholder="0.0"
                            onChange={(e) => updateReading(measurement, num, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="bg-muted p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Average:</span>
                        <span className="text-2xl font-bold">
                          {averages[measurement] ? `${averages[measurement]}"` : '-'}
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

          <Card>
            <CardHeader>
              <CardTitle>Progress Photo</CardTitle>
              <CardDescription>Optional: Take a photo to track visual progress</CardDescription>
            </CardHeader>
            <CardContent>
              <Button type="button" variant="outline" className="w-full">
                <Camera className="mr-2 h-4 w-4" />
                Take Photo (Coming Soon)
              </Button>
            </CardContent>
          </Card>

          <div className="flex justify-end">
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