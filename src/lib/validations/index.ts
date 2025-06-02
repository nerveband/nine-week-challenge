import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  name: z.string().min(1, 'Name is required')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
})

export const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  birthdate: z.string().optional(),
  height_feet: z.number().min(3).max(8).optional(),
  height_inches: z.number().min(0).max(11).optional(),
  starting_weight: z.number().min(50).max(500).optional(),
  goal_weight: z.number().min(50).max(500).optional(),
  location: z.string().optional()
})

export const measurementSchema = z.object({
  hip: z.number().min(20).max(80).optional(),
  waist: z.number().min(20).max(60).optional(),
  chest: z.number().min(20).max(70).optional(),
  chest_2: z.number().min(20).max(60).optional(),
  thigh: z.number().min(10).max(40).optional(),
  bicep: z.number().min(5).max(25).optional()
})

export const dailyTrackingSchema = z.object({
  hours_sleep: z.number().min(0).max(24).optional(),
  ounces_water: z.number().min(0).max(300).optional(),
  steps: z.number().min(0).max(100000).optional(),
  daily_win: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
  is_fasting: z.boolean().optional()
})

export const mealSchema = z.object({
  meal_type: z.enum(['meal1', 'meal2', 'meal3', 'snack']),
  meal_name: z.string().max(100).optional(),
  ate_meal: z.boolean().default(true),
  meal_time: z.string().optional(),
  distracted: z.boolean().optional(),
  ate_slowly: z.boolean().optional(),
  hunger_minutes: z.number().min(0).max(180).optional(),
  hunger_before: z.number().min(1).max(10).optional(),
  fullness_after: z.number().min(1).max(10).optional(),
  duration_minutes: z.number().min(1).max(480).optional(),
  snack_reason: z.string().max(200).optional(),
  emotion: z.string().max(200).optional()
})

export const treatSchema = z.object({
  treat_type: z.string().min(1, 'Treat type is required'),
  quantity: z.number().min(1).max(10).default(1),
  description: z.string().max(200).optional()
})

export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type ProfileInput = z.infer<typeof profileSchema>
export type MeasurementInput = z.infer<typeof measurementSchema>
export type DailyTrackingInput = z.infer<typeof dailyTrackingSchema>
export type MealInput = z.infer<typeof mealSchema>
export type TreatInput = z.infer<typeof treatSchema>