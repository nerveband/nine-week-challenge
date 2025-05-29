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
import { measurementSchema, type MeasurementInput } from '@/lib/validations'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Loader2, Ruler, TrendingDown, Calendar, Camera, AlertCircle, Eye, Scale } from 'lucide-react'
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
          {/* Measurement Instructions */}
          <Card className="border-brand-blue bg-brand-blue/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-brand-blue" />
                Measurement Instructions
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Follow these guidelines for accurate and consistent measurements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:gap-4">
                <div className="bg-white rounded-lg p-3 border">
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Scale className="h-4 w-4 text-brand-blue" />
                    Key Points
                  </h4>
                  <ul className="text-xs sm:text-sm space-y-1 text-muted-foreground">
                    <li>• <strong>Measure 3 times</strong> and take the average for consistency</li>
                    <li>• <strong>Use a cloth measuring tape</strong> (more accurate than metal)</li>
                    <li>• <strong>Measure in nude/minimal clothing</strong> first thing in the morning</li>
                    <li>• <strong>Breathe normally</strong> - don&apos;t suck in for better numbers</li>
                    <li>• <strong>Use a mirror</strong> to ensure tape is straight and level</li>
                    <li>• <strong>Keep tape snug but not tight</strong> - it should lay flat without compressing</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Body Diagram with Measurements */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-5 w-5 text-brand-pink" />
                Body Measurement Guide
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Visual guide showing where to place the measuring tape
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Body Diagram */}
                <div className="flex justify-center">
                  <div className="relative">
                    {/* Human body silhouette - based on provided SVG */}
                    <svg width="200" height="400" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" className="w-full h-full max-w-[200px] mx-auto">
                      <g transform="scale(1, 1)">
                        <path d="m60.238 46.957 2.7812 7.9102c0.46875 1.3242 1.4805 2.4023 2.7812 2.957 3.6992 1.7188 8.1094-1.9922 6.8984-5.9297l-5.6758-20.918c-0.97266-3.5859-4-6.2539-7.707-6.7969l-3.918-0.57422c1.2617-1.3359 2.0469-3.1211 2.0469-5.0977v-4.8125c-0.30469-9.8164-14.578-9.8633-14.895 0v4.8125c0 1.9766 0.78516 3.7617 2.0469 5.0977l-3.918 0.57422c-3.707 0.54297-6.7344 3.207-7.707 6.7969l-5.6758 20.918c-1.5469 6.2383 7.4375 8.9492 9.6836 2.9688 0 0 2.7773-7.9062 2.7773-7.9062l0.10547 3c0.34766 0.79297-2.8867 32.477-2.957 34.145-3.9141-0.11328-7.1836 3.0273-7.1797 6.9102 0 1.5078 1.2305 2.7344 2.7461 2.7344h11.16c1.9609 0 3.6133-1.4531 3.8516-3.3828l2.5078-20.18 2.5078 20.18c0.23828 1.9297 1.8945 3.3828 3.8516 3.3828h11.16c1.5156 0 2.7461-1.2266 2.7461-2.7344 0.007813-3.8867-3.2656-7.0234-7.1797-6.9102-0.26172-4.5938-3.5508-33.227-2.8477-37.148zm-14.562-33.258c0.14844-5.6992 8.4961-5.6992 8.6445 0v4.8125c-0.14844 5.6953-8.4961 5.6992-8.6445 0v-4.8125zm15.988 73.531h1.6289c1.9883 0 3.6289 1.4922 3.8281 3.3945h-10.762c-0.38281 0-0.70703-0.27734-0.75391-0.64062-0.19141-2.3789-4.6992-34.934-4.0469-36.406-0.035156-2.0547-3.0898-2.0547-3.125 0v3.8516l-4.0469 32.555c-0.046875 0.36719-0.37109 0.64062-0.75391 0.64062h-10.762c0.19922-1.9062 1.8398-3.3945 3.8281-3.3945h1.6289c0.80859 0 1.4805-0.61328 1.5547-1.418 0.066407-1.5234 3.5273-35.84 3.0977-35.965 0 0-0.46484-13.137-0.46484-13.148-0.027344-0.84375-0.72266-1.5078-1.5586-1.5078-0.88281 0-1.5977 0.73438-1.5625 1.6172l0.054688 1.5898-5.4219 15.43c-0.17969 0.50781-0.55859 0.90625-1.0625 1.125-1.3984 0.66406-3.1211-0.73828-2.6602-2.2383l5.6758-20.918c0.64844-2.3867 2.668-4.1602 5.1445-4.5234l8.8672-1.3008 8.8672 1.3008c2.4766 0.36328 4.4961 2.1367 5.1445 4.5234l5.6758 20.914c0.45312 1.5-1.2539 2.9023-2.6602 2.2383-0.50391-0.21484-0.88281-0.61328-1.0625-1.1211l-5.4219-15.434 0.054688-1.5859c0.039062-2.0391-3.0117-2.1719-3.1211-0.10938-0.054688 0.82031-0.40625 11.977-0.46484 13.148-0.42578 0.13281 3.0273 34.465 3.0977 35.965 0.074219 0.80469 0.75 1.418 1.5547 1.418z" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="0.5"/>
                      </g>
                    </svg>
                    
                    {/* Measurement lines with labels */}
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                      {/* Chest (bra line) */}
                      <div className="absolute w-full flex items-center justify-center" style={{ top: '35%' }}>
                        <div className="relative flex items-center" style={{ width: '34%' }}>
                          <div className="flex-1 h-0.5 bg-red-400"></div>
                          <div className="absolute -right-2 translate-x-full top-1/2 -translate-y-1/2 text-xs bg-white px-2 py-1 rounded border border-red-400 text-red-600 font-medium whitespace-nowrap shadow-sm pointer-events-auto">
                            Chest (bra line)
                          </div>
                        </div>
                      </div>
                      
                      {/* Chest 2 (fullest part) */}
                      <div className="absolute w-full flex items-center justify-center" style={{ top: '38%' }}>
                        <div className="relative flex items-center" style={{ width: '38%' }}>
                          <div className="absolute -left-2 -translate-x-full top-1/2 -translate-y-1/2 text-xs bg-white px-2 py-1 rounded border border-pink-400 text-pink-600 font-medium whitespace-nowrap shadow-sm pointer-events-auto">
                            Chest 2 (fullest)
                          </div>
                          <div className="flex-1 h-0.5 bg-pink-400"></div>
                        </div>
                      </div>
                      
                      {/* Waist (belly button) */}
                      <div className="absolute w-full flex items-center justify-center" style={{ top: '48%' }}>
                        <div className="relative flex items-center" style={{ width: '20%' }}>
                          <div className="flex-1 h-0.5 bg-blue-400"></div>
                          <div className="absolute -right-2 translate-x-full top-1/2 -translate-y-1/2 text-xs bg-white px-2 py-1 rounded border border-blue-400 text-blue-600 font-medium whitespace-nowrap shadow-sm pointer-events-auto">
                            Waist (belly button)
                          </div>
                        </div>
                      </div>
                      
                      {/* Hip (biggest point) */}
                      <div className="absolute w-full flex items-center justify-center" style={{ top: '58%' }}>
                        <div className="relative flex items-center" style={{ width: '30%' }}>
                          <div className="absolute -left-2 -translate-x-full top-1/2 -translate-y-1/2 text-xs bg-white px-2 py-1 rounded border border-green-400 text-green-600 font-medium whitespace-nowrap shadow-sm pointer-events-auto">
                            Hip (biggest point)
                          </div>
                          <div className="flex-1 h-0.5 bg-green-400"></div>
                        </div>
                      </div>
                      
                      {/* Thigh (right thigh) */}
                      <div className="absolute flex items-center" style={{ top: '75%', left: '54%', width: '18%' }}>
                        <div className="relative w-full flex items-center">
                          <div className="flex-1 h-0.5 bg-purple-400"></div>
                          <div className="absolute -right-2 translate-x-full top-1/2 -translate-y-1/2 text-xs bg-white px-2 py-1 rounded border border-purple-400 text-purple-600 font-medium whitespace-nowrap shadow-sm pointer-events-auto">
                            Right Thigh
                          </div>
                        </div>
                      </div>
                      
                      {/* Bicep (right arm) */}
                      <div className="absolute flex items-center" style={{ top: '32%', left: '63%', width: '24%' }}>
                        <div className="relative w-full flex items-center">
                          <div className="flex-1 h-0.5 bg-orange-400"></div>
                          <div className="absolute -right-2 translate-x-full top-1/2 -translate-y-1/2 text-xs bg-white px-2 py-1 rounded border border-orange-400 text-orange-600 font-medium whitespace-nowrap shadow-sm pointer-events-auto">
                            Right Bicep
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Measurement Form */}
                <div className="space-y-4">
                  {[
                    { key: 'hip', label: 'Hip', description: 'Biggest point around butt', color: 'green' },
                    { key: 'waist', label: 'Waist', description: 'At belly button level', color: 'blue' },
                    { key: 'chest', label: 'Chest', description: 'At bra line level', color: 'red' },
                    { key: 'chest_2', label: 'Chest 2', description: 'Fullest part/nipple line', color: 'pink' },
                    { key: 'thigh', label: 'Right Thigh', description: 'Fullest part of right thigh', color: 'purple' },
                    { key: 'bicep', label: 'Right Bicep', description: 'Biggest part of right bicep', color: 'orange' }
                  ].map(({ key, label, description, color }) => (
                    <div key={key} className={`border-l-4 border-${color}-400 bg-${color}-50 p-4 rounded-r-lg`}>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-sm">{label}</h3>
                          <p className="text-xs text-muted-foreground">{description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">
                            {averages[key as keyof MeasurementAverage] ? `${averages[key as keyof MeasurementAverage]}"` : '—'}
                          </div>
                          <div className="text-xs text-muted-foreground">inches</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3].map(num => (
                          <div key={num}>
                            <Label htmlFor={`${key}${num}`} className="text-xs">
                              #{num}
                            </Label>
                            <div className="relative">
                              <Input
                                id={`${key}${num}`}
                                type="number"
                                inputMode="decimal"
                                step="0.1"
                                min="0"
                                max="100"
                                placeholder="0.0"
                                className="h-10 text-sm pr-8"
                                onChange={(e) => updateReading(key, num, e.target.value)}
                              />
                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                                in
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <input
                        type="hidden"
                        {...register(key as keyof MeasurementInput, { valueAsNumber: true })}
                        value={averages[key as keyof MeasurementAverage] || ''}
                      />
                    </div>
                  ))}
                </div>
              </div>
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