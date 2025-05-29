-- Add new fields to meals table for comprehensive tracking
ALTER TABLE public.meals
ADD COLUMN ate_meal BOOLEAN DEFAULT true,
ADD COLUMN ate_slowly BOOLEAN,
ADD COLUMN hunger_minutes INTEGER,
ADD COLUMN snack_reason TEXT;

-- Add description field to treats table
ALTER TABLE public.treats
ADD COLUMN description TEXT;

-- Update the treat_type to allow longer descriptions
ALTER TABLE public.treats
ALTER COLUMN treat_type TYPE VARCHAR(100);