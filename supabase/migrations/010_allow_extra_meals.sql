-- Allow extra meals by removing CHECK constraint and modifying UNIQUE constraint
-- This migration allows users to add extra meals beyond the standard meal1, meal2, meal3, snack

-- First, drop the existing CHECK constraint on meal_type
ALTER TABLE public.meals DROP CONSTRAINT IF EXISTS meals_meal_type_check;

-- Drop the existing UNIQUE constraint that prevents multiple meals of same type per day
ALTER TABLE public.meals DROP CONSTRAINT IF EXISTS meals_daily_tracking_id_meal_type_key;

-- Add a new UNIQUE constraint that allows multiple extra meals but still prevents duplicate standard meals
-- We'll use a partial unique index for standard meal types only
CREATE UNIQUE INDEX meals_standard_type_unique 
ON public.meals(daily_tracking_id, meal_type) 
WHERE meal_type IN ('meal1', 'meal2', 'meal3', 'snack');

-- Update the meal_type column to allow longer strings for extra meals
ALTER TABLE public.meals ALTER COLUMN meal_type TYPE VARCHAR(50);

-- Add a comment explaining the meal_type field
COMMENT ON COLUMN public.meals.meal_type IS 'Standard types: meal1, meal2, meal3, snack. Extra meals: extra_meal_1, extra_meal_2, etc.';