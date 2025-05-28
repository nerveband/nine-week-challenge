import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { WEEK_PHASES } from '@/types'

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

export function getCurrentWeek(startDate: string | Date): number {
  const start = new Date(startDate)
  const today = new Date()
  const diffTime = Math.abs(today.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  const week = Math.ceil(diffDays / 7)
  return Math.min(week, 9) // Cap at week 9
}

export function getWeekPhase(week: number) {
  return WEEK_PHASES.find(phase => phase.weeks.includes(week)) || WEEK_PHASES[0]
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
    .map(t => new Date(t.date))
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