-- Add settings fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN measurement_unit VARCHAR(10) DEFAULT 'inches' CHECK (measurement_unit IN ('inches', 'cm')),
ADD COLUMN allow_week_skipping BOOLEAN DEFAULT false;