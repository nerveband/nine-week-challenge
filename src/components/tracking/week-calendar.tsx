import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, RotateCcw } from 'lucide-react'
import { getDatesInWeek, formatWeekRange, formatDateShort, isToday, getWeekForDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface WeekCalendarProps {
  programStartDate: string
  currentWeek: number
  selectedDate: Date
  onDateSelect: (date: Date) => void
  onWeekChange: (week: number) => void
  onRestartProgram: () => void
  trackingData: Array<{ date: string }>
  className?: string
}

export function WeekCalendar({
  programStartDate,
  currentWeek,
  selectedDate,
  onDateSelect,
  onWeekChange,
  onRestartProgram,
  trackingData,
  className
}: WeekCalendarProps) {
  const weekDates = getDatesInWeek(programStartDate, currentWeek)
  const today = new Date()
  
  const hasTracking = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return trackingData.some(t => t.date === dateStr)
  }

  const isPastDate = (date: Date) => {
    return date < today && !isToday(date)
  }

  const isFutureDate = (date: Date) => {
    return date > today
  }

  const canNavigateToWeek = (week: number) => {
    return week >= 1 && week <= Math.max(currentWeek + 1, 9)
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">
              Week {currentWeek}
              {currentWeek > 9 && (
                <Badge variant="outline" className="ml-2">
                  Extended
                </Badge>
              )}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {formatWeekRange(programStartDate, currentWeek)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => canNavigateToWeek(currentWeek - 1) && onWeekChange(currentWeek - 1)}
              disabled={!canNavigateToWeek(currentWeek - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => canNavigateToWeek(currentWeek + 1) && onWeekChange(currentWeek + 1)}
              disabled={!canNavigateToWeek(currentWeek + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Week days */}
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground p-2">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2">
          {weekDates.map((date) => {
            const isSelected = selectedDate.toDateString() === date.toDateString()
            const isTodayDate = isToday(date)
            const hasData = hasTracking(date)
            const isPast = isPastDate(date)
            const isFuture = isFutureDate(date)
            
            return (
              <Button
                key={date.toISOString()}
                variant="ghost"
                size="sm"
                onClick={() => onDateSelect(date)}
                disabled={isFuture}
                className={cn(
                  "h-16 p-2 flex flex-col items-center justify-center relative",
                  isSelected && "bg-brand-pink text-white hover:bg-brand-pink/90",
                  isTodayDate && !isSelected && "bg-brand-blue/10 border border-brand-blue",
                  isPast && !hasData && "text-red-400 bg-red-50",
                  isFuture && "text-muted-foreground/50 cursor-not-allowed"
                )}
              >
                <span className="text-sm font-medium">{date.getDate()}</span>
                <span className="text-xs">{formatDateShort(date).split(' ')[0]}</span>
                
                {/* Tracking indicator */}
                <div className="absolute -top-1 -right-1">
                  {hasData ? (
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                  ) : isPast ? (
                    <Circle className="h-3 w-3 text-red-400" />
                  ) : null}
                </div>
              </Button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-green-500" />
            <span>Tracked</span>
          </div>
          <div className="flex items-center gap-1">
            <Circle className="h-3 w-3 text-red-400" />
            <span>Missed</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-brand-blue/20 border border-brand-blue rounded"></div>
            <span>Today</span>
          </div>
        </div>

        {/* Program management */}
        {currentWeek > 9 && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Program Complete!</p>
                <p className="text-xs text-muted-foreground">Continue tracking or restart</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onRestartProgram}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-3 w-3" />
                Restart
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}