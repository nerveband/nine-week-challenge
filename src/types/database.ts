export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          birthdate: string | null
          height_inches: number | null
          height_feet: number | null
          starting_weight: number | null
          goal_weight: number | null
          location: string | null
          profile_photo_url: string | null
          program_start_date: string
          profile_complete: boolean
          measurement_unit: 'inches' | 'cm'
          allow_week_skipping: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          birthdate?: string | null
          height_inches?: number | null
          height_feet?: number | null
          starting_weight?: number | null
          goal_weight?: number | null
          location?: string | null
          profile_photo_url?: string | null
          program_start_date: string
          profile_complete?: boolean
          measurement_unit?: 'inches' | 'cm'
          allow_week_skipping?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          birthdate?: string | null
          height_inches?: number | null
          height_feet?: number | null
          starting_weight?: number | null
          goal_weight?: number | null
          location?: string | null
          profile_photo_url?: string | null
          program_start_date?: string
          profile_complete?: boolean
          measurement_unit?: 'inches' | 'cm'
          allow_week_skipping?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      measurements: {
        Row: {
          id: string
          user_id: string
          week_number: number
          hip: number | null
          waist: number | null
          chest: number | null
          chest_2: number | null
          thigh: number | null
          bicep: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          week_number: number
          hip?: number | null
          waist?: number | null
          chest?: number | null
          chest_2?: number | null
          thigh?: number | null
          bicep?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          week_number?: number
          hip?: number | null
          waist?: number | null
          chest?: number | null
          chest_2?: number | null
          thigh?: number | null
          bicep?: number | null
          created_at?: string
        }
      }
      daily_tracking: {
        Row: {
          id: string
          user_id: string
          date: string
          hours_sleep: number | null
          ounces_water: number | null
          steps: number | null
          daily_win: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          hours_sleep?: number | null
          ounces_water?: number | null
          steps?: number | null
          daily_win?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          hours_sleep?: number | null
          ounces_water?: number | null
          steps?: number | null
          daily_win?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      meals: {
        Row: {
          id: string
          daily_tracking_id: string
          meal_type: 'meal1' | 'meal2' | 'meal3' | 'snack'
          ate_meal: boolean | null
          meal_time: string | null
          distracted: boolean | null
          ate_slowly: boolean | null
          hunger_minutes: number | null
          hunger_before: number | null
          fullness_after: number | null
          duration_minutes: number | null
          snack_reason: string | null
          emotion: string | null
          created_at: string
        }
        Insert: {
          id?: string
          daily_tracking_id: string
          meal_type: 'meal1' | 'meal2' | 'meal3' | 'snack'
          ate_meal?: boolean | null
          meal_time?: string | null
          distracted?: boolean | null
          ate_slowly?: boolean | null
          hunger_minutes?: number | null
          hunger_before?: number | null
          fullness_after?: number | null
          duration_minutes?: number | null
          snack_reason?: string | null
          emotion?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          daily_tracking_id?: string
          meal_type?: 'meal1' | 'meal2' | 'meal3' | 'snack'
          ate_meal?: boolean | null
          meal_time?: string | null
          distracted?: boolean | null
          ate_slowly?: boolean | null
          hunger_minutes?: number | null
          hunger_before?: number | null
          fullness_after?: number | null
          duration_minutes?: number | null
          snack_reason?: string | null
          emotion?: string | null
          created_at?: string
        }
      }
      treats: {
        Row: {
          id: string
          daily_tracking_id: string
          treat_type: string
          quantity: number
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          daily_tracking_id: string
          treat_type: string
          quantity?: number
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          daily_tracking_id?: string
          treat_type?: string
          quantity?: number
          description?: string | null
          created_at?: string
        }
      }
      photos: {
        Row: {
          id: string
          user_id: string
          date: string
          photo_url: string
          photo_type: 'front' | 'side' | 'back' | 'progress' | 'other'
          week_number: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          photo_url: string
          photo_type: 'front' | 'side' | 'back' | 'progress' | 'other'
          week_number: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          photo_url?: string
          photo_type?: 'front' | 'side' | 'back' | 'progress' | 'other'
          week_number?: number
          notes?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}