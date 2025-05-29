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
                    {/* Female body silhouette - anatomically correct */}
                    <svg width="200" height="400" viewBox="0 0 200 400" className="text-gray-300">
                      {/* Head */}
                      <ellipse cx="100" cy="35" rx="20" ry="25" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="1.5" />
                      
                      {/* Neck */}
                      <rect x="92" y="58" width="16" height="18" fill="#E5E7EB" />
                      
                      {/* Shoulders and Upper Arms */}
                      <path d="M 92 76 Q 85 76 75 78 L 60 82 L 55 88 L 50 95 L 48 110 L 48 125 L 50 140 L 55 155 L 58 165 L 62 170 L 65 172 M 108 76 Q 115 76 125 78 L 140 82 L 145 88 L 150 95 L 152 110 L 152 125 L 150 140 L 145 155 L 142 165 L 138 170 L 135 172" stroke="#9CA3AF" strokeWidth="1.5" fill="none" />
                      
                      {/* Upper body outline */}
                      <path d="M 75 78 Q 85 76 92 76 L 108 76 Q 115 76 125 78 L 128 85 L 130 95 L 132 105 L 133 115 L 134 125 L 133 135 L 130 145 L 125 152 L 120 158 L 115 162 L 110 165 L 105 167 L 100 168 L 95 167 L 90 165 L 85 162 L 80 158 L 75 152 L 70 145 L 67 135 L 66 125 L 67 115 L 68 105 L 70 95 L 72 85 L 75 78 Z" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="1.5" />
                      
                      {/* Waist */}
                      <path d="M 80 158 Q 85 162 90 165 L 95 167 L 100 168 L 105 167 L 110 165 Q 115 162 120 158 L 118 175 L 115 185 L 110 190 L 100 192 L 90 190 L 85 185 L 82 175 L 80 158 Z" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="1.5" />
                      
                      {/* Hips and Upper Thighs */}
                      <path d="M 82 175 L 80 185 L 75 195 L 70 205 L 68 215 L 67 225 L 68 235 L 70 245 L 73 255 L 75 265 L 78 270 L 82 272 L 85 270 L 88 265 L 90 255 L 92 245 L 93 235 L 94 225 L 95 215 L 96 210 L 98 205 L 100 203 L 102 205 L 104 210 L 105 215 L 106 225 L 107 235 L 108 245 L 110 255 L 112 265 L 115 270 L 118 272 L 122 270 L 125 265 L 127 255 L 130 245 L 132 235 L 133 225 L 132 215 L 130 205 L 125 195 L 120 185 L 118 175" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="1.5" />
                      
                      {/* Left Leg */}
                      <path d="M 78 270 L 77 280 L 76 300 L 75 320 L 74 340 L 73 360 L 72 375 L 72 380 L 80 385 L 88 385 L 96 380 L 96 375 L 95 360 L 94 340 L 93 320 L 92 300 L 91 280 L 90 270" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="1.5" />
                      
                      {/* Right Leg */}
                      <path d="M 110 270 L 109 280 L 108 300 L 107 320 L 106 340 L 105 360 L 104 375 L 104 380 L 112 385 L 120 385 L 128 380 L 128 375 L 127 360 L 126 340 L 125 320 L 124 300 L 123 280 L 122 270" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="1.5" />
                    </svg>
                    
                    {/* Measurement lines with labels */}
                    <div className="absolute top-0 left-0 w-full h-full">
                      {/* Chest (bra line) */}
                      <div className="absolute" style={{ top: '35%', left: '33%', right: '33%' }}>
                        <div className="w-full h-0.5 bg-red-400 relative">
                          <div className="absolute -right-20 top-1/2 -translate-y-1/2 text-xs bg-white px-2 py-1 rounded border text-red-600 font-medium whitespace-nowrap">
                            Chest (bra line)
                          </div>
                        </div>
                      </div>
                      
                      {/* Chest 2 (fullest part) */}
                      <div className="absolute" style={{ top: '38%', left: '31%', right: '31%' }}>
                        <div className="w-full h-0.5 bg-pink-400 relative">
                          <div className="absolute -left-24 top-1/2 -translate-y-1/2 text-xs bg-white px-2 py-1 rounded border text-pink-600 font-medium whitespace-nowrap">
                            Chest 2 (fullest)
                          </div>
                        </div>
                      </div>
                      
                      {/* Waist (belly button) */}
                      <div className="absolute" style={{ top: '45%', left: '40%', right: '40%' }}>
                        <div className="w-full h-0.5 bg-blue-400 relative">
                          <div className="absolute -right-24 top-1/2 -translate-y-1/2 text-xs bg-white px-2 py-1 rounded border text-blue-600 font-medium whitespace-nowrap">
                            Waist (belly button)
                          </div>
                        </div>
                      </div>
                      
                      {/* Hip (biggest point) */}
                      <div className="absolute" style={{ top: '55%', left: '35%', right: '35%' }}>
                        <div className="w-full h-0.5 bg-green-400 relative">
                          <div className="absolute -left-20 top-1/2 -translate-y-1/2 text-xs bg-white px-2 py-1 rounded border text-green-600 font-medium whitespace-nowrap">
                            Hip (biggest point)
                          </div>
                        </div>
                      </div>
                      
                      {/* Thigh (right thigh) */}
                      <div className="absolute" style={{ top: '72%', left: '54%', width: '18%' }}>
                        <div className="w-full h-0.5 bg-purple-400 relative">
                          <div className="absolute -right-16 top-1/2 -translate-y-1/2 text-xs bg-white px-2 py-1 rounded border text-purple-600 font-medium whitespace-nowrap">
                            Right Thigh
                          </div>
                        </div>
                      </div>
                      
                      {/* Bicep (right arm) */}
                      <div className="absolute" style={{ top: '30%', left: '67%', width: '20%' }}>
                        <div className="w-full h-0.5 bg-orange-400 relative">
                          <div className="absolute -right-16 top-1/2 -translate-y-1/2 text-xs bg-white px-2 py-1 rounded border text-orange-600 font-medium whitespace-nowrap">
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