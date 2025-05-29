import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Ruler, 
  Edit3, 
  TrendingUp,
  Clock,
  Target
} from 'lucide-react'
import { formatWeekRange, getDatesInWeek, isToday, formatDateShort } from '@/lib/utils'
import { MEASUREMENT_WEEKS } from '@/types'
import { cn } from '@/lib/utils'

interface ProgramOverviewCalendarProps {
  programStartDate: string
  currentWeek: number
  trackingData: Array<{ date: string }>
  measurementData: Array<{ week_number: number; created_at: string }>
  className?: string
}

export function ProgramOverviewCalendar({
  programStartDate,
  currentWeek,
  trackingData,
  measurementData,
  className
}: ProgramOverviewCalendarProps) {
  const router = useRouter()
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null)

  const hasTracking = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return trackingData.some(t => t.date === dateStr)
  }

  const hasMeasurement = (week: number) => {
    return measurementData.some(m => m.week_number === week)
  }

  const isMeasurementWeek = (week: number) => {
    return MEASUREMENT_WEEKS.includes(week)
  }

  const getWeekTrackingStats = (week: number) => {
    const dates = getDatesInWeek(programStartDate, week)
    const today = new Date()
    
    let completed = 0
    let available = 0
    
    dates.forEach(date => {
      if (date <= today) {
        available++
        if (hasTracking(date)) {
          completed++
        }
      }
    })
    
    return { completed, available, percentage: available > 0 ? Math.round((completed / available) * 100) : 0 }
  }

  const handleQuickEdit = (type: 'tracking' | 'measurements', week?: number) => {
    if (type === 'tracking') {
      router.push('/tracking')
    } else if (type === 'measurements') {
      router.push('/measurements')
    }
  }

  const getWeekStatus = (week: number) => {
    if (week > currentWeek) return 'future'
    if (week === currentWeek) return 'current'
    if (week < currentWeek) return 'past'
    return 'past'
  }

  const totalDaysTracked = trackingData.length
  const totalMeasurements = measurementData.length
  const programProgress = Math.round((currentWeek / 9) * 100)

  return (
    <div className={cn("space-y-6", className)}>
      {/* Program Summary */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-brand-mint" />
            Program Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-blue">{currentWeek}</div>
              <div className="text-xs text-muted-foreground">Current Week</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-mint">{totalDaysTracked}</div>
              <div className="text-xs text-muted-foreground">Days Tracked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-pink">{totalMeasurements}</div>
              <div className="text-xs text-muted-foreground">Measurements</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-yellow">{programProgress}%</div>
              <div className="text-xs text-muted-foreground">Complete</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Week-by-Week Calendar */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-brand-blue" />
              9-Week Calendar
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => handleQuickEdit('tracking')}
                className="text-xs"
              >
                <Edit3 className="h-3 w-3 mr-1" />
                Edit Tracking
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => handleQuickEdit('measurements')}
                className="text-xs"
              >
                <Ruler className="h-3 w-3 mr-1" />
                Measurements
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Week grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 9 }, (_, i) => i + 1).map((week) => {
              const status = getWeekStatus(week)
              const stats = getWeekTrackingStats(week)
              const isSelected = week === selectedWeek
              const isMeasurement = isMeasurementWeek(week)
              const hasMeasurementData = hasMeasurement(week)
              const dateRange = formatWeekRange(programStartDate, week)
              
              return (
                <div
                  key={week}
                  className={cn(
                    "border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md",
                    status === 'current' && "border-brand-blue bg-brand-blue/5",
                    status === 'past' && "border-gray-200 bg-gray-50",
                    status === 'future' && "border-gray-100 opacity-60",
                    isSelected && "ring-2 ring-brand-pink"
                  )}
                  onClick={() => setSelectedWeek(isSelected ? null : week)}
                >
                  <div className="space-y-3">
                    {/* Week header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold flex items-center gap-2">
                          Week {week}
                          {status === 'current' && (
                            <Badge variant="outline" className="text-xs">Current</Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">{dateRange}</div>
                      </div>
                      
                      {/* Status indicators */}
                      <div className="flex flex-col items-end gap-1">
                        {isMeasurement && (
                          <div className="flex items-center gap-1">
                            <Ruler className="h-3 w-3 text-brand-pink" />
                            {hasMeasurementData ? (
                              <CheckCircle2 className="h-3 w-3 text-green-600" />
                            ) : week <= currentWeek ? (
                              <Clock className="h-3 w-3 text-orange-600" />
                            ) : (
                              <Target className="h-3 w-3 text-gray-400" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tracking progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Daily Tracking</span>
                        <span className="font-medium">
                          {stats.completed}/{stats.available} days
                        </span>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={cn(
                            "h-2 rounded-full transition-all",
                            stats.percentage === 100 ? "bg-green-500" : 
                            stats.percentage >= 70 ? "bg-brand-mint" :
                            stats.percentage >= 40 ? "bg-brand-yellow" : "bg-orange-500"
                          )}
                          style={{ width: `${stats.percentage}%` }}
                        />
                      </div>
                      
                      {/* Individual days */}
                      <div className="flex gap-1">
                        {getDatesInWeek(programStartDate, week).map((date, dayIndex) => {
                          const dayHasTracking = hasTracking(date)
                          const isPastDate = date < new Date() && !isToday(date)
                          const isTodayDate = isToday(date)
                          const isFutureDate = date > new Date()
                          
                          return (
                            <div
                              key={dayIndex}
                              className={cn(
                                "w-4 h-4 rounded-full flex items-center justify-center text-xs",
                                dayHasTracking && "bg-green-500 text-white",
                                !dayHasTracking && isPastDate && "bg-red-200 text-red-600",
                                isTodayDate && !dayHasTracking && "bg-brand-blue text-white",
                                isFutureDate && "bg-gray-100 text-gray-400"
                              )}
                              title={`${formatDateShort(date)} - ${dayHasTracking ? 'Tracked' : 'Not tracked'}`}
                            >
                              {isTodayDate ? '•' : dayHasTracking ? '✓' : '○'}
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Measurement status */}
                    {isMeasurement && (
                      <div className="pt-2 border-t border-gray-100">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Measurements</span>
                          <span className={cn(
                            "font-medium",
                            hasMeasurementData ? "text-green-600" : 
                            week <= currentWeek ? "text-orange-600" : "text-gray-400"
                          )}>
                            {hasMeasurementData ? 'Complete' : 
                             week <= currentWeek ? 'Due' : 'Scheduled'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-4 border-t">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Tracked</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-200 rounded-full"></div>
              <span>Missed</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-brand-blue rounded-full"></div>
              <span>Today</span>
            </div>
            <div className="flex items-center gap-1">
              <Ruler className="h-3 w-3 text-brand-pink" />
              <span>Measurement Week</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-green-600" />
              <span>Measurements Complete</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-orange-600" />
              <span>Measurements Due</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}