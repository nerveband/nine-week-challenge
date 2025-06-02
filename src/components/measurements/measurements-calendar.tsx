import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Ruler, CheckCircle2, Clock, Calendar } from 'lucide-react'
import { formatWeekRange, getDatesInWeek, isToday } from '@/lib/utils'
import { MEASUREMENT_WEEKS } from '@/types'
import { cn } from '@/lib/utils'

interface MeasurementsCalendarProps {
  programStartDate: string
  currentWeek: number
  selectedWeek: number
  onWeekSelect: (week: number) => void
  measurementData: Array<{ week_number: number; created_at: string }>
  className?: string
}

export function MeasurementsCalendar({
  programStartDate,
  currentWeek,
  selectedWeek,
  onWeekSelect,
  measurementData,
  className
}: MeasurementsCalendarProps) {
  const hasMeasurement = (week: number) => {
    return measurementData.some(m => m.week_number === week)
  }

  const isMeasurementWeek = (week: number) => {
    return MEASUREMENT_WEEKS.includes(week)
  }

  const getWeekStatus = (week: number) => {
    if (week > currentWeek) return 'future'
    if (isMeasurementWeek(week) && hasMeasurement(week)) return 'completed'
    if (isMeasurementWeek(week) && week <= currentWeek) return 'due'
    return 'not-scheduled'
  }

  const isCurrentWeek = (week: number) => {
    return week === currentWeek
  }

  const canNavigateToWeek = (week: number) => {
    return week >= 1 && week <= 9
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Ruler className="h-5 w-5 text-brand-pink" />
          Measurement Schedule
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Body measurements are taken on weeks {MEASUREMENT_WEEKS.join(', ')}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Week grid */}
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 9 }, (_, i) => i + 1).map((week) => {
            const status = getWeekStatus(week)
            const isSelected = week === selectedWeek
            const isCurrent = isCurrentWeek(week)
            const isMeasurement = isMeasurementWeek(week)
            const dateRange = formatWeekRange(programStartDate, week)
            
            return (
              <Button
                key={week}
                variant="ghost"
                onClick={() => canNavigateToWeek(week) && onWeekSelect(week)}
                disabled={!canNavigateToWeek(week)}
                className={cn(
                  "h-auto p-3 flex flex-col items-center justify-center relative border-2 border-transparent",
                  isSelected && "bg-brand-pink text-white hover:bg-brand-pink/90 border-brand-pink",
                  isCurrent && !isSelected && "border-brand-blue bg-brand-blue/10",
                  status === 'completed' && !isSelected && "bg-green-50 border-green-200",
                  status === 'due' && !isSelected && "bg-orange-50 border-orange-200",
                  status === 'future' && "opacity-60",
                  !isMeasurement && "opacity-40"
                )}
              >
                <div className="text-center space-y-1">
                  <div className="font-semibold">Week {week}</div>
                  <div className="text-xs opacity-80">{dateRange}</div>
                  
                  {/* Status indicators */}
                  <div className="flex items-center justify-center gap-1">
                    {isMeasurement && (
                      <>
                        <Ruler className="h-3 w-3" />
                        {status === 'completed' && (
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                        )}
                        {status === 'due' && (
                          <Clock className="h-3 w-3 text-orange-600" />
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Current week indicator */}
                {isCurrent && (
                  <Badge 
                    className="absolute -top-2 -right-2 text-xs px-2 py-1 bg-brand-orange text-white border-none shadow-sm"
                  >
                    Current
                  </Badge>
                )}
              </Button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-4 border-t">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-50 border border-green-200 rounded"></div>
            <CheckCircle2 className="h-3 w-3 text-green-600" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-orange-50 border border-orange-200 rounded"></div>
            <Clock className="h-3 w-3 text-orange-600" />
            <span>Due</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-brand-blue/20 border border-brand-blue rounded"></div>
            <span>Current Week</span>
          </div>
          <div className="flex items-center gap-1">
            <Ruler className="h-3 w-3" />
            <span>Measurement Week</span>
          </div>
        </div>

        {/* Selected week info */}
        {selectedWeek && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2">
              Week {selectedWeek} • {formatWeekRange(programStartDate, selectedWeek)}
            </h4>
            {isMeasurementWeek(selectedWeek) ? (
              <div className="space-y-2">
                {hasMeasurement(selectedWeek) ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm">Measurements completed</span>
                  </div>
                ) : selectedWeek <= currentWeek ? (
                  <div className="flex items-center gap-2 text-orange-600">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Measurements due</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-blue-600">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Measurements scheduled</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No measurements scheduled this week
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}