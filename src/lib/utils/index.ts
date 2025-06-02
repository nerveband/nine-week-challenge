import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { WEEK_PHASES } from '@/types'

export * from './export'
export * from './measurements'
export * from './image-compression'

export const MEASUREMENT_WEEKS = [1, 3, 5, 7, 9]

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function calculateAge(birthdate: string | Date): number {
  const today = new Date()
  const birth = new Date(birthdate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}

// Helper function to parse dates consistently in local timezone
function parseLocalDate(dateInput: string | Date): Date {
  if (dateInput instanceof Date) return dateInput
  
  // For date strings in YYYY-MM-DD format, parse as local timezone
  // by adding time component to avoid UTC interpretation
  const dateStr = dateInput.toString()
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return new Date(dateStr + 'T00:00:00')
  }
  
  return new Date(dateInput)
}

export function getCurrentWeek(startDate: string | Date): number {
  const start = parseLocalDate(startDate)
  const today = new Date()
  
  // Set both dates to start of day for accurate comparison
  start.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)
  
  // Calculate difference in days (can be negative if today is before start)
  const diffTime = today.getTime() - start.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  // If today is before start date, return 0 or 1
  if (diffDays < 0) return 1
  
  // Week calculation: day 0-6 = week 1, day 7-13 = week 2, etc.
  const week = Math.floor(diffDays / 7) + 1
  return week // Allow tracking beyond week 9
}

export function getWeekForDate(startDate: string | Date, targetDate: string | Date): number {
  const start = parseLocalDate(startDate)
  const target = parseLocalDate(targetDate)
  
  // Set both dates to start of day for accurate comparison
  start.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  
  // Calculate difference in days (can be negative if target is before start)
  const diffTime = target.getTime() - start.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  // If target is before start date, return 1
  if (diffDays < 0) return 1
  
  // Week calculation: day 0-6 = week 1, day 7-13 = week 2, etc.
  const week = Math.floor(diffDays / 7) + 1
  return week
}

export function getWeekDateRange(startDate: string | Date, week: number): { start: Date; end: Date } {
  const programStart = parseLocalDate(startDate)
  const weekStart = new Date(programStart)
  weekStart.setDate(programStart.getDate() + (week - 1) * 7)
  
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  
  return { start: weekStart, end: weekEnd }
}

export function getDatesInWeek(startDate: string | Date, week: number): Date[] {
  const { start } = getWeekDateRange(startDate, week)
  const dates = []
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    dates.push(date)
  }
  
  return dates
}

export function formatWeekRange(startDate: string | Date, week: number): string {
  const { start, end } = getWeekDateRange(startDate, week)
  
  const startMonth = start.toLocaleDateString('en-US', { month: 'short' })
  const endMonth = end.toLocaleDateString('en-US', { month: 'short' })
  
  if (startMonth === endMonth) {
    return `${startMonth} ${start.getDate()}-${end.getDate()}`
  } else {
    return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}`
  }
}

export function formatDateShort(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

export function isToday(date: Date): boolean {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

export function isWithinProgramRange(startDate: string | Date, targetDate: Date): boolean {
  const start = parseLocalDate(startDate)
  const maxEndDate = new Date(start)
  maxEndDate.setDate(start.getDate() + (9 * 7) - 1) // 9 weeks from start
  
  return targetDate >= start && targetDate <= maxEndDate
}

export function getWeekPhase(week: number) {
  return WEEK_PHASES.find(phase => phase.weeks.includes(week)) || WEEK_PHASES[0]
}

export function getDashboardWeekPhase(week: number) {
  if (week <= 3) return { phase: 'Foundation', description: 'Building basic habits' }
  if (week <= 6) return { phase: 'Awareness', description: 'Hunger & fullness focus' }
  return { phase: 'Mastery', description: 'Mindful eating & satisfaction' }
}

export function isMeasurementWeek(week: number): boolean {
  return [1, 3, 5, 7, 9].includes(week)
}

export function getDaysUntilNextMeasurement(currentWeek: number): number | null {
  const measurementWeeks = [1, 3, 5, 7, 9]
  const nextWeek = measurementWeeks.find(w => w > currentWeek)
  
  if (!nextWeek) return null
  
  const daysUntilWeekStart = (nextWeek - currentWeek) * 7
  const currentDayOfWeek = new Date().getDay()
  const daysIntoCurrentWeek = currentDayOfWeek === 0 ? 7 : currentDayOfWeek
  
  return daysUntilWeekStart - daysIntoCurrentWeek + 1
}

export function getStreakDays(trackingData: Array<{ date: string }>): number {
  if (!trackingData || trackingData.length === 0) return 0
  
  const sortedDates = trackingData
    .map(t => parseLocalDate(t.date))
    .sort((a, b) => b.getTime() - a.getTime())
  
  let streak = 0
  let currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)
  
  for (const date of sortedDates) {
    const trackingDate = new Date(date)
    trackingDate.setHours(0, 0, 0, 0)
    
    const diffDays = Math.floor((currentDate.getTime() - trackingDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0 || diffDays === 1) {
      streak++
      currentDate = trackingDate
    } else {
      break
    }
  }
  
  return streak
}

export function getCompletionPercentage(currentWeek: number): number {
  return Math.round((currentWeek / 9) * 100)
}