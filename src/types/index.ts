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
  'Sweets/Candy/Cake',
  'Extra Breads',
  'Alcohol',
  'Fried Foods',
  'Sugary Drinks',
  'Snack Foods',
  'Other'
]

export const WEEKLY_HABITS = {
  '1-3': {
    title: 'HABIT 1: 3-4 meals per day; no snacking in-between',
    instructions: [
      'Track whether you ate each meal (Y/N)',
      'Note if you were distracted during meals',
      'If you had a snack, explain why (hunger, boredom, emotion, stress)'
    ],
    goals: [
      'Eat 3-4 meals per day',
      'No snacking between meals',
      'Focus on eating without distractions'
    ]
  },
  '4-6': {
    title: 'HABIT 2: Put your fork down between bites',
    instructions: [
      'Put your fork/food down after each bite',
      "Don't pick it back up until you've swallowed",
      'Track how long you were hungry before each meal',
      'Note if you ate more slowly (Y/N)'
    ],
    goals: [
      'Continue 3-4 meals per day',
      'Eat more slowly and mindfully',
      'Track hunger duration before meals'
    ],
    newInfo: {
      title: 'What does hunger feel like?',
      content: 'Physical sensations in your stomach, low energy, difficulty concentrating, irritability. True hunger builds gradually and any food will satisfy it.'
    }
  },
  '7-9': {
    title: 'HABIT 3: Stop eating at 80% full',
    instructions: [
      'Continue putting fork down between bites',
      'Track fullness level after each meal (1-10)',
      'Aim to stop eating at 7-8 on the fullness scale'
    ],
    goals: [
      'Continue all previous habits',
      'Stop eating when satisfied (80% full)',
      'Track fullness after each meal'
    ]
  }
}