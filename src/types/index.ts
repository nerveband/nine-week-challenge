import { Database } from './database'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Measurement = Database['public']['Tables']['measurements']['Row']
export type DailyTracking = Database['public']['Tables']['daily_tracking']['Row']
export type Meal = Database['public']['Tables']['meals']['Row']
export type Treat = Database['public']['Tables']['treats']['Row']

export type MealType = 'meal1' | 'meal2' | 'meal3' | 'snack'

export interface User {
  id: string
  email: string
  name: string
  birthdate?: Date
  height_inches?: number
  location?: string
  profile_photo_url?: string
  program_start_date: Date
}

export interface WeekPhase {
  weeks: number[]
  phase: 'basic' | 'hunger' | 'satisfaction'
  description: string
}

export const WEEK_PHASES: WeekPhase[] = [
  {
    weeks: [1, 2, 3],
    phase: 'basic',
    description: 'Basic habit building'
  },
  {
    weeks: [4, 5, 6],
    phase: 'hunger',
    description: 'Hunger awareness focus'
  },
  {
    weeks: [7, 8, 9],
    phase: 'satisfaction',
    description: 'Satisfaction and mindful eating'
  }
]

export const MEASUREMENT_WEEKS = [1, 3, 5, 7, 9]

export const FULLNESS_SCALE = [
  { value: 1, label: 'Starving/feel dizzy' },
  { value: 2, label: 'Very hungry' },
  { value: 3, label: 'Hungry' },
  { value: 4, label: 'Slightly hungry' },
  { value: 5, label: 'Neutral' },
  { value: 6, label: 'Satisfied' },
  { value: 7, label: 'Full' },
  { value: 8, label: 'Very full' },
  { value: 9, label: 'Uncomfortably full' },
  { value: 10, label: 'So full, almost like a sick feeling' }
]

export const TREAT_CATEGORIES = [
  'Chocolate',
  'Ice Cream',
  'Cookies',
  'Cake',
  'Chips',
  'Candy',
  'Pastry',
  'Soda',
  'Other'
]