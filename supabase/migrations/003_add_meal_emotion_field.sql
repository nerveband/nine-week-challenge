-- Add emotion field to meals table for snack tracking
ALTER TABLE public.meals
ADD COLUMN emotion TEXT;